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
