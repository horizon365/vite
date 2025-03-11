# Integración De Backend

:::tip Note
Si desea servir el HTML utilizando un backend tradicional (por ejemplo, Rails, Laravel) pero use VITE para servir activos, verifique las integraciones existentes en la lista de [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) .

Si necesita una integración personalizada, puede seguir los pasos de esta guía para configurarla manualmente
:::

1. En su configuración VITE, configure la entrada y habilita la compilación del manifiesto:

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   // ---cortar---
   export default defineConfig({
     server: {
       cors: {
         // El origen al que accederá a través del navegador
         origin: 'http://my-backend.example.com',
       },
     },
     build: {
       // Generar .vite/manifest.json en Outdir
       manifest: true,
       rollupOptions: {
         // sobrescribir la entrada de .html por defecto.
         input: '/path/to/main.js',
       },
     },
   })
   ```

   Si no ha deshabilitado el [módulo de polyfill Polyfill](/es/config/build-options.md#build-polyfillmodulepreload) , también debe importar el polyfill en su entrada

   ```js
   // Agregue el comienzo de la entrada de su aplicación
   import 'vite/modulepreload-polyfill'
   ```

2. Para el desarrollo, inyecte lo siguiente en la plantilla HTML de su servidor (sustituya `http://localhost:5173` con la url local que vite se ejecuta en):

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   Para servir adecuadamente los activos, tiene dos opciones:

   - Asegúrese de que el servidor esté configurado en solicitudes de activos estáticos proxy al servidor VITE
   - Establecer [`server.origin`](/es/config/server-options.md#server-origin) para que las URL de activos generadas se resuelvan utilizando la URL del servidor de fondo en lugar de una ruta relativa

   Esto es necesario para que los activos como las imágenes se cargan correctamente.

   Tenga en cuenta que si está utilizando React con `@vitejs/plugin-react` , también deberá agregar esto antes de los scripts anteriores, ya que el complemento no puede modificar el HTML que está sirviendo (sustituya `http://localhost:5173` con el VITE local que se ejecuta en):

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. Para la producción: después de ejecutar `vite build` , se generará un archivo `.vite/manifest.json` junto con otros archivos de activos. Un archivo manifiesto de ejemplo se ve así:

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

   - El manifiesto tiene una estructura `Record<name, chunk>`
   - Para fragmentos de entrada o entrada dinámica, la clave es la ruta SRC relativa desde la raíz del proyecto.
   - Para fragmentos sin entrada, la clave es el nombre base del archivo generado con prefijo `_` .
   - Para el archivo CSS generado cuando [`build.cssCodeSplit`](/es/config/build-options.md#build-csscodesplit) es `false` , la clave es `style.css` .
   - Los fragmentos contendrán información sobre sus importaciones estáticas y dinámicas (ambas son claves que se asignan al fragmento correspondiente en el manifiesto), y también en sus CSS y archivos de activos correspondientes (si los hay).

4. Puede usar este archivo para representar enlaces o directivas de precarga con nombres de archivo hash.

   Aquí hay un ejemplo de plantilla HTML para representar los enlaces adecuados. La sintaxis aquí es para
   Solo explicación, sustituya con el lenguaje de plantilla de su servidor. El `importedChunks`
   La función es para ilustración y no proporciona Vite.

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

   Específicamente, un HTML generador de backend debe incluir las siguientes etiquetas dado un manifiesto
   archivo y un punto de entrada:

   - Una etiqueta `<link rel="stylesheet">` para cada archivo en la lista `css` del fragmento del punto de entrada
   - Sigue recursivamente todos los fragmentos en la lista `imports` del punto de entrada e incluya un
     `<link rel="stylesheet">` Etiqueta para cada archivo CSS de cada fragmento importado.
   - Una etiqueta para la tecla `file` de la fragmentación del punto de entrada ( `<script type="module">` para JavaScript,
     o `<link rel="stylesheet">` para CSS)
   - Opcionalmente, `<link rel="modulepreload">` etiqueta para el `file` de cada JavaScript importado
     fragmento, nuevamente después de las importaciones que comienzan desde el fragmento de punto de entrada.

   Siguiendo el ejemplo de ejemplo anterior, para el punto de entrada `views/foo.js` las siguientes etiquetas deben incluirse en la producción:

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   Mientras que se debe incluir lo siguiente para el punto de entrada `views/bar.js` :

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details Pseudo implementation of `importedChunks`
   Un ejemplo de pseudo implementación de `importedChunks` en TypeScript (esto
   Necesita ser adaptado para su lenguaje de programación y lenguaje de plantilla):

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
