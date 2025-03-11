# API ambiental

:::warning Experimental
El medio ambiente API es experimental. Mantendremos las API estables durante Vite 6 para dejar que el ecosistema experimente y construir sobre ella. Estamos planeando estabilizar estas nuevas API con posibles cambios de ruptura en Vite 7.

Recursos:

- [Discusión de comentarios](https://github.com/vitejs/vite/discussions/16358) Cuando estamos recopilando comentarios sobre las nuevas API.
- [API ambiental PR](https://github.com/vitejs/vite/pull/16471) donde se implementó y revisó la nueva API.

Comparta sus comentarios con nosotros.
:::

## Formalización De Entornos

Vite 6 formaliza el concepto de entornos. Hasta Vite 5, había dos entornos implícitos ( `client` y opcionalmente `ssr` ). La nueva API de entorno permite a los usuarios y a los autores marco crear tantos entornos como sea necesario para mapear la forma en que funcionan sus aplicaciones en producción. Esta nueva capacidad requirió una gran refactorización interna, pero se ha realizado mucho esfuerzo en la compatibilidad hacia atrás. El objetivo inicial de VITE 6 es mover el ecosistema a la nueva especialización de la manera más suave posible, retrasando la adopción de estas nuevas API experimentales hasta que suficientes usuarios hayan migrado y los marcos y los autores de complementos hayan validado el nuevo diseño.

## Cerrar La Brecha Entre Build Y Dev

Para un SPA/MPA simple, no se expusen nuevas API en los entornos a la configuración. Internamente, Vite aplicará las opciones a un entorno `client` , pero no es necesario saber este concepto al configurar VITE. La configuración y el comportamiento de Vite 5 deberían funcionar sin problemas aquí.

Cuando pasamos a una aplicación típica del lado del servidor (SSR), tendremos dos entornos:

- `client` : ejecuta la aplicación en el navegador.
- `server` : Ejecuta la aplicación en el nodo (u otros tiempos de ejecución del servidor) que representa páginas antes de enviarlas al navegador.

En Dev, Vite ejecuta el código del servidor en el mismo proceso de nodo que el servidor VITE DEV, dando una aproximación cercana al entorno de producción. Sin embargo, también es posible que los servidores se ejecuten en otros tiempos de ejecución de JS, como [Workerd de Cloudflare](https://github.com/cloudflare/workerd) que tienen diferentes limitaciones. Las aplicaciones modernas también pueden ejecutarse en más de dos entornos, por ejemplo, un navegador, un servidor de nodo y un servidor de borde. Vite 5 no permitió representar adecuadamente estos entornos.

Vite 6 permite a los usuarios configurar su aplicación durante la compilación y el desarrollo para mapear todos sus entornos. Durante el desarrollo, ahora se puede usar un solo servidor de desarrollo VITE para ejecutar código en múltiples entornos diferentes simultáneamente. El código fuente de la aplicación todavía está transformado por Vite Dev Server. Además del servidor HTTP compartido, MiddleWares, Configed Config y Plugins Pipeline, el servidor VITE DEV ahora tiene un conjunto de entornos de desarrollo independientes. Cada uno de ellos está configurado para que coincida con el entorno de producción lo más cerca posible, y está conectado a un tiempo de ejecución de desarrollo donde se ejecuta el código (para WorkerD, el código del servidor ahora puede ejecutarse en miniflare localmente). En el cliente, el navegador importa y ejecuta el código. En otros entornos, un corredor de módulo obtiene y evalúa el código transformado.

![Entornos vites](../../images/vite-environments.svg)

## Configuración De Entornos

Para un SPA/MPA, la configuración se verá similar a Vite 5. Internamente, estas opciones se utilizan para configurar el entorno `client` .

```js
export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
})
```

Esto es importante porque nos gustaría mantener a Vite accesible y evitar exponer nuevos conceptos hasta que sean necesarios.

Si la aplicación está compuesta por varios entornos, estos entornos se pueden configurar explícitamente con la opción de configuración `environments` .

```js
export default {
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
}
```

Cuando no se documenta explícitamente, el entorno hereda las opciones de configuración de nivel superior configuradas (por ejemplo, los nuevos entornos `server` y `edge` heredarán la opción `build.sourcemap: false` ). Un pequeño número de opciones de nivel superior, como `optimizeDeps` , solo se aplican al entorno `client` , ya que no funcionan bien cuando se aplican como entornos de servidor predeterminados. El entorno `client` también se puede configurar explícitamente a través de `environments.client` , pero recomendamos hacerlo con las opciones de nivel superior para que la configuración del cliente permanezca sin cambios al agregar nuevos entornos.

La interfaz `EnvironmentOptions` expone todas las opciones por entorno. Hay opciones de entorno que se aplican a `build` y `dev` , como `resolve` . Y hay `DevEnvironmentOptions` y `BuildEnvironmentOptions` para desarrollo y construyen opciones específicas (como `dev.warmup` o `build.outDir` ). Algunas opciones como `optimizeDeps` solo se aplican al Dev, pero se mantienen como nivel superior en lugar de anidados en `dev` para la compatibilidad con atraso.

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

La interfaz `UserConfig` se extiende desde la interfaz `EnvironmentOptions` , permitiendo configurar el cliente y los valores predeterminados para otros entornos, configurado a través de la opción `environments` . El entorno `client` y un servidor llamado `ssr` siempre están presentes durante el desarrollo. Esto permite la compatibilidad hacia atrás con `server.ssrLoadModule(url)` y `server.moduleGraph` . Durante la construcción, el entorno `client` siempre está presente, y el entorno `ssr` solo está presente si está configurado explícitamente (usando `environments.ssr` o para la compatibilidad con atraso `build.ssr` ). Una aplicación no necesita usar el nombre `ssr` para su entorno SSR, podría nombrarla `server` por ejemplo.

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // Otras opciones
}
```

Tenga en cuenta que la propiedad `ssr` de nivel superior se va a desaprobar una vez que la API del entorno sea estable. Esta opción tiene el mismo papel que `environments` , pero para el entorno `ssr` predeterminado y solo permitió la configuración de un pequeño conjunto de opciones.

## Instancias De Entorno Personalizadas

Las API de configuración de bajo nivel están disponibles para que los proveedores de tiempo de ejecución puedan proporcionar a los entornos valores predeterminados adecuados para sus tiempos de ejecución. Estos entornos también pueden generar otros procesos o hilos para ejecutar los módulos durante el desarrollo en un tiempo de ejecución más cercano al entorno de producción.

```js
import { customEnvironment } from 'vite-environment-provider'

export default {
  build: {
    outDir: '/dist/client',
  },
  environments: {
    ssr: customEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
  },
}
```

## Compatibilidad Con Atrasado

La API actual del servidor VITE aún no está en desuso y es compatible con versiones anteriores con VITE 5. La nueva API de entorno es experimental.

El `server.moduleGraph` devuelve una vista mixta de los gráficos del módulo del cliente y SSR. Los nodos de módulos mixtos compatibles hacia atrás se devolverán de todos sus métodos. El mismo esquema se usa para los nodos del módulo pasados a `handleHotUpdate` .

No recomendamos cambiar a API de entorno todavía. Apuntamos a que una buena parte de la base de usuarios adopte Vite 6 antes, por lo que los complementos no necesitan mantener dos versiones. Consulte la sección de cambios de ruptura futura para obtener información sobre las deprecaciones futuras y la ruta de actualización:

- [`this.environment` en ganchos](/es/changes/this-environment-in-hooks)
- [Gancho de complemento HMR `hotUpdate`](/es/changes/hotupdate-hook)
- [Mudarse a API por ambiente](/es/changes/per-environment-apis)
- [SSR usando `ModuleRunner` API](/es/changes/ssr-using-modulerunner)
- [Complementos compartidos durante la compilación](/es/changes/shared-plugins-during-build)

## Usuarios Objetivo

Esta guía proporciona los conceptos básicos sobre entornos para usuarios finales.

Los autores de complementos tienen una API más consistente disponible para interactuar con la configuración del entorno actual. Si está construyendo sobre VITE, la Guía [de complementos de API de entorno](./api-environment-plugins.md) describe la forma en que las API extendidas de complementos disponibles para admitir múltiples entornos personalizados.

Los marcos podrían decidir exponer entornos en diferentes niveles. Si usted es un autor marco, continúe leyendo la [Guía de marcos API de entorno](./api-environment-frameworks) para conocer el lado programático de la API de entorno.

Para los proveedores de tiempo de ejecución, la [Guía de tiempos de ejecución de API de entorno](./api-environment-runtimes.md) explica cómo ofrecer un entorno personalizado para ser consumido por marcos y usuarios.
