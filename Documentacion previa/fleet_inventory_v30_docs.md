# Fleet Inventory v30 — Documentación Técnica

**Versión:** 30  
**Archivo fuente:** `fleet_inventory_v30.html`  
**Fecha de documentación:** 2026-06-30  
**Tipo:** SPA (Single Page Application) monolítica en HTML/CSS/JS vanilla

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Sistema de diseño CSS](#2-sistema-de-diseño-css)
3. [Módulo Exportar](#3-módulo-exportar)
4. [Módulo Visor](#4-módulo-visor)
5. [Módulo Gestión de SIM](#5-módulo-gestión-de-sim)
6. [Módulo SIMs M2M](#6-módulo-sims-m2m)
7. [Módulo Cobro](#7-módulo-cobro)
8. [Flujo de datos y procesamiento](#8-flujo-de-datos-y-procesamiento)
9. [Estructuras de CSV y campos esperados](#9-estructuras-de-csv-y-campos-esperados)
10. [Campos de salida completos](#10-campos-de-salida-completos)
11. [Glosario](#11-glosario)

---

## 1. Arquitectura General

### Estructura de la aplicación

La aplicación es una SPA monolítica contenida en un único archivo HTML de ~3.100 líneas. No requiere servidor, bundler ni dependencias externas más allá de XLSX.js cargado desde CDN.

```
fleet_inventory_v30.html
├── <style>          CSS inline (design system, responsive)
├── NAV              Barra de navegación con 5 tabs
├── page-export      Módulo Exportar
├── page-visor       Módulo Visor
├── page-sim         Módulo Gestión de SIM
├── page-m2m         Módulo SIMs M2M
├── page-cobro       Módulo Cobro
└── <script>         JS inline (~2.400 líneas)
```

### Dependencias externas

| Librería | Versión | Origen |
|---|---|---|
| xlsx.js | 0.18.5 | cdnjs.cloudflare.com |
| JetBrains Mono | — | Google Fonts |
| Syne | — | Google Fonts |

### Navegación de tabs

```javascript
function switchTab(id)   // activa .page.active y .tab.active
function goToVisor()     // carga exportResult → Visor, switchTab('visor')
function goToSim()       // carga invCustom/exportResult → Gestión SIM, switchTab('sim')
function goToM2m()       // buildM2mRows() + switchTab('m2m')
```

Estado compartido entre módulos:
- `raw` — objeto global con todas las fuentes cargadas
- `exportResult` — array de `InventoryRow` producido por Export
- `m2mAllRows` — filas procesadas de SIMs M2M (usado por Cobro)

---

## 2. Sistema de Diseño CSS

### Variables CSS (`--var`)

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#08090d` | Fondo de página |
| `--s1` | `#0f1118` | Cards, panels |
| `--s2` | `#161a24` | Fondos secundarios |
| `--s3` | `#1e2333` | Thead, headers internos |
| `--b1` | `#252d42` | Bordes primarios |
| `--b2` | `#303a56` | Bordes secundarios |
| `--cyan` | `#00d4ff` | Acento principal, tabs activos, highlights |
| `--cyan2` | `#0098cc` | Gradiente cyan |
| `--green` | `#00e676` | Éxito, GEN3, activos |
| `--amber` | `#ffc107` | Advertencia, GEN1, hibernación |
| `--red` | `#ff4560` | Error, GEN?, baja |
| `--purple` | `#a78bfa` | Acento logo, GPS stats |
| `--t1` | `#f0f2ff` | Texto primario |
| `--t2` | `#8b96b8` | Texto secundario |
| `--t3` | `#4a5270` | Labels, placeholders |
| `--t4` | `#272f48` | Texto mínimo, bordes dashed |
| `--mono` | JetBrains Mono | Código, IMEIs, logs |
| `--ui` | Syne | Interfaz general |
| `--r` | `8px` | Border radius estándar |

### Clases de estado por generación Guardian

| Clase | Color | Aplica a |
|---|---|---|
| `.gen1` | amber `#ffc107` | Serial GEN1 (`P04025...`) |
| `.gen2` | cyan `#00d4ff` | Serial GEN2 (`P1002260...`, `P1001229...`) |
| `.gen3` | green `#00e676` | Serial GEN3 (`P1003100...`) |

### Responsive breakpoints

- `≤ 600px` — Mobile: padding reducido, tabla más compacta, log más corto
- `≤ 900px` — Sidebar de filtros colapsa (pasa de sticky a relativo)
- `601px–1280px` — Tabla intermedia
- `≥ 1281px` — Tabla full desktop

---

## 3. Módulo Exportar

### Archivos de origen (9 fuentes)

| ID clave | Nombre UI | Rol | Formato |
|---|---|---|---|
| `unidades` | Unidades sin comunicar | Fuente principal de unidades (flotas activas) | CSV |
| `inventory` | Inventory Report | device_registration por serial/IMEI/vehículo | CSV |
| `invCustom` | Inventory Custom | Fuente primaria de Guardians (account, fleet, serial, imei, monitored) | CSV / XLSX |
| `hardware` | Listado de Hardware | IMEI GPS → simchip (ICC), hardware_model, hardware_brand | CSV |
| `sims` | M2M SIMs | ICC / SIM por IMEI, campos Personalizado 1/2, Estado, Datos Mensual | CSV |
| `pod` | POD | SIMs secundarias. Keyed por "Subscriber ID #" (= ICC) | CSV |
| `imeiExtra` | IMEI Provisional GEN3 | Fallback: serial_number → IMEI para GEN3 aún no en sistema | CSV / XLSX |
| `ffcVersiones` | Versiones FFC (Howen) | Refina MC30 → N1/N2. Campo `[Modelo] Howen` por IMEI FFC | CSV / XLSX |
| `hwList` | Hardware List | Fuente adicional: IMEI → nombre de modelo (`name`) | CSV / XLSX |

### Funciones de carga

```javascript
function loadSource(key, inp)     // CSV genérico para: unidades, inventory, invCustom, hardware, sims, pod, hwList
function loadImeiExtra(inp)       // CSV o XLSX → raw.imeiExtra
function loadFfcVersiones(inp)    // CSV o XLSX → raw.ffcVersiones
```

`loadSource()` usa `FileReader.readAsText(file, 'UTF-8')`.  
`loadImeiExtra()` y `loadFfcVersiones()` detectan extensión `.xlsx/.xls` → `readAsArrayBuffer`, de lo contrario `readAsText`.

### parseCSV(text)

Parser CSV interno robusto:

1. Strip BOM (`﻿`)
2. Si `lines[0]` empieza con `sep=`, extrae separador custom (ej. `sep=;`)
3. Si no, auto-detecta `;` vs `,` por conteo de ocurrencias en línea 0
4. Parser field-by-field con soporte de quoted fields (`""` dentro de strings)
5. Limpieza de valores: strip `=`, strip `"`, `trim()`

### Índices construidos en startProcess()

| Mapa | Clave | Valor | Fuente |
|---|---|---|---|
| `invMap` | `normKey(serial_number)` | fila Inventory | `raw.inventory` |
| `invImei` | `normKey(imei)` | fila Inventory | `raw.inventory` |
| `invVeh` | `vehicle.toLowerCase()` | fila Inventory | `raw.inventory` |
| `invSerialMap` | `serial_number.toLowerCase()` | fila Inventory | `raw.inventory` |
| `invCustomMap` | `serial_number.toLowerCase()` | fila Custom | `raw.invCustom` |
| `invCustomImei` | `normKey(imei)` | fila Custom | `raw.invCustom` |
| `invCustomVeh` | `vehicle.toLowerCase()` | array filas Custom | `raw.invCustom` |
| `hwMap` | `normKey(imei)` (≥10 dígitos) | fila Hardware | `raw.hardware` |
| `hwAllMap` | `normKey(imei)` (sin filtro longitud) | fila Hardware | `raw.hardware` |
| `simMap` | `normKey(IMEI)` | `normKey(ICC)` | `raw.sims` + `raw.pod` |
| `simsIccMap` | `normKey(ICC)` (≥10 dígitos) | fila SIMs | `raw.sims` |
| `podIccMap` | `normKey(Subscriber ID #)` (≥10) | fila POD | `raw.pod` |
| `imeiExtraMap` | `serial_number.toLowerCase()` | `imei` string | `raw.imeiExtra` |
| `ffcVersionesMap` | `normKey(Imei)` | `[Modelo] Howen` | `raw.ffcVersiones` |
| `hwListMap` | `normKey(imei/IMEI)` (≥10) | `name/Name` | `raw.hwList` |

### Lógica de deduplicación (pre-buildRow)

Antes de procesar, `startProcess()` realiza dos pasos:

**Paso 1 — Combinar fuentes:**
```
Si raw.unidades && raw.invCustom:
  - _uSerials = Set de serials en Unidades
  - _uVehicles = Set de vehicles en Unidades
  - _extra = filas de invCustom donde serial ∉ _uSerials AND vehicle ∉ _uVehicles
  - main = [...unidades, ..._extra]
```

**Paso 2 — Deduplicar por vehicle name:**
```
Para cada vehicle name único:
  - Si hay dos filas con mismo vehicle: conservar la que TIENE serial
  - Si ambas tienen/no tienen serial: conservar la primera
  - Filas sin vehicle name: conservar siempre
```

### buildRow() — Lógica de resolución (3 pasos)

```javascript
function buildRow(r, invMap, invImei, invVeh, hwMap, hwAllMap, simMap,
                  invSerialMap, simsIccMap, imeiExtraMap, ffcVersionesMap,
                  invCustomMap, invCustomImei, invCustomVeh, podIccMap, hwListMap)
```

**Paso 1 — Inventory Custom (prioridad máxima):**
- Busca por `serial_number` → `imei` → `vehicle` (en ese orden)
- Para vehicle: si hay múltiples matches, prefiere mismo `account+fleet`, luego mismo `account`, luego fila con serial (solo si la fila origen no tiene serial propio)
- Si encuentra: extrae `serial, imeiG, cuenta, flota`

**Paso 2 — Inventory Report (fallback):**
- Busca por serial → imeiG → vehicle
- Para vehicle con múltiples matches: prefiere mismo `account+fleet`, luego mismo `account`, luego fila con serial
- Si encuentra y campo aún vacío: rellena `serial, imeiG, imeiFFC, imeiGPS`

**Paso 3 — Unidades sin comunicar (último recurso):**
- Si `serial` aún vacío → usa `guardianSerial || serial_number` de la fila origen
- Si `imeiG` aún vacío → usa `guardianImei || imei` de la fila origen

**Paso 4 — IMEI Extra (GEN3 provisional):**
- Si `imeiG` vacío y `serial` tiene valor → busca en `imeiExtraMap`

### buildRow() — Resolución de SIMs

```
simG   = simMap.get(normKey(imeiG))
simFFC = simMap.get(normKey(imeiFFC))
       || hwAllMap.get(normKey(imeiFFC))?.simchip || phonenumber

simGPS = simMap.get(normKey(imeiGPS))
       || hwAllMap.get(normKey(imeiGPS))?.simchip
```

### buildRow() — Resolución de ffcModel (4 pasos)

1. `hwListMap` por `normKey(imeiFFC)` → `name` (fuente primaria)
2. `hwAllMap` → `hardware_model` (fallback)
3. Si modelo contiene "MC30": refinar con `ffcVersionesMap` → N1/N2 (skip "UNKNOWN")
4. Si sin modelo: `ffcVersionesMap` directo (skip "UNKNOWN")

### buildRow() — Campos monitored y vehicleInstallation

```javascript
const _fleetEnabled = custRow ? (custRow.fleet_enabled||'').trim() : '';
if (_fleetEnabled === 'f') monitored = 'no';
else monitored = _resolveMonitored(custRow?.monitored)
              || _resolveMonitored(invRow?.monitored);
// _resolveMonitored: 't'/'yes' → 'yes', 'f'/'no' → 'no', else ''

vehicleInstallation = custRow?.device_registration
                   || invRow?.device_registration || '';
```

### buildRow() — Campos de detalle SIM (getSimFields)

Por cada SIM (Guardian, FFC, GPS), se busca el ICC en `simsIccMap` (primero) o `podIccMap` (fallback):

| Fuente | Campo origen SIMs | Campo destino |
|---|---|---|
| SIMs CSV | `Personalizado 1` | `{prefix}P1` |
| SIMs CSV | `Personalizado 2` | `{prefix}P2` |
| SIMs CSV | `Fecha de activación` | `{prefix}Fecha` |
| SIMs CSV | `Datos Mensual` | `{prefix}Datos` |
| SIMs CSV | `Estado` | `{prefix}Estado` |
| POD CSV | `Name` | `{prefix}P1` |
| POD CSV | `Group` | `{prefix}P2` |
| POD CSV | `Activation Date (UTC)` | `{prefix}Fecha` |
| POD CSV | `Customer's Usage Bytes` | `{prefix}Datos` |
| POD CSV | `Status` | `{prefix}Estado` |

Prefijos: `g` (Guardian), `ffc` (FFC Live), `gps` (GPS)

### Determinación de generación Guardian

```javascript
const genGuardian = (() => {
  const s = serial.toUpperCase();
  if (s.startsWith('P1003100')) return 'GEN3';
  if (s.startsWith('P1002260') || s.startsWith('P1001229')) return 'GEN2';
  if (s.startsWith('P04025'))  return 'GEN1';
  return '';
})();
```

### Fila de salida — 37 campos

```javascript
return {
  // Identidad
  cuenta, flota, vehicle, serial, imeiG, genGuardian,
  monitored,           // 'yes' | 'no' | ''
  vehicleInstallation, // device_registration
  // SIM Guardian
  simG,
  gP1, gP2, gFecha, gDatos, gEstado,
  ultimoContacto,      // guardianLastComms (sin '.000')
  // FFC Live
  imeiFFC, simFFC,
  ffcP1, ffcP2, ffcFecha, ffcDatos, ffcEstado,
  ffcModel,
  // GPS
  imeiGPS, simGPS,
  gpsP1, gpsP2, gpsFecha, gpsDatos, gpsEstado,
  temporal: ''
}
```

### doExport() — XLSX exportado (14 columnas)

| Columna XLSX | Campo interno | Notas |
|---|---|---|
| CUENTA | `cuenta` | texto |
| FLOTA | `flota` | texto |
| VEHICLEID/PATENTE | `vehicle` | texto |
| SERIAL GUARDIAN | `serial` | texto |
| IMEI GUARDIAN | `imeiG` | texto (`z:'@'` preserva ceros) |
| GEN GUARDIAN | `genGuardian` | texto |
| MONITOREADO | `monitored` | `'yes'→'Yes'`, `'no'→'No'`, else `'N/A'` |
| FECHA INSTALACIÓN | `vehicleInstallation` | texto |
| SIMCARD GUARDIAN | `simG` | texto |
| IMEI FFC LIVE | `imeiFFC` | texto |
| SIMCARD FFC LIVE | `simFFC` | texto |
| MODELO FFC LIVE | `ffcModel` | texto |
| IMEI GPS | `imeiGPS` | texto |
| Sim Card GPS | `simGPS` | texto |

### resetExport()

Limpia `raw`, `exportResult`, UI cards, stats, progress, log, botones. Iteración sobre todas las 9 claves de fuente.

---

## 4. Módulo Visor

### Columnas (14)

| key | Label columna |
|---|---|
| `cuenta` | CUENTA |
| `flota` | FLOTA |
| `vehicle` | VEHICLEID / PATENTE |
| `serial` | SERIAL GUARDIAN |
| `imeiG` | IMEI GUARDIAN |
| `genGuardian` | GEN GUARDIAN |
| `monitored` | MONITOREADO |
| `vehicleInstallation` | FECHA INSTALACIÓN |
| `simG` | SIMCARD GUARDIAN |
| `imeiFFC` | IMEI FFC LIVE |
| `simFFC` | SIMCARD FFC LIVE |
| `ffcModel` | MODELO FFC LIVE |
| `imeiGPS` | IMEI GPS |
| `simGPS` | SIM CARD GPS |

### Filtros activos (10)

`cuenta, flota, vehicle, serial, imeiG, simG, imeiFFC, simFFC, imeiGPS, simGPS`

Lógica: AND entre campos, OR dentro del campo (textarea multilinea / coma-separado, sin split por espacios).

### Carga de datos

**Desde Export:** `loadVisorFromMemory(exportResult)` — clona filas.

**Desde archivo:** Drop zone acepta `.xlsx` y `.csv`.
- XLSX: `XLSX.read()` → `sheet_to_json(ws, {header:1})` → `vParseRows()`
- CSV: misma ruta
- `vParseRows()` detecta fila de headers buscando ≥3 hits en `COL_ALIASES`

### COL_ALIASES (Visor)

Mapeado de encabezados XLSX → keys internas. Soporta variaciones:
- `VEHICLEID/PATENTE`, `VEHICLEID / PATENTE`, `VEHICLE`, `PATENTE`, `VEHICLEID`
- `MONITOREADO`, `FECHA INSTALACIÓN`, `VEHICLE_INSTALLATION`
- Campos de detalle SIM extendidos (para archivos de Gestión SIM exportados)

### Renderers especiales (hlCell)

| Columna | Render |
|---|---|
| `monitored` | `'yes'` → ✓ Yes (verde), `'no'` → ✗ No (rojo), else → N/A (gris) |
| `genGuardian` | `gen1/gen2/gen3` class coloreada |
| Cualquiera con filtro | Highlight `<mark class="hl">` en término coincidente |
| Vacío | `<span class="empty">—</span>` |

### Paginación

```javascript
let vPageSize = 50;   // opciones: 25, 50, 100, 200
let vPage = 1;
// pager: muestra ventana de 5 páginas con … en extremos
```

### exportVFiltered()

Mismo esquema de 14 columnas que `doExport()`. Genera `inventario_filtrado_N_FECHA.xlsx` o `inventario_completo_FECHA.xlsx`.

---

## 5. Módulo Gestión de SIM

### Propósito

Vista extendida de SIMs orientada a soporte técnico. Muestra campos de detalle de las 3 SIMs por unidad (Guardian, FFC, GPS) + columna calculada `Regla Entel`.

### Columnas (31)

| Key | Label |
|---|---|
| `cuenta` | CUENTA |
| `flota` | FLOTA |
| `vehicle` | VEHICLEID / PATENTE |
| `serial` | SERIAL GUARDIAN |
| `imeiG` | IMEI GUARDIAN |
| `genGuardian` | GEN GUARDIAN |
| `monitored` | MONITOREADO |
| `simG` | SIMCARD GUARDIAN |
| `gP1` | GUARDIAN SIM — PERSONALIZADO 1 |
| `gP2` | GUARDIAN SIM — PERSONALIZADO 2 |
| `gFecha` | GUARDIAN SIM — FECHA ACTIVACIÓN |
| `gReglaEntel` | GUARDIAN SIM — CUMPLE REGLA ENTEL *(calculado)* |
| `gDatos` | GUARDIAN SIM — DATOS MENSUALES |
| `gEstado` | GUARDIAN SIM — ESTADO |
| `ultimoContacto` | ÚLTIMO CONTACTO GUARDIAN |
| `imeiFFC` | IMEI FFC LIVE |
| `simFFC` | SIMCARD FFC LIVE |
| `ffcP1` | FFC SIM — PERSONALIZADO 1 |
| `ffcP2` | FFC SIM — PERSONALIZADO 2 |
| `ffcFecha` | FFC SIM — FECHA ACTIVACIÓN |
| `ffcReglaEntel` | FFC SIM — CUMPLE REGLA ENTEL *(calculado)* |
| `ffcDatos` | FFC SIM — DATOS MENSUALES |
| `ffcEstado` | FFC SIM — ESTADO |
| `ffcModel` | MODELO FFC LIVE |
| `imeiGPS` | IMEI GPS |
| `simGPS` | SIM CARD GPS |
| `gpsP1` | GPS SIM — PERSONALIZADO 1 |
| `gpsP2` | GPS SIM — PERSONALIZADO 2 |
| `gpsFecha` | GPS SIM — FECHA ACTIVACIÓN |
| `gpsDatos` | GPS SIM — DATOS MENSUALES |
| `gpsEstado` | GPS SIM — ESTADO |

### calcReglaEntel(fechaStr)

Función utilitaria compartida con Cobro:

```javascript
function calcReglaEntel(fechaStr) {
  // Soporta: 'YYYY-MM-DD...' y 'DD/MM/YYYY...'
  // Retorna 'SI' si han pasado >= 6 meses desde la fecha de activación
  // Retorna 'NO' si < 6 meses
  // Retorna '' si fecha inválida o vacía
  return (Date.now() - fechaActivacion) / (1000*60*60*24*30.4375) >= 6 ? 'SI' : 'NO';
}
```

### buildSimRows() — Construcción desde fuentes cargadas

Usa `raw.invCustom` (fuente primaria) + complementa con `raw.unidades` para filas no en Custom.

**Combinación:**
```
allSources = [...raw.invCustom, ...raw.unidades.filter(u => 
  u.serial ∉ _custSerials AND u.vehicle ∉ _custVehicles)]
```

Para cada fila construye campos SIM consultando `simsIccMap` / `podIccMap` y modelo FFC con la cadena hwList → Hardware → ffcVersiones.

`monitored` se deriva de `fleet_enabled` (si `'f'` → `'no'`) o del campo `monitored` de Custom.

`imeiGPS/imeiFFC` de fila Custom → si no existen, busca en `raw.unidades` por serial (`_uSerialMap`).

### loadSimFromMemory(rows)

Reemplaza `sAllRows` y activa el layout de la página Gestión SIM.

### Renderers especiales (renderSTable)

| Columna | Render |
|---|---|
| `monitored` | ✓ Yes (verde) / ✗ No (rojo) / N/A |
| `gReglaEntel` / `ffcReglaEntel` | Calculado en tiempo real desde `gFecha`/`ffcFecha`. ✓ SI (verde), ✗ NO (amber) |
| `gEstado`, `ffcEstado`, `gpsEstado` | ● Activa (verde), ● Hibernada/En hibernación (amber), ● Baja (rojo), ● Lista para usar (purple) |
| `genGuardian` | gen1/gen2/gen3 coloreado |

### exportSFiltered() — 2 hojas XLSX

**Hoja 1: "Gestion SIM"** — todas las columnas de `SCOLS`, `gReglaEntel`/`ffcReglaEntel` calculados dinámicamente.

**Hoja 2: "Resumen Consumo"** — agrupa `raw.sims` por `Personalizado 1` en grupos conocidos:
`GUARDIAN GEN1/2/3, MC30, JC400, ME40, MDVR, FFCLIVE`

Columnas: GRUPO, TOTAL SIMs, ACTIVAS, TOTAL MB, TOTAL GB + fila TOTAL.

---

## 6. Módulo SIMs M2M

### Propósito

Vista de todas las SIMs del CSV M2M (`raw.sims`), cruzadas con inventario para identificar a qué unidad/cuenta pertenece cada SIM y determinar consumo por tipo de dispositivo.

### Columnas (20)

| Key | Label |
|---|---|
| `icc` | ICC / SIM |
| `imei` | IMEI |
| `dispositivo` | DISPOSITIVO |
| `tipoDispositivo` | TIPO DISPOSITIVO |
| `platform` | PLATFORM |
| `cuenta` | CUENTA |
| `flota` | FLOTA |
| `vehiculo` | VEHÍCULO |
| `serial` | SERIAL GUARDIAN |
| `modeloHW` | MODELO HW |
| `marcaHW` | MARCA HW |
| `monitored` | MONITOREADO |
| `p1` | PERSONALIZADO 1 |
| `p2` | PERSONALIZADO 2 |
| `estado` | ESTADO SIM |
| `plan` | PLAN |
| `datosMB` | DATOS MENSUAL (MB) |
| `datosGB` | DATOS MENSUAL (GB) |
| `fechaActivacion` | FECHA ACTIVACIÓN |
| `fuenteID` | FUENTE IDENTIFICACIÓN |

### Filtros (10)

`cuenta, flota, vehiculo, serial, icc, imei, tipoDispositivo, estado, p1, fuenteID`

### buildM2mRows() — Lógica de identificación

Para cada fila de `raw.sims`:

1. **Inventory Custom** (por IMEI): extrae `cuenta, flota, vehiculo, serial, platform, monitored`
2. **Hardware / Hardware List** (por IMEI): extrae `modeloHW, marcaHW` y refina `tipoDispositivo`
3. **Inventory Report** (por IMEI, si sin cuenta): fallback de `cuenta, flota, vehiculo, serial`
4. **GEN3 Provisional** (`imeiExtraMap`): resuelve `serial` desde IMEI → luego busca en Custom/Inventory por serial

### deviceToType(disp) — Clasificación por campo Dispositivo SIM

| Dispositivo contiene | Tipo resultante |
|---|---|
| `SIM7600G-H` | GUARDIAN GEN3 |
| `EG25-G` | GUARDIAN GEN2 |
| `EC25-AUX` | MC30-02 / MDVR |
| `UC20` / `QUECTEL UC20` | GUARDIAN GEN2 v1 (P1001229) |
| `HE910` / `TELIT` | GUARDIAN GEN1 |
| `C28` / `JC400` / `EDGECAM` | JC400 (C28) |
| `GPS-403` | GPS-403 |
| `UC15` / `FMU130` | GPS FMU130 |
| `EC200A` / `RUT200` | ROUTER / STARLINK |
| `CANCUN` / `MOTO` | Moto G54 |

### Cálculo de MB/GB

```javascript
const kb = parseFloat(r['Datos Mensual'].replace(',','.').replace(/ /g,'')) || 0;
datosMB: Math.round(kb / 1024 * 1000) / 1000    // KB → MB
datosGB: Math.round(kb / 1024 / 1024 * 1000) / 1000  // KB → GB
```

### fuenteID — Jerarquía de identificación

`Inventory Custom` → `Hardware List` → `Hardware` → `InventoryReport` → `GEN3 Provisional` → `GEN3 Provisional + Custom` → `GEN3 Provisional + InventoryReport` → `Dispositivo SIM` → `Sin identificar` / `Sin IMEI`

### exportM2m() — 2 hojas XLSX

**Hoja 1: "SIMs M2M"** — 20 columnas.

**Hoja 2: "Resumen Consumo"** — agrupa por `tipoDispositivo` (normalizado):

Grupos canónicos: `GUARDIAN GEN1/2/3, MC30-02, JC400, ME40, MDVR, GPS FMU130, GPS-403, ROUTER/STARLINK, Moto G54, FFCLIVE, Sin dispositivo con consumo, Sin dispositivo sin consumo`

Columnas: TIPO DISPOSITIVO, TOTAL SIMs, ACTIVAS, TOTAL MB, TOTAL GB, PROMEDIO MB/DISPOSITIVO + fila TOTAL.

---

## 7. Módulo Cobro

### Propósito

Cruza un Excel de cobro (hoja "Detalle") con los datos de SIMs M2M para identificar costo por cuenta/flota/tipo de dispositivo. Calcula "Regla Entel" (SIM activa ≥ 6 meses).

### Columnas (21)

| Key | Label | Origen |
|---|---|---|
| `icc` | ICC | Cobro |
| `empresa` | EMPRESA | Cobro |
| `estado` | ESTADO | Cobro |
| `plan` | PLAN | Cobro |
| `tipoSim` | TIPO SIM | Cobro |
| `mbPlan` | MB PLAN | Cobro |
| `consumoMB` | CONSUMO MB | Cobro |
| `costoPlan` | COSTO PLAN | Cobro |
| `costoTotal` | COSTO TOTAL | Cobro |
| `moneda` | MONEDA | Cobro |
| `imei` | IMEI | ← SIMs M2M |
| `tipoDispositivo` | TIPO DISPOSITIVO | ← SIMs M2M |
| `cuenta` | CUENTA | ← SIMs M2M |
| `flota` | FLOTA | ← SIMs M2M |
| `vehiculo` | VEHÍCULO | ← SIMs M2M |
| `serial` | SERIAL GUARDIAN | ← SIMs M2M |
| `p1` | PERSONALIZADO 1 | ← SIMs M2M |
| `p2` | PERSONALIZADO 2 | ← SIMs M2M |
| `fuenteID` | FUENTE IDENTIFICACIÓN | ← SIMs M2M |
| `monitored` | MONITOREADO | ← SIMs M2M |
| `reglaEntel` | REGLA ENTEL | ← calcReglaEntel(m2m.fechaActivacion) |

### Filtros (8)

`cuenta, flota, tipoDispositivo, plan, estado, icc, imei, moneda`

### loadCobroFile(file)

```
1. Lee Excel (ArrayBuffer)
2. Intenta hoja 'Detalle'; si no existe → primera hoja
3. Busca fila de headers con columna 'ICC' (scan primeras 10 filas)
4. buildCobroRows() → construye m2mIccMap desde m2mAllRows (llamando buildM2mRows() si necesario)
5. Por cada fila cobro: getCol(name) + m2mIccMap.get(icc) → cobroAllRows
```

### updateCobroInfo()

Muestra total de SIMs + **suma de `costoTotal`** de filas filtradas formateado `es-CL`.

### exportCobro() — 2 hojas XLSX

**Hoja 1: "Cobro"** — columnas numéricas (`mbPlan, consumoMB, costoPlan, costoTotal`) exportadas como tipo `n`, resto como `s`.

**Hoja 2: "Resumen por Dispositivo"** — agrupa filas filtradas por `tipoDispositivo` (normalizado), calcula COSTO TOTAL CLP, CONSUMO MB, CONSUMO GB. Ordenado por costo descendente.

---

## 8. Flujo de Datos y Procesamiento

### Flujo Export → otros módulos

```
raw.sims    ──────────────────────────────────────────────────┐
raw.invCustom ──┐                                             │
raw.unidades    ├─→ startProcess() → exportResult → ─────────┤
raw.inventory   │        ↓                                    │
raw.hardware    │   doExport() → XLSX                         │
raw.pod         │        ↓                                    │
raw.imeiExtra   │   goToVisor() → loadVisorFromMemory()       │
raw.ffcVersiones│        ↓                                    │
raw.hwList    ──┘   goToSim() → buildSimRows()                │
                         ↓                                    │
                    goToM2m() → buildM2mRows() ←──────────────┘
                         ↓
                    Cobro: loadCobroFile() → buildCobroRows()
                           ↑
                       depende de m2mAllRows
```

### Procesamiento chunked (no-blocking UI)

`startProcess()` divide el array `main[]` en chunks de 500 registros procesados via `setTimeout(chunk, 0)` para no bloquear el hilo principal. El progreso se actualiza en la barra visual cada chunk.

### normKey(v)

```javascript
const normKey = v => (v||'').replace(/\D/g,'');
// Elimina todo excepto dígitos
// Usado para comparar IMEIs y ICCs ignorando guiones/espacios
```

### esc(s)

```javascript
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// Sanitización HTML para innerHTML
```

### toast(msg, type)

Notificación flotante bottom-right. `type = 'ok' | 'err' | ''`. Auto-oculta a los 3.5 segundos.

---

## 9. Estructuras de CSV y Campos Esperados

### Unidades sin comunicar

| Campo usado | Notas |
|---|---|
| `companyName` | Cuenta/empresa |
| `fleetName` | Flota |
| `vehicleName` | Nombre del vehículo |
| `vehiclePlate` | Alternativa a vehicleName |
| `guardianSerial` | Serial Guardian |
| `guardianImei` | IMEI Guardian |
| `ffcImei` | IMEI FFC Live |
| `gpsImei` | IMEI GPS |
| `guardianLastComms` | Último contacto (se elimina `.000`) |

### Inventory Report

| Campo usado | Notas |
|---|---|
| `account` | Cuenta |
| `fleet` | Flota |
| `vehicle` / `vehicleName` | Vehículo |
| `serial_number` | Serial Guardian |
| `imei` | IMEI Guardian |
| `ffcImei` | IMEI FFC Live |
| `gpsImei` | IMEI GPS |
| `monitored` | `'yes'/'no'` |
| `device_registration` | Fecha instalación (vehicleInstallation) |

### Inventory Custom

| Campo usado | Notas |
|---|---|
| `account` | Cuenta |
| `fleet` | Flota |
| `vehicle` | Vehículo |
| `serial_number` | Serial Guardian |
| `imei` | IMEI Guardian |
| `monitored` | `'t'/'yes'` o `'f'/'no'` |
| `fleet_enabled` | Si `'f'` → fuerza monitored='no' |
| `device_registration` | Fecha instalación |
| `platform` | Plataforma |

### Listado de Hardware

| Campo usado | Notas |
|---|---|
| `imei` | IMEI del dispositivo |
| `simchip` | ICC (SIM) — usado para GPS SIM |
| `phonenumber` | Alternativa a simchip |
| `hardware_model` | Modelo dispositivo (FFC) |
| `hardware_brand` | Marca (para M2M) |
| `compañía_nombre` | Cuenta (para M2M) |

### M2M SIMs (AT&T)

| Campo usado | Notas |
|---|---|
| `IMEI` | IMEI del dispositivo |
| `ICC` | SIM card ID |
| `Personalizado 1` | Grupo/tipo dispositivo |
| `Personalizado 2` | Info adicional |
| `Estado` | `ACTIVA / HIBERNADA / EN HIBERNACIÓN / BAJA / LISTA PARA USAR` |
| `Datos Mensual` | Consumo en KB (separador decimal coma o punto) |
| `Fecha de activación` | Formato `YYYY-MM-DD` o `DD/MM/YYYY` |
| `Plan` | Plan de datos |
| `Dispositivo` | Modelo del módem (usado por deviceToType) |

### POD

| Campo usado | Notas |
|---|---|
| `IMEI` | IMEI del dispositivo |
| `Subscriber ID #` | ICC (= simGPS cuando viene de POD) |
| `MSISDN` | Alternativa a Subscriber ID # |
| `Name` | Equivale a Personalizado 1 |
| `Group` | Equivale a Personalizado 2 |
| `Activation Date (UTC)` | Fecha activación |
| `Customer's Usage Bytes` | Consumo |
| `Status` | Estado |

### IMEI Provisional GEN3

| Campo | Notas |
|---|---|
| `serial_number` | Serial Guardian (key) |
| `imei` | IMEI provisorio para GEN3 aún no en sistema |

### Versiones FFC (Howen)

| Campo | Notas |
|---|---|
| `Imei` | IMEI del FFC (key) |
| `[Modelo] Howen` | Modelo detallado (N1, N2, etc.) — se ignora si es `UNKNOWN` |

### Hardware List

| Campo | Notas |
|---|---|
| `imei` / `IMEI` | IMEI del dispositivo (key) |
| `name` / `Name` | Nombre/modelo del hardware |

---

## 10. Campos de Salida Completos

### InventoryRow — 37 campos

| Campo | Tipo | Descripción |
|---|---|---|
| `cuenta` | string | Nombre de cuenta/empresa |
| `flota` | string | Nombre de flota |
| `vehicle` | string | ID de vehículo o patente |
| `serial` | string | Serial Guardian (P1003100-..., P1002260-..., P04025-...) |
| `imeiG` | string | IMEI Guardian (15 dígitos) |
| `genGuardian` | string | `GEN1 / GEN2 / GEN3 / ''` |
| `monitored` | string | `'yes' / 'no' / ''` |
| `vehicleInstallation` | string | Fecha de instalación del dispositivo |
| `simG` | string | ICC de la SIM Guardian |
| `gP1` | string | Guardian SIM — Personalizado 1 |
| `gP2` | string | Guardian SIM — Personalizado 2 |
| `gFecha` | string | Guardian SIM — Fecha de activación |
| `gDatos` | string | Guardian SIM — Datos mensuales |
| `gEstado` | string | Guardian SIM — Estado |
| `ultimoContacto` | string | Último contacto Guardian (sin `.000`) |
| `imeiFFC` | string | IMEI FFC Live |
| `simFFC` | string | ICC de la SIM FFC Live |
| `ffcP1` | string | FFC SIM — Personalizado 1 |
| `ffcP2` | string | FFC SIM — Personalizado 2 |
| `ffcFecha` | string | FFC SIM — Fecha de activación |
| `ffcDatos` | string | FFC SIM — Datos mensuales |
| `ffcEstado` | string | FFC SIM — Estado |
| `ffcModel` | string | Modelo FFC Live (HW List → Hardware → Versiones Howen) |
| `imeiGPS` | string | IMEI GPS |
| `simGPS` | string | ICC de la SIM GPS |
| `gpsP1` | string | GPS SIM — Personalizado 1 |
| `gpsP2` | string | GPS SIM — Personalizado 2 |
| `gpsFecha` | string | GPS SIM — Fecha de activación |
| `gpsDatos` | string | GPS SIM — Datos mensuales |
| `gpsEstado` | string | GPS SIM — Estado |
| `temporal` | string | Campo legacy (vacío en v30) |

### SimRow — campos adicionales en Gestión SIM

Los campos `gReglaEntel` y `ffcReglaEntel` son **calculados en tiempo real** en `renderSTable()` y `exportSFiltered()` desde `gFecha` y `ffcFecha` respectivamente. No se almacenan en la fila de datos.

### M2MRow — 20 campos

`icc, imei, dispositivo, tipoDispositivo, platform, cuenta, flota, vehiculo, serial, modeloHW, marcaHW, monitored, p1, p2, estado, plan, datosMB, datosGB, fechaActivacion, fuenteID`

### CobroRow — 21 campos

`icc, empresa, estado, plan, tipoSim, mbPlan, consumoMB, costoPlan, costoTotal, moneda` (del archivo Cobro) + `imei, tipoDispositivo, cuenta, flota, vehiculo, serial, p1, p2, fuenteID, monitored, reglaEntel` (cruzados desde M2M).

---

## 11. Glosario

| Término | Definición |
|---|---|
| **Guardian** | Dispositivo telemático principal instalado en vehículos |
| **GEN1** | Guardian generación 1 (serial prefijo `P04025`) |
| **GEN2** | Guardian generación 2 (serial prefijo `P1002260` o `P1001229`) |
| **GEN3** | Guardian generación 3 (serial prefijo `P1003100`) |
| **FFC Live** | Cámara de conductor (Howen). Tiene IMEI y SIM propias |
| **GPS** | Dispositivo GPS adicional (Teltonika FMU130, GPS-403, etc.) |
| **IMEI** | 15 dígitos identifican un módulo celular |
| **ICC / SIM** | Identificador de tarjeta SIM (18-20 dígitos) |
| **M2M** | Machine-to-Machine — plan de datos IoT (AT&T) |
| **POD** | Proveedor alternativo de SIMs |
| **Inventory Custom** | Exportación personalizada del sistema interno con todos los dispositivos activos |
| **Regla Entel** | Condición contractual: SIM debe tener ≥ 6 meses desde activación para calificar |
| **normKey(v)** | Función que elimina todo excepto dígitos — normaliza IMEIs e ICCs |
| **hwAllMap** | Mapa de hardware sin filtro de longitud — necesario para IMEI FFC cortos de Howen |
| **fuenteID** | Campo en SIMs M2M que indica qué fuente de datos identificó la SIM |
| **fleet_enabled** | Campo en Inventory Custom: `'f'` indica unidad deshabilitada → monitored='no' |
| **device_registration** | Fecha de instalación del dispositivo en el vehículo |
| **Cobro** | Archivo Excel con detalle de facturación mensual de SIMs AT&T |

---

*Documentación generada el 2026-06-30 para fleet_inventory_v30.html — 3.122 líneas, 5 módulos, 9 fuentes de datos.*
