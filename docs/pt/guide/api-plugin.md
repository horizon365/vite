# API do plug -in

Os plug-ins Vite estende a interface de plug-in bem projetada da Rollup com algumas opções específicas de vite extra. Como resultado, você pode escrever um plug -in de vite uma vez e fazê -lo funcionar para o Dev e o Build.

**Recomenda -se passar pela [documentação do plug -in da Rollup](https://rollupjs.org/plugin-development/) antes de ler as seções abaixo.**

## Autoria de um plugin

O Vite se esforça para oferecer padrões estabelecidos prontos para a caixa; portanto, antes de criar um novo plug -in, verifique o [guia de recursos](https://vite.dev/guide/features) para ver se sua necessidade está coberta. Revise também os plugins comunitários disponíveis, tanto na forma de um [plug -in de rollup compatível](https://github.com/rollup/awesome) quanto [plugins específicos de vite](https://github.com/vitejs/awesome-vite#plugins)

Ao criar um plug -in, você pode embalar no seu `vite.config.js` . Não há necessidade de criar um novo pacote para ele. Depois de ver que um plug -in foi útil em seus projetos, considere compartilhá -lo para ajudar outras pessoas [no ecossistema](https://chat.vite.dev) .

::: tip
Ao aprender, depurar ou criar plugins, sugerimos a inclusão de [inspeção de vite-plugin](https://github.com/antfu/vite-plugin-inspect) em seu projeto. Ele permite que você inspecione o estado intermediário dos plugins vite. Após a instalação, você pode visitar `localhost:5173/__inspect/` para inspecionar os módulos e a pilha de transformação do seu projeto. Confira as instruções de instalação nos [documentos de inspecionação de plugin vite](https://github.com/antfu/vite-plugin-inspect) .
![Vite-Plugin-Inspect](/images/vite-plugin-inspect.png)
:::

## Convenções

Se o plug -in não usar ganchos específicos do Vite e puder ser implementado como um [plug -in compatível](#rollup-plugin-compatibility) , recomenda -se usar as [convenções de nomeação do plug -in Rollup](https://rollupjs.org/plugin-development/#conventions) .

- Os plugins de rollup devem ter um nome claro com `rollup-plugin-` prefixo.
- Inclua `rollup-plugin` e `vite-plugin` palavras -chave no package.json.

Isso expõe o plug -in a ser usado em projetos de roll pura ou WMR

Para vite apenas plugins

- Os plug -ins de vite devem ter um nome claro com `vite-plugin-` prefixo.
- Inclua `vite-plugin` palavra -chave no package.json.
- Inclua uma seção no plug -in Docs detalhando por que é um plug -in apenas vite (por exemplo, ele usa ganchos de plug -in específicos do Vite).

Se o seu plug -in só funcionar para uma estrutura específica, seu nome deve ser incluído como parte do prefixo

- `vite-plugin-vue-` prefixo para plugins VUE
- `vite-plugin-react-` prefixo para plug -ins react
- `vite-plugin-svelte-` prefixo para plugins esbeltos

Veja também [Convenção de Módulos Virtuais](#virtual-modules-convention) .

## Config plugins

Os usuários adicionarão plugins ao projeto `devDependencies` e os configurarão usando a opção `plugins` Array.

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

Os plug -ins falsamente serão ignorados, que podem ser usados para ativar ou desativar facilmente os plugins.

`plugins` também aceita predefinições, incluindo vários plugins como um único elemento. Isso é útil para recursos complexos (como integração da estrutura) que são implementados usando vários plugins. A matriz será achatada internamente.

```js
// estrutura-plugina
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## Exemplos Simples

:::tip
É uma convenção comum para autorar um plug -in Vite/Rollup como uma função de fábrica que retorna o objeto de plug -in real. A função pode aceitar opções que permitem aos usuários personalizar o comportamento do plug -in.
:::

### Transformando Tipos De Arquivo Personalizados

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // Forneça mapa de origem, se disponível
        }
      }
    },
  }
}
```

### Importando Um Arquivo Virtual

Veja o exemplo na [próxima seção](#virtual-modules-convention) .

## Convenção De Módulos Virtuais

Os módulos virtuais são um esquema útil que permite passar informações de tempo de construção para os arquivos de origem usando a sintaxe de importação ESM normal.

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // Necessário, aparecerá em avisos e erros
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

Que permite importar o módulo em JavaScript:

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Os módulos virtuais em Vite (e Rollup) são prefixados com `virtual:` para o caminho voltado para o usuário por convenção. Se possível, o nome do plug -in deve ser usado como um espaço para nome para evitar colisões com outros plugins no ecossistema. Por exemplo, um `vite-plugin-posts` poderia pedir aos usuários que importem `virtual:posts` ou `virtual:posts/helpers` módulos virtuais para obter informações de tempo de construção. Internamente, os plug -ins que usam módulos virtuais devem prefixar o ID do módulo com `\0` enquanto resolve o ID, uma convenção do ecossistema Rollup. Isso impede que outros plugins tentem processar o ID (como a resolução do nó), e os principais recursos como o SourCemaps podem usar essas informações para diferenciar os módulos virtuais e os arquivos regulares. `\0` não é um char permitido nos URLs de importação, portanto, precisamos substituí -los durante a análise de importação. Um ID virtual `\0{id}` acaba codificado como `/@id/__x00__{id}` durante o Dev no navegador. O ID será decodificado de volta antes de inserir o pipeline do plug -ins, para que isso não seja visto pelo código do plugins ganchos.

Observe que os módulos derivados diretamente de um arquivo real, como no caso de um módulo de script em um único componente de arquivo (como um .vue ou .svelte sfc) não precisam seguir esta convenção. Os SFCs geralmente geram um conjunto de submódulos quando processados, mas o código neles pode ser mapeado de volta ao sistema de arquivos. O uso de `\0` para esses submódulos impediria que o SourCemaps funcionasse corretamente.

## Ganchos Universais

Durante o Dev, o servidor Vite Dev cria um recipiente de plug -in que chama [os ganchos de construção do Rollup](https://rollupjs.org/plugin-development/#build-hooks) da mesma maneira que o Rollup faz.

Os ganchos a seguir são chamados de uma vez no servidor Iniciar:

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

Os ganchos a seguir são chamados em cada solicitação de módulo de entrada:

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

Esses ganchos também possuem um parâmetro `options` estendido com propriedades adicionais específicas de vite. Você pode ler mais na [documentação do SSR](/pt/guide/ssr#ssr-specific-plugin-logic) .

Alguns `resolveId` chamadas ' `importer` valor podem ser um caminho absoluto para um `index.html` genérico na raiz, pois nem sempre é possível derivar o importador real devido ao padrão de servidor de dev alerta da Vite. Para as importações tratadas no pipeline de resolução da Vite, o importador pode ser rastreado durante a fase de análise de importação, fornecendo o valor correto `importer` .

Os ganchos a seguir são chamados quando o servidor está fechado:

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

Observe que o gancho [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) **não** é chamado durante o Dev, porque o VITE evita as passas AST completas para melhor desempenho.

[Os ganchos de geração de saída](https://rollupjs.org/plugin-development/#output-generation-hooks) (exceto `closeBundle` ) **não** são chamados durante o Dev. Você pode pensar no servidor de dev vite como ligando apenas `rollup.rollup()` sem ligar `bundle.generate()` .

## Ganchos Específicos De Vite

Os plug-ins de vite também podem fornecer ganchos que atendem a propósitos específicos de vite. Esses ganchos são ignorados por Rollup.

### `config`

- **Tipo:** `(config: userConfig, Env: {mode: string, comando: string}) => userConfig | nulo | void`
- **Tipo:** `async` , `sequential`

  Modifique a configuração do Vite antes de ser resolvida. O gancho recebe a configuração do usuário bruto (as opções da CLI mescladas com o arquivo de configuração) e a configuração atual Env, que expõe os `mode` e `command` sendo usados. Ele pode retornar um objeto de configuração parcial que será profundamente mesclado na configuração existente ou muda diretamente a configuração (se a fusão padrão não puder alcançar o resultado desejado).

  **Exemplo:**

  ```js
  // Retorne a configuração parcial (recomendada)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // Motte a configuração diretamente (use apenas quando a fusão não funciona)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning Note
  Os plug -ins de usuário são resolvidos antes de executar esse gancho, de modo que a injeção de outros plugins dentro do gancho `config` não terá efeito.
  :::

### `configResolved`

- **Tipo:** `(config: resolvedconfig) => void | Promessa<Void> `
- **Tipo:** `async` , `parallel`

  Chamado depois que a configuração vite for resolvida. Use este gancho para ler e armazenar a configuração final resolvida. Também é útil quando o plug -in precisa fazer algo diferente com base no comando que está sendo executado.

  **Exemplo:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // Armazene a configuração resolvida
        config = resolvedConfig
      },

      // Use configuração armazenada em outros ganchos
      transform(code, id) {
        if (config.command === 'serve') {
          // Dev: Plugin Invocado por Dev Server
        } else {
          // Construção: Plugin invocado por Rollup
        }
      },
    }
  }
  ```

  Observe que o valor `command` é `serve` no dev (na CLI `vite` , `vite dev` e `vite serve` são aliases).

### `configureServer`

- **Tipo:** `(servidor: vitedEvServer) => (() => void) | vazio | Promessa <(() => void) | void> `
- **Tipo:** `async` , `sequential`
- **Veja também:** [VitedEvServer](./api-javascript#vitedevserver)

  Gancho para configurar o servidor dev. O caso de uso mais comum é adicionar usuários médios personalizados ao aplicativo Internal [Connect](https://github.com/senchalabs/connect) :

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Solicitação de manipulação personalizada ...
      })
    },
  })
  ```

  **Injetar pós -middleware**

  O gancho `configureServer` é chamado antes da instalação dos usuários médios internos, de modo que os Middlewares personalizados serão executados antes da middlewares internos por padrão. Se você deseja injetar um middleware **após** os meios internos, você pode retornar uma função de `configureServer` , que será chamada após a instalação de usuários internos:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // devolver um gancho de posta
      // instalado
      return () => {
        server.middlewares.use((req, res, next) => {
          // Solicitação de manipulação personalizada ...
        })
      }
    },
  })
  ```

  **Armazenamento de acesso ao servidor**

  Em alguns casos, outros ganchos de plug -in podem precisar de acesso à instância do servidor de dev (por exemplo, acessar o servidor de soquete da web, o observador do sistema de arquivos ou o gráfico do módulo). Este gancho também pode ser usado para armazenar a instância do servidor para acesso em outros ganchos:

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // Use servidor ...
        }
      },
    }
  }
  ```

  A Nota `configureServer` não é chamada ao executar a construção da produção, de modo que seus outros ganchos precisam se proteger contra sua ausência.

### `configurePreviewServer`

- **TIPO:** `(servidor: visualizerver) => (() => void) | vazio | Promessa <(() => void) | void> `
- **Tipo:** `async` , `sequential`
- **Veja também:** [PreviewServer](./api-javascript#previewserver)

  O mesmo que [`configureServer`](/pt/guide/api-plugin.html#configureserver) , mas para o servidor de visualização. Da mesma forma que `configureServer` , o gancho `configurePreviewServer` é chamado antes que outros middlewares sejam instalados. Se você deseja injetar um middleware **após** outros calçados médios, poderá retornar uma função de `configurePreviewServer` , que será chamada após a instalação de usuários internos:

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // devolver um gancho de posta
      // instalado
      return () => {
        server.middlewares.use((req, res, next) => {
          // Solicitação de manipulação personalizada ...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **Tipo:** `indexhtmltransformhook | {ordem?: 'pré' | 'Post', manipulador: indexhtmltransformhook} `
- **Tipo:** `async` , `sequential`

  Gancho dedicado para transformar arquivos de ponto de entrada HTML, como `index.html` . O gancho recebe a string html atual e um contexto de transformação. O contexto expõe a instância [`ViteDevServer`](./api-javascript#vitedevserver) durante o Dev e expõe o pacote de saída de rollup durante a construção.

  O gancho pode ser assíncrono e pode devolver um dos seguintes:

  - String HTML transformada
  - Uma matriz de objetos do descritor de tags ( `{ tag, attrs, children }` ) para injetar no HTML existente. Cada tag também pode especificar onde deve ser injetado (o padrão está prevendo para `<head>` )
  - Um objeto contendo ambos como `{ html, tags }`

  Por padrão, `order` é `undefined` , com este gancho aplicado após a transformação do HTML. Para injetar um script que deve passar pelo pipeline do Vite Plugins, `order: 'pre'` aplicará o gancho antes de processar o HTML. `order: 'post'` Aplica o gancho depois que todos os ganchos com `order` são aplicados indefinidos.

  **Exemplo básico:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`,
        )
      },
    }
  }
  ```

  **Assinatura completa do gancho:**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * Padrão: 'PREPENDENTE DE CABEÇA'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

  ::: warning Note
  Esse gancho não será chamado se você estiver usando uma estrutura com manuseio personalizado de arquivos de entrada (por exemplo, [Sveltekit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145) ).
  :::

### `handleHotUpdate`

- **Tipo:** `(ctx: hmrContext) => Array<ModuleNode> | vazio | Promessa <Matriz<ModuleNode> | void> `
- **Veja também:** [API HMR](./api-hmr)

  Execute o manuseio de atualização HMR personalizado. O gancho recebe um objeto de contexto com a seguinte assinatura:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` é uma matriz de módulos afetados pelo arquivo alterado. É uma matriz porque um único arquivo pode mapear para vários módulos servidos (por exemplo, SFCS).

  - `read` é uma função de leitura assíncrona que retorna o conteúdo do arquivo. Isso é fornecido porque, em alguns sistemas, o retorno de chamada de alteração do arquivo pode disparar muito rápido antes que o editor termine de atualizar o arquivo e o Direct `fs.readFile` retornará o conteúdo vazio. A função de leitura passou em normaliza esse comportamento.

  O gancho pode escolher:

  - Filtre e restrinja a lista de módulos afetados para que o HMR seja mais preciso.

  - Retorne uma matriz vazia e execute uma recarga completa:

    ```js
    handleHotUpdate({ server, modules, timestamp }) {
      // Invalidar módulos manualmente
      const invalidatedModules = new Set()
      for (const mod of modules) {
        server.moduleGraph.invalidateModule(
          mod,
          invalidatedModules,
          timestamp,
          true
        )
      }
      server.ws.send({ type: 'full-reload' })
      return []
    }
    ```

  - Retorne uma matriz vazia e execute o manuseio completo de HMR personalizado enviando eventos personalizados para o cliente:

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    O código do cliente deve registrar o manipulador correspondente usando a [API HMR](./api-hmr) (isso pode ser injetado pelo mesmo gancho `transform` do plugin):

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // Execute atualização personalizada
      })
    }
    ```

## Pedidos De Plug -In

Um plug -in Vite pode especificar adicionalmente uma propriedade `enforce` (semelhante aos carregadores de webpack) para ajustar seu pedido de aplicativo. O valor de `enforce` pode ser `"pre"` ou `"post"` . Os plugins resolvidos estarão na seguinte ordem:

- Alias
- Plugins de usuário com `enforce: 'pre'`
- Vite Plugins Core
- Plugins de usuário sem valor de aplicação
- Vite plugins de construção
- Plugins de usuário com `enforce: 'post'`
- Vite Post Build Plugins (Minify, Manifest, Relatórios)

Observe que isso é separado dos ganchos, eles ainda estão sujeitos separadamente ao seu atributo `order` [como de costume, para ganchos de rollup](https://rollupjs.org/plugin-development/#build-hooks) .

## Aplicação Condicional

Por padrão, os plug -ins são chamados para servir e construir. Nos casos em que um plug -in precisa ser aplicado condicionalmente apenas durante o serviço ou a construção, use a propriedade `apply` para invocá -los apenas durante `'build'` ou `'serve'` :

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // ou 'servir'
  }
}
```

Uma função também pode ser usada para um controle mais preciso:

```js
apply(config, { command }) {
  // Aplique apenas em construção, mas não para SSR
  return command === 'build' && !config.build.ssr
}
```

## Compatibilidade Do Plug -in Rollup

Um número razoável de plug -ins de rollup funcionará diretamente como um plug -in de vite (por exemplo, `@rollup/plugin-alias` ou `@rollup/plugin-json` ), mas não todos, pois alguns ganchos de plug -in não fazem sentido em um contexto de servidor de dev não bem -sucedido.

Em geral, desde que um plug -in rollup se encaixe nos seguintes critérios, ele deve funcionar como um plug -in de vite:

- Não usa o gancho [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) .
- Ele não possui um forte acoplamento entre ganchos de fase de pacote e ganchos de fase de saída.

Se um plug -in de rollup faz sentido apenas para a fase de construção, ele poderá ser especificado em `build.rollupOptions.plugins` . Funcionará o mesmo que um plug -in de vite com `enforce: 'post'` e `apply: 'build'` .

Você também pode aumentar um plug-in de Rollup existente com propriedades exclusivas de vite:

```js [vite.config.js]
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

## Normalização Do Caminho

O Vite normaliza os caminhos ao resolver IDs para usar os separadores POSIX ( /), preservando o volume no Windows. Por outro lado, o Rollup mantém os caminhos resolvidos intocados por padrão, de modo que os IDs resolvidos têm separadores Win32 (\) no Windows. No entanto, os plugins de rollup usam uma [função de utilidade `normalizePath`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) de `@rollup/pluginutils` internamente, que converte separadores em Posix antes de executar comparações. Isso significa que, quando esses plugins são usados no Vite, o padrão de configuração `include` e `exclude` e outros caminhos semelhantes contra comparações de IDs resolvidas funcionam corretamente.

Portanto, para os plug -ins de vite, ao comparar caminhos com IDs resolvidos, é importante primeiro normalizar os caminhos para usar os separadores POSIX. Uma função de utilidade equivalente `normalizePath` é exportada do módulo `vite` .

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```

## Filtragem, inclua/exclua o padrão

O Vite expõe a função [`@rollup/pluginutils` de `createFilter`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter) para incentivar plugins e integrações específicos do Vite a usar o padrão de filtragem Incluir/excluir/excluir, que também é usado no próprio núcleo do Vite.

## Comunicação Cliente-Servidor

Desde o Vite 2.9, fornecemos alguns utilitários para os plugins ajudarem a lidar com a comunicação com os clientes.

### Servidor para cliente

No lado do plug -in, poderíamos usar `server.ws.send` para transmitir eventos para o cliente:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: tip NOTE
Recomendamos **sempre prefixar** seus nomes de eventos para evitar colisões com outros plugins.
:::

No lado do cliente, use [`hot.on`](/pt/guide/api-hmr.html#hot-on-event-cb) para ouvir os eventos:

```ts twoslash
import 'vite/client'
// ---corte---
// lado do cliente
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // olá
  })
}
```

### Cliente para servidor

Para enviar eventos do cliente para o servidor, podemos usar [`hot.send`](/pt/guide/api-hmr.html#hot-send-event-payload) :

```ts
// lado do cliente
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

Em seguida, use `server.ws.on` e ouça os eventos no lado do servidor:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // Ei!
          // Responder apenas ao cliente (se necessário)
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### TypeScript Para Eventos Personalizados

Internamente, Vite infere o tipo de carga útil da interface `CustomEventMap` , é possível digitar eventos personalizados, estendendo a interface:

:::tip Note
Certifique -se de incluir a extensão `.d.ts` ao especificar arquivos de declaração do TypeScript. Caso contrário, o TypeScript pode não saber qual arquivo o módulo está tentando estender.
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // 'Chave de evento': carga útil
  }
}
```

Essa extensão de interface é utilizada por `InferCustomEventPayload<T>` para inferir o tipo de carga útil para o evento `T` . Para obter mais informações sobre como essa interface é utilizada, consulte a [documentação da API HMR](./api-hmr#hmr-api) .

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
// ---corte---
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // O tipo de carga útil será {msg: string}
})
import.meta.hot?.on('unknown:event', (payload) => {
  // O tipo de carga útil será qualquer
})
```
