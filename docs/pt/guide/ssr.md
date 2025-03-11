# Renderização do lado do servidor (SSR)

:::tip Note
O SSR refere-se especificamente a estruturas de front-end (por exemplo, React, PreAct, Vue e Sieve) que suportam a execução do mesmo aplicativo em Node.js, pré-renderizando-o ao HTML e, finalmente, hidratá-lo no cliente. Se você estiver procurando integração com estruturas tradicionais do lado do servidor, consulte o [guia de integração de back-end](./backend-integration) .

O guia a seguir também assume experiência anterior trabalhando com o SSR na sua estrutura de escolha e se concentrará apenas em detalhes de integração específicos do vite.
:::

:::warning Low-level API
Esta é uma API de baixo nível destinada a autores de biblioteca e estrutura. Se o seu objetivo é criar um aplicativo, verifique os plug-ins e ferramentas SSR de nível superior na [seção Awesome Vite SSR](https://github.com/vitejs/awesome-vite#ssr) primeiro. Dito isto, muitas aplicações são construídas com sucesso diretamente no topo da API nativa de baixo nível da Vite.

Atualmente, o VITE está trabalhando em uma API SSR aprimorada com a [API Environment](https://github.com/vitejs/vite/discussions/16358) . Confira o link para obter mais detalhes.
:::

## Exemplo De Projetos

O Vite fornece suporte interno para a renderização do servidor (SSR). [`create-vite-extra`](https://github.com/bluwy/create-vite-extra) Contém Exemplo SSR Setups que você pode usar como referências para este guia:

- [Baunilha](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [Vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [Reagir](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [Preact](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [SVELTE](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [Sólido](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

Você também pode andaime esses projetos localmente [executando `create-vite`](./index.md#scaffolding-your-first-vite-project) e escolher `Others > create-vite-extra` na opção Framework.

## Estrutura De Origem

Um aplicativo SSR típico terá a seguinte estrutura de arquivos de origem:

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

O `index.html` precisará fazer referência `entry-client.js` e incluir um espaço reservado onde a marcação renderizada pelo servidor deve ser injetada:

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Você pode usar qualquer espaço reservado que preferir em vez de `<!--ssr-outlet-->` , desde que possa ser substituído com precisão.

## Lógica Condicional

Se você precisar executar a lógica condicional com base no SSR vs.

```js twoslash
import 'vite/client'
// ---corte---
if (import.meta.env.SSR) {
  // ... servidor apenas lógica
}
```

Isso é substituído estaticamente durante a construção, para que permitirá o troca de galhos não utilizados.

## Configurando O Servidor Dev

Ao criar um aplicativo SSR, você provavelmente deseja ter controle total sobre o servidor principal e desacoplar o Vite do ambiente de produção. Portanto, é recomendável usar o Vite no modo de middleware. Aqui está um exemplo com [expresso](https://expressjs.com/) (v4):

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

Aqui `vite` é uma instância do [VitedEvServer](./api-javascript#vitedevserver) . `vite.middlewares` é uma instância [de conexão](https://github.com/senchalabs/connect) que pode ser usada como um middleware em qualquer estrutura Node.js compatível com Connect.

A próxima etapa é implementar o Manipulador `*` para servir HTML renderizado pelo servidor:

```js twoslash [server.js]
// @noErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @Type {import ('Express'). Express} */
var app
/** @Type {import ('vite'). VitedEvserver}  */
var vite

// ---corte---
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Leia o index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. Aplique as transformações Vite HTML. Isso injeta o cliente Vite HMR,
    //    e também aplica as transformações HTML de plugins de vite, por exemplo, global
    //    Preâmbulos de @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3. Carregue a entrada do servidor. O SSRloadModule se transforma automaticamente
    //    Código -fonte ESM a ser utilizável no Node.js! Não há agrupamento
    //    necessário e fornece invalidação eficiente semelhante ao HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. Renderize o aplicativo html. Isso pressupõe que a entrada exportada
    //     `render` Função chama a estrutura apropriada SSR APIs,
    //    por exemplo ReactdomServer.RenderToString ()
    const appHtml = await render(url)

    // 5. Injete o HTML renderizado no aplicativo no modelo.
    const html = template.replace(`<!--ssr-outlet-->`, () => appHtml)

    // 6. Envie o HTML renderizado de volta.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // Se um erro for capturado, deixe o Vite consertar o rastreamento da pilha para que ele mapeie de volta
    // para o seu código -fonte real.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

O script `dev` em `package.json` também deve ser alterado para usar o script do servidor:

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Construção para produção

Para enviar um projeto SSR para produção, precisamos:

1. Produzir uma construção de cliente normalmente;
2. Produza uma construção SSR, que pode ser carregada diretamente via `import()` para que não precisemos passar pelo Vite's `ssrLoadModule` ;

Nossos scripts em `package.json` ficarão assim:

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

Observe o sinalizador `--ssr` que indica que esta é uma compilação SSR. Ele também deve especificar a entrada SSR.

Então, em `server.js` precisamos adicionar alguma lógica específica de produção, verificando `process.env.NODE_ENV` :

- Em vez de ler a raiz `index.html` , use o `dist/client/index.html` como modelo, pois ele contém os links de ativos corretos para a criação do cliente.

- Em vez de `await vite.ssrLoadModule('/src/entry-server.js')` , use `import('./dist/server/entry-server.js')` (este arquivo é o resultado da compilação SSR).

- Mova a criação e todo o uso do servidor `vite` dev atrás das ramificações condicionais somente dev e adicione o arquivo estático que serve Middlewares para servir os arquivos de `dist/client` .

Consulte os [projetos de exemplo](#example-projects) para uma configuração de trabalho.

## Gerando Diretrizes De Pré -Carga

`vite build` suporta o sinalizador `--ssrManifest` que gerará `.vite/ssr-manifest.json` no diretório de saída de construção:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

O script acima agora gerará `dist/client/.vite/ssr-manifest.json` para a construção do cliente (sim, o manifesto SSR é gerado a partir da criação do cliente porque queremos mapear os IDs do módulo para os arquivos do cliente). O manifesto contém mapeamentos de IDs do módulo para seus pedaços associados e arquivos de ativos.

Para alavancar o manifesto, as estruturas precisam fornecer uma maneira de coletar os IDs do módulo dos componentes que foram usados durante uma chamada de renderização do servidor.

`@vitejs/plugin-vue` suporta isso fora da caixa e registra automaticamente os IDs de módulo de componentes usados no contexto de SSR associado VUE:

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules agora é um conjunto de IDs de módulo que foram usados durante a renderização
```

Na filial de produção de `server.js` precisamos ler e passar o manifesto para a `render` função exportada por `src/entry-server.js` . Isso nos forneceria informações suficientes para renderizar diretivas de pré -carga para arquivos usados por rotas assíncronas! Veja [a fonte de demonstração](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js) para um exemplo completo. Você também pode usar essas informações para [103 dicas anteriores](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103) .

## Pré-renderização / ssg

Se as rotas e os dados necessários para determinadas rotas forem conhecidas com antecedência, podemos pré-renderizar essas rotas para HTML estático usando a mesma lógica que a produção SSR. Isso também pode ser considerado uma forma de geração de site estático (SSG). Consulte [o script de pré-renderização da demonstração](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/prerender.js) para obter um exemplo de trabalho.

## SSR External

As dependências são "externalizadas" do sistema de módulos de transformação SSR da Vite por padrão ao executar o SSR. Isso acelera o desenvolvimento e a construção.

Se uma dependência precisar ser transformada pelo pipeline da Vite, por exemplo, porque os recursos do Vite são usados sem transmidas, eles podem ser adicionados a [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal) .

Para dependências vinculadas, elas não são externalizadas por padrão para aproveitar o HMR da Vite. Se isso não for desejado, por exemplo, para testar as dependências como se elas não estivessem vinculadas, você pode adicioná -lo a [`ssr.external`](../config/ssr-options.md#ssr-external) .

:::warning Working with Aliases
Se você configurou aliases que redirecionam um pacote para outro, pode querer alias os pacotes `node_modules` reais para fazê -lo funcionar para dependências externalizadas do SSR. Tanto o alias de suporte [de fios](https://classic.yarnpkg.com/pt/docs/cli/add/#toc-yarn-add-alias) quanto [o PNPM](https://pnpm.io/aliases/) através do `npm:` prefixo.
:::

## Lógica Do Plug-in Específica Do SSR

Algumas estruturas como VUE ou componentes de compilação esbelta em diferentes formatos com base no cliente vs. SSR. Para apoiar as transformações condicionais, o Vite passa uma propriedade adicional `ssr` no `options` objeto dos seguintes ganchos do plug -in:

- `resolveId`
- `load`
- `transform`

**Exemplo:**

```js twoslash
/** @Type {() => import ('vite'). plugin} */
// ---corte---
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // Execute uma transformação específica de SSR ...
      }
    },
  }
}
```

O objeto de opções em `load` e `transform` é opcional, o Rollup não está usando esse objeto atualmente, mas pode estender esses ganchos com metadados adicionais no futuro.

:::tip Note
Antes do Vite 2.7, isso foi informado para o plug -in ganchos com um param `ssr` posicional em vez de usar o objeto `options` . Todas as principais estruturas e plugins são atualizados, mas você pode encontrar postagens desatualizadas usando a API anterior.
:::

## SSR Target

O destino padrão para a compilação SSR é um ambiente de nós, mas você também pode executar o servidor em um trabalhador da web. Pacotes A resolução de entrada é diferente para cada plataforma. Você pode configurar o destino para ser trabalhador da web usando o `ssr.target` definido como `'webworker'` .

## Pacote SSR

Em alguns casos, como `webworker` RunTimes, você pode agrupar seu SSR construído em um único arquivo JavaScript. Você pode ativar esse comportamento definindo `ssr.noExternal` a `true` . Isso fará duas coisas:

- Tratar todas as dependências como `noExternal`
- Lançar um erro se algum node.js embutido for importado

## SSR Resolva condições

Por padrão, a resolução de entrada do pacote usará as condições definidas em [`resolve.conditions`](../config/shared-options.md#resolve-conditions) para a compilação SSR. Você pode usar [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions) e [`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions) para personalizar esse comportamento.

## CLI VITE

Os comandos da CLI `$ vite dev` e `$ vite preview` também podem ser usados para aplicativos SSR. Você pode adicionar seu SSR Middlewares ao servidor de desenvolvimento com [`configureServer`](/pt/guide/api-plugin#configureserver) e ao servidor de visualização com [`configurePreviewServer`](/pt/guide/api-plugin#configurepreviewserver) .

:::tip Note
Use um gancho de postagem para que o seu middleware SSR seja executado _após_ a Middlewares da Vite.
:::
