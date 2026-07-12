(function () {
  var SIDENOTE_MQ = window.matchMedia("(min-width: 1080px)");

  function sidenoteMode() {
    return SIDENOTE_MQ.matches;
  }

  // --- Popup mode (narrow screens): float the note above its reference ---
  function positionPopup(ref) {
    var popup = ref.querySelector(".footnote-popup");
    var body = ref.closest(".post-body");
    if (!popup || !body) return;

    // Reset so we can measure cleanly
    popup.style.left = "0";
    popup.style.top = "0";

    var bodyRect = body.getBoundingClientRect();
    var refRect = ref.getBoundingClientRect();

    // Place above the ref, 8px gap
    var top = refRect.top - bodyRect.top - popup.offsetHeight - 8;
    var left = refRect.left - bodyRect.left;

    // Clamp horizontally within .post-body
    var maxLeft = body.clientWidth - popup.offsetWidth;
    if (left > maxLeft) left = Math.max(0, maxLeft);
    if (left < 0) left = 0;

    popup.style.top = top + "px";
    popup.style.left = left + "px";
  }

  // --- Sidenote mode (wide screens): stack notes down the right margin ---
  // Each note is aligned with its reference, then pushed down if it would
  // collide with the one above it. Heights are measured while clamped, so a
  // note expanding on hover overlays its neighbours rather than reflowing them.
  function layoutSidenotes() {
    var body = document.querySelector(".post-body");
    if (!body) return;
    var refs = body.querySelectorAll(".footnote-ref");

    if (!sidenoteMode()) {
      // Hand positioning back to popup mode.
      refs.forEach(function (ref) {
        var note = ref.querySelector(".footnote-popup");
        if (note) {
          note.style.top = "";
          note.style.left = "";
        }
      });
      return;
    }

    var bodyTop = body.getBoundingClientRect().top;
    var prevBottom = 0;
    var GAP = 14;

    refs.forEach(function (ref) {
      var note = ref.querySelector(".footnote-popup");
      if (!note) return;
      note.style.left = ""; // left is CSS-driven (left: 100%)
      var desired = ref.getBoundingClientRect().top - bodyTop;
      var top = Math.max(desired, prevBottom + GAP, 0);
      note.style.top = top + "px";
      // Only notes whose content actually exceeds the clamp get the "more below"
      // fade. Compare against the stable CSS max-height (in px) rather than
      // clientHeight, which can read 0 mid-reflow and wrongly flag short notes.
      var maxH = parseFloat(getComputedStyle(note).maxHeight);
      note.classList.toggle("is-clamped", maxH > 0 && note.scrollHeight > maxH + 1);
      prevBottom = top + note.offsetHeight;
    });
  }

  // Click/tap toggles the note on narrow screens; on wide screens sidenotes
  // are always visible so clicks pass straight through (e.g. to note links).
  document.addEventListener("click", function (e) {
    if (sidenoteMode()) return;
    var ref = e.target.closest(".footnote-ref");
    if (ref) {
      // Let links inside the popup work normally
      if (e.target.closest(".footnote-popup a")) return;
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll(".footnote-ref.active").forEach(function (el) {
        if (el !== ref) el.classList.remove("active");
      });
      var wasActive = ref.classList.contains("active");
      ref.classList.toggle("active");
      if (!wasActive) positionPopup(ref);
    } else {
      document.querySelectorAll(".footnote-ref.active").forEach(function (el) {
        el.classList.remove("active");
      });
    }
  });

  // Hover (desktop only) — popup mode only; sidenote expansion is pure CSS.
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".footnote-ref").forEach(function (ref) {
      ref.addEventListener("mouseenter", function () {
        if (sidenoteMode()) return;
        ref.classList.add("hover");
        positionPopup(ref);
      });
      ref.addEventListener("mouseleave", function () {
        ref.classList.remove("hover");
      });
    });
  }

  // Keyboard focus — popup mode only.
  document.querySelectorAll(".footnote-ref").forEach(function (ref) {
    ref.addEventListener("focus", function () {
      if (sidenoteMode()) return;
      ref.classList.add("hover");
      positionPopup(ref);
    });
    ref.addEventListener("blur", function () {
      ref.classList.remove("hover");
    });
  });

  // Lay sidenotes out now and whenever the geometry can change. The tricky
  // case is late reflows: images and web fonts load *after* the first pass and
  // push the references down, so any layout computed before then is stale. We
  // recompute on every relevant signal rather than trusting a single moment.
  var raf;
  function scheduleLayout() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layoutSidenotes);
  }

  layoutSidenotes();
  window.addEventListener("load", scheduleLayout);
  window.addEventListener("resize", scheduleLayout);

  if (SIDENOTE_MQ.addEventListener) {
    SIDENOTE_MQ.addEventListener("change", scheduleLayout);
  } else if (SIDENOTE_MQ.addListener) {
    SIDENOTE_MQ.addListener(scheduleLayout);
  }

  // Re-layout whenever the article's height changes for *any* reason — an image
  // finishing, a font swapping in, the window zooming. Notes are absolutely
  // positioned (out of flow), so expanding one on hover can't grow the body and
  // this won't feed back on itself.
  var article = document.querySelector(".post-body");
  if (article && window.ResizeObserver) {
    new ResizeObserver(scheduleLayout).observe(article);
  }

  // Belt and suspenders for images that lack intrinsic dimensions.
  if (article) {
    article.querySelectorAll("img").forEach(function (img) {
      if (!img.complete) img.addEventListener("load", scheduleLayout);
    });
  }

  // Fonts settle asynchronously; their metrics move every reference.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleLayout);
  }
})();
