# トラブルシューティング

詳細については、 [Rollupのトラブルシューティングガイド](https://rollupjs.org/troubleshooting/)も参照してください。

ここでの提案が機能しない場合は、 [GitHubのディスカッション](https://github.com/vitejs/vite/discussions)や[Vite Landの不一致](https://chat.vite.dev)の`#help`チャンネルに質問を投稿してみてください。

## CJS

### Vite CJSノードAPIが非推奨

ViteのノードAPIのCJSビルドは廃止されており、Vite 6で削除されます。詳細については、 [GitHubディスカッション](https://github.com/vitejs/vite/discussions/13928)を参照してください。代わりに、ファイルまたはフレームワークを更新して、ViteのESMビルドをインポートする必要があります。

基本的なViteプロジェクトでは、確認してください。

1. `vite.config.js`ファイルコンテンツはESM構文を使用しています。
2. 最も近い`package.json`ファイルには`"type": "module"`あります。または、 `.mjs` / `.mts`拡張機能（ `vite.config.mjs`または`vite.config.mts`を使用します。

他のプロジェクトには、いくつかの一般的なアプローチがあります。

- **ESMをデフォルトとして構成し、必要に応じてCJSにオプトインします。**プロジェクト`package.json`に`"type": "module"`を追加します。 `*.js`のファイルはすべてESMとして解釈され、ESM構文を使用する必要があります。代わりにCJSを使用し続けるために、 `.cjs`拡張機能でファイルの名前を変更できます。
- **CJSをデフォルトとして保持し、必要に応じてESMにオプトインします。**プロジェクト`package.json`に`"type": "module"`ない場合、 `*.js`ファイルはすべてCJSとして解釈されます。代わりにESMを使用する`.mjs`拡張機能でファイルの名前を変更できます。
- **動的にViteをインポートする:** CJを使用し続ける必要がある場合は、代わりに`import('vite')`使用して動的にViteをインポートできます。これには、コードを`async`コンテキストで記述する必要がありますが、ViteのAPIはほとんど非同期であるため、管理可能である必要があります。

警告がどこから来ているのかわからない場合は、 `VITE_CJS_TRACE=true`フラグでスクリプトを実行して、スタックトレースをログに記録できます。

```bash
VITE_CJS_TRACE=true vite dev
```

警告を一時的に無視したい場合は、 `VITE_CJS_IGNORE_WARNING=true`フラグでスクリプトを実行できます。

```bash
VITE_CJS_IGNORE_WARNING=true vite dev
```

PostCSS構成ファイルは、ESM + TypeScript（ `.mts`または`.ts` in `"type": "module"` ）をまだサポートしていないことに注意してください。 Package.jsonに`.ts`と`"type": "module"`追加し、4を追加したPostCSS構成がある場合は、PostCSS構成を`.cts`使用するように変更する必要があります。

## cli

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

プロジェクトフォルダーへのパスには`&`が含まれている場合があります。これは、Windows（ [npm/cmd-shim＃45](https://github.com/npm/cmd-shim/issues/45) ）で`npm`で動作しません。

どちらも必要です:

- 別`yarn`パッケージマネージャーに切り替えます（例: `pnpm` ）
- プロジェクトへのパスから`&`を削除します

## config

### このパッケージはESMのみです

ESMのみパッケージを`require`でインポートすると、次のエラーが発生します。

> 「foo」の解決に失敗しました。このパッケージはESMのみですが、 `require`でロードしようとしました。

> error [err_require_esm]:sequire（）of es（）of es（）of ess module/to/dependency.js from /to/to/vite.config.jsはサポートされていません。
> 代わりに、index.js in/path/to/vite.config.jsの要件をすべてのCommonJSモジュールで使用できる動的なインポート（）に変更します。

node.js <= 22では、ESMファイルをデフォルトで[`require`](https://nodejs.org/docs/latest-v22.x/api/esm.html#require)でロードすることはできません。

[`--experimental-require-module`](https://nodejs.org/docs/latest-v22.x/api/modules.html#loading-ecmascript-modules-using-require) 、またはnode.js> 22、または他のランタイムでは動作する場合がありますが、どちらでも構成をESMに変換することをお勧めします。

- 最も近い`package.json`に`"type": "module"`追加します
- `vite.config.js`から`vite.config.mjs` `vite.config.mts` `vite.config.ts`変更

### `failed to load config from '/path/to/config*/vite.config.js'`

> '/path/to/config\*/vite.config.jsから構成をロードできませんでした
> DEVサーバーを起動するときのエラー:
> エラー:1つのエラーでビルドが失敗しました:
> エラー:複数の入力ファイルがある場合は、「oututdir」を使用する必要があります

プロジェクトフォルダーへのパスに`*`が含まれている場合、上記のエラーが発生する可能性があります。 `*`削除するには、ディレクトリの名前を変更する必要があります。

## 開発サーバー

### リクエストは永遠に失速します

Linuxを使用している場合、ファイル記述子の制限と制限を開始している可能性があります。 Viteはほとんどのファイルをバンドルしないため、ブラウザは多くのファイル記述子を必要とする多くのファイルを要求し、制限を超えています。

これを解決するには:

- ファイル記述子の制限を`ulimit`増加させます

  ```shell
  # 現在の制限を確認してください
  $ ulimit -Sn
  # 変更制限（一時的）
  $ ulimit -Sn 10000 # ハード制限も変更する必要があるかもしれません
  # ブラウザを再起動します
  ```

- 次のInotify関連制限を`sysctl`に増やします

  ```shell
  # 現在の制限を確認してください
  $ sysctl fs.inotify
  # 変更制限（一時的）
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

上記の手順が機能しない場合は、次のファイルに`DefaultLimitNOFILE=65536`構成されていない構成として追加してみてください。

- /etc/systemd/system.conf
- /etc/systemd/user.conf

Ubuntu Linuxの場合、SystemD構成ファイルを更新する代わりに、行`* - nofile 65536`ファイル`/etc/security/limits.conf`に追加する必要がある場合があります。

これらの設定は持続しますが、**再起動が必要であること**に注意してください。

または、サーバーがVSコードDevContainer内で実行されている場合、リクエストが停止しているように見える場合があります。この問題を修正するには、参照してください
[開発コンテナ /対コードポート転送](#dev-containers-vs-code-port-forwarding)。

### ネットワークリクエストは読み込みを停止します

自己署名のSSL証明書を使用する場合、Chromeはすべてのキャッシュ指令を無視し、コンテンツをリロードします。 Viteはこれらのキャッシュ指令に依存しています。

問題を解決するには、信頼できるSSL証明書を使用してください。

参照:[キャッシュの問題](https://helpx.adobe.com/mt/experience-manager/kb/cache-problems-on-chrome-with-SSL-certificate-errors.html)、 [Chromeの問題](https://bugs.chromium.org/p/chromium/issues/detail?id=110649#c8)

#### macos

このコマンドを使用して、CLI経由で信頼できる証明書をインストールできます。

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

または、それをキーチェーンアクセスアプリにインポートし、証明書の信頼を「常に信頼」に更新することにより。

### 431ヘッダーフィールドが大きすぎます

サーバー / Websocketサーバーが大きなHTTPヘッダーを受信すると、リクエストが削除され、次の警告が表示されます。

> サーバーはステータスコード431で応答しました。https [://vite.dev/guide/troubleshooting.html#\_431-request-header-fields-too-large](https://vite.dev/guide/troubleshooting.html#_431-request-header-fields-too-large)を参照してください。

これは、node.jsが[CVE-2018-12121](https://www.cve.org/CVERecord?id=CVE-2018-12121)を緩和するためにリクエストヘッダーサイズを制限するためです。

これを回避するには、リクエストヘッダーサイズを削減してみてください。たとえば、Cookieが長い場合は、削除します。または、 [`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize)使用して最大ヘッダーサイズを変更できます。

### 開発コンテナ /対コードポート転送

VSコードで開発コンテナまたはポート転送機能を使用している場合は、機能を機能させるために構成の`127.0.0.1`に[`server.host`](/ja/config/server-options.md#server-host)オプションを設定する必要があります。

これは[、VSコードのポート転送機能がIPv6をサポートしていない](https://github.com/microsoft/vscode-remote-release/issues/7029)ためです。

詳細については、 [＃16522](https://github.com/vitejs/vite/issues/16522)を参照してください。

## HMR

### Viteはファイルの変更を検出しますが、HMRは機能していません

別のケースでファイルをインポートしている可能性があります。たとえば、 `src/foo.js`が存在し、 `src/bar.js`には次のものが含まれます。

```js
import './Foo.js' // './foo.js'
```

関連問題: [＃964](https://github.com/vitejs/vite/issues/964)

### Viteはファイルの変更を検出しません

WSL2でViteを実行している場合、Viteは一部の条件でファイルの変更を視聴できません。 [`server.watch`オプション](/ja/config/server-options.md#server-watch)を参照してください。

### HMRの代わりに完全なリロードが発生します

HMRがViteまたはプラグインによって処理されない場合、状態を更新する唯一の方法であるため、完全なリロードが発生します。

HMRが処理されているが、それが円形の依存関係の範囲内である場合、完全なリロードも実行命令を回復するために偶然になります。これを解決するには、ループを壊してみてください。 `vite --debug hmr`実行して、ファイルが変更された場合に円形の依存関係パスをログに記録できます。

## 建てる

### CORSエラーのため、構築されたファイルは機能しません

HTMLファイル出力が`file`プロトコルで開かれた場合、スクリプトは次のエラーで実行されません。

> 「file:///foo/bar.js」からスクリプトへのアクセスは、corsポリシーによってブロックされています。クロスオリジンリクエストは、プロトコルスキームでのみサポートされています。

> クロスオリジン要求がブロックされました:同じオリジンポリシーは、ファイルのリモートリソースを読み取ることを許可しません:///foo/bar.js。 （理由:CORSリクエストはHTTPではありません）。

[理由:CORS要求はHTTP -HTTPではなくリクエストを参照してください | mdn]（ [https://developer.mozilla.org/en-us/docs/web/http/cors/errors/corsrequestnothttp](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) ）これが起こる理由の詳細については。

`http`プロトコルでファイルにアクセスする必要があります。これを達成する最も簡単な方法は、 `npx vite preview`実行することです。

## 最適化された依存関係

### ローカルパッケージにリンクするとき、時代遅れの事前にバンドルされたDEP

最適化された依存関係を無効にするために使用されるハッシュキーは、パッケージロックの内容、依存関係に適用されるパッチ、およびノードモジュールのバンドルに影響するVite構成ファイルのオプションに依存します。これは[、NPMのオーバーライド](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)として機能を使用して依存関係がオーバーライドされたときにViteが検出され、次のサーバーの開始で依存関係を再バンディングすることを意味します。 [NPMリンク](https://docs.npmjs.com/cli/v9/commands/npm-link)などの機能を使用すると、Viteは依存関係を無効にしません。依存関係をリンクまたはリンクする場合は、 `vite --force`使用することにより、次のサーバーの開始を強制的に最適化する必要があります。代わりに、すべてのパッケージマネージャーによってサポートされているOverridesを使用することをお勧めします（ [PNPM Overrides](https://pnpm.io/package_json#pnpmoverrides)と[Yarn解像度](https://yarnpkg.com/configuration/manifest/#resolutions)も参照してください）。

## パフォーマンスボトルネック

アプリケーションパフォーマンスのボトルネックに耐えて負荷時間が遅い場合は、vite devサーバーを使用して組み込みのnode.jsインスペクターを起動するか、アプリケーションを構築してCPUプロファイルを作成する場合があります。

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite Dev Server
ブラウザでアプリケーションが開かれたら、それを終了してからターミナルに戻り、 `p`キー（node.jsインスペクターを停止します）に戻り、 `q`キーを押して開発サーバーを停止します。
:::

node.jsインスペクターは、ルートフォルダーで`vite-profile-0.cpuprofile`を生成し、 [https://www.speedscope.app/](https://www.speedscope.app/)に移動し、 `BROWSE`ボタンを使用してCPUプロファイルをアップロードして結果を検査します。

[Vite-Plugin-Inspect](https://github.com/antfu/vite-plugin-inspect)をインストールすることができます。これにより、Viteプラグインの中間状態を検査することができ、アプリケーションのボトルネックであるプラグインまたはミドルウェアを特定することもできます。プラグインは、開発モードとビルドモードの両方で使用できます。詳細については、readmeファイルを確認してください。

## その他

### ブラウザの互換性のために外部化されたモジュール

ブラウザでnode.jsモジュールを使用すると、Viteは次の警告を出力します。

> モジュール「FS」は、ブラウザの互換性のために外部化されています。クライアントコードで「fs.readfile」にアクセスできません。

これは、viteが自動的にポリフィルnode.jsモジュールではないためです。

バンドルサイズを縮小するために、ブラウザコードのnode.jsモジュールを回避することをお勧めしますが、ポリフィルを手動で追加できます。モジュールがサードパーティライブラリからインポートされている場合（ブラウザで使用することを目的としています）、問題をそれぞれのライブラリに報告することをお勧めします。

### 構文エラー /タイプエラーが発生します

Viteは処理できず、非ストリクトモードでのみ実行されるコード（Sloppy Mode）をサポートしません。これは、ViteがESMを使用しており、ESM内の常に[厳密なモード](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)であるためです。

たとえば、これらのエラーが表示される場合があります。

> [エラー] Strictモードのために「ESM」出力形式でステートメントを使用することはできません

> TypeRror:ブールの「false」でプロパティ「foo」を作成できません

これらのコードが依存関係内で使用されている場合、エスケープハッチに[`patch-package`](https://github.com/ds300/patch-package) （または[`yarn patch`](https://yarnpkg.com/cli/patch)または[`pnpm patch`](https://pnpm.io/cli/patch) ）を使用できます。

### ブラウザ拡張機能

一部のブラウザ拡張機能（広告ブロッカーなど）は、ViteクライアントがVite Devサーバーにリクエストを送信できない場合があります。この場合、ログが記録されていない白い画面が表示される場合があります。この問題がある場合は、拡張機能を無効にしてみてください。

### Windowsのクロスドライブリンク

Windowsのプロジェクトにクロスドライブリンクがある場合、Viteが機能しない場合があります。

クロスドライブリンクの例は次のとおりです。

- `subst`コマンドでフォルダにリンクされた仮想ドライブ
- `mklink`コマンドによる別のドライブへのシンブリンク/ジャンクション（例:YARNグローバルキャッシュ）

関連問題: [＃10802](https://github.com/vitejs/vite/issues/10802)
