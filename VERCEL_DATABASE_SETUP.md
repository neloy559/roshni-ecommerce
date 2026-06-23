# Vercel Database Setup - Manual Step Required

## Current Status

✅ Code fixed and pushed to GitHub
✅ Vercel auto-deployed the latest commit
✅ PostgreSQL database running on Railway

## Critical Step: Add DATABASE_URL to Vercel

Since Railway's database is internal-only right now, you need to set up the connection:

### Option 1: Use Railway's Public TCP Proxy (Recommended)

1. **Enable TCP Proxy on Railway:**
   - Go to: https://railway.app/project/0c48c7d2-b0fe-4ca6-98ef-20671ef08578/service/c2446d9d-460e-49a4-a176-1b067b572c4f/settings
   - Scroll to "Networking" section
   - Click "TCP Proxy" button
   - Railway will generate a public URL like: `monorail.proxy.rlwy.net:12345`

2. **Copy the DATABASE_URL:**
   - Format: `postgresql://postgres:password123@monorail.proxy.rlwy.net:PORT/roshni`
   - Replace PORT with the actual port number shown

3. **Add to Vercel:**
   ```bash
   cd "D:\1 My Dev Creations\MVP for Clients\Roshni"
   vercel env add DATABASE_URL
   ```
   - Paste the full DATABASE_URL
   - Select: Production, Preview, Development (all 3)

### Option 2: Use Vercel PostgreSQL Integration (Alternative)

If Railway TCP proxy doesn't work, you can:
1. Create a PostgreSQL database directly on Vercel
2. Migrate the schema and seed data there

## After Adding DATABASE_URL

Run these commands:
```bash
# Trigger a new deployment to pick up the DATABASE_URL
vercel --prod

# Or wait for Vercel to auto-deploy from the next git push
```

Then the database schema will be created automatically on first API call.
