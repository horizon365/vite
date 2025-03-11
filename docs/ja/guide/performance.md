# パフォーマンス

デフォルトではViteは高速ですが、プロジェクトの要件が成長するにつれてパフォーマンスの問題が忍び寄る可能性があります。このガイドは、次のような一般的なパフォーマンスの問題を特定して修正するのに役立つことを目的としています。

- 遅いサーバーが始まります
- 遅いページの読み込み
- 遅いビルド

## ブラウザのセットアップを確認します

一部のブラウザ拡張機能は、特にブラウザ開発ツールを使用する場合、リクエストを妨害し、大規模なアプリの起動時とリロード時間を遅くする場合があります。これらの場合にViteの開発サーバーを使用しながら、拡張機能なしで開発のみのプロファイルを作成するか、Incognitoモードに切り替えることをお勧めします。 Incognitoモードは、拡張機能のない通常のプロファイルよりも高速にする必要があります。

Vite Dev Serverは、事前にバンドルされた依存関係のハードキャッシュを行い、ソースコードの高速304応答を実装します。ブラウザ開発ツールが開いている間にキャッシュを無効にすると、起動時とフルページのリロード時間に大きな影響を与える可能性があります。 Viteサーバーを使用している間は、「キャッシュを無効にする」が有効になっていないことを確認してください。

## 監査設定されたViteプラグイン

Viteの内部プラグインおよび公式プラグインは、より広範なエコシステムとの互換性を提供しながら、可能な限り最小限の作業を行うように最適化されています。たとえば、コード変換はDEVでREGEXを使用しますが、正しさを確保するためにビルドで完全な解析を行います。

ただし、コミュニティプラグインのパフォーマンスはViteのコントロールから外れており、開発者エクスペリエンスに影響を与える可能性があります。追加のViteプラグインを使用するときに注意できるものがいくつかあります。

1. 特定の場合にのみ使用される大規模な依存関係は、node.js起動時間を短縮するために動的にインポートする必要があります。例リファクタル: [Vite-Plugin-React＃212](https://github.com/vitejs/vite-plugin-react/pull/212)および[Vite-Plugin-PWA＃224](https://github.com/vite-pwa/vite-plugin-pwa/pull/244) 。

2. `buildStart` 、および`configResolved`フックは`config`長くて大規模な操作を実行しないでください。これらのフックは、Dev Serverの起動時に待たれます。これは、ブラウザ内のサイトにアクセスできるときに遅れます。

3. `resolveId` 、および`transform`フックにより、一部のファイルが他のファイル`load`も遅くロードされる場合があります。避けられないこともありますが、最適化する可能性のある領域をチェックする価値があります。たとえば、 `code`特定のキーワードが含まれているか、 `id`特定の拡張子と一致するかどうかを確認する前に、完全な変換を行います。

   ファイルを変換するのに時間がかかるほど、ブラウザにサイトをロードするときにリクエストウォーターフォールが重要になります。

   `vite --debug plugin-transform`または[vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect)を使用してファイルを変換するのにかかる期間を検査できます。非同期操作は不正確なタイミングを提供する傾向があるため、数字を大まかな見積もりとして扱う必要がありますが、より高価な操作を明らかにする必要があります。

::: tip Profiling
`vite --profile`実行し、サイトにアクセスし、端末の`p + enter`押して`.cpuprofile`記録できます。その後、 [SpeedScope](https://www.speedscope.app)などのツールを使用して、プロファイルを検査し、ボトルネックを識別できます。また、[プロファイルをViteチームと共有して](https://chat.vite.dev)、パフォーマンスの問題を特定することもできます。
:::

## 解決操作を削減します

輸入パスの解決は、頻繁に最悪のケースを打つ場合、高価な操作になる可能性があります。たとえば、Viteは、 [`resolve.extensions`](/ja/config/shared-options.md#resolve-extensions)オプションを使用して「推測」インポートパスをサポートします`['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

`import './Component'`で`./Component.jsx`をインポートしようとすると、Viteはこれらの手順を実行して解決します。

1. `./Component`存在するかどうかを確認します、いいえ。
2. `./Component.mjs`存在するかどうかを確認します、いいえ。
3. `./Component.js`存在するかどうかを確認します、いいえ。
4. `./Component.mts`存在するかどうかを確認します、いいえ。
5. `./Component.ts`存在するかどうかを確認します、いいえ。
6. `./Component.jsx`存在するかどうかを確認してください、はい！

示されているように、インポートパスを解決するには、合計6つのファイルシステムチェックが必要です。暗黙の輸入品が多いほど、パスを解決するために追加する時間が長くなります。

したがって、通常、インポートパス（ `import './Component.jsx'` ）で明示的であることをお勧めします。また、一般的なファイルシステムチェックを減らすために`resolve.extensions`リストを絞り込むこともできますが、 `node_modules`のファイルに対しても機能することを確認する必要があります。

プラグインの著者の場合は、必要に応じて[`this.resolve`](https://rollupjs.org/plugin-development/#this-resolve)の場合のみを呼び出して、上記のチェック数を減らすようにしてください。

::: tip TypeScript
TypeScriptを使用している場合は、 `tsconfig.json` 'S `compilerOptions`で`"moduleResolution": "bundler"`と`"allowImportingTsExtensions": true`有効にして、コードで`.ts`と`.tsx`拡張機能を直接使用します。
:::

## バレルファイルを避けてください

バレルファイルは、同じディレクトリ内の他のファイルのAPIを再輸出するファイルです。例えば:

```js [src/utils/index.js]
export * from './color.js'
export * from './dom.js'
export * from './slash.js'
```

個々のAPIのみをインポートする場合、たとえば`import { slash } from './utils'`インポートする場合、そのバレルファイルのすべてのファイルは、 `slash` APIが含まれている可能性があり、初期化時に実行される副作用も含まれている可能性があるため、フェッチして変換する必要があります。これは、最初のページのロードで必要以上に多くのファイルをロードしているため、ページの負荷が遅くなります。

可能であれば、バレルファイルを回避し、個々のAPIを直接インポートする必要があります`import { slash } from './utils/slash.js'`詳細については、[問題＃8237](https://github.com/vitejs/vite/issues/8237)を読むことができます。

## 頻繁に使用されるファイルをウォームアップします

Vite Dev Serverは、ブラウザの要求に従ってファイルのみを変換します。これにより、迅速に起動し、使用済みファイルに変換のみを適用できます。また、特定のファイルがまもなくリクエストされると予想される場合、ファイルを事前に変換することもできます。ただし、一部のファイルが他のファイルよりも時間がかかる場合でも、リクエストの滝が発生する可能性があります。例えば:

左ファイルが右ファイルをインポートするインポートグラフが与えられます。

```
main.js -> BigComponent.vue -> big-utils.js -> large-data.json
```

インポート関係は、ファイルが変換された後にのみ知ることができます。 `BigComponent.vue`変換に時間がかかる場合、 `big-utils.js`ターンを待たなければなりません。これにより、移動前に組み込まれている場合でも、内部の滝が生じます。

Viteを使用すると、 [`server.warmup`](/ja/config/server-options.md#server-warmup)オプションを使用して、頻繁に`big-utils.js`されるファイルをウォームアップできます。この方法は`big-utils.js`要求されたときにすぐに提供されるようになり、キャッシュされます。

`vite --debug transform`実行して頻繁に使用されるファイルを見つけて、ログを検査できます。

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
```

```js [vite.config.js]
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

起動時にVite Devサーバーを過負荷にしないために頻繁に使用されるファイルのみをウォームアップする必要があることに注意してください。詳細については、 [`server.warmup`](/ja/config/server-options.md#server-warmup)オプションを確認してください。

[`--open`または`server.open`](/ja/config/server-options.html#server-open)使用すると、Viteがアプリまたは提供されたURLのエントリポイントを自動的にウォームアップするため、パフォーマンスが向上します。

## より少ないまたはネイティブツールを使用します

成長するコードベースでViteを高速に保つことは、ソースファイル（JS/TS/CSS）の作業量を減らすことです。

より少ない仕事をする例:

- 可能な場合は、SASS/Less/Stylusの代わりにCSSを使用します（ネストはPostCSSによって処理できます）
- SVGSをUIフレームワークコンポーネント（React、Vueなど）に変換しないでください。代わりに文字列またはURLとしてインポートします。
- `@vitejs/plugin-react`使用する場合は、Babelオプションの構成を避けてください。これにより、ビルド中に変換がスキップされます（Esbuildのみが使用されます）。

ネイティブツールを使用する例:

ネイティブツールを使用すると、多くの場合、インストールサイズが大きくなることがよくあり、新しいViteプロジェクトを開始するときはデフォルトではありません。しかし、大規模なアプリケーションのコストに見合う価値があるかもしれません。

- [LightningCSS](https://github.com/vitejs/vite/discussions/13835)の実験的サポートをお試しください
- `@vitejs/plugin-react`の代わりに[`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc)使用します。
