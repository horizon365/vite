# API de entorno para marcos

:::warning Experimental
El medio ambiente API es experimental. Mantendremos las API estables durante Vite 6 para dejar que el ecosistema experimente y construir sobre ella. Estamos planeando estabilizar estas nuevas API con posibles cambios de ruptura en Vite 7.

Recursos:

- [Discusión de comentarios](https://github.com/vitejs/vite/discussions/16358) Cuando estamos recopilando comentarios sobre las nuevas API.
- [API ambiental PR](https://github.com/vitejs/vite/pull/16471) donde se implementó y revisó la nueva API.

Comparta sus comentarios con nosotros.
:::

## Entornos y marcos

El entorno `ssr` implícito y otros entornos que no son de client usan un `RunnableDevEnvironment` por defecto durante el desarrollo. Si bien esto requiere que el tiempo de ejecución sea el mismo con el que se está ejecutando el servidor VITE, esto funciona de manera similar con `ssrLoadModule` y permite que los marcos migren y habiliten HMR para su historia de desarrollo SSR. Puede proteger cualquier entorno ejecutable con una función `isRunnableDevEnvironment` .

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * URL para ejecutar.
   * Acepta la ruta del archivo, la ruta del servidor o la ID en relación con la raíz.
   * Devuelve un módulo instanciado (igual que en SSRLoadModule)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * Otros métodos de Modulerunner ...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
El `runner` se evalúa ansiosamente cuando se accede por primera vez. Tenga cuidado de que VITE habilita el soporte del mapa de origen cuando el `runner` se crea llamando `process.setSourceMapsEnabled` o anulando `Error.prepareStackTrace` si no está disponible.
:::

## Predeterminado `RunnableDevEnvironment`

Dado un servidor VITE configurado en el modo de middleware, según lo descrito por la [Guía de configuración de SSR](/es/guide/ssr#setting-up-the-dev-server) , implementemos el middleware SSR utilizando la API de entorno. Se omite el manejo de errores.

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // Por defecto, los módulos se ejecutan en el mismo proceso que el servidor VITE
    },
  },
})

// Es posible que deba lanzar esto para runnabledevenvironment en typeScript o
// Use isrunnabledevenvironment para proteger el acceso al corredor
const environment = server.environments.node

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. Leer index.html
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Aplique transformaciones VITE HTML. Esto inyecta el cliente VITE HMR,
  //    y también aplica las transformaciones HTML de los complementos VITE, p. global
  //    Preamplicles de @vitejs/plugin-react
  template = await server.transformIndexHtml(url, template)

  // 3. Cargue la entrada del servidor. import (url) transforma automáticamente
  //    El código fuente de ESM se puede utilizar en Node.js! No hay agrupación
  //    requerido y proporciona soporte completo de HMR.
  const { render } = await environment.runner.import('/src/entry-server.js')

  // 4. Renderiza la aplicación html. Esto supone que la entrada-server.js exportó
  //     `render` la función llama a las API de SSR de marco apropiado,
  //    p.ej. Reactomserver.renderToString ()
  const appHtml = await render(url)

  // 5. Inyecte el HTML renderizado con aplicaciones en la plantilla.
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. Envíe el HTML renderizado.
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

## SSR agnóstico de tiempo de ejecución

Dado que el `RunnableDevEnvironment` solo se puede usar para ejecutar el código en el mismo tiempo de ejecución que el servidor VITE, requiere un tiempo de ejecución que puede ejecutar el servidor VITE (un tiempo de ejecución que es compatible con Node.js). Esto significa que necesitará usar el RAW `DevEnvironment` para que sea agnóstico de tiempo de ejecución.

:::info `FetchableDevEnvironment` proposal

La propuesta inicial tenía un método `run` en la clase `DevEnvironment` que permitiría a los consumidores invocar una importación en el lado del corredor utilizando la opción `transport` . Durante nuestras pruebas descubrimos que la API no era lo suficientemente universal como para comenzar a recomendarlo. Por el momento, estamos buscando comentarios sobre [la propuesta `FetchableDevEnvironment`](https://github.com/vitejs/vite/discussions/18191) .

:::

`RunnableDevEnvironment` tiene una función `runner.import` que devuelve el valor del módulo. Pero esta función no está disponible en el RAW `DevEnvironment` y requiere el código que utiliza las API de Vite y los módulos de usuario para desacoplar.

Por ejemplo, el siguiente ejemplo utiliza el valor del módulo de usuario del código utilizando las API de Vite:

```ts
// código usando las API de Vite
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entry.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Si su código puede ejecutarse en el mismo tiempo de ejecución que los módulos de usuario (es decir, no se basa en las API específicas de Node.js), puede usar un módulo virtual. Este enfoque elimina la necesidad de acceder al valor del código utilizando las API de Vite.

```ts
// código usando las API de Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // un complemento que maneja `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* implementación de complementos */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// Utilice funciones expuestas por cada entorno fábricas que ejecute el código
// Compruebe para cada entorno fábrica lo que proporcionan
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

// -------------------------------------
// Virtual: EntryPoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Por ejemplo, para llamar `transformIndexHtml` en el módulo de usuario, se puede usar el siguiente complemento:

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

Si su código requiere Node.js API, puede usar `hot.send` para comunicarse con el código que utiliza las API de Vite de los módulos de usuario. Sin embargo, tenga en cuenta que este enfoque puede no funcionar de la misma manera después del proceso de compilación.

```ts
// código usando las API de Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // un complemento que maneja `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* implementación de complementos */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// Utilice funciones expuestas por cada entorno fábricas que ejecute el código
// Compruebe para cada entorno fábrica lo que proporcionan
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Unsupported runtime for ${ssrEnvironment.name}`)
}

const req = new Request('/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// -------------------------------------
// Virtual: EntryPoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## Entornos Durante La Construcción

En la CLI, llamar `vite build` y `vite build --ssr` seguirá construyendo solo el cliente y solo entornos de SSR para la compatibilidad hacia atrás.

Cuando `builder` no es `undefined` (o cuando llame `vite build --app` ), `vite build` optará por construir toda la aplicación. Más tarde, esto se convertiría en el valor predeterminado en una futura especialidad. Se creará una instancia `ViteBuilder` (tiempo de compilación equivalente a un `ViteDevServer` ) para crear todos los entornos configurados para la producción. Por defecto, la construcción de entornos se ejecuta en serie respetando el orden del registro `environments` . Un marco o usuario puede configurar aún más cómo se crean los entornos utilizando:

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

## Código Agnóstico Del Medio Ambiente

La mayoría de las veces, la instancia `environment` actual estará disponible como parte del contexto del código que se ejecuta, por lo que la necesidad de acceder a ellos a través de `server.environments` debería ser rara. Por ejemplo, los ganchos de complementos internos, el entorno está expuesto como parte de los `PluginContext` , por lo que se puede acceder a él usando `this.environment` . Consulte [la API de entorno para complementos](./api-environment-plugins.md) para aprender sobre cómo construir complementos conscientes del entorno.
