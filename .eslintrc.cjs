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
    // 1. PROJECT STRUCTURE: Allow Constants + Components in one file
    // 'warn' is safer than 'off' because it keeps Fast Refresh working
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // 2. DEV EXPERIENCE: Warn only, don't break build
    'react/prop-types': 'off', 
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^React$' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }], // Added 'debug'
    
    // 3. REACT PRACTICES
    'react/jsx-props-no-spreading': 'off', 
    "react/function-component-definition": ["warn", { "namedComponents": "arrow-function" }],
    
    // 4. THE CRITICAL FIX: "Warn" only. 
    // Stops the infinite loop trap where linter forces bad deps.
    "react-hooks/exhaustive-deps": "warn"
  },
}
