# API do ambiente para estruturas

:::warning Experimental
A API do ambiente é experimental. Manteremos as APIs estáveis durante o Vite 6 para permitir que o ecossistema experimente e construa sobre ele. Planejamos estabilizar essas novas APIs com possíveis mudanças de quebra no Vite 7.

Recursos:

- [Discussão sobre feedback](https://github.com/vitejs/vite/discussions/16358) onde estamos recebendo feedback sobre as novas APIs.
- [API PR do ambiente](https://github.com/vitejs/vite/pull/16471) , onde a nova API foi implementada e revisada.

Compartilhe seu feedback conosco.
:::

## Ambientes e estruturas

O ambiente implícito `ssr` e outros ambientes não-clientes usam `RunnableDevEnvironment` por padrão durante o Dev. Embora isso exija que o tempo de execução seja o mesmo com o que o servidor Vite está sendo executado, isso funciona da mesma forma com `ssrLoadModule` e permite que as estruturas migram e possam ativar o HMR para sua história de desenvolvimento SSR. Você pode proteger qualquer ambiente executável com uma função `isRunnableDevEnvironment` .

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * URL para executar.
   * Aceita o caminho do arquivo, o caminho do servidor ou o ID em relação à raiz.
   * Retorna um módulo instanciado (o mesmo que no ssrloadmodule)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * Outros métodos do Modulerunner ...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
O `runner` é avaliado ansiosamente quando é acessado pela primeira vez. Cuidado que o Vite permite o suporte ao mapa de origem quando o `runner` é criado ligando `process.setSourceMapsEnabled` ou substituindo `Error.prepareStackTrace` se não estiver disponível.
:::

## Padrão `RunnableDevEnvironment`

Dado um servidor Vite configurado no modo de middleware, conforme descrito pelo [Guia de Configuração SSR](/pt/guide/ssr#setting-up-the-dev-server) , vamos implementar o middleware SSR usando a API do ambiente. O manuseio de erros é omitido.

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // Por padrão, os módulos são executados no mesmo processo que o servidor vite
    },
  },
})

// Você pode precisar lançar isso para executar o ambiente em datilografia ou
// Use isrunnabledevenvambonment para proteger o acesso ao corredor
const environment = server.environments.node

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. Leia o index.html
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Aplique as transformações Vite HTML. Isso injeta o cliente Vite HMR,
  //    e também aplica as transformações HTML de plugins de vite, por exemplo, global
  //    Preâmbulos de @vitejs/plugin-react
  template = await server.transformIndexHtml(url, template)

  // 3. Carregue a entrada do servidor. Importar (URL) transforma automaticamente
  //    Código -fonte ESM a ser utilizável no Node.js! Não há agrupamento
  //    necessário e fornece suporte completo de HMR.
  const { render } = await environment.runner.import('/src/entry-server.js')

  // 4. Renderize o aplicativo html. Isso pressupõe que a entrada exportada
  //     `render` Função chama a estrutura apropriada SSR APIs,
  //    por exemplo ReactdomServer.RenderToString ()
  const appHtml = await render(url)

  // 5. Injete o HTML renderizado no aplicativo no modelo.
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. Envie o HTML renderizado de volta.
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

## Runtime Agnóstico SSR

Como o `RunnableDevEnvironment` só pode ser usado para executar o código no mesmo tempo de execução do servidor Vite, é necessário um tempo de execução que possa executar o servidor Vite (um tempo de execução compatível com o Node.js). Isso significa que você precisará usar o Raw `DevEnvironment` para torná -lo agnóstico de tempo de execução.

:::info `FetchableDevEnvironment` proposal

A proposta inicial tinha um método `run` na classe `DevEnvironment` que permitiria que os consumidores invocassem uma importação no lado do corredor usando a opção `transport` . Durante nossos testes, descobrimos que a API não era universal o suficiente para começar a recomendá -lo. No momento, estamos procurando feedback sobre [a proposta `FetchableDevEnvironment`](https://github.com/vitejs/vite/discussions/18191) .

:::

`RunnableDevEnvironment` tem uma função `runner.import` que retorna o valor do módulo. Mas essa função não está disponível no Raw `DevEnvironment` e requer o código usando as APIs do Vite e os módulos do usuário a serem dissociados.

Por exemplo, o exemplo a seguir usa o valor do módulo de usuário do código usando as APIs do Vite:

```ts
// código usando as APIs do Vite
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entry.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// ---------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Se o seu código puder ser executado no mesmo tempo de execução que os módulos do usuário (ou seja, ele não depende de APIs específicas do Node.js), você pode usar um módulo virtual. Essa abordagem elimina a necessidade de acessar o valor do código usando as APIs do Vite.

```ts
// código usando as APIs do Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // um plugin que lida `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* Implementação de plug -in */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// Use funções expostas por cada meio ambiente fábricas que executam o código
// verifique se cada meio ambiente fábricas o que elas fornecem
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// ---------------------------------------
// Virtual: EntryPoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// ---------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Por exemplo, para ligar `transformIndexHtml` no módulo do usuário, o seguinte plug -in pode ser usado:

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

Se o seu código exigir APIs Node.js, você poderá usar `hot.send` para se comunicar com o código que usa as APIs do Vite dos módulos do usuário. No entanto, esteja ciente de que essa abordagem pode não funcionar da mesma maneira após o processo de construção.

```ts
// código usando as APIs do Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // um plugin que lida `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* Implementação de plug -in */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// Use funções expostas por cada meio ambiente fábricas que executam o código
// verifique se cada meio ambiente fábricas o que elas fornecem
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// ---------------------------------------
// Virtual: EntryPoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('/'))

// ---------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## Ambientes Durante a Construção

Na CLI, as chamadas `vite build` e `vite build --ssr` ainda criarão apenas o cliente e os ambientes SSR somente para compatibilidade com versões anteriores.

Quando `builder` não for `undefined` (ou ao ligar `vite build --app` ), `vite build` optará na construção de todo o aplicativo. Mais tarde, isso se tornaria o padrão em um futuro major. Uma instância `ViteBuilder` será criada (equivalente a tempo de construção a `ViteDevServer` ) para construir todos os ambientes configurados para produção. Por padrão, a construção de ambientes é executada em série, respeitando a ordem do registro `environments` . Uma estrutura ou usuário pode configurar ainda mais como os ambientes são construídos usando:

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

## Código Agnóstico Do Ambiente

Na maioria das vezes, a instância `environment` atual estará disponível como parte do contexto do código que está sendo executado, de modo que a necessidade de acessá -los a `server.environments` deve ser rara. Por exemplo, o plug -in interno conecta o ambiente exposto como parte do `PluginContext` , para que possa ser acessado usando `this.environment` . Consulte [a API do ambiente para plugins](./api-environment-plugins.md) aprender sobre como criar plug -ins de consciência do ambiente.
