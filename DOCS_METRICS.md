# Sistema de Métricas y Cálculos - HOMA

Este documento detalla las fórmulas utilizadas para medir el estado y rendimiento de la plataforma.

## 📊 Indicadores Clave de Desempeño (KPIs)

### 1. Usuarios Totales (Total Users)
Calcula el número de personas registradas en el sistema.
- **Fórmula**: `COUNT(Usuario)`
- **Uso**: Medida básica de adopción por parte del mercado.

### 2. Alojamientos Registrados (Registered Accommodations)
Número de propiedades publicadas y aprobadas.
- **Fórmula**: `COUNT(Alojamiento)`
- **Uso**: Representa el inventario disponible.

### 3. Reservas Activas (Active Bookings)
Número de estadías que se están llevando a cabo actualmente o que están programadas.
- **Fórmula**: `COUNT(Reserva) WHERE estado = 'CONFIRMADA' AND fecha_fin >= TODAY`
- **Uso**: Indica la utilización real de la plataforma.

### 4. Ingresos Mensuales (Monthly Revenue)
Suma total del costo de las reservas completadas en el mes actual.
- **Fórmula**: `SUM(Reserva.precio_total) WHERE MONTH(fecha_inicio) = CURRENT_MONTH AND estado = 'COMPLETADA'`
- **Uso**: Medición de la rentabilidad del negocio.

### 📈 Cálculo de Tendencias (Trending)
Utilizado para mostrar si un KPI está subiendo o bajando respecto al mes anterior.
- **Fórmula de Porcentaje de Cambio**: `((Valor actual - Valor mes anterior) / Valor mes anterior) * 100`

## 🛠️ Implementación Técnica
Las métricas se obtienen mediante endpoints agregados en los controladores `UsuarioController`, `AlojamientoController` y `ReservaController`, permitiendo una visualización centralizada en el Dashboard del Administrador.
