# Lanzamientos

Las versiones de VITE siguen a [versiones semánticas](https://semver.org/) . Puede ver la última versión estable de Vite en la [página del paquete VITE NPM](https://www.npmjs.com/package/vite) .

Una línea de cambio completa de versiones pasadas está [disponible en GitHub](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md) .

## Ciclo De Liberación

Vite no tiene un ciclo de liberación fijo.

- Los lanzamientos **de parches** se liberan según sea necesario (generalmente cada semana).
- Las versiones **menores** siempre contienen nuevas funciones y se lanzan según sea necesario. Las versiones menores siempre tienen una fase de prelaseguas beta (generalmente cada dos meses).
- Las lanzamientos **principales** generalmente se alinean con [Node.js EOL Schedule](https://endoflife.date/nodejs) , y se anunciarán con anticipación. Estas lanzamientos pasarán por discusiones a largo plazo con el ecosistema y tendrán fases de prelanzamiento alfa y beta (generalmente cada año).

Los rangos de versiones VITE que son compatibles con el equipo VITE se determinan automáticamente por:

- **Menor actual** obtiene soluciones regulares.
- **El mayor mayor** (solo para su último menor) y **el menor anterior** recibe soluciones importantes y parches de seguridad.
- **La segunda a la mayor especialización** (solo para su último menor) y **el segundo a los menores** recibe parches de seguridad.
- Todas las versiones antes de estas ya no son compatibles.

Como ejemplo, si el último Vite está en 5.3.10:

- Los parches regulares se lanzan para `vite@5.3` .
- Las soluciones importantes y los parches de seguridad se retrasan a `vite@4` y `vite@5.2` .
- Los parches de seguridad también se realizan a `vite@3` y `vite@5.1` .
- `vite@2` y `vite@5.0` ya no son compatibles. Los usuarios deben actualizarse para recibir actualizaciones.

Recomendamos actualizar a Vite regularmente. Consulte las [guías de migración](https://vite.dev/guide/migration.html) cuando actualice a cada mayor. El equipo VITE trabaja en estrecha colaboración con los principales proyectos en el ecosistema para garantizar la calidad de las nuevas versiones. Probamos nuevas versiones VITE antes de liberarlas a través del [proyecto Vite-Ecosystem-CI](https://github.com/vitejs/vite-ecosystem-ci) . La mayoría de los proyectos que usan VITE deberían poder ofrecer rápidamente apoyo o migrar a nuevas versiones tan pronto como sean lanzados.

## Casos De Borde De Versiones Semánticas

### Definiciones Mecanografiadas

Podemos enviar cambios incompatibles a las definiciones mecanografiadas entre versiones menores. Esto es porque:

- A veces, TypeScript mismo envía cambios incompatibles entre versiones menores, y es posible que tengamos que ajustar los tipos para admitir versiones más nuevas de TypeScript.
- Ocasionalmente, es posible que necesitemos adoptar características que solo estén disponibles en una versión más nueva de TypeScript, lo que aumenta la versión mínima requerida de TypeScript.
- Si está utilizando TypeScript, puede usar una gama Semver que bloquea el menor actual y la actualización manual cuando se lanza una nueva versión menor de VITE.

### ESBuild

[ESBuild](https://esbuild.github.io/) está antes de 1.0.0 y, a veces, tiene un cambio de ruptura que necesitamos incluir para tener acceso a características más nuevas y mejoras de rendimiento. Podemos aumentar la versión de ESBuild en un menor Vite.

### Versiones nodo.js no LTS

Las versiones nodo.js no LTS (impares) no se prueban como parte del CI de Vite, pero aún deberían funcionar antes de su [EOL](https://endoflife.date/nodejs) .

## Previos

Las liberaciones menores generalmente pasan por un número no fijo de versiones beta. Los lanzamientos principales pasarán por una fase alfa y una fase beta.

Los prelabastecen permiten a los primeros usuarios y mantenedores del ecosistema realizar pruebas de integración y estabilidad, y proporcionar retroalimentación. No use preleboseos en la producción. Todos los prelabastamientos se consideran inestables y pueden enviar cambios en el medio. Siempre fije a las versiones exactas cuando se usa preleboseos.

## Deprecaciones

Periódicamente desaprobamos las características que han sido reemplazadas por mejores alternativas en lanzamientos menores. Las características desactivadas continuarán funcionando con un tipo o advertencia registrada. Se eliminarán en la próxima liberación principal después de ingresar el estado desapercibido. La [guía de migración](https://vite.dev/guide/migration.html) para cada especialidad enumerará estas eliminaciones y documentará una ruta de actualización para ellos.

## Características Experimentales

Algunas características se marcan como experimentales cuando se lanzan en una versión estable de Vite. Las características experimentales nos permiten reunir experiencia en el mundo real para influir en su diseño final. El objetivo es permitir que los usuarios proporcionen comentarios probándolos en producción. Las características experimentales en sí mismas se consideran inestables, y solo deben usarse de manera controlada. Estas características pueden cambiar entre menores, por lo que los usuarios deben fijar su versión vite cuando confíen en ellas. Crearemos [una discusión de GitHub](https://github.com/vitejs/vite/discussions/categories/feedback?discussions_q=is%3Aopen+label%3Aexperimental+category%3AFeedback) para cada característica experimental.
