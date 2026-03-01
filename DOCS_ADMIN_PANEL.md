# Documentación del Panel de Administración - HOMA

Interfaz dedicada para administradores encargados de la supervisión, moderación y análisis de la plataforma.

## 🚀 Funcionalidades Principales
- **Dashboard de Métricas**: Estadísticas en tiempo real sobre el crecimiento del sistema.
- **Gestión de Usuarios**: Administración de cuentas, cambio de estados y visualización de perfiles.
- **Moderación de Alojamientos**: Revisión y aprobación de nuevas propiedades publicadas por anfitriones.
- **Actividad Reciente**: Registro visible de las últimas acciones relevantes.

## 📁 Ubicación en el Código
- Módulo Admin: `src/app/features/admin/`
- Componentes:
  - `dashboard/`: Pantalla principal con KPIs.
  - `usuarios/`: Tabla de gestión de usuarios.
  - `alojamientos/`: Moderación de alojamientos.
- Layout: `src/app/layouts/admin-layout/`

## 🔐 Acceso y Seguridad
Solo usuarios con el rol `Administrador` pueden acceder a estas rutas. El `RoleGuard` protege el acceso frontend y el servidor Spring Security lo protege mediante JWT y decoradores `@PreAuthorize`.

## 📏 Sistema de Métricas
El panel utiliza fórmulas específicas para calcular el rendimiento del negocio, las cuales se detallan en el `METRICS_README.md`.
