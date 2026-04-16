export const environment = {
  production: false,
  apiUrl: "/api",  // Usa el proxy local (proxy.conf.json → localhost:8081)
  jwtTokenKey: "homa_auth_token",
  jwtRefreshTokenKey: "homa_refresh_token",
  // Clave de Turnstile que SIEMPRE pasa (para desarrollo local)
  turnstileSiteKey: "1x00000000000000000000AA",
};
