// Configuración dinámica para la aplicación Angular
// Se ejecuta ANTES de que cargue la app

(function () {
  // Leer API_URL de variables de ambiente o usar default
  const apiUrl = window.__APP_CONFIG__?.API_URL || "https://homa-backend-env.eba-kgutjr8m.us-east-2.elasticbeanstalk.com/api";

  // Crear variable global para que Angular la use
  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
  window.__APP_CONFIG__.API_URL = apiUrl;

  console.log("[App Config] Initialized with API URL:", apiUrl);
})();
