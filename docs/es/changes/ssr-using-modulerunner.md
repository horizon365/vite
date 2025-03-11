# SSR usando `ModuleRunner` API

::: tip Feedback
Danos comentarios en [la discusión de comentarios de la API ambiental](https://github.com/vitejs/vite/discussions/16358)
:::

`server.ssrLoadModule` ha sido reemplazado por importación de un [corredor de módulo](/es/guide/api-environment#modulerunner) .

Afectar el alcance: `Vite Plugin Authors`

::: warning Future Deprecation
`ModuleRunner` se introdujo primero en `v6.0` . La deprecación de `server.ssrLoadModule` está planeada para una futura especialidad. Para identificar su uso, establezca de `future.removeSsrLoadModule` a `"warn"` en su configuración VITE.
:::

## Motivación

El `server.ssrLoadModule(url)` solo permite importar módulos en el entorno `ssr` y solo puede ejecutar los módulos en el mismo proceso que el servidor VITE DEV. Para aplicaciones con entornos personalizados, cada una está asociada con un `ModuleRunner` que puede estar ejecutándose en un hilo o proceso separado. Para importar módulos, ahora tenemos `moduleRunner.import(url)` .

## Guía De Migración

Echa un vistazo a la [Guía API de Medio Ambiente para Frameworks](../guide/api-environment-frameworks.md) .
