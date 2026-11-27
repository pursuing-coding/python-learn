// Accept platform line endings and a single final newline from print().
export function normalizeOutput(value) {
  const text = String(value ?? "").replace(/\r\n?/g, "\n");
  return /[^\n]/.test(text) ? text.replace(/\n$/, "") : text;
}

export function checkOutput(actual, expected) {
  const actualText = normalizeOutput(actual);
  const expectedText = normalizeOutput(expected);
  if (actualText === expectedText) return { passed: true, detail: "" };

  const actualLines = actualText ? actualText.split("\n") : [];
  const expectedLines = expectedText ? expectedText.split("\n") : [];
  let index = 0;
  while (actualLines[index] === expectedLines[index]) index++;
  const show = line => line === undefined ? "（缺少这一行）" : JSON.stringify(
    line.length > 120 ? line.slice(0, 120) + "…" : line
  );
  const firstDifference = `第 ${index + 1} 行不同。预期 ${show(expectedLines[index])}，实际 ${show(actualLines[index])}。`;
  let hint = "";
  if (!actualText) hint = "检查是否遗漏 print()，或在输出前结束了程序。";
  else if (actualText.replace(/\s/g, "") === expectedText.replace(/\s/g, "")) {
    hint = "检查行首空格、空行，以及 print() 的 sep 或 end 参数。";
  } else if (actualText.toLowerCase() === expectedText.toLowerCase()) {
    hint = "检查英文字母的大小写。";
  }
  return { passed: false, detail: firstDifference + hint };
}

export function tracebackLine(output, lineCount) {
  const frames = String(output).matchAll(/^\s*File "(?:[^"\n]*[\\/])?(?:main|script)\.py", line (\d+)\b/gm);
  return Array.from(frames, frame => Number(frame[1])).findLast(line => line > 0 && line <= lineCount);
}
