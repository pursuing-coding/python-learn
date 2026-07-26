const lessons = Array.isArray(window.PY_LESSONS) ? window.PY_LESSONS : [];
const totalLessons = lessons.length;
const groupDefinitions = [
  { title: "Level 1: 语言基础 (Foundation)", start: 0, end: 4 },
  { title: "Level 2: 核心数据结构 (Core)", start: 4, end: 8 },
  { title: "Level 3: 工程实战 (Practice)", start: 8, end: 13 }
];
const courseGroups = groupDefinitions
  .map((group) => ({ ...group, lessons: lessons.slice(group.start, group.end) }))
  .filter((group) => group.lessons.length > 0);

const progressStorageKey = "python-learn-progress-v2";
const draftStorageKey = "python-learn-drafts-v2";
const themeStorageKey = "python-learn-theme";
const legacyStateStorageKey = "python-learn-state-v1";
const maxDraftLength = 30_000;
const judge0Endpoint = "https://ce.judge0.com/submissions?base64_encoded=true&wait=true";
const python3LanguageId = 71;
const executionTimeoutMs = 45_000;
const defaultSources = [
  { title: "Python 官方教程", url: "https://docs.python.org/zh-cn/3/tutorial/index.html" },
  { title: "Python 标准库参考", url: "https://docs.python.org/zh-cn/3/library/index.html" }
];

const levelList = document.querySelector("#levelList");
const lessonArticle = document.querySelector("#lessonArticle");
const lessonColumn = document.querySelector(".lesson-column");
const practiceColumn = document.querySelector(".practice-column");
const codeEditor = document.querySelector("#codeEditor");
const editorLines = document.querySelector("#editorLines");
const stdinInput = document.querySelector("#stdinInput");
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
const focusEditor = document.querySelector("#focusEditor");
const focusLines = document.querySelector("#focusLines");
const focusStdinInput = document.querySelector("#focusStdinInput");
const focusOutput = document.querySelector("#focusOutput");
const focusRunMeta = document.querySelector("#focusRunMeta");
const nextLessonButton = document.querySelector("#nextLesson");
const testCaseList = document.querySelector("#testCaseList");
const testSummary = document.querySelector("#testSummary");

let storedProgress = readStoredProgress();
let completedLessons = storedProgress.completedLessons;
let passedTestCaseIdsByLessonId = storedProgress.passedTestCaseIdsByLessonId;
let lessonDrafts = readStoredDrafts();
let selectedTestCaseIdByLessonId = {};
let currentLessonIndex = 0;
let hasLoadedLesson = false;
let isRunning = false;

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
          expectedOutput: lesson.expectedOutput || ""
        }
      ];
}

function normalizeCompletedCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(totalLessons, Math.floor(numeric)));
}

function readLegacyState() {
  try {
    const raw = localStorage.getItem(legacyStateStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function readStoredProgress() {
  try {
    const raw = localStorage.getItem(progressStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const completedIds = Array.isArray(parsed.completedLessonIds)
        ? new Set(parsed.completedLessonIds.map(String))
        : new Set();
      let completedCount = 0;

      while (completedCount < lessons.length && completedIds.has(getLessonKey(lessons[completedCount]))) {
        completedCount += 1;
      }

      return {
        completedLessons: normalizeCompletedCount(
          completedIds.size > 0 ? completedCount : parsed.completedLessons
        ),
        passedTestCaseIdsByLessonId:
          parsed.passedTestCaseIdsByLessonId && typeof parsed.passedTestCaseIdsByLessonId === "object"
            ? normalizePassedMap(parsed.passedTestCaseIdsByLessonId)
            : {}
      };
    }

    const legacy = readLegacyState();
    if (Array.isArray(legacy.completedChapterIds)) {
      let completedCount = 0;
      const completedIds = new Set(legacy.completedChapterIds.map(Number));
      while (completedCount < lessons.length && completedIds.has(lessons[completedCount].id)) {
        completedCount += 1;
      }

      return {
        completedLessons: normalizeCompletedCount(completedCount),
        passedTestCaseIdsByLessonId:
          legacy.passedTestCaseIdsByChapter && typeof legacy.passedTestCaseIdsByChapter === "object"
            ? normalizePassedMap(legacy.passedTestCaseIdsByChapter)
            : {}
      };
    }
  } catch {
    // Ignore invalid localStorage payloads.
  }

  return { completedLessons: 0, passedTestCaseIdsByLessonId: {} };
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
    map[key] = rawIds.map(String).filter((id) => validIds.has(id));
  }

  return map;
}

function readStoredTheme() {
  try {
    const theme = localStorage.getItem(themeStorageKey);
    if (theme === "light" || theme === "dark") return theme;

    const legacy = readLegacyState();
    return legacy.theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function readStoredDrafts() {
  try {
    const raw = localStorage.getItem(draftStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const drafts = parsed?.drafts && typeof parsed.drafts === "object" ? parsed.drafts : {};
      return Object.fromEntries(
        Object.entries(drafts)
          .filter(([lessonId, code]) => typeof lessonId === "string" && typeof code === "string")
          .map(([lessonId, code]) => [lessonId, code.slice(0, maxDraftLength)])
      );
    }

    const legacy = readLegacyState();
    const codeByChapter = legacy.codeByChapter && typeof legacy.codeByChapter === "object" ? legacy.codeByChapter : {};
    return Object.fromEntries(
      Object.entries(codeByChapter)
        .filter(([lessonId, code]) => typeof lessonId === "string" && typeof code === "string")
        .map(([lessonId, code]) => [lessonId, code.slice(0, maxDraftLength)])
    );
  } catch {
    return {};
  }
}

function writeStoredDrafts() {
  try {
    localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        drafts: lessonDrafts,
        updatedAt: new Date().toISOString()
      })
    );
  } catch {
    // localStorage can be disabled or full. The editor stays usable.
  }
}

function writeStoredProgress() {
  try {
    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        completedLessons,
        completedLessonIds: lessons.slice(0, completedLessons).map(getLessonKey),
        passedTestCaseIdsByLessonId,
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
  return new Set(passedTestCaseIdsByLessonId[getLessonKey(lesson)] || []);
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
      const level = Math.min(3, heading[1].length + 1);
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
                <button class="level-item ${isCurrent ? "is-active" : ""} ${isCompleted ? "is-completed" : ""} ${isLocked ? "is-locked" : ""}" type="button" data-lesson-index="${itemIndex}" title="${escapeHtml(statusTitle)}" aria-label="${escapeHtml(ariaLabel)}" ${isLocked ? 'disabled aria-disabled="true"' : 'aria-disabled="false"'}>
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

  lessonArticle.innerHTML = `
    <div class="lesson-facts">
      <span class="fact-item">第 ${displayIndex + 1}/${totalLessons} 章</span>
      <span class="fact-item fact-difficulty difficulty-${lesson.difficulty === '基础' ? 'basic' : (lesson.difficulty === '进阶' ? 'medium' : 'hard')}">
        <span class="difficulty-dot"></span>${escapeHtml(lesson.difficulty)}
      </span>
      <span class="fact-item">${lesson.estimatedMinutes} 分钟</span>
      <span class="fact-item fact-status ${passedCount === testCases.length ? 'all-passed' : ''}">
        ${passedCount}/${testCases.length} 测试通过
      </span>
    </div>
    <h1>${displayIndex + 1}. ${escapeHtml(lesson.title)}</h1>
    <section class="lesson-goals" aria-label="学习目标">
      <h2>学习目标</h2>
      <div class="stepper-list">${goalsHtml}</div>
    </section>
    <div class="prose">${renderMarkdown(lesson.tutorial || "")}</div>
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
  const caseDock = document.querySelector(".case-dock");
  const testCases = getTestCases(lesson);
  const selected = getSelectedTestCase(lesson);
  const passedIds = getPassedIds(lesson);
  const passedCount = testCases.filter((testCase) => passedIds.has(testCase.id)).length;

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
}

function highlightPython(code) {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const tokens = [];
  const placeholderPrefix = "___TOKEN_PLACEHOLDER_";
  const stash = (markup) => {
    const id = placeholderPrefix + tokens.length + "___";
    tokens.push(markup);
    return id;
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

  // Restore stashed tokens (function form avoids $-pattern issues).
  for (let i = 0; i < tokens.length; i += 1) {
    html = html.replace(placeholderPrefix + i + "___", () => tokens[i]);
  }

  return html;
}

function syncHighlight(textarea, highlightNode) {
  if (!highlightNode) return;
  highlightNode.innerHTML = highlightPython(textarea.value) + "\n";
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
  return typeof lessonDrafts[getLessonKey(lesson)] === "string" ? lessonDrafts[getLessonKey(lesson)] : "";
}

function setDraftForLesson(lesson, code) {
  if (!lesson?.id) return;
  const key = getLessonKey(lesson);
  const value = String(code || "").slice(0, maxDraftLength);

  if (value && value !== lesson.starterCode) {
    lessonDrafts[key] = value;
  } else {
    delete lessonDrafts[key];
  }

  writeStoredDrafts();
  updateResetButtonState();
}

function saveCurrentDraft() {
  setDraftForLesson(getCurrentLesson(), codeEditor.value);
}

function hasSavedDrafts() {
  return Object.keys(lessonDrafts).length > 0;
}

function clearDrafts() {
  lessonDrafts = {};
  localStorage.removeItem(draftStorageKey);
  updateResetButtonState();
}

function setProgress(nextCompletedLessons) {
  completedLessons = normalizeCompletedCount(nextCompletedLessons);
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  progressText.textContent = `${completedLessons}/${totalLessons} 章`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  writeStoredProgress();
  updateResetButtonState();
}

function updateResetButtonState() {
  const hasPassedTests = Object.values(passedTestCaseIdsByLessonId).some((ids) => Array.isArray(ids) && ids.length > 0);
  const canReset = completedLessons > 0 || hasSavedDrafts() || hasPassedTests;
  resetProgress.disabled = !canReset;
  resetProgress.setAttribute("aria-disabled", canReset ? "false" : "true");
}

function setNextLessonAction(index) {
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

function hideNextLessonAction() {
  setNextLessonAction(-1);
}

function loadLesson(index) {
  if (!lessons[index] || isLessonLocked(index)) return;
  if (hasLoadedLesson) saveCurrentDraft();

  currentLessonIndex = index;
  const lesson = getCurrentLesson();
  const selected = getSelectedTestCase(lesson);
  const draft = getDraftForLesson(lesson);

  codeEditor.value = draft || lesson.starterCode || "";
  stdinInput.value = selected.stdin || "";
  syncEditorChrome(codeEditor, editorLines);

  renderLevels();
  renderLessonContent(lesson, index);
  renderAnswerContent(lesson);
  renderTestCases(lesson);
  consoleOutput.textContent = `Loaded: ${index + 1}. ${lesson.title}`;
  runMeta.textContent = draft ? "草稿已恢复" : "等待运行";
  runMeta.className = "run-meta";
  setAnswerDrawer(false);
  hideNextLessonAction();
  syncAnswerDrawerBounds();
  hasLoadedLesson = true;
  updateResetButtonState();
}

function setAnswerDrawer(open) {
  if (open) syncAnswerDrawerBounds();
  answerDrawer.classList.toggle("is-open", open);
  answerDrawer.setAttribute("aria-hidden", open ? "false" : "true");
  showAnswer.classList.toggle("is-active", open);
  showAnswer.setAttribute("aria-pressed", open ? "true" : "false");
  showAnswer.innerHTML = open
    ? '<span class="button-glyph">×</span> 隐藏答案'
    : '<span class="button-glyph">?</span> 查看答案';
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(themeStorageKey, theme);
  themeToggle.innerHTML = `<span class="button-glyph">${theme === "dark" ? "☀" : "☾"}</span>`;
}

function normalizeOutput(value) {
  return String(value || "").replace(/\r\n/g, "\n").trim();
}

function formatTerminalBlock(value, emptyLabel = "(空内容)") {
  return String(value || "").trim() ? value : emptyLabel;
}

function explainOutputMismatch(actual, expected) {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);

  if (!normalizedActual) return "程序当前没有输出；检查是否遗漏 print()，或提前 return / 结束。";
  if (normalizedActual.replace(/\s+/g, "") === normalizedExpected.replace(/\s+/g, "")) {
    return "内容基本一致，但空格或换行与预期不同；print 默认末尾会换行，注意 sep / end 参数。";
  }
  if (normalizedActual.toLowerCase() === normalizedExpected.toLowerCase()) {
    return "内容只在大小写上不同；输出文字需要和预期完全一致。";
  }
  return "先确认读取输入、循环边界和输出格式，再对照本章提示定位。";
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

async function executeWithJudge0(code, stdin = "") {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), executionTimeoutMs);

  let response;
  try {
    response = await fetch(judge0Endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        source_code: encodeBase64(code),
        language_id: python3LanguageId,
        stdin: encodeBase64(stdin)
      })
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("在线运行超时，请稍后重试");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`在线运行服务响应异常 (${response.status})`);
  }

  const data = await response.json();
  const stdout = decodeBase64(data.stdout);
  const stderr = decodeBase64(data.stderr || data.message);
  const compileOutput = decodeBase64(data.compile_output);
  const statusId = data.status?.id ?? -1;

  return {
    status: statusId === 3 ? "success" : "judge0-error",
    stdout,
    stderr,
    compileOutput,
    exitCode: statusId === 3 ? 0 : statusId,
    statusDescription: data.status?.description || "Unknown",
    durationMs: 0
  };
}

async function executeCode(code, stdin = "") {
  const canUseBackend = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  if (canUseBackend) {
    try {
      const response = await fetch("api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdin })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          status: result.status || "error",
          stdout: result.stdout || "",
          stderr: result.stderr || "",
          compileOutput: result.compileOutput || "",
          exitCode: result.exitCode ?? (result.status === "success" ? 0 : 1),
          statusDescription: result.status || "local-runner",
          durationMs: result.durationMs || 0
        };
      }
    } catch {
      // Fall through to the cloud runner when the local API is not reachable.
    }
  }

  return executeWithJudge0(code, stdin);
}

function renderRunResult(result, outputNode, metaNode) {
  const combinedOutput = [result.compileOutput, result.stdout, result.stderr].filter(Boolean).join("\n");
  outputNode.textContent = combinedOutput || "程序运行完成，但没有输出。";
  metaNode.textContent = `${result.statusDescription || result.status} · ${result.durationMs || 0}ms`;
  metaNode.className =
    result.status === "success"
      ? `${metaNode === runMeta ? "run-meta " : ""}status-success`
      : result.status === "learning-preview" || result.status === "preview-limited"
        ? `${metaNode === runMeta ? "run-meta " : ""}status-warn`
        : `${metaNode === runMeta ? "run-meta " : ""}status-error`;
}

function markPassedTestCases(lesson, testCaseIds) {
  if (testCaseIds.length === 0) return;
  const key = getLessonKey(lesson);
  const nextPassedIds = new Set(passedTestCaseIdsByLessonId[key] || []);
  testCaseIds.forEach((testCaseId) => nextPassedIds.add(testCaseId));
  passedTestCaseIdsByLessonId = {
    ...passedTestCaseIdsByLessonId,
    [key]: Array.from(nextPassedIds)
  };
  writeStoredProgress();
  renderTestCases(lesson);
  renderLessonContent(lesson, currentLessonIndex);
  updateResetButtonState();
}

function setRunning(nextRunning) {
  isRunning = nextRunning;
  document.querySelectorAll("#runCode, #submitTask, #focusRun").forEach((button) => {
    button.disabled = nextRunning;
  });
}

async function runCode(sourceEditor = codeEditor, outputNode = consoleOutput, metaNode = runMeta, inputNode = stdinInput) {
  if (isRunning) return null;
  saveCurrentDraft();
  setRunning(true);
  outputNode.textContent = "正在运行 Python 代码...";
  metaNode.textContent = "运行中";
  metaNode.className = metaNode === runMeta ? "run-meta" : "";

  const lesson = getCurrentLesson();
  const selected = getSelectedTestCase(lesson);

  try {
    const result = await executeCode(sourceEditor.value, inputNode.value);
    renderRunResult(result, outputNode, metaNode);

    const canCompare = normalizeOutput(inputNode.value) === normalizeOutput(selected.stdin);
    if (result.status === "success" && canCompare && selected.expectedOutput) {
      const actual = normalizeOutput(result.stdout);
      const expected = normalizeOutput(selected.expectedOutput);
      if (actual === expected) {
        markPassedTestCases(lesson, [selected.id]);
        outputNode.textContent += `\n[测试用例通过: ${selected.title}]`;
      } else {
        const mismatchExplanation = explainOutputMismatch(result.stdout, selected.expectedOutput);
        outputNode.textContent += `\n[输出未匹配预期]\n预期输出:\n${selected.expectedOutput}\n实际输出:\n${formatTerminalBlock(result.stdout, "(空输出)")}\n[排查提示]: ${mismatchExplanation}\n[本章提示]: ${lesson.hint}`;
        metaNode.textContent = "output-mismatch";
        metaNode.className = metaNode === runMeta ? "run-meta status-warn" : "status-warn";
      }
    } else if (result.status === "success" && selected.expectedOutput) {
      outputNode.textContent += `\n[当前标准输入已修改，未计入测试用例完成]\n当前测试用例输入应为:\n${formatTerminalBlock(selected.stdin, "(无标准输入)")}`;
      metaNode.textContent = "custom-stdin";
      metaNode.className = metaNode === runMeta ? "run-meta status-warn" : "status-warn";
    } else if (result.status !== "success" && result.status !== "learning-preview" && result.status !== "preview-limited") {
      const explanation = explainExecutionIssue([result.compileOutput, result.stderr].filter(Boolean).join("\n"));
      if (explanation) outputNode.textContent += `\n[错误提示]: ${explanation}\n[本章提示]: ${lesson.hint}`;
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    outputNode.textContent = `[执行错误]: ${message}`;
    metaNode.textContent = "run-error";
    metaNode.className = metaNode === runMeta ? "run-meta status-error" : "status-error";
    return null;
  } finally {
    setRunning(false);
  }
}

async function runAllTests(options = {}) {
  if (isRunning) return false;
  saveCurrentDraft();
  setRunning(true);

  const lesson = getCurrentLesson();
  const testCases = getTestCases(lesson);
  const sourceCode = codeEditor.value;
  const nextPassedIds = new Set(passedTestCaseIdsByLessonId[getLessonKey(lesson)] || []);
  const passedThisRun = [];
  const lines = [`[运行本章全部测试: ${testCases.length} 个用例]`];
  let stoppedEarly = false;

  consoleOutput.textContent = lines.join("\n");
  runMeta.textContent = "运行中";
  runMeta.className = "run-meta";

  try {
    for (let index = 0; index < testCases.length; index += 1) {
      const testCase = testCases[index];
      lines.push("", `[${index + 1}/${testCases.length}] ${testCase.title}`);
      consoleOutput.textContent = lines.join("\n");

      const result = await executeCode(sourceCode, testCase.stdin || "");

      if (result.compileOutput) lines.push("[编译输出]", result.compileOutput);
      if (result.stderr) lines.push("[运行输出]", result.stderr);

      if (result.status !== "success") {
        const explanation = explainExecutionIssue([result.compileOutput, result.stderr].filter(Boolean).join("\n"));
        lines.push(`[状态]: ${result.statusDescription || result.status}`);
        if (explanation) lines.push(`[错误提示]: ${explanation}`);
        lines.push(`[本章提示]: ${lesson.hint}`);
        stoppedEarly = true;
        break;
      }

      const actual = normalizeOutput(result.stdout);
      const expected = normalizeOutput(testCase.expectedOutput);

      if (actual === expected) {
        nextPassedIds.add(testCase.id);
        passedThisRun.push(testCase.id);
        lines.push(`[通过] ${testCase.title}`);
      } else {
        const mismatchExplanation = explainOutputMismatch(result.stdout, testCase.expectedOutput);
        lines.push(
          `[未通过] ${testCase.title}`,
          `预期输出:\n${testCase.expectedOutput}`,
          `实际输出:\n${formatTerminalBlock(result.stdout, "(空输出)")}`,
          `[排查提示]: ${mismatchExplanation}`,
          `[本章提示]: ${lesson.hint}`
        );
      }
    }

    const passedCount = testCases.filter((testCase) => nextPassedIds.has(testCase.id)).length;
    const allPassed = testCases.every((testCase) => nextPassedIds.has(testCase.id));
    lines.push("", `[全测完成: 本次 ${passedThisRun.length}/${testCases.length} 通过，当前 ${passedCount}/${testCases.length} 通过]`);

    if (allPassed) {
      lines.push("[本章全部测试通过]");
      if (options.submitAfter) {
        const previousCompleted = completedLessons;
        const nextCompleted = Math.max(completedLessons, currentLessonIndex + 1);
        setProgress(nextCompleted);
        renderLevels();
        if (nextCompleted > previousCompleted && lessons[nextCompleted]) {
          lines.push(`Unlocked: ${nextCompleted + 1}. ${lessons[nextCompleted].title}`);
          setNextLessonAction(nextCompleted);
        } else if (nextCompleted >= totalLessons) {
          lines.push("All lessons completed.");
          hideNextLessonAction();
        }
      }
      runMeta.textContent = options.submitAfter ? "task-passed" : "all-tests-passed";
      runMeta.className = "run-meta status-success";
    } else {
      if (stoppedEarly) lines.push("[已提前停止，请先处理上面的运行错误]");
      runMeta.textContent = "tests-need-work";
      runMeta.className = "run-meta status-warn";
      if (options.submitAfter) hideNextLessonAction();
    }

    if (passedThisRun.length > 0) {
      markPassedTestCases(lesson, passedThisRun);
    }

    consoleOutput.textContent = lines.join("\n");
    return allPassed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lines.push(`[执行错误]: ${message}`);
    consoleOutput.textContent = lines.join("\n");
    runMeta.textContent = "run-error";
    runMeta.className = "run-meta status-error";
    if (passedThisRun.length > 0) markPassedTestCases(lesson, passedThisRun);
    return false;
  } finally {
    setRunning(false);
  }
}

function replaceSelection(textarea, value) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  textarea.value = `${textarea.value.slice(0, start)}${value}${textarea.value.slice(end)}`;
  textarea.selectionStart = start + value.length;
  textarea.selectionEnd = start + value.length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function outdentSelection(textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const selected = value.slice(lineStart, end);
  const outdented = selected.replace(/^( {1,4}|\t)/gm, "");
  textarea.value = `${value.slice(0, lineStart)}${outdented}${value.slice(end)}`;
  textarea.selectionStart = lineStart;
  textarea.selectionEnd = lineStart + outdented.length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function indentSelection(textarea) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  if (start === end) {
    replaceSelection(textarea, "    ");
    return;
  }

  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const selected = value.slice(lineStart, end);
  const indented = selected.replace(/^/gm, "    ");
  textarea.value = `${value.slice(0, lineStart)}${indented}${value.slice(end)}`;
  textarea.selectionStart = lineStart;
  textarea.selectionEnd = lineStart + indented.length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function autoIndentLine(textarea) {
  const start = textarea.selectionStart;
  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const currentLine = value.slice(lineStart, start);
  const baseIndent = currentLine.match(/^\s*/)?.[0] || "";
  // Python opens a new block after a line ending in ":".
  const extraIndent = currentLine.trimEnd().endsWith(":") ? "    " : "";
  replaceSelection(textarea, `\n${baseIndent}${extraIndent}`);
}

function bindEditorShortcuts(textarea, runAction) {
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      if (event.shiftKey) {
        outdentSelection(textarea);
      } else {
        indentSelection(textarea);
      }
      return;
    }

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
  syncEditorChrome(textarea, lineNode);
  textarea.addEventListener("input", () => syncEditorChrome(textarea, lineNode));
  textarea.addEventListener("scroll", () => {
    const container = textarea.closest(".editor-container");
    const highlightNode = container ? container.querySelector(".editor-highlight") : null;
    syncLineScroll(textarea, lineNode, highlightNode);
  });
}

function bindEvents() {
  levelList.addEventListener("click", (event) => {
    const item = event.target.closest(".level-item");
    if (!item) return;
    const lessonIndex = Number(item.dataset.lessonIndex || 0);
    if (item.disabled || isLessonLocked(lessonIndex)) return;
    loadLesson(lessonIndex);
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

  document.querySelector("#runCode").addEventListener("click", () => runCode());
  document.querySelector("#submitTask").addEventListener("click", () => runAllTests({ submitAfter: true }));

  codeEditor.addEventListener("input", () => {
    syncEditorChrome(codeEditor, editorLines);
    saveCurrentDraft();
  });

  document.querySelector("#focusCode").addEventListener("click", () => {
    saveCurrentDraft();
    focusEditor.value = codeEditor.value;
    focusStdinInput.value = stdinInput.value;
    syncEditorChrome(focusEditor, focusLines);
    focusOutput.textContent = consoleOutput.textContent || "";
    focusRunMeta.textContent = runMeta.textContent || "等待运行";
    focusRunMeta.className = runMeta.className.replace("run-meta", "").trim();
    focusModal.classList.add("is-open");
    focusModal.setAttribute("aria-hidden", "false");
    focusEditor.focus();
  });

  document.querySelector("#closeFocus").addEventListener("click", () => {
    codeEditor.value = focusEditor.value;
    stdinInput.value = focusStdinInput.value;
    syncEditorChrome(codeEditor, editorLines);
    saveCurrentDraft();
    consoleOutput.textContent = focusOutput.textContent;
    runMeta.textContent = focusRunMeta.textContent;
    runMeta.className = `run-meta ${focusRunMeta.className || ""}`.trim();
    focusModal.classList.remove("is-open");
    focusModal.setAttribute("aria-hidden", "true");
  });

  document.querySelector("#focusRun").addEventListener("click", () => {
    codeEditor.value = focusEditor.value;
    stdinInput.value = focusStdinInput.value;
    syncEditorChrome(codeEditor, editorLines);
    saveCurrentDraft();
    runCode(focusEditor, focusOutput, focusRunMeta, focusStdinInput);
  });

  bindEditorShortcuts(codeEditor, () => runCode());
  bindEditorShortcuts(focusEditor, () => {
    codeEditor.value = focusEditor.value;
    stdinInput.value = focusStdinInput.value;
    syncEditorChrome(codeEditor, editorLines);
    saveCurrentDraft();
    runCode(focusEditor, focusOutput, focusRunMeta, focusStdinInput);
  });
  bindEditorChrome(codeEditor, editorLines);
  bindEditorChrome(focusEditor, focusLines);

  focusModal.addEventListener("click", (event) => {
    if (event.target === focusModal) {
      document.querySelector("#closeFocus").click();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && focusModal.classList.contains("is-open")) {
      document.querySelector("#closeFocus").click();
    }
  });

  showAnswer.addEventListener("click", () => {
    setAnswerDrawer(!answerDrawer.classList.contains("is-open"));
  });
  closeAnswer.addEventListener("click", () => {
    setAnswerDrawer(false);
  });

  document.querySelector("#clearConsole").addEventListener("click", () => {
    consoleOutput.textContent = "";
    runMeta.textContent = "已清空";
    runMeta.className = "run-meta";
  });

  document.querySelector("#clearStdin").addEventListener("click", () => {
    stdinInput.value = "";
  });

  nextLessonButton.addEventListener("click", () => {
    const lessonIndex = Number(nextLessonButton.dataset.lessonIndex || -1);
    if (Number.isInteger(lessonIndex) && lessonIndex >= 0 && !isLessonLocked(lessonIndex)) {
      loadLesson(lessonIndex);
    }
  });

  resetProgress.addEventListener("click", () => {
    if (!resetProgress.disabled && !window.confirm("确认重置学习进度？")) return;

    localStorage.removeItem(progressStorageKey);
    clearDrafts();
    passedTestCaseIdsByLessonId = {};
    completedLessons = 0;
    selectedTestCaseIdByLessonId = {};
    hasLoadedLesson = false;
    setProgress(0);
    loadLesson(0);
    consoleOutput.textContent = `Progress reset.\nLoaded: 1. ${getCurrentLesson().title}`;
    runMeta.textContent = "已重置";
    runMeta.className = "run-meta";
  });

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
    syncAnswerDrawerBounds();
  });

  window.addEventListener("resize", syncAnswerDrawerBounds);
}

function boot() {
  if (totalLessons === 0) {
    lessonArticle.innerHTML = "<h1>课程资源没有加载</h1><p>请确认 course-data.js 已随页面发布。</p>";
    return;
  }

  completedLessons = normalizeCompletedCount(completedLessons);
  setTheme(readStoredTheme());
  setProgress(completedLessons);
  loadLesson(0);
  bindEvents();
  syncAnswerDrawerBounds();
}

document.addEventListener("DOMContentLoaded", boot);
