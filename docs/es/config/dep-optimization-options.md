# Opciones De Optimización DEP

- **RELACIONADO:** [Pre-Bunding de dependencia](/es/guide/dep-pre-bundling)

A menos que se indique, las opciones en esta sección solo se aplican al optimizador de dependencia, que solo se usa en Dev.

## optimizeDeps.entries

- **Tipo:** `cadena | cadena [] `

Por defecto, VITE rastreará todos sus `.html` archivos para detectar dependencias que necesitan ser previamente amplios (ignorando `node_modules` , `build.outDir` , `__tests__` y `coverage` ). Si se especifica `build.rollupOptions.input` , Vite rastreará esos puntos de entrada.

Si ninguno de estos se ajusta a sus necesidades, puede especificar entradas personalizadas utilizando esta opción: el valor debe ser un [patrón `tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) o una matriz de patrones que son relativos de VITE Project Root. Esto sobrescribirá la inferencia de entradas predeterminadas. Solo `node_modules` y `build.outDir` carpetas se ignorarán de forma predeterminada cuando `optimizeDeps.entries` se define explícitamente. Si se deben ignorar otras carpetas, puede usar un patrón de ignoración como parte de la lista de entradas, marcado con un `!` inicial. Si no desea ignorar `node_modules` y `build.outDir` , puede especificar el uso de rutas de cadena literal (sin `tinyglobby` patrones) en su lugar.

## optimizeDeps.exclude

- **Tipo:** `string[]`

Dependencias para excluir del pre-Bundling.

:::warning CommonJS
Las dependencias de CommonJS no deben excluirse de la optimización. Si se excluye una dependencia de ESM de la optimización, pero tiene una dependencia común de JS CommonJS, la dependencia común de JS debe agregarse a `optimizeDeps.include` . Ejemplo:

```js twoslash
import { defineConfig } from 'vite'
// ---cortar---
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include

- **Tipo:** `string[]`

De manera predeterminada, los paquetes vinculados no dentro de `node_modules` no están previos. Use esta opción para forzar que un paquete vinculado sea previamente anunciado.

**Experimental:** si está utilizando una biblioteca con muchas importaciones profundas, también puede especificar un patrón de global final para superar todas las importaciones profundas a la vez. Esto evitará un pre-Bundling constante cada vez que se use una nueva importación profunda. [Dar retroalimentación](https://github.com/vitejs/vite/discussions/15833) . Por ejemplo:

```js twoslash
import { defineConfig } from 'vite'
// ---cortar---
export default defineConfig({
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
})
```

## optimizeDeps.esbuildOptions

- **Tipo:** [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) `<` [`EsbuildBuildOptions`](https://esbuild.github.io/api/#general-options) `,
| 'manojo'
| 'Entrypoints'
| 'externo'
| 'escribir'
| 'mirar'
| 'Outdir'
| 'Outfile'
| 'Base fuera'
| 'outextension'
| 'metafile'> `

Opciones para pasar a ESBuild durante el escaneo y optimización DEP.

Ciertas opciones se omiten ya que cambiarlas no sería compatible con la optimización DEP de Vite.

- `external` también se omite, use la opción `optimizeDeps.exclude` de Vite
- `plugins` se fusionan con el complemento DEP de Vite

## optimizeDeps.force

- **Tipo:** `boolean`

Establecer en `true` para forzar la dependencia previa a la dependencia, ignorando las dependencias optimizadas previamente almacenadas en caché.

## optimizeDeps.holdUntilCrawlEnd

- **Experimental:** [dar retroalimentación](https://github.com/vitejs/vite/discussions/15834)
- **Tipo:** `boolean`
- **Valor predeterminado:** `true`

Cuando esté habilitado, mantendrá los primeros resultados de DEPS optimizados hasta que todas las importaciones estáticas se rastreen en el inicio de frío. Esto evita la necesidad de recargas de página completa cuando se descubren nuevas dependencias y desencadenan la generación de nuevos fragmentos comunes. Si el escáner se encuentra todas las dependencias más las definidas explícitamente en `include` , es mejor deshabilitar esta opción para que el navegador procese más solicitudes en paralelo.

## optimizeDeps.disabled

- **Desapercibido**
- **Experimental:** [dar retroalimentación](https://github.com/vitejs/vite/discussions/13839)
- **Tipo:** `booleano | 'construir' | 'Dev'`
- **Valor predeterminado:** `'build'`

Esta opción está en desuso. A partir de VITE 5.1, se han eliminado el prejuicio de dependencias durante la construcción. La configuración de `optimizeDeps.disabled` a `true` o `'dev'` deshabilita el optimizador y configurado en `false` o `'build'` deja el optimizador durante el dev habilitado.

Para deshabilitar el optimizador por completo, use `optimizeDeps.noDiscovery: true` para no permitir el descubrimiento automático de dependencias y deje `optimizeDeps.include` indefinido o vacío.

:::warning
Optimizar las dependencias durante el tiempo de compilación fue una característica **experimental** . Los proyectos que intentan esta estrategia también eliminaron `@rollup/plugin-commonjs` usando `build.commonjsOptions: { include: [] }` . Si lo hizo, una advertencia lo guiará a volver a habilitarlo para admitir paquetes de solo CJS mientras se agrupa.
:::

## optimizeDeps.needsInterop

- **Experimental**
- **Tipo:** `string[]`

Fuerza a ESM INEFOP al importar estas dependencias. VITE puede detectar adecuadamente cuándo una dependencia necesita interopía, por lo que generalmente no se necesita esta opción. Sin embargo, diferentes combinaciones de dependencias podrían hacer que algunas de ellas sean precedidas de manera diferente. Agregar estos paquetes a `needsInterop` puede acelerar el comienzo en frío evitando las recargas de página completa. Recibirá una advertencia si este es el caso de una de sus dependencias, lo que sugiere agregar el nombre del paquete a esta matriz en su configuración.
