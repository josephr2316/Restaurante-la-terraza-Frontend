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

## Preview del build

```bash
npm run preview
```

## Deployment

El proyecto está listo para desplegar en:

- **Vercel**: conectar el repo, raíz del proyecto = `Restaurant app` (o la carpeta donde esté este `package.json`). Build: `npm run build`, Output: `dist`. Usa `vercel.json` para SPA.
- **Netlify**: conectar el repo, raíz = `Restaurant app`. Usa `netlify.toml` (comando y redirects ya configurados).
- **Otros estáticos**: ejecutar `npm run build` y publicar el contenido de `dist/`.

## API

Base URL: `https://restaurante-la-terraza-production.up.railway.app`

Endpoints: ver `API_ENDPOINTS_TEST_RESULTS.md` para la lista probada.

Token por defecto en la app: `Bearer test` (configurable en el panel).
