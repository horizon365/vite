# 정적 사이트를 배포합니다

다음 안내서는 일부 공유 가정을 기반으로합니다.

- 기본 빌드 출력 위치 ( `dist` )를 사용하고 있습니다. 이 위치는 [`build.outDir` 사용하여 변경할 수](/ko/config/build-options.md#build-outdir) 있으며이 경우이 가이드의 지침을 외삽 할 수 있습니다.
- NPM을 사용하고 있습니다. 원사 나 다른 패키지 관리자를 사용하는 경우 동등한 명령을 사용하여 스크립트를 실행할 수 있습니다.
- Vite는 프로젝트에서 로컬 개발자 종속성으로 설치되며 다음 NPM 스크립트를 설정합니다.

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

`vite preview` 제작 서버가 아닌 건물을 로컬로 미리보기위한 것이라는 점에 유의해야합니다.

::: tip NOTE
이 가이드는 Vite 사이트의 정적 배포를 수행하기위한 지침을 제공합니다. Vite는 또한 서버 측 렌더링을 지원합니다. SSR은 Node.js에서 동일한 응용 프로그램을 실행하는 지원을 지원하고 HTML에 사전 렌더링하고 마지막으로 클라이언트에서 수분을 공급하는 프론트 엔드 프레임 워크를 나타냅니다. 이 기능에 대해 알아 보려면 [SSR 안내서를](./ssr) 확인하십시오. 반면, 기존 서버 측 프레임 워크와 통합을 찾고 있다면 대신 [백엔드 통합 안내서를](./backend-integration) 확인하십시오.
:::

## 앱 구축

앱을 빌드하기 위해 `npm run build` 명령을 실행할 수 있습니다.

```bash
$ npm run build
```

기본적으로 빌드 출력은 `dist` 으로 배치됩니다. 이 `dist` 폴더를 선호하는 플랫폼에 배포 할 수 있습니다.

### 로컬로 앱을 테스트합니다

앱을 구축하면 `npm run preview` 명령을 실행하여 로컬로 테스트 할 수 있습니다.

```bash
$ npm run preview
```

`vite preview` 명령은 `dist` 에서 `http://localhost:4173` 에서 파일을 제공하는 로컬 정적 웹 서버를 부팅합니다. 지역 환경에서 생산 빌드가 잘 보이는지 쉽게 확인하는 방법입니다.

`--port` 플래그를 인수로 전달하여 서버 포트를 구성 할 수 있습니다.

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

이제 `preview` 명령이 `http://localhost:8080` 에서 서버를 시작합니다.

## Github 페이지

1. 올바른 `base` `vite.config.js` 로 설정하십시오.

   GitHub 페이지 (예 : `www.example.com` )를 통해 `https://<USERNAME>.github.io/` 에 배포하거나 사용자 정의 도메인에 `base` ~ `'/'` 설정하십시오. 또는 기본값이 `'/'` 로 구성되므로 구성에서 `base` 제거 할 수 있습니다.

   `https://<USERNAME>.github.io/<REPO>/` 에 배치하는 경우 (예 : 저장소가 `https://github.com/<USERNAME>/<REPO>` 에있는 경우) `base` ~ `'/<REPO>/'` 설정하십시오.

2. 저장소 설정 페이지에서 GitHub 페이지 구성으로 이동하여 배포 소스를 "GitHub 작업"으로 선택하면 프로젝트를 빌드하고 배포하는 워크 플로우를 만들고 NPM을 사용하여 부양품을 설치하고 빌드하는 샘플 워크 플로우를 만들게됩니다.

   ```yml
   # GitHub 페이지에 정적 컨텐츠를 배포하기위한 간단한 워크 플로
   name: Deploy static content to Pages

   on:
     # 기본 분기를 타겟팅하는 푸시에서 실행됩니다
     push:
       branches: ['main']

     # 액션 탭 에서이 워크 플로를 수동으로 실행할 수 있습니다.
     workflow_dispatch:

   # github 페이지에 배포 할 수 있도록 github_token 권한을 설정합니다.
   permissions:
     contents: read
     pages: write
     id-token: write

   # 동시 배포를 하나씩 허용하십시오
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # 우리가 배포하고 있기 때문에 단일 배포 작업입니다
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
             # DIST 폴더를 업로드하십시오
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

## gitlab 페이지 및 gitlab ci

1. 올바른 `base` `vite.config.js` 로 설정하십시오.

   `https://<USERNAME or GROUP>.gitlab.io/` 으로 배포하는 경우 기본값이 `'/'` 로 `base` 생략 할 수 있습니다.

   예를 들어 `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` 에 배치하는 경우, 예를 들어 저장소는 `https://gitlab.com/<USERNAME>/<REPO>` 이면 `base` ~ `'/<REPO>/'` 설정하십시오.

2. 아래 콘텐츠로 프로젝트의 루트에서 `.gitlab-ci.yml` 이라는 파일을 만듭니다. 콘텐츠를 변경할 때마다 사이트를 구축하고 배포합니다.

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

### CLI를 Netlify

1. [NetLify CLI를](https://cli.netlify.com/) 설치하십시오.
2. `ntl init` 사용하여 새 사이트를 만듭니다.
3. `ntl deploy` 사용하여 배포합니다.

```bash
# NetLify CLI를 설치하십시오
$ npm install -g netlify-cli

# NetLify에서 새 사이트를 만듭니다
$ ntl init

# 고유 미리보기 URL에 배포하십시오
$ ntl deploy
```

NetLify CLI는 검사 할 미리보기 URL을 공유합니다. 생산에 들어갈 준비가되면 `prod` 플래그를 사용하십시오.

```bash
# 사이트를 생산에 배치하십시오
$ ntl deploy --prod
```

### git과 함께 넷리티

1. 코드를 git 리포지토리 (Github, Gitlab, Bitbucket, Azure devops)로 푸시하십시오.
2. NetLify로 [프로젝트를 가져 오십시오](https://app.netlify.com/start) .
3. 해당되는 경우 분기를 선택하고 출력 디렉토리를 선택하고 환경 변수를 설정하십시오.
4. **배포를** 클릭하십시오.
5. Vite 앱이 배포되었습니다!

프로젝트가 가져오고 배포 된 후에는 PUTR 요청과 함께 생산 지점 이외의 지점으로의 모든 후속 푸시가 [미리보기 배포를](https://docs.netlify.com/site-deploys/deploy-previews/) 생성하며 생산 지점 (일반적으로 "기본")에 대한 모든 변경 사항은 [생산 배포를](https://docs.netlify.com/site-deploys/overview/#definitions) 초래합니다.

## Vercel

### Vercel Cli

1. [Vercel CLI를](https://vercel.com/cli) 설치하고 `vercel` 실행하여 배포하십시오.
2. Vercel은 Vite를 사용하고 있음을 감지하고 배포에 대한 올바른 설정을 활성화합니다.
3. 귀하의 응용 프로그램이 배포되었습니다! (예 : [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### git에 대한 vercel

1. 코드를 git 저장소 (Github, Gitlab, Bitbucket)로 푸시하십시오.
2. [Vite 프로젝트를 Vercel로 가져 오십시오](https://vercel.com/new) .
3. Vercel은 Vite를 사용하고 있음을 감지하고 배포에 대한 올바른 설정을 활성화합니다.
4. 귀하의 응용 프로그램이 배포되었습니다! (예 : [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

프로젝트가 가져오고 배포 된 후에는 지점으로의 모든 후속 푸시가 [미리보기 배포를](https://vercel.com/docs/concepts/deployments/environments#preview) 생성하며 생산 지점 (일반적으로 "메인")에 대한 모든 변경으로 인해 [생산 배포가](https://vercel.com/docs/concepts/deployments/environments#production) 발생합니다.

Vercel의 [GIT 통합](https://vercel.com/docs/concepts/git) 에 대해 자세히 알아보십시오.

## CloudFlare 페이지

### Wrangler를 통한 CloudFlare 페이지

1. [Wrangler CLI를](https://developers.cloudflare.com/workers/wrangler/get-started/) 설치하십시오.
2. `wrangler login` 사용하여 CloudFlare 계정으로 Wrangler를 인증하십시오.
3. 빌드 명령을 실행하십시오.
4. `npx wrangler pages deploy dist` 사용하여 배포합니다.

```bash
# Wrangler CLI를 설치하십시오
$ npm install -g wrangler

# CLI에서 CloudFlare 계정에 로그인하십시오
$ wrangler login

# 빌드 명령을 실행하십시오
$ npm run build

# 새 배포를 만듭니다
$ npx wrangler pages deploy dist
```

자산이 업로드 된 후 Wrangler는 귀하에게 사이트를 검사하기위한 미리보기 URL을 제공합니다. CloudFlare 페이지 대시 보드에 로그인하면 새 프로젝트가 표시됩니다.

### Git이있는 CloudFlare 페이지

1. 코드를 git 저장소 (Github, Gitlab)로 푸시하십시오.
2. CloudFlare 대시 보드에 로그인하고 **계정 홈** > **페이지** 에서 계정을 선택하십시오.
3. **새 프로젝트** 및 **Connect GIT** 옵션 만들기를 선택하십시오.
4. 배포하려는 GIT 프로젝트를 선택하고 **설정 시작을** 클릭하십시오.
5. 선택한 vite 프레임 워크에 따라 빌드 설정에서 해당 프레임 워크 사전 설정을 선택하십시오.
6. 그런 다음 저장하고 배포하십시오!
7. 귀하의 응용 프로그램이 배포되었습니다! (예 : `https://<PROJECTNAME>.pages.dev/` )

프로젝트를 가져오고 배포 한 후에는 [분기 빌드 컨트롤](https://developers.cloudflare.com/pages/platform/branch-build-controls/) 에 지정되지 않는 한 모든 후속 푸시는 분기에 [미리보기 배포를](https://developers.cloudflare.com/pages/platform/preview-deployments/) 생성합니다. 생산 지점 (일반적으로 "주")에 대한 모든 변경으로 인해 생산 배포가 발생합니다.

사용자 정의 도메인을 추가하고 페이지에서 사용자 정의 빌드 설정을 처리 할 수도 있습니다. [CloudFlare Pages git 통합](https://developers.cloudflare.com/pages/get-started/#manage-your-site) 에 대해 자세히 알아보십시오.

## Google Firebase

1. [Firebase-Tools가](https://www.npmjs.com/package/firebase-tools) 설치되어 있는지 확인하십시오.

2. 다음 내용으로 프로젝트의 루트에서 `firebase.json` 과 `.firebaserc` 만듭니다.

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

3. `npm run build` 실행 한 후 명령 `firebase deploy` 사용하여 배포하십시오.

## 급등하다

1. 먼저 [서지를](https://www.npmjs.com/package/surge) 설치하십시오.

2. 실행 `npm run build` .

3. `surge dist` 입력하여 서지로 배포하십시오.

`surge dist yourdomain.com` 추가하여 [사용자 정의 도메인](http://surge.sh/help/adding-a-custom-domain) 에 배포 할 수도 있습니다.

## Azure 정적 웹 앱

Microsoft Azure [정적 웹 앱](https://aka.ms/staticwebapps) 서비스로 Vite 앱을 신속하게 배포 할 수 있습니다. 필요 :

- Azure 계정 및 구독 키. [여기에서 무료 Azure 계정을](https://azure.microsoft.com/free) 만들 수 있습니다.
- 앱 코드가 [Github](https://github.com) 로 밀려났습니다.
- [Visual Studio 코드](https://code.visualstudio.com) 의 [SWA 확장](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) .

VS 코드에 확장자를 설치하고 앱 루트로 이동하십시오. 정적 웹 앱 확장을 열고 Azure에 로그인 한 다음 '+'부호를 클릭하여 새로운 정적 웹 앱을 만듭니다. 사용할 가입 키를 지정하라는 메시지가 표시됩니다.

연장에서 시작한 마법사를 따라 앱의 이름을 부여하고 프레임 워크 사전 설정을 선택한 다음 앱 루트 (일반적으로 `/` )를 지정하고 파일 위치를 구축하십시오 `/dist` . 마법사가 실행되며 `.github` 폴더에서 저장소에서 GitHub 액션을 만듭니다.

이 작업은 앱을 배포하기 위해 작동하며 (Repo의 액션 탭에서 진행 상황을 시청) 성공적으로 완료되면 GitHub 동작이 실행될 때 나타나는 '브라우즈 웹 사이트 브라우즈 웹 사이트'버튼을 클릭하여 Extension의 진행 창에 제공된 주소에서 앱을 볼 수 있습니다.

## 세우다

Vite 앱을 [Render](https://render.com/) 의 정적 사이트로 배포 할 수 있습니다.

1. [렌더 계정을](https://dashboard.render.com/register) 만듭니다.

2. [대시 보드](https://dashboard.render.com/) 에서 **새** 버튼을 클릭하고 **정적 사이트를** 선택하십시오.

3. github/gitlab 계정을 연결하거나 공개 저장소를 사용하십시오.

4. 프로젝트 이름과 지점을 지정하십시오.

   - **빌드 명령** : `npm install && npm run build`
   - **게시 디렉토리** : `dist`

5. **정적 사이트 작성을** 클릭합니다.

   앱은 `https://<PROJECTNAME>.onrender.com/` 에 배치해야합니다.

기본적으로 지정된 지점으로 밀려난 새로운 커밋은 자동으로 새 배포를 트리거합니다. 프로젝트 설정에서 [자동 배포를](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) 구성 할 수 있습니다.

프로젝트에 [사용자 정의 도메인을](https://render.com/docs/custom-domains) 추가 할 수도 있습니다.

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

## 비행 제어

이 [지침](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite) 에 따라 [FlightControl을](https://www.flightcontrol.dev/?ref=docs-vite) 사용하여 정적 사이트를 배포하십시오.

## Kinsta 정적 사이트 호스팅

이 [지침](https://kinsta.com/docs/react-vite-example/) 에 따라 [Kinsta를](https://kinsta.com/static-site-hosting/) 사용하여 정적 사이트를 배포하십시오.

## XMIT 정적 사이트 호스팅

이 [안내서](https://xmit.dev/posts/vite-quickstart/) 에 따라 [XMIT을](https://xmit.co) 사용하여 정적 사이트를 배포하십시오.
