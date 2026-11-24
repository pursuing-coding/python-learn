import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT || 4173);
// /api/run executes Python with this process's privileges. Never bind to a LAN address.
const localHostnames = ["localhost", "127.0.0.1", "[::1]"];
const configuredHost = (process.env.HOST || "127.0.0.1").toLowerCase();
const host = configuredHost === "localhost" ? "127.0.0.1" : configuredHost === "[::1]" ? "::1" : configuredHost;
if (host !== "127.0.0.1" && host !== "::1") {
  throw new Error("HOST must be localhost, 127.0.0.1, or ::1.");
}
const publicDir = fileURLToPath(new URL("./public", import.meta.url));
const maxRequestLength = 64_000;
const maxCodeLength = 20_000;
const maxOutputLength = 12_000;
const runTimeoutMs = 5_000;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".png", "image/png"],
  [".ico", "image/x-icon"]
]);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, text, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  response.end(text);
}

function decodePyString(value) {
  return value
    .replaceAll('\\"', '"')
    .replaceAll("\\'", "'")
    .replaceAll("\\n", "\n")
    .replaceAll("\\t", "\t")
    .replaceAll("\\r", "\r")
    .replaceAll("\\\\", "\\");
}

function isStringLiteral(value) {
  return /^"(?:\\.|[^"\\])*"$/.test(value) || /^'(?:\\.|[^'\\])*'$/.test(value);
}

function buildPreviewVariables(code) {
  const variables = new Map();
  const assignmentPattern = /^\s*([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/gm;
  let match;

  while ((match = assignmentPattern.exec(code)) !== null) {
    const [, name, rawValue] = match;
    const value = rawValue.trim();
    if (value.includes("(") || value.includes("#")) continue;

    if (isStringLiteral(value)) {
      variables.set(name, decodePyString(value.slice(1, -1)));
    } else if (/^(True|False)$/.test(value)) {
      variables.set(name, value);
    } else if (/^-?\d+(?:\.\d+)?$/.test(value)) {
      variables.set(name, value);
    }
  }

  return variables;
}

function splitTopLevelArgs(expression) {
  const parts = [];
  let current = "";
  let depth = 0;
  let quote = "";
  let escaping = false;

  for (const char of expression) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaping = true;
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(" || char === "[" || char === "{") depth += 1;
    if (char === ")" || char === "]" || char === "}") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function evaluatePreviewValue(token, variables) {
  const value = token.trim();
  if (isStringLiteral(value)) return decodePyString(value.slice(1, -1));
  if (variables.has(value)) return variables.get(value);
  if (/^-?\d+(?:\.\d+)?$/.test(value) || /^(True|False|None)$/.test(value)) return value;
  return null;
}

function runTeachingPreview(code) {
  const outputLines = [];
  const variables = buildPreviewVariables(code);
  const printPattern = /^\s*print\s*\(([\s\S]*?)\)\s*$/gm;
  let match;

  while ((match = printPattern.exec(code)) !== null) {
    const args = splitTopLevelArgs(match[1]);
    if (args.length === 0) {
      outputLines.push("");
      continue;
    }

    const rendered = [];
    let ok = true;
    for (const arg of args) {
      if (/^sep\s*=|^end\s*=/.test(arg)) continue;
      const value = evaluatePreviewValue(arg, variables);
      if (value === null) {
        ok = false;
        break;
      }
      rendered.push(value);
    }

    if (ok) outputLines.push(rendered.join(" "));
  }

  if (outputLines.length > 0) {
    return {
      status: "learning-preview",
      stdout: outputLines.join("\n"),
      stderr: "Teaching preview: local Python interpreter unavailable.",
      durationMs: 0
    };
  }

  return {
    status: "preview-limited",
    stdout: "",
    stderr: 'Teaching preview: supports basic print("text") statements.',
    durationMs: 0
  };
}

function readBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    request.setEncoding("utf8");
    function appendChunk(chunk) {
      if (body.length + chunk.length > maxRequestLength) {
        request.off("data", appendChunk);
        request.resume();
        rejectBody(new RangeError("请求内容过长。"));
        return;
      }
      body += chunk;
    }
    request.on("data", appendChunk);
    request.on("end", () => resolveBody(body));
    request.on("error", rejectBody);
  });
}

function runCommand(command, args, options = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    let didTimeOut = false;
    let outputLimitExceeded = false;
    const timer = setTimeout(() => {
      didTimeOut = true;
      child.kill("SIGKILL");
    }, options.timeoutMs || runTimeoutMs);

    function appendOutput(output, chunk) {
      const remaining = maxOutputLength - output.length;
      if (chunk.length <= remaining) return output + chunk;
      outputLimitExceeded = true;
      child.kill("SIGKILL");
      // Keep the boundary before a whole character if the limit bisects a pair.
      return output + chunk.slice(0, remaining).replace(/[\uD800-\uDBFF]$/, "");
    }
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout = appendOutput(stdout, chunk); });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr = appendOutput(stderr, chunk); });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolveRun({ ok: false, missingCommand: error.code === "ENOENT", error, stdout, stderr });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolveRun({
        ok: code === 0 && !didTimeOut && !outputLimitExceeded,
        code,
        didTimeOut,
        outputLimitExceeded,
        stdout,
        stderr
      });
    });

    // A process that exits before consuming stdin raises EPIPE on the stdin
    // stream; without a handler that error event would crash the server.
    child.stdin.on("error", () => {});
    if (options.stdin) child.stdin.write(options.stdin);
    child.stdin.end();
  });
}

function pythonCandidates() {
  const candidates = [process.env.PYTHON, "python3", "python", "py"].filter(Boolean);
  return Array.from(new Set(candidates));
}

let cachedPythonStatus = null;

async function getPythonStatus() {
  if (cachedPythonStatus !== null) {
    return cachedPythonStatus;
  }

  for (const command of pythonCandidates()) {
    const result = await runCommand(command, ["--version"], { timeoutMs: 2_000 });
    const version = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    const match = version.match(/^Python 3\.(\d+)/);
    if (result.ok && match && Number(match[1]) >= 8) {
      cachedPythonStatus = {
        available: true,
        demoMode: false,
        command,
        version,
        message: `本地 Python 解释器可用：${command}`
      };
      return cachedPythonStatus;
    }
  }

  cachedPythonStatus = {
    available: false,
    demoMode: true,
    message: "未找到 Python 3.8 或更高版本，已启用有限教学预览。"
  };
  return cachedPythonStatus;
}

function getLocalOrigin(request) {
  const hosts = request.headersDistinct.host;
  if (hosts?.length !== 1) return null;
  const authority = hosts[0].toLowerCase();
  const { port: boundPort } = request.socket.address();
  for (const hostname of localHostnames) {
    if (authority === `${hostname}:${boundPort}` || (boundPort === 80 && authority === hostname)) {
      return `http://${hostname}${boundPort === 80 ? "" : `:${boundPort}`}`;
    }
  }
  return null;
}

async function handleRun(request, response, localOrigin) {
  const origins = request.headersDistinct.origin;
  if (origins && (origins.length !== 1 || origins[0] !== localOrigin)) {
    sendJson(response, 403, { status: "error", stdout: "", stderr: "本地运行服务仅接受同源请求。", durationMs: 0 });
    return;
  }
  if (request.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
    sendJson(response, 415, { status: "error", stdout: "", stderr: "请求必须使用 application/json。", durationMs: 0 });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(request));
  } catch (error) {
    const tooLarge = error instanceof RangeError;
    sendJson(response, tooLarge ? 413 : 400, {
      status: "error",
      stdout: "",
      stderr: tooLarge ? error.message : "请求格式不是有效的 JSON。",
      durationMs: 0
    });
    return;
  }

  if (typeof payload?.code !== "string" || (payload.stdin !== undefined && typeof payload.stdin !== "string")) {
    sendJson(response, 400, { status: "error", stdout: "", stderr: "源码和标准输入必须是字符串。", durationMs: 0 });
    return;
  }

  const { code, stdin = "" } = payload;

  if (!code.trim()) {
    sendJson(response, 400, { status: "error", stdout: "", stderr: "No code submitted.", durationMs: 0 });
    return;
  }
  if (code.length > maxCodeLength) {
    sendJson(response, 400, {
      status: "error",
      stdout: "",
      stderr: `Code exceeds the ${maxCodeLength} character limit.`,
      durationMs: 0
    });
    return;
  }

  const python = await getPythonStatus();
  if (!python.available) {
    sendJson(response, 200, runTeachingPreview(code));
    return;
  }

  const workDir = join(tmpdir(), `python-learn-${randomUUID()}`);
  const sourceFile = join(workDir, "main.py");
  const startTime = Date.now();

  try {
    await mkdir(workDir, { recursive: true });
    await writeFile(sourceFile, code, "utf8");

    // -I: isolated mode; -X utf8: force UTF-8 I/O so Chinese output is not
    // garbled on Windows systems whose default code page is GBK.
    const result = await runCommand(python.command, ["-I", "-X", "utf8", sourceFile], {
      cwd: workDir,
      stdin,
      timeoutMs: runTimeoutMs
    });

    const limitMessage = result.didTimeOut
      ? `程序运行超过 ${runTimeoutMs / 1000} 秒，已停止。`
      : result.outputLimitExceeded
        ? `程序输出超过 ${maxOutputLength} 个字符，已停止。`
        : "";
    sendJson(response, 200, {
      status: result.didTimeOut ? "timeout" : result.outputLimitExceeded ? "output-limit" : result.ok ? "success" : "runtime-error",
      stdout: result.stdout,
      stderr: [result.stderr, limitMessage].filter(Boolean).join("\n"),
      exitCode: result.code,
      durationMs: Date.now() - startTime
    });
  } catch (error) {
    sendJson(response, 500, {
      status: "server-error",
      stdout: "",
      stderr: `运行服务出错：${error.message}`,
      durationMs: Date.now() - startTime
    });
  } finally {
    try {
      await rm(workDir, { recursive: true, force: true });
    } catch {
      console.warn("Unable to remove a temporary Python work directory.");
    }
  }
}

async function serveStatic(pathname, response) {
  let rawPath;
  try {
    rawPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  } catch {
    sendText(response, 400, "Bad request");
    return;
  }

  const filePath = resolve(publicDir, rawPath.replace(/^\/+/, ""));
  const relativePath = relative(publicDir, filePath);
  const isInsidePublicDir =
    relativePath && !relativePath.startsWith("..") && !isAbsolute(relativePath);

  if (!isInsidePublicDir || !existsSync(filePath)) {
    sendText(response, 404, "Not found");
    return;
  }

  try {
    const content = await readFile(filePath);
    const contentType = mimeTypes.get(extname(filePath)) || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });
    response.end(content);
  } catch {
    sendText(response, 500, "Unable to read file.");
  }
}

const server = createServer(async (request, response) => {
  try {
    const localOrigin = getLocalOrigin(request);
    if (!localOrigin) {
      sendJson(response, 403, { status: "error", stdout: "", stderr: "本地服务仅接受本机 Host。", durationMs: 0 });
      return;
    }
    const { pathname } = new URL(request.url, "http://127.0.0.1");
    if (request.method === "GET" && pathname === "/api/health") {
      sendJson(response, 200, await getPythonStatus());
      return;
    }
    if (request.method === "POST" && pathname === "/api/run") {
      await handleRun(request, response, localOrigin);
      return;
    }
    if (request.method === "GET") {
      await serveStatic(pathname, response);
      return;
    }
    sendText(response, 405, "Method not allowed");
  } catch {
    sendText(response, 500, "Internal server error");
  }
});

server.listen(port, host, () => {
  const hostname = host === "::1" ? "[::1]" : host;
  console.log(`python-learn is running at http://${hostname}:${server.address().port}`);
});
