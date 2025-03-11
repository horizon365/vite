# Usando `Environment` instâncias

:::warning Experimental
A API do ambiente é experimental. Manteremos as APIs estáveis durante o Vite 6 para permitir que o ecossistema experimente e construa sobre ele. Planejamos estabilizar essas novas APIs com possíveis mudanças de quebra no Vite 7.

Recursos:

- [Discussão sobre feedback](https://github.com/vitejs/vite/discussions/16358) onde estamos recebendo feedback sobre as novas APIs.
- [API PR do ambiente](https://github.com/vitejs/vite/pull/16471) , onde a nova API foi implementada e revisada.

Compartilhe seu feedback conosco.
:::

## Acessando os ambientes

Durante o Dev, os ambientes disponíveis em um servidor de desenvolvimento podem ser acessados usando `server.environments` :

```js
// Crie o servidor ou obtenha -o no gancho ConfigureServer
const server = await createServer(/* opções */)

const environment = server.environments.client
environment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

Você também pode acessar o ambiente atual a partir de plugins. Consulte a [API do ambiente para plugins](./api-environment-plugins.md#accessing-the-current-environment-in-hooks) para obter mais detalhes.

## `DevEnvironment` classe

Durante o Dev, cada ambiente é uma instância da classe `DevEnvironment` :

```ts
class DevEnvironment {
  /**
   * Identificador exclusivo para o ambiente em um servidor vite.
   * Por padrão, o Vite expõe ambientes 'Cliente' e 'SSR'.
   */
  name: string
  /**
   * Canal de comunicação para enviar e receber mensagens do
   * Runner de módulo associado no tempo de execução do destino.
   */
  hot: NormalizedHotChannel
  /**
   * Gráfico dos nós do módulo, com a relação importada entre
   * Módulos processados e o resultado em cache do código processado.
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * Plugins resolvidos para este ambiente, incluindo os
   * Criado usando o gancho por 0,itário `create`
   */
  plugins: Plugin[]
  /**
   * Permite resolver, carregar e transformar código através do
   * Plug -ins de ambiente Pipeline
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * Opções de configuração resolvidas para esse ambiente. Opções no servidor
   * o escopo global são tomados como padrões para todos os ambientes e podem
   * ser substituído (resolver condições, externo, otimizedDeps)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(
    name: string,
    config: ResolvedConfig,
    context: DevEnvironmentContext,
  )

  /**
   * Resolva o URL para um ID, carregá -lo e processe o código usando o
   * Plugins Pipeline. O gráfico do módulo também é atualizado.
   */
  async transformRequest(url: string): Promise<TransformResult | null>

  /**
   * Registre uma solicitação a ser processada com baixa prioridade. Isso é útil
   * para evitar cachoeiras. O servidor Vite tem informações sobre o
   * Módulos importados por outros pedidos, para que possa aquecer o gráfico do módulo
   * Portanto, os módulos já são processados quando são solicitados.
   */
  async warmupRequest(url: string): Promise<void>
}
```

Com `DevEnvironmentContext` ser:

```ts
interface DevEnvironmentContext {
  hot: boolean
  transport?: HotChannel | WebSocketServer
  options?: EnvironmentOptions
  remoteRunner?: {
    inlineSourceMap?: boolean
  }
  depsOptimizer?: DepsOptimizer
}
```

E com `TransformResult` ser:

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Uma instância do ambiente no servidor Vite permite processar um URL usando o método `environment.transformRequest(url)` . Esta função usará o pipeline do plug -in para resolver o `url` para um módulo `id` , carregar -o (lendo o arquivo do sistema de arquivos ou através de um plug -in que implementa um módulo virtual) e depois transformará o código. Ao transformar o módulo, as importações e outros metadados serão registrados no gráfico do módulo de ambiente, criando ou atualizando o nó do módulo correspondente. Quando o processamento é feito, o resultado da transformação também é armazenado no módulo.

:::info transformRequest naming
Estamos usando `transformRequest(url)` e `warmupRequest(url)` na versão atual desta proposta, para que seja mais fácil discutir e entender para os usuários usados para a API atual da Vite. Antes de lançar, também podemos aproveitar a oportunidade para revisar esses nomes. Por exemplo, pode ser nomeado `environment.processModule(url)` ou `environment.loadModule(url)` pegando uma página do Rollup's `context.load(id)` em ganchos de plug -in. No momento, achamos que manter os nomes atuais e atrasar essa discussão é melhor.
:::

## Gráficos De Módulos Separados

Cada ambiente possui um gráfico de módulo isolado. Todos os gráficos de módulos têm a mesma assinatura, para que os algoritmos genéricos possam ser implementados para rastejar ou consultar o gráfico sem depender do ambiente. `hotUpdate` é um bom exemplo. Quando um arquivo é modificado, o gráfico do módulo de cada ambiente será usado para descobrir os módulos afetados e executar a HMR para cada ambiente de forma independente.

::: info
O Vite V5 tinha um cliente misto e um gráfico do módulo SSR. Dado um nó não processado ou invalidado, não é possível saber se corresponde ao cliente, SSR ou ambos. Os nós do módulo têm algumas propriedades prefixadas, como `clientImportedModules` e `ssrImportedModules` (e `importedModules` que retornam a união de ambos). `importers` Contém todos os importadores do ambiente cliente e SSR para cada nó do módulo. Um nó do módulo também tem `transformResult` e `ssrTransformResult` . Uma camada de compatibilidade com versões anteriores permite que o ecossistema migre do `server.moduleGraph` depreciado.
:::

Cada módulo é representado por uma instância `EnvironmentModuleNode` . Os módulos podem ser registrados no gráfico sem serem processados ( `transformResult` seria `null` nesse caso). `importers` e `importedModules` também são atualizados após o processamento do módulo.

```ts
class EnvironmentModuleNode {
  environment: string

  url: string
  id: string | null = null
  file: string | null = null

  type: 'js' | 'css'

  importers = new Set<EnvironmentModuleNode>()
  importedModules = new Set<EnvironmentModuleNode>()
  importedBindings: Map<string, Set<string>> | null = null

  info?: ModuleInfo
  meta?: Record<string, any>
  transformResult: TransformResult | null = null

  acceptedHmrDeps = new Set<EnvironmentModuleNode>()
  acceptedHmrExports: Set<string> | null = null
  isSelfAccepting?: boolean
  lastHMRTimestamp = 0
  lastInvalidationTimestamp = 0
}
```

`environment.moduleGraph` é uma instância de `EnvironmentModuleGraph` :

```ts
export class EnvironmentModuleGraph {
  environment: string

  urlToModuleMap = new Map<string, EnvironmentModuleNode>()
  idToModuleMap = new Map<string, EnvironmentModuleNode>()
  etagToModuleMap = new Map<string, EnvironmentModuleNode>()
  fileToModulesMap = new Map<string, Set<EnvironmentModuleNode>>()

  constructor(
    environment: string,
    resolveId: (url: string) => Promise<PartialResolvedId | null>,
  )

  async getModuleByUrl(
    rawUrl: string,
  ): Promise<EnvironmentModuleNode | undefined>

  getModuleById(id: string): EnvironmentModuleNode | undefined

  getModulesByFile(file: string): Set<EnvironmentModuleNode> | undefined

  onFileChange(file: string): void

  onFileDelete(file: string): void

  invalidateModule(
    mod: EnvironmentModuleNode,
    seen: Set<EnvironmentModuleNode> = new Set(),
    timestamp: number = Date.now(),
    isHmr: boolean = false,
  ): void

  invalidateAll(): void

  async ensureEntryFromUrl(
    rawUrl: string,
    setIsSelfAccepting = true,
  ): Promise<EnvironmentModuleNode>

  createFileOnlyEntry(file: string): EnvironmentModuleNode

  async resolveUrl(url: string): Promise<ResolvedUrl>

  updateModuleTransformResult(
    mod: EnvironmentModuleNode,
    result: TransformResult | null,
  ): void

  getModuleByEtag(etag: string): EnvironmentModuleNode | undefined
}
```
