# Opções De Visualização

A menos que seja indicado, as opções nesta seção são aplicadas apenas para visualizar.

## preview.host

- **Tipo:** `string | booleano '
- **Padrão:** [`server.host`](./server-options#server-host)

Especifique em quais endereços IP o servidor deve ouvir.
Defina isso como `0.0.0.0` ou `true` para ouvir em todos os endereços, incluindo LAN e endereços públicos.

Isso pode ser definido através da CLI usando `--host 0.0.0.0` ou `--host` .

::: tip NOTE

Há casos em que outros servidores podem responder em vez de vite.
Veja [`server.host`](./server-options#server-host) para mais detalhes.

:::

## preview.allowedHosts

- **Tipo:** `string | true`
- **Padrão:** [`server.allowedHosts`](./server-options#server-allowedhosts)

Os nomes de host que o Vite pode responder.

Veja [`server.allowedHosts`](./server-options#server-allowedhosts) para mais detalhes.

## preview.port

- **Tipo:** `number`
- **Padrão:** `4173`

Especifique a porta do servidor. Nota Se a porta já estiver sendo usada, o Vite tentará automaticamente a próxima porta disponível para que essa possa não ser a porta real em que o servidor acaba ouvindo.

**Exemplo:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

- **Tipo:** `boolean`
- **Padrão:** [`server.strictPort`](./server-options#server-strictport)

Defina como `true` para sair se a porta já estiver em uso, em vez de tentar automaticamente a próxima porta disponível.

## preview.https

- **Tipo:** `https.ServerOptions`
- **Padrão:** [`server.https`](./server-options#server-https)

Ativar TLS + HTTP/2. Observe que isso rebaixa para o TLS somente quando a [opção `server.proxy`](./server-options#server-proxy) também for usada.

O valor também pode ser um [objeto de opções](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) passado para `https.createServer()` .

## preview.open

- **Tipo:** `booleano | string`
- **Padrão:** [`server.open`](./server-options#server-open)

Abra automaticamente o aplicativo no navegador no servidor Iniciar. Quando o valor for uma string, ele será usado como o nome do caminho do URL. Se você deseja abrir o servidor em um navegador específico que você gosta, pode definir o Env `process.env.BROWSER` (por exemplo, `firefox` ). Você também pode definir `process.env.BROWSER_ARGS` para passar argumentos adicionais (por exemplo, `--incognito` ).

`BROWSER` e `BROWSER_ARGS` também são variáveis de ambiente especiais que você pode definir no arquivo `.env` para configurá -lo. Veja [o pacote `open`](https://github.com/sindresorhus/open#app) para obter mais detalhes.

## preview.proxy

- **TIPO:** `Record <string, string | Proxyoptions> `
- **Padrão:** [`server.proxy`](./server-options#server-proxy)

Configure regras de proxy personalizadas para o servidor de visualização. Espera um objeto de `{ key: options }` pares. Se a chave começar com `^` , ela será interpretada como um `RegExp` . A opção `configure` pode ser usada para acessar a instância do proxy.

Usa [`http-proxy`](https://github.com/http-party/node-http-proxy) . Opções completas [aqui](https://github.com/http-party/node-http-proxy#options) .

## preview.cors

- **Tipo:** `booleano | Corsoptions`
- **Padrão:** [`server.cors`](./server-options#server-cors)

Configure os CORs para o servidor de visualização.

Veja [`server.cors`](./server-options#server-cors) para mais detalhes.

## preview.headers

- **Tipo:** `OutgoingHttpHeaders`

Especifique cabeçalhos de resposta do servidor.
