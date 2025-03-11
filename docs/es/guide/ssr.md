# Renderización del lado del servidor (SSR)

:::tip Note
SSR se refiere específicamente a los marcos front-end (por ejemplo, React, Preact, Vue y Svelte) que admiten ejecutar la misma aplicación en Node.js, prevenirlo a HTML, y finalmente hidratarla en el cliente. Si está buscando integración con los marcos tradicionales del lado del servidor, consulte la [Guía de integración de backend](./backend-integration) en su lugar.

La siguiente guía también asume experiencia previa trabajando con SSR en su marco de elección, y solo se centrará en los detalles de integración específicos de VITE.
:::

:::warning Low-level API
Esta es una API de bajo nivel destinada a autores de biblioteca y marco. Si su objetivo es crear una aplicación, asegúrese de consultar los complementos y herramientas SSR de nivel superior en [la sección Awesome Vite SSR](https://github.com/vitejs/awesome-vite#ssr) primero. Dicho esto, muchas aplicaciones se construyen con éxito directamente sobre la API nativa de bajo nivel de Vite.

Actualmente, Vite está trabajando en una API SSR mejorada con la [API ambiental](https://github.com/vitejs/vite/discussions/16358) . Consulte el enlace para obtener más detalles.
:::

## Proyectos De Ejemplo

VITE proporciona soporte incorporado para la representación del lado del servidor (SSR). [`create-vite-extra`](https://github.com/bluwy/create-vite-extra) Contiene el ejemplo de configuraciones de SSR que puede usar como referencias para esta guía:

- [Vainilla](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [Vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [Reaccionar](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [Preaccionar](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [Esbelto](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [Sólido](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

También puede andamiar estos proyectos localmente [ejecutando `create-vite`](./index.md#scaffolding-your-first-vite-project) y elegir `Others > create-vite-extra` en la opción Marco.

## Estructura Fuente

Una aplicación SSR típica tendrá la siguiente estructura de archivo de origen:

```
- index.html
- server.js # main application server
- src/
  - main.js          # exports env-agnostic (universal) app code
  - entry-client.js  # mounts the app to a DOM element
  - entry-server.js  # renders the app using the framework's SSR API
```

El `index.html` deberá referencia `entry-client.js` e incluir un marcador de posición donde se debe inyectar el marcado renderizado del servidor:

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Puede usar cualquier marcador de posición que prefiera en lugar de `<!--ssr-outlet-->` , siempre que pueda reemplazarse con precisión.

## Lógica Condicional

Si necesita realizar una lógica condicional basada en SSR frente al cliente, puede usar

```js twoslash
import 'vite/client'
// ---cortar---
if (import.meta.env.SSR) {
  // ... Lógica de solo servidor
}
```

Esto se reemplaza estáticamente durante la construcción, por lo que permitirá la sacudida de las ramas no utilizadas.

## Configuración Del Servidor Dev

Al construir una aplicación SSR, es probable que desee tener un control total sobre su servidor principal y Decouple Vite del entorno de producción. Por lo tanto, se recomienda usar VITE en modo middleware. Aquí hay un ejemplo con [Express](https://expressjs.com/) (V4):

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // serve index.html - we will tackle this next
  })

  app.listen(5173)
}

createServer()
```

Aquí `vite` es una instancia de [Vitedevserver](./api-javascript#vitedevserver) . `vite.middlewares` es una instancia [de conexión](https://github.com/senchalabs/connect) que se puede usar como un middleware en cualquier marco Node.js compatible con Connect Compatible.

El siguiente paso es implementar el controlador `*` para servir HTML renderizado por servidor:

```js twoslash [server.js]
// @noErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @Type {import ('express'). Express} */
var app
/** @Type {import ('vite'). Vitedevserver}  */
var vite

// ---cortar---
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Leer index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. Aplique transformaciones VITE HTML. Esto inyecta el cliente VITE HMR,
    //    y también aplica las transformaciones HTML de los complementos VITE, p. global
    //    Preamplicles de @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3. Cargue la entrada del servidor. SSRLoadModule se transforma automáticamente
    //    El código fuente de ESM se puede utilizar en Node.js! No hay agrupación
    //    requerido y proporciona una invalidación eficiente similar a la HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. Renderiza la aplicación html. Esto supone que la entrada-server.js exportó
    //     `render` la función llama a las API de SSR de marco apropiado,
    //    p.ej. Reactomserver.renderToString ()
    const appHtml = await render(url)

    // 5. Inyecte el HTML renderizado con aplicaciones en la plantilla.
    const html = template.replace(`<!--ssr-outlet-->`, () => appHtml)

    // 6. Envíe el HTML renderizado.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // Si se atrapa un error, deje que Vite arregle el rastro de la pila para que se mapea hacia atrás
    // a su código fuente real.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

El script `dev` en `package.json` también debe cambiarse para usar el script del servidor en su lugar:

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Edificio para la producción

Para enviar un proyecto SSR para la producción, necesitamos:

1. Producir una construcción de un cliente como de costumbre;
2. Producir una compilación SSR, que se puede cargar directamente a través de `import()` para que no tengamos que pasar por `ssrLoadModule` de Vite;

Nuestros scripts en `package.json` se verán así:

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

Tenga en cuenta el indicador `--ssr` que indica que esta es una compilación SSR. También debe especificar la entrada SSR.

Luego, en `server.js` necesitamos agregar algo de lógica específica de producción verificando `process.env.NODE_ENV` :

- En lugar de leer la raíz `index.html` , use el `dist/client/index.html` como plantilla, ya que contiene los enlaces de activos correctos a la compilación del cliente.

- En lugar de `await vite.ssrLoadModule('/src/entry-server.js')` , use `import('./dist/server/entry-server.js')` (este archivo es el resultado de la compilación SSR).

- Mueva la creación y todo el uso del servidor `vite` DEV detrás de las ramas condicionales de desarrollo, luego agregue un archivo estático que sirva a los middlewares para servir archivos de `dist/client` .

Consulte los [proyectos de ejemplo](#example-projects) para una configuración de trabajo.

## Generar Directivas De Precarga

`vite build` admite el indicador `--ssrManifest` que generará `.vite/ssr-manifest.json` en el directorio de salida de compilación:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

El script anterior ahora generará `dist/client/.vite/ssr-manifest.json` para la compilación del cliente (sí, el manifiesto SSR se genera a partir de la compilación del cliente porque queremos asignar ID de módulo a archivos del cliente). El manifiesto contiene asignaciones de ID de módulo a sus fragmentos asociados y archivos de activos.

Para aprovechar el manifiesto, los marcos deben proporcionar una forma de recopilar las ID de módulo de los componentes que se usaron durante una llamada de renderizado del servidor.

`@vitejs/plugin-vue` admite esto fuera de la caja y registra automáticamente las ID de módulo de componentes en el contexto de SSR VUE asociado:

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules es ahora un conjunto de ID de módulo que se usaron durante el renderizado
```

En la rama de producción de `server.js` necesitamos leer y pasar el manifiesto a la función `render` exportada por `src/entry-server.js` . ¡Esto nos proporcionaría suficiente información para representar las directivas de precarga para los archivos utilizados por las rutas Async! Ver [fuente de demostración](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js) para un ejemplo completo. También puede usar esta información para [103 pistas tempranas](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103) .

## Preengivencia / SSG

Si las rutas y los datos necesarios para ciertas rutas se conocen con anticipación, podemos prever estas rutas en HTML estático utilizando la misma lógica que la SSR de producción. Esto también puede considerarse una forma de generación de sitios estáticos (SSG). Consulte [el script previo al renderizado de demostración](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/prerender.js) para el ejemplo de trabajo.

## SSR externos

Las dependencias se "externalizan" del sistema de módulo de transformación SSR de Vite de forma predeterminada cuando se ejecuta SSR. Esto acelera tanto el desarrollo como la construcción.

Si una dependencia necesita ser transformada por la tubería de Vite, por ejemplo, porque las características de VITE se usan sin transferencia en ellas, se pueden agregar a [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal) .

Para las dependencias vinculadas, no se externalizan de forma predeterminada para aprovechar el HMR de Vite. Si no se desea, por ejemplo, para probar las dependencias como si no estuvieran vinculados, puede agregarlo a [`ssr.external`](../config/ssr-options.md#ssr-external) .

:::warning Working with Aliases
Si ha configurado alias que redirigen un paquete a otro, es posible que desee alias los `node_modules` paquetes reales para que funcione para dependencias externalizadas de SSR. Tanto [el hilo](https://classic.yarnpkg.com/es/docs/cli/add/#toc-yarn-add-alias) como [el PNPM](https://pnpm.io/aliases/) admiten aliasing a través del prefijo `npm:` .
:::

## Lógica De Complemento Específico De SSR

Algunos marcos como Vue o Svelte compilan componentes en diferentes formatos basados en el cliente frente a SSR. Para admitir transformaciones condicionales, Vite pasa una propiedad `ssr` adicional en el objeto `options` de los siguientes ganchos de complemento:

- `resolveId`
- `load`
- `transform`

**Ejemplo:**

```js twoslash
/** @Type {() => import ('vite'). Plugin} */
// ---cortar---
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // Realizar transformación específica de SSR ...
      }
    },
  }
}
```

El objeto de opciones en `load` y `transform` es opcional, el rollup no está utilizando este objeto, pero puede extender estos ganchos con metadatos adicionales en el futuro.

:::tip Note
Antes de Vite 2.7, esto se informó a los ganchos de complemento con un parámetro `ssr` posicional en lugar de usar el objeto `options` . Todos los principales marcos y complementos se actualizan, pero puede encontrar publicaciones obsoletas utilizando la API anterior.
:::

## Objetivo de SSR

El objetivo predeterminado para la compilación SSR es un entorno de nodo, pero también puede ejecutar el servidor en un trabajador web. La resolución de entrada de paquetes es diferente para cada plataforma. Puede configurar el objetivo para ser trabajador web utilizando el `ssr.target` establecido en `'webworker'` .

## Paquete de SSR

En algunos casos como `webworker` RunTimes, es posible que desee agrupar su construcción de SSR en un solo archivo JavaScript. Puede habilitar este comportamiento estableciendo `ssr.noExternal` a `true` . Esto hará dos cosas:

- Tratar todas las dependencias como `noExternal`
- Tire un error si se importan nodo.js empotrados

## Condiciones de resolución de SSR

Por defecto, la resolución de entrada del paquete utilizará las condiciones establecidas en [`resolve.conditions`](../config/shared-options.md#resolve-conditions) para la compilación SSR. Puede usar [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions) y [`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions) para personalizar este comportamiento.

## VITE CLI

Los comandos CLI `$ vite dev` y `$ vite preview` también se pueden usar para aplicaciones SSR. Puede agregar su SSR MiddleWares al servidor de desarrollo con [`configureServer`](/es/guide/api-plugin#configureserver) y al servidor de vista previa con [`configurePreviewServer`](/es/guide/api-plugin#configurepreviewserver) .

:::tip Note
Use un gancho de publicación para que su middleware SSR se ejecute _después de_ los WidleSwares de Vite.
:::
