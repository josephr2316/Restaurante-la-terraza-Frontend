# La Terraza – Control de Reservas (Frontend)

Panel operativo para anfitrión y administración del restaurante La Terraza. Conecta con la API en `restaurante-la-terraza-production.up.railway.app`.

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

1. Entra en [vercel.com](https://vercel.com) y conecta el repo **Restaurante-la-terraza-Frontend**.
2. **Root Directory**: pon `Restaurant app` (o la carpeta donde está este `package.json`).
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Despliega. Vercel usará el `vercel.json` del proyecto para el redirect SPA (todas las rutas → `index.html`).

No hace falta configurar variables de entorno para la API; la URL está en el código.

## API

Base URL: `https://restaurante-la-terraza-production.up.railway.app`  
Endpoints: ver `API_ENDPOINTS_TEST_RESULTS.md`. Token por defecto en la app: `Bearer test`.
