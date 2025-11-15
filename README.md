# HomaFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# HOMA Frontend - Angular

Frontend de la aplicación HOMA (Gestión de Alojamientos) desarrollado con Angular 17.

## Requisitos Previos

- Node.js 18+ y npm
- Angular CLI 17+

## Instalación

\`\`\`bash
cd frontend
npm install
\`\`\`

## Desarrollo

\`\`\`bash
# Iniciar servidor de desarrollo
npm start

# La aplicación estará disponible en http://localhost:4200
\`\`\`

## Construcción

\`\`\`bash
# Build de producción
npm run build

# Los archivos se generarán en dist/homa-frontend
\`\`\`

## Pruebas

\`\`\`bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage
\`\`\`

## Estructura del Proyecto

\`\`\`
frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Servicios, guards, interceptores
│   │   ├── shared/            # Componentes compartidos
│   │   ├── features/          # Módulos de funcionalidades
│   │   └── app.module.ts
│   ├── assets/                # Imágenes, iconos, etc.
│   ├── environments/          # Configuración de ambientes
│   └── styles.scss            # Estilos globales
└── angular.json
\`\`\`

## Conexión con Backend

El frontend se conecta al backend Spring Boot en:
- **Desarrollo**: http://localhost:8080/api
- **Producción**: https://api.homa.edu.co/api

Configurar en `src/environments/environment.ts`

## Paleta de Colores HOMA

- **Primary**: #18206F (Azul Marino)
- **Secondary**: #17255A (Azul Profundo)
- **Action**: #BD1E1E (Rojo Intenso)
- **Neutral**: #F5E2C8 (Crema Cálido)
- **Accent**: #D88373 (Coral Suave)
