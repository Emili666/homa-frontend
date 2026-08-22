# HOMA — Frontend

Cliente web en **Angular 17** para HOMA, una plataforma de alquiler de alojamientos estilo Airbnb. Consume la API de [`homa-backend`](https://github.com/Emili666/homa-backend) y permite a clientes reservar alojamientos y a anfitriones publicarlos y gestionarlos.

## Funcionalidades por módulo

- **Auth**: registro, login, activación de cuenta por correo, recuperación de contraseña.
- **Alojamientos**: búsqueda, listado, detalle, mapa interactivo con Leaflet.
- **Reservas**: creación de reservas, vista de "mis reservas" (cliente) y gestión de reservas recibidas (anfitrión).
- **Anfitrión**: panel para publicar y administrar alojamientos, imágenes, y responder reseñas.
- **Perfil**: edición de datos de usuario y cambio de contraseña.
- **Admin**: panel de administración (gestión de usuarios y reservas).
- **Home**: landing pública con alojamientos destacados.

## Stack técnico

| Categoría | Tecnología |
|---|---|
| Framework | Angular 17 |
| Mapas | Leaflet |
| Estilos | Tailwind CSS |
| HTTP / Estado | RxJS, interceptores (JWT, manejo de errores) |
| Guards | Auth guard, Role guard |
| Servidor de producción | Express (`azure-server.js`) detrás de Nginx |
| Contenedores | Docker |

## Arquitectura del proyecto

El código sigue una organización por **features** (módulos de negocio) más una capa de **diseño atómico** para componentes reutilizables:

```
src/app/
├── atomic/       # Design system: atoms (button, input, label), molecules, organisms, templates
├── core/         # Guards, interceptors, modelos, servicios transversales
├── features/     # Módulos de negocio: auth, home, alojamientos, reservas, anfitrion, perfil, admin, activar-cuenta
├── layouts/      # Layouts de la aplicación
└── shared/       # Componentes y utilidades compartidas
```

Esta separación entre `atomic` (componentes visuales puros) y `features` (lógica de cada sección) facilita mantener y probar la interfaz sin acoplar diseño con reglas de negocio.

## Cómo correrlo localmente

### Requisitos
- Node.js 18+
- El backend de HOMA corriendo (ver [`homa-backend`](https://github.com/Emili666/homa-backend)) o apuntado a un entorno desplegado.

### Pasos

```bash
npm install
ng serve
```

La aplicación queda disponible en `http://localhost:4200/` y recarga automáticamente al modificar el código.

Configura la URL del backend en `public/config.js` o mediante el proxy (`proxy.conf.json`) según el entorno.

### Build de producción

```bash
ng build
```

Los artefactos quedan en `dist/`.

### Con Docker

```bash
docker build -t homa-frontend .
docker run -p 4200:80 homa-frontend
```

## Documentación adicional

El repositorio incluye documentación específica por área:
- `DOCS_GENERAL.md` — visión general del frontend.
- `DOCS_ADMIN_PANEL.md` — panel de administración.
- `DOCS_METRICS.md` / `CALIDAD_Y_METRICAS.md` — métricas y calidad de código.

## Proyecto relacionado

Este frontend consume la API de [`homa-backend`](https://github.com/Emili666/homa-backend), construido en Spring Boot.
