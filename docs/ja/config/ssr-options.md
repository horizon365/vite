# SSRオプション

記載されていない限り、このセクションのオプションは開発とビルドの両方に適用されます。

## ssr.external

- **タイプ:** `string [] | true`
- **関連:** [SSR外部](/ja/guide/ssr#ssr-externals)

SSRの指定された依存関係とその推移的依存関係を外部化します。デフォルトでは、すべての依存関係は、リンクされた依存関係（HMRの場合）を除いて外部化されます。リンクされた依存関係を外部化する場合は、この名前をこのオプションに渡すことができます。

`true`の場合、リンク依存関係を含むすべての依存関係が外部化されます。

明示的にリストされている依存関係（ `string[]`タイプを使用）は、 `ssr.noExternal`にリストされている場合（任意のタイプを使用）、常に優先されることに注意してください。

## ssr.noExternal

- **タイプ:** `文字列 | regexp | （弦 | regexp）[] | true`
- **関連:** [SSR外部](/ja/guide/ssr#ssr-externals)

リストされている依存関係がSSRの外部化されないようにし、ビルドにバンドルされます。デフォルトでは、リンクされた依存関係のみが外部化されません（HMRの場合）。リンクされた依存関係を外部化する場合は、その名前を`ssr.external`オプションに渡すことができます。

`true`の場合、依存関係は外部化されません。ただし、 `ssr.external`に明示的にリストされている依存関係（ `string[]`タイプを使用）を優先して外部化することができます。 `ssr.target: 'node'`設定されている場合、node.jsビルドインもデフォルトで外部化されます。

`ssr.noExternal: true`と`ssr.external: true`両方が構成されている場合、 `ssr.noExternal`優先され、依存関係が外部化されないことに注意してください。

## ssr.target

- **タイプ:** `'ノード' | 「Webworker」
- **デフォルト:** `node`

SSRサーバーのターゲットを構築します。

## ssr.resolve.conditions

- **タイプ:** `string[]`
- **デフォルト:** `['Module'、 'node'、 '開発|生産 '] ` (`DefaultServerConditions`) (`[' Module '、' Browser '、'開発|生産 ']` (`DefaultClientConditions`) for ` SSR.TARGET ===' WebWorker '）
- **関連:**[条件を解決します](./shared-options.md#resolve-conditions)

これらの条件はプラグインパイプラインで使用され、SSRビルド中の非外部化された依存関係にのみ影響します。 `ssr.resolve.externalConditions`使用して、外部化されたインポートに影響します。

## ssr.resolve.externalConditions

- **タイプ:** `string[]`
- **デフォルト:** `['node']`

外部化された直接依存関係（Viteによってインポートされた外部依存関係）のSSRインポート（ `ssrLoadModule`を含む）中に使用される条件。

:::tip

このオプションを使用する場合は、DEVとビルドの両方で同じ値の[`--conditions`フラグ](https://nodejs.org/docs/latest/api/cli.html#-c-condition---conditionscondition)でノードを実行して、一貫した動作を取得してください。

たとえば、 `['node', 'custom']`設定するときは、ビルド後にDEVで`NODE_OPTIONS='--conditions custom' vite` `NODE_OPTIONS="--conditions custom" node ./dist/server.js`実行する必要があります。

:::

### ssr.resolve.mainFields

- **タイプ:** `string[]`
- **デフォルト:** `['module', 'jsnext:main', 'jsnext']`

パッケージのエントリポイントを解決するときに試してみる`package.json`のフィールドのリスト。注これは、 `exports`フィールドから解決された条件付きエクスポートよりも優先されます。2 `exports`エントリポイントが正常に解決された場合、メインフィールドは無視されます。この設定は、外部化されていない依存関係にのみ影響します。
