# Opciones Compartidas

A menos que se indique, las opciones en esta sección se aplican a todos los desarrollo, compilación y vista previa.

## raíz

- **Tipo:** `string`
- **Valor predeterminado:** `process.cwd()`

Directorio Root Project (donde se encuentra `index.html` ). Puede ser una ruta absoluta o una ruta relativa al directorio de trabajo actual.

Consulte [el proyecto Root](/es/guide/#index-html-and-project-root) para obtener más detalles.

## base

- **Tipo:** `string`
- **Valor predeterminado:** `/`
- **Relacionado:** [`server.origin`](/es/config/server-options.md#server-origin)

Base Public Rath cuando se sirve en desarrollo o producción. Los valores válidos incluyen:

- Nombre de ruta de URL absoluta, por ejemplo `/foo/`
- URL completa, por `https://bar.com/foo/` , la parte de origen no se usará en el desarrollo, por lo que el valor es el mismo que `/foo/` )
- Cadena vacía o `./` (para implementación integrada)

Vea [la ruta de la base pública](/es/guide/build#public-base-path) para obtener más detalles.

## modo

- **Tipo:** `string`
- **Valor predeterminado:** `'development'` para servir, `'production'` para la construcción

Especificar esto en config anulará el modo predeterminado para **servir y construir** . Este valor también se puede anular a través de la opción Línea de comando `--mode` .

Vea [las variables y modos Env](/es/guide/env-and-mode) para obtener más detalles.

## definir

- **Tipo:** `Record<string, any>`

Definir reemplazos constantes globales. Las entradas se definirán como globales durante el desarrollo y se reemplazarán estáticamente durante la construcción.

Vite usa [ESBuild Defines](https://esbuild.github.io/api/#define) para realizar reemplazos, por lo que las expresiones de valor deben ser una cadena que contenga un valor JSON-Serializable (nulo, booleano, número, cadena, matriz o objeto) o un solo identificador. Para los valores que no son de cuerda, Vite lo convertirá automáticamente en una cadena con `JSON.stringify` .

**Ejemplo:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip NOTE
Para los usuarios de TypeScript, asegúrese de agregar las declaraciones de tipo en el archivo `env.d.ts` o `vite-env.d.ts` para obtener cheques de tipo e IntelliSense.

Ejemplo:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## complementos

- **Tipo:** `(complemento | Complemento [] | Promise <Complemento | Complemento []>) [] `

Variedad de complementos para usar. Se ignoran los complementos de Falsy y las matrices de complementos se aplanan. Si se devuelve una promesa, se resolvería antes de correr. Consulte [la API de complementos](/es/guide/api-plugin) para obtener más detalles sobre los complementos VITE.

## Publicdir

- **Tipo:** `cadena | falso
- **Valor predeterminado:** `"public"`

Directorio para servir como activos estáticos simples. Los archivos en este directorio se sirven a `/` durante el desarrollo y se copian en la raíz de `outDir` durante la compilación, y siempre se sirven o copian como está sin transformación. El valor puede ser una ruta del sistema de archivos absoluto o una ruta relativa a la raíz del proyecto.

Definir `publicDir` como `false` deshabilita esta característica.

Vea [el directorio `public`](/es/guide/assets#the-public-directory) para más detalles.

## cachedir

- **Tipo:** `string`
- **Valor predeterminado:** `"node_modules/.vite"`

Directorio para guardar archivos de caché. Los archivos en este directorio son Deps previos a los Bundios o algunos otros archivos de caché generados por VITE, lo que puede mejorar el rendimiento. Puede usar `--force` FLAG o eliminar manualmente el directorio para regenerar los archivos de caché. El valor puede ser una ruta del sistema de archivos absoluto o una ruta relativa a la raíz del proyecto. Predeterminado a `.vite` cuando no se detecta paquete.json.

## resolve.alias

- **Tipo:**
  `Registrar <string, string> | Matriz <{find: string | Regexp, reemplazo: string, customResolver?: Resolverfunction | ResolverObject}> `

Se pasará a `@rollup/plugin-alias` como [opción de entradas](https://github.com/rollup/plugins/tree/master/packages/alias#entries) . Puede ser un objeto o una matriz de `{ find, replacement, customResolver }` pares.

Al alias a las rutas del sistema de archivos, siempre use rutas absolutas. Los valores de alias relativos se utilizarán como es y no se resolverán en las rutas del sistema de archivos.

Se puede lograr una resolución personalizada más avanzada a través de [complementos](/es/guide/api-plugin) .

::: warning Using with SSR
Si ha configurado alias para [dependencias externalizadas de SSR](/es/guide/ssr.md#ssr-externals) , es posible que desee alias los paquetes `node_modules` reales. Tanto [el hilo](https://classic.yarnpkg.com/es/docs/cli/add/#toc-yarn-add-alias) como [el PNPM](https://pnpm.io/aliases/) admiten aliasing a través del prefijo `npm:` .
:::

## resolve.dedupe

- **Tipo:** `string[]`

Si tiene copias duplicadas de la misma dependencia en su aplicación (probablemente debido a los paquetes de elevación o vinculados en Monorepos), use esta opción para forzar a VITE a resolver siempre las dependencias listadas a la misma copia (de Project Root).

:::warning SSR + ESM
Para las compilaciones de SSR, la deduplicación no funciona para las salidas de compilación de ESM configuradas desde `build.rollupOptions.output` . Una solución es usar salidas de compilación CJS hasta que ESM tenga un mejor soporte de complementos para la carga del módulo.
:::

## resolve.conditions

- **Tipo:** `string[]`
- **Predeterminado:** `['módulo', 'navegador', 'desarrollo|producción '] ` (` defaultClientConditions`)

Condiciones adicionales permitidas al resolver [las exportaciones condicionales](https://nodejs.org/api/packages.html#packages_conditional_exports) de un paquete.

Un paquete con exportaciones condicionales puede tener el siguiente campo `exports` en su `package.json` :

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

Aquí, `import` y `require` son "condiciones". Las condiciones se pueden anidar y deben especificarse de la más específica a menos específica.

`Desarrollo|Producción `is a special value that is replaced with`Producción`or`Desarrollo`depending on the value of`Process.env.node_env`. It is replaced with `Producción`when`Process.env.node_env === 'Producción'`and` Desarrollo` de lo contrario.

Tenga en cuenta que las condiciones `import` , `require` , `default` siempre se aplican si se cumplen los requisitos.

:::warning Resolving subpath exports
Las claves de exportación que terminan con "/" está desaprobada por el nodo y puede no funcionar bien. Póngase en contacto con el autor del paquete para usar [`*` patrones de subpath](https://nodejs.org/api/packages.html#package-entry-points) en su lugar.
:::

## resolve.mainFields

- **Tipo:** `string[]`
- **Valor predeterminado:** `['browser', 'module', 'jsnext:main', 'jsnext']` ( `defaultClientMainFields` )

Lista de campos en `package.json` para intentar al resolver el punto de entrada de un paquete. Nota Esto toma una precedencia menor que las exportaciones condicionales resueltas desde el campo `exports` : si un punto de entrada se resuelve con éxito a partir de `exports` , el campo principal se ignorará.

## resolve.extensions

- **Tipo:** `string[]`
- **Valor predeterminado:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

Lista de extensiones de archivos para probar las importaciones que omiten las extensiones. Tenga en cuenta que **no** se recomienda omitir extensiones para tipos de importación personalizados (por ejemplo, `.vue` ), ya que puede interferir con el soporte IDE y Tipo.

## resolve.preserveSymlinks

- **Tipo:** `boolean`
- **Valor predeterminado:** `false`

Habilitar esta configuración hace que VITE determine la identidad del archivo por la ruta del archivo original (es decir, la ruta sin seguir los enlaces de simulación) en lugar de la ruta del archivo real (es decir, la ruta después de seguir los enlaces simbólicos).

- **RELACIONADO:** [ESBUILD#Preserve-Symlinks](https://esbuild.github.io/api/#preserve-symlinks) , [Webpack#resolve.symlinks
  ] ( [https://webpack.js.org/configuration/resolve/#resolvesymlinks](https://webpack.js.org/configuration/resolve/#resolvesymlinks) )

## html.cspNonce

- **Tipo:** `string`
- **Relacionado:** [Política de seguridad de contenido (CSP)](/es/guide/features#content-security-policy-csp)

Un marcador de posición Nonce Value que se utilizará al generar etiquetas de script / estilo. Configurar este valor también generará una metaetiqueta con valor no CE.

## css.modules

- **Tipo:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * Valor predeterminado: indefinido
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

Configurar el comportamiento de los módulos CSS. Las opciones se transmiten a [los módulos postcss](https://github.com/css-modules/postcss-modules) .

Esta opción no tiene ningún efecto al usar [CSS Lightning](../guide/features.md#lightning-css) . Si está habilitado, [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) debe usarse en su lugar.

## css.postcss

- **Tipo:** `cadena | (postcss.processoptions & {complementos?: postcss.acceptedplugin []}) `

Configuración PostCSS en línea o un directorio personalizado para buscar la configuración PostCSS desde (predeterminado es Root Project).

Para la configuración PostCSS en línea, espera el mismo formato que `postcss.config.js` . Pero para `plugins` propiedad, solo se puede usar [el formato de matriz](https://github.com/postcss/postcss-load-config/blob/main/README.md#array) .

La búsqueda se realiza con [PostCSS-Load-Config](https://github.com/postcss/postcss-load-config) y solo se cargan los nombres de archivo de configuración compatibles. Los archivos de configuración fuera de la raíz del espacio de trabajo (o la [raíz del proyecto](/es/guide/#index-html-and-project-root) si no se encuentra ningún espacio de trabajo) no se buscan de forma predeterminada. Puede especificar una ruta personalizada fuera de la raíz para cargar el archivo de configuración específico si es necesario.

Nota Si se proporciona una configuración en línea, VITE no buscará otras fuentes de configuración PostCSS.

## css.preprocessorOptions

- **Tipo:** `Record<string, object>`

Especifique opciones para pasar a los preprocesadores de CSS. Las extensiones de archivo se utilizan como claves para las opciones. Las opciones compatibles para cada preprocesador se pueden encontrar en su respectiva documentación:

- `sass` `scss`
  - Seleccione la API SASS para usar con `API:" Compilador moderno " | "moderno" | "Legacy" `(default`"moderno-compilador"`if`SASS-Embeded`is installed, otherwise`"Modern"`). For the best performance, it's recommended to use `API: "Compilador moderno"`with the`SASS-Embedded`package. The`"Legacy"`API está en desuso y se eliminará en Vite 7.
  - [Opciones (moderna)](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
  - [Opciones (legado)](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions) .
- `less` : [Opciones](https://lesscss.org/usage/#less-options) .
- `styl` : Solo se admite [`define`](https://stylus-lang.com/docs/js.html#define-name-node) , que se puede pasar como un `stylus` .

**Ejemplo:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // o "moderno", "legado"
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **Tipo:** `cadena | ((fuente: String, FileName: String) => (String | {Content: String; mapa?: SourCeMap})) `

Esta opción se puede usar para inyectar código adicional para cada contenido de estilo. Tenga en cuenta que si incluye estilos reales y no solo variables, esos estilos se duplicarán en el paquete final.

**Ejemplo:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

## css.preprocessorMaxWorkers

- **Experimental:** [dar retroalimentación](https://github.com/vitejs/vite/discussions/15835)
- **Tipo:** `Número | verdadero
- **Valor predeterminado:** `0` (no crea ningún trabajador y se ejecuta en el hilo principal)

Si esta opción está establecida, los preprocesadores de CSS se ejecutarán en los trabajadores cuando sea posible. `true` significa el número de CPU menos 1.

## css.devSourcemap

- **Experimental:** [dar retroalimentación](https://github.com/vitejs/vite/discussions/13845)
- **Tipo:** `boolean`
- **Valor predeterminado:** `false`

Si habilita SourcEMaps durante el desarrollo.

## css.transformer

- **Experimental:** [dar retroalimentación](https://github.com/vitejs/vite/discussions/13835)
- **Tipo:** `'PostCSS' | 'Lightningcss'
- **Valor predeterminado:** `'postcss'`

Selecciona el motor utilizado para el procesamiento de CSS. Consulte [Lightning CSS](../guide/features.md#lightning-css) para obtener más información.

::: info Duplicate `@import`s
Tenga en cuenta que PostCSS (PostCSS-Import) tiene un comportamiento diferente con `@import` duplicados de los navegadores. Ver [PostCSS/PostCSS-Import#462](https://github.com/postcss/postcss-import/issues/462) .
:::

## css.lightningcss

- **Experimental:** [dar retroalimentación](https://github.com/vitejs/vite/discussions/13835)
- **Tipo:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Configura Lightning CSS. Las opciones de transformación completas se pueden encontrar en [el Repo de Lightning CSS](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts) .

## json.namedExports

- **Tipo:** `boolean`
- **Valor predeterminado:** `true`

Si admitir las importaciones nombradas de `.json` archivos.

## json.stringify

- **Tipo:** `booleano | 'Auto'`
- **Valor predeterminado:** `'auto'`

Si se establece en `true` , el JSON importado se transformará en `export default JSON.parse("...")` , que es significativamente más desempeño que los literales de objetos, especialmente cuando el archivo JSON es grande.

Si se establece en `'auto'` , los datos se triticarán solo si [los datos son más grandes de 10 kb](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger) .

## ESBuild

- **Tipo:** `ESBuildoptions | falso

`ESBuildOptions` extiende [las propias opciones de transformación de ESBuild](https://esbuild.github.io/api/#transform) . El caso de uso más común es personalizar JSX:

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Por defecto, ESBuild se aplica a los archivos `ts` , `jsx` y `tsx` . Puede personalizar esto con `esbuild.include` y `esbuild.exclude` , que puede ser una regex, un patrón [de picomatch](https://github.com/micromatch/picomatch#globbing-features) o una matriz de cualquiera de los dos.

Además, también puede usar `esbuild.jsxInject` para inyectar automáticamente las importaciones de jsx aelper para cada archivo transformado por ESBuild:

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

Cuando [`build.minify`](./build-options.md#build-minify) es `true` , todas las optimizaciones minificadas se aplican de forma predeterminada. Para deshabilitar [ciertos aspectos](https://esbuild.github.io/api/#minify) de la misma, establezca cualquiera de `esbuild.minifyIdentifiers` , `esbuild.minifySyntax` o `esbuild.minifyWhitespace` opciones en `false` . Tenga en cuenta que la opción `esbuild.minify` no se puede usar para anular `build.minify` .

Establecer en `false` para deshabilitar las transformaciones de ESBuild.

## huella de activos

- **Tipo:** `cadena | Regexp | (cadena | Regexp) [] `
- **Relacionado:** [Manejo de activos estáticos](/es/guide/assets)

Especifique [patrones de picomatch](https://github.com/micromatch/picomatch#globbing-features) adicionales para ser tratados como activos estáticos para que:

- Se excluirán de la tubería de transformación del complemento cuando se hace referencia desde HTML o se solicitará directamente más de `fetch` o XHR.

- Importarlos desde JS devolverá su cadena de URL resuelta (esto se puede sobrescribir si tiene un complemento `enforce: 'pre'` para manejar el tipo de activo de manera diferente).

La lista de tipos de activos incorporado se puede encontrar [aquí](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts) .

**Ejemplo:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## Loglevel

- **Tipo:** `'info' | 'advertir' | 'error' | 'Silencio'

Ajuste la verbosidad de salida de la consola. El valor predeterminado es `'info'` .

## custodlegger

- **Tipo:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

Use un registrador personalizado para registrar mensajes. Puede usar la API `createLogger` de Vite para obtener el registrador predeterminado y personalizarlo, por ejemplo, cambie el mensaje o filtre ciertas advertencias.

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // Ignorar Advertencia de archivos CSS vacíos
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## pantalla clara

- **Tipo:** `boolean`
- **Valor predeterminado:** `true`

Establezca en `false` para evitar que Vite borre la pantalla del terminal al registrar ciertos mensajes. A través de la línea de comando, use `--clearScreen false` .

## envidia

- **Tipo:** `string`
- **Valor predeterminado:** `root`

El directorio desde el cual se cargan `.env` archivos. Puede ser una ruta absoluta o una ruta relativa a la raíz del proyecto.

Vea [aquí](/es/guide/env-and-mode#env-files) para obtener más información sobre archivos de entorno.

## envprefix

- **Tipo:** `cadena | cadena [] `
- **Valor predeterminado:** `VITE_`

Las variables ENV que comienzan con `envPrefix` se expusirán al código fuente de su cliente a través de import.meta.env.

:::warning SECURITY NOTES
`envPrefix` no debe establecerse como `''` , lo que expondrá todas sus variables Env y causará fuga inesperada de información confidencial. Vite lanzará un error al detectar `''` .

Si desea exponer una variable sin pregrabarse, puede usar [Definir](#define) para exponerla:

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## contenido

- **Tipo:** `'spa' | 'MPA' | 'Custom'
- **Valor predeterminado:** `'spa'`

Ya sea que su aplicación sea una aplicación de una sola página (SPA), una [aplicación de múltiples páginas (MPA)](../guide/build#multi-page-app) o una aplicación personalizada (SSR y Frameworks con manejo HTML personalizado):

- `'spa'` : Incluya HTML MiddleWares y use SPA Fallback. Configurar [sirv](https://github.com/lukeed/sirv) con `single: true` en vista previa
- `'mpa'` : incluye HTML MiddleWares
- `'custom'` : No incluya HTML MiddleWares

Obtenga más información en [la Guía de SSR](/es/guide/ssr#vite-cli) de Vite. Relacionado: [`server.middlewareMode`](./server-options#server-middlewaremode) .

## futuro

- **Tipo:** `Record <String, 'Warn' | indefinido> `
- **Relacionado:** [cambios de ruptura](/es/changes/)

Habilite los cambios de ruptura futuros para prepararse para una migración suave a la próxima versión principal de VITE. La lista puede actualizarse, agregar o eliminar en cualquier momento a medida que se desarrollen nuevas características.

Consulte la página [de cambios de ruptura](/es/changes/) para obtener detalles de las posibles opciones.
