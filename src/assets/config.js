// Configuración dinámica para la aplicación Angular
// Se ejecuta ANTES de que cargue la app
// En local: usa /api (proxy de Angular → localhost:8081)
// En producción (Docker/Azure): el docker-entrypoint.sh sobreescribe este archivo

(function () {
  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};

  // Solo asignar si no fue inyectado por el servidor (Docker/Azure)
  if (!window.__APP_CONFIG__.API_URL) {
    window.__APP_CONFIG__.API_URL = "/api";
  }

  console.log("[App Config] Initialized with API URL:", window.__APP_CONFIG__.API_URL);
})();
