import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/.turbo/**',
      '**/migrations/**',
      '**/*.config.*',
    ],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // UI package: forbid imports from database and API packages
    // Enforces the architecture rule: UI components must not access DB/API directly.
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    plugins: { import: importPlugin },
    settings: {
      'import/internal-regex': '^@ahlipanggilan/',
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: 'packages/ui/src',
              from: 'packages/database/src',
              message: 'UI components must not import from @ahlipanggilan/database',
            },
            {
              target: 'packages/ui/src',
              from: 'apps/api/src',
              message: 'UI components must not import from the API package directly',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
