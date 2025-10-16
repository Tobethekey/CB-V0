diff --git a/server/index.js b/server/index.js
new file mode 100644
index 0000000000000000000000000000000000000000..95c5ab108f0bbb9d280f006d4873c06372fec29a
--- /dev/null
+++ b/server/index.js
@@ -0,0 +1,182 @@
+import http from 'node:http'
+import { readFileSync, existsSync } from 'node:fs'
+import { URL } from 'node:url'
+
+const ENV_FILE = new URL('./.env', import.meta.url)
+
+if (existsSync(ENV_FILE)) {
+  const envText = readFileSync(ENV_FILE, 'utf-8')
+  for (const line of envText.split(/\r?\n/)) {
+    const trimmed = line.trim()
+    if (!trimmed || trimmed.startsWith('#')) continue
+    const [key, ...rest] = trimmed.split('=')
+    if (!key) continue
+    const value = rest.join('=').trim()
+    if (value && !(key in process.env)) {
+      process.env[key] = value
+    }
+  }
+}
+
+const aspectRatioToSize = {
+  square: '1024x1024',
+  portrait: '1024x1536',
+  landscape: '1536x1024',
+}
+
+const styleDirectives = {
+  classic:
+    "Classic children's coloring book lines. Use bold, clean outlines and leave open spaces for coloring. Avoid shading and gradients.",
+  minimalist:
+    'Minimalist coloring sheet. Focus on simple geometric shapes, generous negative space, and smooth, intentional outlines.',
+  detailed:
+    'Highly detailed adult coloring page. Include intricate line work, patterns, and textures while keeping it black and white.',
+}
+
+const port = Number.parseInt(process.env.PORT ?? '5000', 10)
+const clientOrigin = process.env.CLIENT_ORIGIN ?? '*'
+
+if (!process.env.OPENAI_API_KEY) {
+  console.warn('OPENAI_API_KEY is not set. Image generation requests will fail until it is provided.')
+}
+
+const setCorsHeaders = (res) => {
+  if (clientOrigin === '*') {
+    res.setHeader('Access-Control-Allow-Origin', '*')
+  } else {
+    res.setHeader('Access-Control-Allow-Origin', clientOrigin)
+    res.setHeader('Vary', 'Origin')
+  }
+  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
+  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
+}
+
+const server = http.createServer(async (req, res) => {
+  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
+  setCorsHeaders(res)
+
+  if (req.method === 'OPTIONS') {
+    res.writeHead(204)
+    res.end()
+    return
+  }
+
+  if (req.method === 'GET' && url.pathname === '/api/health') {
+    res.writeHead(200, { 'Content-Type': 'application/json' })
+    res.end(JSON.stringify({ status: 'ok' }))
+    return
+  }
+
+  if (req.method === 'POST' && url.pathname === '/api/generate') {
+    try {
+      const body = await readRequestBody(req)
+      let payload
+      try {
+        payload = JSON.parse(body)
+      } catch {
+        res.writeHead(400, { 'Content-Type': 'application/json' })
+        res.end(JSON.stringify({ error: 'Request body must be valid JSON.' }))
+        return
+      }
+
+      const { description, aspectRatio = 'square', style = 'classic' } = payload ?? {}
+
+      if (!description || typeof description !== 'string' || !description.trim()) {
+        res.writeHead(400, { 'Content-Type': 'application/json' })
+        res.end(JSON.stringify({ error: 'A description is required to generate an image.' }))
+        return
+      }
+
+      if (!process.env.OPENAI_API_KEY) {
+        res.writeHead(500, { 'Content-Type': 'application/json' })
+        res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not configured.' }))
+        return
+      }
+
+      const selectedAspect = aspectRatioToSize[aspectRatio] ? aspectRatio : 'square'
+      const size = aspectRatioToSize[selectedAspect]
+      const styleInstruction = styleDirectives[style] ?? styleDirectives.classic
+
+      const prompt = [
+        'Create a black and white line art illustration suitable for printing as a coloring book page.',
+        styleInstruction,
+        'The drawing should be crisp, high contrast, and contain no filled colors or shading.',
+        `Scene description: ${description.trim()}`,
+      ].join('\n\n')
+
+      const response = await fetch('https://api.openai.com/v1/images/generations', {
+        method: 'POST',
+        headers: {
+          'Content-Type': 'application/json',
+          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
+        },
+        body: JSON.stringify({
+          model: 'gpt-image-1',
+          prompt,
+          size,
+          response_format: 'b64_json',
+        }),
+      })
+
+      if (!response.ok) {
+        const errorText = await response.text()
+        console.error('OpenAI API error:', response.status, errorText)
+        res.writeHead(response.status, { 'Content-Type': 'application/json' })
+        res.end(JSON.stringify({ error: 'Image generation failed.', details: errorText }))
+        return
+      }
+
+      const data = await response.json()
+      const imageData = data?.data?.[0]?.b64_json
+
+      if (!imageData) {
+        console.error('OpenAI response did not include image data:', data)
+        res.writeHead(502, { 'Content-Type': 'application/json' })
+        res.end(JSON.stringify({ error: 'Image service did not return data.' }))
+        return
+      }
+
+      res.writeHead(200, { 'Content-Type': 'application/json' })
+      res.end(JSON.stringify({ image: `data:image/png;base64,${imageData}` }))
+      return
+    } catch (error) {
+      console.error('Failed to generate image:', error)
+      const status = error?.message === 'Request body too large' ? 413 : 500
+      const message =
+        status === 413 ? 'Request body too large.' : 'Unable to generate image at this time.'
+      res.writeHead(status, { 'Content-Type': 'application/json' })
+      res.end(JSON.stringify({ error: message }))
+      return
+    }
+  }
+
+  res.writeHead(404, { 'Content-Type': 'application/json' })
+  res.end(JSON.stringify({ error: 'Not found' }))
+})
+
+server.listen(port, () => {
+  console.log(`Image generation API listening on port ${port}`)
+})
+
+function readRequestBody(req) {
+  return new Promise((resolve, reject) => {
+    const chunks = []
+    let totalLength = 0
+    req
+      .on('data', (chunk) => {
+        totalLength += chunk.length
+        if (totalLength > 1_000_000) {
+          reject(new Error('Request body too large'))
+          req.destroy()
+          return
+        }
+        chunks.push(chunk)
+      })
+      .on('end', () => {
+        resolve(Buffer.concat(chunks).toString('utf8'))
+      })
+      .on('error', (err) => {
+        reject(err)
+      })
+  })
+}
