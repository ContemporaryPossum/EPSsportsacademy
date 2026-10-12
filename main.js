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

  /* ---------- Preloader / page-in ---------- */
  var pre = $(".preloader");
  var started = Date.now();
  function pageIn() {
    body.classList.add("is-loaded");
    if (pre) pre.classList.add("is-done");
  }
  if (!pre || doc.classList.contains("no-preload")) {
    setTimeout(pageIn, 60);
  } else {
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      setTimeout(pageIn, Math.max(0, 1150 - (Date.now() - started)));
    };
    window.addEventListener("load", finish);
    setTimeout(finish, 2200);
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
  var burstColors = ["#a6d13b", "#ffd21f", "#14b4e6", "#ff6a3d", "#2453e0", "#ffffff"];
  if (!reduceMotion && "animate" in Element.prototype) {
    document.addEventListener("click", function (e) {
      var el = e.target.closest(".burst");
      if (!el) return;
      var r = el.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (var i = 0; i < 22; i++) {
        var dot = document.createElement("span");
        dot.className = "burst-dot";
        dot.style.left = cx + "px";
        dot.style.top = cy + "px";
        dot.style.background = burstColors[i % burstColors.length];
        if (i % 3 === 0) dot.style.borderRadius = "50%";
        body.appendChild(dot);
        var ang = Math.random() * Math.PI * 2;
        var dist = 70 + Math.random() * 110;
        dot.animate([
          { transform: "translate(-50%,-50%) rotate(0deg) scale(1)", opacity: 1 },
          { transform: "translate(" + (Math.cos(ang) * dist - 5) + "px," + (Math.sin(ang) * dist + 40) + "px) rotate(" + (Math.random() * 540) + "deg) scale(.6)", opacity: 0 }
        ], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.16,1,.3,1)" }).onfinish = (function (d) { return function () { d.remove(); }; })(dot);
      }
    });
  }

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
