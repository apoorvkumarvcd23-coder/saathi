/* Saathi marketing site — light progressive enhancement, no dependencies. */
(function () {
  "use strict";

  /* Nav: add hairline + denser bg once scrolled. */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 8) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Journey: scroll-driven maze → forest crossfade ---- */
  var journey = document.getElementById("top-journey");
  var sMaze = document.getElementById("scene-maze");
  var sForest = document.getElementById("scene-forest");
  var cue = document.getElementById("scroll-cue");
  var jc1 = document.querySelector(".jc--1");
  var jc2 = document.querySelector(".jc--2");
  var jc3 = document.querySelector(".jc--3");
  var mazeImg = sMaze ? sMaze.querySelector(".scene__img") : null;
  var forestImg = sForest ? sForest.querySelector(".scene__img") : null;

  // map p into 0..1 across [a,b], clamped
  var seg = function (p, a, b) {
    var t = (p - a) / (b - a);
    return t < 0 ? 0 : t > 1 ? 1 : t;
  };
  var ty = function (el, op, yPx) {
    el.style.opacity = op;
    el.style.transform = "translate(-50%, calc(-50% + " + yPx + "px))";
  };

  var ticking = false;
  var updateJourney = function () {
    ticking = false;
    if (!journey) return;
    var rect = journey.getBoundingClientRect();
    var denom = rect.height - window.innerHeight;
    var p = denom > 0 ? -rect.top / denom : 0;
    p = p < 0 ? 0 : p > 1 ? 1 : p;

    if (sMaze) sMaze.style.opacity = 1 - seg(p, 0.34, 0.6);
    if (mazeImg) mazeImg.style.transform = "scale(" + (1 + 0.18 * seg(p, 0, 0.62)) + ")";
    if (sForest) sForest.style.opacity = seg(p, 0.32, 0.62);
    if (forestImg) forestImg.style.transform = "scale(" + (1.16 - 0.16 * seg(p, 0.3, 1)) + ")";

    var f1 = seg(p, 0.08, 0.24);
    ty(jc1, 1 - f1, -42 * f1);
    var f2in = seg(p, 0.3, 0.43),
      f2out = seg(p, 0.54, 0.66);
    ty(jc2, f2in * (1 - f2out), 30 - 60 * (f2in * 0.5 + f2out * 0.5));
    var f3 = seg(p, 0.66, 0.82);
    ty(jc3, f3, 30 - 30 * f3);

    if (cue) cue.style.opacity = 1 - seg(p, 0.02, 0.12);
  };
  var onJourneyScroll = function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateJourney);
    }
  };
  if (journey) {
    window.addEventListener("scroll", onJourneyScroll, { passive: true });
    window.addEventListener("resize", onJourneyScroll, { passive: true });
    updateJourney();
  }

  /* Scroll reveal via IntersectionObserver. */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* Count-up for stat numbers. */
  var counted = false;
  var runCounts = function () {
    if (counted) return;
    counted = true;
    document.querySelectorAll(".stat__num[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (reduce) {
        el.textContent = target;
        return;
      }
      var start = null;
      var dur = 1300;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  var problem = document.getElementById("problem");
  if (problem && "IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            runCounts();
            io2.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io2.observe(problem);
  } else {
    runCounts();
  }

  /* Early-access form: client-side only (no backend). Validates + stores intent. */
  var form = document.getElementById("signup");
  var note = document.getElementById("signup-note");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = document.getElementById("email").value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) {
        note.textContent = "Please enter a valid email address.";
        note.classList.add("is-error");
        return;
      }
      note.classList.remove("is-error");
      note.textContent = "Thank you — you're on the list. We'll be in touch soon. 🙏";
      try {
        var list = JSON.parse(localStorage.getItem("saathi_waitlist") || "[]");
        list.push({ email: email, at: new Date().toISOString() });
        localStorage.setItem("saathi_waitlist", JSON.stringify(list));
      } catch (e) {
        /* storage unavailable — non-fatal */
      }
      form.reset();
    });
  }
})();
