(function () {
  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
  if (!window.__APP_CONFIG__.API_URL) {
    window.__APP_CONFIG__.API_URL = "https://homabackend-ane5d8fueybudfaj.canadacentral-01.azurewebsites.net/api";
  }
  console.log("[App Config] Initialized with API URL:", window.__APP_CONFIG__.API_URL);
})();
