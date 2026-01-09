/** * 👮 PIXEL PALACE: CODE INTEGRITY ENFORCER
 * VERSION: 2050.1.0 (MASTER OMNI)
 * STATUS: SECURED
 */

module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true, 
    node: true 
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'bundle-stats.html', 'dist_stats.html'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { 
    react: { version: '18.2' } 
  },
  plugins: ['react-refresh', 'simple-import-sort', 'jsx-a11y'],
  rules: {
    // 1. 🚀 HMR & VITE STABILITY
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    
    // 2. 🧹 AUTOMATED CLEANLINESS (THE NEYXUS STANDARD)
    'simple-import-sort/imports': 'error', 
    'simple-import-sort/exports': 'error',
    'no-duplicate-imports': 'error',
    
    // 3. 🧠 CODE HYGIENE & 3D PERFORMANCE
    'no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_', 
      'varsIgnorePattern': '^(React|gl|state|t)$', // Allow 3D/GLSL variables used in Three.js
      'caughtErrorsIgnorePattern': '^_' 
    }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info', 'table'] }],
    'no-debugger': 'warn',
    'no-constant-condition': 'warn',

    // 4. ⚛️ REACT ARCHITECTURE
    'react/prop-types': 'off', 
    'react/no-unescaped-entities': 'off',
    'react/function-component-definition': ['warn', { 'namedComponents': 'arrow-function' }],
    'react/self-closing-comp': ['warn', { 'component': true, 'html': true }],
    'react/jsx-pascal-case': 'warn',
    
    // 5. 🏗️ JSX PERFECTION
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/jsx-boolean-value': ['warn', 'never'],
    
    // 6. 🛡️ SECURITY & 25-YEAR STABILITY
    'react/jsx-no-target-blank': 'error', // Upgraded to error for maximum security
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // 7. ♿ ACCESSIBILITY
    'jsx-a11y/alt-text': 'error', // Non-negotiable: Images must be described
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/click-events-have-key-events': 'off', 
    'jsx-a11y/no-static-element-interactions': 'off',
  },
}
