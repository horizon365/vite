# env変数とモード

Viteは、特別な`import.meta.env`オブジェクトの下に特定の定数を公開します。これらの定数は、開発中のグローバル変数として定義され、ビルド時に静的に置き換えて、ツリーを効果的にします。

## 組み込み定数

すべての場合に組み込みの定数がいくつかあります。

- **`import.meta.env.MODE`** :{string}アプリが実行されている[モード](#modes)。

- **`import.meta.env.BASE_URL`** :{string}ベースURLアプリが提供されています。これは[、 `base` configオプション](/ja/config/shared-options.md#base)によって決定されます。

- **`import.meta.env.PROD`** :{boolean}アプリが生産で実行されているかどうか（ `NODE_ENV='production'`で開発者サーバーを実行するか、 `NODE_ENV='production'`で構築されたアプリを実行します）。

- **`import.meta.env.DEV`** :{boolean}アプリが開発中に実行されているかどうか（常に`import.meta.env.PROD`の反対）

- **`import.meta.env.SSR`** :{boolean}アプリが[サーバー](./ssr.md#conditional-logic)で実行されているかどうか。

## env変数

Viteは、文字列として自動的に文字列としてENV変数を`import.meta.env`オブジェクトの下に公開します。

誤ってENV変数がクライアントに漏れているのを防ぐために、 `VITE_`が付けられた変数のみがVite-Processedコードに公開されます。例:次のenv変数について:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

クライアントソースコードに`import.meta.env.VITE_SOME_KEY`として公開されるのは`VITE_SOME_KEY`のみですが、 `DB_PASSWORD`つに公開されません。

```js
console.log(import.meta.env.VITE_SOME_KEY) // 「123」
console.log(import.meta.env.DB_PASSWORD) // 未定義
```

ENV変数のプレフィックスをカスタマイズする場合は、 [Envprefix](/ja/config/shared-options.html#envprefix)オプションを参照してください。

:::tip Env parsing
上記のように、 `VITE_SOME_KEY`は数字ですが、解析すると文字列を返します。 Boolean Env変数についても同じことが起こります。コードで使用するときは、必ず目的のタイプに変換してください。
:::

### `.env`ファイル

Viteは[dotenv](https://github.com/motdotla/dotenv)を使用して、[環境ディレクトリ](/ja/config/shared-options.md#envdir)内の次のファイルから追加の環境変数をロードします。

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

:::tip Env Loading Priorities

特定のモードのENVファイル（ `.env.production` ）は、一般的なモード（例えば`.env` ）よりも優先度が高くなります。

Viteは、モード固有の`.env.[mode]`ファイルに加えて、常に`.env`と`.env.local`ロードします。モード固有のファイルで宣言された変数は、汎用ファイルのファイルよりも優先されますが、 `.env`または`.env.local`でのみ定義されている変数は環境で利用可能です。

さらに、Viteが実行されたときに既に存在する環境変数は最優先事項であり、 `.env`ファイルによって上書きされません。たとえば、実行する場合`VITE_SOME_KEY=123 vite build` 。

`.env`ファイルはViteの開始時にロードされます。変更を行った後にサーバーを再起動します。

:::

また、Viteは[dotenv-Expand](https://github.com/motdotla/dotenv-expand)を使用して、envファイルで記述された変数を箱から出して拡張します。構文の詳細については、[ドキュメント](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow)をご覧ください。

環境値内で`$`使用する場合は、 `\`で逃げる必要があることに注意してください。

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

:::warning SECURITY NOTES

- `.env.*.local`ファイルはローカルのみであり、機密変数を含めることができます。 Gitにチェックされないように、 `.gitignore`に`*.local`追加する必要があります。

- Viteソースコードに公開された変数は、クライアントバンドルに終わるため、 `VITE_*`変数には機密情報が含まれてはなりませ*ん*。

:::

::: details Expanding variables in reverse order

Viteは、変数の拡大を逆順序でサポートします。
たとえば、以下の`.env` `VITE_FOO=foobar`として評価されます`VITE_BAR=bar`

```[.env]
VITE_FOO=foo${VITE_BAR}
VITE_BAR=bar
```

これは、シェルスクリプトや`docker-compose`のような他のツールでは機能しません。
とはいえ、Viteはこの動作をサポートしています。これは長い間`dotenv-expand`でサポートされており、JavaScriptエコシステムの他のツールはこの動作をサポートする古いバージョンを使用します。

相互作用の問題を回避するには、この動作に依存しないようにすることをお勧めします。 Viteは、将来この動作に対する警告を発し始める可能性があります。

:::

## TypeScriptのIntellisense

デフォルトでは、Viteは1 in [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts)の`import.meta.env`のタイプ定義を提供します。 `.env.[mode]`ファイルでより多くのカスタムENV変数を定義できますが、 `VITE_`でプレフィックスされたユーザー定義のENV変数のTypeScript Intellisenseを取得することをお勧めします。

これを達成するために、 `src`ディレクトリ`vite-env.d.ts`を作成してから、次のように`ImportMetaEnv`拡張できます。

```typescript [vite-env.d.ts]
///<reference types="vite/client">

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // より多くのenv変数...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

コードが[DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts)や[WebWorker](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts)などのブラウザ環境のタイプに依存している場合、 [LIB](https://www.typescriptlang.org/tsconfig#lib)フィールドを`tsconfig.json`に更新できます。

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Imports will break type augmentation

`ImportMetaEnv`増強が機能しない場合は、 `vite-env.d.ts`に`import`ステートメントがないことを確認してください。詳細については、 [TypeScriptドキュメント](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined)を参照してください。

:::

## HTML定数交換

Viteは、HTMLファイルの定数の交換もサポートしています。 `import.meta.env`のプロパティは、特別な`%CONST_NAME%`構文を持つHTMLファイルで使用できます。

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

ENVが`import.meta.env` 、例えば`%NON_EXISTENT%`に存在しない場合、それは`undefined`と交換されるJSの`import.meta.env.NON_EXISTENT`とは異なり、無視され、交換されません。

Viteは多くのフレームワークで使用されていることを考えると、条件のような複雑な交換について意図的には感染していません。 Viteは[、既存のユーザーランドプラグイン](https://github.com/vitejs/awesome-vite#transformers)または[`transformIndexHtml`フック](./api-plugin#transformindexhtml)を実装するカスタムプラグインを使用して拡張できます。

## モード

デフォルトでは、DEVサーバー（ `dev`コマンド）は`development`モードで実行され、 `build`コマンドは`production`モードで実行されます。

これは、 `vite build`実行するときに、1つがある場合は`.env.production`からENV変数をロードすることを意味します。

```[.env.production]
VITE_APP_TITLE=My App
```

アプリでは、 `import.meta.env.VITE_APP_TITLE`を使用してタイトルをレンダリングできます。

場合によっては、別のモードで`vite build`実行して別のタイトルをレンダリングすることをお勧めします。 `--mode`オプションフラグを渡すことにより、コマンドに使用されるデフォルトモードを上書きできます。たとえば、ステージングモード用にアプリを構築する場合:

```bash
vite build --mode staging
```

`.env.staging`ファイルを作成します。

```[.env.staging]
VITE_APP_TITLE=My App (staging)
```

`vite build`デフォルトで制作ビルドを実行すると、これを変更して、別のモードと`.env`ファイル構成を使用して開発ビルドを実行することもできます。

```[.env.testing]
NODE_ENV=development
```

### node_envおよびモード

`NODE_ENV` （ `process.env.NODE_ENV` ）とモードは2つの異なる概念であることに注意することが重要です。異なるコマンドが`NODE_ENV`とモードにどのように影響するかは次のとおりです。

| 指示                                                 | node_env        | モード          |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

`NODE_ENV`とモードの異なる値は、対応する`import.meta.env`プロパティについても反映しています。

| 指示                   | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| 指示                 | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` in `.env` files

`NODE_ENV=...`コマンドで、また`.env`ファイルで設定できます。 `NODE_ENV` `.env.[mode]`ファイルで指定されている場合、モードを使用してその値を制御できます。ただし、 `NODE_ENV`とモードの両方が2つの異なる概念として残ります。

コマンドに`NODE_ENV=...`の主な利点は、Viteが値を早期に検出できることです。また、vite構成で`process.env.NODE_ENV`読み取ることができます。viteは、構成が評価された後にのみENVファイルを読み込むことができるためです。
:::
