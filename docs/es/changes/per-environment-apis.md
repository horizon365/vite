# Mudarse a API por ambiente

::: tip Feedback
Danos comentarios en [la discusión de comentarios de la API ambiental](https://github.com/vitejs/vite/discussions/16358)
:::

Se han movido múltiples API de `ViteDevServer` relacionadas con el gráfico de módulos y las transformaciones de módulos a las `DevEnvironment` instancias.

Afectar el alcance: `Vite Plugin Authors`

::: warning Future Deprecation
La instancia `Environment` se introdujo por primera vez en `v6.0` . La deprecación de `server.moduleGraph` y otros métodos que ahora se encuentran en entornos se planifica para `v7.0` . No recomendamos alejarse de los métodos del servidor todavía. Para identificar su uso, configure estos en su configuración VITE.

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## Motivación

En Vite V5 y antes, un solo servidor de desarrollo VITE siempre tuvo dos entornos ( `client` y `ssr` ). Los `server.moduleGraph` tenían módulos mixtos de ambos entornos. Los nodos se conectaron a través de `clientImportedModules` y `ssrImportedModules` listas (pero se mantuvo una sola lista `importers` para cada una). Un módulo transformado estuvo representado por un booleano `id` y `ssr` . Este booleano debía pasar a las API, por ejemplo `server.moduleGraph.getModuleByUrl(url, ssr)` y `server.transformRequest(url, { ssr })` .

En VITE V6, ahora es posible crear cualquier número de entornos personalizados ( `client` , `ssr` , `edge` , etc.). Un solo `ssr` booleano ya no es suficiente. En lugar de cambiar las API para que sean del Formulario `server.transformRequest(url, { environment })` , movimos estos métodos a la instancia del entorno, lo que permite que se les llame sin un servidor VITE DEV.

## Guía De Migración

- `server.moduleGraph` -> [`environment.moduleGraph`](/es/guide/api-environment#separate-module-graphs)
- `server.transformRequest(url, ssr)` -> `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` -> `environment.warmupRequest(url)`
