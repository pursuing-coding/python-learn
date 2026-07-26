import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const courseDataPath = path.join(publicDir, "course-data.js");
const indexPath = path.join(publicDir, "index.html");
const requiredFields = [
  "id",
  "title",
  "difficulty",
  "estimatedMinutes",
  "goals",
  "hint",
  "expectedOutput",
  "tutorial",
  "starterCode",
  "answerCode"
];

if (!fs.existsSync(indexPath)) {
  throw new Error("public/index.html is missing.");
}

if (!fs.existsSync(courseDataPath)) {
  throw new Error("public/course-data.js is missing.");
}

const indexHtml = fs.readFileSync(indexPath, "utf8");
for (const asset of ["./styles.css", "./course-data.js", "./app.js"]) {
  if (!indexHtml.includes(asset)) {
    throw new Error(`public/index.html does not reference ${asset}.`);
  }
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(courseDataPath, "utf8"), context, { filename: "course-data.js" });

const lessons = context.window.PY_LESSONS;
if (!Array.isArray(lessons)) {
  throw new Error("PY_LESSONS must be an array.");
}
if (lessons.length !== 33) {
  throw new Error(`Expected 33 lessons, found ${lessons.length}.`);
}

function findPython() {
  for (const command of [process.env.PYTHON, "python3", "python", "py"].filter(Boolean)) {
    const probe = spawnSync(command, ["--version"], { encoding: "utf8", timeout: 5_000 });
    if (probe.status === 0) return command;
  }
  return null;
}

const pythonCommand = findPython();
if (!pythonCommand) {
  console.log("No local Python interpreter found; skipping answer-output verification.");
}

const normalizeOutput = (value) => String(value || "").replace(/\r\n/g, "\n").trim();

function verifyAnswer(lesson, testCase) {
  const run = spawnSync(pythonCommand, ["-I", "-X", "utf8", "-c", lesson.answerCode], {
    input: testCase.stdin || "",
    encoding: "utf8",
    timeout: 10_000
  });

  if (run.status !== 0) {
    throw new Error(
      `Lesson ${lesson.id} answer failed on test case "${testCase.id}": ${String(run.stderr || "").trim()}`
    );
  }
  if (normalizeOutput(run.stdout) !== normalizeOutput(testCase.expectedOutput)) {
    throw new Error(
      `Lesson ${lesson.id} answer output mismatch on test case "${testCase.id}".\n` +
        `  expected: ${JSON.stringify(normalizeOutput(testCase.expectedOutput))}\n` +
        `  actual:   ${JSON.stringify(normalizeOutput(run.stdout))}`
    );
  }
}

const seenIds = new Set();
let totalTestCases = 0;

lessons.forEach((lesson, index) => {
  const missing = requiredFields.filter((field) => !(field in lesson));
  if (missing.length > 0) {
    throw new Error(`Lesson ${index + 1} missing fields: ${missing.join(", ")}.`);
  }

  if (seenIds.has(lesson.id)) {
    throw new Error(`Duplicate lesson id: ${lesson.id}.`);
  }
  seenIds.add(lesson.id);

  if (lesson.id !== index + 1) {
    throw new Error(`Lesson ${index + 1} has non-sequential id ${lesson.id}.`);
  }
  if (!["基础", "进阶", "挑战"].includes(lesson.difficulty)) {
    throw new Error(`Lesson ${lesson.id} has invalid difficulty: ${lesson.difficulty}.`);
  }
  if (!Array.isArray(lesson.goals) || lesson.goals.length < 3) {
    throw new Error(`Lesson ${lesson.id} needs at least three goals.`);
  }
  if (String(lesson.tutorial || "").length < 150) {
    throw new Error(`Lesson ${lesson.id} tutorial is too short.`);
  }
  if (String(lesson.starterCode || "").trim().length === 0) {
    throw new Error(`Lesson ${lesson.id} starterCode must not be empty.`);
  }
  if (!String(lesson.answerCode || "").includes("print")) {
    throw new Error(`Lesson ${lesson.id} answerCode must produce output via print().`);
  }

  const testCases = Array.isArray(lesson.testCases) && lesson.testCases.length > 0
    ? lesson.testCases
    : [{ id: "default", title: "默认样例", stdin: lesson.defaultStdin || "", expectedOutput: lesson.expectedOutput }];

  testCases.forEach((testCase, testIndex) => {
    for (const field of ["id", "title", "stdin", "expectedOutput"]) {
      if (!(field in testCase)) {
        throw new Error(`Lesson ${lesson.id} test case ${testIndex + 1} missing ${field}.`);
      }
    }
    if (!String(testCase.id).trim() || !String(testCase.title).trim()) {
      throw new Error(`Lesson ${lesson.id} test case ${testIndex + 1} has empty id/title.`);
    }
    if (!String(testCase.expectedOutput).trim() && !String(lesson.expectedOutput).trim()) {
      throw new Error(`Lesson ${lesson.id} test case ${testIndex + 1} has empty expected output.`);
    }
  });

  if (pythonCommand) {
    testCases.forEach((testCase) => verifyAnswer(lesson, testCase));
  }

  totalTestCases += testCases.length;
  console.log(
    `Lesson ${String(lesson.id).padStart(2, "0")}: ${lesson.title} (${testCases.length} test cases${pythonCommand ? ", answers verified" : ""})`
  );
});

console.log(`Total lessons: ${lessons.length}`);
console.log(`Total test cases: ${totalTestCases}`);
