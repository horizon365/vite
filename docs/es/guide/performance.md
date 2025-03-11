# Actuación

Si bien Vite es rápido por defecto, los problemas de rendimiento pueden aumentar a medida que crecen los requisitos del proyecto. Esta guía tiene como objetivo ayudarlo a identificar y solucionar problemas de rendimiento comunes, como:

- El servidor lento comienza
- Cargas de página lentas
- Construcciones lentas

## Revise La Configuración De Su Navegador

Algunas extensiones del navegador pueden interferir con las solicitudes y ralentizar los tiempos de inicio y recargar para grandes aplicaciones, especialmente cuando se usa herramientas de desarrollo del navegador. Recomendamos crear un perfil de desarrollo solo sin extensiones, o cambiar al modo de incógnito, mientras usa el servidor Dev de Vite en estos casos. El modo de incógnito también debe ser más rápido que un perfil regular sin extensiones.

El servidor VITE DEV realiza un almacenamiento en caché duro de las dependencias previas a Bundled e implementa respuestas rápidas de 304 para el código fuente. Deshabilitar el caché mientras las herramientas de desarrollo del navegador están abiertas puede tener un gran impacto en los tiempos de recarga de inicio y de página completa. Verifique que "deshabilitar el caché" no esté habilitado mientras trabaja con el servidor VITE.

## Auditoría Complementos VITE Configurados

Los complementos internos y oficiales de Vite están optimizados para hacer la menor cantidad de trabajo posible al tiempo que proporciona compatibilidad con el ecosistema más amplio. Por ejemplo, las transformaciones de código usan Regex en Dev, pero realice un análisis completo en la compilación para garantizar la corrección.

Sin embargo, el rendimiento de los complementos comunitarios está fuera del control de Vite, lo que puede afectar la experiencia del desarrollador. Aquí hay algunas cosas que puede tener en cuenta al usar complementos VITE adicionales:

1. Las grandes dependencias que solo se usan en ciertos casos deben importarse dinámicamente para reducir el tiempo de inicio del nodo.js. Refactores de ejemplo: [Vite-Plugin-React#212](https://github.com/vitejs/vite-plugin-react/pull/212) y [Vite-Plugin-PWA#224](https://github.com/vite-pwa/vite-plugin-pwa/pull/244) .

2. Los ganchos `buildStart` , `config` y `configResolved` no deben ejecutar operaciones largas y extensas. Estos ganchos se esperan durante el inicio del servidor de Dev, que se retrasa cuando puede acceder al sitio en el navegador.

3. Los ganchos `resolveId` , `load` y `transform` pueden hacer que algunos archivos se carguen más lento que otros. Si bien a veces es inevitable, todavía vale la pena verificar las posibles áreas para optimizar. Por ejemplo, verificar si el `code` contiene una palabra clave específica, o el `id` coincide con una extensión específica, antes de hacer la transformación completa.

   Cuanto más tiempo sea transformar un archivo, más significativa será la cascada de solicitud al cargar el sitio en el navegador.

   Puede inspeccionar la duración que se necesita para transformar un archivo usando `vite --debug plugin-transform` o [Vite-Plugin-Inspect](https://github.com/antfu/vite-plugin-inspect) . Tenga en cuenta que, como las operaciones asíncronas tienden a proporcionar tiempos inexactos, debe tratar los números como una estimación aproximada, pero aún debería revelar las operaciones más caras.

::: tip Profiling
Puede ejecutar `vite --profile` , visitar el sitio y presionar `p + enter` en su terminal para registrar un `.cpuprofile` . Luego se puede usar una herramienta como [Speedscope](https://www.speedscope.app) para inspeccionar el perfil e identificar los cuellos de botella. También puede [compartir los perfiles](https://chat.vite.dev) con el equipo VITE para ayudarnos a identificar problemas de rendimiento.
:::

## Reducir Las Operaciones De Resolución

Resolver rutas de importación puede ser una operación costosa al alcanzar su peor caso a menudo. Por ejemplo, VITE admite rutas de importación "adivinando" con la opción [`resolve.extensions`](/es/config/shared-options.md#resolve-extensions) , que de valor predeterminada a `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']` .

Cuando intente importar `./Component.jsx` con `import './Component'` , Vite ejecutará estos pasos para resolverlo:

1. Compruebe si `./Component` existe, no.
2. Compruebe si `./Component.mjs` existe, no.
3. Compruebe si `./Component.js` existe, no.
4. Compruebe si `./Component.mts` existe, no.
5. Compruebe si `./Component.ts` existe, no.
6. Compruebe si `./Component.jsx` existe, ¡sí!

Como se muestra, se requiere un total de 6 verificaciones del sistema de archivos para resolver una ruta de importación. Cuanto más importaciones implícitas tenga, más tiempo se suma para resolver las rutas.

Por lo tanto, generalmente es mejor ser explícito con sus rutas de importación, por ejemplo, `import './Component.jsx'` . También puede reducir la lista para `resolve.extensions` para reducir las verificaciones generales del sistema de archivos, pero debe asegurarse de que también funcione para archivos en `node_modules` .

Si es un autor de complementos, asegúrese de llamar solo [`this.resolve`](https://rollupjs.org/plugin-development/#this-resolve) cuando sea necesario para reducir el número de cheques anteriores.

::: tip TypeScript
Si está utilizando TypeScript, habilite `"moduleResolution": "bundler"` y `"allowImportingTsExtensions": true` en sus `tsconfig.json` 's `compilerOptions` para usar `.ts` y `.tsx` extensiones directamente en su código.
:::

## Evite Los Archivos De Barril

Los archivos de barril son archivos que reexportan las API de otros archivos en el mismo directorio. Por ejemplo:

```js [src/utils/index.js]
export * from './color.js'
export * from './dom.js'
export * from './slash.js'
```

Cuando solo importa una API individual, por `import { slash } from './utils'` , todos los archivos en ese archivo de barril deben obtenerse y transformarse, ya que pueden contener la API `slash` y también pueden contener efectos secundarios que se ejecutan en la inicialización. Esto significa que está cargando más archivos de los requeridos en la carga inicial de la página, lo que resulta en una carga de página más lenta.

Si es posible, debe evitar archivos de barril e importar las API individuales directamente, por ejemplo, `import { slash } from './utils/slash.js'` . Puede leer [el problema #8237](https://github.com/vitejs/vite/issues/8237) para obtener más información.

## Calentar Archivos De Uso Frecuente

El servidor VITE DEV solo transforma los archivos según lo solicitado por el navegador, lo que le permite iniciar rápidamente y solo aplicar transformaciones para los archivos usados. También puede previamente archivos de transformación si anticipa que ciertos archivos se solicitarán en breve. Sin embargo, las cascadas de solicitud aún pueden ocurrir si algunos archivos tardan más en transformarse que otros. Por ejemplo:

Dado un gráfico de importación donde el archivo izquierdo importa el archivo derecho:

```
main.js -> BigComponent.vue -> big-utils.js -> large-data.json
```

La relación de importación solo se puede conocer después de que se transforma el archivo. Si `BigComponent.vue` tarda un tiempo en transformarse, `big-utils.js` que esperar su turno, y así sucesivamente. Esto causa una cascada interna incluso con la pretransformación incorporada.

Vite le permite calentar archivos que conoce con frecuencia, por ejemplo, `big-utils.js` , utilizando la opción [`server.warmup`](/es/config/server-options.md#server-warmup) . De esta manera, `big-utils.js` estará listo y almacenado en caché para ser atendido de inmediato cuando se lo solicite.

Puede encontrar archivos que se usan con frecuencia ejecutando `vite --debug transform` e inspeccionar los registros:

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
```

```js [vite.config.js]
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

Tenga en cuenta que solo debe calentar archivos que se usan con frecuencia para no sobrecargar el servidor VITE DEV al inicio. Verifique la opción [`server.warmup`](/es/config/server-options.md#server-warmup) para obtener más información.

El uso de [`--open` o `server.open`](/es/config/server-options.html#server-open) también proporciona un impulso de rendimiento, ya que Vite calentará automáticamente el punto de entrada de su aplicación o la URL proporcionada para abrir.

## Usar Herramientas Menores O Nativas

Mantener a Vite rápido con una base de código en crecimiento se trata de reducir la cantidad de trabajo para los archivos de origen (JS/TS/CSS).

Ejemplos de hacer menos trabajo:

- Use CSS en lugar de Sass/Less/Stylus cuando sea posible (PostCSS puede manejar el anidación)
- No transforme SVGS en componentes marco de UI (reaccionar, Vue, etc.). Importarlos como cadenas o URL en su lugar.
- Cuando use `@vitejs/plugin-react` , evite configurar las opciones de Babel, de modo que omita la transformación durante la compilación (solo se utilizará ESBuild).

Ejemplos de uso de herramientas nativas:

El uso de herramientas nativas a menudo trae un mayor tamaño de instalación y, como no es el valor predeterminado al comenzar un nuevo proyecto VITE. Pero puede valer la pena el costo de aplicaciones más grandes.

- Pruebe el soporte experimental para [Lightningcss](https://github.com/vitejs/vite/discussions/13835)
- Use [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc) en lugar de `@vitejs/plugin-react` .
