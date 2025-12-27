/* =========================================================
   Thesis Help Pakistan — Vanilla JS
   - Announcement dismiss + persistence
   - Mobile nav toggle (accessible)
   - Price calculator (PKR)
   - Reviews slider
   - FAQ accordion
   - WhatsApp CTA wiring (placeholder number)
   ========================================================= */

(function () {
  "use strict";

  // -------- Helpers
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const formatPKR = (value) => {
    // Keep formatting simple and reliable for PKR
    const rounded = Math.round(value);
    return "PKR " + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // -------- Announcement dismiss (persist via localStorage)
  const ann = qs("[data-announcement]");
  const annClose = qs("[data-announcement-close]");
  const ANN_KEY = "thp_announcement_dismissed_v1";

  if (ann) {
    const dismissed = localStorage.getItem(ANN_KEY) === "1";
    if (dismissed) ann.style.display = "none";
  }
  if (annClose && ann) {
    annClose.addEventListener("click", () => {
      ann.style.display = "none";
      localStorage.setItem(ANN_KEY, "1");
    });
  }

  // -------- Mobile nav toggle
  const navToggle = qs("[data-nav-toggle]");
  const navList = qs("[data-nav-list]");

  const closeNav = () => {
    if (!navList || !navToggle) return;
    navList.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };

  const openNav = () => {
    if (!navList || !navToggle) return;
    navList.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
  };

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.contains("is-open");
      if (isOpen) closeNav();
      else openNav();
    });

    // Close on link click (mobile)
    qsa(".nav__link", navList).forEach((a) => {
      a.addEventListener("click", () => closeNav());
    });

    // Close on escape / outside click
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
    document.addEventListener("click", (e) => {
      const clickedInside = navList.contains(e.target) || navToggle.contains(e.target);
      if (!clickedInside) closeNav();
    });
  }

  // -------- Price calculator
  const form = qs("[data-calc-form]");
  const priceEl = qs("[data-calc-price]");

  // Baseline per-page rates (PKR) — conservative, non-marketing, adjustable.
  const baseRateByType = {
    proposal: 2200,
    thesis: 2600,
    litreview: 2500,
    methodology: 2700,
    editing: 1400,
    formatting: 1200
  };

  // Level multipliers
  const levelMultiplier = {
    bs: 1.0,
    ms: 1.2,
    phd: 1.45
  };

  // Deadline multipliers (shorter deadline => higher multiplier)
  const deadlineMultiplier = {
    30: 1.0,   // 30+ days
    14: 1.15,
    7: 1.35,
    3: 1.65
  };

  // Minimum fee to avoid "too low" values on tiny inputs
  const minimumFee = 6000;

  const computeEstimate = () => {
    if (!form || !priceEl) return;

    const paperType = qs("#paperType")?.value || "thesis";
    const level = qs("#level")?.value || "ms";
    const pages = Math.max(1, parseInt(qs("#pages")?.value || "1", 10));
    const deadline = qs("#deadline")?.value || "14";

    const base = baseRateByType[paperType] || 2400;
    const lv = levelMultiplier[level] || 1.2;
    const dl = deadlineMultiplier[deadline] || 1.15;

    // Transparent model: (base per page) * pages * level multiplier * deadline multiplier
    // Then clamp to a minimum fee.
    let total = base * pages * lv * dl;

    if (total < minimumFee) total = minimumFee;

    priceEl.textContent = formatPKR(total);
  };

  if (form) {
    // Initial render
    computeEstimate();

    // Update on any input changes
    ["change", "input"].forEach((evt) => {
      form.addEventListener(evt, (e) => {
        const t = e.target;
        if (!t) return;

        // simple guard: pages must remain >= 1
        if (t.id === "pages") {
          const n = parseInt(t.value || "1", 10);
          if (!Number.isFinite(n) || n < 1) t.value = "1";
        }
        computeEstimate();
      });
    });
  }

  // -------- Reviews slider
  const track = qs("[data-review-track]");
  const slider = qs("[data-review-slider]");
  const prevBtn = qs("[data-review-prev]");
  const nextBtn = qs("[data-review-next]");

  let reviewIndex = 0;

  const getCardsPerView = () => {
    // Match CSS breakpoints: >=820 shows 2 cards, else 1
    return window.matchMedia("(min-width: 820px)").matches ? 2 : 1;
  };

  const updateReviewSlider = () => {
    if (!track || !slider) return;

    const cards = qsa(".review", track);
    if (!cards.length) return;

    const perView = getCardsPerView();
    const maxIndex = Math.max(0, Math.ceil(cards.length / perView) - 1);

    reviewIndex = Math.min(reviewIndex, maxIndex);

    const sliderWidth = slider.getBoundingClientRect().width;
    const offset = reviewIndex * sliderWidth;

    track.style.transform = `translateX(${-offset}px)`;

    // Button states
    if (prevBtn) prevBtn.disabled = reviewIndex === 0;
    if (nextBtn) nextBtn.disabled = reviewIndex === maxIndex;
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      reviewIndex = Math.max(0, reviewIndex - 1);
      updateReviewSlider();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      reviewIndex = reviewIndex + 1;
      updateReviewSlider();
    });
  }

  window.addEventListener("resize", () => {
    // When layout changes, recalc transform
    updateReviewSlider();
  });

  updateReviewSlider();

  // -------- FAQ accordion (single-open behavior)
  const accordion = qs("[data-accordion]");
  if (accordion) {
    const items = qsa(".faq__item", accordion);

    const closeItem = (item) => {
      item.classList.remove("is-open");
      const btn = qs(".faq__q", item);
      const panel = qs(".faq__a", item);
      if (btn) btn.setAttribute("aria-expanded", "false");
      if (panel) panel.hidden = true;
    };

    const openItem = (item) => {
      item.classList.add("is-open");
      const btn = qs(".faq__q", item);
      const panel = qs(".faq__a", item);
      if (btn) btn.setAttribute("aria-expanded", "true");
      if (panel) panel.hidden = false;
    };

    items.forEach((item) => {
      const btn = qs(".faq__q", item);
      const panel = qs(".faq__a", item);
      if (!btn || !panel) return;

      // Ensure consistent initial state
      btn.setAttribute("aria-expanded", "false");
      panel.hidden = true;

      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        items.forEach(closeItem);
        if (!isOpen) openItem(item);
      });
    });
  }

  // -------- Footer year
  const yearEl = qs("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // -------- WhatsApp CTA wiring
  // Replace with your real number in international format (no + sign inside the URL).
  // Example: 923001234567
  const WHATSAPP_NUMBER = "920000000000";
  const DEFAULT_TEXT =
    "Assalam-o-Alaikum. I would like academic guidance for my thesis/research. Please share the process and a quote based on my requirements.";

  const waLinks = qsa("[data-whatsapp]");
  waLinks.forEach((a) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_TEXT)}`;
    a.setAttribute("href", url);
    a.setAttribute("rel", "noopener");
    a.setAttribute("target", "_blank");
  });
})();
