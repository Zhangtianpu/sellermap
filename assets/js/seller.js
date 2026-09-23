(() => {
  "use strict";

  const lang = document.body.dataset.lang === "en" ? "en" : "zh";
  const dataUrl = document.body.dataset.dataUrl || "../data/sites.json";

  const copy = {
    zh: {
      allCategories: "全部分类",
      browse: "浏览全部",
      featured: "热门入口",
      popular: "热门",
      results: (count) => `当前显示 ${count} 个网站`,
      itemCount: (count) => `${count} 个网站`,
      emptyTitle: "没有找到匹配的网站",
      emptyText: "换一个关键词试试，例如“Amazon”“物流”或“支付”。",
      failedTitle: "数据加载失败",
      failedText: "请通过本地服务器打开页面，不要直接双击 HTML 文件。"
    },
    en: {
      allCategories: "All categories",
      browse: "Browse all",
      featured: "Popular picks",
      popular: "Popular",
      results: (count) => `${count} websites shown`,
      itemCount: (count) => `${count} websites`,
      emptyTitle: "No matching websites",
      emptyText: "Try another keyword such as “Amazon”, “logistics” or “payments”.",
      failedTitle: "Unable to load data",
      failedText: "Open the site through a local server instead of loading the HTML file directly."
    }
  }[lang];

  const state = {
    data: null,
    query: "",
    filteredCount: 0,
    bannerIndex: 0,
    bannerTimer: null,
    bannerPaused: false,
    activeCategoryLock: null
  };

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const getSiteName = (site) => site.name[lang];
  const getCategoryName = (category) => category.name[lang];

  const getInitials = (value) => {
    const clean = String(value).trim();
    const words = clean.split(/\s+/).filter(Boolean);
    const latinWords = words.filter((word) => /[A-Za-z0-9]/.test(word));

    if (latinWords.length > 1) {
      return latinWords.slice(0, 2).map((word) => word.match(/[A-Za-z0-9]/)?.[0] || "").join("");
    }

    const latin = clean.match(/[A-Za-z0-9]/g);
    if (latin?.length > 1) {
      return latin.slice(0, 2).join("");
    }

    return clean.slice(0, 2);
  };

  const getHost = (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  const getHue = (value) => {
    let hash = 0;
    for (const char of value) {
      hash = (hash * 31 + char.charCodeAt(0)) % 360;
    }
    return hash;
  };

  const flattenSites = () => state.data.categories.flatMap((category) =>
    category.sites.map((site) => ({
      ...site,
      categoryId: category.id,
      categoryName: getCategoryName(category)
    }))
  );

  const setActiveCategory = (categoryId) => {
    document.querySelectorAll("[data-category-link]").forEach((link) => {
      const active = link.dataset.categoryLink === categoryId;
      link.classList.toggle("active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const renderSidebar = () => {
    const nav = document.querySelector("#category-nav");
    nav.innerHTML = state.data.categories.map((category) => `
      <a href="#${escapeHtml(category.id)}" data-category-link="${escapeHtml(category.id)}">
        <span class="category-icon" aria-hidden="true">${escapeHtml(category.icon)}</span>
        <span>${escapeHtml(getCategoryName(category))}</span>
        <span class="category-count">${category.sites.length}</span>
      </a>
    `).join("");

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-category-link]");
      if (!link) return;

      state.activeCategoryLock = link.dataset.categoryLink;
      setActiveCategory(state.activeCategoryLock);
      document.body.classList.remove("menu-open");

      window.setTimeout(() => {
        state.activeCategoryLock = null;
      }, 800);
    });
  };

  const renderQuickLinks = () => {
    const container = document.querySelector("#quick-links");
    const featured = flattenSites().filter((site) => site.featured).slice(0, 7);
    container.innerHTML = featured.map((site) => `
      <a class="quick-link" href="${escapeHtml(site.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(getSiteName(site))}
      </a>
    `).join("");
  };

  const renderSections = () => {
    const container = document.querySelector("#sections");
    container.innerHTML = state.data.categories.map((category) => {
      const cards = category.sites.map((site) => renderCard(site)).join("");
      return `
        <section class="category-section" id="${escapeHtml(category.id)}" data-category="${escapeHtml(category.id)}">
          <div class="section-head">
            <div class="section-title-wrap">
              <span class="section-icon" aria-hidden="true">${escapeHtml(category.icon)}</span>
              <div>
                <h2 class="section-title">${escapeHtml(getCategoryName(category))}</h2>
                <p class="section-description">${escapeHtml(category.description[lang])}</p>
              </div>
            </div>
            <span class="section-total" data-section-total="${escapeHtml(category.id)}">${copy.itemCount(category.sites.length)}</span>
          </div>
          <div class="site-grid">${cards}</div>
        </section>
      `;
    }).join("");
  };

  const renderCard = (site) => {
    const name = getSiteName(site);
    const tags = site.tags[lang].join(" ");
    const searchable = [
      name,
      site.description[lang],
      tags,
      getHost(site.url),
      site.categoryName
    ].join(" ").toLocaleLowerCase(lang);

    return `
      <a
        class="site-card"
        href="${escapeHtml(site.url)}"
        target="_blank"
        rel="noopener noreferrer"
        style="--accent-h: ${getHue(site.url)}"
        data-search="${escapeHtml(searchable)}"
        data-site-name="${escapeHtml(name)}"
      >
        ${site.featured ? `<span class="featured-badge">${copy.popular}</span>` : ""}
        <span class="site-logo" aria-hidden="true">${escapeHtml(getInitials(name))}</span>
        <span class="site-main">
          <strong class="site-name">${escapeHtml(name)}</strong>
          <span class="site-description">${escapeHtml(site.description[lang])}</span>
          <span class="site-domain">${escapeHtml(getHost(site.url))}</span>
        </span>
      </a>
    `;
  };

  const showBanner = (index) => {
    const banners = state.data.banners || [];
    const slides = Array.from(document.querySelectorAll(".promo-slide"));
    const dots = Array.from(document.querySelectorAll(".banner-dot"));
    if (!banners.length || !slides.length) return;

    state.bannerIndex = (index + banners.length) % banners.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === state.bannerIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active;
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === state.bannerIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  };

  const stopBannerTimer = () => {
    if (state.bannerTimer) {
      window.clearInterval(state.bannerTimer);
      state.bannerTimer = null;
    }
  };

  const startBannerTimer = () => {
    const banners = state.data.banners || [];
    if (banners.length < 2 || state.bannerPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopBannerTimer();
    state.bannerTimer = window.setInterval(() => {
      showBanner(state.bannerIndex + 1);
    }, 5200);
  };

  const renderBanners = () => {
    const banners = state.data.banners || [];
    const section = document.querySelector("#banner-carousel");
    const viewport = document.querySelector("#banner-viewport");
    const dots = document.querySelector("#banner-dots");

    section.hidden = banners.length === 0;
    if (!banners.length) return;

    viewport.innerHTML = banners.map((banner) => `
      <article class="promo-slide" data-theme="${escapeHtml(banner.theme)}" aria-hidden="true" inert>
        <div class="promo-copy">
          <span class="promo-label">${escapeHtml(banner.label[lang])}</span>
          <h2>${escapeHtml(banner.title[lang])}</h2>
          <p>${escapeHtml(banner.description[lang])}</p>
          <a class="promo-cta" href="${escapeHtml(banner.url)}" target="_blank" rel="noopener noreferrer sponsored">
            ${escapeHtml(banner.cta[lang])} <span aria-hidden="true">→</span>
          </a>
        </div>
        <div class="promo-visual" aria-hidden="true">
          <span class="promo-ring promo-ring-one"></span>
          <span class="promo-ring promo-ring-two"></span>
          <span class="promo-icon">${escapeHtml(banner.icon)}</span>
          <i class="promo-spark promo-spark-one"></i>
          <i class="promo-spark promo-spark-two"></i>
        </div>
      </article>
    `).join("");

    dots.innerHTML = banners.map((banner, index) => `
      <button
        class="banner-dot"
        type="button"
        data-banner-dot="${index}"
        aria-label="${escapeHtml(banner.title[lang])}"
        aria-current="false"
      ></button>
    `).join("");

    document.querySelector(".banner-arrows").hidden = banners.length < 2;
    dots.hidden = banners.length < 2;

    document.querySelector("[data-banner-prev]").addEventListener("click", () => {
      showBanner(state.bannerIndex - 1);
      startBannerTimer();
    });

    document.querySelector("[data-banner-next]").addEventListener("click", () => {
      showBanner(state.bannerIndex + 1);
      startBannerTimer();
    });

    dots.addEventListener("click", (event) => {
      const dot = event.target.closest("[data-banner-dot]");
      if (!dot) return;
      showBanner(Number(dot.dataset.bannerDot));
      startBannerTimer();
    });

    section.addEventListener("mouseenter", () => {
      state.bannerPaused = true;
      stopBannerTimer();
    });

    section.addEventListener("mouseleave", () => {
      state.bannerPaused = false;
      startBannerTimer();
    });

    section.addEventListener("focusin", () => {
      state.bannerPaused = true;
      stopBannerTimer();
    });

    section.addEventListener("focusout", (event) => {
      if (!section.contains(event.relatedTarget)) {
        state.bannerPaused = false;
        startBannerTimer();
      }
    });

    section.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showBanner(state.bannerIndex - 1);
      if (event.key === "ArrowRight") showBanner(state.bannerIndex + 1);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopBannerTimer();
      else startBannerTimer();
    });

    showBanner(0);
    startBannerTimer();
  };

  const applyFilter = () => {
    const query = state.query.trim().toLocaleLowerCase(lang);
    let visibleCount = 0;

    state.data.categories.forEach((category) => {
      const section = document.querySelector(`[data-category="${CSS.escape(category.id)}"]`);
      const cards = Array.from(section.querySelectorAll(".site-card"));
      let visibleInSection = 0;

      cards.forEach((card) => {
        const matches = !query || card.dataset.search.includes(query);
        card.hidden = !matches;
        if (matches) {
          visibleInSection += 1;
          visibleCount += 1;
        }
      });

      section.hidden = visibleInSection === 0;
      section.querySelector(`[data-section-total="${CSS.escape(category.id)}"]`).textContent = query
        ? copy.itemCount(visibleInSection)
        : copy.itemCount(category.sites.length);
    });

    state.filteredCount = visibleCount;
    document.querySelector("#result-count").textContent = copy.results(visibleCount);
    document.querySelector("#empty-state").hidden = visibleCount !== 0;
  };

  const bindSearch = () => {
    const input = document.querySelector("#site-search");
    input.addEventListener("input", () => {
      state.query = input.value;
      applyFilter();
    });

    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
    if (initialQuery) {
      input.value = initialQuery;
      state.query = initialQuery;
      applyFilter();
    }

    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        input.value = "";
        state.query = "";
        applyFilter();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        event.preventDefault();
        input.focus();
      }
    });
  };

  const bindMenu = () => {
    const toggle = document.querySelector(".menu-toggle");
    const backdrop = document.querySelector(".sidebar-backdrop");

    toggle.addEventListener("click", () => {
      document.body.classList.toggle("menu-open");
    });

    backdrop.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        document.body.classList.remove("menu-open");
      }
    });
  };

  const bindActiveNavigation = () => {
    const links = Array.from(document.querySelectorAll("[data-category-link]"));
    const sections = Array.from(document.querySelectorAll(".category-section"));
    if (!links.length || !sections.length) return;

    let ticking = false;

    const updateActiveCategory = () => {
      ticking = false;

      if (state.activeCategoryLock) {
        setActiveCategory(state.activeCategoryLock);
        return;
      }

      const topbarHeight = document.querySelector(".topbar")?.getBoundingClientRect().height || 0;
      const marker = window.scrollY + topbarHeight + 70;
      const nearPageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      let activeSection = sections[0];

      if (nearPageBottom) {
        activeSection = sections[sections.length - 1];
      } else {
        sections.forEach((section) => {
          const sectionTop = section.getBoundingClientRect().top + window.scrollY;
          if (sectionTop <= marker) activeSection = section;
        });
      }

      setActiveCategory(activeSection.id);
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveCategory);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateActiveCategory();
  };

  const renderMeta = () => {
    const categories = state.data.categories.length;
    const sites = flattenSites().length;
    document.querySelector("#category-total").textContent = categories;
    document.querySelector("#site-total").textContent = sites;
    document.querySelector("#mobile-category-total").textContent = categories;
    document.querySelector("#year").textContent = new Date().getFullYear();
  };

  const showFailure = () => {
    document.querySelector("#sections").innerHTML = `
      <div class="empty-state">
        <div>
          <div class="empty-icon" aria-hidden="true">!</div>
          <h3>${copy.failedTitle}</h3>
          <p>${copy.failedText}</p>
        </div>
      </div>
    `;
  };

  const init = async () => {
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = await response.json();
      renderSidebar();
      renderQuickLinks();
      renderBanners();
      renderSections();
      renderMeta();
      bindSearch();
      bindMenu();
      bindActiveNavigation();
    } catch (error) {
      console.error("SellerMap data loading failed:", error);
      showFailure();
    }
  };

  init();
})();
