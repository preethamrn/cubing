# Cubing Lab

A Vue 3 application with an algorithm trainer, a 3BLD memo trainer, and a csTimer median calculator.
The app is deployed below `/cubing/` on GitHub Pages.

## Requirements

- Node.js 22.12 or newer (the project pins Node 22 in `.nvmrc`)
- npm

## Local development

```sh
npm install
npm run dev
```

Vite uses the production base path, so open the app at the `/cubing/` URL shown by the dev server.
The algorithm trainer also supports keyboard moves (`U R F D L B`; hold Shift for an inverse turn).
Smart-cube Bluetooth requires HTTPS and a browser with Web Bluetooth support.

## Build and checks

```sh
npm run lint
npm test
npm run build
npm run preview
```

The production build is written to `dist/`. The existing `deploy.sh` publishes that directory to the
`gh-pages` branch.

### Browser regression tests

These verify the actual cube canvas, Bluetooth setup failures, face-turn delivery, and V-perm progress
through cube rotations on desktop and mobile:

```sh
npx playwright install --with-deps chromium
npm run build
npm run test:e2e
```
