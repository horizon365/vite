# コマンドラインインターフェイス

## 開発サーバー

### `vite`

現在のディレクトリでVite Devサーバーを起動します。 `vite dev`と`vite serve`は`vite`エイリアスです。

#### 使用法

```bash
vite [root]
```

#### オプション

| オプション                |                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | ホスト名を指定する（ `string` ）                                                                                                                                                 |
| `--port <port>`           | ポートを指定する（ `number` ）                                                                                                                                                   |
| `--open [path]`           | 起動時にブラウザを開く（ `boolean \| 文字列 `）                                                                                                                                  |
| `--cors`                  | CORSを有効にする（ `boolean` ）                                                                                                                                                  |
| `--strictPort`            | 指定されたポートが既に使用されている場合（ `boolean` ）                                                                                                                          |
| `--force`                 | オプティマイザーにキャッシュを無視するように強制し、再バンル（ `boolean` ）                                                                                                      |
| `-c, --config <file>`     | 指定された構成ファイルを使用（ `string` ）                                                                                                                                       |
| `--base <path>`           | パブリックベースパス（デフォルト: `/` ）（ `string` ）                                                                                                                           |
| `-l, --logLevel <level>`  | 情報 \| 警告\| エラー \| サイレント（ `string` ）                                                                                                                                |
| `--clearScreen`           | ロギング時にクリア画面を許可/無効にする（ `boolean` ）                                                                                                                           |
| `--configLoader <loader>` | `bundle`使用してesbuildで構成をバンドルするか、 `runner` （実験的）でその場で処理するか、 `native` （実験的）ネイティブランタイムを使用してロードします（デフォルト: `bundle` ） |
| `--profile`               | 組み込みのnode.jsインスペクターを開始します（[パフォーマンスのボトルネック](/ja/guide/troubleshooting#performance-bottlenecks)をチェックしてください）                           |
| `-d, --debug [feat]`      | デバッグログを表示（ `string \| boolean`）                                                                                                                                       |
| `-f, --filter <filter>`   | フィルターデバッグログ（ `string` ）                                                                                                                                             |
| `-m, --mode <mode>`       | envモード（ `string` ）を設定します                                                                                                                                              |
| `-h, --help`              | 利用可能なCLIオプションを表示します                                                                                                                                              |
| `-v, --version`           | バージョン番号を表示します                                                                                                                                                       |

## 建てる

### `vite build`

生産用に構築します。

#### 使用法

```bash
vite build [root]
```

#### オプション

| オプション                     |                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--target <target>`            | 透過ターゲット（デフォルト: `"modules"` ）（ `string` ）                                                                                               |
| `--outDir <dir>`               | 出力ディレクトリ（デフォルト: `dist` ）（ `string` ）                                                                                                  |
| `--assetsDir <dir>`            | （default: `"assets"` ）（ `string` ）に資産を配置するためのoutustの下のディレクトリ                                                                   |
| `--assetsInlineLimit <number>` | 静的資産Base64バイトのインラインしきい値（デフォルト: `4096` ）（ `number` ）                                                                          |
| `--ssr [entry]`                | サーバー側のレンダリング（ `string` ）の指定されたエントリをビルドする                                                                                 |
| `--sourcemap [output]`         | ビルド用の出力ソースマップ（デフォルト: `false` ）（ `boolean \| "列をなして" \| 「隠された」 `）                                                      |
| `--minify [minifier]`          | 削除/無効化の有効化/無効化するか、使用するミニフィーターを指定します（デフォルト: `"esbuild"` ）（ `boolean \| 「テルサー」\| 「esbuild」 `）          |
| `--manifest [name]`            | エミットビルドマニフェストjson（ `boolean \| 文字列 `）                                                                                                |
| `--ssrManifest [name]`         | ssrマニフェストjson（ `boolean \| 文字列 `）                                                                                                           |
| `--emptyOutDir`                | ルートの外側にあるときに空の屋外を強制します（ `boolean` ）                                                                                            |
| `-w, --watch`                  | モジュールがディスクで変更されたときに再構築（ `boolean` ）                                                                                            |
| `-c, --config <file>`          | 指定された構成ファイルを使用（ `string` ）                                                                                                             |
| `--base <path>`                | パブリックベースパス（デフォルト: `/` ）（ `string` ）                                                                                                 |
| `-l, --logLevel <level>`       | 情報 \| 警告\| エラー \| サイレント（ `string` ）                                                                                                      |
| `--clearScreen`                | ロギング時にクリア画面を許可/無効にする（ `boolean` ）                                                                                                 |
| `--configLoader <loader>`      | `bundle`使用して、esbuildまたは`runner` （実験的）で構成をバンドルして、その場で処理します（デフォルト: `bundle` ）                                    |
| `--profile`                    | 組み込みのnode.jsインスペクターを開始します（[パフォーマンスのボトルネック](/ja/guide/troubleshooting#performance-bottlenecks)をチェックしてください） |
| `-d, --debug [feat]`           | デバッグログを表示（ `string \| boolean`）                                                                                                             |
| `-f, --filter <filter>`        | フィルターデバッグログ（ `string` ）                                                                                                                   |
| `-m, --mode <mode>`            | envモード（ `string` ）を設定します                                                                                                                    |
| `-h, --help`                   | 利用可能なCLIオプションを表示します                                                                                                                    |
| `--app`                        | `builder: {}` （ `boolean` 、実験的）と同じように、すべての環境を構築する                                                                              |

## その他

### `vite optimize`

バッスル依存関係。

**非推奨**:バンドル前プロセスは自動的に実行され、呼び出される必要はありません。

#### 使用法

```bash
vite optimize [root]
```

#### オプション

| オプション                |                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--force`                 | オプティマイザーにキャッシュを無視するように強制し、再バンル（ `boolean` ）                                           |
| `-c, --config <file>`     | 指定された構成ファイルを使用（ `string` ）                                                                            |
| `--base <path>`           | パブリックベースパス（デフォルト: `/` ）（ `string` ）                                                                |
| `-l, --logLevel <level>`  | 情報 \| 警告\| エラー \| サイレント（ `string` ）                                                                     |
| `--clearScreen`           | ロギング時にクリア画面を許可/無効にする（ `boolean` ）                                                                |
| `--configLoader <loader>` | `bundle`を使用して、esbuildまたは`runner` （実験的）で構成をバンドルして、その場で処理します（デフォルト: `bundle` ） |
| `-d, --debug [feat]`      | デバッグログを表示（ `string \| boolean`）                                                                            |
| `-f, --filter <filter>`   | フィルターデバッグログ（ `string` ）                                                                                  |
| `-m, --mode <mode>`       | envモード（ `string` ）を設定します                                                                                   |
| `-h, --help`              | 利用可能なCLIオプションを表示します                                                                                   |

### `vite preview`

生産ビルドをローカルでプレビューします。これを生産サーバーとして使用しないでください。これは設計されていないためです。

#### 使用法

```bash
vite preview [root]
```

#### オプション

| オプション                |                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | ホスト名を指定する（ `string` ）                                                                                      |
| `--port <port>`           | ポートを指定する（ `number` ）                                                                                        |
| `--strictPort`            | 指定されたポートが既に使用されている場合（ `boolean` ）                                                               |
| `--open [path]`           | 起動時にブラウザを開く（ `boolean \| 文字列 `）                                                                       |
| `--outDir <dir>`          | 出力ディレクトリ（デフォルト: `dist` ）（ `string` ）                                                                 |
| `-c, --config <file>`     | 指定された構成ファイルを使用（ `string` ）                                                                            |
| `--base <path>`           | パブリックベースパス（デフォルト: `/` ）（ `string` ）                                                                |
| `-l, --logLevel <level>`  | 情報 \| 警告\| エラー \| サイレント（ `string` ）                                                                     |
| `--clearScreen`           | ロギング時にクリア画面を許可/無効にする（ `boolean` ）                                                                |
| `--configLoader <loader>` | `bundle`を使用して、esbuildまたは`runner` （実験的）で構成をバンドルして、その場で処理します（デフォルト: `bundle` ） |
| `-d, --debug [feat]`      | デバッグログを表示（ `string \| boolean`）                                                                            |
| `-f, --filter <filter>`   | フィルターデバッグログ（ `string` ）                                                                                  |
| `-m, --mode <mode>`       | envモード（ `string` ）を設定します                                                                                   |
| `-h, --help`              | 利用可能なCLIオプションを表示します                                                                                   |
