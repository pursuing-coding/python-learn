import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { request } from "node:http";
import { test } from "node:test";

async function startServer(t, host = "127.0.0.1") {
  const child = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, HOST: host, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const closed = once(child, "close");
  t.after(async () => { child.kill(); await closed; });
  let output = "";
  for await (const chunk of child.stdout) {
    output += chunk;
    const match = output.match(/is running at http:\/\/.+:(\d+)\n/);
    if (match) return Number(match[1]);
  }
  assert.fail(`Server exited before listening: ${output}`);
}

function runEndpoint(port, headers) {
  // An empty JSON object can never execute Python. Local requests should reach
  // payload validation; invalid authorities must be rejected before that point.
  return new Promise((resolve, reject) => {
    const rawHeaders = ["Content-Type", "application/json", "Content-Length", "2"];
    for (const [name, values] of Object.entries(headers)) {
      for (const value of [values].flat()) rawHeaders.push(name, value);
    }
    const req = request({ hostname: "127.0.0.1", port, path: "/api/run", method: "POST",
      setHost: false, headers: rawHeaders }, res => {
      res.resume();
      res.on("end", () => resolve(res.statusCode));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.end("{}");
  });
}

test("the local runner rejects nonlocal or malformed Host values independently of Origin", { timeout: 5000 }, async t => {
  const port = await startServer(t);
  const local = `127.0.0.1:${port}`;
  for (const host of [`example.invalid:${port}`, `localhost.example.invalid:${port}`, `127.0.0.1:${port + 1}`, `localhost:${port}, ${local}`]) {
    assert.equal(await runEndpoint(port, { Host: host }), 403, host);
  }
  assert.ok([400, 403].includes(await runEndpoint(port, {})), "missing Host must be rejected");
  assert.equal(await runEndpoint(port, { Host: [local, local] }), 403, "duplicate Host must be rejected");
  assert.equal(await runEndpoint(port, { Host: local, Origin: "http://example.invalid" }), 403);
  for (const host of [local, `localhost:${port}`, `[::1]:${port}`]) {
    assert.equal(await runEndpoint(port, { Host: host, Origin: `http://${host}` }), 400, host);
  }
  assert.equal(await runEndpoint(port, { Host: local }), 400, "local CLI clients need no Origin");
});
