# API JavaScript

As APIs JavaScript da Vite estão totalmente digitadas e é recomendável usar o TypeScript ou ativar o tipo de verificação do tipo JS no código VS para alavancar o IntelliSense e a validação.

## `createServer`

**Tipo de assinatura:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Exemplo de uso:**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // Quaisquer opções de configuração de usuário válidas, mais `mode` e `configFile`
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
Ao usar `createServer` e `build` no mesmo processo Node.js, ambas as funções dependem de `process.env.NODE_ENV` para funcionar corretamente, o que também depende da opção de configuração `mode` . Para evitar comportamentos conflitantes, defina `process.env.NODE_ENV` ou `mode` das duas APIs a `development` . Caso contrário, você pode gerar um processo filho para executar as APIs separadamente.
:::

::: tip NOTE
Ao usar [o modo de middleware](/pt/config/server-options.html#server-middlewaremode) combinado com [a configuração proxy para websocket](/pt/config/server-options.html#server-proxy) , o servidor HTTP pai deve ser fornecido em `middlewareMode` para vincular o proxy corretamente.

<details><summary>Exemplo</summary><pre> <code class="language-ts">import http from 'http' import { createServer } from 'vite' const parentServer = http.createServer() // or express, koa, etc. const vite = await createServer({ server: { // Enable middleware mode middlewareMode: { // Provide the parent http server for proxy WebSocket server: parentServer, }, proxy: { '/ws': { target: 'ws://localhost:3000', // Proxying WebSocket ws: true, }, }, }, }) // @noErrors: 2339 parentServer.use(vite.middlewares)</code></pre></details>
:::

## `InlineConfig`

A interface `InlineConfig` se estende `UserConfig` com propriedades adicionais:

- `configFile` : Especifique o arquivo de configuração a ser usado. Se não estiver definido, o Vite tentará resolver automaticamente um do Project Root. Defina como `false` para desativar a resolução automática.
- `envFile` : Defina como `false` para desativar `.env` arquivos.

## `ResolvedConfig`

A interface `ResolvedConfig` possui todas as mesmas propriedades de um `UserConfig` , exceto que a maioria das propriedades é resolvida e não consoleada. Ele também contém utilitários como:

- `config.assetsInclude` : uma função para verificar se um `id` é considerado um ativo.
- `config.logger` : Objeto interno do Logger da Vite.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * O objeto de configuração Vite resolvido.
   */
  config: ResolvedConfig
  /**
   * Uma instância do aplicativo Connect
   * - pode ser usado para anexar utensílios médios personalizados ao servidor dev.
   * - também pode ser usado como a função manipuladora de um servidor HTTP personalizado
   *   ou como um middleware em qualquer estrutura Node.js de estilo Connect.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Instância do servidor HTTP do nó nativo.
   * Será nulo no modo de middleware.
   */
  httpServer: http.Server | null
  /**
   * Instância do observador de Chokidar. Se `config.server.watch` estiver definido como `null` ,
   * Ele não assistirá a nenhum arquivo e a chamada `add` ou `unwatch` não terá efeito.
   * https://github.com/paulmillr/chokidar/tree/3.6.0#api
   */
  watcher: FSWatcher
  /**
   * Servidor de soquete da web com o método `send(payload)` .
   */
  ws: WebSocketServer
  /**
   * Rollup Plugin Container que pode executar ganchos de plug -in em um determinado arquivo.
   */
  pluginContainer: PluginContainer
  /**
   * Gráfico do módulo que rastreia os relacionamentos de importação, URL para mapear arquivos
   * e estado de HMR.
   */
  moduleGraph: ModuleGraph
  /**
   * O URLS resolvido é impressa na CLI (codificada por URL). Retorna `null`
   * no modo de middleware ou se o servidor não estiver ouvindo em nenhuma porta.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Resolver, carregar, carregar e transformar um URL programaticamente
   * sem passar pelo pipeline de solicitação HTTP.
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Aplique as transformações HTML integradas do Vite e quaisquer transformadas HTML do plug-in.
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * Carregue um dado URL como um módulo instanciado para SSR.
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * Corrija o erro de erro SSR.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Desencadeia HMR para um módulo no gráfico do módulo. Você pode usar o `server.moduleGraph`
   * API para recuperar o módulo a ser recarregado. Se `hmr` for falso, isso é um não-OP.
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * Inicie o servidor.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Reinicie o servidor.
   *
   * @param forcePtimize -Force o otimizador a se refrescar, o mesmo que -Force CLI Flag
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * Pare o servidor.
   */
  close(): Promise<void>
  /**
   * Vincular atalhos da CLI
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * Ligue para `await server.waitForRequestsIdle(id)` aguardará até todas as importações estáticas
   * são processados. Se chamado de um gancho de plug -in de carga ou transformação, o ID precisa ser
   * Passado como um parâmetro para evitar impasse. Chamando esta função após o primeiro
   * A seção de importações estáticas do gráfico do módulo foi processada será resolvida imediatamente.
   * @experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` deve ser usado como uma escotilha de fuga para melhorar o DX para recursos que não podem ser implementados após a natureza sob demanda do servidor de dev vite. Ele pode ser usado durante a inicialização por ferramentas como o Tailwind para atrasar a geração das classes CSS do aplicativo até que o código do aplicativo tenha sido visto, evitando flashes de alterações de estilo. Quando essa função é usada em um gancho de carga ou transformação e o servidor HTTP1 padrão é usado, um dos seis canais HTTP será bloqueado até que o servidor processe todas as importações estáticas. Atualmente, o otimizador de dependência da Vite usa essa função para evitar recarregamentos de página inteira sobre as dependências ausentes, atrasando o carregamento de dependências pré-conceituadas até que todas as dependências importadas tenham sido coletadas de fontes importadas estáticas. O Vite pode mudar para uma estratégia diferente em uma versão importante futura, definindo `optimizeDeps.crawlUntilStaticImports: false` por padrão para evitar que o desempenho atingisse grandes aplicações durante o início do frio.
:::

## `build`

**Tipo de assinatura:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**Exemplo de uso:**

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

**Tipo de assinatura:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**Exemplo de uso:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // Quaisquer opções de configuração de usuário válidas, mais `mode` e `configFile`
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
   * O objeto de configuração de vite resolvido
   */
  config: ResolvedConfig
  /**
   * Uma instância do aplicativo Connect.
   * - Pode ser usado para anexar utensílios médios personalizados ao servidor de visualização.
   * - também pode ser usado como a função manipuladora de um servidor HTTP personalizado
   *   ou como middleware em qualquer estrutura de node.js de estilo de conexão
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Instância do servidor HTTP norno nativo
   */
  httpServer: http.Server
  /**
   * O URLS resolvido é impressa na CLI (codificada por URL). Retorna `null`
   * Se o servidor não estiver ouvindo em nenhuma porta.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * URLs do servidor de impressão
   */
  printUrls(): void
  /**
   * Vincular atalhos da CLI
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**Tipo de assinatura:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

O valor `command` é `serve` em dev e visualização e `build` em construção.

## `mergeConfig`

**Tipo de assinatura:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

Mesclar profundamente duas configurações de vite. `isRoot` representa o nível dentro da configuração Vite que está sendo mesclada. Por exemplo, defina `false` se você estiver mesclando duas `build` opções.

::: tip NOTE
`mergeConfig` aceita apenas configuração em forma de objeto. Se você tiver uma configuração no formulário de retorno de chamada, deve chamá -lo antes de passar para `mergeConfig` .

Você pode usar o auxiliar `defineConfig` para mesclar uma configuração no formulário de retorno de chamada com outra configuração:

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

// ---corte---
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**Tipo de assinatura:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**Relacionado:** [Server.fs.allow](/pt/config/server-options.md#server-fs-allow)

Procure a raiz do espaço de trabalho em potencial se atender às seguintes condições, caso contrário, ele fará fallback para `root` :

- contém `workspaces` campo em `package.json`
- contém um dos seguintes arquivos
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**Tipo de assinatura:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**Relacionado:** [`.env` arquivos](./env-and-mode.md#env-files)

Carregue `.env` arquivos dentro do `envDir` . Por padrão, apenas as variáveis ENV prefixadas com `VITE_` são carregadas, a menos que `prefixes` seja alterado.

## `normalizePath`

**Tipo de assinatura:**

```ts
function normalizePath(id: string): string
```

**Relacionado:** [Normalização do caminho](./api-plugin.md#path-normalization)

Normaliza um caminho para interoperar entre os plug -ins de vite.

## `transformWithEsbuild`

**Tipo de assinatura:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

Transforme JavaScript ou TypeScript com Esbuild. Útil para plug -ins que preferem a transformação interna da ESBUILD da Vite.

## `loadConfigFromFile`

**Tipo de assinatura:**

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

Carregue um arquivo de configuração vite manualmente com ESBuild.

## `preprocessCSS`

- **Experimental:** [dê feedback](https://github.com/vitejs/vite/discussions/13815)

**Tipo de assinatura:**

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

Pré-processos `.css` , `.scss` , `.sass` , `.less` , `.styl` e `.stylus` arquivos para simples CSS para que possam ser usados em navegadores ou analisados por outras ferramentas. Semelhante ao [suporte de pré-processamento CSS interno](/pt/guide/features#css-pre-processors) , o pré-processador correspondente deve ser instalado se usado.

O pré-processador usado é inferido da extensão `filename` . Se o `filename` termina com `.module.{ext}` , ele será inferido como um [módulo CSS](https://github.com/css-modules/css-modules) e o resultado retornado incluirá um objeto `modules` mapeando os nomes originais da classe para os transformados.

Observe que o pré-processamento não resolverá URLs em `url()` ou `image-set()` .
