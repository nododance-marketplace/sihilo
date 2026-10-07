import js from '@eslint/js';
export default [
  { ignores: ['dist/**', 'node_modules/**', 'docs/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  { files: ['js/**/*.js'], languageOptions: { sourceType: 'script', globals: Object.fromEntries(['window','document','Element','IntersectionObserver','FormData','fetch'].map(key => [key, 'readonly'])) } },
  { files: ['scripts/**/*.mjs', '*.config.mjs', 'tests/**/*.mjs'], languageOptions: { globals: { console: 'readonly', process: 'readonly', URL: 'readonly', Buffer: 'readonly', setTimeout: 'readonly' } } },
  { files: ['tests/**/*.mjs'], languageOptions: { globals: { window: 'readonly', document: 'readonly', PerformanceObserver: 'readonly', performance: 'readonly' } } },
];
