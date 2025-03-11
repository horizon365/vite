# Opciones De Vista Previa

A menos que se indique, las opciones en esta sección solo se aplican a la vista previa.

## preview.host

- **Tipo:** `cadena | booleano`
- **Valor predeterminado:** [`server.host`](./server-options#server-host)

Especifique en qué direcciones IP se debe escuchar el servidor.
Establezca esto en `0.0.0.0` o `true` para escuchar en todas las direcciones, incluidas LAN y direcciones públicas.

Esto se puede configurar a través de la CLI usando `--host 0.0.0.0` o `--host` .

::: tip NOTE

Hay casos en los que otros servidores pueden responder en lugar de vite.
Ver [`server.host`](./server-options#server-host) para más detalles.

:::

## preview.allowedHosts

- **Tipo:** `cadena | verdadero
- **Valor predeterminado:** [`server.allowedHosts`](./server-options#server-allowedhosts)

Los nombres de host a los que Vite puede responder.

Ver [`server.allowedHosts`](./server-options#server-allowedhosts) para más detalles.

## preview.port

- **Tipo:** `number`
- **Valor predeterminado:** `4173`

Especificar el puerto del servidor. Nota Si el puerto ya se está utilizando, Vite intentará automáticamente el siguiente puerto disponible, por lo que este no es el puerto real en el que el servidor termina escuchando.

**Ejemplo:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

- **Tipo:** `boolean`
- **Valor predeterminado:** [`server.strictPort`](./server-options#server-strictport)

Establezca en `true` para salir si el puerto ya está en uso, en lugar de probar automáticamente el siguiente puerto disponible.

## preview.https

- **Tipo:** `https.ServerOptions`
- **Valor predeterminado:** [`server.https`](./server-options#server-https)

Habilitar TLS + HTTP/2. Tenga en cuenta que esto deja de baja a TLS solo cuando también se usa la [opción `server.proxy`](./server-options#server-proxy) .

El valor también puede ser un [objeto de opciones](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) que se pasa a `https.createServer()` .

## preview.open

- **Tipo:** `booleano | cadena
- **Valor predeterminado:** [`server.open`](./server-options#server-open)

Abra automáticamente la aplicación en el navegador al inicio del servidor. Cuando el valor es una cadena, se usará como el nombre de ruta de la URL. Si desea abrir el servidor en un navegador específico que desee, puede establecer el env `process.env.BROWSER` (por ejemplo, `firefox` ). También puede establecer `process.env.BROWSER_ARGS` para aprobar argumentos adicionales (por ejemplo, `--incognito` ).

`BROWSER` y `BROWSER_ARGS` también son variables de entorno especiales que puede configurar en el archivo `.env` para configurarlo. Vea [el paquete `open`](https://github.com/sindresorhus/open#app) para más detalles.

## preview.proxy

- **Tipo:** `registro <cadena, cadena | ProxyOptions> `
- **Valor predeterminado:** [`server.proxy`](./server-options#server-proxy)

Configure las reglas proxy personalizadas para el servidor de vista previa. Espera un objeto de `{ key: options }` pares. Si la clave comienza con `^` , se interpretará como un `RegExp` . La opción `configure` se puede usar para acceder a la instancia de proxy.

Usa [`http-proxy`](https://github.com/http-party/node-http-proxy) . Opciones completas [aquí](https://github.com/http-party/node-http-proxy#options) .

## preview.cors

- **Tipo:** `booleano | Corsoptions`
- **Valor predeterminado:** [`server.cors`](./server-options#server-cors)

Configurar CORS para el servidor de vista previa.

Ver [`server.cors`](./server-options#server-cors) para más detalles.

## preview.headers

- **Tipo:** `OutgoingHttpHeaders`

Especificar encabezados de respuesta del servidor.
