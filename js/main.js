/* ============================================================
   SIHILO — main.js
   Plain vanilla JS. No dependencies.
   Everything motion-related respects prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------------
     1. NAV — scroll state, mobile toggle, keyboard handling
     --------------------------------------------------------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("primary-nav");

  const setNavState = () => {
    nav.dataset.state = window.scrollY > 40 ? "scrolled" : "top";
  };
  setNavState();
  window.addEventListener("scroll", setNavState, { passive: true });

  const closeMenu = () => {
    nav.dataset.open = "false";
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };
  const openMenu = () => {
    nav.dataset.open = "true";
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
  };

  navToggle.addEventListener("click", () => {
    nav.dataset.open === "true" ? closeMenu() : openMenu();
  });

  // Close the mobile menu after choosing a destination
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  // Escape closes the menu and returns focus to the toggle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.dataset.open === "true") {
      closeMenu();
      navToggle.focus();
    }
  });

  /* ---------------------------------------------------------
     2. SCROLL REVEAL — IntersectionObserver
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
     2b. SCROLL-SPY — highlight the active section in the nav
     --------------------------------------------------------- */
  const spyLinks = Array.prototype.slice.call(
    navLinks.querySelectorAll("a:not(.btn)")
  );
  const spyMap = new Map();
  spyLinks.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) spyMap.set(sec, a);
  });
  if (spyMap.size && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          spyLinks.forEach((a) => a.classList.remove("is-active"));
          const active = spyMap.get(entry.target);
          if (active) active.classList.add("is-active");
        });
      },
      // Thin band around the vertical center of the viewport
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spyMap.forEach((_, sec) => spy.observe(sec));
  }

  /* ---------------------------------------------------------
     3. HERO VIDEO — graceful fallback + reduced-motion pause
     --------------------------------------------------------- */
  const heroVideo = document.getElementById("heroVideo");
  if (heroVideo) {
    if (prefersReducedMotion) {
      // Don't autoplay; the poster frame stands in.
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
    } else {
      // Some browsers reject programmatic autoplay; the poster covers it.
      const tryPlay = heroVideo.play();
      if (tryPlay && typeof tryPlay.catch === "function") {
        tryPlay.catch(() => {
          /* Poster frame remains visible — acceptable fallback. */
        });
      }
    }
    heroVideo.addEventListener("error", () => {
      // If the source fails entirely, fall back to the poster image.
      heroVideo.style.display = "none";
      const media = heroVideo.closest(".hero__media");
      if (media) {
        media.style.background =
          "#000 center/cover no-repeat url('assets/hero-poster.jpg')";
      }
    });
  }

  /* ---------------------------------------------------------
     4. FOOTER YEAR
     --------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------
     5. DASHBOARD MOCKUP — simulated, illustrative only
     --------------------------------------------------------- */
  const pad = (n) => String(n).padStart(2, "0");

  // 5a. Ticking clock (runs even with reduced motion — it's information, not motion)
  const clockEl = document.getElementById("dashClock");
  if (clockEl) {
    const tick = () => {
      const d = new Date();
      clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
        d.getSeconds()
      )}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  // 5b. Anomaly feed + status bar + sensors (animated; skipped on reduced motion)
  const alertFeed = document.getElementById("alertFeed");
  const statusEl = document.getElementById("dashStatus");
  const statusText = statusEl
    ? statusEl.querySelector(".dash__status-text")
    : null;

  const EVENTS = [
    { tag: "CAM-01", body: "Motion · parking lot A", incident: false },
    { tag: "ACOUSTIC", body: "Ambient noise within range", incident: false },
    { tag: "RF", body: "Known device rejoined network", incident: false },
    { tag: "CAM-04", body: "Wildlife crossing · rooftop", incident: false },
    { tag: "CAM-03", body: "Person detected · perimeter E", incident: true },
    { tag: "CAM-02", body: "Vehicle idle · loading dock", incident: false },
    { tag: "RF/WI-FI", body: "Unknown device in range", incident: false },
    { tag: "CAM-01", body: "Cleared · no anomaly", incident: false },
  ];

  const timeStamp = () => {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const addAlert = (evt) => {
    if (!alertFeed) return;
    const li = document.createElement("li");
    li.className = "rail__alert" + (evt.incident ? " is-incident" : "");
    li.innerHTML =
      '<div class="rail__alert-top">' +
      '<span class="rail__alert-tag">' +
      evt.tag +
      "</span>" +
      '<span class="rail__alert-time">' +
      timeStamp() +
      "</span>" +
      "</div>" +
      "<span>" +
      evt.body +
      "</span>";
    alertFeed.prepend(li);
    // Keep the feed short
    while (alertFeed.children.length > 4) {
      alertFeed.removeChild(alertFeed.lastChild);
    }
  };

  const setStatus = (incident) => {
    if (!statusEl || !statusText) return;
    statusEl.dataset.state = incident ? "incident" : "clear";
    statusText.textContent = incident ? "1 VERIFIED INCIDENT" : "ALL CLEAR";
  };

  if (alertFeed) {
    // Seed a few entries so the panel isn't empty on load
    addAlert(EVENTS[0]);
    addAlert(EVENTS[1]);

    if (!prefersReducedMotion) {
      let i = 2;
      setInterval(() => {
        const evt = EVENTS[i % EVENTS.length];
        addAlert(evt);
        if (evt.incident) {
          setStatus(true);
          // Auto-resolve the incident after a short window
          setTimeout(() => setStatus(false), 6000);
        }
        i++;
      }, 3200);
    } else {
      // Static, representative end-state for reduced motion
      addAlert(EVENTS[4]);
      setStatus(true);
    }
  }

  // 5c. Sensor readouts — gentle fluctuation
  const dbVal = document.getElementById("dbVal");
  const dbFill = document.getElementById("dbFill");
  const rfVal = document.getElementById("rfVal");
  const rfFill = document.getElementById("rfFill");
  const rfBars = document.getElementById("rfBars");

  // Build RF spectrum bars
  if (rfBars) {
    for (let b = 0; b < 14; b++) {
      const span = document.createElement("span");
      span.style.height = 20 + ((b * 37) % 60) + "%";
      rfBars.appendChild(span);
    }
  }

  if (!prefersReducedMotion) {
    setInterval(() => {
      // Acoustic ~ 38–58 dB
      const db = 38 + Math.floor(Math.random() * 20);
      if (dbVal) dbVal.textContent = db + " dB";
      if (dbFill) dbFill.style.width = Math.round(((db - 30) / 40) * 100) + "%";

      // RF presence ~ 2–6 devices
      const devices = 2 + Math.floor(Math.random() * 5);
      if (rfVal)
        rfVal.textContent = devices + (devices === 1 ? " device" : " devices");
      if (rfFill) rfFill.style.width = 12 + devices * 11 + "%";

      // Spectrum bars
      if (rfBars) {
        Array.prototype.forEach.call(rfBars.children, (bar) => {
          bar.style.height = 15 + Math.floor(Math.random() * 80) + "%";
        });
      }
    }, 1400);
  }

  /* ---------------------------------------------------------
     6. QUOTE FORM — validation, success state, mailto fallback
     --------------------------------------------------------- */
  const form = document.getElementById("quoteForm");
  const success = document.getElementById("formSuccess");

  // Where the form posts. Plug in a real endpoint here (e.g. Formspree):
  //   const ENDPOINT = "https://formspree.io/f/your-id";
  const ENDPOINT = ""; // TODO: set to your Formspree/API endpoint to enable fetch submit.
  const CONTACT_EMAIL = "hello@sihilo.com"; // TODO: replace with the real inbox.

  if (form) {
    const fields = {
      name: form.querySelector("#name"),
      company: form.querySelector("#company"),
      property: form.querySelector("#property"),
      email: form.querySelector("#email"),
      message: form.querySelector("#message"),
    };

    const messages = {
      name: "Please enter your name.",
      company: "Please enter your company.",
      property: "Please select a property type.",
      email: "Please enter a valid email address.",
      message: "Please add a short message.",
    };

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const validateField = (key) => {
      const el = fields[key];
      const wrap = el.closest(".field");
      const errEl = form.querySelector('.field__error[data-for="' + key + '"]');
      let valid = el.value.trim() !== "";
      if (key === "email") valid = emailOk(el.value);

      if (!valid) {
        wrap.classList.add("is-invalid");
        el.setAttribute("aria-invalid", "true");
        if (errEl) errEl.textContent = messages[key];
      } else {
        wrap.classList.remove("is-invalid");
        el.removeAttribute("aria-invalid");
        if (errEl) errEl.textContent = "";
      }
      return valid;
    };

    // Live-clear errors as the user fixes them
    Object.keys(fields).forEach((key) => {
      const evt = fields[key].tagName === "SELECT" ? "change" : "input";
      fields[key].addEventListener(evt, () => {
        if (fields[key].closest(".field").classList.contains("is-invalid")) {
          validateField(key);
        }
      });
    });

    const buildMailto = () => {
      const subject = encodeURIComponent(
        "Quote request: " + (fields.property.value || "Property")
      );
      const body = encodeURIComponent(
        "Name: " +
          fields.name.value +
          "\nCompany: " +
          fields.company.value +
          "\nProperty type: " +
          fields.property.value +
          "\nEmail: " +
          fields.email.value +
          "\n\n" +
          fields.message.value
      );
      return "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const results = Object.keys(fields).map(validateField);
      if (results.includes(false)) {
        // Focus the first invalid field for accessibility
        const firstBad = Object.keys(fields).find(
          (k) => !validateField(k)
        );
        if (firstBad) fields[firstBad].focus();
        return;
      }

      const showSuccess = () => {
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
      };

      // ---- Real submission path -------------------------------------
      // When ENDPOINT is set, POST the form via fetch. Otherwise we fall
      // back to opening the visitor's email client (mailto:).
      if (ENDPOINT) {
        const data = new FormData(form);
        fetch(ENDPOINT, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Request failed");
            showSuccess();
          })
          .catch(() => {
            // Network/endpoint failure — fall back to mailto so nothing is lost.
            window.location.href = buildMailto();
            showSuccess();
          });
      } else {
        // No endpoint configured yet: mailto fallback.
        window.location.href = buildMailto();
        showSuccess();
      }
    });
  }
})();
