export const environment = {
  production: false,
  apiUrl: "http://localhost:8081/api",
  jwtTokenKey: "homa_auth_token",
  jwtRefreshTokenKey: "homa_refresh_token",
  // Clave de testing de Cloudflare que SIEMPRE muestra el widget y pasa
  // Para produccion reemplazar con la Site Key real del panel de Cloudflare
  turnstileSiteKey: "1x00000000000000000000BB",
};
