# Por Qué Vite

## Los Problemas

Antes de que los módulos ES estuvieran disponibles en los navegadores, los desarrolladores no tenían un mecanismo nativo para autorizar a JavaScript de manera modularizada. Es por eso que todos estamos familiarizados con el concepto de "agrupación": el uso de herramientas que se arrastran, procesan y concatenan nuestros módulos de origen en archivos que pueden ejecutarse en el navegador.

Con el tiempo, hemos visto herramientas como [Webpack](https://webpack.js.org/) , [Rollup](https://rollupjs.org) y [Parcel](https://parceljs.org/) , lo que mejoró enormemente la experiencia de desarrollo para los desarrolladores frontend.

Sin embargo, a medida que creamos aplicaciones cada vez más ambiciosas, la cantidad de JavaScript con el que estamos tratando también está aumentando drásticamente. No es raro que los proyectos a gran escala contengan miles de módulos. Estamos comenzando a alcanzar un cuello de botella de rendimiento para las herramientas basadas en JavaScript: a menudo puede tomar una espera irrazonablemente larga (¡a veces hasta minutos!) Para girar un servidor de desarrollo, e incluso con el reemplazo del módulo caliente (HMR), las ediciones de archivos pueden tardar un par de segundos en reflejarse en el navegador. El ciclo de retroalimentación lenta puede afectar en gran medida la productividad y la felicidad de los desarrolladores.

Vite tiene como objetivo abordar estos problemas aprovechando los nuevos avances en el ecosistema: la disponibilidad de módulos ES nativos en el navegador y el aumento de las herramientas de JavaScript escritas en idiomas compilados a nativos.

### Inicio Lento Del Servidor

Al iniciar el frío del servidor de Dev, una configuración de compilación basada en Bundler tiene que arrastrarse con entusiasmo y construir toda su aplicación antes de que se pueda servir.

VITE mejora la hora de inicio del servidor Dev dividiendo primero los módulos en una aplicación en dos categorías: **dependencias** y **código fuente** .

- **Las dependencias** son en su mayoría JavaScript simples que no cambian a menudo durante el desarrollo. Algunas grandes dependencias (por ejemplo, bibliotecas de componentes con cientos de módulos) también son bastante costosas de procesar. Las dependencias también se pueden enviar en varios formatos de módulo (por ejemplo, ESM o CommonJS).

  Vite [dependencias previas a los bundios](./dep-pre-bundling.md) utilizando [ESBuild](https://esbuild.github.io/) . ESBuild está escrito en las dependencias GO y previos a los Bundles 10-100x más rápido que los Bundlers basados en JavaScript.

- **El código fuente** a menudo contiene JavaScript no plano que necesita transformación (por ejemplo, JSX, CSS o componentes Vue/Svelte), y se editará muy a menudo. Además, no todo el código fuente debe cargarse al mismo tiempo (por ejemplo, con la división de código basado en la ruta).

  Vite sirve código fuente sobre [ESM nativo](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) . Esto esencialmente permite que el navegador se haga cargo de parte del trabajo de un Bundler: Vite solo necesita transformar y servir el código fuente bajo demanda, como lo solicita el navegador. El código detrás de las importaciones dinámicas condicionales solo se procesa si realmente se usa en la pantalla actual.

<script setup>
import bundlerSvg from '../../images/bundler.svg?raw'
import esmSvg from '../../images/esm.svg?raw'
</script>
<svg-image :svg="bundlerSvg" />
<svg-image :svg="esmSvg" />

### Actualizaciones Lentas

Cuando un archivo se edita en una configuración de compilación basada en Bundler, es ineficiente reconstruir todo el paquete por una razón obvia: la velocidad de actualización se degradará linealmente con el tamaño de la aplicación.

En algunos Bundlers, el servidor de Dev ejecuta la agrupación en la memoria para que solo necesite invalidar parte de su gráfico de módulo cuando cambia un archivo, pero aún necesita volver a construir todo el paquete y recargar la página web. Reconstruir el paquete puede ser costoso, y la recarga de la página quita el estado actual de la aplicación. Esta es la razón por la cual algunos Bundlers admiten el reemplazo del módulo caliente (HMR): permitir que un módulo se "reemplace en caliente" sin afectar el resto de la página. Esto mejora en gran medida DX, sin embargo, en la práctica hemos encontrado que incluso la velocidad de actualización de HMR se deteriora significativamente a medida que crece el tamaño de la aplicación.

En Vite, HMR se realiza sobre ESM nativo. Cuando se edita un archivo, VITE solo necesita invalidar con precisión la cadena entre el módulo editado y su límite HMR más cercano (la mayoría de las veces solo el módulo en sí), lo que hace que las actualizaciones de HMR sean consistentemente rápidas, independientemente del tamaño de su aplicación.

Vite también aprovecha los encabezados HTTP para acelerar las recargas de página completa (nuevamente, deja que el navegador haga más funcionar para nosotros): las solicitudes del módulo de código fuente se hacen condicionales a través de `304 Not Modified` , y las solicitudes de módulos de dependencia se almacenan en caché a través de `Cache-Control: max-age=31536000,immutable` para que no vuelvan a presionar el servidor una vez que se almacenan en caché.

Una vez que experimente lo rápido que es Vite, dudamos mucho de que esté dispuesto a aguantar nuevamente el desarrollo agrupado.

## Por Qué Paquete Para La Producción

A pesar de que el ESM nativo ahora es ampliamente compatible, el envío de ESM desagradable en producción sigue siendo ineficiente (incluso con HTTP/2) debido a los viajes de reducción de red adicionales causados por las importaciones anidadas. Para obtener el rendimiento de carga óptimo en la producción, es mejor agrupar su código con sacudidas de árboles, carga perezosa y división común de fragmentos (para un mejor almacenamiento en caché).

Asegurar la producción óptima y la consistencia de comportamiento entre el servidor Dev y la construcción de producción no es fácil. Esta es la razón por la cual Vite se envía con un [comando de construcción](./build.md) preconfigurado que hornea muchas [optimizaciones de rendimiento](./features.md#build-optimizations) fuera de la caja.

## ¿Por qué no parar con ESBuild?

Si bien Vite aprovecha ESBuild para [superar algunas dependencias en Dev](./dep-pre-bundling.md) , Vite no usa ESBuild como Bundler para las compilaciones de producción.

La API de complemento actual de Vite no es compatible con el uso de `esbuild` como Bundler. A pesar de que `esbuild` es más rápido, la adopción de Vite de la API e infraestructura de complementos flexibles de Rollup contribuyó en gran medida a su éxito en el ecosistema. Por el momento, creemos que Rollup ofrece una mejor compensación de rendimiento-flexibilidad de VS.

Rollup también ha estado trabajando en mejoras de rendimiento, [cambiando su analizador a SWC en V4](https://github.com/rollup/rollup/pull/5073) . Y hay un esfuerzo continuo para construir un puerto de óxido de rollup llamado Roldown. Una vez que Roldown esté listo, podría reemplazar tanto el rollup como el ESBuild en VITE, mejorando significativamente el rendimiento de compilación y eliminando las inconsistencias entre el desarrollo y la construcción. Puede ver [la nota clave de Evan You's Viteconf 2023 para obtener más detalles](https://youtu.be/hrdwQHoAp0M) .

## ¿Cómo Se Relaciona Vite Con Otras Herramientas De Compilación Desagradables?

[WMR](https://github.com/preactjs/wmr) del equipo PREACT buscó proporcionar un conjunto de características similar. La API Universal Rollup Plugin de Vite para Dev and Build se inspiró en él. WMR ya no se mantiene. El equipo de Preact ahora recomienda VITE con [@PreactJS/Preset-Vite](https://github.com/preactjs/preset-vite) .

[La capa de nieve](https://www.snowpack.dev/) también era un servidor de desarrollo ESM nativo sin hundimiento, muy similar en alcance a Vite. El pre-Bundling de dependencia de Vite también se inspira en la capa de nieve V1 (ahora [`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall) ). La capa de nieve ya no se mantiene. El equipo de la capa de nieve ahora está trabajando en [Astro](https://astro.build/) , un constructor de sitios estático impulsado por Vite.

[@web/dev-server](https://modern-web.dev/docs/dev-server/overview/) (anteriormente `es-dev-server` ) es un gran proyecto y la configuración del servidor KOA de Vite 1.0 se inspiró en él. El proyecto `@web` paraguas se mantiene activamente y contiene muchas otras herramientas excelentes que también pueden beneficiar a los usuarios vitados.
