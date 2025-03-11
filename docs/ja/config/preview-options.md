# プレビューオプション

記載されていない限り、このセクションのオプションはプレビューにのみ適用されます。

## preview.host

- **タイプ:** `文字列 | boolean`
- **デフォルト:** [`server.host`](./server-options#server-host)

サーバーをリッスンするIPアドレスを指定します。
これを`0.0.0.0`または`true`に設定して、LANやパブリックアドレスを含むすべてのアドレスで聞く。

これは、 `--host 0.0.0.0`または`--host`を使用してCLIを介して設定できます。

::: tip NOTE

他のサーバーがViteの代わりに応答する場合がある場合があります。
詳細については、 [`server.host`](./server-options#server-host)参照してください。

:::

## preview.allowedHosts

- **タイプ:** `文字列 | true`
- **デフォルト:** [`server.allowedHosts`](./server-options#server-allowedhosts)

Viteが応答することが許可されているホスト名。

詳細については、 [`server.allowedHosts`](./server-options#server-allowedhosts)参照してください。

## preview.port

- **タイプ:** `number`
- **デフォルト:** `4173`

サーバーポートを指定します。ポートが既に使用されている場合、Viteは次の使用可能なポートを自動的に試してみるので、これがサーバーがリッスンする実際のポートではない可能性があります。

**例:**

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

- **タイプ:** `boolean`
- **デフォルト:** [`server.strictPort`](./server-options#server-strictport)

次の利用可能なポートを自動的に試す代わりに、ポートが既に使用されている場合は、 `true`に設定します。

## preview.https

- **タイプ:** `https.ServerOptions`
- **デフォルト:** [`server.https`](./server-options#server-https)

TLS + HTTP/2を有効にします。注意は、 [`server.proxy`オプション](./server-options#server-proxy)も使用されている場合にのみTLSにダウングレードします。

値は、 `https.createServer()`に渡される[オプションオブジェクト](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)でもあります。

## preview.open

- **タイプ:** `Boolean | string`
- **デフォルト:** [`server.open`](./server-options#server-open)

サーバー開始のブラウザでアプリを自動的に開きます。値が文字列の場合、URLのパス名として使用されます。好きな特定のブラウザでサーバーを開きたい場合は、env `process.env.BROWSER` （例えば`firefox` ）を設定できます。 `process.env.BROWSER_ARGS`設定して追加の引数を渡すこともできます（例: `--incognito` ）。

`BROWSER`と`BROWSER_ARGS` 、 `.env`ファイルに設定して設定できる特別な環境変数でもあります。詳細については、 [`open`パッケージ](https://github.com/sindresorhus/open#app)を参照してください。

## preview.proxy

- **タイプ:** `レコード<文字列、文字列 | プロキシオプティオン> `
- **デフォルト:** [`server.proxy`](./server-options#server-proxy)

プレビューサーバーのカスタムプロキシルールを構成します。 `{ key: options }`ペアのオブジェクトが期待されます。キーが`^`で始まる場合、それは`RegExp`として解釈されます。 `configure`オプションを使用して、プロキシインスタンスにアクセスできます。

[`http-proxy`](https://github.com/http-party/node-http-proxy)を使用します。[ここに](https://github.com/http-party/node-http-proxy#options)完全なオプションがあります。

## preview.cors

- **タイプ:** `Boolean | corsoptions`
- **デフォルト:** [`server.cors`](./server-options#server-cors)

プレビューサーバーにCORを構成します。

詳細については、 [`server.cors`](./server-options#server-cors)参照してください。

## preview.headers

- **タイプ:** `OutgoingHttpHeaders`

サーバー応答ヘッダーを指定します。
