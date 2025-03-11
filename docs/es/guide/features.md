# Características

En el nivel muy básico, desarrollar el uso de VITE no es tan diferente de usar un servidor de archivos estático. Sin embargo, VITE proporciona muchas mejoras sobre las importaciones de ESM nativas para admitir varias características que generalmente se ven en configuraciones basadas en Bundler.

## Resolución de dependencia de NPM y pre-Bundling

Las importaciones nativas de ES no admiten las importaciones de módulos desnudos como las siguientes:

```js
import { someMethod } from 'my-dep'
```

Lo anterior arrojará un error en el navegador. VITE detectará tales importaciones de módulos desnudos en todos los archivos de origen servidos y realizará lo siguiente:

1. [Prepárelos](./dep-pre-bundling) para mejorar la velocidad de carga de la página y convertir módulos CommonJS / UMD en ESM. El paso previo a Bundling se realiza con [ESBuild](http://esbuild.github.io/) y hace que el tiempo de inicio del frío de Vite sea significativamente más rápido que cualquier Bundler basado en JavaScript.

2. Reescribe las importaciones a URL válidas como `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd` para que el navegador pueda importarlas correctamente.

**Las dependencias están fuertemente en caché**

VITE almacena solicitudes de dependencia a través de encabezados HTTP, por lo que si desea editar/depurar localmente una dependencia, siga los pasos [aquí](./dep-pre-bundling#browser-cache) .

## Reemplazo Del Módulo Caliente

VITE proporciona una [API HMR](./api-hmr) sobre ESM nativa. Los marcos con capacidades HMR pueden aprovechar la API para proporcionar actualizaciones instantáneas y precisas sin recargar la página o volar el estado de la aplicación. VITE proporciona integraciones de HMR de primera parte para [componentes de un solo archivo VUE](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) y [reaccionó la actualización rápida](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) . También hay integraciones oficiales para PREACT a través de [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite) .

Tenga en cuenta que no necesita configurarlos manualmente: cuando [crea una aplicación a través de `create-vite`](./) , las plantillas seleccionadas ya tendrían estas preconfiguradas para usted.

## Mecanografiado

Vite admite importar `.ts` archivos fuera del cuadro.

### Transpile Solo

Tenga en cuenta que VITE solo realiza la transpilación en los archivos `.ts` y **no** realiza la verificación de tipo. Asume que la verificación de tipo se ocupa de su IDE y proceso de construcción.

La razón por la cual Vite no realiza la verificación de tipo como parte del proceso de transformación es porque los dos trabajos funcionan fundamentalmente de manera diferente. La transpilación puede funcionar por archivo y se alinea perfectamente con el modelo de compilación a pedido de Vite. En comparación, la verificación de tipo requiere conocimiento de todo el gráfico del módulo. La verificación del tipo de talla de zapatos en la tubería de transformación de Vite inevitablemente comprometerá los beneficios de velocidad de Vite.

El trabajo de Vite es poner sus módulos de origen en un formulario que pueda ejecutarse en el navegador lo más rápido posible. Con ese fin, recomendamos separar las verificaciones de análisis estático de la tubería de transformación de Vite. Este principio se aplica a otras verificaciones de análisis estático como ESLint.

- Para las compilaciones de producción, puede ejecutar `tsc --noEmit` además del comando de construcción de Vite.

- Durante el desarrollo, si necesita más que IDE Sugerencias, recomendamos ejecutar `tsc --noEmit --watch` en un proceso separado o usar [Vite-Plugin-Checker](https://github.com/fi3ework/vite-plugin-checker) si prefiere tener errores de tipo informados directamente en el navegador.

VITE usa [ESBuild](https://github.com/evanw/esbuild) para transmisar TypeScript a JavaScript, que es aproximadamente 20 ~ 30x más rápido que Vanilla `tsc` , y las actualizaciones de HMR pueden reflejarse en el navegador en menos de 50 ms.

Use las [importaciones de tipo solo y la sintaxis de exportación](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) para evitar problemas potenciales como las importaciones de solo tipo que se agrupan incorrectamente, por ejemplo:

```ts
import type { T } from 'only/types'
export type { T }
```

### Opciones De Compilador Mecanografiado

Algunos campos de configuración bajo `compilerOptions` en `tsconfig.json` requieren atención especial.

#### `isolatedModules`

- [Documentación mecanografiada](https://www.typescriptlang.org/tsconfig#isolatedModules)

Debe establecerse en `true` .

Es porque `esbuild` solo realiza la transpilación sin información de tipo, no admite ciertas características como const enum e importaciones implícitas de solo tipo.

Debe establecer `"isolatedModules": true` en sus `tsconfig.json` menores de `compilerOptions` , para que TS le advierta contra las características que no funcionan con la transpilación aislada.

Si una dependencia no funciona bien con `"isolatedModules": true` . Puede usar `"skipLibCheck": true` para suprimir temporalmente los errores hasta que se solucione hacia arriba.

#### `useDefineForClassFields`

- [Documentación mecanografiada](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

El valor predeterminado será `true` si el objetivo TypeScript es `ES2022` o más nuevo, incluidos `ESNext` . Es consistente con el [comportamiento de TypeScript 4.3.2+](https://github.com/microsoft/TypeScript/pull/42663) .
Otros objetivos de TypeScript serán predeterminados a `false` .

`true` es el comportamiento estándar de tiempo de ejecución de ECMAScript.

Si está utilizando una biblioteca que depende en gran medida de los campos de clase, tenga cuidado con el uso previsto de la biblioteca.
Si bien la mayoría de las bibliotecas esperan `"useDefineForClassFields": true` , puede establecer explícitamente `useDefineForClassFields` a `false` si su biblioteca no lo admite.

#### `target`

- [Documentación mecanografiada](https://www.typescriptlang.org/tsconfig#target)

Vite ignora el valor `target` en el `tsconfig.json` , siguiendo el mismo comportamiento que `esbuild` .

Para especificar el objetivo en DEV, se puede usar la opción [`esbuild.target`](/es/config/shared-options.html#esbuild) , lo que vale por defecto a `esnext` para una transpilación mínima. En las compilaciones, la opción [`build.target`](/es/config/build-options.html#build-target) tiene mayor prioridad sobre `esbuild.target` y también se puede establecer si es necesario.

::: warning `useDefineForClassFields`

Si `target` en `tsconfig.json` no es `ESNext` o `ES2022` o más nuevo, o si no hay un archivo `tsconfig.json` , `useDefineForClassFields` se predeterminará a `false` lo que puede ser problemático con el valor predeterminado de `esbuild.target` de `esnext` . Puede trasladar a [bloques de inicialización estática](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks#browser_compatibility) que pueden no ser compatibles con su navegador.

Como tal, se recomienda establecer `target` a `ESNext` o `ES2022` o más nuevo, o establecer `useDefineForClassFields` a `true` explícitamente al configurar `tsconfig.json` .
:::

#### Otras Opciones De Compilador Que Afectan El Resultado De Compilación

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)
- [`alwaysStrict`](https://www.typescriptlang.org/tsconfig#alwaysStrict)

::: tip `skipLibCheck`
Las plantillas de inicio de VITE tienen `"skipLibCheck": "true"` por defecto para evitar las dependencias de compensación de típica, ya que pueden optar solo por admitir versiones y configuraciones específicas de TypeScript. Puede obtener más información en [VueJS/Vue-Cli#5688](https://github.com/vuejs/vue-cli/pull/5688) .
:::

### Tipos De Clientes

Los tipos predeterminados de Vite son para su API nodo.js. Para calmar el entorno del código del lado del cliente en una aplicación VITE, agregue un archivo de declaración `d.ts` :

```typescript
///<reference types="vite/client">
```

::: details Using `compilerOptions.types`

Alternativamente, puede agregar `vite/client` a `compilerOptions.types` dentro de `tsconfig.json` :

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client", "some-other-global-lib"]
  }
}
```

Tenga en cuenta que si se especifica [`compilerOptions.types`](https://www.typescriptlang.org/tsconfig#types) , solo estos paquetes se incluirán en el alcance global (en lugar de todos los paquetes visibles "@Types").

:::

`vite/client` proporciona las siguientes cuñas de tipo:

- Importaciones de activos (por ejemplo, importar un archivo `.svg` )
- Tipos para las [constantes](./env-and-mode#env-variables) inyectadas por vite en `import.meta.env`
- Tipos para la [API HMR](./api-hmr) en `import.meta.hot`

::: tip
Para anular la tipificación predeterminada, agregue un archivo de definición de tipo que contenga sus tipificaciones. Luego, agregue la referencia de tipo antes de `vite/client` .

Por ejemplo, para hacer que la importación predeterminada de `*.svg` sea un componente React:

- `vite-env-override.d.ts` (el archivo que contiene sus tipos):
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- El archivo que contiene la referencia a `vite/client` :
  ```ts
  ///<reference types="./vite-env-override.d.ts">
  ///<reference types="vite/client">
  ```

:::

## HTML

Los archivos HTML se mantienen [al frente y al centro](/es/guide/#index-html-and-project-root) de un proyecto VITE, que sirven como puntos de entrada para su aplicación, lo que hace que sea simple construir [aplicaciones de una sola página y múltiples páginas](/es/guide/build.html#multi-page-app) .

Cualquier archivo HTML en la raíz de su proyecto puede acceder directamente por su ruta de directorio respectiva:

- `<root>/index.html` -> `http://localhost:5173/`
- `<root>/about.html` -> `http://localhost:5173/about.html`
- `<root>/blog/index.html` -> `http://localhost:5173/blog/index.html`

Los activos a los que se hace referencia por elementos HTML, como `<script type="module" src>` y `<link href>` se procesan y se agrupan como parte de la aplicación. La lista completa de elementos compatibles es el siguiente:

- `<audio src>`
- `<embed src>`
- `<img src>` y `<img srcset>`
- `<image src>`
- `<input src>`
- `<link href>` y `<link imagesrcset>`
- `<object data>`
- `<script type="module" src>`
- `<source src>` y `<source srcset>`
- `<track src>`
- `<use href>` y `<use xlink:href>`
- `<video src>` y `<video poster>`
- `<meta content>`
  - Solo si `name` de atributo 0 coincide `msapplication-tileimage` , `msapplication-square70x70logo` , `msapplication-square150x150logo` , `msapplication-wide310x150logo` , `msapplication-square310x310logo` , `msapplication-config` o `twitter:image`
  - O solo si `property` de atributo 0 coincide `og:image` , `og:image:url` , `og:image:secure_url` , `og:audio` , `og:audio:secure_url` , `og:video` o `og:video:secure_url`

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Para optar por no participar en el procesamiento HTML en ciertos elementos, puede agregar el atributo `vite-ignore` en el elemento, que puede ser útil al hacer referencia a activos externos o CDN.

## Marcos

Todos los marcos modernos mantienen integraciones con VITE. La mayoría de los complementos de marco son mantenidos por cada equipo de marco, con la excepción de los complementos oficiales VUE y React Vite que se mantienen en VITE Org:

- Soporte VUE a través de [@VITEJS/Plugin-Vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- Soporte Vue JSX a través de [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- Reaccionar el soporte a través de [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
- Reaccionar usando el soporte SWC a través de [@VITEJS/Plugin-React-SWC](https://github.com/vitejs/vite-plugin-react-swc)

Consulte la [Guía de complementos](https://vite.dev/plugins) para obtener más información.

## JSX

Los archivos `.jsx` y `.tsx` también son compatibles con el cuadro. La transpilación JSX también se maneja a través de [ESBuild](https://esbuild.github.io) .

Su marco de elección ya configurará JSX fuera de la caja (por ejemplo, los usuarios de Vue deben usar el complemento oficial [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx) , que proporciona características específicas VUE 3 que incluyen HMR, resolución de componentes globales, directivas y ranuras).

Si usa JSX con su propio marco, Custom `jsxFactory` y `jsxFragment` se pueden configurar utilizando la [opción `esbuild`](/es/config/shared-options.md#esbuild) . Por ejemplo, el complemento PREACT usaría:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Más detalles en [ESBuild Docs](https://esbuild.github.io/content-types/#jsx) .

Puede inyectar los ayudantes JSX usando `jsxInject` (que es una opción solo por vite) para evitar importaciones manuales:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

La importación de `.css` archivos inyectará su contenido a la página a través de una etiqueta `<style>` con soporte HMR.

### `@import` Entrando y rebajando

VITE se configura preconfigurado para admitir CSS `@import` en línea a través de `postcss-import` . Los alias vite también se respetan por CSS `@import` . Además, todas las referencias de CSS `url()` , incluso si los archivos importados están en diferentes directorios, siempre se describen automáticamente para garantizar la corrección.

`@import` alias y la rebase de URL también son compatibles con SASS y menos archivos (ver [preprocesadores de CSS](#css-pre-processors) ).

### Postcss

Si el proyecto contiene una configuración PostCSS válida (cualquier formato admitido por [PostCSS-Load-Config](https://github.com/postcss/postcss-load-config) , por ejemplo, `postcss.config.js` ), se aplicará automáticamente a todos los CSS importados.

Tenga en cuenta que la minificación CSS se ejecutará después de PostCSS y usará la opción [`build.cssTarget`](/es/config/build-options.md#build-csstarget) .

### Módulos CSS

Cualquier archivo CSS que termine con `.module.css` se considera un [archivo de módulos CSS](https://github.com/css-modules/css-modules) . Importar dicho archivo devolverá el objeto del módulo correspondiente:

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
// ---cortar---
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

El comportamiento de los módulos CSS se puede configurar a través de la [opción `css.modules`](/es/config/shared-options.md#css-modules) .

Si se establece `css.modules.localsConvention` para habilitar los locales de CamelCase (por ejemplo, `localsConvention: 'camelCaseOnly'` ), también puede usar las importaciones nombradas:

```js twoslash
import 'vite/client'
// ---cortar---
//
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### Preprocesadores de CSS

Debido a que VITE se dirige solo a los navegadores modernos, se recomienda usar variables CSS nativas con complementos PostCSS que implementan borradores de CSSWG (por ejemplo, [PostCSS-Nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting) ) y el autor CSS que cumplen con los estandizados futuros.

Dicho esto, Vite proporciona soporte incorporado para archivos `.scss` , `.sass` , `.less` , `.styl` y `.stylus` . No es necesario instalar complementos específicos de Vite para ellos, pero el preprocesador correspondiente en sí debe instalarse:

```bash
# .scss y .sass
npm add -D sass-embedded # o sass

# .menos
npm add -D less

# .styl y .stylus
npm add -D stylus
```

Si usa componentes de un solo archivo VUE, esto también habilita automáticamente `<style lang="sass">` et al.

VITE mejora la resolución `@import` para SASS y menos para que también se respeten los alias de VITE. Además, las referencias relativas `url()` dentro de los archivos SASS/menos importados que se encuentran en diferentes directorios del archivo raíz también se recuperan automáticamente para garantizar la corrección.

`@import` El alias y la rebase de URL no son compatibles con el lápiz lápiz debido a sus limitaciones de API.

### Desactivar la inyección de CSS en la página

La inyección automática de contenido CSS se puede apagar a través del parámetro de consulta `?inline` . En este caso, la cadena CSS procesada se devuelve como la exportación predeterminada del módulo como de costumbre, pero los estilos no se inyectan a la página.

```js twoslash
import 'vite/client'
// ---cortar---
import './foo.css' // se inyectará en la página
import otherStyles from './bar.css?inline' // no se inyectará
```

::: tip NOTE
Las importaciones predeterminadas y nombradas de los archivos CSS (por ejemplo, `import style from './foo.css'` ) se eliminan desde Vite 5. Use la consulta `?inline` en su lugar.
:::

### Lightning CSS

A partir de Vite 4.4, existe un soporte experimental para [el Lightning CSS](https://lightningcss.dev/) . Puede optar por él agregando [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer) a su archivo de configuración e instalar la dependencia opcional [`lightningcss`](https://www.npmjs.com/package/lightningcss) :

```bash
npm add -D lightningcss
```

Si está habilitado, los archivos CSS serán procesados por Lightning CSS en lugar de PostCSS. Para configurarlo, puede pasar opciones de Lightning CSS a la opción de configuración [`css.lightningcss`](../config/shared-options.md#css-lightningcss) .

Para configurar los módulos CSS, usará [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) en lugar de [`css.modules`](../config/shared-options.md#css-modules) (que configura la forma en que PostCSS maneja los módulos CSS).

Por defecto, VITE usa ESBuild para minificar CSS. Lightning CSS también se puede usar como el minificador CSS con [`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify) .

::: tip NOTE
[Los preprocesadores de CSS](#css-pre-processors) no son compatibles cuando se usan CSS Lightning.
:::

## Activo Estático

Importar un activo estático devolverá la URL pública resuelta cuando se sirva:

```js twoslash
import 'vite/client'
// ---cortar---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Las consultas especiales pueden modificar cómo se cargan los activos:

```js twoslash
import 'vite/client'
// ---cortar---
// Cargar activos explícitamente como URL
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
// ---cortar---
// Cargar activos como cadenas
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
// ---cortar---
// Cargar Trabajadores Web
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
// ---cortar---
// Los trabajadores web ingresaron como cadenas Base64 en el tiempo de compilación
import InlineWorker from './worker.js?worker&inline'
```

Más detalles en [el manejo de activos estáticos](./assets) .

## JSON

Los archivos JSON se pueden importar directamente: las importaciones nombradas también son compatibles:

```js twoslash
import 'vite/client'
// ---cortar---
// importar todo el objeto
import json from './example.json'
// Importe un campo de raíz como las exportaciones nombradas: ¡ayuda con la sacudida de los árboles!
import { field } from './example.json'
```

## Importación Del Globo

VITE admite importar múltiples módulos desde el sistema de archivos a través de la función especial `import.meta.glob` :

```js twoslash
import 'vite/client'
// ---cortar---
const modules = import.meta.glob('./dir/*.js')
```

Lo anterior se transformará en lo siguiente:

```js
// Código producido por Vite
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

Luego puede iterar sobre las claves del objeto `modules` para acceder a los módulos correspondientes:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

Los archivos emparejados se cargan por perezoso por defecto a través de la importación dinámica y se dividirán en fragmentos separados durante la compilación. Si prefiere importar todos los módulos directamente (por ejemplo, depender de los efectos secundarios en estos módulos que se aplicarán primero), puede pasar `{ eager: true }` como el segundo argumento:

```js twoslash
import 'vite/client'
// ---cortar---
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

Lo anterior se transformará en lo siguiente:

```js
// Código producido por Vite
import * as __vite_glob_0_0 from './dir/bar.js'
import * as __vite_glob_0_1 from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

### Múltiples Patrones

El primer argumento puede ser una variedad de globos, por ejemplo

```js twoslash
import 'vite/client'
// ---cortar---
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### Patrones Negativos

Los patrones de globas negativas también son compatibles (prefijados con `!` ). Para ignorar algunos archivos del resultado, puede agregar los patrones de exclusión de globas al primer argumento:

```js twoslash
import 'vite/client'
// ---cortar---
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// Código producido por Vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### Importaciones Nombradas

Es posible importar solo partes de los módulos con las opciones `import` .

```ts twoslash
import 'vite/client'
// ---cortar---
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// Código producido por Vite
const modules = {
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
}
```

Cuando se combina con `eager` , incluso es posible tener habilitado los módulos de los módulos.

```ts twoslash
import 'vite/client'
// ---cortar---
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// Código producido por Vite:
import { setup as __vite_glob_0_0 } from './dir/bar.js'
import { setup as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

Establecer `import` a `default` para importar la exportación predeterminada.

```ts twoslash
import 'vite/client'
// ---cortar---
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// Código producido por Vite:
import { default as __vite_glob_0_0 } from './dir/bar.js'
import { default as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

#### Consultas Personalizadas

También puede usar la opción `query` para proporcionar consultas a las importaciones, por ejemplo, para importar activos [como una cadena](https://vite.dev/guide/assets.html#importing-asset-as-string) o [como URL](https://vite.dev/guide/assets.html#importing-asset-as-url) :

```ts twoslash
import 'vite/client'
// ---cortar---
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// Código producido por Vite:
const moduleStrings = {
  './dir/bar.svg': () => import('./dir/bar.svg?raw').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/bar.svg': () => import('./dir/bar.svg?url').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?url').then((m) => m['default']),
}
```

También puede proporcionar consultas personalizadas para que otros complementos consuman:

```ts twoslash
import 'vite/client'
// ---cortar---
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

### Advertencias De Importación Del Globo

Tenga en cuenta que:

- Esta es una característica de solo VITE y no es un estándar web o ES.
- Los patrones del globo se tratan como especificadores de importación: deben ser relativos (comenzar con `./` ) o absoluto (comenzar con `/` , resolverse en relación con la raíz del proyecto) o una ruta de alias (ver [`resolve.alias` opción](/es/config/shared-options.md#resolve-alias) ).
- La coincidencia del globo se realiza a través de [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) .
- También debe tener en cuenta que todos los argumentos en el `import.meta.glob` deben **aprobarse como literales** . No puede usar variables o expresiones en ellas.

## Importación Dinámica

Similar a [la importación del globo](#glob-import) , VITE también admite la importación dinámica con variables.

```ts
const module = await import(`./dir/${file}.js`)
```

Tenga en cuenta que las variables solo representan nombres de archivo de un nivel de profundidad. Si `file` es `'foo/bar'` , la importación fallaría. Para un uso más avanzado, puede usar la función [de importación de globas](#glob-import) .

## Aviso Web

Los archivos `.wasm` precompilados se pueden importar con `?init` .
La exportación predeterminada será una función de inicialización que devuelve una promesa del [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance) :

```js twoslash
import 'vite/client'
// ---cortar---
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

La función init también puede tomar un objeto de importación que se pasa a [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate) como su segundo argumento:

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
// ---cortar---
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

En la compilación de producción, `.wasm` archivos más pequeños que `assetInlineLimit` se inclinarán como cadenas Base64. De lo contrario, serán tratados como un [activo estático](./assets) y obtenidos a pedido.

::: tip NOTE
[La propuesta de integración del módulo ES para WebAssembly](https://github.com/WebAssembly/esm-integration) no es compatible actualmente.
Use [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) u otros complementos comunitarios para manejar esto.
:::

### Acceder Al Módulo WebAssembly

Si necesita acceso al objeto `Module` , por ejemplo, para instanciarlo varias veces, use una [importación de URL explícita](./assets#explicit-url-imports) para resolver el activo y luego realice la instancia:

```js twoslash
import 'vite/client'
// ---cortar---
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### Obtener el módulo en Node.js

En SSR, el `fetch()` que ocurre como parte de la importación `?init` , puede fallar con `TypeError: Invalid URL` .
Vea el problema [de soporte WASM en SSR](https://github.com/vitejs/vite/issues/8882) .

Aquí hay una alternativa, suponiendo que la base del proyecto sea el directorio actual:

```js twoslash
import 'vite/client'
// ---cortar---
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## Trabajadores Web

### Importar con constructores

Se puede importar un script de trabajadores web utilizando [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) y [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker) . En comparación con los sufijos de trabajadores, esta sintaxis se inclina más cerca de los estándares y es la forma **recomendada** de crear trabajadores.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

El constructor de trabajadores también acepta opciones, que pueden usarse para crear trabajadores de "módulo":

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

La detección de trabajadores solo funcionará si el constructor `new URL()` se usa directamente dentro de la declaración `new Worker()` . Además, todos los parámetros de opciones deben ser valores estáticos (es decir, literales de cadena).

### Importar Con Sufijos De Consulta

Un script de trabajador web se puede importar directamente agregando `?worker` o `?sharedworker` a la solicitud de importación. La exportación predeterminada será un constructor de trabajadores personalizados:

```js twoslash
import 'vite/client'
// ---cortar---
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

El script de trabajadores también puede usar declaraciones ESM `import` en lugar de `importScripts()` . **Nota** : Durante el desarrollo, esto se basa en [el soporte nativo del navegador](https://caniuse.com/?search=module%20worker) , pero para la construcción de producción se compila.

Por defecto, el script de trabajadores se emitirá como una fragmentación separada en la compilación de producción. Si desea en línea al trabajador como cadenas Base64, agregue la consulta `inline` :

```js twoslash
import 'vite/client'
// ---cortar---
import MyWorker from './worker?worker&inline'
```

Si desea recuperar al trabajador como URL, agregue la consulta `url` :

```js twoslash
import 'vite/client'
// ---cortar---
import MyWorker from './worker?worker&url'
```

Consulte [las opciones de trabajadores](/es/config/worker-options.md) para obtener detalles sobre la configuración de la agrupación de todos los trabajadores.

## Política De Seguridad De Contenido (Csp)

Para implementar CSP, se deben establecer ciertas directivas o configuraciones debido a las partes internas de Vite.

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

Cuando se establece [`html.cspNonce`](/es/config/shared-options#html-cspnonce) , Vite agrega un atributo NonCe con el valor especificado a cualquier etiqueta `<script>` y `<style>` , así como `<link>` etiquetas para hojas de estilo y precarga del módulo. Además, cuando esta opción se establece, Vite inyectará una metaetiqueta ( `<meta property="csp-nonce" nonce="PLACEHOLDER" />` ).

VITE utilizará el valor nonce de una metaetiqueta con `property="csp-nonce"` cuando sea necesario durante el desarrollo y después de la construcción.

:::warning
Asegúrese de reemplazar al marcador de posición con un valor único para cada solicitud. Esto es importante para evitar pasar por alto la política de un recurso, que de otro modo se puede hacer fácilmente.
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

Por defecto, durante la compilación, Vite ingresa pequeños activos como URI de datos. Allowing `data:` for related directives (eg [`img-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src) , [`font-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src) ), or, disabling it by setting [`build.assetsInlineLimit: 0`](/es/config/build-options#build-assetsinlinelimit) is necessary.

:::warning
No permita `data:` para [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) . Permitirá la inyección de scripts arbitrarios.
:::

## Construir Optimizaciones

> Las características enumeradas a continuación se aplican automáticamente como parte del proceso de compilación y no hay necesidad de una configuración explícita a menos que desee deshabilitarlas.

### División del código CSS

Vite extrae automáticamente el CSS utilizado por los módulos en un trozo de async y genera un archivo separado para él. El archivo CSS se carga automáticamente a través de una etiqueta `<link>` cuando se carga el fragmento Async asociado, y la fragmentación de Async se garantiza que solo se evalúa después de que el CSS se carga para evitar [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.) .

Si prefiere extraer todo el CSS en un solo archivo, puede deshabilitar la división del código CSS configurando [`build.cssCodeSplit`](/es/config/build-options.md#build-csscodesplit) a `false` .

### Generación De Directivas Precargadas

Vite genera automáticamente `<link rel="modulepreload">` directivas para fragmentos de entrada y sus importaciones directas en el HTML construido.

### Optimización De Carga De Async Fragmentos

En las aplicaciones del mundo real, el rollo a menudo genera fragmentos "comunes", código que se comparte entre dos o más fragmentos. Combinado con importaciones dinámicas, es bastante común tener el siguiente escenario:

<script setup>
import graphSvg from '../../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

En los escenarios no optimizados, cuando se importa Async Chunk `A` , el navegador tendrá que solicitar y analizar `A` antes de que pueda calcular que también necesita el Chunk `C` Common. Esto da como resultado una red redonda de red adicional:

```
Entry ---> A ---> C
```

VITE reescribe automáticamente las llamadas de importación dinámica de código aislado con un paso de precarga para que cuando se solicite `A` , `C` se obtiene **en paralelo** :

```
Entry ---> (A + C)
```

Es posible que `C` tenga más importaciones, lo que dará como resultado aún más entradas redondas en el escenario no optimizado. La optimización de Vite trazará todas las importaciones directas para eliminar por completo los viajes redondos independientemente de la profundidad de importación.
