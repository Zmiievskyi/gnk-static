---
name: deploy
description: Deploy the MineGNK site using Docker, nginx, or static hosting. Use when deploying to staging, production, or setting up new environments.
---

# Deployment Guide

## Docker Deployment (Recommended)

### Local
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

Access: http://localhost:3000

### Production
```bash
# Build image
docker build -t minegnk-web:latest .

# Tag for registry
docker tag minegnk-web:latest yourusername/minegnk-web:latest

# Push
docker push yourusername/minegnk-web:latest

# On server
docker pull yourusername/minegnk-web:latest
docker run -d --name minegnk-web -p 80:80 --restart unless-stopped minegnk-web:latest
```

## Static Hosting

### Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

### GitHub Pages
Enable in repo: Settings → Pages → Source: gh-pages branch

## Pre-Deployment Checklist

- [ ] Test locally: `python3 -m http.server 8000`
- [ ] Test Docker: `docker-compose up -d`
- [ ] All links work
- [ ] Responsive design OK
- [ ] HubSpot form submits
- [ ] No console errors
- [ ] Test Chrome, Firefox, Safari

## Post-Deployment

- [ ] Test live site
- [ ] Verify SSL (if HTTPS)
- [ ] Check health endpoint: `/health`
- [ ] Test HubSpot form
- [ ] Monitor logs

## Health Check

```bash
curl http://localhost:3000/health
# Expected: healthy
```

## Rollback

```bash
# Docker
docker-compose down
docker pull yourusername/minegnk-web:1.0.0  # Previous version
docker-compose up -d

# Netlify
netlify rollback

# Vercel
vercel rollback
```

## SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d minegnk.com -d www.minegnk.com
sudo certbot renew --dry-run
```

## Quick Commands

```bash
# Local dev
python3 -m http.server 8000

# Docker
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose logs -f        # Logs
docker-compose up -d --build  # Rebuild

# Health
curl http://localhost:3000/health
```
