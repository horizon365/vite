# 環境API

:::warning Experimental
環境APIは実験的です。 Vite 6の間、APIを安定させて、生態系を実験し、その上に構築します。 Vite 7の潜在的な破壊変化を伴うこれらの新しいAPIを安定させることを計画しています。

リソース:

- 新しいAPIに関するフィードバックを収集している[フィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)。
- 新しいAPIが実装およびレビューされた[環境API PR](https://github.com/vitejs/vite/pull/16471) 。

フィードバックを私たちと共有してください。
:::

## 環境の形式化

Vite 6は、環境の概念を形式化します。 Vite 5まで、2つの暗黙的な環境がありました（ `client` 、およびオプションで`ssr` ）。新しい環境APIを使用すると、ユーザーとフレームワークの著者は、必要な数の環境を作成して、プロダクションでのアプリの動作方法をマッピングできます。この新しい機能には大きな内部リファクタリングが必要でしたが、後方互換性に多くの努力が払われています。 Vite 6の最初の目標は、エコシステムを可能な限りスムーズに新しい専攻に移動し、十分なユーザーが移行し、フレームワークとプラグインの著者が新しいデザインを検証するまで、これらの新しい実験APIの採用を遅らせることです。

## ビルドと開発の間のギャップを閉じます

単純なSPA/MPAの場合、環境の周りの新しいAPIは構成にさらされていません。内部的には、Viteはオプションを`client`環境に適用しますが、Viteを構成する際にこの概念を知る必要はありません。 Vite 5の構成と動作は、ここでシームレスに動作するはずです。

典型的なサーバー側のレンダリング（SSR）アプリに移動すると、2つの環境があります。

- `client` :ブラウザでアプリを実行します。
- `server` :ブラウザに送信する前にページをレンダリングするノード（または他のサーバーランタイム）でアプリを実行します。

DEVでは、VITEはVite Devサーバーと同じノードプロセスでサーバーコードを実行し、生産環境に密接な近似値を与えます。ただし、さまざまな制約を持つ[CloudFlareのWorkerD](https://github.com/cloudflare/workerd)のように、サーバーが他のJSランタイムで実行される可能性もあります。最新のアプリは、ブラウザ、ノードサーバー、エッジサーバーなど、2つ以上の環境で実行される場合があります。 Vite 5は、これらの環境を適切に表現することを許可しませんでした。

Vite 6を使用すると、ユーザーはビルド中および開発中にアプリを構成して、すべての環境をマッピングすることができます。開発中、単一のVite DEVサーバーを使用して、複数の異なる環境でコードを同時に実行できるようになりました。アプリソースコードは、Vite Devサーバーによって引き続き変換されます。共有HTTPサーバー、MiddleWares、Resolved Config、およびPlugins Pipelineの上に、Vite Dev Serverには独立したDEV環境のセットがあります。それらのそれぞれは、生産環境を可能な限り密接に一致させるように構成されており、コードが実行される開発時間に接続されています（WorkerDの場合、サーバーコードはMiniflareでローカルで実行できるようになりました）。クライアントでは、ブラウザがコードをインポートおよび実行します。他の環境では、モジュールランナーが変換されたコードを取得および評価します。

![Vite環境](../../images/vite-environments.svg)

## 環境構成

SPA/MPAの場合、構成はVite 5に似ています。内部的には、これらのオプションは`client`環境を構成するために使用されます。

```js
export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
})
```

これは重要です。なぜなら、私たちはViteを親しみやすく保ち、新しい概念が必要になるまで公開しないようにしたいからです。

アプリがいくつかの環境で構成されている場合、これらの環境は`environments`構成オプションで明示的に構成できます。

```js
export default {
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
}
```

明示的に文書化されていない場合、環境は構成されたトップレベルの構成オプションを継承します（たとえば、新しい`server`と`edge`環境は`build.sourcemap: false`オプションを継承します）。 `optimizeDeps`ような少数のトップレベルオプションは、デフォルトのサーバー環境に適用された場合にうまく機能しないため、 `client`環境にのみ適用されます。 `client`環境は`environments.client`で明示的に構成することもできますが、トップレベルのオプションでそれを行うことをお勧めします。これにより、クライアントの構成は新しい環境を追加するときに変更されません。

`EnvironmentOptions`インターフェイスは、すべての環境ごとのオプションを公開します。 `resolve`などの`build`と`dev`両方に適用される環境オプションがあります。 DEVには`DevEnvironmentOptions`と`BuildEnvironmentOptions`があり、特定のオプションを作成します（ `dev.warmup`または`build.outDir`など）。 `optimizeDeps`ようないくつかのオプションは開発にのみ適用されますが、後方互換性のために`dev`にネストされる代わりにトップレベルとして保持されます。

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

`UserConfig`インターフェイスは`EnvironmentOptions`インターフェイスから拡張され、 `environments`オプションを介して構成された他の環境のクライアントとデフォルトを構成できます。 `ssr`という名前の`client`およびサーバー環境は、開発中に常に存在します。これにより、 `server.ssrLoadModule(url)`および`server.moduleGraph`の後方互換性が可能になります。ビルド中、 `client`環境が常に存在し、 `ssr`環境が明示的に構成されている場合にのみ存在します（ `environments.ssr`または後方互換性`build.ssr`を使用）。アプリは、SSR環境に`ssr`名を使用する必要はありません。たとえば、 `server`にすることができます。

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // その他のオプション
}
```

## カスタム環境インスタンス

低レベルの構成APIが利用可能であるため、ランタイムプロバイダーは環境に適切なデフォルトを実行できるようにします。これらの環境は、生産環境に近いランタイムで開発中にモジュールを実行する他のプロセスまたはスレッドを生成することもできます。

```js
import { customEnvironment } from 'vite-environment-provider'

export default {
  build: {
    outDir: '/dist/client',
  },
  environments: {
    ssr: customEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
  },
}
```

## 後方互換性

現在のVite Server APIはまだ非推奨ではなく、Vite 5と後方互換性があります。新しい環境APIは実験的です。

`server.moduleGraph`は、クライアントとSSRモジュールグラフの混合ビューを返します。後方互換の混合モジュールノードは、そのすべての方法から返されます。同じスキームが`handleHotUpdate`に渡されたモジュールノードに使用されます。

環境APIへの切り替えはまだお勧めしません。プラグインが2つのバージョンを維持する必要がないように、Vite 6を採用するためにユーザーベースのかなりの部分を目指しています。将来の非推奨とアップグレードパスに関する情報については、将来のブレイキング変更セクションをチェックアウトします。

- [フックで`this.environment`](/ja/changes/this-environment-in-hooks)
- [HMR `hotUpdate`プラグインフック](/ja/changes/hotupdate-hook)
- [環境ごとのAPIに移動します](/ja/changes/per-environment-apis)
- [`ModuleRunner` APIを使用したSSR](/ja/changes/ssr-using-modulerunner)
- [ビルド中の共有プラグイン](/ja/changes/shared-plugins-during-build)

## ターゲットユーザー

このガイドは、エンドユーザーの環境に関する基本概念を提供します。

プラグインの著者は、現在の環境構成と対話するために、より一貫したAPIを利用できます。 Viteの上に構築されている場合、[環境APIプラグインガイド](./api-environment-plugins.md)ガイドは、複数のカスタム環境をサポートするために利用可能な拡張プラグインAPIを説明しています。

フレームワークは、さまざまなレベルで環境を公開することを決定できます。フレームワーク著者の場合は、[環境APIフレームワークガイド](./api-environment-frameworks)を読み続けて、環境APIプログラム側について学びます。

ランタイムプロバイダーの場合、[環境API Runtimesガイドは、](./api-environment-runtimes.md)フレームワークとユーザーによって消費されるカスタム環境を提供する方法について説明します。
