# はじめる

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## 概要

Vite (French word for "quick", pronounced `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>, like "veet") is a build tool that aims to provide a faster and leaner development experience for modern web projects. It consists of two major parts:

- たとえば、非常に高速な[ホットモジュール交換（HMR）](./features#hot-module-replacement)など、[ネイティブESモジュール](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)よりも[リッチな機能拡張機能](./features)を提供する開発サーバー。

- [ロールアップ](https://rollupjs.org)でコードをバンドルするビルドコマンド。

Viteは意見があり、箱から出して賢明なデフォルトが付属しています。[機能ガイド](./features)で何が可能かについて読んでください。フレームワークのサポートまたは他のツールとの統合は、[プラグイン](./using-plugins)を介して可能です。[構成セクションで](../config/)は、必要に応じてViteをプロジェクトに適応させる方法について説明します。

Viteは、完全なタイピングサポートを備えた[プラグインAPI](./api-plugin)および[JavaScript API](./api-javascript)を介して非常に拡張可能です。

[Why Vite](./why)セクションのプロジェクトの背後にある根拠について詳しく知ることができます。

## ブラウザのサポート

開発中、Viteは[`esnext`変換ターゲットとして](https://esbuild.github.io/api/#target)設定します。これは、最新のブラウザーが使用されており、最新のJavaScriptおよびCSS機能をすべてサポートすると仮定しているためです。これにより、構文の低下が防止され、Viteがモジュールを元のソースコードにできるだけ近いことを提供します。

生産ビルドのために、デフォルトでは、[ネイティブESモジュール](https://caniuse.com/es6-module)、[ネイティブESMダイナミックインポート](https://caniuse.com/es6-module-dynamic-import)、 [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) 、 [Nullish Coulescing](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) 、 [Bigint](https://caniuse.com/bigint)など、最新のJavaScriptをサポートするVite Targetsブラウザー。レガシーブラウザは[、 @Vitejs/Plugin-Legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)を介してサポートできます。詳細については、[生産セクションの建物](./build)をご覧ください。

## オンラインでviteを試してみます

[Stackblitz](https://vite.new/)でオンラインでViteを試すことができます。ブラウザでViteベースのビルドセットアップを直接実行するため、ローカルセットアップとほぼ同じですが、マシンに何かをインストールする必要はありません。 `vite.new/{template}`に移動して、使用するフレームワークを選択できます。

サポートされているテンプレートプリセットは次のとおりです。

|              JavaScript              |             タイプスクリプト             |
| :----------------------------------: | :--------------------------------------: |
|  [バニラ](https://vite.new/vanilla)  | [バニラ-ts](https://vite.new/vanilla-ts) |
|     [vue](https://vite.new/vue)      |    [vue-ts](https://vite.new/vue-ts)     |
| [反応します](https://vite.new/react) |  [React-ts](https://vite.new/react-ts)   |
| [プアクト](https://vite.new/preact)  | [PREACT-TS](https://vite.new/preact-ts)  |
|     [点灯](https://vite.new/lit)     |    [lit-ts](https://vite.new/lit-ts)     |
|  [svelte](https://vite.new/svelte)   | [svelte-ts](https://vite.new/svelte-ts)  |
|    [固体](https://vite.new/solid)    |    [固体](https://vite.new/solid-ts)     |
|    [qwik](https://vite.new/qwik)     |   [qwik-ts](https://vite.new/qwik-ts)    |

## 最初のViteプロジェクトの足場

::: tip Compatibility Note
Viteには[node.js](https://nodejs.org/ja/)バージョン18+または20+が必要です。ただし、一部のテンプレートでは、より高いnode.jsバージョンが機能する必要があります。パッケージマネージャーが警告している場合はアップグレードしてください。
:::

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

次に、プロンプトに従ってください！

また、追加のコマンドラインオプションを介して使用するプロジェクト名とテンプレートを直接指定することもできます。たとえば、Vite + Vueプロジェクトを足場にするには、実行してください。

::: code-group

```bash [npm]
# NPM 7+、追加のダブルダッシュが必要です:
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

サポートされて`react-ts`各`react`の詳細`react-swc-ts`は`lit-ts` [Create-Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) `qwik` `preact-ts` `vanilla` `lit` `vue` `react-swc` `vue-ts` `vanilla-ts` 、 `svelte` 、 `svelte-ts` 、 `solid` 、 `solid-ts` 、 `qwik-ts` `preact`

プロジェクト名に`.`使用して、現在のディレクトリの足場になります。

## コミュニティテンプレート

Create-Viteは、一般的なフレームワークの基本テンプレートからプロジェクトをすばやく開始するツールです。他のツールやターゲットの異なるフレームワークを含む[コミュニティの維持テンプレート](https://github.com/vitejs/awesome-vite#templates)のAwesome Viteをご覧ください。

`https://github.com/user/project`のテンプレートの場合、 `https://github.stackblitz.com/user/project` （プロジェクトのURLに`github`後に`.stackblitz`追加）を使用してオンラインで試してみることができます。

[Degit](https://github.com/Rich-Harris/degit)などのツールを使用して、テンプレートの1つでプロジェクトを足場にすることもできます。プロジェクトがGitHubにあり、デフォルトのブランチとして`main`を使用していると仮定すると、以下を使用してローカルコピーを作成できます。

```bash
npx degit user/project#メインマイプロジェクト
cd my-project

npm install
npm run dev
```

## 手動インストール

プロジェクトでは、以下を使用して`vite` CLIをインストールできます。

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

次のような`index.html`ファイルを作成します。

```html
<p>Hello Vite!</p>
```

次に、ターミナルで適切なCLIコマンドを実行します。

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

:::

`index.html`は`http://localhost:5173`に提供されます。

## `index.html`およびプロジェクトルート

気づいたかもしれないことの1つは、Viteプロジェクトでは、 `index.html` `public`内に押し出されるのではなく、最前線と中心部であるということです。これは意図的です。開発中はViteはサーバーであり、 `index.html`アプリケーションへのエントリポイントです。

静的HTTPサーバーと同様に、Viteにはファイルが提供される「ルートディレクトリ」の概念があります。残りのドキュメント全体で`<root>`と呼ばれることがわかります。ソースコードの絶対URLは、プロジェクトルートをベースとして使用して解決されるため、通常の静的ファイルサーバーを使用しているかのようにコードを記述できます（より強力です！）。 Viteは、ルート外のファイルシステムの場所に解決する依存関係を処理することもできます。これにより、モノレポベースのセットアップでも使用可能になります。

Viteは、複数の`.html`エントリポイントを持つ[マルチページアプリ](./build#multi-page-app)もサポートしています。

#### 代替ルートの指定

`vite`実行すると、現在の作業ディレクトリをルートとして使用してDEVサーバーを起動します。 `vite serve some/sub/dir`で代替ルートを指定できます。
Viteはプロジェクトルート内の[構成ファイル（すなわち`vite.config.js` ）](/ja/config/#configuring-vite)を解決するため、ルートが変更された場合は移動する必要があることに注意してください。

## コマンドラインインターフェイス

Viteがインストールされているプロジェクトでは、NPMスクリプトで`vite`バイナリを使用するか、 `npx vite`で直接実行できます。足場のViteプロジェクトのデフォルトのNPMスクリプトは次のとおりです。

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

`--port`または`--open`の追加のCLIオプションを指定できます。 CLIオプションの完全なリストについては、プロジェクトで`npx vite --help`実行してください。

[コマンドラインインターフェイス](./cli.md)の詳細をご覧ください

## 未発表のコミットを使用します

最新の機能をテストするための新しいリリースが待ちきれない場合は、https://pkg.pr.newでViteの特定のコミットをインストールできます。

::: code-group

```bash [npm]
$ npm install -D https://pkg.pr.new/vite@SHA
```

```bash [Yarn]
$ yarn add -D https://pkg.pr.new/vite@SHA
```

```bash [pnpm]
$ pnpm add -D https://pkg.pr.new/vite@SHA
```

```bash [Bun]
$ bun add -D https://pkg.pr.new/vite@SHA
```

:::

`SHA` [ViteのCommit Shasの](https://github.com/vitejs/vite/commits/main/)いずれかに置き換えます。古いコミットリリースがパージされているため、先月内にのみコミットが機能することに注意してください。

または、 [Vite Repo](https://github.com/vitejs/vite)をローカルマシンにクローンしてから自分で構築およびリンクすることもできます（ [PNPM](https://pnpm.io/)が必要です）。

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # このステップには、お好みのパッケージマネージャーを使用してください
```

次に、Viteベースのプロジェクトに移動して、 `pnpm link --global vite` （またはグローバルに`vite`リンクしていたパッケージマネージャー）を実行します。開発サーバーを再起動して、出血エッジに乗ってください！

::: tip Dependencies using Vite
依存関係によって使用されるViteバージョンを交換して置き換えるには、 [NPMオーバーライド](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides)または[PNPMオーバーライド](https://pnpm.io/package_json#pnpmoverrides)を使用する必要があります。
:::

## コミュニティ

質問がある場合、または助けが必要な場合は、 [Discord](https://chat.vite.dev)と[Githubの議論](https://github.com/vitejs/vite/discussions)でコミュニティに連絡してください。
