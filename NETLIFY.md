# Netlify setup

1. In the Netlify site settings, go to: Site settings → Build & deploy → Environment

2. Add a new environment variable:

- Key: `GOOGLE_SCRIPT_URL`
- Value: `https://script.google.com/macros/s/AKfycb.../exec`  (your real script URL)

3. Build command in Netlify (Settings → Build & deploy → Continuous Deployment → Build settings):

If you have no other build step (static site):

  node build-config.js

If you already have a build step, prepend the config step. For example:

  node build-config.js && npm run build

4. Publish directory: set to the repository root or the folder containing `index.html` (for this project the repository root is fine).

Local development (PowerShell)

1. Create a local `.env` (do NOT commit it). Example `.env` content:

```
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
```

2. To test locally from PowerShell run:

$env:GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec'; npm run start

This will write `config.json` and serve the site on http://localhost:8000

Notes
- The environment variable set in Netlify will be available during build. `build-config.js` writes `config.json` into the published site so the client can fetch it at runtime.
- Anything injected into client-side files is visible to users. If the URL contains sensitive tokens, consider using a Netlify Function (serverless) to proxy requests.
