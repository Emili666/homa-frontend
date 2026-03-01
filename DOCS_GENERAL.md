# Documentación del Frontend - HOMA

Frontend desarrollado en **Angular 17+** enfocado en la experiencia de usuario (UX) y accesibilidad universal.

## 🚀 Tecnologías Principales
- **Angular**: Framework robusto y escalable.
- **Tailwind CSS**: Estilado eficiente y consistente.
- **Material Icons**: Conjunto de iconos para una mejor comprensión visual.
- **NGRX (Opcional)**: Para gestión de estado compleja.
- **Service Workers**: Preparación para capacidades PWA.

## 📁 Estructura del Proyecto
- `src/app/core/`: Singleton services, modelos y constantes globales.
- `src/app/shared/`: Componentes, pipes y directivas reutilizables.
- `src/app/features/`: Módulos específicos de funcionalidades como `auth`, `admin`, `home`, etc.
- `src/app/layouts/`: Estructuras generales de página como `AdminLayout` y `MainLayout`.
- `src/app/atomic/`: Estructura basada en Diseño Atómico para componentes UI (Átomos, Moléculas, organismos).

## 🛠️ Panel de Accesibilidad
Ubicado en `src/app/shared/components/accessibility-panel/`, este componente inyecta clases CSS globales (`styles.scss`) para:
- Ajuste de tamaño de fuente.
- Alternancia de modos de alto contraste.
- Modo escala de grises.
- Fuente amigable para dislexia (OpenDyslexic).

## 🌍 Configuración Dinámica
El archivo `src/assets/config.js` permite configurar el `API_URL` sin necesidad de reconstruir la aplicación, ideal para entornos de desarrollo y producción fluctuantes.
