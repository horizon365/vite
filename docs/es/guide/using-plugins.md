# Usando Complementos

Vite se puede extender utilizando complementos, que se basan en la interfaz de complemento bien diseñada de Rollup con algunas opciones adicionales específicas de VITE. Esto significa que los usuarios de VITE pueden confiar en el ecosistema maduro de los complementos de rollo, al tiempo que pueden extender la funcionalidad del servidor Dev y SSR según sea necesario.

## Agregar un complemento

Para usar un complemento, debe agregarse al `devDependencies` del proyecto e incluido en la matriz `plugins` en el archivo de configuración `vite.config.js` . Por ejemplo, para proporcionar soporte para los navegadores heredados, se puede usar el oficial [@vitejs/complemento-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) :

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

`plugins` también acepta presets, incluidos varios complementos como un solo elemento. Esto es útil para características complejas (como la integración Framework) que se implementan utilizando varios complementos. La matriz se aplanará internamente.

Se ignorarán los complementos de Falsy, que se pueden usar para activar o desactivar fácilmente complementos.

## Encontrar Complementos

:::tip NOTE
VITE tiene como objetivo proporcionar soporte listos para los patrones de desarrollo web comunes. Antes de buscar un complemento de acumulación vite o compatible, consulte la [guía de características](../guide/features.md) . Muchos de los casos en que se necesitaría un complemento en un proyecto de rollups ya están cubiertos en VITE.
:::

Consulte la [sección de complementos](../plugins/) para obtener información sobre complementos oficiales. Los complementos comunitarios se enumeran en [Awesome-Vite](https://github.com/vitejs/awesome-vite#plugins) .

También puede encontrar complementos que sigan las [convenciones recomendadas](./api-plugin.md#conventions) utilizando una [búsqueda NPM de Vite-Plugin](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity) para complementos VITE o una [búsqueda de NPM para Plugin Rollup-Plugin](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) para complementos.

## Cumplimiento De Pedidos De Complementos

Para la compatibilidad con algunos complementos de rollo, puede ser necesario hacer cumplir el orden del complemento o solo aplicar en el momento de la compilación. Este debería ser un detalle de implementación para complementos VITE. Puede hacer cumplir la posición de un complemento con el modificador `enforce` :

- `pre` : Invocar el complemento antes de los complementos de Vite Core
- Valor predeterminado: Invoca el complemento después de los complementos de Vite Core
- `post` : Invoca el complemento después de los complementos de compilación VITE

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

Consulte [la Guía API de complementos](./api-plugin.md#plugin-ordering) para obtener información detallada.

## Aplicación Condicional

Por defecto, los complementos se invocan tanto para servir como para construir. En los casos en que un complemento debe aplicarse condicionalmente solo durante el servicio o la construcción, use la propiedad `apply` para invocarlos solo durante `'build'` o `'serve'` :

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## Construcción De Complementos

Consulte la [Guía API de complementos](./api-plugin.md) para la documentación sobre la creación de complementos.
