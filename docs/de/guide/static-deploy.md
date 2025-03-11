# Bereitstellung Einer Statischen Site

Die folgenden Anleitungen basieren auf einigen gemeinsamen Annahmen:

- Sie verwenden den Standard -Build -Ausgangsposition ( `dist` ). Dieser Ort [kann mit `build.outDir` geändert werden](/de/config/build-options.md#build-outdir) und Sie können in diesem Fall Anweisungen aus diesen Leitfäden extrapolieren.
- Sie verwenden NPM. Sie können äquivalente Befehle verwenden, um die Skripte auszuführen, wenn Sie Garn oder andere Paketmanager verwenden.
- VITE ist als lokale Devisenabhängigkeit in Ihrem Projekt installiert, und Sie haben die folgenden NPM -Skripte eingerichtet:

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Es ist wichtig zu beachten, dass `vite preview` für die Vorschau des Builds lokal und nicht als Produktionsserver bestimmt ist.

::: tip NOTE
Diese Leitfäden geben Anweisungen zur Durchführung einer statischen Bereitstellung Ihrer vite Site. VITE unterstützt auch die Server -Side -Rendering. SSR bezieht sich auf Front-End-Frameworks, die unterstützen, die gleiche Anwendung in Node.js auszuführen, sie auf HTML vorzubereiten und schließlich auf dem Client zu feuchtigen. Schauen Sie sich den [SSR -Leitfaden](./ssr) an, um mehr über diese Funktion zu erfahren. Wenn Sie dagegen nach Integration mit herkömmlichen serverseitigen Frameworks suchen, lesen Sie stattdessen den [Backend Integration Guide](./backend-integration) .
:::

## Aufbau der App

Sie können `npm run build` Befehl ausführen, um die App zu erstellen.

```bash
$ npm run build
```

Standardmäßig wird die Build -Ausgabe bei `dist` platziert. Sie können diesen `dist` -Ordner auf einer Ihrer bevorzugten Plattformen bereitstellen.

### Testen Sie Die App Lokal

Sobald Sie die App erstellt haben, können Sie sie lokal testen, indem Sie `npm run preview` Befehl ausführen.

```bash
$ npm run preview
```

Mit dem Befehl `vite preview` startet ein lokaler statischer Webserver, der die Dateien von `dist` unter `http://localhost:4173` bedient. Es ist eine einfache Möglichkeit, zu überprüfen, ob die Produktionsbau in Ihrer lokalen Umgebung in Ordnung aussieht.

Sie können den Port des Servers konfigurieren, indem Sie das `--port` -Flag als Argument übergeben.

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Jetzt startet der Befehl `preview` den Server bei `http://localhost:8080` .

## Github -Seiten

1. Stellen Sie die richtigen `base` in `vite.config.js` ein.

   Wenn Sie über GitHub -Seiten (z. B. `www.example.com` ) für `https://<USERNAME>.github.io/` oder eine benutzerdefinierte Domäne bereitgestellt werden, setzen Sie `base` bis `'/'` . Alternativ können Sie `base` aus der Konfiguration entfernen, da sie standardmäßig `'/'` ist.

   Wenn Sie auf `https://<USERNAME>.github.io/<REPO>/` bereitstellen (z. B. Ihr Repository bei `https://github.com/<USERNAME>/<REPO>` ), setzen Sie `base` auf `'/<REPO>/'` .

2. Gehen Sie auf der Seite "GitHub Pages" auf der Seite "Repository -Einstellungen" und wählen Sie die Bereitstellungsquelle als "Github -Aktionen". Dadurch wird ein Workflow erstellt, der Ihr Projekt erstellt und bereitstellt, ein Beispiel -Workflow, der Abhängigkeiten und Builds mithilfe von NPM installiert, wird angegeben:

   ```yml
   # Einfacher Workflow zum Bereitstellen statischer Inhalte für Github -Seiten
   name: Deploy static content to Pages

   on:
     # Läuft auf Pushs, die auf die Standardzweig abzielen
     push:
       branches: ['main']

     # Ermöglicht Ihnen, diesen Workflow manuell über die Registerkarte Aktionen auszuführen
     workflow_dispatch:

   # Legt die GitHub_Token -Berechtigungen fest, damit die Bereitstellung auf Github -Seiten die Bereitstellung ermöglicht
   permissions:
     contents: read
     pages: write
     id-token: write

   # Ermöglichen Sie eine gleichzeitige Bereitstellung
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # Single -Bereitstellung Job, da wir gerade bereitstellen
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
             # DIST -Ordner hochladen
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

## Gitlab -Seiten und Gitlab CI

1. Stellen Sie die richtigen `base` in `vite.config.js` ein.

   Wenn Sie zu `https://<USERNAME or GROUP>.gitlab.io/` bereitstellen, können Sie `base` weglassen, da es standardmäßig `'/'` ist.

   Wenn Sie auf `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` bereitstellen, liegt Ihr Repository beispielsweise bei `https://gitlab.com/<USERNAME>/<REPO>` , dann setzen Sie `base` auf `'/<REPO>/'` .

2. Erstellen Sie eine Datei namens `.gitlab-ci.yml` im Root Ihres Projekts mit dem folgenden Inhalt. Dadurch wird Ihre Website erstellt und bereitgestellt, wenn Sie Änderungen an Ihren Inhalten vornehmen:

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

1. Installieren Sie die [Netlify CLI](https://cli.netlify.com/) .
2. Erstellen Sie eine neue Site mit `ntl init` .
3. Bereitstellung mit `ntl deploy` .

```bash
# Installieren Sie die Netlify CLI
$ npm install -g netlify-cli

# Erstellen Sie eine neue Website in Netlify
$ ntl init

# Bereitstellung in einer eindeutigen Vorschau -URL
$ ntl deploy
```

Die Netlify CLI wird Ihnen eine Vorschau -URL zur Inspektion teilen. Wenn Sie bereit sind, in die Produktion zu gehen, verwenden Sie die `prod` Flagge:

```bash
# Stellen Sie die Website in Produktion ein
$ ntl deploy --prod
```

### Netlify mit Git

1. Drücken Sie Ihren Code in ein Git -Repository (Github, Gitlab, Bitbucket, Azure DevOps).
2. [Importieren Sie das Projekt](https://app.netlify.com/start) in Netlify.
3. Wählen Sie das Zweigverzeichnis, das Ausgangsverzeichnis und richten Sie gegebenenfalls Umgebungsvariablen ein.
4. Klicken Sie auf **Bereitstellung** .
5. Ihre vite App wird bereitgestellt!

Nachdem Ihr Projekt importiert und bereitgestellt wurde, werden alle nachfolgenden Drücken zu anderen Zweigen als der Produktionszweig sowie Pull -Anfragen [Vorschau -Bereitstellungen](https://docs.netlify.com/site-deploys/deploy-previews/) generiert, und alle Änderungen an der Produktionszweig (üblicherweise „Haupt“) führen zu einer [Produktionsbereitstellung](https://docs.netlify.com/site-deploys/overview/#definitions) .

## Vercel

### Vercel Cli

1. Installieren Sie die [Vercel CLI](https://vercel.com/cli) und führen Sie `vercel` aus, um bereitzustellen.
2. Vercel erkennt, dass Sie VITE verwenden und die richtigen Einstellungen für Ihre Bereitstellung aktivieren.
3. Ihre Anwendung wird bereitgestellt! (zB [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel für Git

1. Drücken Sie Ihren Code in Ihr Git -Repository (Github, Gitlab, Bitbucket).
2. [Importieren Sie Ihr vite -Projekt](https://vercel.com/new) in Vercel.
3. Vercel erkennt, dass Sie VITE verwenden und die richtigen Einstellungen für Ihre Bereitstellung aktivieren.
4. Ihre Anwendung wird bereitgestellt! (zB [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

Nachdem Ihr Projekt importiert und bereitgestellt wurde, generieren alle nachfolgenden Vorschriften für Zweige [Vorschau -Bereitstellungen](https://vercel.com/docs/concepts/deployments/environments#preview) , und alle Änderungen an der Produktionszweig (üblicherweise „Haupt“) führen zu einer [Produktionsbereitstellung](https://vercel.com/docs/concepts/deployments/environments#production) .

Erfahren Sie mehr über Vercels [Git -Integration](https://vercel.com/docs/concepts/git) .

## Cloudflare -Seiten

### Wolkenseiten Über Wrangler

1. Installieren Sie [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) .
2. Authentifizieren Wrangler mit Ihrem CloudFlare -Konto mit `wrangler login` .
3. Führen Sie Ihren Build -Befehl aus.
4. Bereitstellung mit `npx wrangler pages deploy dist` .

```bash
# Installieren Sie Wrangler CLI
$ npm install -g wrangler

# Melden Sie sich als Cloudflare -Konto von CLI an
$ wrangler login

# Führen Sie Ihren Build -Befehl aus
$ npm run build

# Erstellen Sie eine neue Bereitstellung
$ npx wrangler pages deploy dist
```

Nachdem Ihr Vermögen hochgeladen wurde, gibt Ihnen Wrangler eine Vorschau -URL, um Ihre Website zu inspizieren. Wenn Sie sich in das Dashboard von CloudFlare Pages anmelden, werden Sie Ihr neues Projekt sehen.

### Wolkenseiten Mit Git

1. Drücken Sie Ihren Code in Ihr Git -Repository (Github, GitLab).
2. Melden Sie sich beim CloudFlare -Dashboard an und wählen Sie Ihr Konto auf **dem Konto Home** > **Seiten** aus.
3. Wählen Sie **ein neues Projekt** und die Option **"Connect Git"** erstellen.
4. Wählen Sie das GIT -Projekt aus, das Sie bereitstellen möchten, und klicken Sie auf **Start -Setup** klicken
5. Wählen Sie das entsprechende Framework -Voreinstellung in der Build -Einstellung je nach ausgewählten vite -Framework aus.
6. Dann speichern und bereitstellen!
7. Ihre Anwendung wird bereitgestellt! (zB `https://<PROJECTNAME>.pages.dev/` )

Nachdem Ihr Projekt importiert und bereitgestellt wurde, generieren alle nachfolgenden Vorschriften an Zweige [Vorschau -Bereitstellungen,](https://developers.cloudflare.com/pages/platform/preview-deployments/) sofern nicht in Ihren [Zweig -Build -Steuerelementen](https://developers.cloudflare.com/pages/platform/branch-build-controls/) angegeben sind. Alle Änderungen an der Produktionszweig (üblicherweise „Haupt“) führen zu einem Produktionseinsatz.

Sie können auch benutzerdefinierte Domänen hinzufügen und benutzerdefinierte Build -Einstellungen auf Seiten verarbeiten. Erfahren Sie mehr über [Cloudflare -Seiten Git -Integration](https://developers.cloudflare.com/pages/get-started/#manage-your-site) .

## Google Firebase

1. Stellen Sie sicher, dass Sie [Firebase-Tools](https://www.npmjs.com/package/firebase-tools) installiert haben.

2. Erstellen Sie mit dem folgenden Inhalt `firebase.json` und `.firebaserc` an der Stammin Ihres Projekts:

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

3. Nach dem Ausführen `npm run build` verwenden Sie den Befehl `firebase deploy` .

## Anstieg

1. Installieren Sie zuerst [Surge](https://www.npmjs.com/package/surge) , wenn Sie es noch nicht getan haben.

2. Lauf `npm run build` .

3. Bereitstellen zum Schreiben durch Eingabe `surge dist` .

Sie können auch in einer [benutzerdefinierten Domain](http://surge.sh/help/adding-a-custom-domain) bereitstellen, indem Sie `surge dist yourdomain.com` hinzufügen.

## Azure Statische Web -Apps

Sie können Ihre Vite -App schnell mit dem Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps) -Dienst bereitstellen. Sie brauchen:

- Ein Azure -Konto und ein Abonnementschlüssel. Sie können [hier ein kostenloses Azure -Konto](https://azure.microsoft.com/free) erstellen.
- Ihr App -Code wurde nach [GitHub](https://github.com) gedrückt.
- Die [SWA -Erweiterung](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) im [Visual Studio -Code](https://code.visualstudio.com) .

Installieren Sie die Erweiterung in VS -Code und navigieren Sie zu Ihrem App -Stamm. Öffnen Sie die Erweiterung der statischen Web -Apps, melden Sie sich bei Azure an und klicken Sie auf das Zeichen "+", um eine neue statische Web -App zu erstellen. Sie werden aufgefordert, zu bestimmen, welcher Abonnementschlüssel verwendet werden soll.

Folgen Sie dem von der Erweiterung gestarteten Assistenten, um Ihrer App einen Namen zu geben, wählen Sie ein Framework -Voreinstellung und bezeichnen Sie das App -Root (normalerweise `/` ) und erstellte Dateisposition `/dist` . Der Assistent wird ausgeführt und erstellt eine Github -Aktion in Ihrem Repo in einem `.github` -Ordner.

In der Aktion werden Ihre App bereitgestellt (sehen Sie sich die Fortschritte in der Registerkarte "Aktionen Ihres Repos an). Wenn Sie erfolgreich abgeschlossen sind, können Sie Ihre App in der Adresse des Fortschrittsfensters der Erweiterung angezeigt, indem Sie auf die Schaltfläche„ Durchsuchen Sie die Website durchsuchen “, die angezeigt wird, wenn die Github -Aktion ausgeführt wurde.

## Machen

Sie können Ihre Vite -App als statische Site auf [Render](https://render.com/) bereitstellen.

1. Erstellen Sie ein [Render -Konto](https://dashboard.render.com/register) .

2. Klicken Sie im [Dashboard](https://dashboard.render.com/) auf die **neue** Schaltfläche und wählen Sie **statische Site** .

3. Schließen Sie Ihr Github/GitLab -Konto an oder verwenden Sie ein öffentliches Repository.

4. Geben Sie einen Projektnamen und einen Zweig an.

   - **Befehl erstellen** : `npm install && npm run build`
   - **Veröffentlichung veröffentlichen** : `dist`

5. Klicken Sie Auf **Statische Site Erstellen** .

   Ihre App sollte bei `https://<PROJECTNAME>.onrender.com/` bereitgestellt werden.

Standardmäßig wird ein neues Komitee, das an die angegebene Filiale übertragen wird, automatisch eine neue Bereitstellung ausgelöst. [Auto-Deploy](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) kann in den Projekteinstellungen konfiguriert werden.

Sie können Ihrem Projekt auch eine [benutzerdefinierte Domain](https://render.com/docs/custom-domains) hinzufügen.

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

Stellen Sie Ihre statische Website mit [FlightControl](https://www.flightcontrol.dev/?ref=docs-vite) ein, indem Sie diese [Anweisungen](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite) befolgen.

## Hosting Der Statischen Kinsta -Site

Stellen Sie Ihre statische Site mit [Kinsta](https://kinsta.com/static-site-hosting/) ein, indem Sie diese [Anweisungen](https://kinsta.com/docs/react-vite-example/) befolgen.

## Xmit Statische Site -Hosting

Stellen Sie Ihre statische Site mithilfe von [XMIT](https://xmit.co) an, indem Sie diesem [Handbuch](https://xmit.dev/posts/vite-quickstart/) folgen.
