import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // React 17+ uses the automatic JSX runtime, so default React imports are
      // not required at runtime. Keep compatibility with existing components.
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
      // Generated SVG icons and routing hooks intentionally share their files.
      'react-refresh/only-export-components': 'off',
      // These effects restore persisted state and timer state on startup.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
