# Migración de V5

## API ambiental

Como parte de la nueva [API del entorno](/es/guide/api-environment.md) experimental, se necesitaba una gran refactorización interna. Vite 6 se esfuerza por evitar romper los cambios para garantizar que la mayoría de los proyectos puedan actualizarse rápidamente al nuevo especialista. Esperaremos hasta que una gran parte del ecosistema se haya movido para estabilizarse y comenzar a recomendar el uso de las nuevas API. Puede haber algunos casos de borde, pero estos solo deberían afectar el uso de bajo nivel por marcos y herramientas. Hemos trabajado con mantenedores en el ecosistema para mitigar estas diferencias antes del lanzamiento. [Abra un problema](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml) si ve una regresión.

Se han eliminado algunas API internas debido a los cambios en la implementación de Vite. Si confiaba en uno de ellos, cree una [solicitud de función](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml) .

## VITE Runtime API

La API experimental de tiempo de ejecución VITE se convirtió en la API del corredor del módulo, lanzado en Vite 6 como parte de la nueva [API del entorno](/es/guide/api-environment) experimental. Dado que la característica fue experimental, la eliminación de la API anterior introducida en Vite 5.1 no es un cambio de ruptura, pero los usuarios deberán actualizar su uso al equivalente del corredor del módulo como parte de la migración a Vite 6.

## Cambios Generales

### Valor predeterminado para `resolve.conditions`

Este cambio no afecta a los usuarios que no [`ssr.resolve.externalConditions`](/es/config/ssr-options#ssr-resolve-externalconditions) [`resolve.conditions`](/es/config/shared-options#resolve-conditions) [`ssr.resolve.conditions`](/es/config/ssr-options#ssr-resolve-conditions)

En Vite 5, el valor predeterminado para `resolve.conditions` fue `[]` y algunas condiciones se agregaron internamente. El valor predeterminado para `ssr.resolve.conditions` fue el valor de `resolve.conditions` .

Desde Vite 6, algunas de las condiciones ya no se agregan internamente y deben incluirse en los valores de configuración.
Las condiciones que ya no se agregan internamente para

- `resolve.conditions` son `['' módulo ',' navegador ',' Desarrollo|producción '] `
- `ssr.resolve.conditions` son `['módulo', 'nodo', 'desarrollo|producción '] `

Los valores predeterminados para esas opciones se actualizan a los valores correspondientes y `ssr.resolve.conditions` ya no usa `resolve.conditions` como valor predeterminado. Tenga en cuenta que `desarrollo|PRODUCCIÓN `is a special variable that is replaced with`PRODUCCIÓN`or`Desarrollo`depending on the value of`Process.env.node_env`. These default values are exported from `Vite`as`DefaultClientConditions`and` Defaultserverconditions`.

Si especificó un valor personalizado para `resolve.conditions` o `ssr.resolve.conditions` , debe actualizarlo para incluir las nuevas condiciones.
Por ejemplo, si previamente especificó `['custom']` para `resolve.conditions` , debe especificar `['custom', ...defaultClientConditions]` en su lugar.

### Json stringify

En Vite 5, cuando se establece [`json.stringify: true`](/es/config/shared-options#json-stringify) , [`json.namedExports`](/es/config/shared-options#json-namedexports) estaba deshabilitado.

De Vite 6, incluso cuando `json.stringify: true` está establecido, `json.namedExports` no está deshabilitado y el valor se respeta. Si desea lograr el comportamiento anterior, puede establecer `json.namedExports: false` .

VITE 6 también presenta un nuevo valor predeterminado para `json.stringify` que es `'auto'` , que solo triturará archivos JSON grandes. Para deshabilitar este comportamiento, establece `json.stringify: false` .

### Apoyo extendido de referencias de activos en elementos HTML

En Vite 5, solo unos pocos elementos HTML compatibles pudieron hacer referencia a activos que serán procesados y agrupados por VITE, como `<link href>` , `<img src>` , etc.

Vite 6 extiende el soporte a aún más elementos HTML. La lista completa se puede encontrar en los documentos [de características HTML](/es/guide/features.html#html) .

Para optar por no participar en el procesamiento HTML en ciertos elementos, puede agregar el atributo `vite-ignore` en el elemento.

### postcss-load-config

[`postcss-load-config`](https://npmjs.com/package/postcss-load-config) se ha actualizado a V6 desde V4. Ahora se requiere [`tsx`](https://www.npmjs.com/package/tsx) o [`jiti`](https://www.npmjs.com/package/jiti) para cargar archivos de configuración PostCSS de TypeScript en lugar de [`ts-node`](https://www.npmjs.com/package/ts-node) . Además, ahora se requiere [`yaml`](https://www.npmjs.com/package/yaml) archivos de configuración YAML PostCSS.

### Sass ahora usa API moderna de forma predeterminada

En Vite 5, la API heredada se usó de forma predeterminada para SASS. Vite 5.4 agregó soporte para la API moderna.

Desde Vite 6, la API moderna se usa de forma predeterminada para SASS. Si desea usar la API heredada, puede establecer [`css.preprocessorOptions.scss.api: 'legacy'` `css.preprocessorOptions.sass.api: 'legacy'`](/es/config/shared-options#css-preprocessoroptions) Pero tenga en cuenta que el soporte de API heredado se eliminará en Vite 7.

Para migrar a la API moderna, vea [la documentación de SASS](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/) .

### Personalizar el nombre del archivo de salida de CSS en modo biblioteca

En VITE 5, el nombre del archivo de salida CSS en el modo de biblioteca siempre fue `style.css` y no se puede cambiar fácilmente a través de la configuración VITE.

Desde Vite 6, el nombre de archivo predeterminado ahora usa `"name"` en `package.json` similar a los archivos de salida JS. Si se establece [`build.lib.fileName`](/es/config/build-options.md#build-lib) con una cadena, el valor también se utilizará para el nombre del archivo de salida CSS. Para establecer explícitamente un nombre de archivo CSS diferente, puede usar el nuevo [`build.lib.cssFileName`](/es/config/build-options.md#build-lib) para configurarlo.

Para migrar, si se había basado en el nombre del archivo `style.css` , debe actualizar las referencias al nuevo nombre según el nombre de su paquete. Por ejemplo:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

Si prefiere quedarse con `style.css` como en Vite 5, puede establecer `build.lib.cssFileName: 'style'` en su lugar.

## Avanzado

Hay otros cambios de ruptura que solo afectan a pocos usuarios.

- [[#17922] FIX (CSS)!: Eliminar la importación predeterminada en SSR dev](https://github.com/vitejs/vite/pull/17922)
  - El soporte para la importación predeterminada de archivos CSS se [desactivó en VITE 4](https://v4.vite.dev/guide/migration.html#importing-css-as-a-string) y se eliminó en Vite 5, pero todavía fue compatible sin querer en el modo de desarrollo SSR. Este soporte ahora se elimina.
- [[#15637] ¡FIJA!: Predeterminado `build.cssMinify` a `'esbuild'` para SSR](https://github.com/vitejs/vite/pull/15637)
  - [`build.cssMinify`](/es/config/build-options#build-cssminify) ahora está habilitado de forma predeterminada incluso para compilaciones SSR.
- [[#18070] Feat!: Bypass proxy con WebSocket](https://github.com/vitejs/vite/pull/18070)
  - Ahora se requiere `server.proxy[path].bypass` para solicitudes de actualización de WebSocket y, en ese caso, el parámetro `res` será `undefined` .
- [[#18209] ¡Refactor!: Versión mínima de Terser a 5.16.0](https://github.com/vitejs/vite/pull/18209)
  - La versión mínima de Terser compatible para [`build.minify: 'terser'`](/es/config/build-options#build-minify) se superó a 5.16.0 desde 5.4.0.
- [[#18231] Chore (Deps): actualizar dependencia @rollup/complement-commonjs a v28](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires) es ahora `true` por defecto (era `'auto'` antes).
    - Esto puede conducir a tamaños de paquete más grandes, pero dará como resultado construcciones más deterministas.
    - Si está especificando un archivo CommonJS como punto de entrada, es posible que necesite pasos adicionales. Lea [la documentación del complemento CommonJS](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#using-commonjs-files-as-entry-points) para obtener más detalles.
- [[#18243] Chore (Deps)!: Migrar `fast-glob` a `tinyglobby`](https://github.com/vitejs/vite/pull/18243)
  - Los frenos de rango ( `{01..03}` ⇒ `['01', '02', '03']` ) y los frenos incrementales ( `{2..8..2}` ⇒ `['2', '4', '6', '8']` ) ya no se admiten en los globos.
- [[#18395] Feat (Resolve)!: Permitir condiciones de eliminación](https://github.com/vitejs/vite/pull/18395)
  - Este PR no solo introduce un cambio de ruptura mencionado anteriormente como "valor predeterminado para `resolve.conditions` ", sino que también hace que `resolve.mainFields` no se use para dependencias no externalizadas en SSR. Si estaba usando `resolve.mainFields` y desea aplicarlo a dependencias no externalizadas en SSR, puede usar [`ssr.resolve.mainFields`](/es/config/ssr-options#ssr-resolve-mainfields) .
- [[#18493] ¡Refactor!: Eliminar la opción Fs.CachedChecks](https://github.com/vitejs/vite/pull/18493)
  - Esta optimización de suscripción se eliminó debido a los casos de borde al escribir un archivo en una carpeta en caché e importarlo inmediatamente.
- ~~[[#18697] Fix (Deps)!: Actualizar dependencia de Dotenv-Expand a V12](https://github.com/vitejs/vite/pull/18697)~~
  - ~~Las variables utilizadas en la interpolación deben declararse antes de la interpolación ahora. Para más detalles, consulte [el `dotenv-expand` ChangeLog](https://github.com/motdotla/dotenv-expand/blob/v12.0.1/CHANGELOG.md#1200-2024-11-16) .~~ Este cambio de ruptura fue revertido en V6.1.0.
- [[#16471] hazaña: V6 - API ambiental](https://github.com/vitejs/vite/pull/16471)

  - Las actualizaciones de un módulo solo SSR ya no desencadena una página completa de recarga en el cliente. Para volver al comportamiento anterior, se puede usar un complemento VITE personalizado:
    <details>
    <summary>Haga clic para expandir el ejemplo</summary>

    ```ts twoslash
    import type { Plugin, EnvironmentModuleNode } from 'vite'

    function hmrReload(): Plugin {
      return {
        name: 'hmr-reload',
        enforce: 'post',
        hotUpdate: {
          order: 'post',
          handler({ modules, server, timestamp }) {
            if (this.environment.name !== 'ssr') return

            let hasSsrOnlyModules = false

            const invalidatedModules = new Set<EnvironmentModuleNode>()
            for (const mod of modules) {
              if (mod.id == null) continue
              const clientModule =
                server.environments.client.moduleGraph.getModuleById(mod.id)
              if (clientModule != null) continue

              this.environment.moduleGraph.invalidateModule(
                mod,
                invalidatedModules,
                timestamp,
                true,
              )
              hasSsrOnlyModules = true
            }

            if (hasSsrOnlyModules) {
              server.ws.send({ type: 'full-reload' })
              return []
            }
          },
        },
      }
    }
    ```

    </details>

## Migración de V4

Verifique la [migración de la guía V4](https://v5.vite.dev/guide/migration.html) en los documentos VITE V5 primero para ver los cambios necesarios para portar su aplicación a Vite 5, y luego continúe con los cambios en esta página.
