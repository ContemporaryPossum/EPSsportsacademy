/* EPS Sports Academy — interactions & motion (no dependencies) */
(function () {
  "use strict";

  var doc = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* WhatsApp number used by the enquiry form and "join waitlist" links */
  var WHATSAPP = "60122326372";

  /* ---------- Confetti burst (used by the intro and key CTAs) ---------- */
  var burstColors = ["#a6d13b", "#ffd21f", "#14b4e6", "#ff6a3d", "#2453e0", "#ffffff"];
  function burstAt(cx, cy, count, spread) {
    if (reduceMotion || !("animate" in Element.prototype)) return;
    for (var i = 0; i < (count || 22); i++) {
      var dot = document.createElement("span");
      dot.className = "burst-dot";
      dot.style.left = cx + "px";
      dot.style.top = cy + "px";
      dot.style.background = burstColors[i % burstColors.length];
      if (i % 3 === 0) dot.style.borderRadius = "50%";
      body.appendChild(dot);
      var ang = Math.random() * Math.PI * 2;
      var dist = (spread || 70) + Math.random() * (spread || 70) * 1.5;
      dot.animate([
        { transform: "translate(-50%,-50%) rotate(0deg) scale(1)", opacity: 1 },
        { transform: "translate(" + (Math.cos(ang) * dist - 5) + "px," + (Math.sin(ang) * dist + 40) + "px) rotate(" + (Math.random() * 540) + "deg) scale(.6)", opacity: 0 }
      ], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.16,1,.3,1)" }).onfinish = (function (d) { return function () { d.remove(); }; })(dot);
    }
  }

  /* ---------- Intro (first visit per session) / page-in ---------- */
  var intro = $("[data-intro]");
  function pageIn() {
    if (body.classList.contains("is-loaded")) return;
    body.classList.add("is-loaded");
    window.dispatchEvent(new Event("eps:in"));
  }
  if (!intro || doc.classList.contains("no-preload") || reduceMotion || document.hidden) {
    if (intro) intro.classList.add("is-gone");
    setTimeout(pageIn, 60);
  } else {
    runIntro(intro);
  }

  function runIntro(el) {
    doc.classList.add("intro-lock");
    var t0 = Date.now();
    var loaded = document.readyState === "complete";
    window.addEventListener("load", function () { loaded = true; });
    var pctEl = $("[data-intro-pct]", el);
    var msgEl = $("[data-intro-msg]", el);
    var water = $(".intro-water", el);
    var msgs = ["Pumping up the footballs…", "Filling the swimming pool…", "Lacing up our boots…", "Packing the camp snacks…", "Warming up the coaches…"];
    var msgI = 0;
    var msgTimer = setInterval(function () { msgI = (msgI + 1) % msgs.length; msgEl.textContent = msgs[msgI]; }, 750);
    var pct = 0, exiting = false, ballDone = false;

    // Wait (briefly) for the display font so the ball lands on the real letter shapes.
    var fontWait = new Promise(function (res) {
      if (document.fonts && document.fonts.load) {
        document.fonts.load('900 100px "Archivo"').then(res, res);
        setTimeout(res, 900);
      } else res();
    });
    fontWait.then(function () { bounceBall(el, function () { ballDone = true; }); });

    var tick = setInterval(function () {
      if (exiting) return;
      var elapsed = Date.now() - t0;
      var target = loaded ? 100 : Math.min(90, elapsed / 2600 * 90);
      pct += (target - pct) * 0.12;
      if (Math.abs(target - pct) < 0.6) pct = target;
      pctEl.textContent = Math.round(pct);
      water.style.height = (pct * 0.2).toFixed(2) + "vh";
      if ((pct >= 99.5 && ballDone && elapsed > 2300) || elapsed > 5600) exit(false);
    }, 40);

    $("[data-intro-skip]", el).addEventListener("click", function () { exit(true); });

    function exit(fast) {
      if (exiting) return;
      exiting = true;
      clearInterval(msgTimer);
      clearInterval(tick);
      pctEl.textContent = "100";
      msgEl.textContent = "Let's go!";
      var fillMs = fast ? 450 : 950;
      water.style.transition = "height " + fillMs + "ms cubic-bezier(.65,0,.35,1)";
      water.style.height = "115vh";
      setTimeout(function () { el.classList.add("is-wet"); }, fillMs * 0.45);
      if (!fast) setTimeout(function () { el.classList.add("is-lets"); }, fillMs * 0.6);
      var hold = fast ? 120 : 700;
      setTimeout(function () {
        pageIn();
        el.classList.add("is-out");
        doc.classList.remove("intro-lock");
      }, fillMs + hold);
      setTimeout(function () { el.classList.add("is-gone"); }, fillMs + hold + 1100);
    }
  }

  // Ball drops onto E, hops to P and S (each letter squashes and fills with colour),
  // then bounces off and settles beside the S like a full stop.
  function bounceBall(el, done) {
    var ball = $(".intro-ball", el);
    var stage = $(".intro-stage", el);
    var letters = $$(".il", el);
    if (!ball || !letters.length || !("animate" in Element.prototype)) {
      letters.forEach(function (l) { l.classList.add("is-hit"); });
      el.classList.add("is-sub");
      done();
      return;
    }
    var sr = stage.getBoundingClientRect();
    var B = ball.offsetWidth;
    // Find where the glyphs really sit (cap top and baseline) using the font's own metrics.
    var ctx = document.createElement("canvas").getContext("2d");
    function glyph(l) {
      var cs = getComputedStyle(l), r = l.getBoundingClientRect();
      ctx.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
      var m = ctx.measureText(l.textContent);
      var fs = parseFloat(cs.fontSize);
      var asc = m.fontBoundingBoxAscent || fs * 0.9, desc = m.fontBoundingBoxDescent || fs * 0.22;
      var base = r.top + (r.height - (asc + desc)) / 2 + asc;
      return { r: r, base: base, cap: base - (m.actualBoundingBoxAscent || fs * 0.7) };
    }
    var pts = letters.map(function (l) {
      var g = glyph(l);
      return { x: g.r.left - sr.left + g.r.width / 2 - B / 2, y: g.cap - sr.top - B * 0.9, g: g };
    });
    var lastG = pts[pts.length - 1].g;
    var endX = lastG.r.right - sr.left + B * 0.1;
    var baseY = lastG.base - sr.top - B;
    var hop = Math.max(70, B * 2);
    var f = [
      { x: pts[0].x - B * 1.6, y: -sr.top - B * 2, r: 0, e: "cubic-bezier(.5,0,1,.6)" },
      { x: pts[0].x, y: pts[0].y, r: 140, e: "cubic-bezier(0,.5,.5,1)" },
      { x: (pts[0].x + pts[1].x) / 2, y: pts[0].y - hop, r: 220, e: "cubic-bezier(.5,0,1,.6)" },
      { x: pts[1].x, y: pts[1].y, r: 300, e: "cubic-bezier(0,.5,.5,1)" },
      { x: (pts[1].x + pts[2].x) / 2, y: pts[1].y - hop, r: 380, e: "cubic-bezier(.5,0,1,.6)" },
      { x: pts[2].x, y: pts[2].y, r: 460, e: "cubic-bezier(0,.5,.5,1)" },
      { x: (pts[2].x + endX) / 2 + B * 0.4, y: pts[2].y - hop * 1.25, r: 560, e: "cubic-bezier(.5,0,1,.6)" },
      { x: endX, y: baseY, r: 660, e: "cubic-bezier(0,.5,.5,1)" },
      { x: endX + B * 0.12, y: baseY - B * 0.55, r: 700, e: "cubic-bezier(.5,0,1,.6)" },
      { x: endX + B * 0.22, y: baseY, r: 730, e: "linear" }
    ];
    var seg = [500, 190, 190, 190, 190, 240, 280, 140, 140];
    var total = seg.reduce(function (a, b) { return a + b; }, 0);
    var t = 0;
    var frames = f.map(function (p, i) {
      var k = { transform: "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px) rotate(" + p.r + "deg)", offset: t / total, easing: p.e };
      if (i < seg.length) t += seg[i];
      return k;
    });
    frames[frames.length - 1].offset = 1;
    ball.style.opacity = "1";
    ball.animate(frames, { duration: total, fill: "forwards" });

    var hitTimes = [seg[0], seg[0] + seg[1] + seg[2], seg[0] + seg[1] + seg[2] + seg[3] + seg[4]];
    letters.forEach(function (l, i) {
      setTimeout(function () {
        l.classList.add("is-hit");
        l.animate([
          { transform: "scale(1,1)" },
          { transform: "scale(1.14,.7)", offset: 0.22 },
          { transform: "translateY(-7%) scale(.93,1.12)", offset: 0.55 },
          { transform: "scale(1,1)" }
        ], { duration: 560, easing: "ease-out" });
        var r = l.getBoundingClientRect();
        burstAt(r.left + r.width / 2, r.top + r.height * 0.15, 10, 40);
      }, hitTimes[i]);
    });
    setTimeout(function () { el.classList.add("is-sub"); }, hitTimes[2] + 180);
    setTimeout(done, total);
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header: scrolled / hide on scroll down ---------- */
  var header = $(".site-header");
  var lastY = window.scrollY;
  var progressBar = $(".scroll-progress");
  function onScrollHeader() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 30);
      var goingDown = y > lastY + 4;
      var goingUp = y < lastY - 4;
      if (!body.classList.contains("menu-open")) {
        if (goingDown && y > 500) header.classList.add("is-hidden");
        else if (goingUp || y < 200) header.classList.remove("is-hidden");
      }
    }
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.setProperty("--sp", max > 0 ? (y / max).toFixed(4) : 0);
    }
    lastY = y;
  }

  /* ---------- Dropdown ---------- */
  $$(".has-drop").forEach(function (item) {
    var btn = $(".drop-toggle", item);
    var closeTimer;
    function set(open) {
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      set(!item.classList.contains("is-open"));
    });
    if (finePointer) {
      item.addEventListener("mouseenter", function () { clearTimeout(closeTimer); set(true); });
      item.addEventListener("mouseleave", function () { closeTimer = setTimeout(function () { set(false); }, 160); });
    }
    document.addEventListener("click", function (e) { if (!item.contains(e.target)) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  });

  /* ---------- Mobile menu ---------- */
  var burger = $(".burger");
  var mobileMenu = $("#mobile-menu");
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (burger) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    if (open && header) header.classList.remove("is-hidden");
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });
  if (mobileMenu) $$("a", mobileMenu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && body.classList.contains("menu-open")) setMenu(false); });

  /* ---------- Split headings into words ---------- */
  function splitWords(el) {
    var index = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span");
            w.className = "w";
            var inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--i", index++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR" && !child.classList.contains("scribble")) {
          walk(child);
        } else if (child.nodeType === 1 && child.classList.contains("scribble")) {
          child.style.setProperty("--i", index++);
        }
      });
    })(el);
  }
  $$("[data-split]").forEach(splitWords);

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$("[data-reveal], [data-split], .scribble, [data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        if (entry.target.hasAttribute("data-count")) countUp(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
      if (el.hasAttribute("data-count")) countUp(el, true);
    });
  }

  /* ---------- Counters ---------- */
  function countUp(el, instant) {
    var target = parseFloat(el.getAttribute("data-count"));
    var from = parseFloat(el.getAttribute("data-from") || "0");
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var plain = el.hasAttribute("data-plain");
    var fmt = function (n) {
      var r = Math.round(n);
      return prefix + (plain ? String(r) : r.toLocaleString("en-MY")) + suffix;
    };
    var out = el.querySelector("[data-count-out]") || el;
    if (instant || reduceMotion) { out.textContent = fmt(target); return; }
    var dur = 1800, t0 = performance.now();
    (function tick(now) {
      var t = clamp((now - t0) / dur, 0, 1);
      var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      out.textContent = fmt(from + (target - from) * eased);
      if (t < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- Rotating words ---------- */
  $$("[data-rotator]").forEach(function (el) {
    var words = (el.getAttribute("data-words") || "").split("|").filter(Boolean);
    var span = el.querySelector("span");
    if (!span || words.length < 2 || reduceMotion) return;
    var i = 0;
    setInterval(function () {
      span.classList.add("is-out");
      setTimeout(function () {
        i = (i + 1) % words.length;
        span.textContent = words[i];
        span.classList.remove("is-out");
        span.classList.add("is-pre");
        void span.offsetWidth;
        span.classList.remove("is-pre");
      }, 420);
    }, 2400);
  });

  /* ---------- Hero pointer parallax ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-parallax-root]").forEach(function (root) {
      var items = $$("[data-depth]", root);
      var host = root.closest("section") || root;
      host.addEventListener("pointermove", function (e) {
        var r = host.getBoundingClientRect();
        var mx = (e.clientX - r.left) / r.width - 0.5;
        var my = (e.clientY - r.top) / r.height - 0.5;
        items.forEach(function (it) {
          var d = parseFloat(it.getAttribute("data-depth")) || 1;
          it.style.translate = (mx * d * -26).toFixed(1) + "px " + (my * d * -22).toFixed(1) + "px";
        });
      });
      host.addEventListener("pointerleave", function () {
        items.forEach(function (it) { it.style.translate = "0px 0px"; });
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x * 0.25).toFixed(1) + "px," + (y * 0.35).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(1100px) rotateX(" + (y * -6).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Infinite loops: duplicate children once ---------- */
  $$("[data-loop]").forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (child) {
      var c = child.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      $$("a, button", c).forEach(function (f) { f.setAttribute("tabindex", "-1"); });
      track.appendChild(c);
    });
  });

  /* ---------- Tabs ---------- */
  $$("[data-tabs]").forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap);
    var pill = $(".tab-pill", wrap);
    function movePill(tab) {
      if (!pill || !tab) return;
      pill.style.left = tab.offsetLeft + "px";
      pill.style.width = tab.offsetWidth + "px";
      var color = tab.getAttribute("data-color");
      pill.style.background = color || "";
    }
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (!panel) return;
        if (on) {
          panel.hidden = false;
          panel.classList.remove("is-entering");
          void panel.offsetWidth;
          panel.classList.add("is-entering");
        } else {
          panel.hidden = true;
        }
      });
      movePill(tab);
      if (focus) tab.focus();
      window.dispatchEvent(new Event("eps:layout"));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") select(tabs[(i + 1) % tabs.length], true);
        if (e.key === "ArrowLeft") select(tabs[(i - 1 + tabs.length) % tabs.length], true);
      });
    });
    var initial = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
    requestAnimationFrame(function () { movePill(initial); });
    window.addEventListener("resize", function () {
      movePill(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0]);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { movePill(initial); });
  });

  /* ---------- Player pathway (scroll-driven ball) ---------- */
  var paths = $$(".path");
  function updatePaths() {
    var vh = window.innerHeight;
    var vertical = window.innerWidth <= 960;
    paths.forEach(function (path) {
      if (path.offsetParent === null) return;
      var r = path.getBoundingClientRect();
      var range = Math.max(r.height, vh * 0.55);
      var p = reduceMotion ? 1 : clamp((vh * 0.82 - r.top) / range, 0, 1);
      path.style.setProperty("--p", p.toFixed(4));
      var steps = $$(".path-step", path);
      var n = steps.length;
      steps.forEach(function (step, i) {
        var threshold;
        if (vertical) threshold = (step.offsetTop + 36) / Math.max(1, path.offsetHeight);
        else threshold = n > 1 ? i / (n - 1) : 0;
        step.classList.toggle("is-on", p >= threshold - 0.02);
      });
    });
  }

  /* ---------- Achievements: pinned horizontal scroll ---------- */
  var achieve = $(".achieve");
  var aTrack = achieve && $(".achieve-track", achieve);
  var aWord = achieve && $(".achieve-bgword", achieve);
  var aPanels = achieve ? $$(".a-panel--img", achieve) : [];
  var aDistance = 0;
  function layoutAchieve() {
    if (!achieve || !aTrack) return;
    var pinned = window.innerWidth > 960 && !reduceMotion;
    achieve.classList.toggle("is-static", !pinned);
    if (!pinned) { achieve.style.height = ""; aTrack.style.transform = ""; return; }
    aDistance = Math.max(0, aTrack.scrollWidth - window.innerWidth);
    achieve.style.height = (aDistance + window.innerHeight * 1.15) + "px";
    updateAchieve();
  }
  function updateAchieve() {
    if (!achieve || achieve.classList.contains("is-static")) return;
    var r = achieve.getBoundingClientRect();
    var total = achieve.offsetHeight - window.innerHeight;
    var p = clamp(-r.top / Math.max(1, total), 0, 1);
    aTrack.style.transform = "translate3d(" + (-p * aDistance).toFixed(1) + "px,0,0)";
    if (aWord) aWord.style.transform = "translate3d(" + (-p * 35).toFixed(2) + "vw,0,0)";
    achieve.style.setProperty("--ap", p.toFixed(4));
    aPanels.forEach(function (panel) {
      var pr = panel.getBoundingClientRect();
      var c = (pr.left + pr.width / 2) / window.innerWidth - 0.5;
      panel.style.setProperty("--px", (6.5 + c * 8).toFixed(2));
    });
  }

  /* ---------- Scroll-linked parallax ---------- */
  var parallaxEls = reduceMotion ? [] : $$("[data-parallax]");
  function updateParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var f = parseFloat(el.getAttribute("data-parallax")) || 0.15;
      var off = (r.top + r.height / 2 - vh / 2) * f * -1;
      el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
    });
  }

  /* ---------- Marquee skew from scroll velocity ---------- */
  var skewEls = reduceMotion ? [] : $$(".marquee-skew");
  var lastSkewY = window.scrollY, skew = 0;
  function updateSkew() {
    var y = window.scrollY;
    var v = y - lastSkewY;
    lastSkewY = y;
    skew += (clamp(v * -0.35, -12, 12) - skew) * 0.2;
    skewEls.forEach(function (el) { el.style.setProperty("--skew", skew.toFixed(2) + "deg"); });
  }

  /* ---------- Single rAF scroll loop ---------- */
  var ticking = false;
  function frame() {
    ticking = false;
    onScrollHeader();
    updatePaths();
    updateAchieve();
    updateParallax();
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });
  if (skewEls.length) {
    (function skewLoop() { updateSkew(); requestAnimationFrame(skewLoop); })();
  }
  var resizeT;
  function relayout() { layoutAchieve(); frame(); }
  window.addEventListener("resize", function () { clearTimeout(resizeT); resizeT = setTimeout(relayout, 120); });
  window.addEventListener("load", relayout);
  window.addEventListener("eps:layout", function () { requestAnimationFrame(frame); });
  relayout();

  /* ---------- Reels: drag to scroll + arrows ---------- */
  $$(".reels-wrap").forEach(function (wrap) {
    var row = $(".reels", wrap);
    if (!row) return;
    var step = function () {
      var card = $(".reel", row);
      return card ? card.getBoundingClientRect().width + 18 : 300;
    };
    var scope = wrap.closest("section") || wrap;
    var prev = $("[data-reels-prev]", scope), next = $("[data-reels-next]", scope);
    if (prev) prev.addEventListener("click", function () { row.scrollBy({ left: -step() * 2, behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { row.scrollBy({ left: step() * 2, behavior: "smooth" }); });
    if (!finePointer) return;
    var down = false, startX = 0, startScroll = 0, moved = false;
    row.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startScroll = row.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) { moved = true; row.classList.add("is-dragging"); }
      if (moved) row.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      setTimeout(function () { row.classList.remove("is-dragging"); }, 30);
    });
    row.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  /* ---------- Video modal (Google Drive player) ---------- */
  var modal = $(".video-modal");
  var lastFocus = null;
  function openVideo(id, title, wide) {
    if (!modal) return;
    lastFocus = document.activeElement;
    var frameBox = $(".vm-frame", modal);
    $(".vm-dialog", modal).classList.toggle("is-wide", !!wide);
    frameBox.innerHTML = '<div class="vm-loading">Loading video…</div>';
    var iframe = document.createElement("iframe");
    iframe.src = "https://drive.google.com/file/d/" + encodeURIComponent(id) + "/preview";
    iframe.allow = "autoplay; fullscreen";
    iframe.title = title || "EPS Sports Academy video";
    frameBox.appendChild(iframe);
    $(".vm-title", modal).textContent = title || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden";
    setTimeout(function () { $(".vm-close", modal).focus(); }, 50);
  }
  function closeVideo() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
    setTimeout(function () { $(".vm-frame", modal).innerHTML = ""; }, 350);
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-video]");
    if (trigger) {
      e.preventDefault();
      openVideo(trigger.getAttribute("data-video"), trigger.getAttribute("data-title"), trigger.hasAttribute("data-wide"));
    }
  });
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target === modal) closeVideo(); });
    $(".vm-close", modal).addEventListener("click", closeVideo);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeVideo(); });
  }

  /* ---------- Locations map switcher ---------- */
  $$("[data-locations]").forEach(function (wrap) {
    var cards = $$(".loc-card", wrap);
    var iframe = $(".loc-map iframe", wrap);
    var name = $(".map-name", wrap);
    var dir = $(".map-dir", wrap);
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        cards.forEach(function (c) { c.setAttribute("aria-pressed", c === card ? "true" : "false"); });
        var q = card.getAttribute("data-q");
        if (iframe) iframe.src = "https://maps.google.com/maps?q=" + encodeURIComponent(q) + "&z=15&output=embed";
        if (name) name.textContent = card.getAttribute("data-name");
        if (dir) dir.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
      });
    });
  });

  /* ---------- Confetti burst on key CTAs ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest(".burst");
    if (!el) return;
    var r = el.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, 22, 70);
  });

  /* ---------- Home: football / swimming / camp video panels ---------- */
  $$("[data-sport-split]").forEach(function (split) {
    var panels = $$(".sport-panel", split);
    var CYCLE = 6000;
    var idx = 0, timer = null, hovering = false, splitInView = false, started = false;
    var stacked = function () { return window.innerWidth <= 960; };
    split.style.setProperty("--cycle", CYCLE + "ms");

    function setActive(i, fromUser) {
      idx = i;
      panels.forEach(function (p, j) {
        p.classList.toggle("is-active", j === i);
        p.classList.remove("is-timing");
      });
      if (!fromUser && !reduceMotion && !stacked()) {
        void panels[i].offsetWidth;
        panels[i].classList.add("is-timing");
      }
    }
    function schedule() {
      clearTimeout(timer);
      if (!started || hovering || !splitInView || reduceMotion || stacked()) return;
      if (!panels[idx].classList.contains("is-timing")) setActive(idx);
      timer = setTimeout(function () { setActive((idx + 1) % panels.length); schedule(); }, CYCLE);
    }

    panels.forEach(function (p, j) {
      var v = $("video", p);
      if (v) { v.muted = true; v.setAttribute("muted", ""); }
      p.addEventListener("mouseenter", function () { if (stacked()) return; hovering = true; clearTimeout(timer); setActive(j, true); });
      p.addEventListener("focusin", function () { if (!stacked()) setActive(j, true); });
      // Clicking anywhere on a panel (not on its own buttons/links) opens the full video with sound.
      p.addEventListener("click", function (e) {
        if (e.target.closest("a, button")) return;
        var watch = $(".sp-watch", p);
        if (watch) watch.click();
      });
      p.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && e.target === p) { e.preventDefault(); var w = $(".sp-watch", p); if (w) w.click(); }
      });
    });
    split.addEventListener("mouseleave", function () { hovering = false; schedule(); });

    // Play clips only while they're on screen (saves battery and data).
    if ("IntersectionObserver" in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = $("video", en.target);
          if (!v || reduceMotion) return;
          if (en.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.25 });
      panels.forEach(function (p) { vio.observe(p); });
      new IntersectionObserver(function (entries) {
        splitInView = entries[0].isIntersecting;
        if (splitInView) schedule(); else clearTimeout(timer);
      }, { threshold: 0.3 }).observe(split);
    } else if (!reduceMotion) {
      panels.forEach(function (p) { var v = $("video", p); if (v) v.play(); });
      splitInView = true;
    }
    window.addEventListener("eps:in", function () { started = true; schedule(); });
    if (body.classList.contains("is-loaded")) { started = true; schedule(); }
    window.addEventListener("resize", function () { if (stacked()) { clearTimeout(timer); panels.forEach(function (p) { p.classList.remove("is-timing"); }); } else schedule(); });
  });

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    var ring = $(".cursor"), dot = $(".cursor-dot");
    if (ring && dot) {
      var mx = -100, my = -100, rx = -100, ry = -100;
      window.addEventListener("pointermove", function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
        ring.classList.add("is-visible"); dot.classList.add("is-visible");
      });
      document.addEventListener("pointerleave", function () { ring.classList.remove("is-visible"); dot.classList.remove("is-visible"); });
      document.addEventListener("pointerover", function (e) {
        ring.classList.toggle("is-hover", !!e.target.closest("a, button, [data-video], .reel, label, summary"));
      });
      (function loop() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0)";
        requestAnimationFrame(loop);
      })();
    }
  }

  /* ---------- Enquiry form -> WhatsApp ---------- */
  var form = $("#enquiry-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var v = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ""; };
      var lines = [
        "Hi EPS Sports Academy! I'd like to enquire.",
        "",
        "Parent: " + v("parent"),
        "Child's age: " + v("age"),
        "Programme: " + v("programme"),
        "Preferred venue: " + v("venue")
      ];
      if (v("message")) lines.push("", v("message"));
      var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }
})();
