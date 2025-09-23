import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'


export default [
  {
    files: ['**/*.{js,ts,vue}'], // 匹配所有 JavaScript、TypeScript 和 Vue 文件
    languageOptions: {
      parser: vueParser, // 使用 Vue 的解析器
    },
  },
  {
    files: ['**/*.ts'], // Match TypeScript files
    languageOptions: {
      parser: tsParser, // Use TypeScript parser
      parserOptions: {
        ecmaVersion: 2020, // Use modern ECMAScript features
        sourceType: 'module', // Enable ES modules
        project: ['./tsconfig.app.json','./tsconfig.node.json'], // Point to your tsconfig.json
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin, // Add TypeScript plugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules, // Use recommended TypeScript rules
    },
  },
]