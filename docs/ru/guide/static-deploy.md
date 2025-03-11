# Развертывание Статического Сайта

Следующие гиды основаны на некоторых общих предположениях:

- Вы используете место вывода сборки по умолчанию ( `dist` ). Это место [может быть изменено с помощью `build.outDir`](/en/config/build-options.md#build-outdir) , и вы можете экстраполировать инструкции из этих руководств в этом случае.
- Вы используете NPM. Вы можете использовать эквивалентные команды для запуска сценариев, если вы используете пряжу или других менеджеров пакетов.
- VITE установлен как локальная зависимость DEV в вашем проекте, и вы установили следующие сценарии NPM:

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Важно отметить, что `vite preview` предназначено для предварительного просмотра сборки локально, а не для производственного сервера.

::: tip NOTE
Эти руководства предоставляют инструкции по выполнению статического развертывания вашего сайта Vite. VITE также поддерживает рендеринг на стороне сервера. SSR относится к фронтальным рамкам, которые поддерживают запуск того же приложения в node.js, предварительно распространяют его в HTML и, наконец, увлажняют его на клиенте. Проверьте [руководство SSR](./ssr) , чтобы узнать об этой функции. С другой стороны, если вы ищете интеграцию с традиционными фреймворками на стороне сервера, вместо этого ознакомьтесь [с руководством по интеграции Backend](./backend-integration) .
:::

## Создание приложения

Вы можете запустить команду `npm run build` для создания приложения.

```bash
$ npm run build
```

По умолчанию выход сборки будет размещен на `dist` . Вы можете развернуть эту `dist` папку на любую из предпочтительных платформ.

### Тестирование Приложения Локально

После того, как вы создали приложение, вы можете проверить его локально, выполнив команду `npm run preview` .

```bash
$ npm run preview
```

Команда `vite preview` будет загружать локальный статический веб -сервер, который обслуживает файлы из `dist` в `http://localhost:4173` . Это простой способ проверить, выглядит ли производственная сборка нормальной в вашей местной среде.

Вы можете настроить порт сервера, передавая флаг `--port` в качестве аргумента.

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Теперь команда `preview` запустит сервер в `http://localhost:8080` .

## GitHub Pages

1. Установите правильный `base` в `vite.config.js` .

   Если вы развернете до `https://<USERNAME>.github.io/` или в пользовательский домен через страницы GitHub (например, `www.example.com` ), установите `base` `'/'` В качестве альтернативы, вы можете удалить `base` из конфигурации, так как по умолчанию до `'/'` .

   Если вы развернете до `https://<USERNAME>.github.io/<REPO>/` (например, ваш репозиторий на `https://github.com/<USERNAME>/<REPO>` ), то установите `base` `'/<REPO>/'`

2. Перейдите на конфигурацию страниц GitHub на странице «Настройки репозитория» и выберите источник развертывания в качестве «действий GitHub», это приведет к созданию рабочего процесса, который создает и развертывает ваш проект, приводится образец рабочего процесса, который устанавливает зависимости и строительство с использованием NPM, предоставляется: Предусмотрен:

   ```yml
   # Простой рабочий процесс для развертывания статического контента на страницы GitHub
   name: Deploy static content to Pages

   on:
     # Запускается на толкании, нацеленном на ветвь по умолчанию
     push:
       branches: ['main']

     # Позволяет вам запустить этот рабочий процесс вручную с вкладки Actions
     workflow_dispatch:

   # Устанавливает разрешения github_token, чтобы разрешить развертывание на страницы GitHub
   permissions:
     contents: read
     pages: write
     id-token: write

   # Разрешить одновременное развертывание
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # Одиночное развертывание, так как мы только что развертываем
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
             # Загрузите Dist Polder
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

## Гитлаб страницы и gitlab ci

1. Установите правильный `base` в `vite.config.js` .

   Если вы развернете до `https://<USERNAME or GROUP>.gitlab.io/` , вы можете опустить `base` поскольку это по умолчанию до `'/'` .

   Если вы развернете до `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` , например, ваш репозиторий составляет `https://gitlab.com/<USERNAME>/<REPO>` , то установите от `base` до `'/<REPO>/'` .

2. Создайте файл с именем `.gitlab-ci.yml` в корне вашего проекта с контентом ниже. Это будет создавать и развернуть ваш сайт, когда вы вносите изменения в свой контент:

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

## NetLify

### NetLify CLI

1. Установите [NetLify CLI](https://cli.netlify.com/) .
2. Создайте новый сайт, используя `ntl init` .
3. Развернуть с помощью `ntl deploy` .

```bash
# Установите CLI NetLify
$ npm install -g netlify-cli

# Создайте новый сайт в NetLify
$ ntl init

# Развернуть на уникальный URL -адрес предварительного просмотра
$ ntl deploy
```

CLI NetLify поделится с вами предварительным URL для проверки. Когда вы будете готовы перейти в производство, используйте флаг `prod` :

```bash
# Развернуть сайт в производство
$ ntl deploy --prod
```

### NetLify с git

1. Встаньте свой код в репозиторий GIT (GitHub, Gitlab, Bitbucket, Azure DevOps).
2. [Импортировать проект](https://app.netlify.com/start) в NetLify.
3. Выберите ветвь, выходной каталог и настройте переменные среды, если применимо.
4. Нажмите на **развертывание** .
5. Ваше приложение Vite развернуто!

После того, как ваш проект был импортирован и развернут, все последующие толчки в филиалы, отличные от производственного филиала, а также запросы на привлечение будут генерировать [развертывание предварительного просмотра](https://docs.netlify.com/site-deploys/deploy-previews/) , и все изменения, внесенные в производственную филиал (обычно «основной»), приведут к [развертыванию производства](https://docs.netlify.com/site-deploys/overview/#definitions) .

## Вертел

### Vercel Cli

1. Установите [CLI Vercel](https://vercel.com/cli) и запустите `vercel` для развертывания.
2. Vercel обнаружит, что вы используете VITE, и будет включать правильные настройки для вашего развертывания.
3. Ваше приложение развернуто! (например, [Vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel for git

1. Встаньте свой код в свой репозиторий GIT (GitHub, Gitlab, Bitbucket).
2. [Импортируйте свой проект Vite](https://vercel.com/new) в Vercel.
3. Vercel обнаружит, что вы используете VITE, и будет включать правильные настройки для вашего развертывания.
4. Ваше приложение развернуто! (например, [Vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

После того, как ваш проект будет импортирован и развернут, все последующие толчки в филиалы будут генерировать [развертывание предварительного просмотра](https://vercel.com/docs/concepts/deployments/environments#preview) , и все изменения, внесенные в производственную филиал (обычно «основной»), приведут к [развертыванию производства](https://vercel.com/docs/concepts/deployments/environments#production) .

Узнайте больше о [интеграции GIT](https://vercel.com/docs/concepts/git) Vercel.

## CloudFlare Pages

### Страницы CloudFlare Через Wrangler

1. Установите [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) .
2. Аутентифицируйте Wrangler с вашей учетной записью CloudFlare, используя `wrangler login` .
3. Запустите команду сборки.
4. Развернуть с помощью `npx wrangler pages deploy dist` .

```bash
# Установите Wrangler CLI
$ npm install -g wrangler

# Войти в учетную запись CloudFlare от CLI
$ wrangler login

# Запустите свою команду сборки
$ npm run build

# Создайте новое развертывание
$ npx wrangler pages deploy dist
```

После того, как ваши активы будут загружены, Wrangler предоставит вам URL -адрес предварительного просмотра для проверки вашего сайта. Когда вы войдете в панель панели CloudFlare Pages, вы увидите свой новый проект.

### Страницы CloudFlare С GIT

1. Встаньте свой код в свой репозиторий GIT (GitHub, Gitlab).
2. Войдите в приборную панель CloudFlare и выберите свою учетную запись в **учетной записи Home** > **Страницы** .
3. Выберите **«Создать новый проект»** и опцию **Connect GIT** .
4. Выберите проект GIT, который вы хотите развернуть, и нажмите **«Настройка»**
5. Выберите соответствующую предварительную установку Framework в настройке сборки в зависимости от выбранной вами структуры Vite.
6. Затем сохраните и разверните!
7. Ваше приложение развернуто! (например `https://<PROJECTNAME>.pages.dev/` )

После того, как ваш проект будет импортирован и развернут, все последующие толчки в филиалы будут генерировать [развертывание предварительного просмотра,](https://developers.cloudflare.com/pages/platform/preview-deployments/) если не указано в [управлении вашей филиалом](https://developers.cloudflare.com/pages/platform/branch-build-controls/) . Все изменения в производственном филиале (обычно «основной») приведут к развертыванию производства.

Вы также можете добавить пользовательские домены и обрабатывать настройки настраивания на страницах. Узнайте больше о [страницах CloudFlare GIT Integration](https://developers.cloudflare.com/pages/get-started/#manage-your-site) .

## Google Firebase

1. Убедитесь, что у вас установлены [инструменты Firebase](https://www.npmjs.com/package/firebase-tools) .

2. Создайте `firebase.json` и `.firebaserc` в корне вашего проекта со следующим контентом:

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

3. После запуска `npm run build` , развернуть с помощью команды `firebase deploy` .

## Всплеск

1. Сначала установите [Surge](https://www.npmjs.com/package/surge) , если вы еще этого не сделали.

2. Запустить `npm run build` .

3. Развернуть для всплеска, набрав `surge dist` .

Вы также можете развернуть в [пользовательском домене](http://surge.sh/help/adding-a-custom-domain) , добавив `surge dist yourdomain.com` .

## Azure Статические Веб -Приложения

Вы можете быстро развернуть свое приложение Vite с помощью службы Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps) . Вам нужно:

- Azure Account и ключ подписки. Вы можете создать [бесплатную учетную запись Azure здесь](https://azure.microsoft.com/free) .
- Код вашего приложения наставил на [GitHub](https://github.com) .
- [Расширение SWA](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) в [коде Visual Studio](https://code.visualstudio.com) .

Установите расширение в VS -коде и перейдите к корне приложения. Откройте расширение статических веб -приложений, войдите в Azure и нажмите знак «+», чтобы создать новое статическое веб -приложение. Вам будет предложено назначить, какой ключ подписки использовать.

Следуйте мастеру, запущенному расширением, чтобы дать вашему приложению имя, выберите предварительную установку Framework и обознатите корень приложения (обычно `/` ) и встроенное местоположение файла `/dist` . Мастер будет работать и создаст действие GitHub в вашем репо в `.github` папке.

Действие будет работать для развертывания вашего приложения (посмотрите его прогресс на вкладке «Действия вашего репо»), и, когда вы успешно завершены, вы можете просмотреть свое приложение в адресе, указанном в окне «Прогресс расширения», нажав кнопку «Обзор веб -сайта», которая появляется, когда действие GitHub выполняется.

## Оказывать

Вы можете развернуть свое приложение Vite в качестве статического сайта на [рендеринге](https://render.com/) .

1. Создайте [учетную запись рендеринга](https://dashboard.render.com/register) .

2. На [приборной панели](https://dashboard.render.com/) нажмите **новую** кнопку и выберите **«Статический сайт»** .

3. Подключите свою учетную запись GitHub/Gitlab или используйте общественный репозиторий.

4. Укажите название проекта и филиал.

   - **Команда сборки** : `npm install && npm run build`
   - **Опубликовать каталог** : `dist`

5. Нажмите **«Создать Статический Сайт»** .

   Ваше приложение должно быть развернуто на `https://<PROJECTNAME>.onrender.com/` .

По умолчанию любой новый коммит, выдвинутый в указанную филиал, автоматически запустит новое развертывание. [Auto-Deploy](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) может быть настроен в настройках проекта.

Вы также можете добавить [пользовательский домен](https://render.com/docs/custom-domains) в свой проект.

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

Разверните свой статический сайт, используя [FlightControl](https://www.flightcontrol.dev/?ref=docs-vite) , следуя этим [инструкциям](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite) .

## Kinsta Static Hosting Сайта

Разверните свой статический сайт, используя [Kinsta](https://kinsta.com/static-site-hosting/) , следуя этим [инструкциям](https://kinsta.com/docs/react-vite-example/) .

## Xmit Static Hosting Сайта

Разверните свой статический сайт, используя [XMIT](https://xmit.co) , следуя этому [руководству](https://xmit.dev/posts/vite-quickstart/) .
