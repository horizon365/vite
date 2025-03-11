# Filosofía Del Proyecto

## Núcleo De Lente Extensible

Vite no tiene la intención de cubrir cada caso de uso para cada usuario. Vite tiene como objetivo admitir los patrones más comunes para construir aplicaciones web fuera de la caja, pero [Vite Core](https://github.com/vitejs/vite) debe permanecer delgado con una pequeña superficie API para mantener el proyecto mantenible a largo plazo. Este objetivo es posible gracias al [sistema de complementos basado en Rollup de Vite](./api-plugin.md) . Las características que se pueden implementar como complementos externos generalmente no se agregarán a Vite Core. [Vite-Plugin-PWA](https://vite-pwa-org.netlify.app/) es un gran ejemplo de lo que se puede lograr con Vite Core, y hay muchos [complementos bien mantenidos](https://github.com/vitejs/awesome-vite#plugins) para cubrir sus necesidades. VITE trabaja en estrecha colaboración con el proyecto Rollup para garantizar que los complementos puedan usarse tanto en proyectos de rollup y vite, tratando de impulsar las extensiones necesarias a la API de complemento aguas arriba cuando sea posible.

## Empujando La Web Moderna

Vite proporciona características obstinadas que impulsan la escritura de código moderno. Por ejemplo:

- El código fuente solo se puede escribir en ESM, donde las dependencias que no son de SES deben ser [prevenidas como ESM](./dep-pre-bundling) para trabajar.
- Se alienta a los trabajadores web que se escriban con la [sintaxis `new Worker`](./features#web-workers) para seguir los estándares modernos.
- Los módulos Node.js no se pueden usar en el navegador.

Al agregar nuevas características, estos patrones se siguen para crear una API a prueba de futuro, que puede no ser siempre compatible con otras herramientas de compilación.

## Un enfoque pragmático para el rendimiento

Vite se ha centrado en el rendimiento desde sus [orígenes](./why.md) . Su arquitectura del servidor Dev permite la HMR que se mantiene rápidamente a medida que la escala de proyectos. VITE utiliza herramientas nativas como [ESBuild](https://esbuild.github.io/) y [SWC](https://github.com/vitejs/vite-plugin-react-swc) para implementar tareas intensivas, pero mantiene el resto del código en JS para equilibrar la velocidad con flexibilidad. Cuando sea necesario, los complementos Framework aprovecharán [Babel](https://babeljs.io/) para compilar el código de usuario. Y durante el tiempo de compilación, Vite actualmente utiliza el tamaño de [la](https://rollupjs.org/) agrupación y tener acceso a un amplio ecosistema de complementos son más importantes que la velocidad bruta. Vite continuará evolucionando internamente, utilizando nuevas bibliotecas a medida que parecen mejorar DX mientras mantienen su API estable.

## Marcos de construcción en la cima de Vite

Aunque los usuarios pueden usar Vite directamente, brilla como una herramienta para crear marcos. Vite Core es el marco agnóstico, pero hay complementos pulidos para cada marco de la interfaz de usuario. Su [API JS](./api-javascript.md) permite a los autores de marco de aplicaciones utilizar características VITE para crear experiencias personalizadas para sus usuarios. VITE incluye soporte para [primitivas SSR](./ssr.md) , generalmente presentes en herramientas de nivel superior pero fundamental para construir marcos web modernos. Y los complementos VITE completan la imagen ofreciendo una forma de compartir entre marcos. Vite también es un gran ajuste cuando se combina con [marcos de backend](./backend-integration.md) como [Ruby](https://vite-ruby.netlify.app/) y [Laravel](https://laravel.com/docs/10.x/vite) .

## Un Ecosistema Activo

Vite Evolution es una cooperación entre el marco y los mantenedores de complementos, los usuarios y el equipo VITE. Alentamos la participación activa en el desarrollo central de Vite una vez que un proyecto adopta VITE. Trabajamos en estrecha colaboración con los proyectos principales en el ecosistema para minimizar las regresiones en cada lanzamiento, ayudadas por herramientas como [Vite-Ecosystem-CI](https://github.com/vitejs/vite-ecosystem-ci) . Nos permite ejecutar el CI de los principales proyectos utilizando VITE en PRS seleccionados y nos da un estado claro de cómo reaccionaría el ecosistema a una versión. Nos esforzamos por solucionar regresiones antes de presionar a los usuarios y permitir que los proyectos se actualicen a las próximas versiones tan pronto como sean lanzados. Si está trabajando con Vite, lo invitamos a unirse a [Vite's Discord](https://chat.vite.dev) y participar en el proyecto también.
