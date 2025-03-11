---
title: Configuración De VITE
---

# Configuración De VITE

Al ejecutar `vite` desde la línea de comando, Vite intentará resolver automáticamente un archivo de configuración llamado `vite.config.js` Inside [Project Root](/es/guide/#index-html-and-project-root) (también se admiten otras extensiones JS y TS).

El archivo de configuración más básico se ve así:

```js [vite.config.js]
export default {
  // opciones de configuración
}
```

Nota admite VITE usando la sintaxis de los módulos ES en el archivo de configuración, incluso si el proyecto no está utilizando el nodo nativo ESM, por ejemplo, `type: "module"` en `package.json` . En este caso, el archivo de configuración se procesa automáticamente antes de la carga.

También puede especificar explícitamente un archivo de configuración para usar con la opción `--config` CLI (resuelta en relación con `cwd` ):

```bash
vite --config my-config.js
```

::: tip CONFIG LOADING
Por defecto, VITE usa `esbuild` para agrupar la configuración en un archivo temporal y cargarlo. Esto puede causar problemas al importar archivos TypeScript en un Monorepo. Si encuentra algún problema con este enfoque, puede especificar `--configLoader runner` para usar el [corredor del módulo](/es/guide/api-environment-runtimes.html#modulerunner) , lo que no creará una configuración temporal y transformará ningún archivo en la marcha. Tenga en cuenta que Module Runner no admite CJS en archivos de configuración, pero los paquetes CJS externos deberían funcionar como de costumbre.

Alternativamente, si está utilizando un entorno que admite TypeScript (por ejemplo, `node --experimental-strip-types` ), o si solo está escribiendo JavaScript simple, puede especificar `--configLoader native` para usar el tiempo de ejecución nativo del entorno para cargar el archivo de configuración. Tenga en cuenta que las actualizaciones a los módulos importados por el archivo de configuración no se detectan y, por lo tanto, no se resaltarían automáticamente el servidor VITE.
:::

## Configurar IntelliSense

Dado que vite se envía con tipificaciones mecanografiadas, puede aprovechar el intelisense de su IDE con sugerencias de tipo JSDOC:

```js
/** @Type {import ('vite'). UserConfig} */
export default {
  // ...
}
```

Alternativamente, puede usar el `defineConfig` ayudante que debe proporcionar IntelliSense sin la necesidad de anotaciones JSDOC:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

VITE también admite archivos de configuración de TypeScript. Puede usar `vite.config.ts` con la función `defineConfig` Helper anterior, o con el operador `satisfies` :

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## Configuración Condicional

Si la configuración necesita determinar condicionalmente las opciones basadas en el comando ( `serve` o `build` ), el [modo](/es/guide/env-and-mode#modes) que se usa, si se trata de una compilación SSR ( `isSsrBuild` ), o está previsualizando la compilación ( `isPreview` ), puede exportar una función en su lugar:

```js twoslash
import { defineConfig } from 'vite'
// ---cortar---
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // configuración específica de desarrollo
    }
  } else {
    // comando === 'construir'
    return {
      // construir una configuración específica
    }
  }
})
```

Es importante tener en cuenta que en la API de Vite el valor `command` es `serve` durante el desarrollo (en el CLI [`vite`](/es/guide/cli#vite) , `vite dev` y `vite serve` son alias), y `build` al construir para la producción ( [`vite build`](/es/guide/cli#vite-build) ).

`isSsrBuild` y `isPreview` son banderas opcionales adicionales para diferenciar el tipo de comandos `build` y `serve` respectivamente. Algunas herramientas que cargan la configuración VITE pueden no admitir estos indicadores y pasarán `undefined` en su lugar. Por lo tanto, se recomienda utilizar una comparación explícita contra `true` y `false` .

## Configuración Async

Si la configuración necesita llamar a las funciones de Async, puede exportar una función async en su lugar. Y esta función de asíncrata también se puede pasar a través de `defineConfig` para mejorar el apoyo de IntelliSense:

```js twoslash
import { defineConfig } from 'vite'
// ---cortar---
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // VITE CONFIG
  }
})
```

## Uso De Variables De Entorno en La Configuración

Las variables ambientales se pueden obtener de `process.env` como de costumbre.

Tenga en cuenta que VITE no carga `.env` archivos de forma predeterminada, ya que los archivos para cargar solo se pueden determinar después de evaluar la configuración VITE, por ejemplo, las opciones `root` y `envDir` afectan el comportamiento de carga. Sin embargo, puede usar el ayudante exportado `loadEnv` para cargar el archivo `.env` específico si es necesario.

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Cargue el archivo ENV basado en `mode` en el directorio de trabajo actual.
  // Establezca el tercer parámetro en '' para cargar todo envío independientemente del
  // `VITE_` prefijo.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // VITE CONFIG
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
