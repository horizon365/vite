# バックエンド統合

:::tip Note
従来のバックエンド（Rails、Laravelなど）を使用してHTMLを提供するが、資産を提供するためにViteを使用する場合は、 [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends)にリストされている既存の統合を確認してください。

カスタム統合が必要な場合は、このガイドの手順に従って手動で構成できます
:::

1. Vite構成で、エントリを構成し、ビルドマニフェストを有効にします。

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   //  - -カット - -
   export default defineConfig({
     server: {
       cors: {
         // ブラウザ経由でアクセスするオリジン
         origin: 'http://my-backend.example.com',
       },
     },
     build: {
       // oututdirで.vite/manifest.jsonを生成します
       manifest: true,
       rollupOptions: {
         // デフォルト.htmlエントリを上書きします
         input: '/path/to/main.js',
       },
     },
   })
   ```

   [モジュールのプリロードポリフィルを](/ja/config/build-options.md#build-polyfillmodulepreload)無効にしていない場合は、エントリにポリフィルをインポートする必要があります

   ```js
   // アプリエントリの開始を追加します
   import 'vite/modulepreload-polyfill'
   ```

2. 開発のために、サーバーのHTMLテンプレートに以下を挿入します（ローカルURL Viteが実行されている0の代わりに`http://localhost:5173` ）。

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   資産を適切に提供するために、2つのオプションがあります。

   - サーバーがviteサーバーに静的資産要求をプロキシに構成されていることを確認してください
   - 生成された資産URLが相対パスの代わりにバックエンドサーバーURLを使用して解決されるように[`server.origin`](/ja/config/server-options.md#server-origin)設定します

   これは、画像などの資産が適切にロードされるために必要です。

   注Reactを`@vitejs/plugin-react`で使用している場合は、上記のスクリプトの前にこれを追加する必要があります。プラグインは、提供するHTMLを変更できないためです（ローカルURL Viteが実行されている1つの代わりに`http://localhost:5173`を実行します）。

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. 生産の場合: `vite build`実行した後、 `.vite/manifest.json`ファイルが他のアセットファイルとともに生成されます。マニフェストファイルの例は次のようになります。

   ```json [.vite/manifest.json]
   {
     "_shared-B7PI925R.js": {
       "file": "assets/shared-B7PI925R.js",
       "name": "shared",
       "css": ["assets/shared-ChJ_j-JJ.css"]
     },
     "_shared-ChJ_j-JJ.css": {
       "file": "assets/shared-ChJ_j-JJ.css",
       "src": "_shared-ChJ_j-JJ.css"
     },
     "baz.js": {
       "file": "assets/baz-B2H3sXNv.js",
       "name": "baz",
       "src": "baz.js",
       "isDynamicEntry": true
     },
     "views/bar.js": {
       "file": "assets/bar-gkvgaI9m.js",
       "name": "bar",
       "src": "views/bar.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "dynamicImports": ["baz.js"]
     },
     "views/foo.js": {
       "file": "assets/foo-BRBmoGS9.js",
       "name": "foo",
       "src": "views/foo.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "css": ["assets/foo-5UjPuW-k.css"]
     }
   }
   ```

   - マニフェストの構造は`Record<name, chunk>`です
   - エントリまたはダイナミックなエントリチャンクの場合、キーはプロジェクトルートからの相対的なSRCパスです。
   - 非エントリチャンクの場合、キーは`_`が付けられた生成されたファイルのベース名です。
   - [`build.cssCodeSplit`](/ja/config/build-options.md#build-csscodesplit) `false`場合に生成されたCSSファイルの場合、キーは`style.css`です。
   - チャンクには、静的および動的なインポートに関する情報が含まれます（両方とも、マニフェストの対応するチャンクにマッピングされるキーです）、および対応するCSSおよびアセットファイル（存在する場合）も含まれます。

4. このファイルを使用して、リンクをレンダリングしたり、ハッシュされたファイル名でリンクをプリロードしたりできます。

   適切なリンクをレンダリングするためのHTMLテンプレートの例を次に示します。ここの構文は向上しています
   説明のみ、サーバーのテンプレート言語を使用してください。 `importedChunks`
   機能はイラスト用であり、Viteによって提供されません。

   ```html
   <!-- if production -->

   <!-- for cssFile of manifest[name].css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <!-- for chunk of importedChunks(manifest, name) -->
   <!-- for cssFile of chunk.css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <script type="module" src="/{{ manifest[name].file }}"></script>

   <!-- for chunk of importedChunks(manifest, name) -->
   <link rel="modulepreload" href="/{{ chunk.file }}" />
   ```

   具体的には、HTMLを生成するバックエンドには、マニフェストが与えられた次のタグを含める必要があります
   ファイルとエントリポイント:

   - エントリポイントChunkの`css`リストの各ファイルの`<link rel="stylesheet">`タグ
   - エントリポイントの`imports`リストのすべてのチャンクを再帰的に追跡し、
     インポートされた各チャンクの各CSSファイルの`<link rel="stylesheet">`タグ。
   - エントリポイントチャンクの`file`キーのタグ（ `<script type="module">`の場合、
     または`<link rel="stylesheet">`の場合）
   - オプションで、インポートされた各JavaScriptの`<link rel="modulepreload">` `file`のタグ
     チャンクは、エントリポイントチャンクから始まる輸入に続いて再帰的に再帰的に。

   上記の例に従って、エントリポイント`views/foo.js`については、次のタグを生産に含める必要があります。

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   エントリポイント`views/bar.js`には以下を含める必要があります。

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details Pseudo implementation of `importedChunks`
   タイプスクリプトの`importedChunks`の擬似実装の例（これは
   プログラミング言語とテンプレート言語に適応する必要があります）:

   ```ts
   import type { Manifest, ManifestChunk } from 'vite'

   export default function importedChunks(
     manifest: Manifest,
     name: string,
   ): ManifestChunk[] {
     const seen = new Set<string>()

     function getImportedChunks(chunk: ManifestChunk): ManifestChunk[] {
       const chunks: ManifestChunk[] = []
       for (const file of chunk.imports ?? []) {
         const importee = manifest[file]
         if (seen.has(file)) {
           continue
         }
         seen.add(file)

         chunks.push(...getImportedChunks(importee))
         chunks.push(importee)
       }

       return chunks
     }

     return getImportedChunks(manifest[name])
   }
   ```

   :::
