import assert from "node:assert/strict";
import { test } from "node:test";
import { checkOutput, tracebackLine } from "../public/grading.js";

test("output keeps leading or interior whitespace significant", () => {
  assert.ok(checkOutput("first\r\nsecond\r\n", "first\nsecond").passed);
  assert.match(checkOutput(" first\nsecond\n", "first\nsecond").detail, /第 1 行.*" first"/);
  assert.match(checkOutput("first\n\nsecond", "first\nsecond").detail, /第 2 行/);
  assert.equal(checkOutput("abc\n\n", "abc").passed, false);
  assert.equal(checkOutput("first  \n", "first").passed, false);
});

test("an empty expected result rejects code that prints a blank line", () => {
  assert.ok(checkOutput(null, "").passed);
  assert.ok(checkOutput("", "").passed);
  assert.equal(checkOutput("\n", "").passed, false);
  assert.match(checkOutput("x", "").detail, /第 1 行/);
});

test("traceback uses the innermost frame from the submitted Python file", () => {
  const output = '  File "main.py", line 6, in <module>\n  File "/box/script.py", line 2, in example\n  File "library.py", line 30';
  assert.equal(tracebackLine(output, 10), 2);
  assert.equal(tracebackLine('  File "library.py", line 3', 10), undefined);
  assert.equal(tracebackLine('  File "main.py", line 100', 10), undefined);
});
