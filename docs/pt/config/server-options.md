# Opções Do Servidor

A menos que seja indicado, as opções nesta seção são aplicadas apenas ao dev.

## server.host

- **Tipo:** `string | booleano '
- **Padrão:** `'localhost'`

Especifique em quais endereços IP o servidor deve ouvir.
Defina isso como `0.0.0.0` ou `true` para ouvir em todos os endereços, incluindo LAN e endereços públicos.

Isso pode ser definido através da CLI usando `--host 0.0.0.0` ou `--host` .

::: tip NOTE

Há casos em que outros servidores podem responder em vez de vite.

O primeiro caso é quando `localhost` é usado. Node.js sob o V17 Reordes o resultado de endereços resolvidos por DNS por padrão. Ao acessar `localhost` , os navegadores usam o DNS para resolver o endereço e esse endereço pode diferir do endereço que o Vite está ouvindo. O Vite imprime o endereço resolvido quando ele difere.

Você pode definir [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order) para desativar o comportamento de reordenação. Vite então imprimirá o endereço como `localhost` .

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // omitir
})
```

O segundo caso é quando os hospedeiros curinga (por exemplo, `0.0.0.0` ) são usados. Isso ocorre porque os servidores que estão ouvindo em hosts não-wildcard têm prioridade sobre os que estão ouvindo os hosts curinga.

:::

::: tip Accessing the server on WSL2 from your LAN

Ao executar o Vite no WSL2, não é suficiente definir `host: true` para acessar o servidor a partir da sua LAN.
Consulte [o documento WSL](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan) para obter mais detalhes.

:::

## server.allowedHosts

- **Tipo:** `string [] | true`
- **Padrão:** `[]`

Os nomes de host que o Vite pode responder.
`localhost` e domínios sob `.localhost` e todos os endereços IP são permitidos por padrão.
Ao usar o HTTPS, esta verificação é ignorada.

Se uma string iniciar com `.` , permitirá esse nome de host sem o `.` e todos os subdomínios sob o nome do host. Por exemplo, `.example.com` permitirá `example.com` , `foo.example.com` e `foo.bar.example.com` . Se definido como `true` , o servidor poderá responder a solicitações de hosts.

::: details What hosts are safe to be added?

Os hosts que você tem controle sobre quais endereços IP eles resolvem são seguros para adicionar à lista de hosts permitidos.

Por exemplo, se você possui um domínio `vite.dev` , poderá adicionar `vite.dev` e `.vite.dev` à lista. Se você não possui esse domínio e não pode confiar no proprietário desse domínio, não deve adicioná -lo.

Especialmente, você nunca deve adicionar domínios de nível superior como `.com` à lista. Isso ocorre porque qualquer pessoa pode comprar um domínio como `example.com` e controlar o endereço IP para o qual resolve.

:::

::: danger

A configuração de `server.allowedHosts` a `true` permite que qualquer site envie solicitações ao seu servidor de desenvolvimento por meio de ataques de renovação do DNS, permitindo que eles baixem seu código e conteúdo fonte. Recomendamos sempre usar uma lista explícita de hosts permitidos. Consulte [GHSA-VG6X-RCGG-RJX6](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6) para obter mais detalhes.

:::

::: details Configure via environment variable
Você pode definir a variável de ambiente `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` para adicionar um host adicional permitido.
:::

## server.port

- **Tipo:** `number`
- **Padrão:** `5173`

Especifique a porta do servidor. Nota Se a porta já estiver sendo usada, o Vite tentará automaticamente a próxima porta disponível para que essa possa não ser a porta real em que o servidor acaba ouvindo.

## server.strictPort

- **Tipo:** `boolean`

Defina como `true` para sair se a porta já estiver em uso, em vez de tentar automaticamente a próxima porta disponível.

## server.https

- **Tipo:** `https.ServerOptions`

Ativar TLS + HTTP/2. Observe que isso rebaixa para o TLS somente quando a [opção `server.proxy`](#server-proxy) também for usada.

O valor também pode ser um [objeto de opções](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) passado para `https.createServer()` .

É necessário um certificado válido. Para uma configuração básica, você pode adicionar [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) aos plugins do projeto, que criará e cache automaticamente um certificado autoassinado. Mas recomendamos criar seus próprios certificados.

## server.open

- **Tipo:** `booleano | string`

Abra automaticamente o aplicativo no navegador no servidor Iniciar. Quando o valor for uma string, ele será usado como o nome do caminho do URL. Se você deseja abrir o servidor em um navegador específico que você gosta, pode definir o Env `process.env.BROWSER` (por exemplo, `firefox` ). Você também pode definir `process.env.BROWSER_ARGS` para passar argumentos adicionais (por exemplo, `--incognito` ).

`BROWSER` e `BROWSER_ARGS` também são variáveis de ambiente especiais que você pode definir no arquivo `.env` para configurá -lo. Veja [o pacote `open`](https://github.com/sindresorhus/open#app) para obter mais detalhes.

**Exemplo:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **TIPO:** `Record <string, string | Proxyoptions> `

Configure regras de proxy personalizadas para o servidor dev. Espera um objeto de `{ key: options }` pares. Quaisquer solicitações que o caminho de solicitação inicie com essa chave será proxado para esse destino especificado. Se a chave começar com `^` , ela será interpretada como um `RegExp` . A opção `configure` pode ser usada para acessar a instância do proxy. Se uma solicitação corresponder a alguma das regras de proxy configuradas, a solicitação não será transformada pelo Vite.

Observe que, se você estiver usando [`base`](/pt/config/shared-options.md#base) não-relativo, deve prefixar cada chave com essa `base` .

Estende [`http-proxy`](https://github.com/http-party/node-http-proxy#options) . Opções adicionais estão [aqui](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13) .

Em alguns casos, você também pode configurar o servidor de dev subjacente (por exemplo, para adicionar usuários médios personalizados ao aplicativo [de conexão](https://github.com/senchalabs/connect) interna). Para fazer isso, você precisa escrever seu próprio [plug -in](/pt/guide/using-plugins.html) e usar a função [ConfigureServer](/pt/guide/api-plugin.html#configureserver) .

**Exemplo:**

```js
export default defineConfig({
  server: {
    proxy: {
      // String abrevante:
      // http: // localhost: 5173/foo
      //   -> [http: // localhost: 4567/foo](http://localhost:4567/foo)
      '/foo': 'http://localhost:4567',
      // Com opções:
      // http: // localhost: 5173/api/bar
      //   -> [http://jsonplaceholder.typicode.com/bar](http://jsonplaceholder.typicode.com/bar)
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // com regexp:
      // http: // localhost: 5173/Fallback/
      //   -> [http://jsonplaceholder.typicode.com/](http://jsonplaceholder.typicode.com/)
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // Usando a instância de proxy
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Proxy será uma instância de 'http-proxy'
        },
      },
      // Websockets ou soquete proxying.io:
      // ws: // localhost: 5173/soket.io
      //   -> ws: // localhost: 5174/soket.io
      // Exercite -se com cuidado usando `rewriteWsOrigin` pois pode deixar o
      // proxying aberto a ataques de CSRF.
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **Tipo:** `booleano | Corsoptions`
- **Padrão:** `{Origin: /^https?|127\.0\.0\.1|[:: 1]) (? :: \ d+)? $/}  127.0.0.1  :: 1`)

Configure os CORs para o servidor dev. Passe um [objeto de opções](https://github.com/expressjs/cors#configuration-options) para ajustar o comportamento ou `true` para permitir qualquer origem.

::: danger

A configuração de `server.cors` a `true` permite que qualquer site envie solicitações ao seu servidor de desenvolvimento e faça o download do seu código e conteúdo fonte. Recomendamos sempre usar uma lista explícita de origens permitidas.

:::

## server.headers

- **Tipo:** `OutgoingHttpHeaders`

Especifique cabeçalhos de resposta do servidor.

## server.hmr

- **Tipo:** `booleano | {protocolo?: string, host?: string, porta?: número, path?: string, timeout?: número, sobreposição?: boolean, clientport?: número, servidor?: servidor} `

Desative ou configure a conexão HMR (nos casos em que o HMR WebSocket deve usar um endereço diferente do servidor HTTP).

Defina `server.hmr.overlay` a `false` para desativar a sobreposição de erro do servidor.

`protocol` Define o protocolo WebSocket usado para a conexão HMR: `ws` (WebSocket) ou `wss` (WebSocket Secure).

`clientPort` é uma opção avançada que substitui a porta apenas no lado do cliente, permitindo que você sirva o WebSocket em uma porta diferente do que o código do cliente procura.

Quando `server.hmr.server` for definido, o Vite processará as solicitações de conexão HMR através do servidor fornecido. Se não estiver no modo de middleware, o Vite tentará processar solicitações de conexão HMR através do servidor existente. Isso pode ser útil ao usar certificados autoassinados ou quando você deseja expor o Vite em uma rede em uma única porta.

Confira [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue) para alguns exemplos.

::: tip NOTE

Com a configuração padrão, espera -se que os proxies reversos na frente do Vite suportem o WebSocket proxying. Se o cliente Vite HMR não conseguir conectar o WebSocket, o cliente voltará a conectar o WebSocket diretamente ao servidor Vite HMR, ignorando os proxies reversos:

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

O erro que aparece no navegador quando o fallback ocorre pode ser ignorado. Para evitar o erro ignorando diretamente os proxies reversos, você pode: também:

- Configure o proxy reverso para proxy webSocket também
- Defina [`server.strictPort = true`](#server-strictport) e defina `server.hmr.clientPort` no mesmo valor com `server.port`
- Defina `server.hmr.port` como um valor diferente de [`server.port`](#server-port)

:::

## server.warmup

- **Tipo:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **Relacionado:** [aquecimento com arquivos usados com frequência](/pt/guide/performance.html#warm-up-frequently-used-files)

Aqueça arquivos para transformar e cache os resultados com antecedência. Isso melhora a carga inicial da página durante o início do servidor e evita que as cachoeiras transformem.

`clientFiles` são arquivos usados apenas no cliente, enquanto `ssrFiles` são arquivos usados apenas em SSR. Eles aceitam uma matriz de caminhos de arquivo ou [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) padrões em relação aos `root` .

Certifique -se de adicionar apenas arquivos que são frequentemente usados para não sobrecarregar o servidor de dev vite na inicialização.

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **Tipo:** `objeto | null`

Opções do Observador do Sistema de Arquivos para passar para [Chokidar](https://github.com/paulmillr/chokidar/tree/3.6.0#api) .

O vigia do servidor Vite assiste os `root` e pula os diretórios `.git/` , `node_modules/` e Vite de `cacheDir` e `build.outDir` por padrão. Ao atualizar um arquivo assistido, o Vite aplicará o HMR e atualizará a página apenas, se necessário.

Se definido como `null` , nenhum arquivo será assistido. `server.watcher` fornecerá um emissor de eventos compatíveis, mas ligar `add` ou `unwatch` não terá efeito.

::: warning Watching files in `node_modules`

Atualmente, não é possível assistir a arquivos e pacotes em `node_modules` . Para mais progressos e soluções alternativas, você pode seguir [a edição 8619](https://github.com/vitejs/vite/issues/8619) .

:::

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

Ao executar o Vite no WSL2, o sistema de assistência a arquivos não funciona quando um arquivo é editado pelos aplicativos do Windows (processo não WSL2). Isso se deve a [uma limitação do WSL2](https://github.com/microsoft/WSL/issues/4739) . Isso também se aplica à execução no Docker com um back -end WSL2.

Para consertar, você pode: também:

- **Recomendado** : use aplicativos WSL2 para editar seus arquivos.
  - Também é recomendável mover a pasta do projeto para fora de um sistema de arquivos do Windows. O acesso ao sistema de arquivos Windows no WSL2 é lento. A remoção dessa sobrecarga melhorará o desempenho.
- Definir `{ usePolling: true }` .
  - Observe que [`usePolling` leva à alta utilização da CPU](https://github.com/paulmillr/chokidar/tree/3.6.0#performance) .

:::

## server.middlewareMode

- **Tipo:** `boolean`
- **Padrão:** `false`

Crie servidor Vite no modo de middleware.

- **Relacionado:** [AppType](./shared-options#apptype) , [SSR - Configurando o servidor dev](/pt/guide/ssr#setting-up-the-dev-server)

- **Exemplo:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // Crie servidor vite no modo de middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // Não inclua o Middlewares de Middlewares de Middlewares da Vite HTML
    appType: 'custom',
  })
  // Use a instância de conexão do Vite como middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Como `appType` é `'custom'` , deve servir a resposta aqui.
    // NOTA: Se `appType` for `'spa'` ou `'mpa'` , o Vite inclui Middlewares
    // Para lidar
    // Antes de Vite's Middlewares para entrar em vigor em vez disso
  })
}

createServer()
```

## server.fs.strict

- **Tipo:** `boolean`
- **Padrão:** `true` (ativado por padrão desde o Vite 2.7)

Restrinja os arquivos de servir fora do espaço de trabalho raiz.

## server.fs.allow

- **Tipo:** `string[]`

Restre os arquivos que podem ser servidos via `/@fs/` . Quando `server.fs.strict` é definido como `true` , o acesso a arquivos fora desta lista de diretórios que não são importados de um arquivo permitido resultará em um 403.

Os diretórios e os arquivos podem ser fornecidos.

O Vite procurará a raiz da área de trabalho em potencial e a usará como padrão. Um espaço de trabalho válido atendeu às seguintes condições, caso contrário, voltará à [raiz do projeto](/pt/guide/#index-html-and-project-root) .

- contém `workspaces` campo em `package.json`
- contém um dos seguintes arquivos
  - `lerna.json`
  - `pnpm-workspace.yaml`

Aceita um caminho para especificar a raiz da área de trabalho personalizada. Pode ser um caminho absoluto ou um caminho em relação à [raiz do projeto](/pt/guide/#index-html-and-project-root) . Por exemplo:

```js
export default defineConfig({
  server: {
    fs: {
      // Permitir servir arquivos de um nível até a raiz do projeto
      allow: ['..'],
    },
  },
})
```

Quando `server.fs.allow` for especificado, a detecção de raiz da área de trabalho automática será desativada. Para estender o comportamento original, um utilitário `searchForWorkspaceRoot` é exposto:

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // Pesquise pela raiz do espaço de trabalho
        searchForWorkspaceRoot(process.cwd()),
        // suas regras personalizadas
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **Tipo:** `string[]`
- **Padrão:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

Lista de blocos para arquivos sensíveis sendo restritos a serem servidos pelo servidor de dev vite. Isso terá uma prioridade mais alta que [`server.fs.allow`](#server-fs-allow) . [Os padrões de picomatch](https://github.com/micromatch/picomatch#globbing-features) são suportados.

## server.origin

- **Tipo:** `string`

Define a origem dos URLs de ativos gerados durante o desenvolvimento.

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **Tipo:** `false | (Sourcepath: String, SourceMappath: String) => Boolean` '
- **Padrão:** `(sourcePath) => sourcePath.includes('node_modules')`

Se deve ou não ignorar os arquivos de origem no servidor SourCemap, usado para preencher a [extensão do mapa de origem `x_google_ignoreList`](https://developer.chrome.com/articles/x-google-ignore-list/) .

`server.sourcemapIgnoreList` é o equivalente a [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) para o servidor dev. Uma diferença entre as duas opções de configuração é que a função de rollup é chamada com um caminho relativo para `sourcePath` , enquanto `server.sourcemapIgnoreList` é chamado com um caminho absoluto. Durante o Dev, a maioria dos módulos possui o mapa e a fonte na mesma pasta, portanto, o caminho relativo para `sourcePath` é o próprio nome do arquivo. Nesses casos, os caminhos absolutos tornam conveniente ser usado.

Por padrão, ele exclui todos os caminhos contendo `node_modules` . Você pode passar `false` para desativar esse comportamento ou, para controle total, uma função que segue o caminho de origem e o caminho de fonte e retorna se deve ignorar o caminho da origem.

```js
export default defineConfig({
  server: {
    // Este é o valor padrão e adicionará todos os arquivos com node_modules
    // em seus caminhos para a lista de ignorados.
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Note
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist) e [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) precisam ser definidos de forma independente. `server.sourcemapIgnoreList` é uma configuração apenas de servidor e não recebe seu valor padrão das opções de rollup definidas.
:::
