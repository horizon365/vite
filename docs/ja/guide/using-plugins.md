# プラグインを使用します

Viteは、Rollupの適切に設計されたプラグインインターフェイスに基づいたプラグインを使用して拡張できます。これは、Viteユーザーがロールアッププラグインの成熟したエコシステムに頼ることができ、必要に応じてDEVサーバーとSSR機能を拡張することもできることを意味します。

## プラグインを追加します

プラグインを使用するには、プロジェクトの`devDependencies`に追加し、 `vite.config.js`構成ファイルの`plugins`配列に含まれる必要があります。たとえば、レガシーブラウザのサポートを提供するために、 [@vitejs/プラグインレガシー](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)を使用できます。

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

`plugins` 、単一の要素としていくつかのプラグインを含むプリセットも受け入れます。これは、複数のプラグインを使用して実装されている複雑な機能（フレームワーク統合など）に役立ちます。配列は内部的に平らになります。

Falsyプラグインは無視され、プラグインを簡単にアクティブ化または非アクティブ化するために使用できます。

## プラグインを見つける

:::tip NOTE
Viteは、一般的なWeb開発パターンにすぐに使用できるサポートを提供することを目指しています。 Viteまたは互換性のあるロールアッププラグインを検索する前に、[機能ガイド](../guide/features.md)をご覧ください。ロールアッププロジェクトでプラグインが必要になるケースの多くは、すでにViteでカバーされています。
:::

公式プラグインの詳細については、[プラグインセクション](../plugins/)をご覧ください。コミュニティプラグインは[Awesome-Vite](https://github.com/vitejs/awesome-vite#plugins)にリストされています。

また、Viteプラグイン用の[Vite-PluginのNPM検索](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity)、またはRollUpプラグインの[Rollup-PluginのNPM検索](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity)を使用して、[推奨コンベンション](./api-plugin.md#conventions)に従うプラグインを見つけることもできます。

## プラグインの注文を施行します

一部のロールアッププラグインとの互換性のために、プラグインの順序を実施するか、ビルド時にのみ適用する必要がある場合があります。これは、Viteプラグインの実装の詳細である必要があります。 `enforce`モディファイアを使用してプラグインの位置を実施できます。

- `pre` :Vite Coreプラグインの前にプラグインを呼び出します
- デフォルト:Vite Coreプラグインの後にプラグインを呼び出します
- `post` :Viteビルドプラグインの後にプラグインを呼び出します

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

詳細については、[プラグインAPIガイド](./api-plugin.md#plugin-ordering)をご覧ください。

## 条件付きアプリケーション

デフォルトでは、プラグインはサーブとビルドの両方に呼び出されます。プラグインをサーブまたはビルド中にのみ条件付きで適用する必要がある場合、 `apply`プロパティを使用して、 `'build'`または`'serve'`間にのみ呼び出します。

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## 建物のプラグイン

プラグインの作成に関するドキュメントについては、[プラグインAPIガイド](./api-plugin.md)をご覧ください。
