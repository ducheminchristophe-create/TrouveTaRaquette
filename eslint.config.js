import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Désactivé pendant la migration P1 : aiStringService.ts est du code legacy complexe
      '@typescript-eslint/no-explicit-any': 'off',
      // Warnings non bloquants
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/no-anonymous-default-export': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
