# API do ambiente para o tempo de execução

:::warning Experimental
A API do ambiente é experimental. Manteremos as APIs estáveis durante o Vite 6 para permitir que o ecossistema experimente e construa sobre ele. Planejamos estabilizar essas novas APIs com possíveis mudanças de quebra no Vite 7.

Recursos:

- [Discussão sobre feedback](https://github.com/vitejs/vite/discussions/16358) onde estamos recebendo feedback sobre as novas APIs.
- [API PR do ambiente](https://github.com/vitejs/vite/pull/16471) , onde a nova API foi implementada e revisada.

Compartilhe seu feedback conosco.
:::

## Fábricas Do Meio Ambiente

Ambientes As fábricas devem ser implementadas por provedores de ambiente como Cloudflare, e não por usuários finais. As fábricas do meio ambiente retornam um `EnvironmentOptions` para o caso mais comum de usar o tempo de execução de destino para ambientes de desenvolvimento e construção. As opções de ambiente padrão também podem ser definidas para que o usuário não precise fazê -lo.

```ts
function createWorkerdEnvironment(
  userConfig: EnvironmentOptions,
): EnvironmentOptions {
  return mergeConfig(
    {
      resolve: {
        conditions: [
          /*...*/
        ],
      },
      dev: {
        createEnvironment(name, config) {
          return createWorkerdDevEnvironment(name, config, {
            hot: true,
            transport: customHotChannel(),
          })
        },
      },
      build: {
        createEnvironment(name, config) {
          return createWorkerdBuildEnvironment(name, config)
        },
      },
    },
    userConfig,
  )
}
```

Então o arquivo de configuração pode ser escrito como:

```js
import { createWorkerdEnvironment } from 'vite-environment-workerd'

export default {
  environments: {
    ssr: createWorkerdEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
    rsc: createWorkerdEnvironment({
      build: {
        outDir: '/dist/rsc',
      },
    }),
  },
}
```

e estruturas podem usar um ambiente com o tempo de execução do Workerd para fazer SSR usando:

```js
const ssrEnvironment = server.environments.ssr
```

## Criando Uma Nova Fábrica De Ambiente

Um servidor de dev vite expõe dois ambientes por padrão: um ambiente `client` e um ambiente `ssr` . O ambiente do cliente é um ambiente de navegador por padrão, e o Module Runner é implementado pela importação do módulo virtual `/@vite/client` para os aplicativos do cliente. O ambiente SSR é executado no mesmo tempo de execução do nó que o servidor Vite por padrão e permite que os servidores de aplicativos sejam usados para renderizar solicitações durante o Dev com suporte completo de HMR.

O código -fonte transformado é chamado de módulo e as relações entre os módulos processadas em cada ambiente são mantidas em um gráfico do módulo. O código transformado para esses módulos é enviado aos tempos de execução associados a cada ambiente a ser executado. Quando um módulo é avaliado no tempo de execução, seus módulos importados serão solicitados, acionando o processamento de uma seção do gráfico do módulo.

Um corredor do módulo Vite permite a execução de qualquer código processando -o com os plug -ins Vite primeiro. É diferente de `server.ssrLoadModule` porque a implementação do corredor é dissociada do servidor. Isso permite que os autores da biblioteca e da estrutura implementem sua camada de comunicação entre o servidor Vite e o corredor. O navegador se comunica com seu ambiente correspondente usando o soquete da Web do servidor e através de solicitações HTTP. O Runner do Módulo do Nó pode fazer chamadas de função diretamente para processar os módulos, pois está em execução no mesmo processo. Outros ambientes podem executar módulos que se conectam a um tempo de execução do JS, como o Workerd, ou um tópico de trabalhador como o Vitest.

Um dos objetivos desse recurso é fornecer uma API personalizável para processar e executar o código. Os usuários podem criar novas fábricas de ambiente usando as primitivas expostas.

```ts
import { DevEnvironment, HotChannel } from 'vite'

function createWorkerdDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context: DevEnvironmentContext
) {
  const connection = /* ... */
  const transport: HotChannel = {
    on: (listener) => { connection.on('message', listener) },
    send: (data) => connection.send(data),
  }

  const workerdDevEnvironment = new DevEnvironment(name, config, {
    options: {
      resolve: { conditions: ['custom'] },
      ...context.options,
    },
    hot: true,
    transport,
  })
  return workerdDevEnvironment
}
```

## `ModuleRunner`

Um corredor do módulo é instanciado no tempo de execução do destino. Todas as APIs na próxima seção são importadas de `vite/module-runner` a menos que indicado de outra forma. Esse ponto de entrada de exportação é mantido o mais leve possível, exportando apenas o mínimo necessário para criar corredores de módulos.

**Tipo de assinatura:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator = new ESModulesEvaluator(),
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * URL para executar.
   * Aceita o caminho do arquivo, o caminho do servidor ou o ID em relação à raiz.
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * Limpe todos os caches, incluindo ouvintes HMR.
   */
  public clearCache(): void
  /**
   * Limpe todos os caches, remova todos os ouvintes da HMR, redefina o suporte a SourCemap.
   * Este método não interrompe a conexão HMR.
   */
  public async close(): Promise<void>
  /**
   * Retorna `true` se o corredor tiver sido fechado pelo telefone `close()` .
   */
  public isClosed(): boolean
}
```

O avaliador do módulo em `ModuleRunner` é responsável pela execução do código. Exportações VITE `ESModulesEvaluator` Exceto, ele usa `new AsyncFunction` para avaliar o código. Você pode fornecer sua própria implementação se o seu tempo de execução do JavaScript não suportar uma avaliação insegura.

O Runner do Módulo expõe `import` método. Quando o servidor Vite aciona `full-reload` evento HMR, todos os módulos afetados serão reexecutados. Esteja ciente de que o Module Runner não atualiza o objeto `exports` quando isso acontecer (ele o substitui), você precisaria executar `import` ou obter o módulo de `evaluatedModules` novamente se você confiar em ter o objeto `exports` mais recentes.

**Exemplo de uso:**

```js
import { ModuleRunner, ESModulesEvaluator } from 'vite/module-runner'
import { transport } from './rpc-implementation.js'

const moduleRunner = new ModuleRunner(
  {
    transport,
  },
  new ESModulesEvaluator(),
)

await moduleRunner.import('/src/entry-point.js')
```

## `ModuleRunnerOptions`

```ts twoslash
import type {
  InterceptorOptions as InterceptorOptionsRaw,
  ModuleRunnerHmr as ModuleRunnerHmrRaw,
  EvaluatedModules,
} from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type InterceptorOptions = Debug<InterceptorOptionsRaw>
type ModuleRunnerHmr = Debug<ModuleRunnerHmrRaw>
/** Veja abaixo */
type ModuleRunnerTransport = unknown

// ---corte---
interface ModuleRunnerOptions {
  /**
   * Um conjunto de métodos para se comunicar com o servidor.
   */
  transport: ModuleRunnerTransport
  /**
   * Configure como os mapas de origem são resolvidos.
   * Prefere `node` se `process.setSourceMapsEnabled` estiver disponível.
   * Caso contrário, ele usará `prepareStackTrace` por padrão que substitui
   * `Error.prepareStackTrace` método.
   * Você pode fornecer um objeto para configurar como o conteúdo do arquivo e
   * Os mapas de origem são resolvidos para arquivos que não foram processados pelo Vite.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * Desative o HMR ou configure as opções de HMR.
   *
   * @default true
   */
  hmr?: boolean | ModuleRunnerHmr
  /**
   * Cache do módulo personalizado. Se não for fornecido, ele cria um módulo separado
   * cache para cada instância do corredor do módulo.
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**Tipo de assinatura:**

```ts twoslash
import type { ModuleRunnerContext as ModuleRunnerContextRaw } from 'vite/module-runner'
import type { Debug } from '@type-challenges/utils'

type ModuleRunnerContext = Debug<ModuleRunnerContextRaw>

// ---corte---
export interface ModuleEvaluator {
  /**
   * Número de linhas prefixadas no código transformado.
   */
  startOffset?: number
  /**
   * Avalie o código que foi transformado por Vite.
   * @param contexto de contexto contexto
   * Código de código @param Código transformado
   * @param ID ID que foi usado para buscar o módulo
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * Avalie o módulo externalizado.
   * URL do arquivo de arquivo @param para o módulo externo
   */
  runExternalModule(file: string): Promise<any>
}
```

Exportações de vite `ESModulesEvaluator` que implementa essa interface por padrão. Ele usa `new AsyncFunction` para avaliar o código; portanto, se o código tiver um mapa de origem inliminado, ele deve conter um [deslocamento de 2 linhas](https://tc39.es/ecma262/#sec-createdynamicfunction) para acomodar novas linhas adicionadas. Isso é feito automaticamente pelo `ESModulesEvaluator` . Avaliadores personalizados não adicionarão linhas adicionais.

## `ModuleRunnerTransport`

**Tipo de assinatura:**

```ts twoslash
import type { ModuleRunnerTransportHandlers } from 'vite/module-runner'
/** um objeto */
type HotPayload = unknown
// ---corte---
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(data: HotPayload): Promise<{ result: any } | { error: any }>
  timeout?: number
}
```

Objeto de transporte que se comunica com o ambiente por meio de um RPC ou chamando diretamente a função. Quando o método `invoke` não é implementado, o método `send` e o método `connect` precisam ser implementados. Vite construirá os `invoke` internamente.

Você precisa unir com a instância `HotChannel` no servidor, como neste exemplo, onde o Module Runner é criado no thread do trabalhador:

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @Type {import ('Vite/Module-Runner'). ModuleRunnerTransport} */
const transport = {
  connect({ onMessage, onDisconnection }) {
    parentPort.on('message', onMessage)
    parentPort.on('close', onDisconnection)
  },
  send(data) {
    parentPort.postMessage(data)
  },
}

const runner = new ModuleRunner(
  {
    transport,
  },
  new ESModulesEvaluator(),
)
```

```js [server.js]
import { BroadcastChannel } from 'node:worker_threads'
import { createServer, RemoteEnvironmentTransport, DevEnvironment } from 'vite'

function createWorkerEnvironment(name, config, context) {
  const worker = new Worker('./worker.js')
  const handlerToWorkerListener = new WeakMap()

  const workerHotChannel = {
    send: (data) => worker.postMessage(data),
    on: (event, handler) => {
      if (event === 'connection') return

      const listener = (value) => {
        if (value.type === 'custom' && value.event === event) {
          const client = {
            send(payload) {
              worker.postMessage(payload)
            },
          }
          handler(value.data, client)
        }
      }
      handlerToWorkerListener.set(handler, listener)
      worker.on('message', listener)
    },
    off: (event, handler) => {
      if (event === 'connection') return
      const listener = handlerToWorkerListener.get(handler)
      if (listener) {
        worker.off('message', listener)
        handlerToWorkerListener.delete(handler)
      }
    },
  }

  return new DevEnvironment(name, config, {
    transport: workerHotChannel,
  })
}

await createServer({
  environments: {
    worker: {
      dev: {
        createEnvironment: createWorkerEnvironment,
      },
    },
  },
})
```

:::

Um exemplo diferente usando uma solicitação HTTP para se comunicar entre o corredor e o servidor:

```ts
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

export const runner = new ModuleRunner(
  {
    transport: {
      async invoke(data) {
        const response = await fetch(`http://my-vite-server/invoke`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return response.json()
      },
    },
    hmr: false, // Desativar a HMR como HMR requer transporte.Connect
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

Nesse caso, o método `handleInvoke` no `NormalizedHotChannel` pode ser usado:

```ts
const customEnvironment = new DevEnvironment(name, config, context)

server.onRequest((request: Request) => {
  const url = new URL(request.url)
  if (url.pathname === '/invoke') {
    const payload = (await request.json()) as HotPayload
    const result = customEnvironment.hot.handleInvoke(payload)
    return new Response(JSON.stringify(result))
  }
  return Response.error()
})
```

Mas observe que, para o suporte à HMR, são necessários métodos `send` e `connect` . O método `send` é geralmente chamado quando o evento personalizado é acionado (como `import.meta.hot.send("my-event")` ).

Exportações Vite `createServerHotChannel` do ponto de entrada principal para suportar o HMR durante o SSR Vite.
