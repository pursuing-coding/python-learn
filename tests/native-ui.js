import assert from "node:assert/strict";
import { suite, check } from "./safari.js";

const helloWorld = 'print("Hello, Python World!")\n';


async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
}

async function mockPythonRunner(page, resolver) {
  page.mockRun(payload => {
    const stdout = resolver(payload);
    return {
        status: "success",
        stdout,
        stderr: "",
        durationMs: 6
      };
  });
}

suite(test => {
  test("locks lessons, unlocks the next lesson, and protects reset", async ({ page }) => {
    await mockPythonRunner(page, () => "Hello, Python World!\n");

    await check(() => page.title(), "python-learn");
    await check(() => page.locator(".brand strong").text(), "python-learn");
    await check(() => page.locator(".level-item").count(), 33);
    await check(() => page.locator(".level-item:disabled").count(), 32);
    await check(() => page.locator("#resetProgress").enabled(), false);

    await check(() => page.locator(".level-item").nth(2).attribute("title"), "完成前一章后解锁");
    await check(() => page.locator(".level-item").nth(2).attribute("aria-label"), /完成前一章后解锁/);

    await page.locator("#codeEditor").fill(helloWorld);
    await page.locator("#submitTask").click();

    await check(() => page.locator("#consoleOutput").text(), "[本章全部测试通过]", "contains");
    await check(() => page.locator("#consoleOutput").text(), "Unlocked: 2.", "contains");
    await check(() => page.locator("#progressText").text(), "1/33 章");
    await check(() => page.locator(".level-item:disabled").count(), 31);
    await check(() => page.locator(".level-item").nth(1).enabled(), true);
    await check(() => page.locator("#resetProgress").enabled(), true);
    await check(() => page.locator("#nextLesson").visible(), true);
    await check(() => page.locator("#nextLesson").enabled(), true);

    page.confirm( async (dialog) => {
      assert.deepEqual(await dialog.getText(), "确认重置学习进度？");
      await dialog.dismiss();
    });
    await page.locator("#resetProgress").click();
    await check(() => page.locator("#progressText").text(), "1/33 章");

    page.confirm( async (dialog) => {
      assert.deepEqual(await dialog.getText(), "确认重置学习进度？");
      await dialog.accept();
    });
    await page.locator("#resetProgress").click();
    await check(() => page.locator("#progressText").text(), "0/33 章");
    await check(() => page.locator(".level-item:disabled").count(), 32);
    await check(() => page.locator("#resetProgress").enabled(), false);
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
    await page.clickButton(/a=9 b=4/);

    await check(() => page.locator("#stdinInput").value(), "9\n4");
    await check(() => page.locator("#testSummary").text(), "0/3 通过");
  });

  test("runs every standard case and unlocks progress through submit", async ({ page }) => {
    const outputByInput = {
      "17\n5": "17 + 5 = 22\n17 // 5 = 3\n17 % 5 = 2\n17 ** 2 = 289\n17 / 5 = 3.4\n",
      "9\n4": "9 + 4 = 13\n9 // 4 = 2\n9 % 4 = 1\n9 ** 2 = 81\n9 / 4 = 2.25\n",
      "12\n6": "12 + 6 = 18\n12 // 6 = 2\n12 % 6 = 0\n12 ** 2 = 144\n12 / 6 = 2.0\n"
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

    await check(() => page.locator("#consoleOutput").text(), "[全测完成: 本次 3/3 通过", "contains");
    await check(() => page.locator("#consoleOutput").text(), "Unlocked: 4.", "contains");
    await check(() => page.locator("#progressText").text(), "3/33 章");
    await check(async () =>
        page.evaluate(() => {
          const state = JSON.parse(localStorage.getItem("python-learn-progress-v2") || "{}");
          return {
            completedLessons: state.completedLessons,
            passedCount: state.passedTestCaseIdsByLessonId?.["3"]?.length || 0
          };
        })
      , { completedLessons: 3, passedCount: 3 });
  });

  test("saves code drafts while keeping stdin runtime-only", async ({ page }) => {
    await check(() => page.locator("#resetProgress").enabled(), false);

    await page.locator("#stdinInput").fill("Only runtime input");
    await check(() => page.locator("#resetProgress").enabled(), false);
    assert.equal(await page.evaluate(() => localStorage.getItem("python-learn-stdin-v2")), null);

    const draft = `${helloWorld}\n# draft line\n`;
    await page.locator("#codeEditor").fill(draft);
    await check(() => page.locator("#resetProgress").enabled(), true);

    await page.reload();
    await check(() => page.locator("#codeEditor").value(), draft);
    await check(() => page.locator("#stdinInput").value(), "");
    assert.equal(await page.evaluate(() => localStorage.getItem("python-learn-stdin-v2")), null);

    page.confirm( async (dialog) => {
      await dialog.accept();
    });
    await page.locator("#resetProgress").click();

    await check(() => page.locator("#codeEditor").value(), /TODO: 输出 Hello, Python World!/);
    await check(() => page.locator("#resetProgress").enabled(), false);
    assert.equal(await page.evaluate(() => localStorage.getItem("python-learn-drafts-v2")), null);
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

    await check(() => page.locator("#consoleOutput").text(), "stdin:Alice\n18", "contains");
    assert.deepEqual(runRequests.at(-1).stdin, "Alice\n18");

    await page.locator("#focusCode").click();
    await check(() => page.locator("#focusStdinInput").value(), "Alice\n18");
    await page.locator("#focusStdinInput").fill("Bob\n19");
    await page.locator("#focusRun").click();
    await check(() => page.locator("#focusOutput").text(), "stdin:Bob\n19", "contains");
    assert.deepEqual(runRequests.at(-1).stdin, "Bob\n19");
    await page.locator("#closeFocus").click();
    await check(() => page.locator("#stdinInput").value(), "Bob\n19");
  });

  test("live quest checklist tracks editing and passing in real time", async ({ page }) => {
    await mockPythonRunner(page, () => "Hello, Python World!\n");

    const quests = page.locator(".quest-item");
    await check(() => quests.count(), 3);
    await check(() => page.locator(".quest-item.is-done").count(), 0);

    await page.locator("#codeEditor").fill(helloWorld);
    await check(() => quests.nth(0).attribute("class"), /is-done/);
    await check(() => page.locator(".quest-item.is-done").count(), 1);

    await page.locator("#submitTask").click();
    await check(() => page.locator(".quest-item.is-done").count(), 3);
    await check(() => page.locator(".quest-item .quest-mark").nth(2).text(), "✓");

    // Restored drafts keep the checklist state after a reload.
    await page.reload();
    await check(() => page.locator(".quest-item.is-done").count(), 3);
  });

  test("editor auto-indents, tab-indents, and keeps undo history", async ({ page }) => {
    const editor = page.locator("#codeEditor");
    const starter = await editor.value();
    await editor.click();
    await page.evaluate(() => document.querySelector("#codeEditor").select());
    await editor.type("if True:");
    await editor.press("Enter");
    await check(() => editor.value(), "if True:\n    ");

    await editor.press("Tab");
    await check(() => editor.value(), "if True:\n        ");

    // WebKit can group the replacement, newline and indent into one native edit.
    assert.ok(await page.evaluate(() => document.execCommand("undo")));
    assert.ok([starter, "if True:\n    "].includes(await editor.value()));
    assert.ok(await page.evaluate(() => document.execCommand("redo")));
    await check(() => editor.value(), "if True:\n        ");
  });

  test("undoing a tab preserves the previously saved code", async ({ page }) => {
    const editor = page.locator("#codeEditor");
    const saved = "if True:\n    ";
    await editor.fill(saved);
    await editor.press("Control+s");
    await page.reload();
    await check(() => editor.value(), saved);
    await page.evaluate(() => document.querySelector("#codeEditor").select());
    await editor.press("ArrowRight");
    await editor.press("Tab");
    await check(() => editor.value(), saved + "    ");
    assert.ok(await page.evaluate(() => document.execCommand("undo")));
    await check(() => editor.value(), saved);
  });

  test("escape closes the answer drawer and removes it from focus order", async ({ page }) => {
    await page.locator("#showAnswer").click();
    await check(() => page.locator("#answerDrawer").attribute("class"), /is-open/);
    await check(() => page.locator("#closeAnswer").visible(), true);

    await page.press("Escape");
    await check(() => page.locator("#answerDrawer").attribute("class"), /is-open/, "notMatch");
    // visibility: hidden keeps the closed drawer out of the keyboard tab order.
    await check(() => page.locator("#closeAnswer").visible(), false);
  });

  test("ctrl+s persists the draft immediately", async ({ page }) => {
    await page.locator("#codeEditor").fill(helloWorld);
    await page.press("Control+s");

    // No debounce wait: the shortcut flushes the pending write synchronously.
    const draft = await page.evaluate(
      () => JSON.parse(localStorage.getItem("python-learn-drafts-v2") || "{}").drafts?.["1"]
    );
    assert.deepEqual(draft, helloWorld);
  });

  test("core UI panels open without layout overflow", async ({ page }) => {
    await check(() => hasHorizontalOverflow(page), false);

    await page.locator("#showAnswer").click();
    await check(() => page.locator("#answerDrawer").attribute("class"), /is-open/);
    await check(() => hasHorizontalOverflow(page), false);
    await page.locator("#closeAnswer").click();
    await check(() => page.locator("#answerDrawer").attribute("class"), /is-open/, "notMatch");

    await page.locator("#focusCode").click();
    await check(() => page.locator("#focusModal").attribute("class"), /is-open/);
    await check(() => hasHorizontalOverflow(page), false);
    await page.locator("#closeFocus").click();
    await check(() => page.locator("#focusModal").attribute("class"), /is-open/, "notMatch");
  });
});
