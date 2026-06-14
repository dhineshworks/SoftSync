# SoftSync Marketplace

Monorepo for the SoftSync software license storefront.

```
SoftSync/
├── backend/     Express + MongoDB + JWT API
├── frontend/    React + Vite SPA (TanStack Router)
└── package.json   Workspace scripts
```

## Local development

### Prerequisites

- Node.js 20+
- MongoDB running locally (or a MongoDB Atlas connection string)

### Setup

```bash
# From repo root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env — set MONGODB_URI, JWT_SECRET, admin credentials

npm install
npm run seed    # creates admin user + sample products
npm run dev     # API on :5000, frontend on :5173
```

- Storefront: http://localhost:5173
- API health: http://localhost:5000/api/health

Default admin (after seed): see `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`.

## Hostinger deployment

### Frontend (static site)

1. Run `npm run build -w frontend`
2. Upload contents of `frontend/dist/` to your domain `public_html` (or subdomain root)
3. Add `frontend/.env.production` with `VITE_API_URL=https://api.yourdomain.com` before building

For SPA routing, add `.htaccess` in `public_html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Backend (Node.js app)

Hostinger Business/Cloud plans support Node.js apps:

1. Upload the `backend/` folder (or deploy via Git)
2. Set environment variables in the Hostinger panel (same as `.env.example`)
3. Set start command: `node dist/index.js` (run `npm run build` first)
4. Point a subdomain (e.g. `api.yourdomain.com`) to the Node app
5. Set `FRONTEND_URL` to your storefront URL and `API_PUBLIC_URL` to your API URL

Uploaded product images are stored in `backend/uploads/` and served at `/uploads/*`.

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/products` | — | List products |
| GET | `/api/products/featured` | — | Featured products |
| POST | `/api/orders` | JWT | Place order |
| GET | `/api/orders/me` | JWT | User orders |
| GET/POST/PUT/DELETE | `/api/products` | Admin | Manage catalog |
| POST | `/api/upload` | Admin | Product image upload |
