# Inventory-Visor

Fleet Inventory Soporte Tier 1 — SPA migrada a **React + TypeScript + Vite + Tailwind + shadcn/ui**.

Herramienta interna para procesar, cruzar y consultar inventario de flota (Guardian, FFC, GPS, SIMs M2M) a partir de reportes CSV/XLSX.

## Módulos

- **Exportar** — Carga reportes (carpeta o archivos sueltos), cruza fuentes y genera el inventario consolidado exportable a XLSX.
- **Visor** — Tabla del inventario consolidado con filtros multivalor desplegables por columna, ordenamiento, paginación (incluida opción *Todos*) y exportación de la vista filtrada.
- **Gestión SIM** — Vista enfocada en SIMs Guardian/FFC/GPS.
- **SIMs M2M** — Inventario de SIMs M2M derivado del reporte de SIMs.
- **Cobro** — Vista de cobro derivada de los datos M2M.

## Stack

- React 18 + TypeScript
- Vite (build/dev)
- Tailwind CSS + shadcn/ui
- Parsing XLSX/CSV en cliente (sin backend)

## Desarrollo

```bash
cd app
npm install
npm run dev      # servidor local
npm run build    # build de producción
```

## Datos

Los reportes de flota (CSV/XLSX) contienen datos sensibles (IMEI, SIM, cuentas) y **no se versionan** — ver `Archivos de datos/` en `.gitignore`. Cárgalos localmente desde la pestaña **Exportar**.
