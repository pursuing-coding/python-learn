import { expect, test } from "@playwright/test";

const helloWorld = 'print("Hello, Python World!")\n';

async function clearAndReload(page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
}

async function mockPythonRunner(page, resolver) {
  await page.route("**/api/run", async (route) => {
    const payload = route.request().postDataJSON();
    const stdout = resolver(payload);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        stdout,
        stderr: "",
        durationMs: 6
      })
    });
  });
}

test.beforeEach(async ({ page }) => {
  await clearAndReload(page);
});

test("locks lessons, unlocks the next lesson, and protects reset", async ({ page }) => {
  await mockPythonRunner(page, () => "Hello, Python World!\n");

  await expect(page).toHaveTitle("python-learn");
  await expect(page.locator(".brand strong")).toHaveText("python-learn");
  await expect(page.locator(".level-item")).toHaveCount(13);
  await expect(page.locator(".level-item:disabled")).toHaveCount(12);
  await expect(page.locator("#resetProgress")).toBeDisabled();

  await expect(page.locator(".level-item").nth(2)).toHaveAttribute("title", "完成前一章后解锁");
  await expect(page.locator(".level-item").nth(2)).toHaveAttribute("aria-label", /完成前一章后解锁/);

  await page.locator("#codeEditor").fill(helloWorld);
  await page.locator("#submitTask").click();

  await expect(page.locator("#consoleOutput")).toContainText("[本章全部测试通过]");
  await expect(page.locator("#consoleOutput")).toContainText("Unlocked: 2.");
  await expect(page.locator("#progressText")).toHaveText("1/13 章");
  await expect(page.locator(".level-item:disabled")).toHaveCount(11);
  await expect(page.locator(".level-item").nth(1)).toBeEnabled();
  await expect(page.locator("#resetProgress")).toBeEnabled();
  await expect(page.locator("#nextLesson")).toBeVisible();
  await expect(page.locator("#nextLesson")).toBeEnabled();

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe("确认重置学习进度？");
    await dialog.dismiss();
  });
  await page.locator("#resetProgress").click();
  await expect(page.locator("#progressText")).toHaveText("1/13 章");

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toBe("确认重置学习进度？");
    await dialog.accept();
  });
  await page.locator("#resetProgress").click();
  await expect(page.locator("#progressText")).toHaveText("0/13 章");
  await expect(page.locator(".level-item:disabled")).toHaveCount(12);
  await expect(page.locator("#resetProgress")).toBeDisabled();
});

test("switches standard cases and restores expected stdin", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem(
      "python-learn-progress-v2",
      JSON.stringify({
        completedLessons: 2,
        completedLessonIds: ["1", "2"],
        passedTestCaseIdsByLessonId: {}
      })
    );
  });
  await page.reload();

  await page.locator(".level-item").nth(2).click();
  await page.getByRole("button", { name: /n = 5/ }).click();

  await expect(page.locator("#stdinInput")).toHaveValue("5");
  await expect(page.locator("#testSummary")).toHaveText("0/3 通过");
});

test("runs every standard case and unlocks progress through submit", async ({ page }) => {
  const outputByInput = {
    "10": "55\n",
    "5": "15\n",
    "0": "0\n"
  };
  await mockPythonRunner(page, (payload) => outputByInput[String(payload.stdin || "").trim()] || "");
  await page.evaluate(() => {
    localStorage.setItem(
      "python-learn-progress-v2",
      JSON.stringify({
        completedLessons: 2,
        completedLessonIds: ["1", "2"],
        passedTestCaseIdsByLessonId: {}
      })
    );
  });
  await page.reload();

  await page.locator(".level-item").nth(2).click();
  const answerCode = await page.evaluate(() => window.PY_LESSONS[2].answerCode);
  await page.locator("#codeEditor").fill(answerCode);
  await page.locator("#submitTask").click();

  await expect(page.locator("#consoleOutput")).toContainText("[全测完成: 本次 3/3 通过");
  await expect(page.locator("#consoleOutput")).toContainText("Unlocked: 4.");
  await expect(page.locator("#progressText")).toHaveText("3/13 章");
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem("python-learn-progress-v2") || "{}");
        return {
          completedLessons: state.completedLessons,
          passedCount: state.passedTestCaseIdsByLessonId?.["3"]?.length || 0
        };
      })
    )
    .toEqual({ completedLessons: 3, passedCount: 3 });
});

test("saves code drafts while keeping stdin runtime-only", async ({ page }) => {
  await expect(page.locator("#resetProgress")).toBeDisabled();

  await page.locator("#stdinInput").fill("Only runtime input");
  await expect(page.locator("#resetProgress")).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem("python-learn-stdin-v2"))).toBeNull();

  const draft = `${helloWorld}\n# draft line\n`;
  await page.locator("#codeEditor").fill(draft);
  await expect(page.locator("#resetProgress")).toBeEnabled();

  await page.reload();
  await expect(page.locator("#codeEditor")).toHaveValue(draft);
  await expect(page.locator("#stdinInput")).toHaveValue("");
  expect(await page.evaluate(() => localStorage.getItem("python-learn-stdin-v2"))).toBeNull();

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.locator("#resetProgress").click();

  await expect(page.locator("#codeEditor")).toHaveValue(/TODO: 输出 Hello, Python World!/);
  await expect(page.locator("#resetProgress")).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem("python-learn-drafts-v2"))).toBeNull();
});

test("sends standard input to the runner and supports focus mode", async ({ page }) => {
  const runRequests = [];
  await mockPythonRunner(page, (payload) => {
    runRequests.push(payload);
    return `stdin:${payload.stdin}`;
  });

  await page.locator("#codeEditor").fill(helloWorld);
  await page.locator("#stdinInput").fill("Alice\n18");
  await page.locator("#runCode").click();

  await expect(page.locator("#consoleOutput")).toContainText("stdin:Alice\n18");
  expect(runRequests.at(-1).stdin).toBe("Alice\n18");

  await page.locator("#focusCode").click();
  await expect(page.locator("#focusStdinInput")).toHaveValue("Alice\n18");
  await page.locator("#focusStdinInput").fill("Bob\n19");
  await page.locator("#focusRun").click();
  await expect(page.locator("#focusOutput")).toContainText("stdin:Bob\n19");
  expect(runRequests.at(-1).stdin).toBe("Bob\n19");
  await page.locator("#closeFocus").click();
  await expect(page.locator("#stdinInput")).toHaveValue("Bob\n19");
});

test("live quest checklist tracks editing and passing in real time", async ({ page }) => {
  await mockPythonRunner(page, () => "Hello, Python World!\n");

  const quests = page.locator(".quest-item");
  await expect(quests).toHaveCount(3);
  await expect(page.locator(".quest-item.is-done")).toHaveCount(0);

  await page.locator("#codeEditor").fill(helloWorld);
  await expect(quests.nth(0)).toHaveClass(/is-done/);
  await expect(page.locator(".quest-item.is-done")).toHaveCount(1);

  await page.locator("#submitTask").click();
  await expect(page.locator(".quest-item.is-done")).toHaveCount(3);
  await expect(quests.nth(2).locator(".quest-mark")).toHaveText("✓");

  // Restored drafts keep the checklist state after a reload.
  await page.reload();
  await expect(page.locator(".quest-item.is-done")).toHaveCount(3);
});

test("editor auto-indents, tab-indents, and keeps undo history", async ({ page }) => {
  const editor = page.locator("#codeEditor");
  await editor.click();
  await editor.press("Control+a");
  await editor.pressSequentially("if True:");
  await editor.press("Enter");
  await expect(editor).toHaveValue("if True:\n    ");

  await editor.press("Tab");
  await expect(editor).toHaveValue("if True:\n        ");

  // Indentation edits must stay on the native undo stack.
  await editor.press("Control+z");
  await expect(editor).toHaveValue("if True:\n    ");
});

test("escape closes the answer drawer and removes it from focus order", async ({ page }) => {
  await page.locator("#showAnswer").click();
  await expect(page.locator("#answerDrawer")).toHaveClass(/is-open/);
  await expect(page.locator("#closeAnswer")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("#answerDrawer")).not.toHaveClass(/is-open/);
  // visibility: hidden keeps the closed drawer out of the keyboard tab order.
  await expect(page.locator("#closeAnswer")).toBeHidden();
});

test("ctrl+s persists the draft immediately", async ({ page }) => {
  await page.locator("#codeEditor").fill(helloWorld);
  await page.keyboard.press("Control+s");

  // No debounce wait: the shortcut flushes the pending write synchronously.
  const draft = await page.evaluate(
    () => JSON.parse(localStorage.getItem("python-learn-drafts-v2") || "{}").drafts?.["1"]
  );
  expect(draft).toBe(helloWorld);
});

test("core UI panels open without layout overflow", async ({ page }) => {
  await expect.poll(() => hasHorizontalOverflow(page)).toBe(false);

  await page.locator("#showAnswer").click();
  await expect(page.locator("#answerDrawer")).toHaveClass(/is-open/);
  await expect.poll(() => hasHorizontalOverflow(page)).toBe(false);
  await page.locator("#closeAnswer").click();
  await expect(page.locator("#answerDrawer")).not.toHaveClass(/is-open/);

  await page.locator("#focusCode").click();
  await expect(page.locator("#focusModal")).toHaveClass(/is-open/);
  await expect.poll(() => hasHorizontalOverflow(page)).toBe(false);
  await page.locator("#closeFocus").click();
  await expect(page.locator("#focusModal")).not.toHaveClass(/is-open/);
});
