---
title: Viteの構成
---

# Viteの構成

コマンドラインから`vite`実行すると、Viteは自動的に[プロジェクトルート](/ja/guide/#index-html-and-project-root)内の`vite.config.js`という名前の構成ファイルを解決しようとします（他のJSおよびTS拡張機能もサポートされています）。

最も基本的な構成ファイルは次のようになります:

```js [vite.config.js]
export default {
  // 構成オプション
}
```

注Viteは、プロジェクトがネイティブノードESMを使用していない場合でも、ESモジュールの構文`type: "module"`構成ファイルに使用してサポートします`package.json`この場合、構成ファイルはロード前に自動処理されます。

`--config` CLIオプションで使用する構成ファイルを明示的に指定することもできます（ `cwd`に対して解決されます）:

```bash
vite --config my-config.js
```

::: tip CONFIG LOADING
デフォルトでは、Viteは`esbuild`を使用して構成を一時ファイルにバンドルし、ロードします。これにより、MonorepoでTypeScriptファイルをインポートする際に問題が発生する可能性があります。このアプローチで問題が発生した場合は、代わりに[モジュールランナー](/ja/guide/api-environment-runtimes.html#modulerunner)を使用するために`--configLoader runner`指定できます。これは、一時的な構成を作成せず、その場でファイルを変換します。モジュールランナーは構成ファイルのCJSをサポートしていませんが、外部CJSパッケージは通常どおり機能するはずです。

または、TypeScript（EG `node --experimental-strip-types` ）をサポートする環境を使用している場合、またはPlane JavaScriptのみを書いている場合は、環境のネイティブランタイムを使用して構成ファイルをロードするために`--configLoader native`指定できます。構成ファイルによってインポートされたモジュールへの更新は検出されないため、Viteサーバーを自動再構築しないことに注意してください。
:::

## 構成IntelliSense

ViteはTypeScript Typingsを使用して出荷されるため、JSDOCタイプのヒントでIDEのIntelliSenseを活用できます。

```js
/** @type {import（ 'vite'）。userconfig} */
export default {
  // ...
}
```

または、JSDOCアノテーションを必要とせずにIntelliSenseを提供する必要がある`defineConfig`ヘルパーを使用できます。

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

ViteはTypeScript構成ファイルもサポートしています。上記の`defineConfig`ヘルパー関数、または`satisfies`演算子で`vite.config.ts`使用できます。

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## 条件付き設定

Configがコマンド（ `serve`または`build` ）に基づいてオプションを条件付けて決定する必要がある場合、使用されている[モード](/ja/guide/env-and-mode#modes)、SSRビルド（ `isSsrBuild` ）の場合、またはビルド（ `isPreview` ）の場合、代わりに関数をエクスポートできます。

```js twoslash
import { defineConfig } from 'vite'
//  - -カット - -
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // 開発固有の構成
    }
  } else {
    // コマンド=== 'ビルド'
    return {
      // 特定の構成を作成します
    }
  }
})
```

ViteのAPIでは、DEV（CLI [`vite`](/ja/guide/cli#vite) 、および`vite serve` `vite dev` ）の間は`command`値が`serve`で、生産用に構築されるときは`build`あることに注意することが重要です（ [`vite build`](/ja/guide/cli#vite-build) ）。

`isSsrBuild`と`isPreview` 、それぞれ`build`と`serve`コマンドの種類を区別するための追加のオプションフラグです。 Vite構成をロードするいくつかのツールは、これらのフラグをサポートせず、代わりに`undefined`渡す場合があります。したがって、 `true`と`false`に対する明示的な比較を使用することをお勧めします。

## async config

構成がASYNC関数を呼び出す必要がある場合、代わりに非同期関数をエクスポートできます。また、この非同期関数は、Intellisenseサポートを改善するために`defineConfig`に渡すこともできます。

```js twoslash
import { defineConfig } from 'vite'
//  - -カット - -
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // Vite Config
  }
})
```

## 構成の環境変数を使用します

環境変数は、通常どおり`process.env`から取得できます。

viteは、Vite構成を評価した後にのみ決定できるため、デフォルトで`.env`ファイルをロードしないことに注意してください。たとえば、 `root`と`envDir`オプションは負荷の動作に影響します。ただし、エクスポートされた`loadEnv`ヘルパーを使用して、必要に応じて特定の`.env`ファイルをロードできます。

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // 現在の作業ディレクトリの`mode`に基づいてENVファイルをロードします。
  // 3番目のパラメーターを ''に設定します。
  // `VITE_`プレフィックス。
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // Vite Config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
