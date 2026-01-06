/** * 👮 PIXEL PALACE: CODE INTEGRITY ENFORCER
 * -----------------------------------------
 * STATUS: MASTERED (GLOBAL STANDARD)
 * * PHILOSOPHY:
 * 1. AUTOMATION: Imports are sorted automatically. No human arguments.
 * 2. ACCESSIBILITY: The platform must be usable by all (Global Standard).
 * 3. HYGIENE: No unused vars, no console logs in prod, no mess.
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
    'plugin:jsx-a11y/recommended', // ♿ ACCESSIBILITY: The mark of a pro platform
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'bundle-stats.html'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh', 'simple-import-sort', 'jsx-a11y'],
  rules: {
    // 1. 🚀 HMR & VITE STABILITY
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // 2. 🧹 AUTOMATED CLEANLINESS (The "Dubai" Polish)
    'simple-import-sort/imports': 'error', // 🚨 ERROR if imports are messy
    'simple-import-sort/exports': 'error',
    'no-duplicate-imports': 'error',
    
    // 3. 🧠 CODE HYGIENE
    'no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_', 
      'varsIgnorePattern': '^React$', 
      'caughtErrorsIgnorePattern': '^_' 
    }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info', 'table'] }],
    'no-debugger': 'warn',

    // 4. ⚛️ REACT ARCHITECTURE & STANDARDS
    'react/prop-types': 'off', 
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/function-component-definition': ['warn', { 'namedComponents': 'arrow-function' }],
    'react/self-closing-comp': ['warn', { 'component': true, 'html': true }],
    'react/jsx-pascal-case': 'warn', // Forces <MyComponent> not <myComponent>
    
    // 5. 🏗️ JSX PERFECTION
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/jsx-boolean-value': ['warn', 'never'],
    
    // 6. 🛡️ SECURITY & STABILITY
    'react/jsx-no-target-blank': 'warn', // Prevents security leaks on external links
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // 7. ♿ ACCESSIBILITY (Reasonable defaults)
    // We turn off the annoying ones, but keep the critical ones
    'jsx-a11y/click-events-have-key-events': 'off', 
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/alt-text': 'warn', // Images MUST have alt text
  },
}
