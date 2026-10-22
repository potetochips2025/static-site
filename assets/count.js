/* Counts the numbers in the stats row up from zero when they scroll into view. */
(function () {
  var els = document.querySelectorAll("[data-count]");
  if (!els.length || !("IntersectionObserver" in window) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  function run(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), t0 = null, dur = 1600;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(end * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = String(end);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } });
  }, { threshold: 0.4 });
  els.forEach(function (el) { io.observe(el); });
})();
