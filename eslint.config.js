import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'


export default [
  {
    ignores: ['.vite/**', 'dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.vue'], // 匹配 Vue 文件
    languageOptions: {
      parser: vueParser, // 使用 Vue 的解析器
      parserOptions: {
        parser: tsParser, // Vue 文件中的 script 部分使用 TypeScript 解析器
        ecmaVersion: 2020,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // 使用基础的 TypeScript 规则，不依赖类型信息
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    files: ['**/*.{js,ts}'], // 匹配 JavaScript 和 TypeScript 文件
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },

]