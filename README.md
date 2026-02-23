# EasyZakat 🌙

A **private, offline-first Zakat calculator** for Muslims with assets in Sweden and Pakistan.

## Features

- 🇸🇪 **Sweden assets**: Cash/bank accounts (SEK), Avanza/Nordnet stocks
- 🇵🇰 **Pakistan assets**: PSX stocks with CDC zakat deduction tracking, cash (PKR)
- 🥇 **Gold & Silver**: Multiple purities (24K/22K/21K/18K), multiple currencies
- 📦 **Business assets**: Trade inventory, receivables
- 📉 **Liabilities**: Deducted from zakatable wealth
- ⚖️ **Nisab calculation**: Gold (85g) or silver (595g) method, user-configurable
- 💱 **Multi-currency**: SEK, PKR, USD, EUR, GBP with manual exchange rates
- 🔒 **100% private**: All data stored in browser localStorage — nothing sent to any server
- 💾 **Export/Import**: Download JSON backup, restore on any device
- 📱 **Responsive**: Works on mobile and desktop

## Tech Stack

- React 18 + TypeScript
- Vite 7
- Tailwind CSS v4
- No backend, no database, no accounts

## Development

```bash
npm install
npm run dev
```

## Build & Deploy

### Cloudflare Pages (recommended)

1. Push this repo to GitHub/GitLab
2. In Cloudflare Pages, connect the repo
3. Build settings:
   - **Framework preset**: None / Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 18+
4. Deploy!

### Manual build

```bash
npm run build
# Deploy the ./dist folder to any static host
# (Cloudflare Pages, Vercel, Netlify, GitHub Pages, etc.)
```

## Privacy

EasyZakat is designed with privacy as its core principle:

- ✅ No user accounts required
- ✅ No analytics or tracking
- ✅ No network requests for your data
- ✅ All calculations done client-side
- ✅ Export your data as a JSON file for backup/portability

## Disclaimer

EasyZakat is a calculation aid. For official religious rulings, please consult a qualified Islamic scholar. Exchange rates and gold/silver prices should be updated manually to current market rates.

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
