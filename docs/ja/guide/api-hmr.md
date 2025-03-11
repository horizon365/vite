# HMR API

:::tip Note
これはクライアントHMR APIです。プラグインでHMRアップデートを処理するには、 [HoundHotUpDateを](./api-plugin#handlehotupdate)参照してください。

マニュアルHMR APIは、主にフレームワークとツーリング著者を対象としています。エンドユーザーとして、HMRはフレームワーク固有のスターターテンプレートで既に処理されている可能性があります。
:::

Viteは、特別な`import.meta.hot`オブジェクトを介して手動HMR APIを公開します。

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'

//  - -カット - -
interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  off<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}
```

## 必要な条件付きガード

まず第一に、条件付きブロックですべてのHMR API使用量を保護して、コードを生産中にツリーシェーキングできるようにしてください。

```js
if (import.meta.hot) {
  // HMRコード
}
```

## TypeScriptのIntellisense

Viteは、 [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts)インチの`import.meta.hot`のタイプ定義を提供します。 `src`ディレクトリに`env.d.ts`作成できるため、TypeScriptはタイプ定義を選択します。

```ts
///<reference types="vite/client">
```

## `hot.accept(cb)`

モジュールが自己受容するには、更新されたモジュールを受信するコールバックで`import.meta.hot.accept`を使用します。

```js twoslash
import 'vite/client'
//  - -カット - -
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // Syntaxerrorが発生したとき、NewModuleは未定義です
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

ホットアップデートを「受け入れる」モジュールは、 **HMR境界**と見なされます。

ViteのHMRは、元々インポートされたモジュールを実際に交換しません。HMR境界モジュールがDEPからインポートを再輸出する場合、それらの再輸出を更新する責任があります（これらのエクスポートは`let`使用する必要があります）。さらに、境界モジュールからチェーンの輸入業者は、変更について通知されません。この単純化されたHMR実装では、ほとんどの開発ユースケースには十分であり、プロキシモジュールの生成の高価な作業をスキップできます。

VITEでは、モジュールが更新を受け入れるために、この関数への呼び出しがソースコードで`import.meta.hot.accept(` （Whitespace-sensitive）として表示されることを要求します。これは、モジュールのHMRサポートを有効にするためにViteが行う静的分析の要件です。

## `hot.accept(deps, cb)`

モジュールは、それ自体をリロードせずに、直接依存関係からの更新を受け入れることもできます。

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
//  - -カット - -
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // コールバックは、更新された './foo.js'モジュールを受信します
    newFoo?.foo()
  })

  // DEPモジュールの配列も受け入れることができます。
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // コールバックは、更新されたモジュールのみが
      // 非ヌル。更新が成功しなかった場合（例の構文エラー）、
      // 配列は空です
    },
  )
}
```

## `hot.dispose(cb)`

他の人に受け入れられると予想される自己受容モジュールまたはモジュールは、 `hot.dispose`を使用して、更新されたコピーによって作成された永続的な副作用をクリーンアップできます。

```js twoslash
import 'vite/client'
//  - -カット - -
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // クリーンアップ副作用
  })
}
```

## `hot.prune(cb)`

モジュールがページにインポートされなくなったときに呼び出すコールバックを登録します。 `hot.dispose`と比較して、ソースコードが更新で副作用をクリーンアップし、ページから削除されたときにのみクリーンアップする必要がある場合に使用できます。現在、Viteはこれを`.css`輸入で使用しています。

```js twoslash
import 'vite/client'
//  - -カット - -
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // クリーンアップ副作用
  })
}
```

## `hot.data`

`import.meta.hot.data`オブジェクトは、同じ更新されたモジュールの異なるインスタンスにわたって持続します。以前のバージョンのモジュールから次のモジュールまで情報を渡すために使用できます。

`data`自体の再割り当てはサポートされていないことに注意してください。代わりに、他のハンドラーから追加された情報が保存されるように、 `data`オブジェクトのプロパティを変異させる必要があります。

```js twoslash
import 'vite/client'
//  - -カット - -
// わかりました
import.meta.hot.data.someValue = 'hello'

// サポートされていません
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

これは現在NOOPであり、後方互換性のためにあります。これは、新しい使用法がある場合、将来変化する可能性があります。モジュールがホットアップデート不可能であることを示すには、 `hot.invalidate()`使用します。

## `hot.invalidate(message?: string)`

自己受容モジュールは、実行時にHMRアップデートを処理できないことを認識する可能性があるため、更新を輸入業者に強制的に伝播する必要があります。 `import.meta.hot.invalidate()`呼び出すことにより、HMRサーバーは、発信者が自己受容していないかのように、発信者の輸入業者を無効にします。これにより、ブラウザコンソールとターミナルの両方にメッセージが記録されます。メッセージを渡して、なぜ無効化が起こったのかについてのコンテキストを与えることができます。

すぐに`invalidate`呼び出すことを計画している場合でも、常に`import.meta.hot.accept`呼び出す必要があります。そうしないと、HMRクライアントは、自己受容モジュールの将来の変更を聞いていないことに注意してください。意図を明確に伝えるには、次のように`accept`コールバック内で`invalidate`呼び出すことをお勧めします。

```js twoslash
import 'vite/client'
//  - -カット - -
import.meta.hot.accept((module) => {
  // 新しいモジュールインスタンスを使用して、無効化するかどうかを決定できます。
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

HMRイベントを聞いてください。

次のHMRイベントは、Viteによって自動的に発送されます。

- `'vite:beforeUpdate'`アップデートが適用されようとしている場合（例:モジュールが交換されます）
- `'vite:afterUpdate'`アップデートが適用されたばかりの場合（例:モジュールが交換されました）
- `'vite:beforeFullReload'`フルリロードが発生しようとしている場合
- `'vite:beforePrune'`不要なモジュールが剪定されようとしている場合
- `'vite:invalidate'`モジュールが`import.meta.hot.invalidate()`で無効になっている場合
- `'vite:error'`エラーが発生したとき（例:構文エラー）
- `'vite:ws:disconnect'` Websocket接続が失われたとき
- `'vite:ws:connect'` Websocket接続が（再）確立されたとき

カスタムHMRイベントは、プラグインから送信することもできます。詳細については、 [handlehotupdateを](./api-plugin#handlehotupdate)参照してください。

## `hot.off(event, cb)`

イベントリスナーからコールバックを削除します。

## `hot.send(event, data)`

ViteのDevサーバーにカスタムイベントを送り返します。

接続前に呼び出された場合、接続が確立されるとデータがバッファーされ、送信されます。

[カスタムイベントの入力](/ja/guide/api-plugin.html#typescript-for-custom-events)に関するセクションを含む、詳細については、[クライアントサーバー通信](/ja/guide/api-plugin.html#client-server-communication)を参照してください。

## さらに読む

HMR APIの使用方法と、それがどのように機能するかについて詳しく知りたい場合。これらのリソースをチェックしてください:

- [ホットモジュールの交換は簡単です](https://bjornlu.com/blog/hot-module-replacement-is-easy)
