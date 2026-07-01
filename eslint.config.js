import baseConfig from './packages/config/eslint/base.js';

export default [
  ...baseConfig,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/.turbo/**',
      '**/migrations/**',
      '**/*.config.*',
      '**/coverage/**',
      '**/.pnpm-store/**',
    ],
  },
  {
    files: ['apps/web/src/**/*.tsx', 'packages/ui/src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
