# Solución De Problemas

Consulte [la guía de solución de problemas de Rollup](https://rollupjs.org/troubleshooting/) para obtener más información también.

Si las sugerencias aquí no funcionan, intente publicar preguntas sobre [las discusiones de GitHub](https://github.com/vitejs/vite/discussions) o en el canal `#help` de [Vite Land Discord](https://chat.vite.dev) .

## CJS

### VITE CJS Node API Deprecida

La construcción de CJS de la API del nodo de Vite está en desuso y se eliminará en Vite 6. Vea la [discusión de GitHub](https://github.com/vitejs/vite/discussions/13928) para obtener más contexto. Debe actualizar sus archivos o marcos para importar la compilación ESM de VITE.

En un proyecto vite básico, asegúrese de:

1. El contenido del archivo `vite.config.js` está utilizando la sintaxis ESM.
2. El archivo `package.json` más cercano tiene `"type": "module"` , o usa la extensión `.mjs` , por ejemplo `.mts` `vite.config.mjs` o `vite.config.mts` .

Para otros proyectos, hay algunos enfoques generales:

- **Configure ESM como predeterminado, opte a CJS si es necesario:** Agregue `"type": "module"` en el proyecto `package.json` . Los `*.js` archivos ahora se interpretan como ESM y necesitan usar la sintaxis ESM. Puede cambiar el nombre de un archivo con la extensión `.cjs` para seguir usando CJS.
- **Mantenga CJS como predeterminado, opte a ESM si es necesario:** si el Proyecto `package.json` no tiene `"type": "module"` , los `*.js` archivos se interpretan como CJS. Puede cambiar el nombre de un archivo con la extensión `.mjs` para usar ESM en su lugar.
- **Importar dinámicamente vite:** si necesita seguir usando CJS, puede importar dinámicamente VITE usando `import('vite')` . Esto requiere que su código se escriba en un contexto `async` , pero aún debe ser manejable ya que la API de Vite es en su mayoría asíncrona.

Si no está seguro de dónde proviene la advertencia, puede ejecutar su script con el indicador `VITE_CJS_TRACE=true` para registrar el rastro de la pila:

```bash
VITE_CJS_TRACE=true vite dev
```

Si desea ignorar temporalmente la advertencia, puede ejecutar su script con la bandera `VITE_CJS_IGNORE_WARNING=true` :

```bash
VITE_CJS_IGNORE_WARNING=true vite dev
```

Tenga en cuenta que los archivos de configuración PostCSS no admiten ESM + TypeScript ( `.mts` o `.ts` en `"type": "module"` ) todavía. Si tiene configuraciones PostCSS con `.ts` y agregó `"type": "module"` a Package.json, también necesitará cambiar el nombre de la configuración PostCSS para usar `.cts` .

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

La ruta a la carpeta de su proyecto puede incluir `&` , que no funciona con `npm` en Windows ( [NPM/CMD-SHIM#45](https://github.com/npm/cmd-shim/issues/45) ).

Tendrás que tampoco:

- Cambie a otro administrador de paquetes (por ejemplo, `pnpm` , `yarn` )
- Eliminar `&` de la ruta a su proyecto

## Configuración

### Este paquete es solo ESM

Al importar un paquete ESM solo por `require` , ocurre el siguiente error.

> No se pudo resolver "foo". Este paquete es solo ESM pero se intentó cargar por `require` .

> Error [err_require_esm]: require () de ES Module /path/to/Dependency.js from /path/to/vite.config.js no es compatible.
> En su lugar, cambie el requerimiento de index.js in /path/to/vite.config.js a una importación dinámica () que está disponible en todos los módulos CommonJS.

En Node.js <= 22, los archivos ESM no se pueden cargar por [`require`](https://nodejs.org/docs/latest-v22.x/api/esm.html#require) por defecto.

Si bien puede funcionar usando [`--experimental-require-module`](https://nodejs.org/docs/latest-v22.x/api/modules.html#loading-ecmascript-modules-using-require) , o node.js> 22, o en otros tiempos de ejecución, aún recomendamos convertir su configuración en ESM por:

- agregando `"type": "module"` al `package.json` más cercano
- `vite.config.mts` `vite.config.js` `vite.config.mjs` `vite.config.ts`

### `failed to load config from '/path/to/config*/vite.config.js'`

> No se pudo cargar configuración desde '/path/to/config\*/vite.config.js'
> Error al iniciar el servidor Dev:
> Error: la compilación falló con 1 error:
> Error: debe usar "Outdir" cuando hay múltiples archivos de entrada

El error anterior puede ocurrir si la ruta a la carpeta de su proyecto contiene `*` , que ESBuild trata como un globo. Deberá cambiar el nombre de su directorio para eliminar el `*` .

## Servidor De Desarrollo

### Las solicitudes están estancadas para siempre

Si está utilizando Linux, los límites del descriptor de archivo y los límites inotify pueden estar causando el problema. Como Vite no agrupa la mayoría de los archivos, los navegadores pueden solicitar muchos archivos que requieren muchos descriptores de archivos, superando el límite.

Para resolver esto:

- Aumentar el límite del descriptor del archivo por `ulimit`

  ```shell
  # Verifique el límite de corriente
  $ ulimit -Sn
  # Límite de cambio (temporal)
  $ ulimit -Sn 10000 # Es posible que también necesite cambiar el límite duro
  # Reinicie su navegador
  ```

- Aumente los siguientes límites relacionados con inotify por `sysctl`

  ```shell
  # Verifique los límites de corriente
  $ sysctl fs.inotify
  # Cambiar límites (temporales)
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

Si los pasos anteriores no funcionan, puede intentar agregar `DefaultLimitNOFILE=65536` como una configuración no commentada a los siguientes archivos:

- /etc/systemd/system.conf
- /etc/systemd/user.conf

Para Ubuntu Linux, es posible que deba agregar la línea `* - nofile 65536` al archivo `/etc/security/limits.conf` en lugar de actualizar los archivos de configuración Systemd.

Tenga en cuenta que estos configuraciones persisten pero **se requiere un reinicio** .

Alternativamente, si el servidor se ejecuta dentro de un código VS DevContainer, la solicitud puede parecer estancada. Para solucionar este problema, ver
[Contenedores de desarrollo / reenvío del puerto de código VS.](#dev-containers-vs-code-port-forwarding)

### Solicitudes de red deja de cargar

Al usar un certificado SSL autofirmado, Chrome ignora todas las directivas de almacenamiento en caché y recarga el contenido. Vite se basa en estas directivas de almacenamiento en caché.

Para resolver el problema, use un certificado SSL de confianza.

Ver: [Problemas de caché](https://helpx.adobe.com/mt/experience-manager/kb/cache-problems-on-chrome-with-SSL-certificate-errors.html) , [problema de Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=110649#c8)

#### macosa

Puede instalar un certificado de confianza a través de la CLI con este comando:

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

O, al importarlo a la aplicación de acceso a Keychain y actualizar la confianza de su certificado para "siempre confiar".

### 431 Solicitar Campos De Encabezado Demasiado Grandes

Cuando el servidor / servidor WebSocket recibe un gran encabezado HTTP, la solicitud se eliminará y se mostrará la siguiente advertencia.

> El servidor respondió con el código de estado 431. Consulte [https://vite.dev/guide/troublashooting.html#\_431-request-header-fields-too-large](https://vite.dev/guide/troubleshooting.html#_431-request-header-fields-too-large) .

Esto se debe a que Node.js limita el tamaño del encabezado de solicitud para mitigar [CVE-2018-12121](https://www.cve.org/CVERecord?id=CVE-2018-12121) .

Para evitar esto, intente reducir el tamaño del encabezado de su solicitud. Por ejemplo, si la cookie es larga, elimínela. O puede usar [`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize) para cambiar el tamaño del encabezado máximo.

### Contenedores De Desarrollo / Reenvío De Puertos De Código vs Código

Si está utilizando un contenedor de desarrollo o una función de reenvío de puertos en el código VS, es posible que deba establecer la opción [`server.host`](/es/config/server-options.md#server-host) en `127.0.0.1` en la configuración para que funcione.

Esto se debe a que [la función de reenvío de puertos en el código VS no admite IPv6](https://github.com/microsoft/vscode-remote-release/issues/7029) .

Ver [#16522](https://github.com/vitejs/vite/issues/16522) para más detalles.

## HMR

### Vite detecta un cambio de archivo pero el HMR no funciona

Puede estar importando un archivo con un caso diferente. Por ejemplo, `src/foo.js` existe y `src/bar.js` contiene:

```js
import './Foo.js' // debería ser './foo.js'
```

Problema relacionado: [#964](https://github.com/vitejs/vite/issues/964)

### Vite no detecta un cambio de archivo

Si está ejecutando VITE con WSL2, VITE no puede ver los cambios de archivo en algunas condiciones. Ver [`server.watch` opción](/es/config/server-options.md#server-watch) .

### Una recarga completa ocurre en lugar de HMR

Si Vite o un complemento no maneja HMR, se producirá una recarga completa, ya que es la única forma de actualizar el estado.

Si se maneja HMR pero está dentro de una dependencia circular, una recarga completa también recuperará la orden de ejecución. Para resolver esto, intente romper el bucle. Puede ejecutar `vite --debug hmr` para registrar la ruta de dependencia circular si un cambio de archivo lo activó.

## Construir

### El archivo construido no funciona debido al error de CORS

Si la salida del archivo HTML se abrió con el protocolo `file` , los scripts no se ejecutarán con el siguiente error.

> El acceso al script en 'Archivo: ///foo/bar.js' From Origin 'NULL' ha sido bloqueado por CORS Policy: las solicitudes de origen cruzado solo son compatibles con esquemas de protocolo: http, datos, app aislado, extensión de cromo, cromo, https, cromado no controlado.

> Solicitud de origen cruzado bloqueada: la misma política de origen no permite leer el recurso remoto en el archivo: ///foo/bar.js. (Razón: Solicitud CORS no HTTP).

Ver [Razón: Solicitud de CORS no http - http | Mdn] ( [https://developer.mozilla.org/en-us/docs/web/http/cors/errors/corsRequestnothttp](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) ) para obtener más información sobre por qué sucede esto.

Deberá acceder al archivo con el protocolo `http` . La forma más fácil de lograr esto es ejecutar `npx vite preview` .

## Dependencias Optimizadas

### Deps anticuados anticuados al vincular a un paquete local

La clave hash utilizada para invalidar las dependencias optimizadas depende del contenido del bloqueo del paquete, los parches aplicados a las dependencias y las opciones en el archivo de configuración VITE que afecta la agrupación de módulos de nodo. Esto significa que VITE detectará cuándo se anula una dependencia utilizando una característica como [anula NPM](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) y volverá a fusionar sus dependencias en el siguiente servidor inicial. Vite no invalidará las dependencias cuando use una función como [el enlace NPM](https://docs.npmjs.com/cli/v9/commands/npm-link) . En caso de que vincule o desintegue una dependencia, deberá forzar la re-óptimización en el siguiente servidor iniciar usando `vite --force` . Recomendamos usar anulaciones en su lugar, que ahora son compatibles con cada administrador de paquetes (ver también [anulaciones de PNPM](https://pnpm.io/package_json#pnpmoverrides) y [resoluciones de hilo](https://yarnpkg.com/configuration/manifest/#resolutions) ).

## Cuellos De Botella De Rendimiento

Si sufre cualquier cuello de botella de rendimiento de la aplicación que dan como resultado tiempos de carga lentos, puede iniciar el inspector de nodo.js incorporado con su servidor de desarrollo vite o al crear su aplicación para crear el perfil de la CPU:

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite Dev Server
Una vez que su aplicación se abre en el navegador, solo espere terminar de cargarla y luego regrese al terminal y presione la tecla `p` (detendrá el inspector Node.js) y luego presione `q` tecla para detener el servidor de desarrollo.
:::

El inspector node.js generará `vite-profile-0.cpuprofile` en la carpeta raíz, vaya a [https://www.speedscope.app/](https://www.speedscope.app/) , y cargue el perfil de la CPU usando el botón `BROWSE` para inspeccionar el resultado.

Puede instalar [Vite-Plugin-Inspect](https://github.com/antfu/vite-plugin-inspect) , que le permite inspeccionar el estado intermedio de los complementos VITE y también puede ayudarlo a identificar qué complementos o artículos intermedios son el cuello de botella en sus aplicaciones. El complemento se puede usar en modos de desarrollo y compilación. Consulte el archivo ReadMe para obtener más detalles.

## Otros

### Módulo externalizado para la compatibilidad del navegador

Cuando usa un módulo Node.js en el navegador, Vite generará la siguiente advertencia.

> El módulo "FS" ha sido externalizado para la compatibilidad del navegador. No se puede acceder a "Fsadfile" en el código del cliente.

Esto se debe a que VITE no polló automáticamente los módulos Node.js.

Recomendamos evitar los módulos Node.js para el código del navegador para reducir el tamaño del haz, aunque puede agregar polyfills manualmente. Si el módulo se importa de una biblioteca de terceros (que está destinado a usarse en el navegador), se recomienda informar el problema a la biblioteca respectiva.

### Error de sintaxis / error de tipo ocurre

Vite no puede manejar y no admite código que solo se ejecuta en modo no riguroso (modo descuidado). Esto se debe a que Vite usa ESM y siempre es [un modo estricto](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) dentro de ESM.

Por ejemplo, puede ver estos errores.

> [Error] con declaraciones no se puede usar con el formato de salida "ESM" debido al modo estricto

> TypeError: no se puede crear la propiedad 'foo' en boolean 'falso'

Si estos códigos se usan dentro de las dependencias, puede usar [`patch-package`](https://github.com/ds300/patch-package) (o [`yarn patch`](https://yarnpkg.com/cli/patch) o [`pnpm patch`](https://pnpm.io/cli/patch) ) para una escotilla de escape.

### Extensiones del navegador

Algunas extensiones del navegador (como los bloqueadores de anuncios) pueden evitar que el cliente VITE envíe solicitudes al servidor VITE DEV. Puede ver una pantalla blanca sin errores registrados en este caso. Intente deshabilitar las extensiones si tiene este problema.

### Enlaces de transmisión cruzada en Windows

Si hay un enlace de transmisión cruzada en su proyecto en Windows, Vite puede no funcionar.

Un ejemplo de enlaces de transmisión cruzada son:

- Una unidad virtual vinculada a un comando de carpeta por `subst`
- Un enlace simbólico/unión a un comando diferente por `mklink` (por ejemplo, hilo de caché global)

Problema relacionado: [#10802](https://github.com/vitejs/vite/issues/10802)
