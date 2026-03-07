# 🛡️ Reporte de Calidad y Métricas - Proyecto HOMA

Este documento centraliza todas las estrategias, configuraciones y herramientas de aseguramiento de calidad (QA), control de calidad (QC), seguridad y monitoreo de métricas implementadas en el proyecto **HOMA**.

---

## 1. Aseguramiento de Calidad Funcional y de Seguridad

Hemos implementado múltiples capas para garantizar que el aplicativo sea seguro, estable y ofrezca una excelente experiencia de usuario:

### 🔒 Seguridad y Prevención de Bots
*   **Cloudflare Turnstile (CAPTCHA Invisible):** Se implementó protección anti-bots en los formularios de registro y login. Evita ataques de fuerza bruta y creación de cuentas falsas, garantizando que los usuarios sean humanos sin comprometer la UX (no requiere resolver acertijos pesados).
*   **JWT y Spring Security:** Protección de todos los endpoints del backend, encriptación de contraseñas usando `BCrypt` y validación robusta basada en roles (HUESPED, ANFITRION, ADMIN).
*   **AWS CloudFront (HTTPS):** Proxy inverso global que asegura que todo el tráfico entre la aplicación (frontend) y el usuario viaje encriptado (SSL/TLS), evitando problemas de "Mixed Content" o ataques _Man-In-The-Middle_.

### 🎨 Calidad de Interfaz (UI) y Experiencia de Usuario (UX)
*   **Skeleton Loaders:** Prevención del "salto de contenido" (Cumulative Layout Shift) y reducción de la ansiedad del usuario. Mientras se solicitan los datos al backend (ej. lista de administradores o alojamientos), se muestran animaciones de carga fluidas.
*   **Manejo de Estados de Error y Vacíos:** Mensajes claros de _"No se encontraron alojamientos"_ o _"No hay usuarios"_, evitando tablas invisibles o rotas.
*   **Unificación Temática:** Consistencia del diseño (Design System). Se eliminaron clases huérfanas o estilos contradictorios (ej. restos de _Dark Mode_) en componentes administrativos para asegurar contraste, accesibilidad y profesionalismo (panel 100% luminoso).
*   **Fallback de Imágenes:** Mecanismo automático en Angular que, si una imagen alojada por un anfitrión se cae o se rompe en el origen, la reemplaza por un _placeholder_ agradable sin deformar la tabla.

### ⚙️ Integración y Despliegue Continuo (CI/CD)
*   **GitHub Actions Automation:** Cada vez que se realiza un _Push_ hacia la rama principal, se accionan flujos que _buildean_ Angular, validan y compilan. Esto evita que código defectuoso rompa los entornos de producción.

---

## 2. Monitoreo y Observabilidad (Prometheus + Grafana)

Para la calidad a nivel operativo (SRE - Site Reliability Engineering), HOMA cuenta con su propio cluster de monitoreo dockerizado (`homa-monitoring`) que se conecta internamente en el VPS.

### 📡 Micrometer y Spring Boot Actuator
El servidor expone un endpoint puro (`/api/actuator/prometheus`) de telemetría, inyectando variables directamente desde la base de datos (Gauges) y a través del uso de los servicios (Counters/Timers).

---

## 3. Fórmulas de las Métricas de Negocio (PromQL)

A continuación se documentan las **fórmulas formales** (en lenguaje *PromQL* usado por Grafana) de las métricas que se establecieron en el modelo de negocio para el proyecto HOMA. Estas te servirán para programar los paneles o en caso de auditoría técnica.

### 💳 1. Tasa de Conversión de Registro a Reserva (Engagement)
Mide cuántas reservas confirmadas hay en comparación a los nuevos usuarios registrados.
*   **Fórmula PromQL:**
    ```promql
    sum(increase(homa_reservas_total{accion="confirmada"}[24h])) 
    / 
    sum(increase(homa_registros_total[24h])) * 100
    ```
*   **Objetivo de Calidad:** > 30% en el mediano plazo.

### ❌ 2. Tasa de Cancelación de Reservas (Churn Rate)
Identifica el volumen de reservas que se cancelan versus las que se crean. Un valor alto alerta sobre la calidad de los alojamientos o el compromiso de los anfitriones.
*   **Fórmula PromQL:**
    ```promql
    sum(rate(homa_reservas_total{accion="cancelada"}[24h])) 
    / 
    sum(rate(homa_reservas_total{accion="creada"}[24h])) * 100
    ```

### 🔐 3. Tasa de Éxito de Login (Salud de la Autenticación)
Ayuda a determinar si hay bots atacando el sitio o si hay fallos en el servicio de autenticación.
*   **Fórmula PromQL:**
    ```promql
    sum(rate(homa_logins_total{resultado="exitoso"}[5m])) 
    / 
    sum(rate(homa_logins_total[5m])) * 100
    ```

### 📈 4. Distribución del Inventario (Dinámica de Oferta)
Nos permite ver el crecimiento constante de las propiedades publicadas y qué porcentaje del inventario orgánico de la base de datos se mantiene verdaderamente activo.
*   **Fórmula PromQL (Disponibilidad Activa):**
    ```promql
    homa_alojamientos_activos / (homa_alojamientos_activos + homa_alojamientos_pendientes_revision) * 100
    ```
*   **Crecimiento diario de alojamientos:**
    ```promql
    increase(homa_alojamientos_total{accion="creado"}[24h])
    ```

### ⚡ 5. Latencia Crítica del Servicio (Calidad del Sistema)
Tiempo promedio real que tarda el aplicativo en hacer un _Login_, incluyendo la llamada a AWS y a la base de datos en Azure.
*   **Fórmula PromQL (Promedio):**
    ```promql
    rate(homa_login_duration_seconds_sum[5m]) 
    / 
    rate(homa_login_duration_seconds_count[5m])
    ```
*   **Fórmula del Percetil P95 (La experiencia real del 95% de los usuarios):**
    ```promql
    histogram_quantile(0.95, rate(homa_login_duration_seconds_bucket[5m]))
    ```
*   **Objetivo de Calidad:** < 0.5s (500 milisegundos).

---
*Documento generado y mantenido como parte de los estándares arquitectónicos del proyecto HOMA.*
