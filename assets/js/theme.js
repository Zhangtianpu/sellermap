(() => {
  "use strict";

  const storageKey = "sellermap-theme";

  const applyTheme = (theme) => {
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    const button = document.querySelector("#theme-toggle");
    const label = button?.querySelector(".theme-toggle-label");
    const nextTheme = normalizedTheme === "dark" ? "light" : "dark";
    const nextLabel = nextTheme === "dark"
      ? (button?.dataset.themeDarkLabel || "Dark")
      : (button?.dataset.themeLightLabel || "Light");
    const isChinese = document.documentElement.lang.toLowerCase().startsWith("zh");

    document.documentElement.dataset.theme = normalizedTheme;

    if (button) {
      button.setAttribute("aria-pressed", String(normalizedTheme === "dark"));
      button.setAttribute(
        "aria-label",
        isChinese ? `切换为${nextLabel}背景` : `Switch to ${nextLabel.toLowerCase()} background`
      );
      button.title = button.getAttribute("aria-label");
    }

    if (label) {
      label.textContent = nextLabel;
    }
  };

  const initTheme = () => {
    const button = document.querySelector("#theme-toggle");
    const initialTheme = document.documentElement.dataset.theme
      || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    applyTheme(initialTheme);

    button?.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch {
        // Theme still works for the current page when storage is unavailable.
      }
    });

    window.addEventListener("storage", (event) => {
      if (event.key === storageKey && (event.newValue === "dark" || event.newValue === "light")) {
        applyTheme(event.newValue);
      }
    });
  };

  initTheme();
})();
