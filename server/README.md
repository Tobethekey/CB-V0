diff --git a/server/README.md b/server/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..c96a822a59a56c0d852d09798f3795229dcb5589
--- /dev/null
+++ b/server/README.md
@@ -0,0 +1,58 @@
+# Image Generation API
+
+This lightweight Node.js server provides the `/api/generate` endpoint consumed by the ColoringBook frontend. It uses the OpenAI Images API to transform text prompts into base64-encoded PNGs formatted for coloring book pages.
+
+## Setup
+
+1. Install the dependencies from the repository root:
+
+   ```bash
+   pnpm install
+   ```
+
+2. Copy the example environment file and update it with your credentials:
+
+   ```bash
+   cp server/.env.example server/.env
+   ```
+
+   | Variable | Description |
+   | --- | --- |
+   | `OPENAI_API_KEY` | Required. OpenAI API key with access to the Images API. |
+   | `PORT` | Optional. Port for the API server (defaults to `5000`). |
+   | `CLIENT_ORIGIN` | Optional. Restrict CORS requests to a specific origin. |
+
+3. Start the API server:
+
+   ```bash
+   pnpm server
+   ```
+
+The frontend expects the API to be available at `http://localhost:5000/api/generate` by default.
+
+## Endpoints
+
+- `GET /api/health` – Simple readiness probe.
+- `POST /api/generate` – Accepts a JSON payload with `description`, `aspectRatio`, and `style` parameters and responds with a base64 data URL containing the generated PNG.
+
+## Request Payload
+
+```json
+{
+  "description": "A majestic unicorn in an enchanted forest with butterflies",
+  "aspectRatio": "portrait",
+  "style": "detailed"
+}
+```
+
+`aspectRatio` can be `square`, `portrait`, or `landscape`. `style` can be `classic`, `minimalist`, or `detailed`.
+
+## Response
+
+```json
+{
+  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
+}
+```
+
+On error the API returns a JSON object with an `error` message and the appropriate HTTP status code.
