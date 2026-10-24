/* Counts the numbers in the stats row up from zero when they scroll into view.
   Works without IntersectionObserver, with or without requestAnimationFrame, and
   still runs (quicker) when the system asks for reduced motion, so it never silently does nothing. */
(function () {
  var els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  var reduce = false;
  try { reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}
  var dur = reduce ? 600 : 1600;
  var now = (window.performance && performance.now) ? function () { return performance.now(); } : function () { return Date.now(); };
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(function () { f(now()); }, 16); };

  function run(el) {
    if (el.__counted) return;
    el.__counted = true;
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(end)) return;
    var t0 = now();
    el.textContent = "0";
    (function step() {
      var p = Math.min((now() - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(end * e));
      if (p < 1) raf(step); else el.textContent = String(end);
    })();
  }

  function inView(el) {
    var r = el.getBoundingClientRect(), h = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom > 0 && r.top < h * 0.9;
  }

  function fallback() {                      // old browsers: count when scrolled near, or at once
    var list = Array.prototype.slice.call(els);
    function check() {
      list = list.filter(function (el) { if (inView(el)) { run(el); return false; } return true; });
      if (!list.length) { window.removeEventListener("scroll", check); window.removeEventListener("resize", check); }
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
  }

  if (!("IntersectionObserver" in window)) { fallback(); return; }
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } });
  }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
  Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  // safety net: if the observer never reports (rare browser quirks), count anyway after a short wait once visible
  setTimeout(function () { Array.prototype.forEach.call(els, function (el) { if (!el.__counted && inView(el)) run(el); }); }, 2500);
})();
