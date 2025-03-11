# Manejo De Activos Estáticos

- RELACIONADO: [ruta De Base Pública](./build#Public-Base-Path)
- Relacionado: [opción de configuración `assetsInclude`](/es/config/shared-options.md#assetsinclude)

## Importar activo como URL

Importar un activo estático devolverá la URL pública resuelta cuando se sirva:

```js twoslash
import 'vite/client'
// ---cortar---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Por ejemplo, `imgUrl` será `/src/img.png` durante el desarrollo y se convertirá en `/assets/img.2d8efhg.png` en la construcción de producción.

El comportamiento es similar a Webpack's `file-loader` . La diferencia es que la importación puede estar utilizando rutas públicas absolutas (basadas en la raíz del proyecto durante el desarrollo) o las rutas relativas.

- `url()` referencias en CSS se manejan de la misma manera.

- Si usa el complemento VUE, las referencias de activos en las plantillas VUE SFC se convierten automáticamente en importaciones.

- La imagen, los medios y los filetipos comunes se detectan como activos automáticamente. Puede extender la lista interna utilizando la [opción `assetsInclude`](/es/config/shared-options.md#assetsinclude) .

- Los activos referenciados se incluyen como parte del gráfico de activos de compilación, obtendrán nombres de archivos hash y se pueden procesar mediante complementos para la optimización.

- Los activos más pequeños en bytes que la [opción `assetsInlineLimit`](/es/config/build-options.md#build-assetsinlinelimit) se inclinarán como URL de datos Base64.

- Los marcadores de posición GIT LFS se excluyen automáticamente de la incrustación porque no contienen el contenido del archivo que representan. Para ingresar, asegúrese de descargar el contenido del archivo a través de Git LFS antes de construir.

- TypeScript, por defecto, no reconoce las importaciones de activos estáticos como módulos válidos. Para arreglar esto, incluya [`vite/client`](./features#client-types) .

::: tip Inlining SVGs through `url()`
Al pasar una URL de SVG a una construida manualmente `url()` por JS, la variable debe envolverse dentro de las cotizaciones dobles.

```js twoslash
import 'vite/client'
// ---cortar---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### Importaciones de URL explícitas

Los activos que no están incluidos en la lista interna o en `assetsInclude` , se pueden importar explícitamente como URL utilizando el sufijo `?url` . Esto es útil, por ejemplo, para importar [trabajadores de pintura Houdini](https://developer.mozilla.org/en-US/docs/Web/API/CSS/paintWorklet_static) .

```js twoslash
import 'vite/client'
// ---cortar---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Manejo en Línea Explícito

Los activos se pueden importar explícitamente con insultos o sin enlining utilizando el sufijo `?inline` o `?no-inline` respectivamente.

```js twoslash
import 'vite/client'
// ---cortar---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### Importar Activo Como Cadena

Los activos se pueden importar como cadenas utilizando el sufijo `?raw` .

```js twoslash
import 'vite/client'
// ---cortar---
import shaderString from './shader.glsl?raw'
```

### Importar guión como trabajador

Los scripts se pueden importar como trabajadores web con el sufijo `?worker` o `?sharedworker` .

```js twoslash
import 'vite/client'
// ---cortar---
// Fragmento separado en la construcción de producción
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---cortar---
// trabajador compartido
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---cortar---
// Entrada como cadenas base64
import InlineWorker from './shader.js?worker&inline'
```

Consulte la [sección de trabajadores web](./features.md#web-workers) para obtener más detalles.

## El directorio `public`

Si tiene activos que son:

- Nunca referenciado en el código fuente (por ejemplo, `robots.txt` )
- Debe retener exactamente el mismo nombre de archivo (sin hash)
- ... o simplemente no quieres tener que importar un activo primero solo para obtener su URL

Luego puede colocar el activo en un directorio `public` especial en la raíz de su proyecto. Los activos en este directorio se servirán en la ruta de la raíz `/` durante el desarrollo y se copiarán en la raíz del directorio DIST.

El directorio es predeterminado a `<root>/public` , pero se puede configurar a través de la [opción `publicDir`](/es/config/shared-options.md#publicdir) .

Tenga en cuenta que siempre debe hacer referencia `public` activos utilizando la ruta absoluta raíz; por ejemplo, `public/icon.png` debe referenciarse en el código fuente como `/icon.png` .

## nueva URL (URL, import.meta.url)

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) es una característica de ESM nativa que expone la URL del módulo actual. Combinándolo con el [constructor de URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) nativo, podemos obtener la URL completa y resuelta de un activo estático utilizando una ruta relativa de un módulo JavaScript:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

Esto funciona de forma nativa en los navegadores modernos; de hecho, ¡Vite no necesita procesar este código en absoluto durante el desarrollo!

Este patrón también admite URL dinámicas a través de literales de plantilla:

```js
function getImageUrl(name) {
  // Tenga en cuenta que esto no incluye archivos en subdirectorios
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Durante la construcción de producción, Vite realizará las transformaciones necesarias para que las URL aún apunten a la ubicación correcta incluso después de agrupar y hashing de activos. Sin embargo, la cadena de URL debe ser estática para que se pueda analizar, de lo contrario, el código se dejará como está, lo que puede causar errores de tiempo de ejecución si `build.target` no admite `import.meta.url`

```js
// Vite no transformará esto
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details How it works

Vite transformará la función `getImageUrl` en:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Does not work with SSR
Este patrón no funciona si está utilizando VITE para la representación del lado del servidor, porque `import.meta.url` tiene una semántica diferente en los navegadores vs. node.js. El paquete del servidor tampoco puede determinar la URL del host del cliente con anticipación.
:::
