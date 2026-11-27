import { checkOutput, tracebackLine } from "./grading.js";
import { isDraftCopy, readDraftCopies, readDraftJournal, recoveryKeys, writeDraftCopy, writeDraftJournal } from "./draft-recovery.js";

const lessons = Array.isArray(window.PY_LESSONS) ? window.PY_LESSONS : [];
const totalLessons = lessons.length;
const groupDefinitions = [
  { title: "Level 1: 语言基础 (Foundation)", start: 0, end: 8 },
  { title: "Level 2: 数据结构与核心 (Core)", start: 8, end: 15 },
  { title: "Level 3: 面向对象与模块 (Object)", start: 15, end: 22 },
  { title: "Level 4: 标准库实战 (Stdlib)", start: 22, end: 29 },
  { title: "Level 5: 综合项目 (Capstone)", start: 29, end: 33 }
];
const courseGroups = groupDefinitions
  .map((group) => ({ ...group, lessons: lessons.slice(group.start, group.end) }))
  .filter((group) => group.lessons.length > 0);

const progressStorageKey = "python-learn-progress-v2";
const legacyDraftStorageKey = "python-learn-drafts-v2";
const resetStorageKey = "python-learn-reset-v3";
const themeStorageKey = "python-learn-theme";
const judge0Endpoint = "https://ce.judge0.com/submissions";
const python3LanguageId = 71;
const localRunnerAvailable = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
const defaultSources = [
  { title: "Python 官方教程", url: "https://docs.python.org/zh-cn/3/tutorial/index.html" },
  { title: "Python 标准库参考", url: "https://docs.python.org/zh-cn/3/library/index.html" }
];

const levelList = document.querySelector("#levelList");
const toggleChapters = document.querySelector("#toggleChapters");
const lessonArticle = document.querySelector("#lessonArticle");
const lessonColumn = document.querySelector(".lesson-column");
const practiceColumn = document.querySelector(".practice-column");
const codeEditor = document.querySelector("#codeEditor");
const editorLines = document.querySelector("#editorLines");
const codeSurface = codeEditor.closest(".code-surface");
const editorPanel = codeSurface.parentElement;
const stdinInput = document.querySelector("#stdinInput");
const clearStdin = document.querySelector("#clearStdin");
const stdinSurface = stdinInput.parentElement;
const inputPanel = stdinSurface.parentElement;
const consoleOutput = document.querySelector("#consoleOutput");
const runMeta = document.querySelector("#runMeta");
const themeToggle = document.querySelector("#themeToggle");
const progressBar = document.querySelector("#progressBar");
const progressPercent = document.querySelector("#progressPercent");
const progressText = document.querySelector("#progressText");
const resetProgress = document.querySelector("#resetProgress");
const answerDrawer = document.querySelector("#answerDrawer");
const answerContent = document.querySelector("#answerContent");
const showAnswer = document.querySelector("#showAnswer");
const closeAnswer = document.querySelector("#closeAnswer");
const focusModal = document.querySelector("#focusModal");
const focusBody = focusModal.querySelector(".focus-body");
const focusIo = focusBody.querySelector(".focus-io-column");
const focusInputPanel = focusIo.querySelector(".focus-input-panel");
const focusOutput = document.querySelector("#focusOutput");
const focusRunMeta = document.querySelector("#focusRunMeta");
const nextLessonButton = document.querySelector("#nextLesson");
const testCaseList = document.querySelector("#testCaseList");
const testSummary = document.querySelector("#testSummary");
const runnerMode = document.querySelector("#runnerMode");
const draftStatus = document.querySelector("#draftStatus");
const draftRecovery = document.querySelector("#draftRecovery");
const draftVersions = document.querySelector("#draftVersions");
const restoreDraft = document.querySelector("#restoreDraft");
const downloadDraft = document.querySelector("#downloadDraft");
const trainingApp = document.querySelector(".training-app");
const focusCode = document.querySelector("#focusCode");
const closeFocus = document.querySelector("#closeFocus");
const mainRunButton = document.querySelector("#runCode");
const focusRunButton = document.querySelector("#focusRun");
const focusStop = document.querySelector("#focusStop");
const clearConsole = document.querySelector("#clearConsole");
const errorButtons = [document.querySelector("#locateError"), document.querySelector("#focusLocateError")];

const storedProgress = readStoredProgress() ?? emptyProgress();
let completedLessons = storedProgress.completedLessons;
let passedTestCaseIdsByLessonId = storedProgress.passedTestCaseIdsByLessonId;
let gradedSources = storedProgress.gradedSources;
let lastLessonId = storedProgress.lastLessonId;
let progressResetId = storedProgress.resetId;
const lessonKeys = new Set(lessons.map(getLessonKey));
function newStorageId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
let draftBranch = newStorageId();
const draftBases = new Map();
let tabJournal = loadDraftJournal();
let lessonDrafts = readStoredDrafts();
let journalSaved = true;
let recoverySources = [];
let selectedTestCaseIdByLessonId = {};
let currentLessonIndex = 0;
let activeRun = null;

function getLessonKey(lesson) {
  return String(lesson?.id ?? "");
}

function getTestCases(lesson) {
  return lesson.testCases?.length
    ? lesson.testCases
    : [
        {
          id: "default",
          title: "默认样例",
          stdin: lesson.defaultStdin || "",
          expectedOutput: lesson.expectedOutput ?? ""
        }
      ];
}

function normalizeCompletedCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(totalLessons, Math.floor(numeric)));
}

function emptyProgress(resetId = "") {
  return { completedLessons: 0, lastLessonId: "", passedTestCaseIdsByLessonId: {}, gradedSources: {}, resetId };
}

function completionKey(count, epoch = progressResetId) {
  return `python-learn-completed-v1:${encodeURIComponent(epoch)}:${count}`;
}

function readCompletedCount(epoch, storedCount = 0) {
  for (let count = totalLessons; count > storedCount; count -= 1) {
    if (localStorage.getItem(completionKey(count, epoch)) === "1") return count;
  }
  return storedCount;
}

function readStoredProgress() {
  let resetId = null;
  try {
    resetId = localStorage.getItem(resetStorageKey);
    const raw = localStorage.getItem(progressStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const storedResetId = String(parsed.resetId ?? "");
      if (resetId !== null && storedResetId !== resetId) {
        return { ...emptyProgress(resetId), completedLessons: readCompletedCount(resetId) };
      }
      const completedIds = Array.isArray(parsed.completedLessonIds)
        ? new Set(parsed.completedLessonIds.map(String))
        : new Set();
      let completedCount = 0;

      while (completedCount < lessons.length && completedIds.has(getLessonKey(lessons[completedCount]))) {
        completedCount += 1;
      }

      return {
        completedLessons: readCompletedCount(storedResetId, normalizeCompletedCount(
          completedIds.size > 0 ? completedCount : parsed.completedLessons
        )),
        lastLessonId: String(parsed.lastLessonId ?? ""),
        resetId: storedResetId,
        gradedSources: Object.fromEntries(lessons.flatMap(lesson => {
          const key = getLessonKey(lesson);
          const code = parsed.gradedSources?.[key];
          return typeof code === "string" ? [[key, code]] : [];
        })),
        passedTestCaseIdsByLessonId:
          parsed.passedTestCaseIdsByLessonId && typeof parsed.passedTestCaseIdsByLessonId === "object"
            ? normalizePassedMap(parsed.passedTestCaseIdsByLessonId)
            : {}
      };
    }
  } catch {
    // Ignore invalid localStorage payloads.
    return resetId === null ? null : emptyProgress(resetId);
  }

  return { ...emptyProgress(resetId ?? ""), completedLessons: readCompletedCount(resetId ?? "") };
}

function normalizePassedMap(value) {
  const map = {};

  for (const lesson of lessons) {
    const key = getLessonKey(lesson);
    const validIds = new Set(getTestCases(lesson).map((testCase) => testCase.id));
    const rawIds = Array.isArray(value[key])
      ? value[key]
      : Array.isArray(value[lesson.id])
        ? value[lesson.id]
        : [];
    const ids = rawIds.map(String).filter((id) => validIds.has(id));
    if (ids.length) map[key] = ids;
  }

  return map;
}

function readStoredTheme() {
  try {
    const theme = localStorage.getItem(themeStorageKey);
    return theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function draftKey(key, resetId = progressResetId) {
  return `python-learn-draft-v3:${encodeURIComponent(resetId)}:${key}`;
}

function readLegacyDrafts() {
  try {
    // Migrate lazily: reading the old blob never risks overwriting a newer draft.
    if (localStorage.getItem(resetStorageKey) !== null) return {};
    return JSON.parse(localStorage.getItem(legacyDraftStorageKey))?.drafts ?? {};
  } catch {
    return {};
  }
}

function readStoredDraft(key, legacyDrafts = readLegacyDrafts()) {
  try {
    const raw = localStorage.getItem(draftKey(key));
    const value = raw === null ? legacyDrafts[key] : JSON.parse(raw);
    // An explicit null masks a legacy draft when the editor returns to starter code.
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

function readStoredDrafts() {
  const legacyDrafts = readLegacyDrafts();
  return Object.fromEntries(lessons.flatMap((lesson) => {
    const key = getLessonKey(lesson);
    const entry = tabJournal.get(key);
    const value = entry ? entry.value : readStoredDraft(key, legacyDrafts);
    return typeof value === "string" ? [[key, value]] : [];
  }));
}

function loadDraftJournal() {
  try {
    return readDraftJournal(sessionStorage, progressResetId, lessonKeys);
  } catch {
    return new Map();
  }
}

function persistDraftJournal() {
  try {
    journalSaved = writeDraftJournal(sessionStorage, progressResetId, tabJournal);
  } catch {
    journalSaved = false;
  }
}

function writeStoredDraftsNow() {
  if (!refreshStoredProgress()) return false;
  const legacyDrafts = readLegacyDrafts();
  const changed = [];
  for (const key of dirtyDrafts) {
    const entry = tabJournal.get(key);
    const lesson = lessons.find(lesson => getLessonKey(lesson) === key);
    try {
      const storedBeforeCopy = readStoredDraft(key, legacyDrafts) ?? null;
      if (storedBeforeCopy !== entry.value) {
        // Always write to this tab's own slot before touching the shared version.
        writeDraftCopy(localStorage, progressResetId, key, entry.branch, entry.value ?? lesson.starterCode ?? "");
      }
      const marker = localStorage.getItem(resetStorageKey);
      if (marker !== null && marker !== progressResetId) break;
      const previous = readStoredDraft(key, legacyDrafts) ?? null;
      if (previous === entry.value || previous === entry.base) {
        // A blank removal writes null to mask the legacy draft as well.
        localStorage.setItem(draftKey(key), JSON.stringify(entry.value));
        draftBases.set(key, entry.value);
        tabJournal.delete(key);
        if (previous !== entry.value) changed.push(key);
      }
      dirtyDrafts.delete(key);
    } catch {
      // Keep the unsaved edit in memory and allow a later retry.
    }
  }
  // A reset may have happened while the per-lesson write was in flight.
  if (!refreshStoredProgress()) return false;
  persistDraftJournal();
  if (dirtyDrafts.size === 0) lessonDrafts = readStoredDrafts();
  // A result belongs to the previously saved source, not to the new draft.
  if (changed.some((key) => Object.hasOwn(passedTestCaseIdsByLessonId, key))) {
    for (const key of changed) {
      const lesson = lessons.find(lesson => getLessonKey(lesson) === key);
      if (gradedSources[key] === (lessonDrafts[key] ?? lesson.starterCode ?? "")) continue;
      delete passedTestCaseIdsByLessonId[key];
      delete gradedSources[key];
    }
    writeStoredProgress();
  }
  renderPassedTestCases(getCurrentLesson());
  renderDraftRecovery();
  return true;
}

// Drafts change on every keystroke; debounce localStorage writes.
let draftWriteTimer = 0;
const dirtyDrafts = new Set(tabJournal.keys());

function writeStoredDrafts() {
  window.clearTimeout(draftWriteTimer);
  draftWriteTimer = window.setTimeout(() => {
    draftWriteTimer = 0;
    writeStoredDraftsNow();
  }, 300);
}

function flushDraftWrites() {
  if (dirtyDrafts.size === 0) return true;
  window.clearTimeout(draftWriteTimer);
  draftWriteTimer = 0;
  return writeStoredDraftsNow();
}

// Rebase each write on storage, never on a tab's startup snapshot.
function refreshStoredProgress(latest = readStoredProgress()) {
  if (!latest) return true;
  const completionChanged = completedLessons !== latest.completedLessons;
  completedLessons = latest.completedLessons;
  passedTestCaseIdsByLessonId = latest.passedTestCaseIdsByLessonId;
  gradedSources = latest.gradedSources;
  lastLessonId = latest.lastLessonId;
  if (latest.resetId !== progressResetId) {
    progressResetId = latest.resetId;
    cancelRun();
    discardPendingDraftWrites();
    draftBases.clear();
    tabJournal = loadDraftJournal();
    persistDraftJournal();
    lessonDrafts = readStoredDrafts();
    showProgressReset();
    return false;
  }
  if (completionChanged) {
    renderProgress();
    renderLevels();
  }
  return true;
}

function writeStoredProgress() {
  try {
    const resetId = localStorage.getItem(resetStorageKey);
    if (resetId !== null && resetId !== progressResetId) return;
    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        completedLessons,
        completedLessonIds: lessons.slice(0, completedLessons).map(getLessonKey),
        lastLessonId,
        passedTestCaseIdsByLessonId,
        gradedSources,
        resetId: progressResetId,
        updatedAt: new Date().toISOString()
      })
    );
  } catch {
    // Progress persistence is optional.
  }
}

function getCurrentLesson() {
  return lessons[currentLessonIndex] || lessons[0];
}

function getSelectedTestCase(lesson = getCurrentLesson()) {
  const testCases = getTestCases(lesson);
  const selectedId = selectedTestCaseIdByLessonId[getLessonKey(lesson)];
  return testCases.find((testCase) => testCase.id === selectedId) || testCases[0];
}

function getPassedIds(lesson = getCurrentLesson()) {
  const key = getLessonKey(lesson);
  if (Object.hasOwn(gradedSources, key) ? gradedSources[key] !== codeEditor.value : tabJournal.has(key)) return new Set();
  return new Set(passedTestCaseIdsByLessonId[key] || []);
}

function isLessonLocked(index) {
  return index > completedLessons;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineCode(value) {
  let escaped = escapeHtml(value);
  escaped = escaped.replace(/`([^`]+)`/g, '<span class="code-pill">$1</span>');
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong class="prose-bold">$1</strong>');
  return escaped;
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value), window.location.href);
    return url.protocol === "https:" ? escapeHtml(url.href) : "#";
  } catch {
    return "#";
  }
}

function renderMarkdown(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let unorderedList = [];
  let orderedList = [];
  let blockquote = [];
  let insideCodeBlock = false;
  let codeBlockContent = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${inlineCode(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const flushUnorderedList = () => {
    if (unorderedList.length > 0) {
      html.push(`<ul>${unorderedList.map((item) => `<li>${inlineCode(item)}</li>`).join("")}</ul>`);
      unorderedList = [];
    }
  };

  const flushOrderedList = () => {
    if (orderedList.length > 0) {
      html.push(`<ol>${orderedList.map((item) => `<li>${inlineCode(item)}</li>`).join("")}</ol>`);
      orderedList = [];
    }
  };

  const flushBlockquote = () => {
    if (blockquote.length > 0) {
      html.push(`<blockquote>${inlineCode(blockquote.join(" "))}</blockquote>`);
      blockquote = [];
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
    flushBlockquote();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (insideCodeBlock) {
      if (trimmed.startsWith("```")) {
        insideCodeBlock = false;
        html.push(`<pre><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`);
        codeBlockContent = [];
      } else {
        codeBlockContent.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushAll();
      insideCodeBlock = true;
      continue;
    }

    if (!trimmed) {
      flushAll();
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      const content = trimmed.slice(1).trim();
      blockquote.push(content);
      continue;
    }

    flushBlockquote();

    // Headings
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      const level = Math.max(2, heading[1].length);
      html.push(`<h${level}>${inlineCode(heading[2])}</h${level}>`);
      continue;
    }

    // Unordered List item
    const unorderedItem = trimmed.match(/^-\s+(.+)$/);
    if (unorderedItem) {
      flushParagraph();
      flushOrderedList();
      unorderedList.push(unorderedItem[1]);
      continue;
    }

    // Ordered List item
    const orderedItem = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      flushUnorderedList();
      orderedList.push(orderedItem[2]);
      continue;
    }

    flushUnorderedList();
    flushOrderedList();
    paragraph.push(trimmed);
  }

  flushAll();

  return html.join("");
}

function renderLevels() {
  let lessonNumber = 0;
  levelList.innerHTML = courseGroups
    .map(
      (group) => `
        <section class="level-group">
          <div class="level-group-title">${escapeHtml(group.title)}</div>
          ${group.lessons
            .map((lesson) => {
              const itemIndex = lessonNumber;
              lessonNumber += 1;
              const isCurrent = itemIndex === currentLessonIndex;
              const isCompleted = itemIndex < completedLessons;
              const isLocked = isLessonLocked(itemIndex);
              const statusTitle = isLocked ? "完成前一章后解锁" : isCompleted ? "已完成" : isCurrent ? "当前章节" : "已解锁";
              const ariaLabel = `${itemIndex + 1}. ${lesson.title}，${statusTitle}`;

              return `
                <button class="level-item ${isCurrent ? "is-active" : ""} ${isCompleted ? "is-completed" : ""} ${isLocked ? "is-locked" : ""}" type="button" data-lesson-index="${itemIndex}" title="${escapeHtml(lesson.title)} · ${statusTitle}" aria-label="${escapeHtml(ariaLabel)}" ${isCurrent ? 'aria-current="step"' : ""} ${isLocked ? 'disabled aria-disabled="true"' : 'aria-disabled="false"'}>
                  <span class="lesson-index">${String(itemIndex + 1).padStart(2, "0")}</span>
                  <span class="level-copy">
                    <strong>${escapeHtml(lesson.title)}</strong>
                    <span class="level-subtitle">${escapeHtml(lesson.difficulty)} · ${lesson.estimatedMinutes} 分钟</span>
                  </span>
                  <span class="lesson-status">${isCompleted ? "完成" : isLocked ? "锁定" : "解锁"}</span>
                </button>
              `;
            })
            .join("")}
        </section>
      `
    )
    .join("");
}

const questDefinitions = [
  { key: "modified", label: "动手修改初始代码" },
  { key: "first-pass", label: "通过第一个测试用例" },
  { key: "all-pass", label: "通过本章全部测试" }
];

function getQuestStates(lesson = getCurrentLesson()) {
  const testCases = getTestCases(lesson);
  const passedIds = getPassedIds(lesson);
  const passedCount = testCases.filter((testCase) => passedIds.has(testCase.id)).length;

  return {
    modified: codeEditor.value !== (lesson.starterCode || ""),
    "first-pass": passedIds.has(testCases[0]?.id),
    "all-pass": testCases.length > 0 && passedCount === testCases.length
  };
}

// Lightweight per-keystroke refresh: toggles classes on the existing quest
// nodes instead of rebuilding the whole lesson article.
function updateQuestChecklist(lesson = getCurrentLesson()) {
  const states = getQuestStates(lesson);
  document.querySelectorAll(".quest-item").forEach((item) => {
    const done = Boolean(states[item.dataset.quest]);
    item.classList.toggle("is-done", done);
    const mark = item.querySelector(".quest-mark");
    if (mark) mark.textContent = done ? "✓" : "";
  });
}

function renderLessonContent(lesson, displayIndex = currentLessonIndex) {
  const testCases = getTestCases(lesson);
  const passedCount = testCases.filter((testCase) => getPassedIds(lesson).has(testCase.id)).length;
  const sources = lesson.sources?.length ? lesson.sources : defaultSources;

  const goalsHtml = (lesson.goals || []).map((goal, index) => `
    <div class="stepper-item">
      <span class="stepper-num">0${index + 1}</span>
      <span class="stepper-text">${inlineCode(goal)}</span>
    </div>
  `).join("");

  const questStates = getQuestStates(lesson);
  const questsHtml = questDefinitions.map((quest) => `
    <div class="quest-item ${questStates[quest.key] ? "is-done" : ""}" data-quest="${quest.key}">
      <span class="quest-mark">${questStates[quest.key] ? "✓" : ""}</span>
      <span class="quest-label">${escapeHtml(quest.label)}</span>
    </div>
  `).join("");

  lessonArticle.innerHTML = `
    <div class="lesson-facts">
      <span class="fact-item">第 ${displayIndex + 1}/${totalLessons} 章</span>
      <span class="fact-item fact-difficulty difficulty-${lesson.difficulty === '基础' ? 'basic' : (lesson.difficulty === '进阶' ? 'medium' : 'hard')}">
        <span class="difficulty-dot"></span>${escapeHtml(lesson.difficulty)}
      </span>
      <span class="fact-item">${lesson.estimatedMinutes} 分钟</span>
      <span class="fact-item fact-status ${passedCount === testCases.length ? 'all-passed' : ''}" id="lessonTestStatus">
        ${passedCount}/${testCases.length} 测试通过
      </span>
    </div>
    <h1 tabindex="-1">${displayIndex + 1}. ${escapeHtml(lesson.title)}</h1>
    <a class="practice-jump" href="#practice">前往代码练习</a>
    <div class="prose">${renderMarkdown(lesson.tutorial || "")}</div>
    ${lesson.id === 31 ? `
      <div class="project-download">
        <a href="./downloads/python-todo-cli.zip" download>下载待办清单项目</a>
        <p>解压后用 Python 3.8 或更新版本运行。压缩包里有源码、运行说明和测试。</p>
      </div>
    ` : ""}
    <section class="lesson-goals" aria-label="学习目标">
      <h2>学习目标</h2>
      <div class="stepper-list">${goalsHtml}</div>
    </section>
    <section class="lesson-goals quest-panel" aria-label="实战进度">
      <h2>实战进度</h2>
      <div class="quest-list">${questsHtml}</div>
    </section>
    <div class="task-box">
      <span class="task-label">提示</span>
      <p>${inlineCode(lesson.hint || "先保证程序结构完整，再逐步补齐逻辑。")}</p>
    </div>
    <div class="source-box">
      ${sources
        .map((source) => `<a href="${safeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a>`)
        .join("")}
    </div>
  `;
}

function renderAnswerContent(lesson) {
  answerContent.innerHTML = `
    <p>${inlineCode(lesson.hint || "参考下面的写法完成当前章节。")}</p>
    <pre><code>${escapeHtml(lesson.answerCode || "")}</code></pre>
  `;
}

function renderTestCases(lesson = getCurrentLesson()) {
  const focusedId = testCaseList.contains(document.activeElement) ? document.activeElement.dataset.testCaseId : null;
  const caseDock = document.querySelector(".case-dock");
  const testCases = getTestCases(lesson);
  const selected = getSelectedTestCase(lesson);
  const passedIds = getPassedIds(lesson);
  const passedCount = testCases.filter((testCase) => passedIds.has(testCase.id)).length;
  stdinInput.placeholder = selected.stdin ? "每次 input() 读取一行" : "此用例无需输入";
  clearStdin.disabled = !stdinInput.value;

  const hasCustomCases = !!(lesson.testCases && lesson.testCases.length > 0);
  if (caseDock) {
    caseDock.style.display = hasCustomCases ? "" : "none";
  }

  testSummary.textContent = `${passedCount}/${testCases.length} 通过`;
  testCaseList.innerHTML = testCases
    .map((testCase) => {
      const isSelected = testCase.id === selected.id;
      const isPassed = passedIds.has(testCase.id);
      return `
        <button class="${isSelected ? "active" : ""} ${isPassed ? "is-passed" : ""}" type="button" data-test-case-id="${escapeHtml(testCase.id)}" aria-pressed="${isSelected ? "true" : "false"}">
          <span>${escapeHtml(testCase.title)}</span>
          ${isPassed ? "<span>✓</span>" : ""}
        </button>
      `;
    })
    .join("");
  if (focusedId) testCaseList.querySelector(`[data-test-case-id="${CSS.escape(focusedId)}"]`)?.focus({ preventScroll: true });
}

function highlightPython(code) {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Placeholders are wrapped in NUL bytes, which cannot be typed into the
  // textarea, so user code can never collide with them. The inner "_<n>_"
  // keeps the digits surrounded by word characters so the number highlighter
  // (which relies on \b) never matches inside a placeholder.
  const tokens = [];
  const stash = (markup) => {
    tokens.push(markup);
    return `\x00_${tokens.length - 1}_\x00`;
  };

  // Single lexical pass: strings and comments are matched together so a "#"
  // inside a string literal is never mistaken for a comment (and vice versa).
  // Alternation order: triple-quoted > single-line strings > comments.
  html = html.replace(
    /("""[\s\S]*?"""|'''[\s\S]*?'''|[fFrRbB]{0,2}"(?:\\.|[^"\\\n])*"|[fFrRbB]{0,2}'(?:\\.|[^'\\\n])*'|#.*)/g,
    (match) => {
      const cls = match.startsWith("#") ? "hl-comment" : "hl-string";
      return stash(`<span class="${cls}">${match}</span>`);
    }
  );

  // Decorators (line-leading @name) stashed before keyword scanning.
  html = html.replace(/^([ \t]*)(@[A-Za-z_][\w.]*)/gm, (match, indent, dec) =>
    indent + stash(`<span class="hl-decorator">${dec}</span>`)
  );

  // Keywords run before any class="" markup exists, so "class" cannot collide.
  const keywords = /\b(False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|match|case)\b/g;
  html = html.replace(keywords, '<span class="hl-keyword">$1</span>');

  // self / cls receive their own accent.
  html = html.replace(/\b(self|cls)\b/g, '<span class="hl-self">$1</span>');

  // Common builtins and types.
  const builtins = /\b(print|len|range|input|int|str|float|bool|list|dict|set|tuple|frozenset|bytes|sum|min|max|abs|sorted|enumerate|zip|map|filter|open|type|isinstance|issubclass|super|object|repr|round|format|reversed|any|all|next|iter|hasattr|getattr|setattr|divmod|pow|ord|chr)\b/g;
  html = html.replace(builtins, '<span class="hl-builtin">$1</span>');

  // Numbers (including 1_000_000-style separators).
  html = html.replace(/\b(\d[\d_]*(\.[\d_]+)?)\b/g, '<span class="hl-number">$1</span>');

  // Restore stashed tokens in one pass (function form avoids $-pattern issues).
  html = html.replace(/\x00_(\d+)_\x00/g, (_, index) => tokens[index]);

  return html;
}

function syncHighlight(textarea, highlightNode) {
  if (!highlightNode) return;
  // Keep the first and last blank lines measurable in the highlighted layer.
  highlightNode.innerHTML = `<span>${highlightPython(textarea.value)}\u200b</span>`;
}

function updateLineNumbers(textarea, lineNode) {
  if (!lineNode) return;
  const lines = Math.max(1, textarea.value.split("\n").length);
  lineNode.textContent = Array.from({ length: lines }, (_, index) => String(index + 1)).join("\n");
}

function syncLineScroll(textarea, lineNode, highlightNode) {
  if (lineNode) {
    lineNode.scrollTop = textarea.scrollTop;
  }
  if (!highlightNode) {
    const container = textarea.closest(".editor-container");
    highlightNode = container ? container.querySelector(".editor-highlight") : null;
  }
  if (highlightNode) {
    highlightNode.scrollTop = textarea.scrollTop;
    highlightNode.scrollLeft = textarea.scrollLeft;
  }
}

function syncEditorChrome(textarea, lineNode) {
  updateLineNumbers(textarea, lineNode);
  const container = textarea.closest(".editor-container");
  const highlightNode = container ? container.querySelector(".editor-highlight") : null;
  syncHighlight(textarea, highlightNode);
  syncLineScroll(textarea, lineNode, highlightNode);
}

function syncAnswerDrawerBounds() {
  if (!lessonColumn || !practiceColumn) return;

  const lessonRect = lessonColumn.getBoundingClientRect();
  const practiceRect = practiceColumn.getBoundingClientRect();
  const gridRect = document.querySelector(".study-grid").getBoundingClientRect();
  const left = Math.max(12, gridRect.left);
  const safeRight = Math.min(lessonRect.right, practiceRect.left - 8);
  const right = Math.max(12, window.innerWidth - safeRight);

  document.documentElement.style.setProperty("--answer-drawer-left", `${left}px`);
  document.documentElement.style.setProperty("--answer-drawer-right", `${right}px`);
}

function getDraftForLesson(lesson) {
  return lessonDrafts[getLessonKey(lesson)];
}

function saveCurrentDraft() {
  const lesson = getCurrentLesson();
  const key = getLessonKey(lesson);
  const starter = lesson.starterCode || "";
  const value = codeEditor.value;
  if (value === (getDraftForLesson(lesson) ?? starter)) return;
  showErrorLocation();

  if (value !== starter) {
    lessonDrafts[key] = value;
  } else {
    delete lessonDrafts[key];
  }

  tabJournal.set(key, { value: value === starter ? null : value, base: draftBases.get(key) ?? null, branch: draftBranch });
  persistDraftJournal();
  dirtyDrafts.add(key);
  writeStoredDrafts();
  if (Object.hasOwn(passedTestCaseIdsByLessonId, key)) {
    renderPassedTestCases(lesson);
  } else {
    updateQuestChecklist();
    updateResetButtonState();
  }
}

function renderDraftRecovery() {
  const lesson = getCurrentLesson();
  const key = getLessonKey(lesson);
  const current = codeEditor.value;
  const saved = readStoredDraft(key) ?? null;
  const entry = tabJournal.get(key);
  const savedCode = saved ?? lesson.starterCode ?? "";
  let copies = [];
  try {
    copies = readDraftCopies(localStorage, progressResetId, key);
  } catch {
    // The download link can still preserve the editor's current contents.
  }
  const changedElsewhere = saved !== (draftBases.get(key) ?? null) && savedCode !== current;
  recoverySources = changedElsewhere ? [{ label: "浏览器已保存版本", code: savedCode }] : [];
  const seen = new Set([current, savedCode]);
  for (const code of copies) {
    if (seen.has(code)) continue;
    seen.add(code);
    recoverySources.push({ label: `草稿副本 ${recoverySources.length + 1}`, code });
  }
  const hasVersions = recoverySources.length > 0;
  const unsaved = dirtyDrafts.has(key);
  draftRecovery.hidden = !hasVersions && !unsaved;
  draftVersions.hidden = restoreDraft.hidden = !hasVersions;
  draftVersions.replaceChildren(...recoverySources.map(({ label }, index) => new Option(label, String(index))));
  draftStatus.textContent = unsaved
    ? (journalSaved ? "草稿仅保存在此标签页，可下载备份。" : "草稿暂留在编辑器，请下载备份。")
    : changedElsewhere
      ? (entry ? "两个版本已分别保存。" : "另一标签页已更新草稿。")
      : hasVersions ? "有可恢复的草稿副本。" : "";
}

function hasSavedDrafts() {
  return tabJournal.size > 0 || Object.keys(lessonDrafts).length > 0;
}

function discardPendingDraftWrites() {
  // Cancel any pending debounced write so it cannot resurrect cleared drafts.
  window.clearTimeout(draftWriteTimer);
  draftWriteTimer = 0;
  dirtyDrafts.clear();
  draftStatus.textContent = "";
}

function clearDrafts(previousResetId) {
  lessonDrafts = {};
  discardPendingDraftWrites();
  draftBases.clear();
  tabJournal.clear();
  persistDraftJournal();
  try {
    localStorage.removeItem(legacyDraftStorageKey);
    for (const lesson of lessons) localStorage.removeItem(draftKey(getLessonKey(lesson), previousResetId));
    for (let count = 1; count <= totalLessons; count += 1) localStorage.removeItem(completionKey(count, previousResetId));
    for (const key of recoveryKeys(localStorage, previousResetId)) localStorage.removeItem(key);
  } catch {
    // Ignore storage failures; in-memory state is already cleared.
  }
  updateResetButtonState();
}

function showProgressReset() {
  if (focusModal.classList.contains("is-open")) closeFocus.click();
  selectedTestCaseIdByLessonId = {};
  renderProgress();
  loadLesson(0, false);
  consoleOutput.textContent = "已重置学习进度和草稿。";
  runMeta.textContent = "已重置";
  runMeta.className = "run-meta status-warn";
}

function renderProgress() {
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  progressText.textContent = `${completedLessons}/${totalLessons} 章`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  updateNextLessonAction();
  updateResetButtonState();
}

function updateResetButtonState() {
  const hasPassedTests = Object.values(passedTestCaseIdsByLessonId).some((ids) => Array.isArray(ids) && ids.length > 0);
  const canReset = completedLessons > 0 || hasSavedDrafts() || hasPassedTests;
  resetProgress.disabled = !canReset;
  resetProgress.setAttribute("aria-disabled", canReset ? "false" : "true");
}

function updateNextLessonAction() {
  const index = currentLessonIndex + 1;
  const lesson = lessons[index];
  const canOpen = Boolean(lesson) && !isLessonLocked(index);

  nextLessonButton.hidden = !canOpen;
  nextLessonButton.disabled = !canOpen;
  nextLessonButton.dataset.lessonIndex = canOpen ? String(index) : "";
  nextLessonButton.setAttribute("aria-hidden", canOpen ? "false" : "true");

  if (canOpen) {
    nextLessonButton.setAttribute("aria-label", `进入第 ${index + 1} 章：${lesson.title}`);
    nextLessonButton.title = `进入第 ${index + 1} 章`;
  } else {
    nextLessonButton.removeAttribute("aria-label");
    nextLessonButton.title = "";
  }
}

function loadLesson(index, remember = true) {
  if (remember && (!flushDraftWrites() || !refreshStoredProgress())) return;
  if (!lessons[index] || isLessonLocked(index)) return;
  cancelRun();
  showErrorLocation();
  if (remember && dirtyDrafts.size === 0) lessonDrafts = readStoredDrafts();

  currentLessonIndex = index;
  const lesson = getCurrentLesson();
  const selected = getSelectedTestCase(lesson);
  const draft = getDraftForLesson(lesson);
  const key = getLessonKey(lesson);
  const entry = tabJournal.get(key);
  draftBases.set(key, entry ? entry.base : readStoredDraft(key) ?? null);

  codeEditor.value = draft ?? lesson.starterCode ?? "";
  stdinInput.value = selected.stdin || "";
  syncEditorChrome(codeEditor, editorLines);

  renderLevels();
  renderLessonContent(lesson, index);
  lessonColumn.scrollTop = 0;
  renderAnswerContent(lesson);
  renderTestCases(lesson);
  renderDraftRecovery();
  consoleOutput.textContent = "";
  runMeta.textContent = draft !== undefined ? "草稿已恢复" : "等待运行";
  runMeta.className = "run-meta";
  setAnswerDrawer(false);
  updateNextLessonAction();
  syncAnswerDrawerBounds();
  updateResetButtonState();
  if (remember) {
    lastLessonId = getLessonKey(lesson);
    writeStoredProgress();
  }
}

function setAnswerDrawer(open) {
  if (open) syncAnswerDrawerBounds();
  else if (answerDrawer.contains(document.activeElement)) showAnswer.focus({ preventScroll: true });
  answerDrawer.inert = !open;
  answerDrawer.classList.toggle("is-open", open);
  answerDrawer.setAttribute("aria-hidden", open ? "false" : "true");
  showAnswer.classList.toggle("is-active", open);
  showAnswer.setAttribute("aria-expanded", String(open));
  showAnswer.innerHTML = open
    ? '<span class="button-glyph" aria-hidden="true">×</span> 隐藏答案'
    : '<span class="button-glyph" aria-hidden="true">?</span> 查看答案';
  if (open) closeAnswer.focus({ preventScroll: true });
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Theme persistence is optional (e.g. private browsing).
  }
  themeToggle.title = theme === "dark" ? "切换到浅色模式" : "切换到深色模式";
  themeToggle.setAttribute("aria-label", themeToggle.title);
  themeToggle.innerHTML = `<span class="button-glyph" aria-hidden="true">${theme === "dark" ? "☀" : "☾"}</span>`;
}

function formatTerminalBlock(value, emptyLabel = "(空内容)") {
  return value || emptyLabel;
}

function explainExecutionIssue(output) {
  const text = String(output || "").toLowerCase();
  if (!text.trim()) return "";
  if (text.includes("indentationerror") || text.includes("unexpected indent")) return "缩进不一致；Python 用缩进划分代码块，同一层请保持相同的空格数。";
  if (text.includes("taberror")) return "同一段代码混用了空格与制表符；统一改成 4 个空格缩进。";
  if (text.includes("syntaxerror")) return "语法有误；检查报错行附近是否漏了冒号 `:`、括号或引号。";
  if (text.includes("nameerror")) return "使用了未定义的名字；检查变量或函数拼写，确认已在使用前赋值。";
  if (text.includes("typeerror")) return "类型不匹配；例如字符串与数字直接运算，或函数参数个数不对，注意用 str()/int() 转换。";
  if (text.includes("valueerror")) return "值不合法；如 int('abc') 无法转换，或解包数量与变量不匹配。";
  if (text.includes("indexerror")) return "序列下标越界；检查索引是否超过 len()-1。";
  if (text.includes("keyerror")) return "字典中不存在该键；先判断 `key in d` 或用 dict.get()。";
  if (text.includes("attributeerror")) return "对象没有该属性或方法；检查拼写与对象类型。";
  if (text.includes("zerodivisionerror")) return "发生了除以 0；运算前先判断除数是否为 0。";
  if (text.includes("modulenotfounderror") || text.includes("importerror")) return "找不到要导入的模块；确认名称正确且为标准库。";
  if (text.includes("eoferror")) return "input() 读取时没有更多输入；提供足够的标准输入行，或减少读取次数。";
  if (text.includes("recursionerror") || text.includes("timeout") || text.includes("time limit")) return "递归过深或进入死循环；检查递归终止条件或循环退出条件。";
  return "请从第一条 Traceback 的错误类型开始处理，后续错误可能是连锁反应。";
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(value) {
  if (!value) return "";

  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return value;
  }
}

async function fetchJudge0Result(payload, signal) {
  const response = await fetch(judge0Endpoint + "?base64_encoded=true&wait=false", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify(payload)
  });
  if (response.status === 429) throw new Error("在线运行请求过多，请稍等片刻再试。");
  if (!response.ok) throw new Error("在线运行服务提交失败 (HTTP " + response.status + ")。");

  const submission = await response.json();
  // Some instances return an already completed result.
  if (Number.isInteger(submission.status?.id) && submission.status.id > 2) return submission;
  if (typeof submission.token !== "string" || !submission.token) {
    throw new Error("在线运行服务没有返回提交令牌。");
  }

  const resultUrl = judge0Endpoint + "/" + encodeURIComponent(submission.token) + "?base64_encoded=true";
  while (true) {
    await new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(signal.reason);
        return;
      }
      const abort = () => {
        window.clearTimeout(timer);
        reject(signal.reason);
      };
      const timer = window.setTimeout(() => {
        signal.removeEventListener("abort", abort);
        resolve();
      }, 500);
      signal.addEventListener("abort", abort, { once: true });
    });
    const result = await fetch(resultUrl, { signal, cache: "no-store" });
    if (result.status === 429) throw new Error("在线运行请求过多，请稍等片刻再试。");
    if (!result.ok) throw new Error("在线运行服务查询失败 (HTTP " + result.status + ")。");
    const data = await result.json();
    if (!Number.isInteger(data.status?.id) || data.status.id < 1) {
      throw new Error("在线运行服务返回了无效状态。");
    }
    if (data.status.id > 2) return data;
  }
}

async function executeWithJudge0(code, stdin, signal) {
  const data = await fetchJudge0Result({
    source_code: encodeBase64(code),
    language_id: python3LanguageId,
    stdin: encodeBase64(stdin)
  }, signal);

  const stdout = decodeBase64(data.stdout);
  const stderr = decodeBase64(data.stderr || data.message);
  const compileOutput = decodeBase64(data.compile_output);
  const statusId = data.status?.id ?? -1;
  if (statusId === 13 && data.status?.description === "Internal Error") {
    throw new Error("在线运行服务暂时出错，请稍后重试。");
  }

  return {
    status: ({ 3: "success", 5: "timeout", 6: "compile-error" })[statusId] ?? "judge0-error",
    stdout,
    stderr,
    compileOutput,
    exitCode: statusId === 3 ? 0 : statusId,
    statusDescription: data.status?.description || "Unknown",
    durationMs: Math.round(Number(data.time) * 1000) || 0
  };
}

async function executeLocally(code, stdin, signal) {
  const response = await fetch("api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ code, stdin })
  });
  const result = await response.json().catch(error => {
    if (error instanceof SyntaxError) throw new Error(`本地运行服务返回了无法读取的结果（HTTP ${response.status}）。`);
    throw error;
  });
  if (typeof result?.status !== "string") {
    throw new Error(`本地运行服务响应异常 (${response.status})`);
  }
  const preview = result.status === "learning-preview" || result.status === "preview-limited";
  return {
    status: result.status,
    stdout: result.stdout || "",
    stderr: preview
      ? `${result.stderr || ""}\n安装 Python 或选择「在线 Judge0」后可提交验证。`.trim()
      : result.stderr || "",
    compileOutput: result.compileOutput || "",
    durationMs: result.durationMs || 0
  };
}

async function executeCode(code, stdin, run) {
  const online = run.mode === "online";
  const controller = new AbortController();
  const abort = () => controller.abort();
  run.controller.signal.addEventListener("abort", abort, { once: true });
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, online ? 45_000 : 15_000);

  try {
    return await (online ? executeWithJudge0 : executeLocally)(code, stdin, controller.signal);
  } catch (error) {
    if (timedOut) throw new Error(`${online ? "在线" : "本地"}运行请求超时，请稍后重试。`);
    if (online && error instanceof TypeError) throw new Error("无法连接在线运行服务，请检查网络后重试。");
    if (!online && error instanceof TypeError && !run.controller.signal.aborted) {
      throw new Error("无法连接本地运行服务。请启动 npm start，或手动选择「在线 Judge0」。");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    run.controller.signal.removeEventListener("abort", abort);
  }
}

function renderRunResult(result) {
  const labels = {
    success: "运行成功", "runtime-error": "运行错误", "compile-error": "语法或编译错误",
    "judge0-error": "运行错误", timeout: "运行超时", "output-limit": "输出过多",
    "learning-preview": "仅预览", "preview-limited": "仅预览", "server-error": "运行服务出错"
  };
  const combinedOutput = [result.compileOutput, result.stdout, result.stderr].filter(Boolean).join("\n");
  consoleOutput.textContent = combinedOutput || "程序运行完成，但没有输出。";
  runMeta.textContent = `${labels[result.status] ?? "无法运行"} · ${result.durationMs || 0}ms`;
  runMeta.className =
    result.status === "success"
      ? "run-meta status-success"
      : result.status === "learning-preview" || result.status === "preview-limited"
        ? "run-meta status-warn"
        : "run-meta status-error";
}

function showErrorLocation(output = "") {
  const line = tracebackLine(output, codeEditor.value.split("\n").length);
  for (const button of errorButtons) {
    button.hidden = line === undefined;
    button.dataset.line = line ?? "";
    button.textContent = line === undefined ? "" : `跳到第 ${line} 行`;
  }
}

function updatePassedTestCases(lesson, source, testCaseIds) {
  const key = getLessonKey(lesson);
  const passedIds = new Set(testCaseIds);
  if (passedIds.size > 0) {
    passedTestCaseIdsByLessonId[key] = Array.from(passedIds);
    gradedSources[key] = source;
  } else {
    delete passedTestCaseIdsByLessonId[key];
    delete gradedSources[key];
  }
  writeStoredProgress();
  renderPassedTestCases(lesson);
}

function renderPassedTestCases(lesson) {
  const passedIds = getPassedIds(lesson);
  renderTestCases(lesson);
  const count = getTestCases(lesson).length;
  const status = document.querySelector("#lessonTestStatus");
  status.textContent = `${passedIds.size}/${count} 测试通过`;
  status.classList.toggle("all-passed", passedIds.size === count);
  updateQuestChecklist(lesson);
  updateResetButtonState();
}

function syncFocusOutput() {
  if (!focusModal.classList.contains("is-open")) return;
  focusOutput.textContent = consoleOutput.textContent;
  focusRunMeta.textContent = runMeta.textContent;
  focusRunMeta.className = runMeta.className.replace("run-meta", "").trim();
}

function setRunControls(running) {
  document.querySelectorAll("#runCode, #submitTask, #focusRun, #runnerMode").forEach((control) => {
    control.disabled = running;
  });
  clearConsole.textContent = running ? "停止运行" : "清空";
  clearConsole.setAttribute("aria-label", running ? "停止运行" : "清空控制台");
  focusStop.hidden = !running;
}

function startRun() {
  if (activeRun || !refreshStoredProgress()) return null;
  saveCurrentDraft();
  if (!flushDraftWrites()) return null;
  showErrorLocation();
  activeRun = {
    controller: new AbortController(), mode: runnerMode.value,
    savedDraft: readStoredDraft(getLessonKey(getCurrentLesson())),
    isolatedDraft: tabJournal.has(getLessonKey(getCurrentLesson()))
  };
  setRunControls(true);
  return activeRun;
}

function matchesSavedSource(run, lesson, source) {
  const saved = readStoredDraft(getLessonKey(lesson));
  if (saved !== run.savedDraft) return false;
  return run.isolatedDraft || source === (saved ?? lesson.starterCode ?? "").replace(/\r\n?/g, "\n");
}

function finishRun(run) {
  if (run !== activeRun) return;
  activeRun = null;
  setRunControls(false);
}

function cancelRun() {
  if (!activeRun) return;
  const run = activeRun;
  finishRun(run);
  run.controller.abort();
}

async function runCode() {
  const run = startRun();
  if (!run) return null;
  consoleOutput.textContent = "正在运行 Python 代码...";
  runMeta.textContent = "运行中";
  runMeta.className = "run-meta";
  syncFocusOutput();

  const lesson = getCurrentLesson();
  const selected = getSelectedTestCase(lesson);
  const code = codeEditor.value;
  const stdin = stdinInput.value;

  try {
    const result = await executeCode(code, stdin, run);
    if (activeRun !== run || !refreshStoredProgress()) return null;
    renderRunResult(result);
    const editedHere = code !== codeEditor.value;
    if (editedHere || !matchesSavedSource(run, lesson, code)) {
      consoleOutput.textContent += editedHere
        ? "\n[代码已修改，此次结果未计入当前草稿]"
        : "\n[本章草稿已在其他页面更新，请重新打开本章后再运行]";
      runMeta.textContent = "草稿已改变";
      runMeta.className = "run-meta status-warn";
      return result;
    }

    const canCompare = stdin === (selected.stdin || "").replace(/\r\n?/g, "\n");
    const passedIds = getPassedIds(lesson);
    if (result.status === "success" && canCompare) {
      const check = checkOutput(result.stdout, selected.expectedOutput);
      if (check.passed) {
        passedIds.add(selected.id);
        consoleOutput.textContent += `\n[测试用例通过: ${selected.title}]`;
      } else {
        passedIds.delete(selected.id);
        consoleOutput.textContent += `\n[输出未匹配预期]\n预期输出:\n${formatTerminalBlock(selected.expectedOutput, "(空输出)")}\n实际输出:\n${formatTerminalBlock(result.stdout, "(空输出)")}\n[排查提示]: ${check.detail}\n[本章提示]: ${lesson.hint}`;
        runMeta.textContent = "输出不匹配";
        runMeta.className = "run-meta status-warn";
      }
      updatePassedTestCases(lesson, code, passedIds);
    } else if (result.status === "success") {
      consoleOutput.textContent += `\n[本次运行使用了自定义输入，未计入测试用例完成]\n测试用例输入应为:\n${formatTerminalBlock(selected.stdin, "(无标准输入)")}`;
      runMeta.textContent = "自定义输入";
      runMeta.className = "run-meta status-warn";
    } else if (result.status !== "learning-preview" && result.status !== "preview-limited") {
      const diagnostics = [result.compileOutput, result.stderr].filter(Boolean).join("\n");
      showErrorLocation(diagnostics);
      const explanation = explainExecutionIssue(diagnostics || result.statusDescription || result.status);
      if (explanation) consoleOutput.textContent += `\n[错误提示]: ${explanation}\n[本章提示]: ${lesson.hint}`;
      if (canCompare && passedIds.delete(selected.id)) updatePassedTestCases(lesson, code, passedIds);
    }

    return result;
  } catch (error) {
    if (activeRun !== run) return null;
    const message = error instanceof Error ? error.message : String(error);
    consoleOutput.textContent = `[执行错误]: ${message}`;
    runMeta.textContent = "运行中断";
    runMeta.className = "run-meta status-error";
    return null;
  } finally {
    if (activeRun === run) syncFocusOutput();
    finishRun(run);
  }
}

async function runAllTests() {
  const run = startRun();
  if (!run) return false;

  const lesson = getCurrentLesson();
  const lessonIndex = currentLessonIndex;
  const testCases = getTestCases(lesson);
  const sourceCode = codeEditor.value;
  const passedThisRun = [];
  const lines = [`[运行本章全部测试: ${testCases.length} 个用例]`];
  let stoppedEarly = false;
  let diagnostics = "";

  consoleOutput.textContent = lines.join("\n");
  runMeta.textContent = "运行中";
  runMeta.className = "run-meta";

  try {
    for (let index = 0; index < testCases.length; index += 1) {
      const testCase = testCases[index];
      lines.push("", `[${index + 1}/${testCases.length}] ${testCase.title}`);
      consoleOutput.textContent = lines.join("\n");
      syncFocusOutput();

      const result = await executeCode(sourceCode, testCase.stdin || "", run);
      if (activeRun !== run) return false;
      if (sourceCode !== codeEditor.value) {
        consoleOutput.textContent += "\n[代码已修改，请重新提交当前草稿]";
        runMeta.textContent = "草稿已改变";
        runMeta.className = "run-meta status-warn";
        return false;
      }

      if (result.compileOutput) lines.push("[编译输出]", result.compileOutput);
      if (result.stderr) lines.push("[运行输出]", result.stderr);

      if (result.status !== "success") {
        diagnostics = [result.compileOutput, result.stderr].filter(Boolean).join("\n");
        const explanation = explainExecutionIssue(diagnostics || result.statusDescription || result.status);
        lines.push(`[状态]: ${result.statusDescription || result.status}`);
        if (explanation) lines.push(`[错误提示]: ${explanation}`);
        lines.push(`[本章提示]: ${lesson.hint}`);
        stoppedEarly = true;
        break;
      }

      const check = checkOutput(result.stdout, testCase.expectedOutput);
      if (check.passed) {
        passedThisRun.push(testCase.id);
        lines.push(`[通过] ${testCase.title}`);
      } else {
        lines.push(
          `[未通过] ${testCase.title}`,
          `预期输出:\n${formatTerminalBlock(testCase.expectedOutput, "(空输出)")}`,
          `实际输出:\n${formatTerminalBlock(result.stdout, "(空输出)")}`,
          `[排查提示]: ${check.detail}`,
          `[本章提示]: ${lesson.hint}`
        );
      }
    }

    if (!refreshStoredProgress()) return false;
    if (!matchesSavedSource(run, lesson, sourceCode)) {
      consoleOutput.textContent += "\n[本章草稿已在其他页面更新，请重新打开本章后再提交]";
      runMeta.textContent = "草稿已改变";
      runMeta.className = "run-meta status-warn";
      return false;
    }
    showErrorLocation(diagnostics);
    const allPassed = passedThisRun.length === testCases.length;
    const previousCompleted = completedLessons;
    if (allPassed) {
      completedLessons = Math.max(completedLessons, lessonIndex + 1);
      if (completedLessons > previousCompleted) {
        try {
          localStorage.setItem(completionKey(completedLessons), "1");
        } catch {
          // Progress is still usable in this tab.
        }
      }
    }
    lines.push("", `[全测完成: 本次 ${passedThisRun.length}/${testCases.length} 通过]`);
    updatePassedTestCases(lesson, sourceCode, passedThisRun);

    if (allPassed) {
      lines.push("[本章全部测试通过]");
      if (completedLessons > previousCompleted) {
        renderProgress();
        renderLevels();
        if (lessons[completedLessons]) lines.push(`已解锁第 ${completedLessons + 1} 章 · ${lessons[completedLessons].title}`);
      }
      if (lessonIndex === totalLessons - 1) lines.push(`${totalLessons} 章已全部完成。`);
      runMeta.textContent = "本章已通过";
      runMeta.className = "run-meta status-success";
    } else {
      if (stoppedEarly) lines.push("[已提前停止，请先处理上面的运行错误]");
      runMeta.textContent = "本章仍有未通过用例";
      runMeta.className = "run-meta status-warn";
    }

    consoleOutput.textContent = lines.join("\n");
    return allPassed;
  } catch (error) {
    if (activeRun !== run || !refreshStoredProgress()) return false;
    const message = error instanceof Error ? error.message : String(error);
    lines.push(`[执行错误]: ${message}`);
    consoleOutput.textContent = lines.join("\n");
    runMeta.textContent = "检查中断";
    runMeta.className = "run-meta status-error";
    return false;
  } finally {
    if (activeRun === run) syncFocusOutput();
    finishRun(run);
  }
}

// Replace [start, end) with `value`, preferring execCommand so the browser
// keeps the textarea's native undo/redo history. Falls back to a direct value
// assignment (which drops undo history) when execCommand is unavailable.
function replaceRange(textarea, start, end, value) {
  textarea.focus();
  textarea.setSelectionRange(start, end);

  let handled = false;
  try {
    handled = value
      ? document.execCommand("insertText", false, value)
      : document.execCommand("delete", false);
  } catch {
    handled = false;
  }

  if (!handled) {
    textarea.value = `${textarea.value.slice(0, start)}${value}${textarea.value.slice(end)}`;
    textarea.setSelectionRange(start + value.length, start + value.length);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function replaceSelection(textarea, value) {
  replaceRange(textarea, textarea.selectionStart, textarea.selectionEnd, value);
}

function indentSelection(textarea, outdent) {
  const { value, selectionStart: start, selectionEnd: end, selectionDirection } = textarea;
  if (!outdent && start === end) {
    replaceSelection(textarea, "    ");
    return;
  }

  const lineStart = start === 0 ? 0 : value.lastIndexOf("\n", start - 1) + 1;
  // A selection ending at column zero doesn't include that row.
  const lastOffset = end > start ? end - 1 : end;
  const nextBreak = value.indexOf("\n", lastOffset);
  const lineEnd = nextBreak < 0 ? value.length : nextBreak;
  const block = value.slice(lineStart, lineEnd);
  let newStart = start;
  let newEnd = end;
  const prefix = outdent ? /^(?: {1,4}|\t)/gm : /^/gm;
  const updated = block.replace(prefix, (removed, offset) => {
    const at = lineStart + offset;
    if (outdent) {
      newStart -= Math.min(removed.length, Math.max(0, start - at));
      newEnd -= Math.min(removed.length, Math.max(0, end - at));
      return "";
    }
    if (start > at) newStart += 4;
    newEnd += 4;
    return "    ";
  });
  if (updated === block) return;
  replaceRange(textarea, lineStart, lineEnd, updated);
  textarea.setSelectionRange(newStart, newEnd, selectionDirection);
}

function autoIndentLine(textarea) {
  const start = textarea.selectionStart;
  const value = textarea.value;
  const lineStart = start === 0 ? 0 : value.lastIndexOf("\n", start - 1) + 1;
  const currentLine = value.slice(lineStart, start);
  const baseIndent = currentLine.match(/^\s*/)?.[0] || "";
  // Python opens a new block after a line ending in ":".
  const extraIndent = currentLine.trimEnd().endsWith(":") ? "    " : "";
  replaceSelection(textarea, `\n${baseIndent}${extraIndent}`);
}

function bindEditorShortcuts(textarea, runAction) {
  let tabMovesFocus = false;
  textarea.addEventListener("blur", () => { tabMovesFocus = false; });
  textarea.addEventListener("keydown", (event) => {
    // Never intercept keys while an IME is composing (e.g. typing Chinese
    // comments): Enter/Tab confirm the candidate instead of editing code.
    if (event.isComposing || event.keyCode === 229) return;

    if (event.key === "Escape" && !focusModal.classList.contains("is-open")) {
      tabMovesFocus = true;
      return;
    }
    if (event.key === "Tab") {
      if (tabMovesFocus) {
        tabMovesFocus = false;
        return;
      }
      event.preventDefault();
      indentSelection(textarea, event.shiftKey);
      return;
    }

    if (event.key !== "Shift") tabMovesFocus = false;
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runAction();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      autoIndentLine(textarea);
    }
  });
}

function bindEditorChrome(textarea, lineNode) {
  const container = textarea.parentElement;
  const highlight = container.querySelector(".editor-highlight");
  syncEditorChrome(textarea, lineNode);
  textarea.addEventListener("input", () => syncEditorChrome(textarea, lineNode));
  const syncScroll = () => syncLineScroll(textarea, lineNode, highlight);
  textarea.addEventListener("scroll", syncScroll);
  textarea.addEventListener("compositionstart", () => container.classList.add("is-composing"));
  textarea.addEventListener("compositionend", () => {
    container.classList.remove("is-composing");
    syncEditorChrome(textarea, lineNode);
  });
  if (typeof ResizeObserver === "function") new ResizeObserver(syncScroll).observe(textarea);
  EditorCaret.attach(textarea, highlight);
}

function moveTextSurface(textarea, surface, parent, before = null) {
  const { selectionStart, selectionEnd, selectionDirection, scrollTop, scrollLeft } = textarea;
  if (typeof parent.moveBefore === "function") parent.moveBefore(surface, before);
  else parent.insertBefore(surface, before);
  textarea.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  textarea.scrollTop = scrollTop;
  textarea.scrollLeft = scrollLeft;
}

function bindEvents() {
  toggleChapters.addEventListener("click", () => {
    const expanded = toggleChapters.getAttribute("aria-expanded") !== "true";
    toggleChapters.setAttribute("aria-expanded", String(expanded));
    if (expanded) {
      levelList.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
    }
  });
  levelList.addEventListener("click", (event) => {
    const item = event.target.closest(".level-item");
    if (!item) return;
    const lessonIndex = Number(item.dataset.lessonIndex || 0);
    if (item.disabled || isLessonLocked(lessonIndex)) return;
    loadLesson(lessonIndex);
    if (toggleChapters.offsetWidth) {
      toggleChapters.setAttribute("aria-expanded", "false");
    }
    lessonArticle.querySelector("h1").focus();
  });

  testCaseList.addEventListener("click", (event) => {
    const item = event.target.closest("button[data-test-case-id]");
    if (!item) return;
    const lesson = getCurrentLesson();
    const testCase = getTestCases(lesson).find((candidate) => candidate.id === item.dataset.testCaseId);
    if (!testCase) return;

    selectedTestCaseIdByLessonId[getLessonKey(lesson)] = testCase.id;
    stdinInput.value = testCase.stdin || "";
    renderTestCases(lesson);
  });

  mainRunButton.addEventListener("click", () => runCode());
  document.querySelector("#submitTask").addEventListener("click", runAllTests);

  codeEditor.addEventListener("input", saveCurrentDraft);
  restoreDraft.addEventListener("click", () => {
    const version = recoverySources[Number(draftVersions.value)];
    const key = getLessonKey(getCurrentLesson());
    if (!version || !flushDraftWrites() || dirtyDrafts.has(key)) return;
    draftBases.set(key, readStoredDraft(key) ?? null);
    draftBranch = newStorageId();
    replaceRange(codeEditor, 0, codeEditor.value.length, version.code);
    flushDraftWrites();
  });
  downloadDraft.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([codeEditor.value], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `lesson-${getLessonKey(getCurrentLesson())}.py`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  });

  focusCode.addEventListener("click", () => {
    saveCurrentDraft();
    setAnswerDrawer(false);
    focusModal.classList.add("is-open");
    focusModal.setAttribute("aria-hidden", "false");
    moveTextSurface(codeEditor, codeSurface, focusBody, focusIo);
    moveTextSurface(stdinInput, stdinSurface, focusInputPanel);
    syncLineScroll(codeEditor, editorLines);
    trainingApp.inert = true;
    syncFocusOutput();
    codeEditor.focus({ preventScroll: true });
  });

  closeFocus.addEventListener("click", () => {
    trainingApp.inert = false;
    moveTextSurface(codeEditor, codeSurface, editorPanel);
    moveTextSurface(stdinInput, stdinSurface, inputPanel);
    syncLineScroll(codeEditor, editorLines);
    focusCode.focus();
    focusModal.classList.remove("is-open");
    focusModal.setAttribute("aria-hidden", "true");
  });

  focusRunButton.addEventListener("click", runCode);
  focusStop.addEventListener("click", () => {
    clearConsole.click();
    focusRunButton.focus();
  });

  bindEditorShortcuts(codeEditor, runCode);
  bindEditorChrome(codeEditor, editorLines);
  EditorCaret.attach(stdinInput, stdinSurface.querySelector(".stdin-mirror"), { mirrorValue: true });

  focusModal.addEventListener("click", (event) => {
    if (event.target === focusModal) closeFocus.click();
  });
  focusModal.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || event.defaultPrevented) return;
    const firstControl = activeRun ? focusStop : focusRunButton;
    const lastControl = errorButtons[1].hidden ? stdinInput : errorButtons[1];
    if (event.shiftKey && document.activeElement === firstControl) {
      event.preventDefault();
      lastControl.focus();
    } else if (!event.shiftKey && document.activeElement === lastControl) {
      event.preventDefault();
      firstControl.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key === "F6" && (event.target === codeEditor || event.target === stdinInput)) {
      event.preventDefault();
      (event.target === codeEditor ? stdinInput : codeEditor).focus();
      return;
    }
    // Ctrl/Cmd+S: muscle memory for "save" — persist the draft right away
    // instead of opening the browser's save-page dialog.
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveCurrentDraft();
      flushDraftWrites();
      return;
    }

    if (event.key !== "Escape") return;
    if (focusModal.classList.contains("is-open")) {
      closeFocus.click();
    } else if (answerDrawer.classList.contains("is-open")) {
      setAnswerDrawer(false);
    }
  });

  showAnswer.addEventListener("click", () => {
    setAnswerDrawer(!answerDrawer.classList.contains("is-open"));
  });
  closeAnswer.addEventListener("click", () => {
    setAnswerDrawer(false);
  });

  clearConsole.addEventListener("click", () => {
    const stopped = Boolean(activeRun);
    cancelRun();
    showErrorLocation();
    consoleOutput.textContent = stopped ? "已停止本次检查。" : "";
    runMeta.textContent = stopped ? "已停止" : "已清空";
    runMeta.className = "run-meta";
    syncFocusOutput();
  });

  for (const button of errorButtons) button.addEventListener("click", () => {
    const line = Number(button.dataset.line);
    const lines = codeEditor.value.split("\n");
    if (!line || line > lines.length) return;
    const start = lines.slice(0, line - 1).reduce((length, text) => length + text.length + 1, 0);
    codeEditor.focus();
    codeEditor.setSelectionRange(start, start + lines[line - 1].length);
    const lineHeight = parseFloat(getComputedStyle(codeEditor).lineHeight);
    codeEditor.scrollTop = Math.max(0, (line - 2) * lineHeight);
  });

  stdinInput.addEventListener("input", () => { clearStdin.disabled = !stdinInput.value; });
  clearStdin.addEventListener("click", () => {
    stdinInput.value = "";
    clearStdin.disabled = true;
    stdinInput.focus();
  });

  nextLessonButton.addEventListener("click", () => {
    const lessonIndex = Number(nextLessonButton.dataset.lessonIndex || -1);
    if (Number.isInteger(lessonIndex) && lessonIndex >= 0 && !isLessonLocked(lessonIndex)) {
      loadLesson(lessonIndex);
      lessonArticle.querySelector("h1").focus();
    }
  });

  resetProgress.addEventListener("click", () => {
    if (resetProgress.disabled || !window.confirm("确认重置学习进度和草稿？")) return;
    const previousResetId = readStoredProgress()?.resetId ?? progressResetId;
    const nextEpoch = newStorageId();
    try {
      localStorage.setItem(resetStorageKey, nextEpoch);
    } catch {
      draftStatus.textContent = "浏览器未能保存此次重置。";
      return;
    }
    cancelRun();
    progressResetId = nextEpoch;
    passedTestCaseIdsByLessonId = {};
    gradedSources = {};
    completedLessons = 0;
    lastLessonId = "";
    clearDrafts(previousResetId);
    writeStoredProgress();
    showProgressReset();
  });

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
    syncAnswerDrawerBounds();
  });

  window.addEventListener("resize", syncAnswerDrawerBounds);
  window.addEventListener("storage", (event) => {
    const key = getLessonKey(getCurrentLesson());
    if (event.key && (event.key === draftKey(key) || isDraftCopy(event.key, progressResetId, key))) {
      renderDraftRecovery();
      return;
    }
    const completedHere = event.key?.startsWith(completionKey(""));
    if (!completedHere && event.key !== progressStorageKey && event.key !== resetStorageKey && event.key !== null) return;
    const latest = readStoredProgress();
    if (latest && refreshStoredProgress(latest)) {
      if (!activeRun) renderPassedTestCases(getCurrentLesson());
      renderDraftRecovery();
    }
  });
  // Persist any pending debounced draft before the page unloads or is hidden.
  window.addEventListener("pagehide", flushDraftWrites);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushDraftWrites();
  });
}

function boot() {
  if (totalLessons === 0) {
    lessonArticle.innerHTML = "<h1>课程资源没有加载</h1><p>请确认 course-data.js 已随页面发布。</p>";
    return;
  }

  completedLessons = normalizeCompletedCount(completedLessons);
  setTheme(readStoredTheme());
  runnerMode.options[0].disabled = !localRunnerAvailable;
  runnerMode.value = localRunnerAvailable ? "local" : "online";
  renderProgress();
  const savedIndex = lessons.findIndex((lesson) => getLessonKey(lesson) === storedProgress.lastLessonId);
  loadLesson(savedIndex >= 0 && !isLessonLocked(savedIndex) ? savedIndex : 0, false);
  bindEvents();
  if (dirtyDrafts.size) writeStoredDrafts();
  syncAnswerDrawerBounds();
}

document.addEventListener("DOMContentLoaded", boot);
