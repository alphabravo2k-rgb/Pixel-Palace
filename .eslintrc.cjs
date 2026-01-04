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
    // 1. 🚀 VELOCITY: Allow Constants + Components in one file (Vite requirement)
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // 2. 🧠 SANITY CHECKS: Reduce annoyance
    'react/prop-types': 'off', // We trust you know your props (or use TypeScript later)
    'react/no-unescaped-entities': 'off', // Allows "Don't" instead of "Don&apos;t"
    'react/display-name': 'off', // Fixes false positives with memo/forwardRef
    
    // 3. 🧹 CLEAN CODE
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_', 
      varsIgnorePattern: '^React$',
      caughtErrorsIgnorePattern: '^_' 
    }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug', 'table'] }], 
    
    // 4. ⚛️ REACT BEST PRACTICES
    'react/jsx-props-no-spreading': 'off', 
    "react/function-component-definition": ["warn", { "namedComponents": "arrow-function" }],
    'react/self-closing-comp': 'warn', // Forces <Div /> instead of <Div></Div> for empty tags
    
    // 5. ⚠️ THE SAFETY VALVE: Warn only, don't break build.
    // This allows you to intentionally omit dependencies in useEffect if you know what you're doing.
    "react-hooks/exhaustive-deps": "warn"
  },
}
