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
    if (e.target instanceof Element && e.target.closest("a")) closeMenu();
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
  const heroVideo = document.querySelector("video");
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
      const media = heroVideo.closest("div");
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
  // The dashboard is a static, explicitly labelled concept, not live telemetry.
  const motionToggle = document.getElementById("motionToggle");
  let motionPaused = prefersReducedMotion;
  let syncDetectionVideo = () => {};
  const applyMotion = () => {
    document.body.classList.toggle("motion-paused", motionPaused);
    if (motionToggle) {
      motionToggle.textContent = motionPaused ? "Play motion" : "Pause motion";
      motionToggle.setAttribute("aria-pressed", String(motionPaused));
    }
    if (heroVideo) {
      if (motionPaused) heroVideo.pause();
      else heroVideo.play().catch(() => {});
    }
    syncDetectionVideo();
  };
  if (motionToggle) motionToggle.addEventListener("click", () => {
    motionPaused = !motionPaused;
    applyMotion();
  });
  applyMotion();

  // Load the detection loop only near the viewport; share the page motion setting.
  const detectionVideo = /** @type {HTMLVideoElement | null} */ (document.getElementById("detectionVideo"));
  const detectionToggle = document.getElementById("detectionToggle");
  if (detectionVideo && detectionToggle) {
    let inView = false;
    let userPaused = false;
    let loaded = false;
    syncDetectionVideo = () => {
      const paused = motionPaused || userPaused || !inView;
      if (!paused && !loaded) {
        const source = detectionVideo.querySelector("source");
        if (source) source.src = source.getAttribute("data-src");
        detectionVideo.load();
        loaded = true;
      }
      if (paused) detectionVideo.pause();
      else detectionVideo.play().catch(() => {
        detectionToggle.textContent = "Play detection video";
        detectionToggle.setAttribute("aria-pressed", "true");
      });
      detectionToggle.textContent = paused ? "Play detection video" : "Pause detection video";
      detectionToggle.setAttribute("aria-pressed", String(paused));
    };
    detectionToggle.addEventListener("click", () => {
      if (motionPaused || userPaused || detectionVideo.paused) {
        userPaused = false;
        motionPaused = false;
      } else userPaused = true;
      applyMotion();
    });
    detectionVideo.addEventListener("error", () => {
      detectionToggle.textContent = "Video unavailable";
      detectionToggle.setAttribute("disabled", "");
    });
    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        syncDetectionVideo();
      }, { threshold: 0.15 });
      videoObserver.observe(detectionVideo);
    } else {
      inView = true;
      syncDetectionVideo();
    }
  }

  /* Site assessment / pilot intake: validates locally and prepares an email. */
  const form = document.querySelector("form");
  const success = document.getElementById("formSuccess");

  // Where the form posts. Plug in a real endpoint here (e.g. Formspree):
  //   const ENDPOINT = "https://formspree.io/f/your-id";
  const ENDPOINT = ""; // TODO: set to your Formspree/API endpoint to enable fetch submit.
  const CONTACT_EMAIL = "moisesjdelcastillo@gmail.com";

  if (form) {
    const fields = {
      name: form.querySelector("#name"),
      company: form.querySelector("#company"),
      property: /** @type {HTMLSelectElement} */ (form.querySelector("#property")),
      email: form.querySelector("#email"),
      concern: form.querySelector("#concern"),
    };

    const messages = {
      name: "Please enter your name.",
      company: "Please enter your company.",
      property: "Please select a property type.",
      email: "Please enter a valid email address.",
      concern: "Please tell us your primary security concern.",
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

    const inquiry = /** @type {HTMLSelectElement} */ (form.querySelector("#inquiry"));
    const submitButton = /** @type {HTMLButtonElement} */ (form.querySelector('[type="submit"]'));
    const updateInquiry = () => {
      submitButton.textContent = inquiry.value === "90-day pilot"
        ? "Apply for a 90-Day Pilot" : "Request a Site Assessment";
    };
    inquiry.addEventListener("change", updateInquiry);
    document.querySelectorAll("a[data-inquiry]").forEach((link) => {
      link.addEventListener("click", () => {
        inquiry.value = link.getAttribute("data-inquiry");
        updateInquiry();
      });
    });
    form.addEventListener("input", () => { if (success) success.hidden = true; });
    form.addEventListener("change", () => { if (success) success.hidden = true; });

    const buildMailto = () => {
      const data = new FormData(form);
      const labels = {
        inquiry: "Request", name: "Name", company: "Company", email: "Email",
        phone: "Phone", property: "Property type", size: "Approximate property size",
        security: "Current security setup", concern: "Primary concern", message: "Message",
      };
      const body = Object.entries(labels)
        .map(([key, label]) => label + ": " + (String(data.get(key) || "").trim() || "Not provided"))
        .join("\n");
      const subject = String(data.get("inquiry")) + ": " + fields.property.value;
      return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    };

    const showStatus = (message) => {
      if (!success) return;
      success.textContent = message;
      success.hidden = false;
      success.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
    };
    const openEmail = () => {
      window.location.href = buildMailto();
      showStatus("Your email draft is ready. Press Send in your email app to submit your request. If no app opens, email " + CONTACT_EMAIL + " directly. Your details are kept here until you leave or reload the page.");
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

      if (ENDPOINT) {
        submitButton.disabled = true;
        fetch(ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Request failed");
            showStatus("Request received. Thank you for telling us about your property.");
            form.reset();
            updateInquiry();
          })
          .catch(openEmail)
          .finally(() => { submitButton.disabled = false; });
      } else {
        openEmail();
      }
    });
  }
})();
