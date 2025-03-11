# 静的サイトの展開

次のガイドは、いくつかの共有仮定に基づいています。

- デフォルトのビルド出力場所（ `dist` ）を使用しています。この場所は[`build.outDir`を使用して変更できます](/ja/config/build-options.md#build-outdir)。その場合、これらのガイドから指示を外挿できます。
- NPMを使用しています。糸または他のパッケージマネージャーを使用している場合、同等のコマンドを使用してスクリプトを実行できます。
- Viteはプロジェクトのローカル開発依存関係としてインストールされており、次のNPMスクリプトをセットアップしています。

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

`vite preview` 、ビルドをローカルでプレビューすることを目的としていることに注意することが重要です。

::: tip NOTE
これらのガイドは、Viteサイトの静的展開を実行するための指示を提供します。 Viteはサーバーサイドレンダリングもサポートしています。 SSRとは、node.jsで同じアプリケーションの実行をサポートし、それをHTMLに事前にレンダリングし、最後にクライアントに潤いを与えるフロントエンドフレームワークを指します。この機能については、 [SSRガイド](./ssr)をご覧ください。一方、従来のサーバー側のフレームワークとの統合を探している場合は、代わりに[バックエンド統合ガイド](./backend-integration)をチェックしてください。
:::

## アプリの構築

アプリを構築するために`npm run build`コマンドを実行できます。

```bash
$ npm run build
```

デフォルトでは、ビルド出力は`dist`に配置されます。この`dist`フォルダーを、推奨されるプラットフォームのいずれかに展開できます。

### アプリをローカルでテストします

アプリを構築したら、 `npm run preview`コマンドを実行してローカルでテストできます。

```bash
$ npm run preview
```

`vite preview`コマンドは、 `dist`から`http://localhost:4173`のファイルを提供するローカルStatic Webサーバーを起動します。これは、お近くの環境で生産ビルドが問題ないかどうかを確認する簡単な方法です。

引数として`--port`フラグを渡すことにより、サーバーのポートを構成できます。

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

これで、 `preview`コマンドが`http://localhost:8080`にサーバーを起動します。

## githubページ

1. 正しい`base` `vite.config.js`に設定します。

   `https://<USERNAME>.github.io/`に展開する場合、またはGitHubページを介してカスタムドメインに展開する場合（例: `www.example.com` ）、 `base` `'/'`設定します。または、デフォルトで`'/'`になるため、構成から`base`削除できます。

   `https://<USERNAME>.github.io/<REPO>/`に展開する場合（例えば、リポジトリが`https://github.com/<USERNAME>/<REPO>`である）、 `base` `'/<REPO>/'`設定します。

2. リポジトリ設定ページのgithubページの構成に移動し、展開のソースを「githubアクション」として選択すると、プロジェクトを構築および展開するワークフローを作成します。

   ```yml
   # GitHubページに静的コンテンツを展開するための簡単なワークフロー
   name: Deploy static content to Pages

   on:
     # デフォルトのブランチをターゲットにするプッシュで実行されます
     push:
       branches: ['main']

     # [アクション]タブからこのワークフローを手動で実行できます
     workflow_dispatch:

   # github_tokenアクセス許可を設定して、githubページへの展開を許可します
   permissions:
     contents: read
     pages: write
     id-token: write

   # 1つの同時展開を許可します
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # 単一の展開ジョブは展開しているだけなので
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         - name: Set up Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'npm'
         - name: Install dependencies
           run: npm ci
         - name: Build
           run: npm run build
         - name: Setup Pages
           uses: actions/configure-pages@v4
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             # DISTフォルダーをアップロードします
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

## gitlabページとgitlab ci

1. 正しい`base` `vite.config.js`に設定します。

   `https://<USERNAME or GROUP>.gitlab.io/`に展開する場合は、デフォルトで`'/'`になるため、 `base`省略できます。

   `https://<USERNAME or GROUP>.gitlab.io/<REPO>/`に展開する場合、たとえばリポジトリが`https://gitlab.com/<USERNAME>/<REPO>`で、 `base` `'/<REPO>/'`設定します。

2. 以下のコンテンツを使用して、プロジェクトのルートで`.gitlab-ci.yml`というファイルを作成します。これにより、コンテンツを変更するたびにサイトが構築および展開されます。

   ```yaml [.gitlab-ci.yml]
   image: node:16.5.0
   pages:
     stage: deploy
     cache:
       key:
         files:
           - package-lock.json
         prefix: npm
       paths:
         - node_modules/
     script:
       - npm install
       - npm run build
       - cp -a dist/. public/
     artifacts:
       paths:
         - public
     rules:
       - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
   ```

## netlify

### netlify cli

1. [Netlify CLI](https://cli.netlify.com/)をインストールします。
2. `ntl init`を使用して新しいサイトを作成します。
3. `ntl deploy`を使用して展開します。

```bash
# Netlify CLIをインストールします
$ npm install -g netlify-cli

# Netlifyで新しいサイトを作成します
$ ntl init

# 一意のプレビューURLに展開します
$ ntl deploy
```

Netlify CLIは、検査するプレビューURLを共有します。生産に入る準備ができたら、 `prod`フラグを使用してください。

```bash
# サイトを生産に展開します
$ ntl deploy --prod
```

### gitでネットライフします

1. コードをgitリポジトリ（github、gitlab、bitbucket、azure devops）にプッシュします。
2. [プロジェクトをインポートして](https://app.netlify.com/start)netlifyにインポートします。
3. 該当する場合は、ブランチ、出力ディレクトリ、および環境変数のセットアップを選択します。
4. **[展開]**をクリックします。
5. Viteアプリが展開されています！

プロジェクトがインポートおよび展開された後、プルリクエストとともにプロダクションブランチ以外の支店へのその後のすべてのプッシュは[プレビュー展開](https://docs.netlify.com/site-deploys/deploy-previews/)を生成し、生産ブランチ（一般に「メイン」）に行われたすべての変更により、[生産展開](https://docs.netlify.com/site-deploys/overview/#definitions)が行われます。

## ヴェルセル

### VercelCli

1. [VercelCLI](https://vercel.com/cli)をインストールし、 `vercel`実行して展開します。
2. Vercelは、Viteを使用していることを検出し、展開に正しい設定を有効にします。
3. アプリケーションが展開されています！ （例: [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) ）

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### gitのvercel

1. コードをgitリポジトリ（Github、gitlab、bitbucket）にプッシュします。
2. [ViteプロジェクトをVercelにインポートします](https://vercel.com/new)。
3. Vercelは、Viteを使用していることを検出し、展開に正しい設定を有効にします。
4. アプリケーションが展開されています！ （例: [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) ）

プロジェクトがインポートおよび展開された後、ブランチへのその後のすべてのプッシュは[プレビュー展開](https://vercel.com/docs/concepts/deployments/environments#preview)を生成し、生産ブランチ（一般的に「メイン」）に行われたすべての変更により、[生産展開](https://vercel.com/docs/concepts/deployments/environments#production)が行われます。

Vercelの[Git Integrationの](https://vercel.com/docs/concepts/git)詳細をご覧ください。

## CloudFlareページ

### Wrangler経由のCloudFlareページ

1. [ラングラーCLI](https://developers.cloudflare.com/workers/wrangler/get-started/)をインストールします。
2. `wrangler login`使用して、クラウドフレーアカウントでラングラーを認証します。
3. ビルドコマンドを実行します。
4. `npx wrangler pages deploy dist`を使用して展開します。

```bash
# ラングラーCLIをインストールします
$ npm install -g wrangler

# CLIからCloudFlareアカウントにログインします
$ wrangler login

# ビルドコマンドを実行します
$ npm run build

# 新しい展開を作成します
$ npx wrangler pages deploy dist
```

資産がアップロードされた後、Wranglerはサイトを検査するプレビューURLを提供します。 CloudFlareページのダッシュボードにログインすると、新しいプロジェクトが表示されます。

### gitを使用したCloudflareページ

1. コードをgitリポジトリ（github、gitlab）にプッシュします。
2. CloudFlareダッシュボードにログインし、**アカウントホーム**>**ページ**でアカウントを選択します。
3. **[新しいプロジェクト**と**Connect Git**オプションの作成]を選択します。
4. 展開するgitプロジェクトを選択し、 **[セットアップの開始]を**クリックします
5. 選択したViteフレームワークに応じて、ビルド設定で対応するフレームワークプリセットを選択します。
6. その後、保存して展開します！
7. アプリケーションが展開されています！ （例`https://<PROJECTNAME>.pages.dev/` ）

プロジェクトがインポートおよび展開された後、ブランチへのその後のすべてのプッシュは[、ブランチビルドコントロール](https://developers.cloudflare.com/pages/platform/branch-build-controls/)に指定されていない限り[、プレビュー展開](https://developers.cloudflare.com/pages/platform/preview-deployments/)を生成します。生産ブランチ（一般に「メイン」）のすべての変更により、生産展開が行われます。

また、カスタムドメインを追加して、ページのカスタムビルド設定を処理することもできます。 [CloudFlareページGit Integrationの](https://developers.cloudflare.com/pages/get-started/#manage-your-site)詳細をご覧ください。

## Google Firebase

1. [Firebase-Tools](https://www.npmjs.com/package/firebase-tools)がインストールされていることを確認してください。

2. 次のコンテンツを使用して、プロジェクトのルートで`firebase.json`と`.firebaserc`作成します。

   ```json [firebase.json]
   {
     "hosting": {
       "public": "dist",
       "ignore": [],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

   ```js [.firebaserc]
   {
     "projects": {
       "default": "<YOUR_FIREBASE_ID>"
     }
   }
   ```

3. `npm run build`実行した後、コマンド`firebase deploy`を使用して展開します。

## うねり

1. まだ不明であれば、最初に[サージ](https://www.npmjs.com/package/surge)をインストールしてください。

2. `npm run build`実行します。

3. `surge dist`を入力してサージに展開します。

`surge dist yourdomain.com`を追加して、[カスタムドメイン](http://surge.sh/help/adding-a-custom-domain)に展開することもできます。

## Azure Static Webアプリ

Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps)サービスを使用して、Viteアプリをすばやく展開できます。あなたが必要です:

- Azureアカウントとサブスクリプションキー。[ここで無料のAzureアカウント](https://azure.microsoft.com/free)を作成できます。
- あなたのアプリコードは[Github](https://github.com)にプッシュされました。
- [Visual Studioコード](https://code.visualstudio.com)の[SWA拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)。

VSコードに拡張機能をインストールし、アプリルートに移動します。 Static Webアプリの拡張機能を開き、Azureにサインインし、「+」サインをクリックして新しいStatic Webアプリを作成します。使用するサブスクリプションキーを指定するように求められます。

拡張機能から開始されたウィザードをフォローして、アプリに名前を付け、フレームワークプリセットを選択し、アプリルート（通常`/` ）を指定し、ファイルの場所`/dist`作成します。ウィザードは実行され、 `.github`フォルダーのリポジトリにGitHubアクションが作成されます。

アクションは、アプリを展開するために機能し（リポジトリのアクションタブでその進行状況をご覧ください）、正常に完了すると、githubアクションが実行されたときに表示される[Webサイトを参照]ボタンをクリックして、拡張機能の進行状況ウィンドウで提供されるアドレスでアプリを表示できます。

## 与える

[レンダリング](https://render.com/)上の静的サイトとしてViteアプリを展開できます。

1. [レンダリングアカウント](https://dashboard.render.com/register)を作成します。

2. [ダッシュボード](https://dashboard.render.com/)で、[**新しい**]ボタンをクリックして、**静的サイト**を選択します。

3. github/gitlabアカウントを接続するか、パブリックリポジトリを使用します。

4. プロジェクト名とブランチを指定します。

   - **ビルドコマンド**: `npm install && npm run build`
   - **ディレクトリの公開**: `dist`

5. **[静的サイトの作成]を**クリックします。

   アプリは`https://<PROJECTNAME>.onrender.com/`に展開する必要があります。

デフォルトでは、指定されたブランチにプッシュされた新しいコミットは、新しい展開を自動的にトリガーします。[自動デプロイは、](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service)プロジェクト設定で構成できます。

プロジェクトに[カスタムドメイン](https://render.com/docs/custom-domains)を追加することもできます。

<!--
  NOTE: The sections below are reserved for more deployment platforms not listed above.
  Feel free to submit a PR that adds a new section with a link to your platform's
  deployment guide, as long as it meets these criteria:

  1. Users should be able to deploy their site for free.
  2. Free tier offerings should host the site indefinitely and are not time-bound.
     Offering a limited number of computation resource or site counts in exchange is fine.
  3. The linked guides should not contain any malicious content.

  The Vite team may change the criteria and audit the current list from time to time.
  If a section is removed, we will ping the original PR authors before doing so.
-->

## FlightControl

これらの[指示](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite)に従って、 [FlightControl](https://www.flightcontrol.dev/?ref=docs-vite)を使用して静的サイトを展開します。

## Kinsta静的サイトホスティング

これらの[指示](https://kinsta.com/docs/react-vite-example/)に従って、 [Kinsta](https://kinsta.com/static-site-hosting/)を使用して静的サイトを展開します。

## Xmit静的サイトホスティング

この[ガイド](https://xmit.dev/posts/vite-quickstart/)に従って[Xmit](https://xmit.co)を使用して静的サイトを展開します。
