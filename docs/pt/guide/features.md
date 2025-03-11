# Características

No nível muito básico, o desenvolvimento do uso de vite não é tão diferente de usar um servidor de arquivos estático. No entanto, o Vite fornece muitos aprimoramentos sobre as importações de ESM nativas para suportar vários recursos que normalmente são vistos em configurações baseadas em Bundler.

## NPM Dependência Resolução e pré-embrulho

As importações de ES nativas não suportam importações de módulos nus, como os seguintes:

```js
import { someMethod } from 'my-dep'
```

O exposto acima lançará um erro no navegador. Vite detectará essas importações de módulos nuas em todos os arquivos de origem servidos e executará o seguinte:

1. [Preça-](./dep-pre-bundling) os para melhorar a velocidade de carregamento da página e converter módulos Commonjs / UMD em ESM. A etapa de pré-conclusão é realizada com [o ESBuild](http://esbuild.github.io/) e torna o tempo de início frio de Vite significativamente mais rápido do que qualquer empurrista baseado em JavaScript.

2. Reescreva as importações para URLs válidos como `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd` para que o navegador possa importá -los corretamente.

**Dependências são fortemente em cache**

Vite Caches Solicitações de dependência por meio de cabeçalhos HTTP; portanto, se você deseja editar/depurar localmente uma dependência, siga as etapas [aqui](./dep-pre-bundling#browser-cache) .

## Substituição Do Módulo Quente

O Vite fornece uma [API HMR](./api-hmr) sobre o ESM nativo. As estruturas com recursos de HMR podem aproveitar a API para fornecer atualizações instantâneas e precisas sem recarregar a página ou explodir o estado do aplicativo. O Vite fornece integrações de HMR em primeira parte para [componentes de arquivo único VUE](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) e [reagirá uma atualização rápida](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react) . Também existem integrações oficiais para o Preact via [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite) .

Observe que você não precisa configurá -los manualmente - quando você [cria um aplicativo via `create-vite`](./) , os modelos selecionados já os teriam pré -configurados para você.

## TypeScript

O Vite suporta a importação de `.ts` arquivos para fora da caixa.

### Somente Transpile

Observe que o Vite executa apenas a transpilação em `.ts` arquivos e **não** executa a verificação do tipo. Ele pressupõe que a verificação do tipo seja atendida pelo seu processo de IDE e construção.

A razão pela qual o Vite não executa a verificação do tipo como parte do processo de transformação é porque os dois trabalhos funcionam fundamentalmente de maneira diferente. A transpilação pode funcionar por arquivo e se alinhar perfeitamente com o modelo de compilação sob demanda da Vite. Em comparação, a verificação do tipo requer conhecimento de todo o gráfico do módulo. O tipo de chifre de sapatos verifica o pipeline de transformação da Vite comprometerá inevitavelmente os benefícios de velocidade do Vite.

O trabalho de Vite é colocar seus módulos de origem em um formulário que possa ser executado no navegador o mais rápido possível. Para esse fim, recomendamos separar as verificações de análise estática do pipeline de transformação da Vite. Este princípio se aplica a outras verificações de análise estática, como Eslint.

- Para construções de produção, você pode executar `tsc --noEmit` além do comando de construção da Vite.

- Durante o desenvolvimento, se você precisar de mais do que Dicas de IDE, recomendamos a execução de `tsc --noEmit --watch` em um processo separado ou use [-se-plugin-checker](https://github.com/fi3ework/vite-plugin-checker) se você preferir ter erros de tipo diretamente relatados no navegador.

O Vite usa [o ESBuild](https://github.com/evanw/esbuild) para transpilar o TypeScript em JavaScript, que é cerca de 20 ~ 30x mais rápido que a baunilha `tsc` , e as atualizações de HMR podem refletir no navegador em menos de 50ms.

Use as [importações somente de tipo e a sintaxe de exportação](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) para evitar problemas em potencial, como as importações somente de tipo, sendo incorretamente agrupadas, por exemplo:

```ts
import type { T } from 'only/types'
export type { T }
```

### Opções Do Compilador De Texto Datilografado

Alguns campos de configuração abaixo de `compilerOptions` em `tsconfig.json` requerem atenção especial.

#### `isolatedModules`

- [Documentação do TypeScript](https://www.typescriptlang.org/tsconfig#isolatedModules)

Deve ser definido como `true` .

É porque `esbuild` executa apenas a transpilação sem informações de tipo, ele não suporta certos recursos como const enum e importações implícitas apenas para tipos.

Você deve definir `"isolatedModules": true` no seu `tsconfig.json` abaixo de `compilerOptions` , para que o TS o avise contra os recursos que não funcionam com transpilação isolada.

Se uma dependência não funcionar bem com `"isolatedModules": true` . Você pode usar `"skipLibCheck": true` para suprimir temporariamente os erros até que ele seja corrigido a montante.

#### `useDefineForClassFields`

- [Documentação do TypeScript](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

O valor padrão será `true` se o TypeScript Target for `ES2022` ou mais recente, incluindo `ESNext` . É consistente com o [comportamento do TypeScript 4.3.2+](https://github.com/microsoft/TypeScript/pull/42663) .
Outros alvos do TypeScript serão inadimplentes para `false` .

`true` é o comportamento padrão do tempo de execução do ECMAScript.

Se você estiver usando uma biblioteca que depende fortemente de campos de classe, tenha cuidado com o uso pretendido da biblioteca.
Enquanto a maioria das bibliotecas espera `"useDefineForClassFields": true` , você pode definir explicitamente `useDefineForClassFields` a `false` se sua biblioteca não o suportar.

#### `target`

- [Documentação do TypeScript](https://www.typescriptlang.org/tsconfig#target)

Vite ignora o valor `target` no `tsconfig.json` , seguindo o mesmo comportamento que `esbuild` .

Para especificar o destino no dev, a opção [`esbuild.target`](/pt/config/shared-options.html#esbuild) pode ser usada, que padrão é `esnext` para transpilação mínima. Em construções, a opção [`build.target`](/pt/config/build-options.html#build-target) tem prioridade mais alta acima de `esbuild.target` e também pode ser definida, se necessário.

::: warning `useDefineForClassFields`

Se `target` em `tsconfig.json` não for `ESNext` ou `ES2022` ou mais recente, ou se não houver arquivo `tsconfig.json` , `useDefineForClassFields` será o padrão de `false` , o que pode ser problemático com o valor padrão `esbuild.target` de `esnext` . Ele pode transpilar [blocos de inicialização estática](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks#browser_compatibility) que podem não ser suportados no seu navegador.

Como tal, é recomendável definir `target` a `ESNext` ou `ES2022` ou mais recente, ou definir `useDefineForClassFields` a `true` explicitamente ao configurar `tsconfig.json` .
:::

#### Outras Opções Do Compilador Que Afetam O Resultado Da Construção

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)
- [`alwaysStrict`](https://www.typescriptlang.org/tsconfig#alwaysStrict)

::: tip `skipLibCheck`
Os modelos de partida do Vite têm `"skipLibCheck": "true"` por padrão para evitar dependências de escala de digitação, pois podem optar por suportar apenas versões e configurações específicas do TypeScript. Você pode aprender mais no [VUEJS/VUE-CLI#5688](https://github.com/vuejs/vue-cli/pull/5688) .
:::

### Tipos De Clientes

Os tipos padrão da Vite são para sua API Node.js. Para calçar o ambiente do código do lado do cliente em um aplicativo Vite, adicione um arquivo de declaração `d.ts` :

```typescript
///<reference types="vite/client">
```

::: details Using `compilerOptions.types`

Como alternativa, você pode adicionar `vite/client` a `compilerOptions.types` dentro de `tsconfig.json` :

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client", "some-other-global-lib"]
  }
}
```

Observe que, se [`compilerOptions.types`](https://www.typescriptlang.org/tsconfig#types) for especificado, apenas esses pacotes serão incluídos no escopo global (em vez de todos os pacotes visíveis "@Types").

:::

`vite/client` fornece os seguintes calços do tipo:

- Importações de ativos (por exemplo, importar um arquivo `.svg` )
- Tipos para as [constantes](./env-and-mode#env-variables) injetadas de vite em `import.meta.env`
- Tipos para a [API HMR](./api-hmr) em `import.meta.hot`

::: tip
Para substituir a digitação padrão, adicione um arquivo de definição de tipo que contém suas tímidas. Em seguida, adicione a referência de tipo antes de `vite/client` .

Por exemplo, para tornar a importação padrão de `*.svg` um componente react:

- `vite-env-override.d.ts` (o arquivo que contém suas tímidas):
  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```
- O arquivo que contém a referência a `vite/client` :
  ```ts
  ///<reference types="./vite-env-override.d.ts">
  ///<reference types="vite/client">
  ```

:::

## HTML

Os arquivos HTML ficam [com a frente e o centro](/pt/guide/#index-html-and-project-root) de um projeto vite, servindo como pontos de entrada para o seu aplicativo, simplificando a criação [de aplicativos de página única e de várias páginas](/pt/guide/build.html#multi-page-app) .

Quaisquer arquivos HTML no seu projeto Root podem ser acessados diretamente pelo seu respectivo caminho de diretório:

- `<root>/index.html` -> `http://localhost:5173/`
- `<root>/about.html` -> `http://localhost:5173/about.html`
- `<root>/blog/index.html` -> `http://localhost:5173/blog/index.html`

Os ativos mencionados por elementos HTML como `<script type="module" src>` e `<link href>` são processados e agrupados como parte do aplicativo. A lista completa de elementos suportados está como abaixo:

- `<audio src>`
- `<embed src>`
- `<img src>` e `<img srcset>`
- `<image src>`
- `<input src>`
- `<link href>` e `<link imagesrcset>`
- `<object data>`
- `<script type="module" src>`
- `<source src>` e `<source srcset>`
- `<track src>`
- `<use href>` e `<use xlink:href>`
- `<video src>` e `<video poster>`
- `<meta content>`
  - Somente se `name` atributo corresponder `msapplication-tileimage` , `msapplication-square70x70logo` , `msapplication-square150x150logo` , `msapplication-wide310x150logo` , `msapplication-square310x310logo` , `msapplication-config` ou `twitter:image`
  - Ou somente se `property` atributo corresponder `og:image` , `og:image:url` , `og:image:secure_url` , `og:audio` , `og:audio:secure_url` , `og:video` ou `og:video:secure_url`

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Para desativar o processamento HTML em certos elementos, você pode adicionar o atributo `vite-ignore` no elemento, que pode ser útil ao fazer referência a ativos externos ou CDN.

## Estruturas

Todas as estruturas modernas mantêm integrações com o Vite. A maioria dos plug -ins -quadro é mantida por cada equipe da estrutura, com exceção dos plugins oficiais do Vue e React Vite que são mantidos na Org Vite:

- Suporte de Vue via [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- Suporte Vue JSX via [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- Suporte de reação via [@vitejs/pluk-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
- Reaja usando suporte SWC via [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

Confira o [guia dos plugins](https://vite.dev/plugins) para obter mais informações.

## JSX

`.jsx` e `.tsx` arquivos também são suportados para fora da caixa. A transpilação JSX também é tratada via [Esbuild](https://esbuild.github.io) .

Sua estrutura de escolha já configurará o JSX proveniente da caixa (por exemplo, os usuários do VUE devem usar o plug-in oficial [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx) , que fornece recursos específicos do VUE 3, incluindo HMR, resolução de componentes globais, diretrizes e slots).

Se estiver usando o JSX com sua própria estrutura, `jsxFactory` e `jsxFragment` personalizados podem ser configurados usando a [opção `esbuild`](/pt/config/shared-options.md#esbuild) . Por exemplo, o plug -in PREACT usaria:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Mais detalhes nos [documentos da Esbuild](https://esbuild.github.io/content-types/#jsx) .

Você pode injetar os ajudantes JSX usando `jsxInject` (que é uma opção exclusiva de vite) para evitar importações manuais:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

A importação de `.css` arquivos injetará seu conteúdo na página por meio de uma tag `<style>` com suporte HMR.

### `@import` Inlining and Rebasing

O Vite é pré-configurado para suportar o CSS `@import` em linha via `postcss-import` . Os aliases de vite também são respeitados pelo CSS `@import` . Além disso, todas as referências do CSS `url()` , mesmo que os arquivos importados estejam em diretórios diferentes, sejam sempre automaticamente replicados para garantir a correção.

`@import` Aliases e URL Rebasing também são suportados para SASS e menos arquivos (consulte [Pré-processadores CSS](#css-pre-processors) ).

### Postcss

Se o projeto contiver configuração PostCSS válida (qualquer formato suportado pelo [POSTCSS-LOAD-CONFIG](https://github.com/postcss/postcss-load-config) , por exemplo, `postcss.config.js` ), ele será aplicado automaticamente a todos os CSs importados.

Observe que a minificação do CSS será executada após o PostCSS e usará a opção [`build.cssTarget`](/pt/config/build-options.md#build-csstarget) .

### Módulos CSS

Qualquer arquivo CSS que termina com `.module.css` é considerado um [arquivo de módulos CSS](https://github.com/css-modules/css-modules) . Importar esse arquivo retornará o objeto do módulo correspondente:

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
// ---corte---
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

O comportamento dos módulos CSS pode ser configurado através da [opção `css.modules`](/pt/config/shared-options.md#css-modules) .

Se `css.modules.localsConvention` estiver configurado para ativar os habitantes de camelcase (por exemplo, `localsConvention: 'camelCaseOnly'` ), você também pode usar as importações nomeadas:

```js twoslash
import 'vite/client'
// ---corte---
// .Apply -cors -> ApplyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### Pré-processadores CSS

Como apenas os navegadores modernos do Vite segmentam, é recomendável usar variáveis nativas CSS com plugins PostCSS que implementam rascunhos do CSSWG (por exemplo, [CSS de Nesting de PostCSS](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting) ) e Author Future-Standards compatível com Standards.

Dito isto, o Vite fornece suporte interno para arquivos `.scss` , `.sass` , `.less` , `.styl` e `.stylus` . Não há necessidade de instalar plugins específicos de vite para eles, mas o próprio pré-processador correspondente deve ser instalado:

```bash
# .Scss e .Sass
npm add -D sass-embedded # ou sass

# .menos
npm add -D less

# .STYL e .STYLUS
npm add -D stylus
```

Se estiver usando componentes de arquivo único VUE, isso também permite automaticamente `<style lang="sass">` et al.

Vite melhora `@import` resolução para SASS e menos para que os aliases de vite também sejam respeitados. Além disso, as referências relativas `url()` dentro de arquivos SASS/menos importados que estão em diretórios diferentes do arquivo raiz também são automaticamente rebocados para garantir a correção.

`@import` Alias e URL Rebasing não são suportados para a caneta devido às suas restrições de API.

Você também pode usar os módulos CSS combinados com pré-processadores, antecendendo `.module` à extensão do arquivo, por exemplo `style.module.scss` .

### Desativando a injeção de CSS na página

A injeção automática do conteúdo de CSS pode ser desligada através do parâmetro `?inline` de consulta. Nesse caso, a sequência CSS processada é retornada como a exportação padrão do módulo como de costume, mas os estilos não são injetados na página.

```js twoslash
import 'vite/client'
// ---corte---
import './foo.css' // será injetado na página
import otherStyles from './bar.css?inline' // não será injetado
```

::: tip NOTE
As importações padrão e nomeadas dos arquivos CSS (por exemplo, `import style from './foo.css'` ) são removidas desde o Vite 5. Use a `?inline` consulta.
:::

### Lightning CSS

A partir do Vite 4.4, há suporte experimental para [o raio CSS](https://lightningcss.dev/) . Você pode optar por ele adicionar [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer) ao seu arquivo de configuração e instalar a dependência opcional [`lightningcss`](https://www.npmjs.com/package/lightningcss) :

```bash
npm add -D lightningcss
```

Se ativado, os arquivos CSS serão processados pelo Lightning CSS em vez de PostCSS. Para configurá -lo, você pode passar as opções CSS Lightning para a opção de configuração [`css.lightningcss`](../config/shared-options.md#css-lightningcss) .

Para configurar os módulos CSS, você usará [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) em vez de [`css.modules`](../config/shared-options.md#css-modules) (que configura a maneira como o PostCSS lida com os módulos CSS).

Por padrão, o Vite usa o ESBuild para minimizar o CSS. O Lightning CSS também pode ser usado como o minificador CSS com [`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify) .

::: tip NOTE
[Os pré-processadores do CSS](#css-pre-processors) não são suportados ao usar CSS Lightning.
:::

## Ativos Estáticos

A importação de um ativo estático retornará o URL público resolvido quando for servido:

```js twoslash
import 'vite/client'
// ---corte---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Consultas especiais podem modificar como os ativos são carregados:

```js twoslash
import 'vite/client'
// ---corte---
// Carregue explicitamente ativos como URL
import assetAsURL from './asset.js?url'
```

```js twoslash
import 'vite/client'
// ---corte---
// Carregar ativos como cordas
import assetAsString from './shader.glsl?raw'
```

```js twoslash
import 'vite/client'
// ---corte---
// Carregar Trabalhadores Da Web
import Worker from './worker.js?worker'
```

```js twoslash
import 'vite/client'
// ---corte---
// Trabalhadores da web inlinados como strings base64 no horário de construção
import InlineWorker from './worker.js?worker&inline'
```

Mais detalhes no [manuseio de ativos estáticos](./assets) .

## JSON

Os arquivos JSON podem ser importados diretamente - as importações nomeadas também são suportadas:

```js twoslash
import 'vite/client'
// ---corte---
// importar todo o objeto
import json from './example.json'
// Importe um campo raiz como exportações nomeadas - ajuda com a troca de árvores!
import { field } from './example.json'
```

## Importação Glob

O Vite suporta a importação de vários módulos do sistema de arquivos por meio da função Special `import.meta.glob` :

```js twoslash
import 'vite/client'
// ---corte---
const modules = import.meta.glob('./dir/*.js')
```

O exposto acima será transformado no seguinte:

```js
// Código produzido por Vite
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

Você pode iterar sobre as teclas do objeto `modules` para acessar os módulos correspondentes:

```js
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

Os arquivos correspondentes são, por padrão, carregados preguiçosos por importação dinâmica e serão divididos em pedaços separados durante a construção. Se você preferir importar todos os módulos diretamente (por exemplo, dependendo dos efeitos colaterais nesses módulos a serem aplicados primeiro), você pode passar como `{ eager: true }` como o segundo argumento:

```js twoslash
import 'vite/client'
// ---corte---
const modules = import.meta.glob('./dir/*.js', { eager: true })
```

O exposto acima será transformado no seguinte:

```js
// Código produzido por Vite
import * as __vite_glob_0_0 from './dir/bar.js'
import * as __vite_glob_0_1 from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

### Múltiplos Padrões

O primeiro argumento pode ser uma variedade de globs, por exemplo

```js twoslash
import 'vite/client'
// ---corte---
const modules = import.meta.glob(['./dir/*.js', './another/*.js'])
```

### Padrões Negativos

Os padrões negativos do glob também são suportados (prefixados com `!` ). Para ignorar alguns arquivos do resultado, você pode adicionar padrões de exclusão do GLOB ao primeiro argumento:

```js twoslash
import 'vite/client'
// ---corte---
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js'])
```

```js
// Código produzido por Vite
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

#### Nomeadas Importações

É possível importar apenas partes dos módulos com as `import` opções.

```ts twoslash
import 'vite/client'
// ---corte---
const modules = import.meta.glob('./dir/*.js', { import: 'setup' })
```

```ts
// Código produzido por Vite
const modules = {
  './dir/bar.js': () => import('./dir/bar.js').then((m) => m.setup),
  './dir/foo.js': () => import('./dir/foo.js').then((m) => m.setup),
}
```

Quando combinado com `eager` , é possível ter o balanço de árvores ativado para esses módulos.

```ts twoslash
import 'vite/client'
// ---corte---
const modules = import.meta.glob('./dir/*.js', {
  import: 'setup',
  eager: true,
})
```

```ts
// Código produzido por Vite:
import { setup as __vite_glob_0_0 } from './dir/bar.js'
import { setup as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

Defina `import` a `default` para importar a exportação padrão.

```ts twoslash
import 'vite/client'
// ---corte---
const modules = import.meta.glob('./dir/*.js', {
  import: 'default',
  eager: true,
})
```

```ts
// Código produzido por Vite:
import { default as __vite_glob_0_0 } from './dir/bar.js'
import { default as __vite_glob_0_1 } from './dir/foo.js'
const modules = {
  './dir/bar.js': __vite_glob_0_0,
  './dir/foo.js': __vite_glob_0_1,
}
```

#### Consultas Personalizadas

Você também pode usar a opção `query` para fornecer consultas às importações, por exemplo, para importar ativos [como uma string](https://vite.dev/guide/assets.html#importing-asset-as-string) ou [como URL](https://vite.dev/guide/assets.html#importing-asset-as-url) :

```ts twoslash
import 'vite/client'
// ---corte---
const moduleStrings = import.meta.glob('./dir/*.svg', {
  query: '?raw',
  import: 'default',
})
const moduleUrls = import.meta.glob('./dir/*.svg', {
  query: '?url',
  import: 'default',
})
```

```ts
// Código produzido por Vite:
const moduleStrings = {
  './dir/bar.svg': () => import('./dir/bar.svg?raw').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?raw').then((m) => m['default']),
}
const moduleUrls = {
  './dir/bar.svg': () => import('./dir/bar.svg?url').then((m) => m['default']),
  './dir/foo.svg': () => import('./dir/foo.svg?url').then((m) => m['default']),
}
```

Você também pode fornecer consultas personalizadas para que outros plugins consumam:

```ts twoslash
import 'vite/client'
// ---corte---
const modules = import.meta.glob('./dir/*.js', {
  query: { foo: 'bar', bar: true },
})
```

### Glob Importar Advertências

Observe que:

- Este é um recurso exclusivo do Vite e não é um padrão da Web ou ES.
- Os padrões do GLOB são tratados como especificadores de importação: eles devem ser relativos (iniciar com `./` ) ou absolutos (iniciar com `/` , resolvido em relação à raiz do projeto) ou um caminho de alias (consulte [`resolve.alias` opção](/pt/config/shared-options.md#resolve-alias) ).
- A correspondência global é feita via [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) .
- Você também deve estar ciente de que todos os argumentos do `import.meta.glob` devem ser **aprovados como literais** . Você não pode usar variáveis ou expressões nelas.

## Importação Dinâmica

Semelhante à [importação global](#glob-import) , o Vite também suporta importação dinâmica com variáveis.

```ts
const module = await import(`./dir/${file}.js`)
```

Observe que as variáveis representam apenas os nomes de arquivos um nível de profundidade. Se `file` for `'foo/bar'` , a importação falharia. Para uso mais avançado, você pode usar o recurso [de importação global](#glob-import) .

## WebAssembly

`.wasm` arquivos pré-compilados podem ser importados com `?init` .
A exportação padrão será uma função de inicialização que retorna uma promessa do [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance) :

```js twoslash
import 'vite/client'
// ---corte---
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

A função init também pode tomar um objeto de importação que é repassado a [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate) como seu segundo argumento:

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
// ---corte---
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

Na construção da produção, `.wasm` arquivos menores que `assetInlineLimit` serão inlinhados como strings base64. Caso contrário, eles serão tratados como um [ativo estático](./assets) e buscados sob demanda.

::: tip NOTE
[A proposta de integração de módulos ES de ES de WebAssembly](https://github.com/WebAssembly/esm-integration) não é suportada no momento.
Use [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) ou outros plugins comunitários para lidar com isso.
:::

### Acessando O Módulo WebAssembly

Se você precisar de acesso ao objeto `Module` , por exemplo, para instanciá -lo várias vezes, use uma [importação explícita de URL](./assets#explicit-url-imports) para resolver o ativo e, em seguida, execute a instanciação:

```js twoslash
import 'vite/client'
// ---corte---
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### Buscando o módulo em node.js

No SSR, o `fetch()` que está acontecendo como parte da `?init` importação pode falhar com `TypeError: Invalid URL` .
Veja o [suporte do problema WASM no SSR](https://github.com/vitejs/vite/issues/8882) .

Aqui está uma alternativa, assumindo que a base do projeto seja o diretório atual:

```js twoslash
import 'vite/client'
// ---corte---
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## Trabalhadores Da Web

### Importação com construtores

Um script do trabalhador da web pode ser importado usando [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) e [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker) . Comparado aos sufixos dos trabalhadores, essa sintaxe se aproxima dos padrões e é a maneira **recomendada** de criar trabalhadores.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

O construtor de trabalhadores também aceita opções, que podem ser usadas para criar trabalhadores de "módulo":

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

A detecção do trabalhador só funcionará se o construtor `new URL()` for usado diretamente dentro da declaração `new Worker()` . Além disso, todos os parâmetros de opções devem ser valores estáticos (ou seja, literais de string).

### Importar Com Sufixos De Consulta

Um script do trabalhador da web pode ser importado diretamente anexando `?worker` ou `?sharedworker` à solicitação de importação. A exportação padrão será um construtor de trabalhador personalizado:

```js twoslash
import 'vite/client'
// ---corte---
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

O script do trabalhador também pode usar as instruções ESM `import` em vez de `importScripts()` . **NOTA** : Durante o desenvolvimento, isso se baseia no [suporte nativo do navegador](https://caniuse.com/?search=module%20worker) , mas para a construção da produção é compilada.

Por padrão, o script do trabalhador será emitido como um pedaço separado na construção da produção. Se você deseja incluir o trabalhador como strings base64, adicione a consulta `inline` :

```js twoslash
import 'vite/client'
// ---corte---
import MyWorker from './worker?worker&inline'
```

Se você deseja recuperar o trabalhador como URL, adicione a consulta `url` :

```js twoslash
import 'vite/client'
// ---corte---
import MyWorker from './worker?worker&url'
```

Consulte [as opções do trabalhador](/pt/config/worker-options.md) para obter detalhes sobre como configurar o agrupamento de todos os trabalhadores.

## Política De Segurança De Conteúdo (Csp)

Para implantar CSP, certas diretrizes ou configurações devem ser definidas devido aos internos da Vite.

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

Quando [`html.cspNonce`](/pt/config/shared-options#html-cspnonce) é definido, o Vite adiciona um atributo nonce com o valor especificado a qualquer tag `<script>` e `<style>` , além de `<link>` tags para folhas de estilo e pré -carregamento do módulo. Além disso, quando essa opção estiver definida, o Vite injetará uma meta -tag ( `<meta property="csp-nonce" nonce="PLACEHOLDER" />` ).

O valor nonce de uma meta tag com `property="csp-nonce"` será usado pelo Vite sempre que necessário durante o dev e após a construção.

:::warning
Certifique -se de substituir o espaço reservado por um valor exclusivo para cada solicitação. Isso é importante para evitar a política de um recurso, que de outra forma pode ser facilmente feita.
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

Por padrão, durante a compilação, vite os pequenos ativos como URIs de dados. Permitir `data:` para diretrizes relacionadas (por exemplo, [`img-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src) , [`font-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src) ), ou, desativá -lo por configuração [`build.assetsInlineLimit: 0`](/pt/config/build-options#build-assetsinlinelimit) é necessário.

:::warning
Não permita `data:` para [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) . Isso permitirá a injeção de scripts arbitrários.
:::

## Construir Otimizações

> Os recursos listados abaixo são aplicados automaticamente como parte do processo de compilação e não há necessidade de configuração explícita, a menos que você queira desativá -los.

### Divisão do código CSS

O Vite extrai automaticamente o CSS usado pelos módulos em um pedaço assíncrono e gera um arquivo separado para ele. O arquivo CSS é carregado automaticamente por meio de uma tag `<link>` quando o chunk assíncrono associado é carregado e o chunk assíncrono é garantido apenas para ser avaliado após o carregamento do CSS para evitar [o FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.) .

Se você preferir ter todo o CSS extraído em um único arquivo, você pode desativar a divisão de código CSS definindo [`build.cssCodeSplit`](/pt/config/build-options.md#build-csscodesplit) a `false` .

### Geração De Diretivas De Pré -Carga

O VITE gera automaticamente `<link rel="modulepreload">` diretrizes para pedaços de entrada e suas importações diretas no HTML construído.

### Otimização De Carregamento De Pedaços Assíncronos

Em aplicativos do mundo real, o Rollup geralmente gera pedaços "comuns" - o código compartilhado entre dois ou mais outros pedaços. Combinado com importações dinâmicas, é bastante comum ter o seguinte cenário:

<script setup>
import graphSvg from '../../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />

Nos cenários não otimizados, quando o chunk assíncrono `A` for importado, o navegador terá que solicitar e analisar `A` antes de descobrir que também precisa do pedaço comum `C` . Isso resulta em uma tira de redondão extra de rede:

```
Entry ---> A ---> C
```

O Vite reescreve automaticamente as chamadas de importação dinâmica de divisão de código com uma etapa de pré-carga para que, quando `A` for solicitado, `C` seja buscado **em paralelo** :

```
Entry ---> (A + C)
```

É possível que `C` tenha mais importações, o que resultará em ainda mais itens redondos no cenário não otimizado. A otimização da Vite rastreará todas as importações diretas para eliminar completamente as itens redondas, independentemente da profundidade de importação.
