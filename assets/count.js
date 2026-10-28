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

/* Portal notice: while the client and staff portals are offline for the server upgrade,
   any link to them opens this message instead. To switch it off later, set PORTAL_NOTICE to false. */
(function () {
  var PORTAL_NOTICE = true;
  if (!PORTAL_NOTICE) return;
  var hosts = /^https?:\/\/(client|staff)\.vegeance\.online/i;
  var dlg = null, lastFocus = null;

  function build() {
    var css = document.createElement("style");
    css.textContent =
      ".pn-back[hidden]{display:none}" +
      ".pn-back{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(11,13,18,.55)}" +
      ".pn-box{width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;color:#0b0d12;border-radius:24px;padding:32px 30px 26px;box-shadow:0 24px 60px rgba(11,13,18,.28);font:16px/1.6 var(--body,system-ui,sans-serif)}" +
      ".pn-ic{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:#eef3ff;color:#1d4ed8;margin:0 0 18px}" +
      ".pn-box h2{font-family:var(--head,system-ui,sans-serif);font-size:26px;line-height:1.15;margin:0 0 12px;font-weight:600}" +
      ".pn-box p{margin:0 0 12px;color:#3a4150}" +
      ".pn-box .btns{margin-top:22px}" +
      ".pn-box .btn{min-height:48px;padding:12px 24px}" +
      "@media(max-width:480px){.pn-box{padding:26px 20px 20px}.pn-box h2{font-size:22px}.pn-box .btn{flex:1 1 100%}}";
    document.head.appendChild(css);

    dlg = document.createElement("div");
    dlg.className = "pn-back";
    dlg.hidden = true;
    dlg.innerHTML =
      '<div class="pn-box" role="dialog" aria-modal="true" aria-labelledby="pn-t" aria-describedby="pn-d" tabindex="-1">' +
        '<div class="pn-ic" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg></div>' +
        '<h2 id="pn-t">The client portal is temporarily offline</h2>' +
        '<div id="pn-d"><p>We are upgrading our in-house data servers and software to make the platform faster, more secure and more reliable.</p>' +
        '<p>The client and staff portals are offline while this work is completed. We will restore access as soon as the upgrade is finished. There is nothing you need to do in the meantime.</p>' +
        '<p>Thank you for your patience.</p></div>' +
        '<div class="btns"><a class="btn dark" href="contact.html">Contact us</a><button type="button" class="btn line" data-pn-close>Close</button></div>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || (e.target.closest && e.target.closest("[data-pn-close]"))) hide();
    });
    document.addEventListener("keydown", function (e) {
      if (dlg.hidden) return;
      if (e.key === "Escape") { hide(); return; }
      if (e.key === "Tab") {      // keep the keyboard inside the message
        var f = dlg.querySelectorAll("a[href],button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function show() {
    if (!dlg) build();
    var m = document.querySelectorAll("details[open]"); for (var i = 0; i < m.length; i++) m[i].open = false;   // close the phone menu first
    lastFocus = document.activeElement;
    dlg.hidden = false;
    document.documentElement.style.overflow = "hidden";
    var b = dlg.querySelector("[data-pn-close]"); if (b) b.focus();
  }
  function hide() {
    dlg.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || !hosts.test(a.getAttribute("href") || "")) return;
    e.preventDefault();
    show();
  });
})();
