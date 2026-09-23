(() => {
  "use strict";

  const loader = document.querySelector("script[data-analytics-loader]");
  if (!loader || window.__sellermapAnalyticsLoaded) return;

  const configUrl = loader.dataset.config || "/data/site-config.json";

  fetch(configUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((config) => {
      const analytics = config.analytics || {};
      const measurementId = String(analytics.measurementId || "").trim();

      if (!analytics.enabled || !measurementId) return;
      if (!/^G-[A-Z0-9]+$/i.test(measurementId)) {
        console.warn("SellerMap: invalid Google Analytics measurement ID.");
        return;
      }

      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
      };

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);

      window.gtag("js", new Date());
      window.gtag("config", measurementId);
      window.__sellermapAnalyticsLoaded = true;
    })
    .catch((error) => {
      console.warn("SellerMap: unable to load Google Analytics configuration.", error);
    });
})();
