# Resultados de pruebas – API La Terraza

**Base URL:** `https://restaurante-la-terraza-production.up.railway.app`  
**Auth:** `Authorization: Bearer test` (usado en todas las pruebas)

---

## Resumen: todos los endpoints probados ✅

| Método | Endpoint | Estado | Notas |
|--------|----------|--------|--------|
| **GET** | `/health` | ✅ OK | `{"status":"ok","time":"..."}` |
| **POST** | `/seed` | ✅ OK | 409 "Already seeded" si ya está cargado (comportamiento esperado) |
| **GET** | `/areas` | ✅ OK | Lista 5 áreas (VIP, TERRACE, PATIO, LOBBY, BAR) |
| **POST** | `/areas/{areaId}/tables` | ✅ OK | Creada mesa `TEST-01` en `area_bar` |
| **GET** | `/tables` | ✅ OK | Lista todas las mesas |
| **GET** | `/tables?areaId=area_vip` | ✅ OK | Filtro por área funciona (solo 3 mesas VIP) |
| **GET** | `/availability` | ✅ OK | Requiere `startTime` **codificado en URL** (ej. `20:00` → `20%3A00`) |
| **POST** | `/reservations` | ✅ OK | Reserva creada (ej. `rsv_mlssy2pr_thqb7o`) |
| **GET** | `/reservations?date=...` | ✅ OK | Lista reservas por fecha |
| **GET** | `/reservations?date=...&areaId=...` | ✅ OK | Filtro opcional por `areaId` funciona |
| **PATCH** | `/reservations/{id}/status` | ✅ OK | Estado actualizado (ej. PENDING → CONFIRMED) |

---

## Detalles por endpoint

### GET /health
- **Respuesta:** `{"status":"ok","time":"2026-02-19T01:47:24.205Z"}`

### POST /seed
- **Respuesta si ya está cargado:** HTTP 409, `{"code":"ALREADY_SEEDED","message":"Already seeded"}`
- **Uso:** Cargar datos iniciales (áreas, mesas). Opcional pero recomendado.

### GET /areas
- **Respuesta:** Array de áreas con `id`, `code`, `name`, `maxTables`.

### POST /areas/{areaId}/tables
- **Body ejemplo:** `{"capacity":4,"tableType":"STANDARD","code":"TEST-01"}`
- **Respuesta:** Mesa creada con `id`, `areaId`, `code`, `capacity`, `tableType`, `isActive`.
- **Límites:** Respeta `maxTables` del área.

### GET /tables
- **Query opcional:** `?areaId=area_vip` para filtrar por área.
- **Respuesta:** Array de mesas.

### GET /availability
- **Query:** `date`, `startTime`, `partySize`, `durationMin`, `areaPreference` (ej. ANY, VIP, TERRACE).
- **Importante:** `startTime` debe ir **URL-encoded** (ej. `20:00` → `20%3A00`). Si no, la API devuelve error de validación.
- **Respuesta:** `date`, `startTime`, `options[]` con `area`, `feasible`, `candidates[]`, etc.

### POST /reservations
- **Body ejemplo:** `{"date":"2026-02-22","startTime":"21:00","partySize":2,"durationMin":90,"areaPreference":"TERRACE","vipRequested":false,"customerName":"Test E2E","phone":"+1-809-555-0000","source":"WEB"}`
- **Respuesta:** Reserva creada con `id`, `status` (PENDING), slots bloqueados.

### GET /reservations
- **Query obligatorio:** `date` (YYYY-MM-DD).
- **Query opcional:** `areaId`.
- **Respuesta:** Array de reservas.

### PATCH /reservations/{id}/status
- **Body:** `{"status":"CONFIRMED"}` (o CANCELLED, NOSHOW, COMPLETED, etc. según flujo).
- **Respuesta:** Reserva actualizada con el nuevo `status`.

---

## Conclusión

Todos los endpoints de la API responden correctamente. La app frontend puede usarlos con la misma base URL y el token por defecto `test`. Para **GET /availability**, el frontend ya usa `URLSearchParams`, que codifica `startTime` correctamente.
