# CodeJourney AI frontend

For the complete project overview, setup instructions, and Google Forms feedback
configuration, see the [repository README](../README.md).

## Frontend commands

Install dependencies and start the development server:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env` to the backend origin (for local development,
`http://localhost:3000`). Then use:

```powershell
npm run lint
npm run build
npm run preview
```
