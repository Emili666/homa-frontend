// Configuración dinámica para la aplicación Angular
// Se ejecuta ANTES de que cargue la app

(function () {
  // Leer API_URL de variables de ambiente o usar localhost para desarrollo
  const apiUrl = window.__APP_CONFIG__?.API_URL || "http://localhost:8081/api";

  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
  window.__APP_CONFIG__.API_URL = apiUrl;

  console.log("[App Config] Initialized with API URL:", apiUrl);
})();
