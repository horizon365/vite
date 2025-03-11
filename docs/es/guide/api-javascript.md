# API JavaScript

Las API de JavaScript de Vite están completamente escrita, y se recomienda usar TypeScript o habilitar la verificación del tipo JS en el código VS para aprovechar el IntelliSense y la validación.

## `createServer`

**Tipo de firma:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Ejemplo de uso:**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // cualquier opción de configuración de usuario válida, más `mode` y `configFile`
  configFile: false,
  root: __dirname,
  server: {
    port: 1337,
  },
})
await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })
```

::: tip NOTE
Cuando se usan `createServer` y `build` en el mismo proceso de nodo.js, ambas funciones dependen de `process.env.NODE_ENV` para funcionar correctamente, lo que también depende de la opción de configuración `mode` . Para prevenir un comportamiento conflictivo, establezca `process.env.NODE_ENV` o los `mode` de las dos API a `development` . De lo contrario, puede generar un proceso infantil para ejecutar las API por separado.
:::

::: tip NOTE
Cuando se usa [el modo de middleware](/es/config/server-options.html#server-middlewaremode) combinado con [la configuración proxy para WebSocket](/es/config/server-options.html#server-proxy) , el servidor HTTP principal debe proporcionarse en `middlewareMode` para vincular el proxy correctamente.

<details><summary>Ejemplo</summary><pre> <code class="language-ts">import http from 'http' import { createServer } from 'vite' const parentServer = http.createServer() // or express, koa, etc. const vite = await createServer({ server: { // Enable middleware mode middlewareMode: { // Provide the parent http server for proxy WebSocket server: parentServer, }, proxy: { '/ws': { target: 'ws://localhost:3000', // Proxying WebSocket ws: true, }, }, }, }) // @noErrors: 2339 parentServer.use(vite.middlewares)</code></pre></details>
:::

## `InlineConfig`

La interfaz `InlineConfig` se extiende `UserConfig` con propiedades adicionales:

- `configFile` : Especifique el archivo de configuración para usar. Si no se establece, Vite intentará resolver automáticamente uno desde el proyecto Root. Establecer en `false` para deshabilitar la resolución automática.
- `envFile` : Establezca en `false` para deshabilitar `.env` archivos.

## `ResolvedConfig`

La interfaz `ResolvedConfig` tiene las mismas propiedades de un `UserConfig` , excepto que la mayoría de las propiedades se resuelven y no se infinan. También contiene utilidades como:

- `config.assetsInclude` : Una función para verificar si un `id` se considera un activo.
- `config.logger` : Objeto de registrador interno de Vite.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * El objeto de configuración VITE resuelto.
   */
  config: ResolvedConfig
  /**
   * Una instancia de la aplicación Connect
   * - Se puede usar para adjuntar los middlewares personalizados al servidor Dev.
   * - También se puede usar como la función de controlador de un servidor HTTP personalizado
   *   o como un middleware en cualquier marco de nodo.js de estilo conectado.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Instancia de servidor HTTP de nodo nativo.
   * Será nulo en modo middleware.
   */
  httpServer: http.Server | null
  /**
   * Instancia del observador de Chokidar. Si `config.server.watch` se establece en `null` ,
   * No verá ningún archivo y llamar `add` o `unwatch` no tendrá ningún efecto.
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * Servidor de socket web con el método `send(payload)` .
   */
  ws: WebSocketServer
  /**
   * Contenedor de complemento de rollo que puede ejecutar ganchos de complemento en un archivo determinado.
   */
  pluginContainer: PluginContainer
  /**
   * Gráfico del módulo que rastrea las relaciones de importación, URL a la asignación de archivos
   * y estado de HMR.
   */
  moduleGraph: ModuleGraph
  /**
   * Las URL resueltas se imprimen en la CLI (URL codificada). Devuelve `null`
   * en modo middleware o si el servidor no escucha en ningún puerto.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Resolver, cargar y transformar programáticamente una URL y obtener el resultado
   * sin pasar por la tubería de solicitud HTTP.
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Aplique transformaciones HTML incorporadas VITE y cualquier transformación HTML de complemento.
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * Cargue una URL dada como un módulo instanciado para SSR.
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * Corrige el error SSR Stacktrace.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Desencadena HMR para un módulo en el gráfico del módulo. Puedes usar el `server.moduleGraph`
   * API para recuperar el módulo a recargar. Si `hmr` es falso, esto es un no-op.
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * Inicie el servidor.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Reinicie el servidor.
   *
   * @param forceOptimize -obligar al optimizador a volver a superar, igual que la bandera de CLI -force
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * Detén el servidor.
   */
  close(): Promise<void>
  /**
   * Atar atajos de CLI
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * Llamar `await server.waitForRequestsIdle(id)` esperará hasta que todas las importaciones estáticas
   * son procesados. Si se llama desde un gancho de complemento de carga o transformación, la identificación debe ser
   * pasó como un parámetro para evitar los puntos muertos. Llamar a esta función después de la primera
   * La sección de importaciones estáticas del gráfico del módulo se ha procesado se resolverá de inmediato.
   * @experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` está destinado a usarse como una escotilla de escape para mejorar DX para las características que no se pueden implementar siguiendo la naturaleza a pedido del servidor VITE Dev. Se puede usar durante el inicio mediante herramientas como Tailwind para retrasar la generación de las clases de la aplicación CSS hasta que se haya visto el código de la aplicación, evitando destellos de cambios de estilo. Cuando esta función se usa en un gancho de carga o transformación, y se usa el servidor HTTP1 predeterminado, uno de los seis canales HTTP se bloqueará hasta que el servidor procese todas las importaciones estáticas. El optimizador de dependencia de Vite actualmente utiliza esta función para evitar las recargas de páginas completas en las dependencias faltantes al retrasar la carga de dependencias previas a Bundled hasta que todas las dependencias importadas se hayan recopilado de fuentes importadas estáticas. VITE puede cambiar a una estrategia diferente en una versión principal futura, estableciendo `optimizeDeps.crawlUntilStaticImports: false` de forma predeterminada para evitar el éxito de rendimiento en grandes aplicaciones durante el inicio en frío.
:::

## `build`

**Tipo de firma:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**Ejemplo de uso:**

```ts twoslash [vite.config.js]
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await build({
  root: path.resolve(__dirname, './project'),
  base: '/foo/',
  build: {
    rollupOptions: {
      // ...
    },
  },
})
```

## `preview`

**Tipo de firma:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**Ejemplo de uso:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // cualquier opción de configuración de usuario válida, más `mode` y `configFile`
  preview: {
    port: 8080,
    open: true,
  },
})

previewServer.printUrls()
previewServer.bindCLIShortcuts({ print: true })
```

## `PreviewServer`

```ts
interface PreviewServer {
  /**
   * El objeto de configuración vite resuelto
   */
  config: ResolvedConfig
  /**
   * Una instancia de aplicación de conexión.
   * - Se puede usar para adjuntar el servidor Middle MiddleS personalizado al servidor Preview.
   * - También se puede usar como la función de controlador de un servidor HTTP personalizado
   *   o como un middleware en cualquier nodo de estilo conectado.js frameworks
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Instancia del servidor HTTP de nodo nativo
   */
  httpServer: http.Server
  /**
   * Las URL resueltas se imprimen en la CLI (URL codificada). Devuelve `null`
   * Si el servidor no está escuchando en ningún puerto.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Imprimir URL del servidor
   */
  printUrls(): void
  /**
   * Atar atajos de CLI
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**Tipo de firma:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

El valor `command` es `serve` en dev y vista previa, y `build` en compilación.

## `mergeConfig`

**Tipo de firma:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

Fusionar profundamente dos configuraciones vite. `isRoot` representa el nivel dentro de la configuración VITE que se está fusionando. Por ejemplo, establezca `false` si está fusionando dos `build` opciones.

::: tip NOTE
`mergeConfig` acepta solo configuración en forma de objeto. Si tiene una configuración en forma de devolución de llamada, debe llamarla antes de pasar a `mergeConfig` .

Puede usar el `defineConfig` ayudante para fusionar una configuración en forma de devolución de llamada con otra configuración:

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

// ---cortar---
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**Tipo de firma:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**RELACIONADO:** [servidor.fs.ing](/es/config/server-options.md#server-fs-allow)

Busque la raíz del espacio de trabajo potencial si cumple con las siguientes condiciones; de lo contrario, le devolvería a `root` :

- contiene `workspaces` campo en `package.json`
- contiene uno de los siguientes archivos
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**Tipo de firma:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**Relacionado:** [`.env` archivos](./env-and-mode.md#env-files)

Cargar `.env` archivos dentro del `envDir` . Por defecto, solo se cargan las variables ENV prefijadas con `VITE_` , a menos que se cambie `prefixes` .

## `normalizePath`

**Tipo de firma:**

```ts
function normalizePath(id: string): string
```

**Relacionado:** [Normalización de la ruta](./api-plugin.md#path-normalization)

Normaliza una ruta para interoperar entre complementos VITE.

## `transformWithEsbuild`

**Tipo de firma:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

Transforme JavaScript o TypeScript con ESBuild. Útil para complementos que prefieren coincidir la transformación de ESBuild interna de Vite.

## `loadConfigFromFile`

**Tipo de firma:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  customLogger?: Logger,
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

Cargue un archivo de configuración vite manualmente con ESBuild.

## `preprocessCSS`

- **Experimental:** [dar retroalimentación](https://github.com/vitejs/vite/discussions/13815)

**Tipo de firma:**

```ts
async function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig,
): Promise<PreprocessCSSResult>

interface PreprocessCSSResult {
  code: string
  map?: SourceMapInput
  modules?: Record<string, string>
  deps?: Set<string>
}
```

Precrocesos `.css` , `.scss` , `.sass` , `.less` , `.styl` y `.stylus` archivos a CSS lisos para que pueda usarse en navegadores o analizar por otras herramientas. Similar al [soporte de preprocesamiento CSS incorporado](/es/guide/features#css-pre-processors) , el preprocesador correspondiente debe instalarse si se usa.

El preprocesador utilizado se infiere de la extensión `filename` . Si el `filename` termina con `.module.{ext}` , se infiere como un [módulo CSS](https://github.com/css-modules/css-modules) y el resultado devuelto incluirá un objeto `modules` mapeando los nombres de clase originales a los transformados.

Tenga en cuenta que el preprocesamiento no resolverá las URL en `url()` o `image-set()` .
