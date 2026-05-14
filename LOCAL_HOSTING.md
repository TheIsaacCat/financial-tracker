# Local Hosting Guide

This guide runs the app on your own machine instead of Render.

## Option A: Docker Compose

From the repo root:

```powershell
copy .env.example .env
```

Edit `.env` and set:

```env
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox
JWT_SECRET=use_a_long_random_string
NEXT_PUBLIC_API_URL=http://localhost:5000/api
FRONTEND_URLS=http://localhost:3000
```

Start everything:

```powershell
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/health`
- Postgres: `localhost:5432`

## Option B: Run Node Locally

Start Postgres first. The default backend connection string is:

```env
postgresql://financial_user:financial_password@localhost:5432/financial_tracker
```

Backend:

```powershell
cd backend
copy .env.example .env
npm install
npm.cmd run dev
```

Frontend:

```powershell
cd frontend
copy .env.example .env.local
npm install
npm.cmd run dev
```

Open `http://localhost:3000`.

## LAN Access

Use this when another device on your home network should open the app.

1. Find your computer's LAN IP:

   ```powershell
   ipconfig
   ```

   Look for the IPv4 address, for example `192.168.1.50`.

2. Update root `.env`:

   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.50:5000/api
   FRONTEND_URLS=http://localhost:3000,http://192.168.1.50:3000
   ```

3. Restart Docker Compose:

   ```powershell
   docker compose down
   docker compose up --build
   ```

4. Open from another device:

   ```text
   http://192.168.1.50:3000
   ```

5. If it does not load, allow inbound Windows Firewall rules for TCP ports `3000` and `5000`.

## Port Forwarding From The Internet

Only do this on a trusted network. Exposing a finance app directly from your home machine has real security risk.

1. Reserve a static LAN IP for your computer in your router, for example `192.168.1.50`.

2. In your router's port forwarding settings, forward:

   ```text
   External TCP 3000 -> 192.168.1.50:3000
   External TCP 5000 -> 192.168.1.50:5000
   ```

3. Find your public IP by searching "what is my IP" in a browser.

4. Update root `.env`, replacing `203.0.113.10` with your public IP or DNS name:

   ```env
   NEXT_PUBLIC_API_URL=http://203.0.113.10:5000/api
   FRONTEND_URLS=http://localhost:3000,http://203.0.113.10:3000
   ```

5. Restart the app:

   ```powershell
   docker compose down
   docker compose up --build
   ```

6. Test externally, preferably from mobile data:

   ```text
   http://203.0.113.10:3000
   ```

## Plaid Notes

For sandbox Link without OAuth, leave `PLAID_REDIRECT_URI` unset.

If you need OAuth redirect handling, add the exact callback URL in the Plaid dashboard and set it in `.env`:

```env
PLAID_REDIRECT_URI=http://203.0.113.10:3000/callback
```

Then restart the app.

## Safer Alternative

For internet access, a tunnel is usually safer and easier than router port forwarding:

```powershell
cloudflared tunnel --url http://localhost:3000
```

If you use a tunnel, also expose the backend or put both frontend and backend behind a reverse proxy, then update `NEXT_PUBLIC_API_URL` and `FRONTEND_URLS` to the tunnel URLs.
