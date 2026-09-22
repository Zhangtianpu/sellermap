(() => {
  "use strict";

  const loader = document.querySelector("script[data-adsense-loader]");
  if (!loader) return;

  const configUrl = loader.dataset.config || "/data/site-config.json";

  fetch(configUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((config) => {
      const adsense = config.adsense || {};
      if (!adsense.enabled || !adsense.clientId) return;

      const clientId = String(adsense.clientId).trim();
      if (!/^ca-pub-\d+$/.test(clientId)) {
        console.warn("SellerMap: invalid AdSense clientId.");
        return;
      }

      const accountMeta = document.createElement("meta");
      accountMeta.name = "google-adsense-account";
      accountMeta.content = clientId;
      document.head.appendChild(accountMeta);

      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
      document.head.appendChild(script);
    })
    .catch((error) => {
      console.warn("SellerMap: unable to load AdSense configuration.", error);
    });
})();
