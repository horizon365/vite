# Build Options

Unless noted, the options in this section are only applied to build.

## build.target

- **Tipo:** `cadena | cadena [] `
- **Valor predeterminado:** `'modules'`
- **RELACIONADO:** [Compatibilidad del navegador](/es/guide/build#browser-compatibility)

Objetivo de compatibilidad del navegador para el paquete final. El valor predeterminado es un valor especial VITE, `'modules'` , que se dirige a los navegadores con [módulos ES nativos](https://caniuse.com/es6-module) , [importación dinámica de ESM nativa](https://caniuse.com/es6-module-dynamic-import) y [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) soporte. Vite reemplazará de `'modules'` a `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`

Otro valor especial es `'esnext'` , lo que supone soporte de importaciones dinámicas nativas y solo realizará una transpección mínima.

La transformación se realiza con ESBuild y el valor debe ser una [opción de destino ESBuild](https://esbuild.github.io/api/#target) válida. Los objetivos personalizados pueden ser una versión ES (por ejemplo, `es2015` ), un navegador con la versión (por ejemplo, `chrome58` ) o una matriz de múltiples cadenas de objetivos.

Tenga en cuenta que la compilación fallará si el código contiene características que no puede ser transpilada de manera segura por ESBuild. Vea [los documentos de ESBuild](https://esbuild.github.io/content-types/#javascript) para más detalles.

## build.modulePreload

- **Tipo:** `booleano | {PolyFill?: Boolean, ResolDePendencies?: ResolVeModuleProLoAdDependencesfn} `
- **Valor predeterminado:** `{ polyfill: true }`

Por defecto, se inyecta automáticamente un [módulo de polyfill de precarga](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) . El polyfill se inyecta automáticamente en el módulo proxy de cada entrada `index.html` . Si la compilación está configurada para usar una entrada personalizada no HTML a través de `build.rollupOptions.input` , entonces es necesario importar manualmente el polyfill en su entrada personalizada:

```js
import 'vite/modulepreload-polyfill'
```

Nota: El polyfill **no** se aplica al [modo de biblioteca](/es/guide/build#library-mode) . Si necesita admitir navegadores sin importación dinámica nativa, probablemente debería evitar usarlo en su biblioteca.

El polyfill se puede deshabilitar usando `{ polyfill: false }` .

Vite calcula la lista de fragmentos para precargar para cada importación dinámica. Por defecto, se usará una ruta absoluta que incluye el `base` al cargar estas dependencias. Si el `base` es relativo ( `''` o `'./'` ), `import.meta.url` se usa en tiempo de ejecución para evitar rutas absolutas que dependen de la base implementada final.

Existe un soporte experimental para el control de grano fino sobre la lista de dependencias y sus rutas utilizando la función `resolveDependencies` . [Dar retroalimentación](https://github.com/vitejs/vite/discussions/13841) . Espera una función del tipo `ResolveModulePreloadDependenciesFn` :

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    hostId: string
    hostType: 'html' | 'js'
  },
) => string[]
```

Se solicitará la función `resolveDependencies` para cada importación dinámica con una lista de los fragmentos de la que depende, y también se llamará para cada fragmento importado en los archivos HTML de entrada. Se puede devolver una nueva matriz de dependencias con estas dependencias filtradas o más inyectadas, y sus rutas modificadas. Las `deps` rutas son relativas a las `build.outDir` . El valor de retorno debe ser una ruta relativa al `build.outDir` .

```js twoslash
/** @type {import('vite').UserConfig} */
const config = {
  // prettier-ignore
  build: {
// ---cut-before---
modulePreload: {
  resolveDependencies: (filename, deps, { hostId, hostType }) => {
    return deps.filter(condition)
  },
},
// ---cut-after---
  },
}
```

Las rutas de dependencia resueltas se pueden modificar aún más usando [`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options) .

## build.polyfillModulePreload

- **Tipo:** `boolean`
- **Valor predeterminado:** `true`
- En su lugar el uso **desapercibido** `build.modulePreload.polyfill`

Si se inyectan automáticamente un [módulo que precarga la polyfill](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) .

## build.outDir

- **Tipo:** `string`
- **Valor predeterminado:** `dist`

Especifique el directorio de salida (relativo a [la raíz del proyecto](/es/guide/#index-html-and-project-root) ).

## build.assetsDir

- **Tipo:** `string`
- **Valor predeterminado:** `assets`

Especifique el directorio a los activos generados por NEST (en relación con `build.outDir` Esto no se usa en [el modo de biblioteca](/es/guide/build#library-mode) ).

## build.assetsInlineLimit

- **Tipo:** `number` | `((FilePath: String, Content: Buffer) => Boolean | indefinido) `
- **Valor predeterminado:** `4096` (4 KIB)

Los activos importados o referenciados que son más pequeños que este umbral se ingresarán como URL BASE64 para evitar solicitudes HTTP adicionales. Establecer en `0` para deshabilitar la entrada por completo.

If a callback is passed, a boolean can be returned to opt-in or opt-out. If nothing is returned the default logic applies.

Git LFS placeholders are automatically excluded from inlining because they do not contain the content of the file they represent.

::: tip Note
Si especifica `build.lib` , `build.assetsInlineLimit` será ignorado y los activos siempre se inclinarán, independientemente del tamaño del archivo o ser un marcador de posición GIT LFS.
:::

## build.cssCodeSplit

- **Tipo:** `boolean`
- **Valor predeterminado:** `true`

Enable/disable CSS code splitting. When enabled, CSS imported in async JS chunks will be preserved as chunks and fetched together when the chunk is fetched.

If disabled, all CSS in the entire project will be extracted into a single CSS file.

::: tip Note
Si especifica `build.lib` , `build.cssCodeSplit` será `false` como predeterminado.
:::

## build.cssTarget

- **Tipo:** `cadena | cadena [] `
- **Valor predeterminado:** lo mismo que [`build.target`](#build-target)

This option allows users to set a different browser target for CSS minification from the one used for JavaScript transpilation.

It should only be used when you are targeting a non-mainstream browser.
Un ejemplo es Android WeChat WebView, que admite la mayoría de las características modernas de JavaScript, pero no la [notación de color hexadecimal `#RGBA` en CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb_colors) .
En este caso, debe establecer `build.cssTarget` a `chrome61` para evitar que Vite transforme `rgba()` colores en `#RGBA` notaciones hexadecimales.

## build.cssMinify

- **Tipo:** `booleano | 'esbuild' | 'Lightningcss'
- **Valor predeterminado:** lo mismo que [`build.minify`](#build-minify) para el cliente, `'esbuild'` para SSR

Esta opción permite a los usuarios anular la minificación CSS específicamente en lugar de incumplir a `build.minify` , por lo que puede configurar la minificación para JS y CSS por separado. Vite usa `esbuild` por defecto para minificar CSS. Establezca la opción en `'lightningcss'` para usar [Lightning CSS](https://lightningcss.dev/minification.html) en su lugar. Si se selecciona, se puede configurar usando [`css.lightningcss`](./shared-options.md#css-lightningcss) .

## build.sourcemap

- **Tipo:** `booleano | 'inline' | 'Hidden'
- **Valor predeterminado:** `false`

Generar mapas de fuente de producción. Si `true` , se creará un archivo SourCEMAP separado. Si es `'inline'` , el SourCEMAP se agregará al archivo de salida resultante como un URI de datos. `'hidden'` funciona como `true` excepto que se suprimen los comentarios de SourCEMAP correspondientes en los archivos agrupados.

## build.rollupOptions

- **Tipo:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

Personalice directamente el paquete de rollo subyacente. Esta es lo mismo que las opciones que se pueden exportar desde un archivo de configuración de Rollup y se fusionarán con las opciones de rollupa internas de Vite. Consulte [los documentos de opciones de rollo](https://rollupjs.org/configuration-options/) para más detalles.

## build.commonjsOptions

- **Tipo:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

Opciones para pasar a [@Rollup/Plugin-Commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) .

## build.dynamicImportVarsOptions

- **Tipo:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)
- **Relacionado:** [importación dinámica](/es/guide/features#dynamic-import)

Opciones para pasar a [@Rollup/Plugin-Dynamic-Import-Vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars) .

## build.lib

- **Tipo:** `{Entrada: cadena | cadena[] | {[Entryalias: String]: String}, Name?: String, Formats?: ('Es' | 'CJS' | 'umd' | 'iife') [], nombre de archivo?: cadena | ((formato: módulo format, entryname: string) => string), cssfilename?: string} `
- **Relacionado:** [modo de biblioteca](/es/guide/build#library-mode)

Construir como biblioteca. Se requiere `entry` ya que la biblioteca no puede usar HTML como entrada. `name` es la variable global expuesta y se requiere cuando `formats` incluye `'umd'` o `'iife'` . `formats` predeterminados son `['es', 'umd']` o `['es', 'cjs']` , si se utilizan múltiples entradas.

`fileName` es el nombre de la salida del archivo del paquete, que es predeterminado al `"name"` en `package.json` . También se puede definir como una función que toma los `format` y `entryName` como argumentos, y devuelve el nombre del archivo.

Si su paquete importa CSS, `cssFileName` se puede usar para especificar el nombre de la salida del archivo CSS. El valor predeterminado es el mismo valor que `fileName` si se establece una cadena, de lo contrario, también vuelve a los `"name"` en `package.json` .

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/main.js'],
      fileName: (format, entryName) => `my-lib-${entryName}.${format}.js`,
      cssFileName: 'my-lib-style',
    },
  },
})
```

## build.manifest

- **Tipo:** `booleano | cadena
- **Valor predeterminado:** `false`
- **Relacionado:** [integración de backend](/es/guide/backend-integration)

Si generar un archivo de manifiesto que contiene una asignación de nombres de archivos de activos no molidos a sus versiones hash, que luego pueden ser utilizadas por un marco de servidor para representar los enlaces de activos correctos.

Cuando el valor es una cadena, se usará como la ruta del archivo manifiesto en relación con `build.outDir` . Cuando se establece en `true` , la ruta sería `.vite/manifest.json` .

## build.ssrManifest

- **Tipo:** `booleano | cadena
- **Valor predeterminado:** `false`
- **Relacionado:** [representación del lado del servidor](/es/guide/ssr)

Whether to generate a SSR manifest file for determining style links and asset preload directives in production.

Cuando el valor es una cadena, se usará como la ruta del archivo manifiesto en relación con `build.outDir` . Cuando se establece en `true` , la ruta sería `.vite/ssr-manifest.json` .

## build.ssr

- **Tipo:** `booleano | cadena
- **Valor predeterminado:** `false`
- **Relacionado:** [representación del lado del servidor](/es/guide/ssr)

Producir construcción orientada a SSR. El valor puede ser una cadena para especificar directamente la entrada SSR, o `true` , que requiere especificar la entrada SSR a través de `rollupOptions.input` .

## build.emitAssets

- **Tipo:** `boolean`
- **Valor predeterminado:** `false`

During non-client builds, static assets aren't emitted as it is assumed they would be emitted as part of the client build. Esta opción permite que los marcos forzan emitirlos en otros entornos. Es responsabilidad del marco fusionar los activos con un paso posterior a la construcción.

## build.ssrEmitAssets

- **Tipo:** `boolean`
- **Valor predeterminado:** `false`

Durante la construcción de SSR, los activos estáticos no se emiten, ya que se supone que se emitirían como parte de la construcción del cliente. Esta opción permite que los marcos forzan emitirlos tanto en la compilación del cliente como en la SSR. Es responsabilidad del marco fusionar los activos con un paso posterior a la construcción. Esta opción será reemplazada por `build.emitAssets` una vez que la API de entorno sea estable.

## build.minify

- **Tipo:** `booleano | 'terser' | 'Esbuild'
- **Valor predeterminado:** `'esbuild'` para la compilación del cliente, `false` para la compilación SSR

Establecer en `false` para deshabilitar la minificación, o especificar el minificador para usar. El valor predeterminado es [ESBuild](https://github.com/evanw/esbuild) , que es 20 ~ 40x más rápido que Terser y solo 1 ~ 2% peor de compresión. [Puntos de referencia](https://github.com/privatenumber/minification-benchmarks)

Tenga en cuenta que la opción `build.minify` no minifica los espacios en blanco cuando se usa el formato `'es'` en modo LIB, ya que elimina las anotaciones puras y rompe la sacudida de los árboles.

Terser debe instalarse cuando esté configurado en `'terser'` .

```sh
npm add -D terser
```

## build.terserOptions

- **Tipo:** `TerserOptions`

[Opciones de minificación](https://terser.org/docs/api-reference#minify-options) adicional para pasar a Terser.

Además, también puede pasar una opción `maxWorkers: number` para especificar el número máximo de trabajadores para generar. El valor predeterminado al número de CPU menos 1.

## build.write

- **Tipo:** `boolean`
- **Valor predeterminado:** `true`

Establecer en `false` para deshabilitar la escritura del paquete al disco. Esto se usa principalmente en [las llamadas programáticas `build()`](/es/guide/api-javascript#build) donde se necesita más procesamiento posterior al paquete antes de escribir en el disco.

## build.emptyOutDir

- **Tipo:** `boolean`
- **Valor predeterminado:** `true` si `outDir` está dentro de `root`

Por defecto, Vite vaciará el `outDir` en la compilación si está dentro de la raíz del proyecto. Emitirá una advertencia si `outDir` está fuera de la raíz para evitar eliminar accidentalmente archivos importantes. Puede establecer explícitamente esta opción para suprimir la advertencia. Esto también está disponible a través de la línea de comandos como `--emptyOutDir` .

## build.copyPublicDir

- **Tipo:** `boolean`
- **Valor predeterminado:** `true`

Por defecto, VITE copiará archivos del `publicDir` a la compilación `outDir` en. Establecer en `false` para deshabilitar esto.

## build.reportCompressedSize

- **Tipo:** `boolean`
- **Valor predeterminado:** `true`

Habilitar/deshabilitar los informes de tamaño comprimido GZIP. La comprimir archivos de salida grandes puede ser lento, por lo que deshabilitar esto puede aumentar el rendimiento de compilación para grandes proyectos.

## build.chunkSizeWarningLimit

- **Tipo:** `number`
- **Valor predeterminado:** `500`

Límite para advertencias de tamaño de fragmento (en KB). Se compara con el tamaño del fragmento sin comprimir ya que el [tamaño de JavaScript en sí está relacionado con el tiempo de ejecución](https://v8.dev/blog/cost-of-javascript-2019) .

## build.watch

- **Tipo:** [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) `| nulo
- **Valor predeterminado:** `null`

Establecer en `{}` para habilitar Rollup Watcher. Esto se usa principalmente en casos que involucran complementos solo de construcción o procesos de integraciones.

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

Hay casos en que la observación del sistema de archivos no funciona con WSL2.
Ver [`server.watch`](./server-options.md#server-watch) para más detalles.

:::
