# La Terraza – Control de Reservas (Frontend)

Panel operativo para anfitrión y administración del restaurante La Terraza. Conecta con la API en `restaurante-la-terraza-production.up.railway.app`.

**Stack:** Vite + HTML/CSS/JS (sin Next.js ni React).

## Requisitos

- Node.js 18+
- npm

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` (o el puerto que indique Vite).

## Build

```bash
npm run build
```

Genera la carpeta `dist/` lista para servir estáticamente.

## Deployment en Vercel

1. Ve a [vercel.com](https://vercel.com) e importa el repo **Restaurante-la-terraza-Frontend**.
2. **Framework Preset:** Vite (se detecta solo).
3. **Root Directory:** dejar vacío (la app está en la raíz del repo).
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Despliega. El `vercel.json` ya configura el redirect SPA.

No hace falta configurar variables de entorno; la URL de la API está en el código.

## API

Base URL: `https://restaurante-la-terraza-production.up.railway.app`  
Endpoints: ver `API_ENDPOINTS_TEST_RESULTS.md`. Token por defecto: `Bearer test`.
