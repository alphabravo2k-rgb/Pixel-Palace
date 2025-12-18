module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    // DISABLE STRICT COMPONENT EXPORT RULE (Allows exporting Hooks + Components in one file)
    'react-refresh/only-export-components': 'off',
    
    'react/prop-types': 'off', 
    // ALLOW 'React' IMPORT TO BE UNUSED (Standard Vite behavior)
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'react/jsx-props-no-spreading': 'warn',
    "react/function-component-definition": ["warn", { "namedComponents": "arrow-function" }],
    "react-hooks/exhaustive-deps": "error"
  },
}
