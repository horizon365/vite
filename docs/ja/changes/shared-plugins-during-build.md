# ビルド中の共有プラグイン

::: tip Feedback
[環境APIフィードバックディスカッション](https://github.com/vitejs/vite/discussions/16358)でフィードバックを提供してください
:::

[ビルド中の共有プラグイン](/ja/guide/api-environment.md#shared-plugins-during-build)を参照してください。

影響範囲: `Vite Plugin Authors`

::: warning Future Default Change
`builder.sharedConfigBuild`は最初に`v6.0`で導入されました。プラグインが共有構成でどのように動作するかを確認するために、それを設定できます。プラグインエコシステムの準備ができたら、将来の専攻でデフォルトを変更することに関するフィードバックを探しています。
:::

## モチベーション

DEVとビルドプラグインパイプラインを調整します。

## 移行ガイド

環境間でプラグインを共有できるようにするには、プラグイン状態を現在の環境でキー化する必要があります。次のフォームのプラグインは、すべての環境で変換されたモジュールの数をカウントします。

```js
function CountTransformedModulesPlugin() {
  let transformedModules
  return {
    name: 'count-transformed-modules',
    buildStart() {
      transformedModules = 0
    },
    transform(id) {
      transformedModules++
    },
    buildEnd() {
      console.log(transformedModules)
    },
  }
}
```

代わりに、各環境の変換されたモジュールの数を数えたい場合は、マップを保持する必要があります。

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    }
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

このパターンを簡素化するために、Viteは`perEnvironmentState`ヘルパーをエクスポートします。

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = perEnvironmentState<{ count: number }>(() => ({ count: 0 }))
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state(this).count = 0
    }
    transform(id) {
      state(this).count++
    },
    buildEnd() {
      console.log(this.environment.name, state(this).count)
    }
  }
}
```
