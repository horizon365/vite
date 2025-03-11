# Opciones De Servidor

A menos que se indique, las opciones en esta sección solo se aplican al desarrollo.

## server.host

- **Tipo:** `cadena | booleano`
- **Valor predeterminado:** `'localhost'`

Especifique en qué direcciones IP se debe escuchar el servidor.
Establezca esto en `0.0.0.0` o `true` para escuchar en todas las direcciones, incluidas LAN y direcciones públicas.

Esto se puede configurar a través de la CLI usando `--host 0.0.0.0` o `--host` .

::: tip NOTE

Hay casos en los que otros servidores pueden responder en lugar de vite.

El primer caso es cuando se usa `localhost` . Node.js bajo V17 reordera el resultado de las direcciones resueltas de DNS por defecto. Al acceder `localhost` , los navegadores usan DNS para resolver la dirección y esa dirección puede diferir de la dirección que Vite está escuchando. Vite imprime la dirección resuelta cuando difiere.

Puede establecer [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order) para deshabilitar el comportamiento de reordenamiento. Vite luego imprimirá la dirección como `localhost` .

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // omitir
})
```

El segundo caso es cuando se usan huéspedes comodín (por ejemplo, `0.0.0.0` ). Esto se debe a que los servidores que escuchan en anfitriones no Wildcard tienen prioridad sobre aquellos que escuchan en los anfitriones comodín.

:::

::: tip Accessing the server on WSL2 from your LAN

Al ejecutar VITE en WSL2, no es suficiente establecer `host: true` para acceder al servidor desde su LAN.
Vea [el documento WSL](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan) para obtener más detalles.

:::

## server.allowedHosts

- **Tipo:** `cadena [] | verdadero
- **Valor predeterminado:** `[]`

Los nombres de host a los que Vite puede responder.
`localhost` y dominios en `.localhost` y todas las direcciones IP están permitidas de forma predeterminada.
Cuando se usa HTTPS, se omite esta verificación.

Si una cadena comienza con `.` , permitirá ese nombre de host sin el `.` y todos los subdominios bajo el nombre de host. Por ejemplo, `.example.com` permitirá `example.com` , `foo.example.com` y `foo.bar.example.com` . Si se establece en `true` , el servidor puede responder a las solicitudes de cualquier host.

::: details What hosts are safe to be added?

Hosts que tiene control sobre las direcciones IP que resuelven son seguras para agregar a la lista de hosts permitidos.

Por ejemplo, si posee un dominio `vite.dev` , puede agregar `vite.dev` y `.vite.dev` a la lista. Si no es dueño de ese dominio y no puede confiar en el propietario de ese dominio, no debe agregarlo.

Especialmente, nunca debe agregar dominios de nivel superior como `.com` a la lista. Esto se debe a que cualquiera puede comprar un dominio como `example.com` y controlar la dirección IP a la que se resuelve.

:::

::: danger

La configuración de `server.allowedHosts` a `true` permite que cualquier sitio web envíe solicitudes a su servidor de Dev a través de ataques de reembolso de DNS, lo que les permite descargar su código fuente y contenido. Recomendamos siempre usar una lista explícita de hosts permitidos. Ver [GHSA-VG6X-RCGG-RJX6](https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6) para más detalles.

:::

::: details Configure via environment variable
Puede establecer la variable de entorno `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` para agregar un host adicional permitido.
:::

## server.port

- **Tipo:** `number`
- **Valor predeterminado:** `5173`

Especificar el puerto del servidor. Nota Si el puerto ya se está utilizando, Vite intentará automáticamente el siguiente puerto disponible, por lo que este no es el puerto real en el que el servidor termina escuchando.

## server.strictPort

- **Tipo:** `boolean`

Establezca en `true` para salir si el puerto ya está en uso, en lugar de probar automáticamente el siguiente puerto disponible.

## server.https

- **Tipo:** `https.ServerOptions`

Habilitar TLS + HTTP/2. Tenga en cuenta que esto deja de baja a TLS solo cuando también se usa la [opción `server.proxy`](#server-proxy) .

El valor también puede ser un [objeto de opciones](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) que se pasa a `https.createServer()` .

Se necesita un certificado válido. Para una configuración básica, puede agregar [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) a los complementos del proyecto, que creará y almacenará automáticamente un certificado autofirmado. Pero recomendamos crear sus propios certificados.

## server.open

- **Tipo:** `booleano | cadena

Abra automáticamente la aplicación en el navegador al inicio del servidor. Cuando el valor es una cadena, se usará como el nombre de ruta de la URL. Si desea abrir el servidor en un navegador específico que desee, puede establecer el env `process.env.BROWSER` (por ejemplo, `firefox` ). También puede establecer `process.env.BROWSER_ARGS` para aprobar argumentos adicionales (por ejemplo, `--incognito` ).

`BROWSER` y `BROWSER_ARGS` también son variables de entorno especiales que puede configurar en el archivo `.env` para configurarlo. Vea [el paquete `open`](https://github.com/sindresorhus/open#app) para más detalles.

**Ejemplo:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **Tipo:** `registro <cadena, cadena | ProxyOptions> `

Configure las reglas proxy personalizadas para el servidor Dev. Espera un objeto de `{ key: options }` pares. Cualquier solicitud de que la ruta de solicitud comience con esa clave se representará a ese objetivo especificado. Si la clave comienza con `^` , se interpretará como un `RegExp` . La opción `configure` se puede usar para acceder a la instancia de proxy. Si una solicitud coincide con cualquiera de las reglas proxy configuradas, la solicitud no se transformará por VITE.

Tenga en cuenta que si está utilizando [`base`](/es/config/shared-options.md#base) no relativo, debe prefijo cada clave con esa `base` .

Se extiende [`http-proxy`](https://github.com/http-party/node-http-proxy#options) . Opciones adicionales están [aquí](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13) .

En algunos casos, es posible que también desee configurar el servidor de desarrollo subyacente (por ejemplo, para agregar middlewares personalizados a la aplicación [de conexión](https://github.com/senchalabs/connect) interna). Para hacer eso, debe escribir su propio [complemento](/es/guide/using-plugins.html) y usar la función [ConfigureServer](/es/guide/api-plugin.html#configureserver) .

**Ejemplo:**

```js
export default defineConfig({
  server: {
    proxy: {
      // abreviatura de cadena:
      // http: // localhost: 5173/foo
      //   -> [http: // localhost: 4567/foo](http://localhost:4567/foo)
      '/foo': 'http://localhost:4567',
      // con opciones:
      // http: // localhost: 5173/api/bar
      //   -> [http://jsonplaceholder.typicode.com/bar](http://jsonplaceholder.typicode.com/bar)
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // con regexp:
      // http: // localhost: 5173/fallback/
      //   -> [http://jsonplaceholder.typicode.com/](http://jsonplaceholder.typicode.com/)
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // Usando la instancia de proxy
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Proxy será una instancia de 'http-proxy'
        },
      },
      // Proxying WebSockets o Socket.io:
      // WS: // Localhost: 5173/Socket.io
      //   -> ws: // localhost: 5174/socket.io
      // Ejercer precaución usando `rewriteWsOrigin` ya que puede dejar el
      // Proxying abierto a ataques CSRF.
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **Tipo:** `booleano | Corsoptions`
- **Valor predeterminado:** `{origen: /^https ?://(?:(?:=^:font>+.)?Localhost|127\.0\.0\.1|[:: 1]) (? :: \ d+)? $/}  127.0.0.1  :: 1`)

Configurar CORS para el servidor Dev. Pase un [objeto de opciones](https://github.com/expressjs/cors#configuration-options) para ajustar el comportamiento o `true` para permitir cualquier origen.

::: danger

La configuración de `server.cors` a `true` permite que cualquier sitio web envíe solicitudes a su servidor de desarrollo y descargue su código fuente y contenido. Recomendamos siempre usar una lista explícita de orígenes permitidos.

:::

## server.headers

- **Tipo:** `OutgoingHttpHeaders`

Especificar encabezados de respuesta del servidor.

## server.hmr

- **Tipo:** `booleano | {Protocol?: String, Host?: String, Port?: ¿Número, ruta?: cadena, tiempo de espera?: ¿Número, superposición?: Boolean, Clientport?: ¿Número, servidor?: Server `` `` `

Deshabilite o configure la conexión HMR (en los casos en que el WebSocket de HMR debe usar una dirección diferente del servidor HTTP).

Establecer `server.hmr.overlay` a `false` para deshabilitar la superposición de errores del servidor.

`protocol` Establece el protocolo WebSocket utilizado para la conexión HMR: `ws` (WebSocket) o `wss` (WebSocket Secure).

`clientPort` es una opción avanzada que anula el puerto solo en el lado del cliente, lo que le permite servir el WebSocket en un puerto diferente al que el código del cliente lo busca.

Cuando se define `server.hmr.server` , VITE procesará las solicitudes de conexión HMR a través del servidor proporcionado. Si no está en modo middleware, VITE intentará procesar las solicitudes de conexión HMR a través del servidor existente. Esto puede ser útil cuando se usa certificados autofirmados o cuando desea exponer VITE a través de una red en un solo puerto.

Echa un vistazo [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue) para algunos ejemplos.

::: tip NOTE

Con la configuración predeterminada, se espera que los proxies inversos frente a VITE admitan el proxying WebSocket. Si el cliente VITE HMR no puede conectar WebSocket, el cliente volverá a conectar el WebSocket directamente al servidor VITE HMR sin pasar por los proxies inversos:

```
Direct websocket connection fallback. Check out https://vite.dev/config/server-options.html#server-hmr to remove the previous connection error.
```

El error que aparece en el navegador cuando ocurre el respaldo se puede ignorar. Para evitar el error pasando por alto directamente los proxies inversos, podría:

- Configure el proxy inverso a proxy WebSocket también
- establecer [`server.strictPort = true`](#server-strictport) y establecer `server.hmr.clientPort` al mismo valor con `server.port`
- establecer `server.hmr.port` a un valor diferente de [`server.port`](#server-port)

:::

## server.warmup

- **Tipo:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **RELACIONADO:** [Calentamiento de archivos de uso frecuente](/es/guide/performance.html#warm-up-frequently-used-files)

Calienta archivos para transformar y almacenar en caché los resultados con anticipación. Esto mejora la carga inicial de la página durante las inicio del servidor y previene las cascadas de transformación.

`clientFiles` son archivos que se usan solo en el cliente, mientras que `ssrFiles` son archivos que se usan solo en SSR. Aceptan una matriz de rutas de archivo o [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) patrones en relación con los `root` .

Asegúrese de agregar solo archivos que se usan con frecuencia para no sobrecargar el servidor VITE DEV al inicio.

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **Tipo:** `Objeto | nulo

Opciones de observador del sistema de archivos para pasar a [Chokidar](https://github.com/paulmillr/chokidar/tree/3.6.0#api) .

El Vite Server Watcher observa el `root` y omite los directorios `.git/` , `node_modules/` y Vite `cacheDir` y `build.outDir` de forma predeterminada. Al actualizar un archivo observado, VITE aplicará HMR y actualizará la página solo si es necesario.

Si se establece en `null` , no se observarán archivos. `server.watcher` Proporcionará un emisor de eventos compatible, pero llamar `add` o `unwatch` no tendrá ningún efecto.

::: warning Watching files in `node_modules`

Actualmente no es posible ver archivos y paquetes en `node_modules` . Para más progresos y soluciones, puede seguir [el problema #8619](https://github.com/vitejs/vite/issues/8619) .

:::

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

Cuando se ejecuta VITE en WSL2, la observación del sistema de archivos no funciona cuando las aplicaciones de Windows editan un archivo (proceso no WSL2). Esto se debe a [una limitación de WSL2](https://github.com/microsoft/WSL/issues/4739) . Esto también se aplica a ejecutar Docker con un backend WSL2.

Para arreglarlo, usted podría:

- **Recomendado** : use aplicaciones WSL2 para editar sus archivos.
  - También se recomienda mover la carpeta del proyecto fuera de un sistema de archivos de Windows. Acceder al sistema de archivos de Windows desde WSL2 es lento. Eliminar esa sobrecarga mejorará el rendimiento.
- Establecer `{ usePolling: true }` .
  - Tenga en cuenta que [`usePolling` conduce a una alta utilización de CPU](https://github.com/paulmillr/chokidar/tree/3.6.0#performance) .

:::

## server.middlewareMode

- **Tipo:** `boolean`
- **Valor predeterminado:** `false`

Crear servidor VITE en modo middleware.

- **Relacionado:** [AppType](./shared-options#apptype) , [SSR - Configuración del servidor Dev](/es/guide/ssr#setting-up-the-dev-server)

- **Ejemplo:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // Crear servidor VITE en modo middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // No incluya el manejo de HTML predeterminado de Vite MiddleWares
    appType: 'custom',
  })
  // Utilice la instancia de Connect de Vite como middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Dado que `appType` es `'custom'` , debe cumplir la respuesta aquí.
    // Nota: Si `appType` es `'spa'` o `'mpa'` , Vite incluye los artículos intermedios
    // para manejar las solicitudes HTML y los 404 para que se deben agregar los usuarios medios.
    // Antes de que Vite Middlewares entrara en vigencia en su lugar
  })
}

createServer()
```

## server.fs.strict

- **Tipo:** `boolean`
- **Valor predeterminado:** `true` (habilitado de forma predeterminada desde VITE 2.7)

Restringir los archivos de servicio fuera de la raíz del espacio de trabajo.

## server.fs.allow

- **Tipo:** `string[]`

Restringir archivos que podrían servirse a través de `/@fs/` . Cuando `server.fs.strict` se establece en `true` , acceder a archivos fuera de esta lista de directorio que no se importa desde un archivo permitido dará como resultado un 403.

Se pueden proporcionar tanto directorios como archivos.

Vite buscará la raíz del espacio de trabajo potencial y la usará como predeterminada. Un espacio de trabajo válido cumplió con las siguientes condiciones, de lo contrario, volverá a la [raíz del proyecto](/es/guide/#index-html-and-project-root) .

- contiene `workspaces` campo en `package.json`
- contiene uno de los siguientes archivos
  - `lerna.json`
  - `pnpm-workspace.yaml`

Acepta una ruta para especificar la raíz del espacio de trabajo personalizado. Podría ser una ruta absoluta o una ruta en relación con [la raíz del proyecto](/es/guide/#index-html-and-project-root) . Por ejemplo:

```js
export default defineConfig({
  server: {
    fs: {
      // Permitir servir archivos desde un nivel hasta la raíz del proyecto
      allow: ['..'],
    },
  },
})
```

Cuando se especifica `server.fs.allow` , la detección de raíz del espacio de trabajo automático se deshabilitará. Para extender el comportamiento original, se expone una utilidad `searchForWorkspaceRoot` :

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // Buscar la raíz del espacio de trabajo
        searchForWorkspaceRoot(process.cwd()),
        // Tus reglas personalizadas
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **Tipo:** `string[]`
- **Valor predeterminado:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

Lista de bloques para archivos confidenciales que están restringidos para ser atendidos por Vite Dev Server. Esto tendrá mayor prioridad que [`server.fs.allow`](#server-fs-allow) . [Los patrones de Picomatch](https://github.com/micromatch/picomatch#globbing-features) son compatibles.

## server.origin

- **Tipo:** `string`

Define el origen de las URL de activos generadas durante el desarrollo.

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **Tipo:** `Falso | (SourcePath: String, SourCemappath: String) => Boolean`
- **Valor predeterminado:** `(sourcePath) => sourcePath.includes('node_modules')`

Si ignora o no los archivos de origen en el servidor SourCEPAP, utilizado para completar la [extensión del mapa de origen `x_google_ignoreList`](https://developer.chrome.com/articles/x-google-ignore-list/) .

`server.sourcemapIgnoreList` es el equivalente de [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) para el servidor Dev. Una diferencia entre las dos opciones de configuración es que se llama a la función rollup con una ruta relativa para `sourcePath` , mientras que `server.sourcemapIgnoreList` se llama con una ruta absoluta. Durante el desarrollo, la mayoría de los módulos tienen el mapa y la fuente en la misma carpeta, por lo que la ruta relativa para `sourcePath` es el nombre de archivo en sí. En estos casos, las rutas absolutas hacen que sea conveniente ser utilizado en su lugar.

Por defecto, excluye todas las rutas que contienen `node_modules` . Puede pasar `false` para deshabilitar este comportamiento o, para control total, una función que toma la ruta de origen y la ruta de SourCeMap y devuelve si ignorar la ruta de origen.

```js
export default defineConfig({
  server: {
    // Este es el valor predeterminado y agregará todos los archivos con Node_Modules
    // en sus caminos a la lista Ignore.
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Note
[`server.sourcemapIgnoreList`](#server-sourcemapignorelist) y [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) deben establecerse de forma independiente. `server.sourcemapIgnoreList` es una configuración de solo servidor y no obtiene su valor predeterminado de las opciones de rollo definidas.
:::
