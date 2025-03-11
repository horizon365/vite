# Backend -Integration

:::tip Note
Wenn Sie die HTML mit einem herkömmlichen Backend (z. B. Schienen, Laravel) servieren möchten, aber VITE zum Servieren von Vermögenswerten verwenden, suchen Sie nach vorhandenen Integrationen, die in [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) aufgeführt sind.

Wenn Sie eine benutzerdefinierte Integration benötigen, können Sie die Schritte in diesem Handbuch befolgen, um sie manuell zu konfigurieren
:::

1. Konfigurieren Sie in Ihrer Vite -Konfiguration den Eintrag und aktivieren Sie das Build -Manifest:

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   // ---schneiden---
   export default defineConfig({
     server: {
       cors: {
         // Der Ursprung, auf den Sie über den Browser zugreifen werden
         origin: 'http://my-backend.example.com',
       },
     },
     build: {
       // erzeugen Sie .Vite/Manifest.json im Freien
       manifest: true,
       rollupOptions: {
         // standardmäßig überschreiben .html Eintrag
         input: '/path/to/main.js',
       },
     },
   })
   ```

   Wenn Sie das [Modul -Vorspannungs -Polyfill](/de/config/build-options.md#build-polyfillmodulepreload) nicht deaktiviert haben, müssen Sie auch die Polyfill in Ihrem Eintrag importieren

   ```js
   // Fügen Sie den Beginn Ihres App -Eintrags hinzu
   import 'vite/modulepreload-polyfill'
   ```

2. Für die Entwicklung injizieren Sie Folgendes in die HTML -Vorlage Ihres Servers (ersetzen Sie `http://localhost:5173` durch die lokale URL -VITE):

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   Um Vermögenswerte ordnungsgemäß zu servieren, haben Sie zwei Optionen:

   - Stellen Sie sicher
   - Setzen Sie [`server.origin`](/de/config/server-options.md#server-origin) so, dass generierte Asset-URLs mithilfe der URL der Back-End-Server anstelle eines relativen Pfades gelöst werden

   Dies ist erforderlich, damit Vermögenswerte wie Bilder richtig geladen werden können.

   Hinweis Wenn Sie React mit `@vitejs/plugin-react` verwenden, müssen Sie dies auch vor den oben genannten Skripten hinzufügen, da das Plugin nicht in der Lage ist, die von Ihnen bediente HTML zu ändern (ersetzen Sie `http://localhost:5173` mit dem lokalen URL -Vite):

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. Für die Produktion: Nach dem Ausführen `vite build` wird eine `.vite/manifest.json` -Datei neben anderen Asset -Dateien generiert. Eine Beispielmanifestdatei sieht Folgendes aus:

   ```json [.vite/manifest.json]
   {
     "_shared-B7PI925R.js": {
       "file": "assets/shared-B7PI925R.js",
       "name": "shared",
       "css": ["assets/shared-ChJ_j-JJ.css"]
     },
     "_shared-ChJ_j-JJ.css": {
       "file": "assets/shared-ChJ_j-JJ.css",
       "src": "_shared-ChJ_j-JJ.css"
     },
     "baz.js": {
       "file": "assets/baz-B2H3sXNv.js",
       "name": "baz",
       "src": "baz.js",
       "isDynamicEntry": true
     },
     "views/bar.js": {
       "file": "assets/bar-gkvgaI9m.js",
       "name": "bar",
       "src": "views/bar.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "dynamicImports": ["baz.js"]
     },
     "views/foo.js": {
       "file": "assets/foo-BRBmoGS9.js",
       "name": "foo",
       "src": "views/foo.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "css": ["assets/foo-5UjPuW-k.css"]
     }
   }
   ```

   - Das Manifest hat eine `Record<name, chunk>` Struktur
   - Für Einstiegs- oder dynamische Eingangsbrocken ist der Schlüssel der relative SRC -Pfad von Project Root.
   - Für Nicht -Eintragsbrocken ist der Schlüssel der Grundname der mit `_` vorangestellten Datei -Datei.
   - Für die CSS -Datei, die bei [`build.cssCodeSplit`](/de/config/build-options.md#build-csscodesplit) generiert wird `false` ist der Schlüssel `style.css` .
   - Die Brocken enthalten Informationen zu seinen statischen und dynamischen Importen (beide sind Schlüssel, die dem entsprechenden Chunk im Manifest zugeordnet sind) sowie seine entsprechenden CSS- und Asset -Dateien (falls vorhanden).

4. Sie können diese Datei verwenden, um Links oder Vorladungsanweisungen mit Hashed -Dateinamen zu rendern.

   Hier ist ein Beispiel für eine HTML -Vorlage, um die richtigen Links zu rendern. Die Syntax hier ist für
   Erläuterung nur, ersetzen Sie Ihre Server -Vorlagensprache. Die `importedChunks`
   Funktion dient zur Illustration und wird nicht von VITE bereitgestellt.

   ```html
   <!-- if production -->

   <!-- for cssFile of manifest[name].css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <!-- for chunk of importedChunks(manifest, name) -->
   <!-- for cssFile of chunk.css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <script type="module" src="/{{ manifest[name].file }}"></script>

   <!-- for chunk of importedChunks(manifest, name) -->
   <link rel="modulepreload" href="/{{ chunk.file }}" />
   ```

   Insbesondere sollte ein HTML -Erzeugungsbackend die folgenden Tags enthalten
   Datei und ein Einstiegspunkt:

   - Ein `<link rel="stylesheet">` -Tag für jede Datei in der `css` -Liste des Einstiegspunkts Chunk
   - Befolgen Sie rekursiv alle Brocken in der `imports` -Liste der Einstiegspunkte und schließen a ein
     `<link rel="stylesheet">` Tag für jede CSS -Datei jedes importierten Stücks.
   - Ein Tag für die `file` -Taste des Einstiegspunkt -Chunk ( `<script type="module">` für JavaScript,
     oder `<link rel="stylesheet">` für CSS)
   - Optional `<link rel="modulepreload">` Tag für die `file` von jedem importierten JavaScript
     Chunk, erneut rekursiv den Importen ab dem Einstiegspunkt -Chunk.

   Nach dem obigen Beispielmanifest für den Einstiegspunkt `views/foo.js` sollten die folgenden Tags in der Produktion enthalten sein:

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   Während der Einstiegspunkt `views/bar.js` enthalten sein sollte:

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details Pseudo implementation of `importedChunks`
   Ein Beispiel für Pseudo -Implementierung von `importedChunks` in TypeScript (dies wird
   müssen für Ihre Programmiersprache und Vorlagensprache angepasst werden):

   ```ts
   import type { Manifest, ManifestChunk } from 'vite'

   export default function importedChunks(
     manifest: Manifest,
     name: string,
   ): ManifestChunk[] {
     const seen = new Set<string>()

     function getImportedChunks(chunk: ManifestChunk): ManifestChunk[] {
       const chunks: ManifestChunk[] = []
       for (const file of chunk.imports ?? []) {
         const importee = manifest[file]
         if (seen.has(file)) {
           continue
         }
         seen.add(file)

         chunks.push(...getImportedChunks(importee))
         chunks.push(importee)
       }

       return chunks
     }

     return getImportedChunks(manifest[name])
   }
   ```

   :::
