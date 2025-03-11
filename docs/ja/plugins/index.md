# プラグイン

:::tip NOTE
Viteは、一般的なWeb開発パターンにすぐに使用できるサポートを提供することを目指しています。 Viteまたは互換性のあるロールアッププラグインを検索する前に、[機能ガイド](../guide/features.md)をご覧ください。ロールアッププロジェクトでプラグインが必要になるケースの多くは、すでにViteでカバーされています。
:::

プラグインの使用方法については、[プラグインを使用して](../guide/using-plugins)チェックしてください。

## 公式プラグイン

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- VUE 3つの単一ファイルコンポーネントサポートを提供します。

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- VUE 3 JSXサポートを提供します（[専用のBabel Transform](https://github.com/vuejs/jsx-next)を介して）。

### [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)

- VUE 2.7の単一ファイルコンポーネントサポートを提供します。

### [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

- VUE 2.7 JSXサポートを提供します（[専用のBabel Transform](https://github.com/vuejs/jsx-vue2/)を介して）。

### [@Vitejs/Plugin-React](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- EsbuildとBabelを使用して、小さなパッケージフットプリントとBabel Transform Pipelineを使用できる柔軟性で高速HMRを達成します。追加のバベルプラグインがなければ、ビルド中にEsbuildのみが使用されます。

### [@vitejs/plugin-reacs-swc](https://github.com/vitejs/vite-plugin-react-swc)

- 開発中にバベルをSWCに置き換えます。生産ビルド中、プラグインを使用するときはSWC+ESBUILDが使用され、それ以外の場合のみESBUILDが使用されます。非標準の反応拡張機能を必要としない大きなプロジェクトの場合、コールドスタートおよびホットモジュールの交換（HMR）は大幅に高速になる可能性があります。

### [@Vitejs/Plugin-Legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- 生産ビルドのレガシーブラウザのサポートを提供します。

## コミュニティプラグイン

[Awesome -Vite](https://github.com/vitejs/awesome-vite#plugins)をチェックしてください - PRを提出して、そこにプラグインをリストすることもできます。

## ロールアッププラグイン

[Viteプラグインは](../guide/api-plugin)、Rollupのプラグインインターフェイスの拡張機能です。詳細については、[ロールアッププラグインの互換性セクション](../guide/api-plugin#rollup-plugin-compatibility)をご覧ください。
