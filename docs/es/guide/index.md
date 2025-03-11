# Empezando

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## Descripción General

Vite (French word for "quick", pronounced `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>, like "veet") is a build tool that aims to provide a faster and leaner development experience for modern web projects. It consists of two major parts:

- Un servidor de desarrollo que proporciona [mejoras de características enriquecidas](./features) sobre [los módulos ES nativos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) , por ejemplo [, reemplazo de módulos Hot Hot extremadamente rápido (HMR)](./features#hot-module-replacement) .

- Un comando de compilación que envuelve su código con [acumulación](https://rollupjs.org) , preconfigurado para obtener activos estáticos altamente optimizados para la producción.

Vite es obstinado y viene con valores predeterminados sensibles de la caja. Lea sobre lo que es posible en la [guía de características](./features) . El soporte para marcos o integración con otras herramientas es posible a través de [complementos](./using-plugins) . La [sección de configuración](../config/) explica cómo adaptar VITE a su proyecto si es necesario.

Vite también es altamente extensible a través de su [API de complemento](./api-plugin) y [la API JavaScript](./api-javascript) con soporte de tipificación completo.

Puede obtener más información sobre la lógica detrás del proyecto en la sección [Why Vite](./why) .

## Soporte Del Navegador

Durante el desarrollo, Vite establece [`esnext` como el objetivo de transformación](https://esbuild.github.io/api/#target) , porque asumimos que se utiliza un navegador moderno y admite todas las últimas funciones de JavaScript y CSS. Esto evita la disminución de la sintaxis, permitiendo que Vite sirva los módulos lo más cerca posible del código fuente original.

Para la construcción de la producción, por defecto, VITE se dirige a los navegadores que admiten JavaScript moderno, como [módulos ES nativos](https://caniuse.com/es6-module) , [importación dinámica de ESM nativa](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [fusión nulosa](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) y [bigint](https://caniuse.com/bigint) . Los navegadores heredados se pueden admitir a través del oficial [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) . Consulte la sección [Building for Production](./build) para obtener más detalles.

## Probar Vite en Línea

Puede probar Vite Online en [Stackblitz](https://vite.new/) . Ejecuta la configuración de compilación basada en VITE directamente en el navegador, por lo que es casi idéntico a la configuración local, pero no requiere instalar nada en su máquina. Puede navegar a `vite.new/{template}` para seleccionar qué marco usar.

Los presets de plantilla compatibles son:

|               Javascript               |              Mecanografiado               |
| :------------------------------------: | :---------------------------------------: |
|  [vainilla](https://vite.new/vanilla)  | [Vanilla-TS](https://vite.new/vanilla-ts) |
|      [vue](https://vite.new/vue)       |     [vue-ts](https://vite.new/vue-ts)     |
|  [reaccionar](https://vite.new/react)  |   [react-ts](https://vite.new/react-ts)   |
| [preaccionar](https://vite.new/preact) |  [PREACT-TS](https://vite.new/preact-ts)  |
|   [encendido](https://vite.new/lit)    |     [LIT-TS](https://vite.new/lit-ts)     |
|   [esbelto](https://vite.new/svelte)   |   [esbelto](https://vite.new/svelte-ts)   |
|    [sólido](https://vite.new/solid)    |   [Solid-TS](https://vite.new/solid-ts)   |
|     [qwik](https://vite.new/qwik)      |    [QWIK-TS](https://vite.new/qwik-ts)    |

## Andamia De Su Primer Proyecto VITE

::: tip Compatibility Note
Vite requiere [Node.js](https://nodejs.org/es/) versión 18+ o 20+. Sin embargo, algunas plantillas requieren que funcione una versión de nodo.js más alta, actualice si su administrador de paquetes advierte al respecto.
:::

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

¡Entonces siga las indicaciones!

También puede especificar directamente el nombre del proyecto y la plantilla que desea utilizar a través de opciones de línea de comandos adicionales. Por ejemplo, para andamiar un proyecto VITE + VUE, ejecute:

::: code-group

```bash [npm]
# NPM 7+, se necesita doble placa adicional:
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

Consulte [Crear vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) para obtener más detalles sobre cada plantilla compatible: `vanilla` , `vanilla-ts` , `vue` , `vue-ts` , `react` , `react-ts` , `react-swc` , `react-swc-ts` , `preact` , `preact-ts` , `lit` , `lit-ts` , `svelte` , `svelte-ts` , `solid` , `solid-ts` , `qwik` , `qwik-ts`

Puede usar `.` para el nombre del proyecto al andamio en el directorio actual.

## Plantillas Comunitarias

Create-Vite es una herramienta para iniciar rápidamente un proyecto desde una plantilla básica para marcos populares. Consulte Awesome Vite para [plantillas mantenidas por la comunidad](https://github.com/vitejs/awesome-vite#templates) que incluyen otras herramientas o apunten a diferentes marcos.

Para una plantilla a `https://github.com/user/project` , puede probarlo en línea usando `https://github.stackblitz.com/user/project` (agregando `.stackblitz` después de `github` a la URL del proyecto).

También puede usar una herramienta como [DEGIT](https://github.com/Rich-Harris/degit) para andamiar su proyecto con una de las plantillas. Suponiendo que el proyecto esté en GitHub y usa `main` como la rama predeterminada, puede crear una copia local usando:

```bash
npx degit user/project#Principal my-project
cd my-project

npm install
npm run dev
```

## Instalación Manual

En su proyecto, puede instalar `vite` CLI usando:

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

Y crear un archivo `index.html` como este:

```html
<p>Hello Vite!</p>
```

Luego ejecute el comando CLI apropiado en su terminal:

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

:::

El `index.html` se servirá en `http://localhost:5173` .

## `index.html` y Root de proyecto

Una cosa que puede haber notado es que en un proyecto VITE, `index.html` es el frente y el centro en lugar de estar escondido dentro de `public` . Esto es intencional: durante el desarrollo, Vite es un servidor, y `index.html` es el punto de entrada a su aplicación.

Vite trata `index.html` como código fuente y parte del gráfico del módulo. Resuelve `<script type="module" src="...">` que hace referencia a su código fuente de JavaScript. Incluso en línea `<script type="module">` y CSS referenciados a través de `<link href>` también disfrutan de características específicas de VITE. Además, las URL dentro de `index.html` se rebajan automáticamente, por lo que no hay necesidad de `%PUBLIC_URL%` marcadores de posición especiales.

Similar a los servidores HTTP estáticos, Vite tiene el concepto de un "directorio raíz" del que se sirven sus archivos. Lo verá referenciado como `<root>` en todo el resto de los documentos. Las URL absolutas en su código fuente se resolverán utilizando la raíz del proyecto como base, por lo que puede escribir código como si esté trabajando con un servidor de archivos estático normal (¡excepto que es mucho más potente!). VITE también es capaz de manejar dependencias que resuelven a ubicaciones de sistemas de archivos fuera de raíz, lo que lo hace utilizable incluso en una configuración basada en Monorepo.

VITE también admite [aplicaciones de varias páginas](./build#multi-page-app) con múltiples `.html` puntos de entrada.

#### Especificando Raíz Alternativa

Ejecutar `vite` inicia el servidor Dev utilizando el directorio de trabajo actual como root. Puede especificar una raíz alternativa con `vite serve some/sub/dir` .
Tenga en cuenta que Vite también resolverá [su archivo de configuración (es decir, `vite.config.js` )](/es/config/#configuring-vite) dentro de la raíz del proyecto, por lo que deberá moverlo si se cambia la raíz.

## Interfaz De Línea De Comando

En un proyecto donde se instala Vite, puede usar el `vite` binario en sus scripts NPM o ejecutarlo directamente con `npx vite` . Aquí están los scripts NPM predeterminados en un proyecto VITE de andamio:

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

Puede especificar opciones de CLI adicionales como `--port` o `--open` . Para una lista completa de opciones de CLI, ejecute `npx vite --help` en su proyecto.

Obtenga más información sobre la [interfaz de línea de comando](./cli.md)

## Usar Comodidades Inéditas

Si no puede esperar a una nueva versión para probar las últimas funciones, puede instalar una confirmación específica de VITE con https://pkg.pr.new:

::: code-group

```bash [npm]
$ npm install -D https://pkg.pr.new/vite@SHA
```

```bash [Yarn]
$ yarn add -D https://pkg.pr.new/vite@SHA
```

```bash [pnpm]
$ pnpm add -D https://pkg.pr.new/vite@SHA
```

```bash [Bun]
$ bun add -D https://pkg.pr.new/vite@SHA
```

:::

Reemplace `SHA` con cualquiera de [los shas comprometidos de Vite](https://github.com/vitejs/vite/commits/main/) . Tenga en cuenta que solo los compromisos en el último mes funcionarán, ya que se purgan las versiones de confirmación más antiguas.

Alternativamente, también puede clonar el [repositorio VITE](https://github.com/vitejs/vite) a su máquina local y luego construirla y vincularla usted mismo (se requiere [PNPM](https://pnpm.io/) ):

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # Use su administrador de paquetes preferido para este paso
```

Luego vaya a su proyecto basado en VITE y ejecute `pnpm link --global vite` (o el Administrador de paquetes que usó para vincular `vite` a nivel mundial). ¡Ahora reinicie el servidor de desarrollo para montar en el borde de sangrado!

::: tip Dependencies using Vite
Para reemplazar la versión VITE utilizada por las dependencias de manera transitiva, debe usar [anulaciones de NPM](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides) o [anulaciones de PNPM](https://pnpm.io/package_json#pnpmoverrides) .
:::

## Comunidad

Si tiene preguntas o necesita ayuda, comuníquese con la comunidad en [Discord](https://chat.vite.dev) y [Discusiones de Github](https://github.com/vitejs/vite/discussions) .
