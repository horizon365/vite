# Prevenimiento De Dependencia

Cuando ejecuta `vite` por primera vez, Vite prebunda las dependencias de su proyecto antes de cargar su sitio localmente. Se realiza de forma automática y transparente de forma predeterminada.

## El Por Qué

Este es VITE que realiza lo que llamamos "pre-Bunding de dependencia". Este proceso tiene dos propósitos:

1. **CommonJS y UMD Compatibilidad:** durante el desarrollo, Vite's Dev sirve todo el código como ESM nativo. Por lo tanto, Vite debe convertir dependencias que se envían como CommonJs o UMD en ESM primero.

   Al convertir las dependencias de CommonJS, VITE realiza un análisis de importación inteligente para que las importaciones nombradas a módulos CommonJS funcionen como se esperaba incluso si las exportaciones se asignan dinámicamente (por ejemplo, reaccionar):

   ```js
   // Funciona como se esperaba
   import React, { useState } from 'react'
   ```

2. **Rendimiento:** VITE convierte las dependencias de ESM con muchos módulos internos en un solo módulo para mejorar el rendimiento de carga de la página posterior.

   Algunos paquetes envían sus módulos ES construye ya que muchos archivos separados se importan entre sí. ¡Por ejemplo, [`lodash-es` tiene más de 600 módulos internos](https://unpkg.com/browse/lodash-es/) ! ¡Cuando hacemos `import { debounce } from 'lodash-es'` , el navegador dispara más de 600 solicitudes HTTP al mismo tiempo! Aunque el servidor no tiene problemas para manejarlos, la gran cantidad de solicitudes crean una congestión de red en el lado del navegador, lo que hace que la página se cargue notablemente más lenta.

   Al pre-Bundling `lodash-es` en un solo módulo, ¡ahora solo necesitamos una solicitud HTTP!

::: tip NOTE
El preinculado de dependencia solo se aplica en modo de desarrollo y usa `esbuild` para convertir dependencias a ESM. En las compilaciones de producción, `@rollup/plugin-commonjs` se usa en su lugar.
:::

## Descubrimiento De Dependencia Automática

Si no se encuentra un caché existente, VITE rastreará su código fuente y descubrirá automáticamente las importaciones de dependencia (es decir, "importaciones desnudas" que esperan resolverse desde `node_modules` ) y usará estas importaciones encontradas como puntos de entrada para el Anuncio previo. El pre-Bundling se realiza con `esbuild` por lo que generalmente es muy rápido.

Una vez que el servidor ya ha comenzado, si se encuentra una nueva importación de dependencia que no está en el caché, VITE volverá a ejecutar el proceso de agrupación DEP y recargará la página si es necesario.

## Monorepos Y Dependencias Vinculadas

En una configuración de Monorepo, una dependencia puede ser un paquete vinculado del mismo repositorio. VITE detecta automáticamente las dependencias que no se resuelven de `node_modules` y trata el DEP vinculado como código fuente. No intentará agrupar el DEP vinculado y analizará la lista de dependencia de Dep vinculada.

Sin embargo, esto requiere que el DEP vinculado se exporte como ESM. Si no, puede agregar la dependencia a [`optimizeDeps.include`](/es/config/dep-optimization-options.md#optimizedeps-include) y [`build.commonjsOptions.include`](/es/config/build-options.md#build-commonjsoptions) en su configuración.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
// ---cortar---
export default defineConfig({
  optimizeDeps: {
    include: ['linked-dep'],
  },
  build: {
    commonjsOptions: {
      include: [/linked-dep/, /node_modules/],
    },
  },
})
```

Al realizar cambios en el DEP vinculado, reinicie el servidor Dev con la opción de línea de comando `--force` para que los cambios entren en vigencia.

## Personalizando el comportamiento

La heurística de descubrimiento de dependencia predeterminada puede no ser siempre deseable. En los casos en que desea incluir/excluir explícitamente las dependencias de la lista, use las [opciones de configuración `optimizeDeps`](/es/config/dep-optimization-options.md) .

Un caso de uso típico para `optimizeDeps.include` o `optimizeDeps.exclude` es cuando tiene una importación que no se puede descubrir directamente en el código fuente. Por ejemplo, tal vez la importación se crea como resultado de una transformación de complemento. Esto significa que Vite no podrá descubrir la importación en el escaneo inicial: solo puede descubrirlo después de que el navegador solicite el archivo y se transforme. Esto hará que el servidor se vuelva a pasar inmediatamente después del inicio del servidor.

Tanto `include` como `exclude` se pueden usar para lidiar con esto. Si la dependencia es grande (con muchos módulos internos) o es común, entonces debe incluirla; Si la dependencia es pequeña y ya es ESM válida, puede excluirla y dejar que el navegador lo cargue directamente.

También puede personalizar ESBuild con la [opción `optimizeDeps.esbuildOptions`](/es/config/dep-optimization-options.md#optimizedeps-esbuildoptions) . Por ejemplo, agregando un complemento ESBuild para manejar archivos especiales en dependencias o cambiar la [compilación `target`](https://esbuild.github.io/api/#target) .

## Almacenamiento en Caché

### Caché Del Sistema De Archivos

Vite almacena en caché las dependencias previas a Bundled en `node_modules/.vite` . Determina si necesita volver a ejecutar el paso previo a la bolsa en función de algunas fuentes:

- Contenido de LockFile de bloqueo del Administrador de paquetes, por ejemplo, `package-lock.json` , `yarn.lock` , `pnpm-lock.yaml` o `bun.lockb` .
- Tiempo de modificación de la carpeta de parches.
- Campos relevantes en su `vite.config.js` , si está presente.
- `NODE_ENV` valor.

El paso previo a Bundling solo deberá volver a ejecutar cuando uno de los anteriores haya cambiado.

Si por alguna razón desea obligar a Vite a volver a superar los DEPS, puede iniciar el servidor Dev con la opción de línea de comando `--force` o eliminar manualmente el directorio de caché `node_modules/.vite` .

### Caché Del Navegador

1. Deshabilite temporalmente el caché a través de la pestaña de red de su navegador DevTools;
2. Reinicie Vite Dev Server con el indicador `--force` para volver a superar el DEPS;
3. Recargar la página.
