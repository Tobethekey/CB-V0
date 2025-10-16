diff --git a/eslint.config.js b/eslint.config.js
index ec2b712d301e7ddeca8327fc4b967069cc82047b..38e67537b47f690e594184147babc6f3c38b5393 100644
--- a/eslint.config.js
+++ b/eslint.config.js
@@ -1,33 +1,59 @@
 import js from '@eslint/js'
 import globals from 'globals'
 import reactHooks from 'eslint-plugin-react-hooks'
 import reactRefresh from 'eslint-plugin-react-refresh'
 
 export default [
   { ignores: ['dist'] },
   {
-    files: ['**/*.{js,jsx}'],
+    files: ['server/**/*.js'],
+    languageOptions: {
+      ecmaVersion: 'latest',
+      sourceType: 'module',
+      globals: {
+        ...globals.node,
+        fetch: true,
+      },
+    },
+    rules: {
+      ...js.configs.recommended.rules,
+      'no-console': 'off',
+    },
+  },
+  {
+    files: ['src/**/*.{js,jsx}'],
     languageOptions: {
       ecmaVersion: 2020,
       globals: globals.browser,
       parserOptions: {
         ecmaVersion: 'latest',
         ecmaFeatures: { jsx: true },
         sourceType: 'module',
       },
     },
     plugins: {
       'react-hooks': reactHooks,
       'react-refresh': reactRefresh,
     },
     rules: {
       ...js.configs.recommended.rules,
       ...reactHooks.configs.recommended.rules,
       'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
       'react-refresh/only-export-components': [
         'warn',
         { allowConstantExport: true },
       ],
     },
   },
+  {
+    files: ['vite.config.js'],
+    languageOptions: {
+      ecmaVersion: 'latest',
+      sourceType: 'module',
+      globals: globals.node,
+    },
+    rules: {
+      ...js.configs.recommended.rules,
+    },
+  },
 ]
