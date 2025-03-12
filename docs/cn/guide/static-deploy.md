# 部署静态网站

以下指南基于一些共同的假设:

- 您正在使用默认的构建输出位置（ `dist` ）。[可以使用`build.outDir`更改](/en/config/build-options.md#build-outdir)此位置，在这种情况下，您可以从这些指南中推断说明。
- 您正在使用NPM。如果使用纱线或其他软件包管理器，则可以使用等效命令来运行脚本。
- VITE是您项目中的本地DEV依赖性安装的，并且您已经设置了以下NPM脚本:

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

重要的是要注意， `vite preview`旨在在本地预览构建，而不是作为生产服务器。

::: tip NOTE
这些指南提供了执行Vite网站静态部署的说明。 Vite还支持服务器端渲染。 SSR是指支持在node.js中运行相同应用程序的前端框架，将其预先呈现给HTML，最后在客户端上进行补充。查看[SSR指南](./ssr)以了解此功能。另一方面，如果您正在寻找与传统的服务器端框架集成，请访问“[后端集成指南”](/1) 。
:::

## 构建应用程序

您可以运行`npm run build`命令来构建应用程序。

```bash
$ npm run build
```

默认情况下，构建输出将放置在`dist` 。您可以将此`dist`文件夹部署到任何首选平台。

### 在本地测试应用程序

构建应用程序后，您可以通过运行`npm run preview`命令在本地测试它。

```bash
$ npm run preview
```

`vite preview`命令将启动一个本地静态Web服务器，该静态Web服务器可为`dist` at `http://localhost:4173`文件提供服务。这是检查生产构建在本地环境中是否还不错的简单方法。

您可以通过传递`--port`标志作为参数来配置服务器的端口。

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

现在， `preview`命令将以`http://localhost:8080`速度启动服务器。

## github页面

1. 将正确的`base`设置为`vite.config.js` 。

   如果您部署到`https://<USERNAME>.github.io/`或通过GitHub页面（例如`www.example.com` ）到自定义域，则设置为`base`至`'/'` 。另外，您可以从配置中删除`base` ，因为默认为`'/'` 。

   如果您部署到`https://<USERNAME>.github.io/<REPO>/` （例如，您的存储库为`https://github.com/<USERNAME>/<REPO>` ），则设置`base`至`'/<REPO>/'` 。

2. 转到“存储库设置”页面中的github页面配置，然后选择部署来源作为“ github action”，这将导致您创建一个工作流，该工作流程构建和部署项目，提供依赖关系的示例工作流，该工作流使用NPM安装依赖关系和构建:提供:提供:

   ```yml
   # 简单的工作流程用于部署静态内容到github页面
   name: Deploy static content to Pages

   on:
     # 运行针对默认分支的按下
     push:
       branches: ['main']

     # 允许您从“操作”选项卡手动运行此工作流程
     workflow_dispatch:

   # 设置github_token权限以允许部署到github页面
   permissions:
     contents: read
     pages: write
     id-token: write

   # 允许并发部署
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # 单部部署工作，因为我们只是部署
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
             # 上传Dist文件夹
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

## gitlab页面和gitlab ci

1. 将正确的`base`设置为`vite.config.js` 。

   如果您部署到`https://<USERNAME id="!">.gitlab.io/` ，则可以省略`base`因为默认值为`'/'` 。

   如果您部署到`https://<USERNAME id="!">.gitlab.io/<REPO>/` ，例如您的存储库在`https://gitlab.com/<USERNAME>/<REPO>`处，则设置`base`至`'/<REPO>/'` 。

2. 在项目的根部使用以下内容创建一个名为`.gitlab-ci.yml`的文件。每当您更改内容时，这将构建和部署您的网站:

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

## Netlify

### Netlify CLI

1. 安装[NetLify CLI](/0) 。
2. 使用`ntl init`创建一个新站点。
3. 使用`ntl deploy`部署。

```bash
# 安装NetLify CLI
$ npm install -g netlify-cli

# 在Netlify中创建一个新网站
$ ntl init

# 部署到唯一的预览URL
$ ntl deploy
```

Netlify CLI将与您共享一个预览URL。当您准备进入生产时，请使用`prod`标志:

```bash
# 将网站部署到生产中
$ ntl deploy --prod
```

### 用git netlify

1. 将代码推到GIT存储库（GitHub，Gitlab，Bitbucket，Azure DevOps）。
2. [导入项目](/0)以净化。
3. 如果适用，请选择分支，输出目录并设置环境变量。
4. 单击**部署**。
5. 您的Vite应用程序已部署！

在您的项目被进口和部署后，随后的所有推送到生产分支以外的分支机构以及拉力请求都将生成[预览部署](/0)，并且对生产分支（通常是“ Main”）进行的所有更改都将导致[生产部署](/1)。

## 动词

### Vercel Cli

1. 安装[Vercel CLI](/0)并运行`vercel`以部署。
2. Vercel将检测到您正在使用Vite，并可以为您的部署提供正确的设置。
3. 您的应用程序已部署！ （例如[vite-vue-template.vercel.app](/0) ）

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel for Git

1. 将代码推到GIT存储库（GitHub，GitLab，Bitbucket）。
2. [将您的Vite项目](/0)导入Vercel。
3. Vercel将检测到您正在使用Vite，并可以为您的部署提供正确的设置。
4. 您的应用程序已部署！ （例如[vite-vue-template.vercel.app](/0) ）

在您的项目进口和部署后，所有随后的推送将生成[预览部署](/0)，并且对生产分支的所有更改（通常是“主要”）将导致[生产部署](/1)。

了解有关Vercel的[GIT集成的](/0)更多信息。

## Cloudflare页面

### Cloudflare页面通过牧马人

1. 安装[牧马人CLI](/0) 。
2. 使用`wrangler login` CloudFlare帐户身份验证Wrangler。
3. 运行您的构建命令。
4. 使用`npx wrangler pages deploy dist`部署。

```bash
# 安装牧马人CLI
$ npm install -g wrangler

# 从CLI登录到CloudFlare帐户
$ wrangler login

# 运行您的构建命令
$ npm run build

# 创建新的部署
$ npx wrangler pages deploy dist
```

上传资产后，Wrangler将为您提供一个预览URL来检查您的网站。当您登录CloudFlare页面仪表板时，您将看到您的新项目。

### 带有git的Cloudflare页面

1. 将您的代码推到GIT存储库（GitHub，GitLab）。
2. 登录到Cloudflare仪表板，然后在**帐户主页**>**页面**中选择您的帐户。
3. 选择**创建一个新项目**和**连接GIT**选项。
4. 选择要部署的GIT项目，然后单击**“开始设置”**
5. 根据您选择的VITE框架，在构建设置中选择相应的框架预设。
6. 然后保存和部署！
7. 您的应用程序已部署！ （例如`https://<PROJECTNAME>.pages.dev/` ）

在您的项目被进口和部署后，除非在[分支机构构建控件](/1)中指定未指定，否则所有后续推送到分支机构都将生成[预览部署](/0)。生产分支的所有更改（通常是“主要”）将导致生产部署。

您还可以添加自定义域并在页面上处理自定义构建设置。了解有关[CloudFlare页面git集成的](/0)更多信息。

## Google Firebase

1. 确保安装了[firebase-tools](/0) 。

2. 用以下内容在项目的根部创建`firebase.json`和`.firebaserc` :

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

3. 运行`npm run build`后，使用命令`firebase deploy`部署。

## 涌

1. 如果您还没有，请首先安装[浪潮](/0)。

2. 运行`npm run build` 。

3. 通过键入`surge dist`部署到激增。

您也可以通过添加`surge dist yourdomain.com`部署到[自定义域](/0)。

## Azure静态Web应用程序

您可以使用Microsoft Azure[静态Web应用](/0)程序快速部署Vite应用程序。您需要:

- 一个Azure帐户和订阅密钥。您可以[在此处创建一个免费的Azure帐户](/0)。
- 您的应用程序代码被推到[GitHub](/0) 。
- [Visual Studio代码](/1)中的[SWA扩展](/0)。

将扩展名安装在VS代码中，并导航到您的应用程序根。打开静态Web应用程序扩展名，登录Azure，然后单击“+”符号以创建一个新的静态Web应用程序。将提示您指定使用哪种订阅密钥。

按照扩展名开头的向导，为您的应用程序命名，选择一个框架预设，并指定应用程序根（通常为`/` ）和构建的文件位置`/dist` 。向导将运行，并将在`.github`文件夹中的存储库中创建一个github动作。

该操作将有效地部署您的应用程序（在您的Repo的操作选项卡中观看其进度），并且在成功完成时，您可以通过单击GitHub操作运行时出现的“浏览网站”按钮中的“浏览网站”按钮中的“浏览网站”按钮查看应用程序。

## 使成为

您可以将Vite应用程序部署为[渲染](/0)上的静态站点。

1. 创建一个[渲染帐户](/0)。

2. 在[仪表板](/0)中，单击**新**按钮，然后选择**静态站点**。

3. 连接您的github/gitlab帐户或使用公共存储库。

4. 指定项目名称和分支。

   - **构建命令**: `npm install && npm run build`
   - **发布目录**: `dist`

5. 单击**创建静态站点**。

   您的应用程序应在`https://<PROJECTNAME>.onrender.com/`处部署。

默认情况下，将任何新提交推向指定的分支机构都会自动触发新的部署。可以在项目设置中配置[自动数据](/0)。

您还可以在项目中添加[自定义域](/0)。

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

通过遵循这些[说明](/1)，使用[FlightControl](/0)部署静态站点。

## Kinsta静态网站托管

通过遵循这些[说明](/1)，使用[kinsta](/0)部署静态站点。

## XMIT静态站点托管

通过遵循本[指南](/1)，使用[XMIT](/0)部署静态站点。
