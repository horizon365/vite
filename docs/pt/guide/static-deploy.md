# Implantando Um Site Estático

Os seguintes guias são baseados em algumas suposições compartilhadas:

- Você está usando o local de saída de construção padrão ( `dist` ). Este local [pode ser alterado usando `build.outDir`](/pt/config/build-options.md#build-outdir) e você pode extrapolar instruções desses guias nesse caso.
- Você está usando o NPM. Você pode usar comandos equivalentes para executar os scripts se estiver usando fios ou outros gerentes de pacotes.
- O Vite é instalado como uma dependência de desenvolvedor local em seu projeto e você configurou os seguintes scripts do NPM:

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

É importante observar que `vite preview` se destina a visualizar a compilação localmente e não significa como um servidor de produção.

::: tip NOTE
Esses guias fornecem instruções para realizar uma implantação estática do seu site vite. O Vite também suporta a renderização do lado do servidor. O SSR refere-se a estruturas front-end que suportam a execução do mesmo aplicativo no Node.js, pré-renderizando-o para HTML e, finalmente, hidratando-o no cliente. Confira o [Guia SSR](./ssr) para saber sobre esse recurso. Por outro lado, se você estiver procurando integração com estruturas tradicionais do lado do servidor, confira o [guia de integração de back-end](./backend-integration) .
:::

## Construindo o aplicativo

Você pode executar o comando `npm run build` para criar o aplicativo.

```bash
$ npm run build
```

Por padrão, a saída de compilação será colocada em `dist` . Você pode implantar esta pasta `dist` em qualquer uma de suas plataformas preferidas.

### Testando O Aplicativo Localmente

Depois de criar o aplicativo, você pode testá -lo localmente executando o comando `npm run preview` .

```bash
$ npm run preview
```

O comando `vite preview` inicializará um servidor da Web local que serve os arquivos de `dist` em `http://localhost:4173` . É uma maneira fácil de verificar se a construção da produção parece boa no seu ambiente local.

Você pode configurar a porta do servidor passando o sinalizador `--port` como um argumento.

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Agora o comando `preview` iniciará o servidor em `http://localhost:8080` .

## Páginas Do Github

1. Defina os `base` em `vite.config.js` correto.

   Se você estiver implantando para `https://<USERNAME>.github.io/` , ou para um domínio personalizado através de páginas do GitHub (por exemplo, `www.example.com` ), defina `base` a `'/'` . Como alternativa, você pode remover `base` da configuração, pois ela padrão é `'/'` .

   Se você estiver implantando para `https://<USERNAME>.github.io/<REPO>/` (por exemplo, seu repositório estiver em `https://github.com/<USERNAME>/<REPO>` ), defina `base` a `'/<REPO>/'` .

2. Vá para a configuração do seu Github Pages na página Configurações do repositório e escolha a fonte de implantação como "ações do github", isso o levará a criar um fluxo de trabalho que constrói e implanta seu projeto, um amostra de fluxo de trabalho que instala dependências e criações usando o NPM é fornecido:

   ```yml
   # Fluxo de trabalho simples para implantar conteúdo estático nas páginas do GitHub
   name: Deploy static content to Pages

   on:
     # Corre em pushs direcionando a filial padrão
     push:
       branches: ['main']

     # Permite que você execute este fluxo de trabalho manualmente a partir da guia Ações
     workflow_dispatch:

   # Define as permissões github_token para permitir a implantação nas páginas do GitHub
   permissions:
     contents: read
     pages: write
     id-token: write

   # Permitir uma implantação simultânea
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # Trabalho de implantação única, já que estamos apenas implantando
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
             # Faça upload da pasta dist
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

## Páginas Gitlab e Gitlab CI

1. Defina os `base` em `vite.config.js` correto.

   Se você estiver implantando para `https://<USERNAME or GROUP>.gitlab.io/` , poderá omitir `base` pois ele padrão é `'/'` .

   Se você estiver implantando para `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` , por exemplo, seu repositório está em `https://gitlab.com/<USERNAME>/<REPO>` , defina `base` a `'/<REPO>/'` .

2. Crie um arquivo chamado `.gitlab-ci.yml` na raiz do seu projeto com o conteúdo abaixo. Isso criará e implantará seu site sempre que você fizer alterações no seu conteúdo:

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

1. Instale a [CLI do Netlify](https://cli.netlify.com/) .
2. Crie um novo site usando `ntl init` .
3. Implantar usando `ntl deploy` .

```bash
# Instale a CLI do Netlify
$ npm install -g netlify-cli

# Crie um novo site no Netlify
$ ntl init

# Implantar para um URL de visualização exclusivo
$ ntl deploy
```

A CLI da Netlify compartilhará com você um URL de visualização para inspecionar. Quando você estiver pronto para entrar em produção, use a bandeira `prod` :

```bash
# Implante o site em produção
$ ntl deploy --prod
```

### Netlify com git

1. Empurre seu código para um repositório Git (Github, Gitlab, Bitbucket, Azure DevOps).
2. [Importar o projeto](https://app.netlify.com/start) para netlify.
3. Escolha a ramificação, o diretório de saída e configure variáveis de ambiente, se aplicável.
4. Clique em **implantar** .
5. Seu aplicativo Vite está implantado!

Depois que seu projeto foi importado e implantado, todos os empurrões subsequentes para as filiais que não sejam a filial de produção, juntamente com solicitações de tração, gerarão [implantações de visualização](https://docs.netlify.com/site-deploys/deploy-previews/) , e todas as alterações feitas na filial de produção (comumente "principal") resultarão em uma [implantação de produção](https://docs.netlify.com/site-deploys/overview/#definitions) .

## Vercel

### Vercel CLI

1. Instale a [CLI do Vercel](https://vercel.com/cli) e execute `vercel` para implantar.
2. A Vercel detectará que você está usando o Vite e permitirá as configurações corretas para sua implantação.
3. Seu aplicativo está implantado! (por exemplo [, vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel para Git

1. Empurre seu código para o seu repositório Git (Github, Gitlab, Bitbucket).
2. [Importe seu projeto Vite](https://vercel.com/new) para o Vercel.
3. A Vercel detectará que você está usando o Vite e permitirá as configurações corretas para sua implantação.
4. Seu aplicativo está implantado! (por exemplo [, vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

Depois que seu projeto foi importado e implantado, todos os empurrões subsequentes para as filiais gerarão [implantações de visualização](https://vercel.com/docs/concepts/deployments/environments#preview) , e todas as alterações feitas na filial de produção (geralmente "principal") resultarão em uma [implantação de produção](https://vercel.com/docs/concepts/deployments/environments#production) .

Saiba mais sobre [a integração do Git](https://vercel.com/docs/concepts/git) da Vercel.

## Páginas Cloudflare

### Páginas Cloudflare via Wrangler

1. Instale [o Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) .
2. Autentique o Wrangler com sua conta Cloudflare usando `wrangler login` .
3. Execute seu comando de construção.
4. Implantar usando `npx wrangler pages deploy dist` .

```bash
# Instale o Wrangler CLI
$ npm install -g wrangler

# Faça login na conta Cloudflare da CLI
$ wrangler login

# Execute seu comando de construção
$ npm run build

# Crie nova implantação
$ npx wrangler pages deploy dist
```

Depois que seus ativos forem enviados, o Wrangler fornecerá um URL de visualização para inspecionar seu site. Quando você faz login no painel do CloudFlare Pages, você verá seu novo projeto.

### Páginas Cloudflare Com Git

1. Empurre seu código para o seu repositório Git (Github, Gitlab).
2. Faça login no painel do CloudFlare e selecione sua conta na **Home** > **Páginas** .
3. Selecione **Criar um novo projeto** e a opção **Connect Git** .
4. Selecione o projeto Git que deseja implantar e clique em **Iniciar Configuração**
5. Selecione a predefinição da estrutura correspondente na configuração de compilação, dependendo da estrutura do Vite que você selecionou.
6. Em seguida, salve e implante!
7. Seu aplicativo está implantado! (por exemplo, `https://<PROJECTNAME>.pages.dev/` )

Depois que seu projeto foi importado e implantado, todos os empurrões subsequentes para as filiais gerarão [implantações de visualização,](https://developers.cloudflare.com/pages/platform/preview-deployments/) a menos que especificado para não nos [controles de construção da filial](https://developers.cloudflare.com/pages/platform/branch-build-controls/) . Todas as alterações no ramo de produção (geralmente "principal") resultarão em uma implantação de produção.

Você também pode adicionar domínios personalizados e lidar com configurações de construção personalizadas nas páginas. Saiba mais sobre [a integração do CloudFlare Pages Git](https://developers.cloudflare.com/pages/get-started/#manage-your-site) .

## Google Firebase

1. Certifique-se de instalar-se de [Firebase-Tools](https://www.npmjs.com/package/firebase-tools) .

2. Crie `firebase.json` e `.firebaserc` na raiz do seu projeto com o seguinte conteúdo:

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

3. Depois de executar `npm run build` , implante usando o comando `firebase deploy` .

## Surto

1. Primeiro instale [o Surge](https://www.npmjs.com/package/surge) , se você ainda não o fez.

2. Execute `npm run build` .

3. Implantar para surgir digitando `surge dist` .

Você também pode implantar em um [domínio personalizado](http://surge.sh/help/adding-a-custom-domain) adicionando `surge dist yourdomain.com` .

## Aplicativos Da Web Estática Do Azure

Você pode implantar rapidamente seu aplicativo Vite com o serviço [de aplicativos da web do Microsoft Azure Static](https://aka.ms/staticwebapps) . Você precisa:

- Uma conta do Azure e uma chave de assinatura. Você pode criar uma [conta do Azure gratuito aqui](https://azure.microsoft.com/free) .
- Seu código de aplicativo foi enviado para [o GitHub](https://github.com) .
- A [extensão SWA](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) no [código do Visual Studio](https://code.visualstudio.com) .

Instale a extensão no código VS e navegue até a raiz do seu aplicativo. Abra a extensão estática de aplicativos da web, faça login no Azure e clique no sinal '+' para criar um novo aplicativo estático. Você será solicitado a designar qual chave de assinatura usar.

Siga o assistente iniciado pela extensão para dar um nome ao seu aplicativo, escolha uma predefinição da estrutura e designar a raiz do aplicativo (geralmente `/` ) e construir o local do arquivo `/dist` . O assistente será executado e criará uma ação do GitHub em seu repositório em uma pasta `.github` .

A ação funcionará para implantar seu aplicativo (observe o progresso na guia Ações do seu repo) e, quando concluído com sucesso, você pode visualizar seu aplicativo no endereço fornecido na janela de progresso da extensão clicando no botão 'Browse Site' que aparece quando a ação do Github estiver executada.

## Renderizar

Você pode implantar seu aplicativo Vite como um site estático na [renderização](https://render.com/) .

1. Crie uma [conta de renderização](https://dashboard.render.com/register) .

2. No [painel](https://dashboard.render.com/) , clique no **novo** botão e selecione **Site estático** .

3. Conecte sua conta Github/GitLab ou use um repositório público.

4. Especifique o nome e a filial de um projeto.

   - **Comando de construção** : `npm install && npm run build`
   - **Diretório de publicação** : `dist`

5. Clique Em **Criar Site Estático** .

   Seu aplicativo deve ser implantado em `https://<PROJECTNAME>.onrender.com/` .

Por padrão, qualquer novo compromisso empurrado para a ramificação especificada acionará automaticamente uma nova implantação. [O implantação automática](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) pode ser configurado nas configurações do projeto.

Você também pode adicionar um [domínio personalizado](https://render.com/docs/custom-domains) ao seu projeto.

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

Implante seu site estático usando [o FlightControl](https://www.flightcontrol.dev/?ref=docs-vite) seguindo estas [instruções](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite) .

## Hospedagem Estática De Kinsta

Implante seu site estático usando [o Kinsta](https://kinsta.com/static-site-hosting/) seguindo estas [instruções](https://kinsta.com/docs/react-vite-example/) .

## XMIT Hospedagem De Site Estático

Implante seu site estático usando [o XMIT](https://xmit.co) seguindo este [guia](https://xmit.dev/posts/vite-quickstart/) .
