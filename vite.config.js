diff --git a/vite.config.js b/vite.config.js
index af0941bac3896a83fc29e62796e3ec1d4bad78d2..e9397235127c767a701c4a67a41c90833cea5e2f 100644
--- a/vite.config.js
+++ b/vite.config.js
@@ -1,14 +1,17 @@
 import { defineConfig } from 'vite'
 import react from '@vitejs/plugin-react'
 import tailwindcss from '@tailwindcss/vite'
-import path from 'path'
+import { dirname, resolve } from 'node:path'
+import { fileURLToPath } from 'node:url'
+
+const currentDir = dirname(fileURLToPath(import.meta.url))
 
 // https://vite.dev/config/
 export default defineConfig({
-  plugins: [react(),tailwindcss()],
+  plugins: [react(), tailwindcss()],
   resolve: {
     alias: {
-      "@": path.resolve(__dirname, "./src"),
+      '@': resolve(currentDir, './src'),
     },
   },
 })
