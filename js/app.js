/**
 * Coffee Wizard — Application logic (Nocturnal Alchemy).
 * ------------------------------------------------------------------
 * Rendering is driven entirely by the data layer (js/data.js).
 * No product markup is hardcoded here; the same components render for
 * any branch. Branch-specific pricing and galleries are resolved from
 * the current branch id.
 */
(function () {
  "use strict";

  const D = window.CoffeeWizard;

  /* ---------- state ---------- */

  let currentBranchId = readBranch();

  function readBranch() {
    const saved = localStorage.getItem(D.storageKey);
    return D.branches[saved] ? saved : D.defaultBranch;
  }

  function getBranch() {
    return D.branches[currentBranchId];
  }

  /* ---------- helpers ---------- */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function formatPrice(value) {
    return D.pricePrefix + String(value);
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function openWhatsApp(message) {
    const phone = getBranch().whatsapp;
    window.open(
      "https://wa.me/" + phone + "?text=" + encodeURIComponent(message),
      "_blank",
      "noopener"
    );
  }

  function joinMessage(lines) {
    return lines.filter(Boolean).join("\n");
  }

  /* ---------- branch pills ---------- */

  function renderBranchPills() {
    const container = $("[data-branch-pills]");
    if (!container) return;

    container.innerHTML = Object.keys(D.branches)
      .map(
        (id) => `
        <button
          class="branch-pills__pill${id === currentBranchId ? " is-active" : ""}"
          type="button"
          aria-pressed="${id === currentBranchId}"
          data-branch="${id}"
        >
          ${escapeHTML(D.branches[id].name)}
        </button>`
      )
      .join("");

    $$(".branch-pills__pill", container).forEach((pill) => {
      pill.addEventListener("click", () => setBranch(pill.dataset.branch));
    });
  }

  /* ---------- products ---------- */

  function renderProducts() {
    const grid = $("[data-products]");
    if (!grid) return;

    grid.innerHTML = D.products
      .map((product) => {
        const price = formatPrice(product.prices[currentBranchId]);
        return `
        <article
          class="product group fade-up"
          data-product-id="${escapeHTML(product.id)}"
          role="button"
          tabindex="0"
          aria-label="Order ${escapeHTML(product.name)} (${escapeHTML(
            getBranch().name
          )}) via WhatsApp"
          data-whatsapp-add
        >
          <div class="product__media">
            <img
              class="product__image image-matte"
              src="${product.image}"
              alt="${escapeHTML(product.alt)}"
              loading="lazy"
              width="512"
              height="640"
            >
            <div class="product__overlay">
              <div class="product__caption">
                <div>
                  <h4 class="product__name">${escapeHTML(product.name)}</h4>
                  <p class="product__note">${escapeHTML(product.tastingNote)}</p>
                </div>
                <p class="product__price">${escapeHTML(price)}</p>
              </div>
            </div>
          </div>
        </article>`;
      })
      .join("");

    $$("[data-whatsapp-add]", grid).forEach((card) => {
      card.addEventListener("click", () => orderProduct(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          orderProduct(card);
        }
      });
    });
  }

  function orderProduct(card) {
    const product = D.products.find((p) => p.id === card.dataset.productId);
    if (!product) return;
    const branch = getBranch();
    openWhatsApp(
      joinMessage([
        `Hello Coffee Wizard (${branch.name})!`,
        "",
        "I'd like to order:",
        `• ${product.name} — ${formatPrice(product.prices[currentBranchId])}`,
        "",
        "Thank you!",
      ])
    );
  }

  /* ---------- gallery ---------- */

  function renderGallery() {
    const grid = $("[data-gallery]");
    if (!grid) return;

    const keys = getBranch().galleryKeys || [];
    const images = keys.map((key) => D.galleryImages[key]).filter(Boolean);
    grid.innerHTML = images
      .map(
        (img) => `
        <figure class="gallery__item group fade-up">
          <img
            class="image-matte"
            src="${img.src}"
            alt="${escapeHTML(img.alt)}"
            loading="lazy"
            width="800"
            height="1000"
          >
        </figure>`
      )
      .join("");
  }

  /* ---------- location / contact ---------- */

  function renderLocation() {
    const branch = getBranch();
    const note = $("[data-location-note]");
    const maps = $("[data-maps]");
    const call = $("[data-call]");

    if (note) note.textContent = branch.locationNote;
    if (maps) {
      maps.setAttribute("href", branch.mapsUrl);
      maps.setAttribute("aria-label", "Open " + branch.name + " in Google Maps");
    }
    if (call) {
      call.setAttribute("href", "tel:" + branch.tel);
      call.setAttribute("aria-label", "Call " + branch.name);
    }
  }

  function renderSocials() {
    const branch = getBranch();
    $$("[data-social]").forEach((link) => {
      if (link.dataset.social === "facebook") link.href = branch.facebook;
      if (link.dataset.social === "instagram") link.href = branch.instagram;
      if (link.dataset.social === "whatsapp")
        link.href = "https://wa.me/" + branch.whatsapp;
    });
  }

  function initDomainLinks() {
    $$("[data-domain]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        setBranch(link.dataset.domain);
        const menu = $("#menu");
        if (menu) menu.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  /* ---------- hero branch selector & booking ---------- */

  function renderHeroBranches() {
    const list = $("[data-hero-branches]");
    if (!list) return;
    const ids = Object.keys(D.branches);

    list.innerHTML = ids
      .map((id, index) => {
        const branch = D.branches[id];
        const active = id === currentBranchId;
        return `
        <button
          class="hero__branch${active ? " is-active" : ""}"
          type="button"
          role="radio"
          aria-checked="${active}"
          tabindex="${active ? 0 : -1}"
          data-branch="${escapeHTML(id)}"
        >
          <span class="hero__branch-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="hero__branch-name">${escapeHTML(branch.name)}</span>
          <span class="hero__branch-note">${escapeHTML(branch.locationNote)}</span>
        </button>`;
      })
      .join("");

    const radios = $$(".hero__branch", list);
    radios.forEach((btn) => {
      btn.addEventListener("click", () => setBranch(btn.dataset.branch));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          moveHeroRadio(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          moveHeroRadio(-1);
        }
      });
    });

    function moveHeroRadio(delta) {
      const current = ids.indexOf(currentBranchId);
      const next = ids[(current + delta + ids.length) % ids.length];
      setBranch(next);
      requestAnimationFrame(() => {
        const active = $("[data-hero-branches] .hero__branch.is-active");
        if (active) active.focus();
      });
    }
  }

  function updateHeroBook() {
    const branch = getBranch();
    const btn = $("[data-hero-book]");
    if (!btn) return;
    btn.href = "tel:" + branch.tel;
    btn.setAttribute(
      "aria-label",
      "Book a table at Coffee Wizard " + branch.name + " by phone"
    );
  }

  /* ---------- switch branch ---------- */

  function setBranch(id) {
    if (!D.branches[id] || id === currentBranchId) return;
    currentBranchId = id;
    localStorage.setItem(D.storageKey, id);
    renderBranchPills();
    renderHeroBranches();
    updateHeroBook();
    renderProducts();
    renderGallery();
    renderLocation();
    renderSocials();
    observeReveals();
  }

  /* ---------- full-screen menu overlay ---------- */

  function initMenuOverlay() {
    const toggle = $("#menu-toggle");
    const overlay = $("#nav-menu");
    const closeBtn = $("#menu-close");
    if (!toggle || !overlay || !closeBtn) return;

    function setOpen(open) {
      overlay.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", () => setOpen(!overlay.classList.contains("open")));
    closeBtn.addEventListener("click", () => setOpen(false));

    $$("[data-curtain-close]", overlay).forEach((el) =>
      el.addEventListener("click", () => setOpen(false))
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) setOpen(false);
    });
  }

  /* ---------- scroll reveals ---------- */

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  function observeReveals() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    $$(".fade-up").forEach((el) => {
      if (el.classList.contains("visible")) return;
      revealObserver.observe(el);
    });
  }

  /* ---------- hero video (scroll-scrubbed cinematic) ---------- */

  /**
   * Scroll-scrubbed 100-frame coffee ritual.
   *
   * The hero is pinned inside the [data-hero-scroll] wrapper (sticky child).
   * Scroll position maps linearly to the video's currentTime:
   *   0% scroll → Frame 0, 100% scroll → Frame 99 (video.duration).
   * Scrolling up reverses the animation; the video is never autoplayed or
   * looped — it only ever shows the frame the scroll dictates.
   *
   * Performance: the window scroll handler only marks a dirty flag; the
   * actual scrub runs once per requestAnimationFrame tick, and the scroll
   * baseline is measured on load/resize so no layout reads happen on scroll.
   */
  function initHeroVideo() {
    const video = $("[data-hero-video]");
    const scope = $("[data-hero-scroll]");
    const fill = $("[data-hero-progress] .hero__progress-fill");
    const textEls = $$("[data-hero-anim]");
    const selectEl = $("[data-hero-select]");
    if (!video || !scope) return;

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const seg = (t, a, b) => (b <= a ? (t >= a ? 1 : 0) : clamp01((t - a) / (b - a)));
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    // Scroll-staged text choreography. Each element enters with a subtle
    // rise + de-blur, holds, then hands off upward as the branch selector
    // arrives from below — all on the same 0..1 progress as the frames.
    const TEXT_STAGE = {
      eyebrow: { in: [0.0, 0.1], out: [0.7, 0.84], y: 14, blur: 6 },
      title: { in: [0.05, 0.22], out: [0.62, 0.82], y: 26, blur: 8 },
      sub: { in: [0.14, 0.32], out: [0.68, 0.88], y: 20, blur: 6 },
      cta: { in: [0.24, 0.42], out: [0.74, 0.9], y: 16, blur: 6 },
      hint: { in: [0.3, 0.42], out: [0.5, 0.6], y: 10, blur: 0 },
    };
    const SELECT_STAGE = { in: [0.84, 1], y: 30 };

    let baseTop = 0;
    let travel = 0;
    let ticking = false;
    let selectActive = false;

    // Only write a style when its value actually changed (cheap rAF scrub).
    const styleCache = new WeakMap();
    function setStyle(el, prop, value) {
      let cache = styleCache.get(el);
      if (!cache) {
        cache = {};
        styleCache.set(el, cache);
      }
      if (cache[prop] === value) return;
      cache[prop] = value;
      el.style[prop] = value;
    }

    function measure() {
      const rect = scope.getBoundingClientRect();
      baseTop = rect.top + window.pageYOffset;
      travel = scope.offsetHeight - window.innerHeight;
    }

    function applyProgress(progress) {
      paintText(progress);
      paintSelect(progress);
      if (!video.duration || video.readyState < 1) return;
      const time = progress * video.duration;
      if (Math.abs(video.currentTime - time) > 0.005) {
        video.currentTime = time;
      }
      if (fill) setStyle(fill, "transform", "scaleX(" + progress.toFixed(4) + ")");
    }

    function paintText(progress) {
      textEls.forEach((el) => {
        const cfg = TEXT_STAGE[el.dataset.heroAnim];
        if (!cfg) return;
        const i = easeInOutCubic(clamp01(seg(progress, cfg.in[0], cfg.in[1])));
        const o = easeInOutCubic(clamp01(1 - seg(progress, cfg.out[0], cfg.out[1])));
        setStyle(el, "opacity", (i * o).toFixed(3));
        const y = (1 - i) * cfg.y - (1 - o) * cfg.y * 0.55;
        setStyle(el, "transform", "translate3d(0," + y.toFixed(1) + "px,0)");
        if (cfg.blur) {
          const b = cfg.blur * (1 - i);
          setStyle(el, "filter", b > 0.2 ? "blur(" + b.toFixed(2) + "px)" : "");
        }
      });
    }

    function paintSelect(progress) {
      if (!selectEl) return;
      const i = easeInOutCubic(clamp01(seg(progress, SELECT_STAGE.in[0], SELECT_STAGE.in[1])));
      setStyle(selectEl, "opacity", i.toFixed(3));
      setStyle(
        selectEl,
        "transform",
        "translate3d(0," + ((1 - i) * SELECT_STAGE.y).toFixed(1) + "px,0)"
      );
      if (i >= 0.98) {
        if (!selectActive) {
          selectActive = true;
          selectEl.classList.add("is-active");
        }
      } else if (selectActive) {
        selectActive = false;
        selectEl.classList.remove("is-active");
      }
    }

    function update() {
      if (travel <= 0) {
        applyProgress(0);
        return;
      }
      const progress = clamp01((window.pageYOffset - baseTop) / travel);
      applyProgress(progress);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    measure();
    update();
    video.addEventListener("loadedmetadata", () => {
      update();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      onScroll();
    }, { passive: true });
    window.addEventListener("orientationchange", () => {
      measure();
      onScroll();
    }, { passive: true });
  }

  /* ---------- init ---------- */

  function init() {
    renderBranchPills();
    renderHeroBranches();
    updateHeroBook();
    renderProducts();
    renderGallery();
    renderLocation();
    renderSocials();
    initMenuOverlay();
    initHeroVideo();
    initDomainLinks();
    observeReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();