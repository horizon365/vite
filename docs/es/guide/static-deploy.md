# Implementar Un Sitio Estático

Las siguientes guías se basan en algunos supuestos compartidos:

- Está utilizando la ubicación de salida de compilación predeterminada ( `dist` ). Esta ubicación [se puede cambiar usando `build.outDir`](/es/config/build-options.md#build-outdir) , y puede extrapolar las instrucciones de estas guías en ese caso.
- Estás usando NPM. Puede usar comandos equivalentes para ejecutar los scripts si está utilizando hilo u otros administradores de paquetes.
- Vite se instala como una dependencia de desarrollo local en su proyecto, y usted tiene la configuración de los siguientes scripts NPM:

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Es importante tener en cuenta que `vite preview` está destinado a obtener una vista previa de la compilación localmente y no se entiende como un servidor de producción.

::: tip NOTE
Estas guías proporcionan instrucciones para realizar una implementación estática de su sitio vite. Vite también admite la representación del lado del servidor. SSR se refiere a los marcos front-end que admiten ejecutar la misma aplicación en Node.js, prevenirla a HTML y finalmente hidratarla en el cliente. Echa un vistazo a la [guía SSR](./ssr) para conocer esta función. Por otro lado, si está buscando integración con los marcos tradicionales del lado del servidor, consulte la [Guía de integración de backend](./backend-integration) .
:::

## Construyendo la aplicación

Puede ejecutar el comando `npm run build` para construir la aplicación.

```bash
$ npm run build
```

Por defecto, la salida de compilación se colocará en `dist` . Puede implementar esta carpeta `dist` en cualquiera de sus plataformas preferidas.

### Probar La Aplicación Localmente

Una vez que haya creado la aplicación, puede probarla localmente ejecutando el comando `npm run preview` .

```bash
$ npm run preview
```

El comando `vite preview` iniciará un servidor web estático local que sirve los archivos de `dist` a `http://localhost:4173` . Es una manera fácil de verificar si la compilación de producción se ve bien en su entorno local.

Puede configurar el puerto del servidor pasando el indicador `--port` como argumento.

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Ahora el comando `preview` iniciará el servidor en `http://localhost:8080` .

## Páginas De Github

1. Establezca el `base` correcto en `vite.config.js` .

   Si se implementa en `https://<USERNAME>.github.io/` , o en un dominio personalizado a través de las páginas de GitHub (por ejemplo, `www.example.com` ), establezca `base` a `'/'` . Alternativamente, puede eliminar `base` de la configuración, ya que es predeterminado a `'/'` .

   Si se implementa en `https://<USERNAME>.github.io/<REPO>/` (por ejemplo, su repositorio está en `https://github.com/<USERNAME>/<REPO>` ), entonces establezca `base` a `'/<REPO>/'` .

2. Vaya a su configuración de páginas GitHub en la página de configuración del repositorio y elija la fuente de implementación como "acciones de GitHub", esto le llevará a crear un flujo de trabajo que construya e implementa su proyecto, se proporciona un flujo de trabajo de muestra que instala dependencias y compilaciones utilizando NPM:

   ```yml
   # Flujo de trabajo simple para implementar contenido estático en páginas Github
   name: Deploy static content to Pages

   on:
     # Ejecuta con Pushes dirigido a la rama predeterminada
     push:
       branches: ['main']

     # Le permite ejecutar este flujo de trabajo manualmente desde la pestaña Acciones
     workflow_dispatch:

   # Establece los permisos GitHub_Token para permitir la implementación en las páginas de GitHub
   permissions:
     contents: read
     pages: write
     id-token: write

   # Permitir una implementación concurrente
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # Trabajo de implementación única ya que solo estamos implementando
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
             # Carga de carpeta DIST
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

## Páginas Gitlab y Gitlab CI

1. Establezca el `base` correcto en `vite.config.js` .

   Si está implementando en `https://<USERNAME or GROUP>.gitlab.io/` , puede omitir `base` ya que el valor predeterminado es de `'/'` .

   Si se está implementando en `https://<USERNAME or GROUP>.gitlab.io/<REPO>/` , por ejemplo, su repositorio está en `https://gitlab.com/<USERNAME>/<REPO>` , entonces establezca `base` a `'/<REPO>/'` .

2. Cree un archivo llamado `.gitlab-ci.yml` en la raíz de su proyecto con el contenido a continuación. Esto construirá e implementará su sitio cada vez que realice cambios en su contenido:

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

## Netlificar

### Netlify CLI

1. Instale el [CLI NetLify](https://cli.netlify.com/) .
2. Crea un nuevo sitio usando `ntl init` .
3. Implementar usando `ntl deploy` .

```bash
# Instale el CLI netlify
$ npm install -g netlify-cli

# Crear un nuevo sitio en Netlify
$ ntl init

# Desplegar a una URL de vista previa única
$ ntl deploy
```

La CLI NetLify compartirá con usted una URL de vista previa para inspeccionar. Cuando esté listo para entrar en producción, use la bandera `prod` :

```bash
# Desplegar el sitio en producción
$ ntl deploy --prod
```

### Netlify con git

1. Empuje su código a un repositorio Git (GitHub, GitLab, Bitbucket, Azure DevOps).
2. [Importar el proyecto](https://app.netlify.com/start) para netlify.
3. Elija la rama, el directorio de salida y la configuración de las variables de entorno si corresponde.
4. Haga clic en **Implementar** .
5. ¡Su aplicación Vite está implementada!

Después de que su proyecto se haya importado e implementado, todos los empujes posteriores a las sucursales distintas de la rama de producción junto con las solicitudes de extracción generarán [implementaciones de vista previa](https://docs.netlify.com/site-deploys/deploy-previews/) , y todos los cambios realizados en la rama de producción (comúnmente "principal") darán como resultado una [implementación de producción](https://docs.netlify.com/site-deploys/overview/#definitions) .

## Velo

### CLI VERCEL

1. Instale el [Vercel CLI](https://vercel.com/cli) y ejecute `vercel` para implementar.
2. Vercel detectará que está utilizando VITE y habilitará la configuración correcta para su implementación.
3. ¡Su aplicación está implementada! (por ejemplo [, vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel para Git

1. Empuje su código a su repositorio Git (GitHub, GitLab, Bitbucket).
2. [Importe su proyecto VITE](https://vercel.com/new) en VERCEL.
3. Vercel detectará que está utilizando VITE y habilitará la configuración correcta para su implementación.
4. ¡Su aplicación está implementada! (por ejemplo [, vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/) )

Después de que su proyecto se haya importado e implementado, todos los empujes posteriores a las sucursales generarán [implementaciones de vista previa](https://vercel.com/docs/concepts/deployments/environments#preview) , y todos los cambios realizados en la rama de producción (comúnmente "principal") darán como resultado una [implementación de producción](https://vercel.com/docs/concepts/deployments/environments#production) .

Obtenga más información sobre [la integración Git](https://vercel.com/docs/concepts/git) de Vercel.

## Páginas De Cloudflare

### Páginas De CloudFlare a Través De Wrangler

1. Instale [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) .
2. Autenticar Wrangler con su cuenta CloudFlare usando `wrangler login` .
3. Ejecute su comando de compilación.
4. Implementar usando `npx wrangler pages deploy dist` .

```bash
# Instalar Wrangler CLI
$ npm install -g wrangler

# Inicie sesión en la cuenta de CloudFlare desde CLI
$ wrangler login

# Ejecute su comando de compilación
$ npm run build

# Crear una nueva implementación
$ npx wrangler pages deploy dist
```

Después de cargar sus activos, Wrangler le dará una URL de vista previa para inspeccionar su sitio. Cuando inicie sesión en el tablero de páginas de CloudFlare, verá su nuevo proyecto.

### Páginas De CloudFlare Con Git

1. Empuje su código a su repositorio Git (GitHub, GitLab).
2. Inicie sesión en el tablero de CloudFlare y seleccione su cuenta en **la cuenta Inicio** > **Páginas** .
3. Seleccione **Crear un nuevo proyecto** y la opción **Connect Git** .
4. Seleccione el proyecto GIT que desea implementar y haga clic en **Comenzar la configuración**
5. Seleccione el preajuste del marco correspondiente en la configuración de compilación dependiendo del marco VITE que haya seleccionado.
6. ¡Entonces guarda e implementa!
7. ¡Su aplicación está implementada! (por ejemplo, `https://<PROJECTNAME>.pages.dev/` )

Después de que su proyecto se haya importado e implementado, todos los empujes posteriores a las sucursales generarán [implementaciones de vista previa](https://developers.cloudflare.com/pages/platform/preview-deployments/) a menos que se especifique que no sean en [los controles de construcción de su sucursal](https://developers.cloudflare.com/pages/platform/branch-build-controls/) . Todos los cambios en la rama de producción (comúnmente "principal") darán como resultado una implementación de producción.

También puede agregar dominios personalizados y manejar la configuración de compilación personalizada en las páginas. Obtenga más información sobre [la integración Git de las páginas de CloudFlare](https://developers.cloudflare.com/pages/get-started/#manage-your-site) .

## Google Firebase

1. Asegúrese de tener [las herramientas de Firebase](https://www.npmjs.com/package/firebase-tools) instaladas.

2. Cree `firebase.json` y `.firebaserc` en la raíz de su proyecto con el siguiente contenido:

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

3. Después de ejecutar `npm run build` , implementa usando el comando `firebase deploy` .

## Aumento

1. Primero instalación [de Surge](https://www.npmjs.com/package/surge) , si aún no lo ha hecho.

2. Correr `npm run build` .

3. Desplegarse para aumentar escribiendo `surge dist` .

También puede implementar en un [dominio personalizado](http://surge.sh/help/adding-a-custom-domain) agregando `surge dist yourdomain.com` .

## Aplicaciones Web Estáticas De Azure

Puede implementar rápidamente su aplicación VITE con el servicio [de aplicaciones web Static Web](https://aka.ms/staticwebapps) Microsoft Azure. Necesitas:

- Una cuenta de Azure y una clave de suscripción. Puede crear una [cuenta de Azure gratuita aquí](https://azure.microsoft.com/free) .
- El código de su aplicación presionó a [GitHub](https://github.com) .
- La [extensión SWA](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) en [el código Visual Studio](https://code.visualstudio.com) .

Instale la extensión en el código VS y navegue a la raíz de su aplicación. Abra la extensión de aplicaciones web estáticas, inicie sesión en Azure y haga clic en el signo '+' para crear una nueva aplicación web estática. Se le solicitará que designe qué clave de suscripción usar.

Siga el asistente iniciado por la extensión para darle un nombre a su aplicación, elija un preajuste de marco y designe la raíz de la aplicación (generalmente `/` ) y la ubicación del archivo construido `/dist` . El asistente se ejecutará y creará una acción de GitHub en su repositorio en una carpeta `.github` .

La acción funcionará para implementar su aplicación (observe su progreso en la pestaña Acciones de su repositorio) y, cuando se complete con éxito, puede ver su aplicación en la dirección proporcionada en la ventana de progreso de la extensión haciendo clic en el botón 'Browse Sitio web' que aparece cuando se ha ejecutado la acción de GitHub.

## Prestar

Puede implementar su aplicación VITE como un sitio estático en [Render](https://render.com/) .

1. Crear una [cuenta de renderizado](https://dashboard.render.com/register) .

2. En el [tablero](https://dashboard.render.com/) , haga clic en el botón **Nuevo** y seleccione **el sitio estático** .

3. Conecte su cuenta GitHub/GitLab o use un repositorio público.

4. Especifique un nombre y rama del proyecto.

   - **Comando de construcción** : `npm install && npm run build`
   - **Publicar directorio** : `dist`

5. Haga Clic en **Crear Sitio Estático** .

   Su aplicación debe implementarse en `https://<PROJECTNAME>.onrender.com/` .

Por defecto, cualquier nuevo compromiso presionado para la rama especificada activará automáticamente una nueva implementación. [Auto-Deploy](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) se puede configurar en la configuración del proyecto.

También puede agregar un [dominio personalizado](https://render.com/docs/custom-domains) a su proyecto.

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

## Control De Vuelo

Implemente su sitio estático utilizando [FlightControl](https://www.flightcontrol.dev/?ref=docs-vite) siguiendo estas [instrucciones](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite) .

## Hosting Del Sitio Estático De Kinsta

Implemente su sitio estático usando [Kinsta](https://kinsta.com/static-site-hosting/) siguiendo estas [instrucciones](https://kinsta.com/docs/react-vite-example/) .

## Alojamiento Del Sitio Estático XMIT

Implemente su sitio estático usando [XMIT](https://xmit.co) siguiendo esta [guía](https://xmit.dev/posts/vite-quickstart/) .
