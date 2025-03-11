# DEP最適化オプション

- **関連:**[依存関係の事前バンドル](/ja/guide/dep-pre-bundling)

記載されていない限り、このセクションのオプションは、DEVでのみ使用される依存関係者にのみ適用されます。

## optimizeDeps.entries

- **タイプ:** `文字列 | 文字列[] `

デフォルトでは、Viteはすべての`.html`ファイルをクロールして`coverage`事前にバンドルする必要がある依存関係を検出します（ `node_modules` 、および`__tests__` `build.outDir`無視します）。 `build.rollupOptions.input`が指定されている場合、Viteは代わりにそれらのエントリポイントをクロールします。

どちらもあなたのニーズに合っていない場合、このオプションを使用してカスタムエントリを指定できます - 値は、Vite Project Rootの相対的なパターンの[`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby)または配列でなければなりません。これにより、デフォルトのエントリの推論が上書きされます。 `optimizeDeps.entries`明示的に定義されている場合、デフォルトでは`node_modules`つと`build.outDir`フォルダーのみが無視されます。他のフォルダーを無視する必要がある場合は、最初の`!`でマークされたエントリリストの一部として無視パターンを使用できます。 `node_modules`と`build.outDir`無視したくない場合は、代わりにリテラルストリングパス（ `tinyglobby`パターンなし）を使用して指定できます。

## optimizeDeps.exclude

- **タイプ:** `string[]`

事前バンドルから除外する依存関係。

:::warning CommonJS
CommonJS依存関係は、最適化から除外されるべきではありません。 ESMの依存関係が最適化から除外されているが、ネストされたCommonJS依存関係がある場合、CommonJS依存関係を`optimizeDeps.include`に追加する必要があります。例:

```js twoslash
import { defineConfig } from 'vite'
//  - -カット - -
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include

- **タイプ:** `string[]`

デフォルトでは、 `node_modules`内にないリンクされたパッケージは事前にバンドルされていません。このオプションを使用して、リンクされたパッケージを事前にバンドルします。

**実験:**多くの深い輸入品を備えたライブラリを使用している場合は、すべての深い輸入品を一度に事前に抑えるために、後続のGLOBパターンを指定することもできます。これにより、新しい深いインポートが使用されるたびに、絶えず事前バンドルを避けます。[フィードバックを与えます](https://github.com/vitejs/vite/discussions/15833)。例えば:

```js twoslash
import { defineConfig } from 'vite'
//  - -カット - -
export default defineConfig({
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
})
```

## optimizeDeps.esbuildOptions

- **タイプ:** [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) `<` [`EsbuildBuildOptions`](https://esbuild.github.io/api/#general-options) `、
| 'バンドル'
| 「エントリーポイント」
| '外部の'
| '書く'
| '時計'
| 「oututdir」
| 「Outfile」
| 「アウトベース」
| 「アウトエクステンション」
| 「メタファイル」> `

DEPスキャンと最適化中にEsbuildに渡すオプション。

特定のオプションは、それらを変更することはViteのDEP最適化と互換性がないため、省略されています。

- `external`も省略しています。Viteの`optimizeDeps.exclude`オプションを使用します
- `plugins` 、ViteのDEPプラグインと融合されています

## optimizeDeps.force

- **タイプ:** `boolean`

`true`に設定して、以前にキャッシュされた最適化された依存関係を無視して、依存関係の事前バンドルを強制します。

## optimizeDeps.holdUntilCrawlEnd

- **実験:**[フィードバックを与える](https://github.com/vitejs/vite/discussions/15834)
- **タイプ:** `boolean`
- **デフォルト:** `true`

有効にすると、すべての静的な輸入がコールドスタートでrawいされるまで、最初の最適化されたDEPS結果が保持されます。これにより、新しい依存関係が発見され、新しい共通のチャンクの生成をトリガーすると、フルページのリロードが必要になります。すべての依存関係がスキャナーと`include`の明示的に定義されたものによって見つかった場合は、このオプションを無効にして、ブラウザがより多くの要求を並行して処理できるようにすることをお勧めします。

## optimizeDeps.disabled

- **非推奨**
- **実験:**[フィードバックを与える](https://github.com/vitejs/vite/discussions/13839)
- **タイプ:** `Boolean | '建てる' | 「dev」
- **デフォルト:** `'build'`

このオプションは非推奨です。 Vite 5.1の時点で、ビルド中の依存関係の事前バンドルが削除されました。 `optimizeDeps.disabled`または`true` `'dev'`設定は、オプティマイザーを無効にし、 `false`または`'build'`に構成されていると、DEVが有効になっている間はオプティマイザーが残ります。

Optimizerを完全に無効にするには、 `optimizeDeps.noDiscovery: true`使用して依存関係の自動発見を禁止し、 `optimizeDeps.include`未定義または空のままにします。

:::warning
ビルド時間中に依存関係を最適化することは、**実験**機能でした。この戦略を試すプロジェクトは、 `build.commonjsOptions: { include: [] }`を使用して`@rollup/plugin-commonjs`削除しました。そうした場合、警告は、バンドリング中にCJSのみのパッケージのみをサポートするためにそれを再度信頼できるように導きます。
:::

## optimizeDeps.needsInterop

- **実験的**
- **タイプ:** `string[]`

これらの依存関係をインポートする際に、ESMインターナップを強制します。 Viteは、依存関係が互換性を必要とするときに適切に検出できるため、このオプションは一般的に必要ありません。ただし、依存関係の異なる組み合わせにより、それらの一部が異なる方法で束縛される可能性があります。これらのパッケージを`needsInterop`に追加すると、フルページのリロードを回避することで、コールドスタートをスピードアップできます。依存関係の1つに当てはまる場合は警告を受け取り、構成内のこの配列にパッケージ名を追加することを提案します。
