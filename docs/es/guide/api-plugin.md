# API de complemento

Vite Plugins extiende la interfaz de complemento bien diseñada de Rollup con algunas opciones adicionales específicas de VITE. Como resultado, puede escribir un complemento VITE una vez y hacer que funcione para desarrollo y compilación.

**Se recomienda pasar por [la documentación del complemento de Rollup](https://rollupjs.org/plugin-development/) antes de leer las secciones a continuación.**

## Autor de un complemento

Vite se esfuerza por ofrecer patrones establecidos de la caja, por lo que antes de crear un nuevo complemento, asegúrese de verificar la [guía de características](https://vite.dev/guide/features) para ver si su necesidad está cubierta. También revise los complementos comunitarios disponibles, tanto en forma de un [complemento de rollo compatible](https://github.com/rollup/awesome) como [a los complementos específicos de VITE](https://github.com/vitejs/awesome-vite#plugins)

Al crear un complemento, puede en línea en su `vite.config.js` . No hay necesidad de crear un nuevo paquete para él. Una vez que vea que un complemento fue útil en sus proyectos, considere compartirlo para ayudar a otros [en el ecosistema](https://chat.vite.dev) .

::: tip
Al aprender, depurar o autorizar complementos, sugerimos incluir [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) en su proyecto. Le permite inspeccionar el estado intermedio de los complementos VITE. Después de instalar, puede visitar `localhost:5173/__inspect/` para inspeccionar los módulos y la pila de transformación de su proyecto. Consulte las instrucciones de instalación en los [documentos de inspección vite-plugin](https://github.com/antfu/vite-plugin-inspect) .
![vite-plugin-inspect](/images/vite-plugin-inspect.png)
:::

## Convenciones

Si el complemento no usa ganchos específicos VITE y se puede implementar como un [complemento de rollup compatible](#rollup-plugin-compatibility) , se recomienda utilizar las [convenciones de nombres de complementos de rollo](https://rollupjs.org/plugin-development/#conventions) .

- Los complementos enrollables deben tener un nombre claro con `rollup-plugin-` prefijo.
- Incluya palabras clave `rollup-plugin` y `vite-plugin` en paquete.json.

Esto expone el complemento que también se utilizará en Pure Rollup o Proyectos basados en WMR

Para complementos VITE Only

- Los complementos VITE deben tener un nombre claro con `vite-plugin-` prefijo.
- Incluya `vite-plugin` palabras clave en paquete.json.
- Incluya una sección en los documentos de complemento que detalla por qué es un complemento VITE Only (por ejemplo, utiliza ganchos de complementos específicos de VITE).

Si su complemento solo funcionará para un marco en particular, su nombre debe incluirse como parte del prefijo

- `vite-plugin-vue-` prefijo para complementos VUE
- `vite-plugin-react-` Prefijo para complementos React
- `vite-plugin-svelte-` Prefijo para complementos SVELTE

Ver también [Convención de módulos virtuales](#virtual-modules-convention) .

## Configuración de complementos

Los usuarios agregarán complementos al proyecto `devDependencies` y los configurarán utilizando la opción de `plugins` matriz.

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

Se ignorarán los complementos de Falsy, que se pueden usar para activar o desactivar fácilmente complementos.

`plugins` también acepta presets, incluidos varios complementos como un solo elemento. Esto es útil para características complejas (como la integración Framework) que se implementan utilizando varios complementos. La matriz se aplanará internamente.

```js
// framework-plugin
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## Ejemplos Simples

:::tip
Es una convención común autorizar un complemento VITE/Rollup como una función de fábrica que devuelve el objeto de complemento real. La función puede aceptar opciones que permiten a los usuarios personalizar el comportamiento del complemento.
:::

### Transformando Tipos De Archivos Personalizados

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // Proporcione el mapa de origen si está disponible
        }
      }
    },
  }
}
```

### Importar Un Archivo Virtual

Vea el ejemplo en la [siguiente sección](#virtual-modules-convention) .

## Convención De Módulos Virtuales

Los módulos virtuales son un esquema útil que le permite pasar información de tiempo de compilación a los archivos de origen utilizando la sintaxis de importación ESM normal.

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // requerido, aparecerá en advertencias y errores
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

Que permite importar el módulo en JavaScript:

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Los módulos virtuales en VITE (y Rollup) están prefijados con `virtual:` para la ruta orientada por el usuario por convención. Si es posible, el nombre del complemento debe usarse como un espacio de nombres para evitar colisiones con otros complementos en el ecosistema. Por ejemplo, un `vite-plugin-posts` podría pedir a los usuarios que importen un módulos virtuales `virtual:posts` o `virtual:posts/helpers` para obtener información de tiempo de compilación. Internamente, los complementos que usan módulos virtuales deben prefijo el ID del módulo con `\0` al resolver la ID, una convención del ecosistema de rollo. Esto evita que otros complementos intenten procesar la ID (como la resolución del nodo), y las características principales como SouraCEMaps pueden usar esta información para diferenciar entre módulos virtuales y archivos regulares. `\0` no es un carbón permitido en las URL de importación, por lo que tenemos que reemplazarlas durante el análisis de importación. Una ID virtual `\0{id}` termina codificada como `/@id/__x00__{id}` durante el desarrollo en el navegador. La ID se decodificará antes de ingresar la tubería de complementos, por lo que esto no se ve mediante el código de ganchos de complementos.

Tenga en cuenta que los módulos derivados directamente de un archivo real, como en el caso de un módulo de script en un solo componente de archivo (como un .vue o .Svelte SFC) no necesita seguir esta convención. Los SFC generalmente generan un conjunto de submódulos cuando se procesan, pero el código en estos se puede asignar nuevamente al sistema de archivos. El uso de `\0` para estos submódulos evitaría que los SourcEMaps funcionen correctamente.

## Ganchos Universales

Durante Dev, el servidor VITE DEV crea un contenedor de complementos que invoca [los ganchos de construcción](https://rollupjs.org/plugin-development/#build-hooks) de la misma manera que lo hace.

Los siguientes ganchos se llaman una vez en el inicio del servidor:

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

Se llaman a los siguientes ganchos en cada solicitud del módulo entrante:

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

Estos ganchos también tienen un parámetro `options` extendido con propiedades adicionales específicas de VITE. Puede leer más en la [documentación de SSR](/es/guide/ssr#ssr-specific-plugin-logic) .

Algunas `resolveId` llamadas ' `importer` El valor puede ser una ruta absoluta para un genérico `index.html` en la raíz, ya que no siempre es posible derivar el importador real debido al patrón de servidor de desarrollo desagradable de Vite. Para las importaciones manejadas dentro de la tubería de resolución de Vite, el importador se puede rastrear durante la fase de análisis de importación, proporcionando el valor `importer` correctos.

Se llaman a los siguientes ganchos cuando el servidor está cerrado:

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

Tenga en cuenta que el gancho [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) **no** se llama durante el desarrollo, porque Vite evita los analizados AST para un mejor rendimiento.

[Los ganchos de generación de salida](https://rollupjs.org/plugin-development/#output-generation-hooks) (excepto `closeBundle` ) **no** se llaman durante el desarrollo. Puede pensar en el servidor Dev de Vite como solo llamar `rollup.rollup()` sin llamar `bundle.generate()` .

## Ganchos Específicos De Vite

Los complementos VITE también pueden proporcionar ganchos que tienen propósitos específicos de VITE. Estos ganchos son ignorados por el encierro.

### `config`

- **Type:** `(config: UserConfig, env: { mode: string, command: string }) => UserConfig | null | void`
- **Kind:** `async`, `sequential`

  Modifique la configuración VITE antes de que se resuelva. El gancho recibe la configuración del usuario sin procesar (opciones de CLI fusionadas con el archivo de configuración) y la configuración de configuración actual que expone el utilizando `mode` y `command` . Puede devolver un objeto de configuración parcial que se fusionará profundamente en la configuración existente, o mutar directamente la configuración (si la fusión predeterminada no puede lograr el resultado deseado).

  **Ejemplo:**

  ```js
  // Devolver la configuración parcial (recomendado)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // mutar la configuración directamente (usar solo cuando la fusión no funciona)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning Note
  Los complementos de usuario se resuelven antes de ejecutar este gancho, por lo que inyectar otros complementos dentro del gancho `config` no tendrá ningún efecto.
  :::

### `configResolved`

- **Type:** `(config: ResolvedConfig) => void | Promise<void>`
- **Kind:** `async`, `parallel`

  Llamado después de que se resuelva la configuración VITE. Use este gancho para leer y almacenar la configuración resuelta final. También es útil cuando el complemento necesita hacer algo diferente según el comando que se ejecuta.

  **Ejemplo:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // almacenar la configuración resuelta
        config = resolvedConfig
      },

      // Use la configuración almacenada en otros ganchos
      transform(code, id) {
        if (config.command === 'serve') {
          // Dev: complemento invocado por Dev Server
        } else {
          // Build: complemento invocado por acurrucado
        }
      },
    }
  }
  ```

  Tenga en cuenta que el valor `command` es `serve` en dev (en el CLI `vite` , `vite dev` y `vite serve` son alias).

### `configureServer`

- **Type:** `(server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>`
- **Kind:** `async`, `sequential`
- **See also:** [ViteDevServer](./api-javascript#vitedevserver)

  Hacer para configurar el servidor Dev. El caso de uso más común es agregar artículos intermedios personalizados a la aplicación [de conexión](https://github.com/senchalabs/connect) interna:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Solicitud de mango personalizado ...
      })
    },
  })
  ```

  **Inyectando post middleware**

  El gancho `configureServer` se llama antes de que se instalen los artículos intermedios internos, por lo que los artículos intermedios personalizados se ejecutarán antes de los artículos intermedios internos de forma predeterminada. Si desea inyectar un middleware **después de** los artículos internos internos, puede devolver una función de `configureServer` , que se llamará después de instalar los artículos intermedios internos:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // devolver un gancho de publicación que se llama después de que los artículos intermedios internos son
      // instalado
      return () => {
        server.middlewares.use((req, res, next) => {
          // Solicitud de mango personalizado ...
        })
      }
    },
  })
  ```

  **Acceso al servidor de almacenamiento**

  En algunos casos, otros ganchos de complementos pueden necesitar acceso a la instancia del servidor Dev (por ejemplo, acceder al servidor de socket web, el observador del sistema de archivos o el gráfico del módulo). Este gancho también se puede usar para almacenar la instancia del servidor para acceder en otros ganchos:

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // Usar servidor ...
        }
      },
    }
  }
  ```

  La nota `configureServer` no se llama al ejecutar la construcción de producción, por lo que sus otros ganchos deben protegerse contra su ausencia.

### `configurePreviewServer`

- **Type:** `(server: PreviewServer) => (() => void) | void | Promise<(() => void) | void>`
- **Kind:** `async`, `sequential`
- **See also:** [PreviewServer](./api-javascript#previewserver)

  Igual que [`configureServer`](/es/guide/api-plugin.html#configureserver) pero para el servidor de vista previa. De manera similar a `configureServer` , el gancho `configurePreviewServer` se llama antes de que se instalen otros artículos intermedios. Si desea inyectar un middleware **después de** otros artículos intermedios, puede devolver una función de `configurePreviewServer` , que se llamará después de instalar los artículos internos internos:

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // devolver un gancho de publicación que se llama después de que otros artículos intermedios
      // instalado
      return () => {
        server.middlewares.use((req, res, next) => {
          // Solicitud de mango personalizado ...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **Type:** `IndexHtmlTransformHook | { order?: 'pre' | 'post', handler: IndexHtmlTransformHook }`
- **Kind:** `async`, `sequential`

  Gancho dedicado para transformar archivos de punto de entrada HTML como `index.html` . El gancho recibe la cadena HTML actual y un contexto de transformación. El contexto expone la instancia [`ViteDevServer`](./api-javascript#vitedevserver) durante el desarrollo y expone el paquete de salida de rollup durante la compilación.

  El gancho puede ser asíncrono y puede devolver uno de los siguientes:

  - Cadena HTML transformada
  - Una matriz de objetos de descriptor de etiqueta ( `{ tag, attrs, children }` ) para inyectar al HTML existente. Cada etiqueta también puede especificar a dónde se debe inyectar (el valor predeterminado se prepara a `<head>` )
  - Un objeto que contiene ambos como `{ html, tags }`

  Por defecto, `order` es `undefined` , con este gancho aplicado después de que el HTML se haya transformado. Para inyectar un script que debe pasar por la tubería de complementos VITE, `order: 'pre'` aplicará el gancho antes de procesar el HTML. `order: 'post'` aplica el gancho después de que se aplican todos los ganchos con `order` indefinidos.

  **Ejemplo básico:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Title replaced!</title>`,
        )
      },
    }
  }
  ```

  **Firma de gancho completo:**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * Valor predeterminado: 'Pretenciar la cabeza'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

  ::: warning Note
  No se llamará a este gancho si está utilizando un marco que tenga un manejo personalizado de los archivos de entrada (por ejemplo, [sveltekit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145) ).
  :::

### `handleHotUpdate`

- **Type:** `(ctx: HmrContext) => Array<ModuleNode> | void | Promise<Array<ModuleNode> | void>`
- **See also:** [HMR API](./api-hmr)

  Realice el manejo de actualizaciones de HMR personalizado. El gancho recibe un objeto de contexto con la siguiente firma:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` es una matriz de módulos afectados por el archivo cambiado. Es una matriz porque un solo archivo puede mapear a múltiples módulos servidos (por ejemplo, Vue SFCS).

  - `read` es una función de lectura Async que devuelve el contenido del archivo. Esto se proporciona porque en algunos sistemas, la devolución de llamada de cambio de archivo puede disparar demasiado rápido antes de que el editor termine de actualizar el archivo y Direct `fs.readFile` devolverá contenido vacío. La función de lectura pasada en normaliza este comportamiento.

  El gancho puede elegir:

  - Filtre y reduzca la lista de módulos afectados para que el HMR sea más preciso.

  - Devuelve una matriz vacía y realiza una recarga completa:

    ```js
    handleHotUpdate({ server, modules, timestamp }) {
      // Invalidate modules manually
      const invalidatedModules = new Set()
      for (const mod of modules) {
        server.moduleGraph.invalidateModule(
          mod,
          invalidatedModules,
          timestamp,
          true
        )
      }
      server.ws.send({ type: 'full-reload' })
      return []
    }
    ```

  - Devuelva una matriz vacía y realice un manejo de HMR personalizado completo enviando eventos personalizados al cliente:

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    El código del cliente debe registrar el controlador correspondiente utilizando la [API HMR](./api-hmr) (esto podría ser inyectado por el mismo gancho `transform` del complemento):

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // Realizar actualizaciones personalizadas
      })
    }
    ```

## Pedido De Complementos

Un complemento VITE también puede especificar una propiedad `enforce` (similar a los cargadores de Webpack) para ajustar su orden de aplicación. El valor de `enforce` puede ser `"pre"` o `"post"` . Los complementos resueltos estarán en el siguiente orden:

- Alias
- Complementos de usuario con `enforce: 'pre'`
- Complementos de núcleo vite
- Complementos de usuario sin valor de aplicación
- Complementos de construcción vite
- Complementos de usuario con `enforce: 'post'`
- Vite Post Build complementos (minificar, manifiesto, informes)

Tenga en cuenta que esto es separado del orden de los ganchos, todavía están sujetos por separado a su atributo `order` [como de costumbre para los ganchos de acumulación](https://rollupjs.org/plugin-development/#build-hooks) .

## Aplicación Condicional

Por defecto, los complementos se invocan tanto para servir como para construir. En los casos en que un complemento debe aplicarse condicionalmente solo durante el servicio o la construcción, use la propiedad `apply` para invocarlos solo durante `'build'` o `'serve'` :

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // o 'servir'
  }
}
```

Una función también se puede utilizar para un control más preciso:

```js
apply(config, { command }) {
  // apply only on build but not for SSR
  return command === 'build' && !config.build.ssr
}
```

## Compatibilidad Del Complemento

Un buen número de complementos de rollo funcionará directamente como un complemento VITE (por ejemplo, `@rollup/plugin-alias` o `@rollup/plugin-json` ), pero no todos, ya que algunos ganchos de complementos no tienen sentido en un contexto de servidor de desarrollo desagregado.

En general, siempre que un complemento de rollo se adapte a los siguientes criterios, entonces debería funcionar como un complemento VITE:

- No usa el gancho [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) .
- No tiene un acoplamiento fuerte entre los ganchos de fase de paquete y los ganchos de fase de salida.

Si un complemento de rollo solo tiene sentido para la fase de compilación, entonces se puede especificar en `build.rollupOptions.plugins` en su lugar. Funcionará igual que un complemento VITE con `enforce: 'post'` y `apply: 'build'` .

También puede aumentar un complemento de acumulación existente con propiedades de solo vite:

```js [vite.config.js]
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

## Normalización De La Ruta

Vite normaliza las rutas mientras se resuelve las ID para usar los separadores POSIX ( /) mientras preservan el volumen en Windows. Por otro lado, el acurrucado mantiene las rutas resueltas intactas de forma predeterminada, por lo que las ID resueltas tienen separadores Win32 (\) en Windows. Sin embargo, los complementos de acumulación usan una [función de utilidad `normalizePath`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) de `@rollup/pluginutils` internamente, que convierte los separadores en POSIX antes de realizar comparaciones. Esto significa que cuando estos complementos se usan en VITE, el patrón de configuración `include` y `exclude` y otras rutas similares contra las comparaciones de IDS resueltas funcionan correctamente.

Entonces, para complementos VITE, al comparar rutas con IDS resueltos, es importante normalizar primero las rutas para usar separadores POSIX. Se exporta una función de utilidad `normalizePath` equivalente desde el módulo `vite` .

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```

## Filtrar, incluir/excluir el patrón

Vite expone la función [`@rollup/pluginutils` 's `createFilter`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter) para fomentar complementos e integraciones específicas de VITE para usar el patrón de filtrado de inclusión/excluido estándar, que también se usa en Vite Core.

## Comunicación Cliente-Servidor

Desde Vite 2.9, proporcionamos algunas utilidades para complementos para ayudar a manejar la comunicación con los clientes.

### Servidor a cliente

En el lado del complemento, podríamos usar `server.ws.send` para transmitir eventos al cliente:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: tip NOTE
Recomendamos **siempre el prefijo** los nombres de sus eventos para evitar colisiones con otros complementos.
:::

En el lado del cliente, use [`hot.on`](/es/guide/api-hmr.html#hot-on-event-cb) para escuchar los eventos:

```ts twoslash
import 'vite/client'
// ---cortar---
// lado del cliente
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // Hola
  })
}
```

### Cliente a servidor

Para enviar eventos del cliente al servidor, podemos usar [`hot.send`](/es/guide/api-hmr.html#hot-send-event-payload) :

```ts
// lado del cliente
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

Luego use `server.ws.on` y escuche los eventos en el lado del servidor:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // ¡Ey!
          // Responder solo al cliente (si es necesario)
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### Mecanografiado Para Eventos Personalizados

Internamente, Vite infiere el tipo de carga útil de la interfaz `CustomEventMap` , es posible escribir eventos personalizados extendiendo la interfaz:

:::tip Note
Asegúrese de incluir la extensión `.d.ts` al especificar archivos de declaración de mecanografiado. De lo contrario, TypeScript puede no saber qué archivo está tratando de extender el módulo.
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // 'Clave de evento': carga útil
  }
}
```

Esta extensión de la interfaz se utiliza por `InferCustomEventPayload<T>` para inferir el tipo de carga útil para el evento `T` . Para obtener más información sobre cómo se utiliza esta interfaz, consulte la [documentación de la API HMR](./api-hmr#hmr-api) .

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
// ---cortar---
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // El tipo de carga útil será {msg: string}
})
import.meta.hot?.on('unknown:event', (payload) => {
  // El tipo de carga útil será cualquier
})
```
