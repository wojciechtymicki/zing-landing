// Zing — interactive bits for the hero section
// 1. Nav dropdowns (Solution, Case studies)
// 2. Video modal open/close
// 3. Rolling band — measure strip width for seamless loop

(() => {
  // ----- Nav dropdowns -------------------------------------------------------
  const CLOSE_DELAY = 120; // ms grace period when moving between trigger & panel

  document.querySelectorAll("[data-nav-item]").forEach((item) => {
    const trigger = item.querySelector(".main-nav__link");
    const panel = item.querySelector(".nav-dropdown");
    if (!trigger || !panel) return;

    let closeTimer = null;

    const open = () => {
      clearTimeout(closeTimer);
      // Close any other open dropdown first
      document.querySelectorAll("[data-nav-item]").forEach((other) => {
        if (other !== item) closeItem(other);
      });
      item.dataset.open = "true";
      panel.dataset.open = "true";
      trigger.setAttribute("aria-expanded", "true");
    };

    const close = () => {
      item.dataset.open = "false";
      panel.dataset.open = "false";
      trigger.setAttribute("aria-expanded", "false");
    };

    const closeItem = (el) => {
      const t = el.querySelector(".main-nav__link");
      const p = el.querySelector(".nav-dropdown");
      el.dataset.open = "false";
      if (p) p.dataset.open = "false";
      if (t) t.setAttribute("aria-expanded", "false");
    };

    const scheduleClose = () => {
      closeTimer = setTimeout(close, CLOSE_DELAY);
    };

    const cancelClose = () => clearTimeout(closeTimer);

    // Hover on trigger
    trigger.addEventListener("mouseenter", open);
    trigger.addEventListener("mouseleave", scheduleClose);

    // Keep open while inside panel
    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("mouseleave", scheduleClose);

    // Keyboard: toggle on Enter/Space, close on Escape
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        item.dataset.open === "true" ? close() : open();
      }
      if (e.key === "Escape") close();
    });
    panel.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close();
        trigger.focus();
      }
    });
  });

  // Close all dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-nav-item]")) {
      document.querySelectorAll("[data-nav-item]").forEach((item) => {
        item.dataset.open = "false";
        const panel = item.querySelector(".nav-dropdown");
        const trigger = item.querySelector(".main-nav__link");
        if (panel) panel.dataset.open = "false";
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    }
  });

  // ----- Video modal ---------------------------------------------------------
  const openBtn = document.querySelector("[data-open-video]");
  const closeBtn = document.querySelector("[data-close-video]");
  const modal = document.querySelector("[data-video-modal]");
  const player = document.querySelector("[data-video-player]");

  const setVideoOpen = (open) => {
    if (!modal) return;
    modal.dataset.open = open ? "true" : "false";
    document.body.style.overflow = open ? "hidden" : "";
    if (player) {
      if (open) player.play?.().catch(() => {});
      else player.pause?.();
    }
  };

  openBtn?.addEventListener("click", () => setVideoOpen(true));
  closeBtn?.addEventListener("click", () => setVideoOpen(false));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) setVideoOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.dataset.open === "true") setVideoOpen(false);
  });

  // ----- Rolling band --------------------------------------------------------
  const track = document.querySelector(".rolling-band__track");
  const firstLogo = track?.querySelector(".rolling-band__logos");

  const syncStripWidth = () => {
    if (!track || !firstLogo) return;
    const width = firstLogo.getBoundingClientRect().width;
    if (width > 0) track.style.setProperty("--strip-width", `${width}px`);
  };

  if (firstLogo) {
    if (firstLogo.complete) syncStripWidth();
    else firstLogo.addEventListener("load", syncStripWidth, { once: true });
    window.addEventListener("resize", syncStripWidth);
  }

  // ----- Timeline scroll animation -----------------------------------------
  // Drives a single CSS var --timeline-progress (0 → 1). CSS reads it to
  // reveal the stroke (clip-path) and fade in the 01/02/03 pills.
  //   progress = 0 when the timeline's top edge reaches the viewport bottom
  //   progress = 1 when the timeline's vertical centre reaches the viewport centre
  const timelineEl = document.querySelector("[data-timeline]");
  if (timelineEl) {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      // Honor user preference: keep the section fully revealed, no animation.
      timelineEl.style.setProperty("--timeline-progress", "1");
    } else {
      // Initial hidden state — set before first paint to avoid a flash.
      timelineEl.style.setProperty("--timeline-progress", "0");

      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

      const updateProgress = () => {
        const rect = timelineEl.getBoundingClientRect();
        const vh = window.innerHeight;
        // Range: from rect.top = vh (entering) down to rect.top = vh/2 − height/2
        // (centre aligned). Total scroll distance = vh/2 + height/2.
        const range = vh / 2 + rect.height / 2;
        const progress = clamp((vh - rect.top) / range, 0, 1);
        timelineEl.style.setProperty("--timeline-progress", progress.toFixed(4));
      };

      let ticking = false;
      let inView = false;

      const onScrollOrResize = () => {
        if (!inView || ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
      };

      // Only run the scroll handler while the section is anywhere near the
      // viewport. The large rootMargin keeps the handler active during the
      // entire animation window (before/after the trigger range).
      const io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) updateProgress();
        },
        { rootMargin: "100% 0px 100% 0px" }
      );
      io.observe(timelineEl);

      window.addEventListener("scroll", onScrollOrResize, { passive: true });
      window.addEventListener("resize", onScrollOrResize, { passive: true });
      // First paint position
      updateProgress();
    }
  }

  // ----- FAQ accordion -------------------------------------------------------
  document.querySelectorAll("[data-faq-item]").forEach((item) => {
    const trigger = item.querySelector(".faq-item__trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.dataset.open === "true";
      item.dataset.open = isOpen ? "false" : "true";
      trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  });
})();
