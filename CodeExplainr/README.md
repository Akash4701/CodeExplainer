# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Frontend API configuration

Set `VITE_API_URL` in `CodeExplainr/.env` to the backend server origin (for example,
`http://localhost:3000`). The frontend builds its API endpoints from this value.
Use `.env.example` as a starting point, and restart the Vite dev server after changing
the environment file. Vite exposes `VITE_` variables in the browser, so do not put
API keys or other secrets in this file.

## Footer feedback form

The feedback form is a separate `FeedbackForm` component. It sends its rating and
comment to the backend, which forwards them to Google Apps Script. The site-wide
celebration appears only after Apps Script confirms that a Google Form response
was submitted.

To connect it:

1. Create a Google Form with a required 1–5 rating question and a required
   paragraph feedback question. Disable email collection and remove any required
   email question, since the app intentionally does not collect email addresses.
2. Create a Google Apps Script project and paste in
   `backend/google-apps-script/Code.gs`.
3. In the Apps Script project settings, add Script Properties named `FORM_ID`,
   `RATING_ITEM_ID`, and `FEEDBACK_ITEM_ID`. Use the editable form ID for
   `FORM_ID`. Run `listFeedbackFormItems` from the Apps Script editor and copy
   the numeric IDs for the rating and feedback questions into the other two
   properties.
4. Deploy the Apps Script as a Web app, executing as you and allowing access to
   anyone. Copy its `/exec` URL into `GOOGLE_APPS_SCRIPT_URL` in
   `backend/.env` (see `backend/.env.example`).
5. Deploy the Apps Script as a new version after any script changes, then restart the backend. A submission error is shown in the feedback card; the
   full-page celebration appears only when the backend receives a successful
   save confirmation from Apps Script.

The Apps Script URL is kept on the backend, not exposed as a frontend setting.

## Execution-flow mappings

The explanation API returns `explanation.flow_map`. Each node has a stable `id`,
inclusive one-based `code_ranges`, and a `next` array of successor node IDs. The
flow map is the sole source of code-to-flow mappings: Monaco highlights every
range for the active node, and cursor lines select the most specific matching
range when nodes overlap. Apex classes and Apex Triggers share the same Monaco
language registration.

Configure `GEMINI_API_KEY` in `backend/.env` for the backend. Gemini requests use this
server-side key; it is not entered in or sent from the frontend.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
