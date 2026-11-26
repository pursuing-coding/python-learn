import assert from "node:assert/strict";
import { suite, check } from "./safari.js";

const helloWorld = 'print("Hello, Python World!")\n';


async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
}

async function mockPythonRunner(page, resolver) {
  page.mockRun(async payload => {
    const stdout = await resolver(payload);
    return {
        status: "success",
        stdout,
        stderr: "",
        durationMs: 6
      };
  });
}

async function addLessonFrame(page, id) {
  await page.evaluate(frameId => {
    const frame = document.createElement("iframe");
    frame.id = frameId;
    frame.hidden = true;
    frame.src = location.href;
    document.body.append(frame);
  }, id);
  await check(() => page.evaluate(frameId => document.getElementById(frameId).contentDocument
    ?.querySelectorAll(".level-item").length, id), 33);
}

suite((test, width) => {
  test("core UI panels open without layout overflow", async ({ page }) => {
    await check(() => hasHorizontalOverflow(page), false);
    await check(() => page.evaluate(() => {
      const button = document.querySelector("#runCode");
      const bounds = button.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= button.closest(".panel-toolbar").getBoundingClientRect().right && bounds.right <= innerWidth;
    }), true);

    const layersMatch = (editor, highlight) => {
      const input = getComputedStyle(document.querySelector(editor));
      const overlay = getComputedStyle(document.querySelector(highlight));
      return ["fontSize", "lineHeight", "paddingTop", "paddingLeft", "whiteSpace"].every(key => input[key] === overlay[key]);
    };
    await check(() => page.evaluate(layersMatch, "#codeEditor", "#editorHighlight"), true);

    await page.locator("#showAnswer").click();
    await check(() => page.locator("#answerDrawer").attribute("class"), /is-open/);
    await check(() => hasHorizontalOverflow(page), false);
    await page.locator("#closeAnswer").click();
    await check(() => page.locator("#answerDrawer").attribute("class"), /is-open/, "notMatch");

    await page.locator("#focusCode").click();
    await check(() => page.locator("#focusModal").attribute("class"), /is-open/);
    await check(() => hasHorizontalOverflow(page), false);
    await check(() => page.evaluate(layersMatch, "#focusEditor", "#focusHighlight"), true);
    await page.locator("#closeFocus").click();
    await check(() => page.locator("#focusModal").attribute("class"), /is-open/, "notMatch");
  });

  if (width === 1024) return;
  test("overlapping saves preserve drafts from different chapters", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({ completedLessons: 2 }));
    });
    await page.reload();
    await addLessonFrame(page, "otherEditor");
    const interleaved = await page.evaluate(() => {
      const other = document.getElementById("otherEditor").contentWindow;
      other.document.querySelectorAll(".level-item")[1].click();
      const edit = (tab, value) => {
        const editor = tab.document.querySelector("#codeEditor");
        editor.value = value;
        editor.dispatchEvent(new tab.Event("input", { bubbles: true }));
      };
      const save = tab => tab.document.dispatchEvent(new tab.KeyboardEvent("keydown", {
        key: "s", ctrlKey: true, bubbles: true
      }));
      edit(window, "# draft in chapter 1");
      edit(other, "# draft in chapter 2");
      // Pause the first save after its reads but before its draft write. Complete
      // the other document's save in that gap, without relying on timer races.
      const setItem = Storage.prototype.setItem;
      let overlapped = false;
      Storage.prototype.setItem = function (key, value) {
        if (!overlapped && key.startsWith("python-learn-draft")) {
          overlapped = true;
          save(other);
        }
        return setItem.call(this, key, value);
      };
      try { save(window); } finally { Storage.prototype.setItem = setItem; }
      return overlapped;
    });
    assert.equal(interleaved, true, "the second write ran inside the first save");

    await page.reload();
    await page.locator(".level-item").nth(0).click();
    assert.equal(await page.locator("#codeEditor").value(), "# draft in chapter 1");
    await page.locator(".level-item").nth(1).click();
    assert.equal(await page.locator("#codeEditor").value(), "# draft in chapter 2");
  });

  test("reset invalidates a draft whose save was already in flight", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({ completedLessons: 2 }));
      localStorage.setItem("python-learn-drafts-v2", JSON.stringify({ drafts: { "1": "# legacy draft" } }));
    });
    await page.reload();
    await addLessonFrame(page, "resetEditor");
    const resetDuringSave = await page.evaluate(() => {
      const other = document.getElementById("resetEditor").contentWindow;
      const staleProgress = localStorage.getItem("python-learn-progress-v2");
      other.confirm = () => true;
      const editor = document.querySelector("#codeEditor");
      editor.value = "# stale draft";
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      const setItem = Storage.prototype.setItem;
      let reset = false;
      Storage.prototype.setItem = function (key, value) {
        if (!reset && key.startsWith("python-learn-draft")) {
          reset = true;
          other.document.querySelector("#resetProgress").click();
          // A progress writer already holding a snapshot can also finish late.
          setItem.call(this, "python-learn-progress-v2", staleProgress);
        }
        return setItem.call(this, key, value);
      };
      try {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true }));
      } finally { Storage.prototype.setItem = setItem; }
      return reset;
    });
    assert.equal(resetDuringSave, true);
    await page.reload();
    assert.match(await page.locator("#codeEditor").value(), /TODO: 输出 Hello, Python World!/);
    assert.equal(await page.locator("#progressText").text(), "0/33 章");
  });

  test("restores old drafts and does not resurrect one replaced with starter code", async ({ page }) => {
    const starter = await page.locator("#codeEditor").value();
    await page.evaluate(() => {
      // Old clients stored drafts without an epoch, including after a reset.
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({ completedLessons: 2, resetId: "legacy-reset" }));
      localStorage.setItem("python-learn-drafts-v2", JSON.stringify({ drafts: { "1": "# old draft", "2": "" } }));
    });
    await page.reload();
    assert.equal(await page.locator("#codeEditor").value(), "# old draft");
    await page.locator(".level-item").nth(1).click();
    assert.equal(await page.locator("#codeEditor").value(), "");
    await page.locator(".level-item").nth(0).click();
    await page.locator("#codeEditor").fill(starter);
    await page.press("Control+s");
    await page.reload();
    assert.equal(await page.locator("#codeEditor").value(), starter);
    assert.equal(await page.locator("#runMeta").text(), "等待运行");
  });
  test("runs Python through the local HTTP server", async ({ page }) => {
    await page.locator("#codeEditor").fill(helloWorld);
    await page.locator("#runCode").click();
    await check(() => page.locator("#consoleOutput").text(), "Hello, Python World!", "contains");
    await check(() => page.locator("#consoleOutput").text(), "[测试用例通过:", "contains");
  });

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

  test("stale chapter navigation preserves newer saved progress", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({ completedLessons: 1 }));
    });
    await page.reload();
    // Write the newer snapshot after boot, without updating this page's cached state.
    const newerCases = await page.evaluate(() => {
      const ids = window.PY_LESSONS[2].testCases.slice(0, 1).map(testCase => testCase.id);
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({
        completedLessons: 2, completedLessonIds: ["1", "2"], lastLessonId: "3",
        passedTestCaseIdsByLessonId: { "3": ids }
      }));
      return ids;
    });
    await page.locator(".level-item").nth(1).click();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("python-learn-progress-v2")));
    assert.equal(saved.lastLessonId, "2");
    assert.deepEqual(saved.completedLessonIds, ["1", "2"]);
    assert.deepEqual(saved.passedTestCaseIdsByLessonId["3"], newerCases);
    await check(() => page.locator("#progressText").text(), "2/33 章");
  });

  test("saving an edit clears only that chapter's newer test results", async ({ page }) => {
    const ids = await page.evaluate(() => {
      const ids = window.PY_LESSONS.slice(0, 2).map(lesson => lesson.testCases?.[0].id || "default");
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({
        completedLessons: 2, lastLessonId: "2", passedTestCaseIdsByLessonId: { "1": [ids[0]], "2": [ids[1]] }
      }));
      return ids;
    });
    await page.locator("#codeEditor").fill("# edited in the older tab");
    await page.press("Control+s");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("python-learn-progress-v2")));
    assert.equal(saved.lastLessonId, "2");
    assert.equal(saved.completedLessons, 2);
    assert.deepEqual(saved.passedTestCaseIdsByLessonId, { "2": [ids[1]] });
  });

  test("finishing in a stale tab preserves newer completions and other chapter results", async ({ page }) => {
    await mockPythonRunner(page, () => "Hello, Python World!\n");
    const newerCases = await page.evaluate(() => {
      const ids = window.PY_LESSONS[2].testCases.slice(0, 1).map(testCase => testCase.id);
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({
        completedLessons: 2, lastLessonId: "3", passedTestCaseIdsByLessonId: { "3": ids }
      }));
      return ids;
    });
    await page.locator("#codeEditor").fill(helloWorld);
    await page.locator("#submitTask").click();
    await check(() => page.locator("#consoleOutput").text(), "[本章全部测试通过]", "contains");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("python-learn-progress-v2")));
    assert.deepEqual(saved.completedLessonIds, ["1", "2"]);
    assert.deepEqual(saved.passedTestCaseIdsByLessonId["3"], newerCases);
    assert.equal(saved.passedTestCaseIdsByLessonId["1"].length, 1);
    assert.equal(saved.lastLessonId, "3");
  });

  test("does not attach a stale run result to another tab's replacement draft", async ({ page }) => {
    let pendingReply;
    await mockPythonRunner(page, () => new Promise(resolve => { pendingReply = resolve; }));
    await addLessonFrame(page, "replacementEditor");
    await page.locator("#codeEditor").fill(helloWorld);
    await page.locator("#submitTask").click();
    try {
      await check(() => typeof pendingReply, "function");
      const newerDraft = "# replacement from another tab";
      await page.evaluate(draft => {
        const other = document.getElementById("replacementEditor").contentWindow;
        const editor = other.document.querySelector("#codeEditor");
        editor.value = draft;
        editor.dispatchEvent(new other.Event("input", { bubbles: true }));
        other.document.dispatchEvent(new other.KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true }));
      }, newerDraft);
      pendingReply("Hello, Python World!\n");
      await check(() => page.locator("#consoleOutput").text(), "本章草稿已在其他页面更新", "contains");
      await page.locator(".level-item").nth(0).click();
      await check(() => page.locator("#codeEditor").value(), newerDraft);
      await check(() => page.locator("#progressText").text(), "0/33 章");
      await check(() => page.locator("#testSummary").text(), "0/1 通过");
    } finally {
      pendingReply?.("Hello, Python World!\n");
    }
  });

  test("a reset in another tab discards pending drafts and run results", async ({ page }) => {
    let pendingReply;
    await mockPythonRunner(page, () => new Promise(resolve => { pendingReply = resolve; }));
    await page.evaluate(() => {
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({ completedLessons: 2 }));
    });
    await page.reload();
    await addLessonFrame(page, "resetTab");
    await page.locator("#codeEditor").fill(helloWorld);
    await page.locator("#submitTask").click();
    try {
      await check(() => typeof pendingReply, "function");
      await page.evaluate(() => {
        const editor = document.querySelector("#codeEditor");
        editor.value += "# unsaved edit";
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        const tab = document.querySelector("#resetTab").contentWindow;
        tab.confirm = () => true;
        tab.document.querySelector("#resetProgress").click();
        // Force the stale tab to save before it can receive its storage event.
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true }));
      });
      pendingReply("Hello, Python World!\n");
      await check(() => page.locator("#progressText").text(), "0/33 章");
      await check(() => page.locator("#codeEditor").value(), /TODO: 输出 Hello, Python World!/);
      assert.equal(await page.evaluate(() => localStorage.getItem("python-learn-drafts-v2")), null);
      await page.reload();
      await check(() => page.locator("#progressText").text(), "0/33 章");
      await check(() => page.locator("#testSummary").text(), "0/1 通过");
    } finally {
      pendingReply?.("Hello, Python World!\n");
    }
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

  test("submits the current code even after all historical cases passed", async ({ page }) => {
    await mockPythonRunner(page, () => "incorrect\n");
    await page.evaluate(() => {
      const lesson = window.PY_LESSONS[2];
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({
        completedLessons: 2,
        lastLessonId: "3",
        passedTestCaseIdsByLessonId: { "3": lesson.testCases.map(testCase => testCase.id) }
      }));
    });
    await page.reload();
    await check(() => page.locator("#testSummary").text(), "3/3 通过");
    await page.locator("#codeEditor").fill('print("incorrect")');
    await check(() => page.locator("#testSummary").text(), "0/3 通过");
    await page.locator("#submitTask").click();
    await check(() => page.locator("#consoleOutput").text(), "[全测完成: 本次 0/3 通过]", "contains");
    await check(() => page.locator("#progressText").text(), "2/33 章");
    await check(() => page.locator(".level-item").nth(3).enabled(), false);
  });

  test("discards results after navigation and confirmed progress reset", async ({ page }) => {
    let pendingReply;
    await mockPythonRunner(page, () => new Promise(resolve => { pendingReply = resolve; }));
    await page.evaluate(() => {
      localStorage.setItem("python-learn-progress-v2", JSON.stringify({ completedLessons: 2 }));
    });
    await page.reload();
    await page.locator("#codeEditor").fill(helloWorld);
    await page.locator("#submitTask").click();
    try {
      await check(() => typeof pendingReply, "function");
      await page.locator(".level-item").nth(2).click();
      pendingReply("Hello, Python World!\n");
      await check(() => page.locator("#consoleOutput").text(), "Loaded: 3.", "contains");
      await check(() => page.locator("#progressText").text(), "2/33 章");

      await page.locator(".level-item").nth(0).click();
      pendingReply = undefined;
      await page.locator("#submitTask").click();
      await check(() => typeof pendingReply, "function");
      page.confirm(dialog => dialog.accept());
      await page.locator("#resetProgress").click();
      pendingReply("Hello, Python World!\n");
      await check(() => page.locator("#consoleOutput").text(), "Progress reset.", "contains");
      await check(() => page.locator("#progressText").text(), "0/33 章");
    } finally {
      pendingReply?.("Hello, Python World!\n");
    }
  });

  test("compares the stdin used at dispatch even when edited while running", async ({ page }) => {
    let pendingReply;
    await mockPythonRunner(page, () => new Promise(resolve => { pendingReply = resolve; }));
    await page.locator("#codeEditor").fill(helloWorld);
    await page.locator("#runCode").click();
    try {
      await check(() => typeof pendingReply, "function");
      await page.locator("#stdinInput").fill("next run");
      pendingReply("Hello, Python World!\n");
      await check(() => page.locator("#consoleOutput").text(), "[测试用例通过:", "contains");
      await check(() => page.locator("#stdinInput").value(), "next run");
    } finally {
      pendingReply?.("Hello, Python World!\n");
    }
  });

  test("keeps local validation failures on the local runner", async ({ page }) => {
    const code = 'print("sample")';
    await page.evaluate(() => {
      const calls = window.testCalls = [];
      window.fetch = async (path) => {
        calls.push(String(path));
        return new Response(JSON.stringify({ status: "error", stderr: "Local validation failed" }), {status:400});
      };
    });
    await page.locator("#codeEditor").fill(code);
    await page.locator("#runCode").click();
    await check(() => page.locator("#consoleOutput").text(), "Local validation failed", "contains");
    assert.deepEqual(await page.evaluate(() => window.testCalls), ["api/run"]);
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
    await page.reload();
    await check(() => page.locator("#codeEditor").value(), /TODO: 输出 Hello, Python World!/);
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

  test("restores focus-mode edits and an empty draft after reload", async ({ page }) => {
    await page.locator("#focusCode").click();
    await page.locator("#focusEditor").fill("# draft from focus mode");
    await page.reload();
    await check(() => page.locator("#codeEditor").value(), "# draft from focus mode");
    await page.locator("#codeEditor").fill("");
    await page.reload();
    await check(() => page.locator("#codeEditor").value(), "");
    await check(() => page.locator("#runMeta").text(), "草稿已恢复");
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
    const typedLine = await editor.value();
    assert.equal(typedLine, "if True:");
    await editor.press("Enter");
    await check(() => editor.value(), "if True:\n    ");

    await page.evaluate(() => document.querySelector("#codeEditor").blur());
    await editor.press("Tab");
    await check(() => editor.value(), "if True:\n        ");

    // WebKit can group the replacement, newline and indent into one native edit.
    assert.ok(await page.evaluate(() => document.execCommand("undo")));
    const restored = await editor.value();
    assert.ok([starter, typedLine, "if True:\n    "].includes(restored), JSON.stringify({restored, starter}));
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

  test("supports leaving the editor and focus mode with the keyboard", async ({ page }) => {
    const editor = page.locator("#codeEditor");
    const starter = await editor.value();
    await editor.press("Escape");
    await page.press("Tab");
    await check(() => page.evaluate(() => document.activeElement.id === "codeEditor"), false);
    await check(() => editor.value(), starter);

    await page.locator("#focusCode").click();
    await check(() => page.evaluate(() => document.activeElement.id), "focusEditor");
    await page.press("Escape");
    await check(() => page.evaluate(() => document.activeElement.id), "focusCode");
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
      () => JSON.parse(localStorage.getItem("python-learn-draft-v3::1"))
    );
    assert.deepEqual(draft, helloWorld);
  });


});
