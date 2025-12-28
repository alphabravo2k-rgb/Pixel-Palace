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
    // 1. PROJECT STRUCTURE: Allow Hooks + Components in one file (Vital for your structure)
    'react-refresh/only-export-components': 'off',
    
    // 2. DEV EXPERIENCE: Warn only, don't break build
    'react/prop-types': 'off', 
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
    
    // 3. LOGGING: Allow warn/error/info, warn on 'log' (Good for finding debug junk)
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    
    // 4. REACT PRACTICES
    'react/jsx-props-no-spreading': 'off', // Changed to OFF (Spreading is fine for UI wrappers)
    "react/function-component-definition": ["warn", { "namedComponents": "arrow-function" }],
    
    // 5. THE CRITICAL FIX: "Warn" only. 
    // "Error" forces you to add deps that might cause infinite loops.
    // "Warn" lets you know, but lets you decide.
    "react-hooks/exhaustive-deps": "warn"
  },
}
