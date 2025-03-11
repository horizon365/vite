# API de entorno para complementos

:::warning Experimental
El medio ambiente API es experimental. Mantendremos las API estables durante Vite 6 para dejar que el ecosistema experimente y construir sobre ella. Estamos planeando estabilizar estas nuevas API con posibles cambios de ruptura en Vite 7.

Recursos:

- [Discusión de comentarios](https://github.com/vitejs/vite/discussions/16358) Cuando estamos recopilando comentarios sobre las nuevas API.
- [API ambiental PR](https://github.com/vitejs/vite/pull/16471) donde se implementó y revisó la nueva API.

Comparta sus comentarios con nosotros.
:::

## Acceder al entorno actual en ganchos

Dado que solo había dos entornos hasta Vite 6 ( `client` y `ssr` ), un `ssr` booleano fue suficiente para identificar el entorno actual en las API vite. Los ganchos de complementos recibieron un `ssr` booleano en el último parámetro de opciones, y varias API esperaban un `ssr` parámetro opcional para asociar correctamente los módulos al entorno correcto (por ejemplo `server.moduleGraph.getModuleByUrl(url, { ssr })` ).

Con el advenimiento de entornos configurables, ahora tenemos una forma uniforme de acceder a sus opciones e instancia en complementos. Los ganchos de complementos ahora exponen `this.environment` en su contexto, y las API que anteriormente esperaban un `ssr` boolean ahora están alcanzados al entorno adecuado (por ejemplo `environment.moduleGraph.getModuleByUrl(url)` ).

El servidor VITE tiene una tubería de complementos compartido, pero cuando se procesa un módulo, siempre se realiza en el contexto de un entorno determinado. La instancia `environment` está disponible en el contexto del complemento.

Un complemento podría usar la instancia `environment` para cambiar la forma en que se procesa un módulo dependiendo de la configuración del entorno (a la que se puede acceder usando `environment.config` ).

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

## Registrando Nuevos Entornos Utilizando Ganchos

Los complementos pueden agregar nuevos entornos en el gancho `config` (por ejemplo, para tener un gráfico de módulo separado para [RSC](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components) ):

```ts
  config(config: UserConfig) {
    config.environments.rsc ??= {}
  }
```

Un objeto vacío es suficiente para registrar el entorno, valores predeterminados de la configuración de entorno de nivel raíz.

## Configuración Del Entorno Utilizando Ganchos

Mientras el gancho `config` se está ejecutando, la lista completa de entornos aún no se conoce y los entornos pueden verse afectados tanto por los valores predeterminados de la configuración de entorno de nivel raíz o explícitamente a través del registro `config.environments` .
Los complementos deben establecer los valores predeterminados usando el gancho `config` . Para configurar cada entorno, pueden usar el nuevo gancho `configEnvironment` . Este gancho se requiere para cada entorno con su configuración parcialmente resuelta, incluida la resolución de los valores predeterminados finales.

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    if (name === 'rsc') {
      options.resolve.conditions = // ...
```

## El gancho `hotUpdate`

- **Tipo:** `(this: {Environment: Devenvironment}, Opciones: HotupdateOptions) => Array<EnvironmentModuleNode> | vacío | Promesa <Array<EnvironmentModuleNode> | Vacío> `
- **Ver también:** [API HMR](./api-hmr)

El Hook `hotUpdate` permite que los complementos realicen el manejo de actualizaciones de HMR personalizados para un entorno determinado. Cuando cambia un archivo, el algoritmo HMR se ejecuta para cada entorno en serie de acuerdo con el pedido en `server.environments` , por lo que el `hotUpdate` gancho se llamará varias veces. El gancho recibe un objeto de contexto con la siguiente firma:

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

- `this.environment` es el entorno de ejecución del módulo donde actualmente se está procesando una actualización de archivo.

- `modules` es una matriz de módulos en este entorno afectado por el archivo cambiado. Es una matriz porque un solo archivo puede mapear a múltiples módulos servidos (por ejemplo, Vue SFCS).

- `read` es una función de lectura Async que devuelve el contenido del archivo. Esto se proporciona porque, en algunos sistemas, la devolución de llamada de cambio de archivo puede disparar demasiado rápido antes de que el editor termine de actualizar el archivo, y Direct `fs.readFile` devolverá contenido vacío. La función de lectura pasada en normaliza este comportamiento.

El gancho puede elegir:

- Filtre y reduzca la lista de módulos afectados para que el HMR sea más preciso.

- Devuelve una matriz vacía y realiza una recarga completa:

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

    // Invalidar módulos manualmente
    const invalidatedModules = new Set()
    for (const mod of modules) {
      this.environment.moduleGraph.invalidateModule(
        mod,
        invalidatedModules,
        timestamp,
        true
      )
    }
    this.environment.hot.send({ type: 'full-reload' })
    return []
  }
  ```

- Devuelva una matriz vacía y realice un manejo de HMR personalizado completo enviando eventos personalizados al cliente:

  ```js
  hotUpdate() {
    if (this.environment.name !== 'client')
      return

    this.environment.hot.send({
      type: 'custom',
      event: 'special-update',
      data: {}
    })
    return []
  }
  ```

  El código del cliente debe registrar el controlador correspondiente utilizando la [API HMR](./api-hmr) (esto podría ser inyectado por el mismo gancho `transform` del complemento):

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // Realizar actualizaciones personalizadas
    })
  }
  ```

## Complementos Por Envío

Un complemento puede definir cuáles son los entornos a los que debe aplicarse con la función `applyToEnvironment` .

```js
const UnoCssPlugin = () => {
  // Estado global compartido
  return {
    buildStart() {
      // Init por estado por el medio ambiente con mapas débiles <entorno, datos>
      // Usando esto.
    },
    configureServer() {
      // Use ganchos globales normalmente
    },
    applyToEnvironment(environment) {
      // devolver verdadero si este complemento debe estar activo en este entorno,
      // O devuelve un nuevo complemento para reemplazarlo.
      // Si el gancho no se usa, el complemento está activo en todos los entornos
    },
    resolveId(id, importer) {
      // Solo se pidió entornos a este complemento a los que se aplica
    },
  }
}
```

Si un complemento no es consciente del entorno y tiene un estado que no está conectado al entorno actual, el gancho `applyToEnvironment` permite hacerlo fácilmente por envidia.

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

Vite exporta un ayudante `perEnvironmentPlugin` para simplificar estos casos en los que no se requieren otros ganchos:

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

## Medio Ambiente en Ganchos De Construcción

De la misma manera que durante el desarrollo, los ganchos de complementos también reciben la instancia del entorno durante la compilación, reemplazando el `ssr` booleano.
Esto también funciona para `renderChunk` , `generateBundle` y otros ganchos de construcción.

## Complementos Compartidos Durante La Compilación

Antes de Vite 6, las tuberías de los complementos funcionaron de manera diferente durante el desarrollo y la construcción:

- **Durante el desarrollo:** los complementos se comparten
- **Durante la compilación:** los complementos están aislados para cada entorno (en diferentes procesos: `vite build` y luego `vite build --ssr` ).

Esto obligó a los marcos a compartir el estado entre la compilación `client` y la compilación `ssr` a través de archivos de manifiesto escritos en el sistema de archivos. En Vite 6, ahora estamos construyendo todos los entornos en un solo proceso, por lo que la forma en que la tubería de los complementos y la comunicación entre ambientes pueden alinearse con Dev.

En una futura especialización (Vite 7 u 8), nuestro objetivo es tener una alineación completa:

- **Durante el desarrollo y la compilación:** los complementos se comparten, con [filtrado por envío](#per-environment-plugins)

También habrá una sola instancia `ResolvedConfig` compartida durante la compilación, lo que permite almacenar en caché en todo el nivel de proceso de compilación de la aplicación de la misma manera que lo hemos estado haciendo con `WeakMap<ResolvedConfig, CachedData>` durante el desarrollo.

Para VITE 6, necesitamos hacer un paso más pequeño para mantener la compatibilidad hacia atrás. Los complementos del ecosistema están utilizando actualmente `config.build` en lugar de `environment.config.build` para acceder a la configuración, por lo que necesitamos crear un nuevo `ResolvedConfig` por envolvimiento de forma predeterminada. Un proyecto puede optar por compartir la configuración completa de la Configuración y los complementos Configuración de tuberías de `builder.sharedConfigBuild` a `true` .

Esta opción solo funcionaría de un pequeño subconjunto de proyectos al principio, por lo que los autores de complementos pueden optar por un complemento en particular que se comparte configurando el indicador `sharedDuringBuild` en `true` . Esto permite compartir fácilmente el estado para complementos regulares:

```js
function myPlugin() {
  // Compartir el estado entre todos los entornos en desarrollo y construcción
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // Optar en una sola instancia para todos los entornos
    sharedDuringBuild: true,
  }
}
```
