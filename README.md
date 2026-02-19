# La Terraza – Control de Reservas (Frontend)

Panel operativo para anfitrión y administración del restaurante La Terraza. Conecta con la API en `restaurante-la-terraza-production.up.railway.app`.

**Stack:** Vite + HTML/CSS/JS (sin Next.js).

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
2. **Root Directory:** déjalo **vacío** (la app está en la raíz del repo).
3. **Framework Preset:** Vite (se detecta solo).
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Node.js Version:** 20.x (o dejar que use `.nvmrc`).
7. Despliega. El `vercel.json` ya configura el redirect SPA.

Si el build falla, revisa que en la raíz del repo estén: `package.json`, `index.html`, `app.js`, `styles.css`, `vite.config.js`, `vercel.json`.

## Error "Get Pages site failed" en GitHub Actions

Ese error sale porque algún workflow (por ejemplo de GitHub Pages) intenta usar **Pages** y el repo no lo tiene activado. **Solución:**

1. En GitHub: **Settings → Pages**.
2. En **Build and deployment**, pon **Source** en **None** (desactivar Pages).
3. Así dejan de ejecutarse workflows que usan `configure-pages`/`deploy-pages`. Este proyecto se despliega solo con **Vercel**.

## API

Base URL: `https://restaurante-la-terraza-production.up.railway.app`  
Endpoints: ver `API_ENDPOINTS_TEST_RESULTS.md`. Token por defecto: `Bearer test`.
