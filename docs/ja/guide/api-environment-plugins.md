# プラグインの環境API

:::warning Experimental
環境APIは実験的です。 Vite 6の間、APIを安定させて、生態系を実験し、その上に構築します。 Vite 7の潜在的な破壊変化を伴うこれらの新しいAPIを安定させることを計画しています。

リソース:

- 新しいAPIに関するフィードバックを収集している[フィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)。
- 新しいAPIが実装およびレビューされた[環境API PR](https://github.com/vitejs/vite/pull/16471) 。

フィードバックを私たちと共有してください。
:::

## フック内の現在の環境にアクセスします

Vite 6（ `client`および`ssr` ）まで環境が2つしかなかったことを考えると、 `ssr`ブール波はVite APIの現在の環境を識別するのに十分でした。プラグインフックは、最後のオプションパラメーターで`ssr`ブール値を受け取り、いくつかのAPIは、オプションの最後の`ssr`パラメーターを正しい環境に適切に関連付けることを期待していました（たとえば`server.moduleGraph.getModuleByUrl(url, { ssr })` ）。

構成可能な環境の出現により、プラグインにオプションとインスタンスにアクセスする均一な方法があります。プラグインフックはコンテキストで`this.environment`公開するようになり、以前に`ssr`ブール波を予想していたAPIが適切な環境にスコープされるようになりました（例`environment.moduleGraph.getModuleByUrl(url)` ）。

Viteサーバーには共有プラグインパイプラインがありますが、モジュールが処理されると、特定の環境のコンテキストで常に実行されます。 `environment`インスタンスは、プラグインコンテキストで使用できます。

プラグインは、 `environment`インスタンスを使用して、環境の構成に応じてモジュールの処理方法を変更できます（ `environment.config`使用してアクセスできます）。

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

## フックを使用して新しい環境を登録します

プラグインは、 `config`フックに新しい環境を追加できます（たとえば、 [RSC](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)用の個別のモジュールグラフがあります）:

```ts
  config(config: UserConfig) {
    config.environments.rsc ??= {}
  }
```

空のオブジェクトは、環境を登録するのに十分であり、ルートレベル環境構成からデフォルト値。

## フックを使用して環境の構成

`config`フックが実行されている間、環境の完全なリストはまだわからず、環境はルートレベル環境設定のデフォルト値の両方に影響を受けるか、 `config.environments`レコードを通じて明示的に影響を受ける可能性があります。
プラグインは、 `config`フックを使用してデフォルト値を設定する必要があります。各環境を構成するには、新しい`configEnvironment`フックを使用できます。このフックは、最終的なデフォルトの解像度を含む部分的に解決された構成を備えた各環境に呼び出されます。

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    if (name === 'rsc') {
      options.resolve.conditions = // ...
```

## `hotUpdate`フック

- **タイプ:** `（this:{環境:devenvironment}、option:hotupdateoptions）=> array<EnvironmentModuleNode> | 空所 | 約束<配列<EnvironmentModuleNode> | void> `
- **参照:** [HMR API](./api-hmr)

`hotUpdate`フックを使用すると、プラグインは特定の環境のカスタムHMR更新処理を実行できます。ファイルが変更されると、HMRアルゴリズムは`server.environments`の順序に応じて各環境に対して実行されるため、 `hotUpdate`フックは複数回呼び出されます。フックは、次の署名を持つコンテキストオブジェクトを受け取ります。

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

- `this.environment`は、ファイルの更新が現在処理されているモジュール実行環境です。

- `modules`は、変更されたファイルの影響を受けるこの環境のモジュールの配列です。単一のファイルが複数のサービスモジュール（vue SFCSなど）にマッピングできるため、これは配列です。

- `read` 、ファイルのコンテンツを返す非同期読み取り関数です。これは、一部のシステムでは、ファイルの変更コールバックがファイルの更新が完了する前に速すぎて、ダイレクト`fs.readFile`空のコンテンツを返すため、これが提供されます。渡された読み取り関数は、この動作を正常化します。

フックは次のことを選択できます。

- HMRがより正確になるように、影響を受けるモジュールリストをフィルターして絞り込みます。

- 空の配列を返し、完全なリロードを実行します。

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

    // モジュールを手動で無効にします
    const invalidatedModules = new Set()
    for (const mod of modules) {
      this.environment.moduleGraph.invalidateModule(
        mod,
        invalidatedModules,
        timestamp,
        true
      )
    }
    this.environment.hot.send({ type: 'full-reload' })
    return []
  }
  ```

- 空の配列を返し、クライアントにカスタムイベントを送信して、完全なカスタムHMR処理を実行します。

  ```js
  hotUpdate() {
    if (this.environment.name !== 'client')
      return

    this.environment.hot.send({
      type: 'custom',
      event: 'special-update',
      data: {}
    })
    return []
  }
  ```

  クライアントコードは、 [HMR API](./api-hmr)を使用して対応するハンドラーを登録する必要があります（これは、同じプラグインの`transform`フックで挿入できます）:

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // カスタムアップデートを実行します
    })
  }
  ```

## 環境ごとのプラグイン

プラグインは、 `applyToEnvironment`関数で適用すべき環境を定義できます。

```js
const UnoCssPlugin = () => {
  // 共有グローバル状態
  return {
    buildStart() {
      // nit environment persed beawmap <環境、データ>
      // This.Environmentを使用します
    },
    configureServer() {
      // 通常、グローバルフックを使用します
    },
    applyToEnvironment(environment) {
      // このプラグインがこの環境でアクティブである場合にtrueを返し、
      // または、新しいプラグインを返して置き換えます。
      // フックが使用されていない場合、プラグインはすべての環境でアクティブです
    },
    resolveId(id, importer) {
      // このプラグインが適用される環境にのみ呼び出されました
    },
  }
}
```

プラグインが環境を認識しておらず、現在の環境にキーを入れていない状態がある場合、 `applyToEnvironment`フックは環境ごとに簡単に作成できます。

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

Viteは`perEnvironmentPlugin`ヘルパーをエクスポートして、他のフックが不要なこれらのケースを簡素化します。

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

## ビルドフックの環境

開発中と同じように、プラグインフックはビルド中に環境インスタンスを受信し、 `ssr`ブール波を交換します。
これは`renderChunk` `generateBundle` 、およびその他のビルドフックでも機能します。

## ビルド中の共有プラグイン

Vite 6の前に、プラグインパイプラインは開発中に別の方法で機能しました。

- **開発中:**プラグインが共有されます
- **ビルド中:**各環境に対してプラグインが分離されます（異なるプロセス: `vite build`から`vite build --ssr` ）。

この強制フレームワークは、ファイルシステムに書き込まれたマニフェストファイルを介して、 `client`ビルドと`ssr`ビルドの間で状態を共有することを強制されました。 Vite 6では、プラグインのパイプラインと環境間通信をDEVと一致させる方法を1つのプロセスですべての環境を構築しています。

将来の専攻（Vite 7または8）では、完全な整合性を目指しています。

- **開発中とビルドの両方で:**[環境ごとのフィルタリング](#per-environment-plugins)でプラグインが共有されます

また、ビルド中に共有される単一の`ResolvedConfig`インスタンスもあり、DEV中に`WeakMap<ResolvedConfig, CachedData>`で行っていたのと同じように、アプリビルドプロセスレベル全体でキャッシュできます。

Vite 6の場合、後方の互換性を維持するために、より小さなステップを実行する必要があります。エコシステムプラグインは現在、 `environment.config.build`代わりに`config.build`を使用して構成にアクセスしているため、デフォルトで新しい2つの環境ごとに新しい`ResolvedConfig`環境を作成する必要があります。プロジェクトは、完全な構成とプラグインのパイプライン設定`builder.sharedConfigBuild` `true`をオプトインできます。

このオプションは、最初はプロジェクトの小さなサブセットのみの作品のみであるため、プラグインの著者は、 `sharedDuringBuild`フラグを`true`に設定することで共有される特定のプラグインをオプトインできます。これにより、通常のプラグインの両方でStateを簡単に共有できます。

```js
function myPlugin() {
  // 開発とビルドのすべての環境の中で状態を共有します
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // すべての環境の単一のインスタンスにオプトインします
    sharedDuringBuild: true,
  }
}
```
