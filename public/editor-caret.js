const EditorCaret = (() => {
  const height = 14;
  const finePointer = matchMedia("(pointer: fine)");
  const forcedColors = matchMedia("(forced-colors: active)");
  const metrics = document.createElement("canvas").getContext("2d");

  function attach(editor, highlight, { mirrorValue = false } = {}) {
    if (!metrics || typeof ResizeObserver !== "function") return;
    const container = editor.parentElement;
    const caret = document.createElement("span");
    caret.className = "editor-caret";
    caret.style.height = height + "px";
    caret.hidden = true;
    caret.setAttribute("aria-hidden", "true");
    container.append(caret);

    const range = document.createRange();
    let runs;
    let frame;
    let composing = false;
    let font;
    let letter;
    let renderedValue;

    function hide() {
      caret.hidden = true;
      editor.classList.remove("has-compact-caret");
    }

    function positionAt(offset) {
      if (!runs) {
        runs = [];
        let length = 0;
        const walker = document.createTreeWalker(highlight, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          runs.push({ node, start: length });
          length += node.length;
        }
      }
      if (!runs.length) return null;
      let first = 0;
      let last = runs.length - 1;
      while (first < last) {
        const middle = Math.ceil((first + last) / 2);
        if (runs[middle].start <= offset) first = middle;
        else last = middle - 1;
      }
      const { node, start } = runs[first];
      if (offset - start > node.length) return null;
      range.setStart(node, offset - start);
      range.collapse(true);
      return range.getBoundingClientRect();
    }

    function draw() {
      frame = undefined;
      const { value, selectionStart, selectionEnd, clientWidth, clientHeight } = editor;
      if (document.activeElement !== editor || !document.hasFocus() || composing ||
          selectionStart !== selectionEnd || !finePointer.matches || forcedColors.matches) {
        hide();
        return;
      }

      const lineStart = selectionStart ? value.lastIndexOf("\n", selectionStart - 1) + 1 : 0;
      const lineEnd = value.indexOf("\n", selectionStart);
      const line = value.slice(lineStart, lineEnd < 0 ? value.length : lineEnd);
      // Bidirectional lines can have two valid visual positions for a single offset.
      if (/[\u0590-\u08ff\u202a-\u202e\u2066-\u2069]/.test(line) || !clientWidth || !clientHeight) {
        hide();
        return;
      }

      const style = getComputedStyle(editor);
      const currentFont = style.fontSize + " " + style.fontFamily;
      if (font !== currentFont) {
        font = currentFont;
        metrics.font = currentFont;
        letter = metrics.measureText("H");
      }

      if (mirrorValue) {
        if (renderedValue !== value) {
          highlight.textContent = value + "\u200b";
          renderedValue = value;
          runs = undefined;
        }
        highlight.style.width = `${clientWidth}px`;
        highlight.scrollTop = editor.scrollTop;
        highlight.scrollLeft = editor.scrollLeft;
      }

      const bounds = positionAt(selectionStart);
      if (mirrorValue && selectionStart > 0 && selectionStart < value.length &&
          value[selectionStart - 1] !== "\n" && value[selectionStart] !== "\n") {
        // At a soft wrap, either visual row can represent the same selection offset.
        range.setStart(highlight.firstChild, selectionStart - 1);
        range.setEnd(highlight.firstChild, selectionStart + 1);
        const rects = range.getClientRects();
        if (rects.length > 1 && Math.abs(rects[0].bottom - rects[rects.length - 1].bottom) > parseFloat(style.lineHeight) / 2) {
          hide();
          return;
        }
      }
      const origin = container.getBoundingClientRect();
      if (!bounds?.height || !origin.width || !origin.height) {
        hide();
        return;
      }
      const scaleX = origin.width / container.offsetWidth;
      const scaleY = origin.height / container.offsetHeight;
      const x = (bounds.left - origin.left) / scaleX;
      const baseline = (bounds.bottom - origin.top) / scaleY - letter.fontBoundingBoxDescent;
      const y = baseline - (letter.actualBoundingBoxAscent + height) / 2;
      if (!Number.isFinite(y) || x < 0 || y < 0 || x >= clientWidth || y + height > clientHeight) {
        hide();
        return;
      }

      const left = x + "px";
      const top = y + "px";
      const moved = caret.hidden || caret.style.left !== left || caret.style.top !== top;
      caret.style.left = left;
      caret.style.top = top;
      caret.hidden = false;
      editor.classList.add("has-compact-caret");
      if (moved) {
        const [blink] = caret.getAnimations();
        if (blink) blink.currentTime = 0;
      }
    }

    function schedule() {
      if (frame === undefined) frame = requestAnimationFrame(draw);
    }

    if (!mirrorValue) {
      new MutationObserver(() => {
        runs = undefined;
        schedule();
      }).observe(highlight, { childList: true, subtree: true });
    }

    for (const event of ["focus", "input", "keydown", "pointerup", "select", "selectionchange", "scroll"]) {
      editor.addEventListener(event, schedule);
    }
    editor.addEventListener("blur", hide);
    editor.addEventListener("compositionstart", () => {
      composing = true;
      hide();
    });
    editor.addEventListener("compositionend", () => {
      composing = false;
      schedule();
    });
    document.addEventListener("selectionchange", schedule);
    document.fonts?.addEventListener("loadingdone", () => {
      font = undefined;
      schedule();
    });
    window.addEventListener("focus", schedule);
    window.addEventListener("blur", hide);
    finePointer.addEventListener("change", schedule);
    forcedColors.addEventListener("change", schedule);
    new ResizeObserver(schedule).observe(editor);
  }

  return { attach };
})();
