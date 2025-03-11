# Edificio para la producción

Cuando sea hora de implementar su aplicación para la producción, simplemente ejecute el comando `vite build` . Por defecto, utiliza `<root>/index.html` como punto de entrada de compilación y produce un paquete de aplicaciones que es adecuado para ser atendido a través de un servicio de alojamiento estático. Echa un vistazo a la [implementación de un sitio estático](./static-deploy) para guías sobre servicios populares.

## Compatibilidad Del Navegador

Por defecto, el paquete de producción asume soporte para JavaScript moderno, como [los módulos ES nativos](https://caniuse.com/es6-module) , [la importación dinámica de ESM nativa](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [la coalescencia nulosa](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) y [la bigint](https://caniuse.com/bigint) . El rango de soporte de navegador predeterminado es:

<!-- Search for the `ESBUILD_MODULES_TARGET` constant for more information -->

- Chrome> = 87
- Firefox> = 78
- Safari> = 14
- Borde> = 88

Puede especificar objetivos personalizados a través de la [opción de configuración `build.target`](/es/config/build-options.md#build-target) , donde el objetivo más bajo es `es2015` . Si se establece un objetivo inferior, VITE aún requerirá estos rangos mínimos de soporte del navegador, ya que se basa en [la importación dinámica de ESM nativa](https://caniuse.com/es6-module-dynamic-import) , y [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) :

<!-- Search for the `defaultEsbuildSupported` constant for more information -->

- Chrome> = 64
- Firefox> = 67
- Safari> = 11.1
- Borde> = 79

Tenga en cuenta que, de forma predeterminada, Vite solo maneja las transformaciones de sintaxis y **no cubre los polyfills** . Puede consultar [https://cdnjs.cloudflare.com/polyfill/](https://cdnjs.cloudflare.com/polyfill/) que genera automáticamente paquetes de polyfill en función de la cadena de usuario del navegador del usuario.

Los navegadores heredados se pueden admitir a través de [@VITEJS/Plugin-Legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) , que generará automáticamente fragmentos heredados y los correspondientes polyultos de características de lenguaje ES. Los trozos heredados se cargan condicionalmente solo en navegadores que no tienen soporte de ESM nativo.

## Ruta De Base Pública

- Relacionado: [Manejo de activos](./assets)

Si está implementando su proyecto en una ruta pública anidada, simplemente especifique la [opción de configuración `base`](/es/config/shared-options.md#base) y todas las rutas de activos se reescribirán en consecuencia. Esta opción también se puede especificar como un indicador de línea de comando, por ejemplo, `vite build --base=/my/public/path/` .

Las URL de activos importadas de JS, las referencias CSS `url()` y las referencias de activos en sus archivos `.html` se ajustan automáticamente para respetar esta opción durante la compilación.

La excepción es cuando necesita concatenar dinámicamente las URL sobre la marcha. En este caso, puede usar la variable `import.meta.env.BASE_URL` inyectada globalmente que será la ruta de la base pública. Tenga en cuenta que esta variable se reemplaza estáticamente durante la compilación, por lo que debe aparecer exactamente como está (es decir, `import.meta.env['BASE_URL']` no funcionará).

Para el control avanzado de la ruta base, consulte [las opciones base avanzadas](#advanced-base-options) .

### Base relativa

Si no conoce la ruta base de antemano, puede establecer una ruta base relativa con `"base": "./"` o `"base": ""` . Esto hará que todas las URL generadas sean relativas a cada archivo.

:::warning Support for older browsers when using relative bases

`import.meta` Se requiere soporte para bases relativas. Si necesita admitir [navegadores que no admiten `import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , puede usar [el complemento `legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) .

:::

## Personalización de la compilación

La compilación se puede personalizar a través de varias [opciones de configuración de configuración](/es/config/build-options.md) . Específicamente, puede ajustar directamente las [opciones de rollo](https://rollupjs.org/configuration-options/) subyacente a través de `build.rollupOptions` :

```js [vite.config.js]
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

Por ejemplo, puede especificar múltiples salidas de acumulación con complementos que solo se aplican durante la compilación.

## Estrategia De Fragmentación

Puede configurar cómo se dividen los fragmentos usando `build.rollupOptions.output.manualChunks` (ver [documentos de rollo](https://rollupjs.org/configuration-options/#output-manualchunks) ). Si usa un marco, consulte su documentación para configurar cómo se dividen los trozos.

## Manejo De Errores De Carga

Vite emite `vite:preloadError` evento cuando no puede cargar importaciones dinámicas. `event.payload` contiene el error de importación original. Si llama `event.preventDefault()` , el error no se lanzará.

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // Por ejemplo, actualice la página
})
```

Cuando se produce una nueva implementación, el servicio de alojamiento puede eliminar los activos de las implementaciones anteriores. Como resultado, un usuario que visitó su sitio antes de la nueva implementación podría encontrar un error de importación. Este error ocurre porque los activos que se ejecutan en el dispositivo de ese usuario están desactualizados e intenta importar el fragmento antiguo correspondiente, que se elimina. Este evento es útil para abordar esta situación.

## Reconstruir Los Cambios De Archivos

Puede habilitar Rollup Watcher con `vite build --watch` . O puede ajustar directamente el [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) subyacente a través de `build.watch` :

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

Con la bandera `--watch` habilitada, los cambios en el `vite.config.js` , así como cualquier archivo que se agrupe, activará una reconstrucción.

## Aplicación De Múltiples Páginas

Supongamos que tiene la siguiente estructura del código fuente:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Durante Dev, simplemente navegue o enlace a `/nested/` : funciona como se esperaba, al igual que para un servidor de archivos estático normal.

Durante la compilación, todo lo que necesita hacer es especificar múltiples `.html` archivos como puntos de entrada:

```js twoslash [vite.config.js]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

Si especifica una raíz diferente, recuerde que `__dirname` seguirá siendo la carpeta de su archivo vite.config.js al resolver las rutas de entrada. Por lo tanto, deberá agregar su `root` entrada a los argumentos para `resolve` .

Tenga en cuenta que para los archivos HTML, Vite ignora el nombre dado a la entrada en el objeto `rollupOptions.input` y, en su lugar, respeta la ID resuelta del archivo al generar el activo HTML en la carpeta DIST. Esto garantiza una estructura consistente con la forma en que funciona el servidor Dev.

## Modo De Biblioteca

Cuando está desarrollando una biblioteca orientada al navegador, es probable que pase la mayor parte del tiempo en una página de prueba/demostración que importe su biblioteca real. Con Vite, puede usar su `index.html` para ese propósito para obtener la experiencia de desarrollo sin problemas.

Cuando sea el momento de agrupar su biblioteca para su distribución, use la [opción de configuración `build.lib`](/es/config/build-options.md#build-lib) . Asegúrese de externalizar también cualquier dependencia que no desee agrupar en su biblioteca, por ejemplo `vue` o `react` :

::: code-group

```js twoslash [vite.config.js (single entry)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // Se agregarán las extensiones adecuadas
      fileName: 'my-lib',
    },
    rollupOptions: {
      // Asegúrese de externalizar Deps que no deben agruparse
      // en tu biblioteca
      external: ['vue'],
      output: {
        // Proporcionar variables globales para usar en la compilación UMD
        // para Deps externalizados
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (multiple entries)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        secondary: resolve(__dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rollupOptions: {
      // Asegúrese de externalizar Deps que no deben agruparse
      // en tu biblioteca
      external: ['vue'],
      output: {
        // Proporcionar variables globales para usar en la compilación UMD
        // para Deps externalizados
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

El archivo de entrada contendría exportaciones que pueden importar los usuarios de su paquete:

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

Ejecutar `vite build` con esta configuración utiliza un preajuste de rollo que está orientado hacia bibliotecas de envío y produce dos formatos de paquete:

- `es` y `umd` (para entrada única)
- `es` y `cjs` (para múltiples entradas)

Los formatos se pueden configurar con la opción [`build.lib.formats`](/es/config/build-options.md#build-lib) .

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

Recomendado `package.json` para su lib:

::: code-group

```json [package.json (single entry)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (multiple entries)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### Soporte CSS

Si su biblioteca importa cualquier CSS, se agrupará como un solo archivo CSS además de los archivos JS construidos, por ejemplo, `dist/my-lib.css` . El nombre es predeterminado a `build.lib.fileName` , pero también se puede cambiar con [`build.lib.cssFileName`](/es/config/build-options.md#build-lib) .

Puede exportar el archivo CSS en su `package.json` para ser importado por los usuarios:

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip File Extensions
Si el `package.json` no contiene `"type": "module"` , VITE generará diferentes extensiones de archivos para la compatibilidad Node.js. `.js` se convertirá en `.mjs` y `.cjs` se convertirán en `.js` .
:::

::: tip Environment Variables
En el modo de biblioteca, el uso [`import.meta.env.*`](./env-and-mode.md) se reemplazan estáticamente cuando se construyen para la producción. Sin embargo, `process.env.*` uso no lo son, de modo que los consumidores de su biblioteca pueden cambiarlo dinámicamente. Si esto es indeseable, puede usar `define: { 'process.env.NODE_ENV': '"production"' }` por ejemplo, para reemplazarlos estáticamente, o usar [`esm-env`](https://github.com/benmccann/esm-env) para una mejor compatibilidad con Bundlers y Runtimes.
:::

::: warning Advanced Usage
El modo de biblioteca incluye una configuración simple y obstinada para las bibliotecas de marco orientadas al navegador y JS. Si está construyendo bibliotecas no browser, o requiere flujos de construcción avanzados, puede usar [Rollup](https://rollupjs.org) o [ESBuild](https://esbuild.github.io) directamente.
:::

## Opciones Base Avanzadas

::: warning
Esta característica es experimental. [Dar retroalimentación](https://github.com/vitejs/vite/discussions/13834) .
:::

Para casos de uso avanzados, los activos implementados y los archivos públicos pueden estar en diferentes rutas, por ejemplo, para usar diferentes estrategias de caché.
Un usuario puede optar por implementar en tres rutas diferentes:

- Los archivos HTML de entrada generados (que pueden procesarse durante la SSR)
- Los activos de hash generados (JS, CSS y otros tipos de archivos como imágenes)
- Los [archivos públicos](assets.md#the-public-directory) copiados

Una sola [base](#public-base-path) estática no es suficiente en estos escenarios. VITE proporciona soporte experimental para opciones base avanzadas durante la compilación, usando `experimental.renderBuiltUrl` .

```ts twoslash
import type { UserConfig } from 'vite'
// más bonito
const config: UserConfig = {
  // --- Corte-Before ---
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      } else {
        return { relative: true }
      }
    },
  },
  // --- Corte después de ---
}
```

Si los activos hash y los archivos públicos no se implementan juntos, las opciones para cada grupo se pueden definir de forma independiente utilizando el activo `type` incluido en el segundo `context` parámetro dado a la función.

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// más bonito
const config: UserConfig = {
  // --- Corte-Before ---
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      } else if (path.extname(hostId) === '.js') {
        return {
          runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
        }
      } else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    },
  },
  // --- Corte después de ---
}
```

Tenga en cuenta que el `filename` pasado es una URL decodificada, y si la función devuelve una cadena de URL, también debe decodificarse. Vite manejará la codificación automáticamente al representar las URL. Si se devuelve un objeto con `runtime` , la codificación debe manejarse usted mismo donde sea necesario, ya que el código de tiempo de ejecución se presentará como está.
