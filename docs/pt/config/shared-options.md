# Opções Compartilhadas

A menos que seja indicado, as opções nesta seção são aplicadas a todos os desenvolvedores, construir e visualizar.

## raiz

- **Tipo:** `string`
- **Padrão:** `process.cwd()`

Diretório raiz do projeto (onde `index.html` está localizado). Pode ser um caminho absoluto, ou um caminho em relação ao diretório de trabalho atual.

Consulte [o Project Root](/pt/guide/#index-html-and-project-root) para obter mais detalhes.

## base

- **Tipo:** `string`
- **Padrão:** `/`
- **Relacionado:** [`server.origin`](/pt/config/server-options.md#server-origin)

Base Caminho Público quando servido em desenvolvimento ou produção. Os valores válidos incluem:

- Nome do caminho da URL absoluto, por exemplo `/foo/`
- URL completo, por `https://bar.com/foo/` , a parte da origem não será usada no desenvolvimento, portanto o valor é o mesmo que `/foo/` )
- String vazia ou `./` (para implantação incorporada)

Veja [o caminho da base pública](/pt/guide/build#public-base-path) para obter mais detalhes.

## modo

- **Tipo:** `string`
- **Padrão:** `'development'` para servir, `'production'` para construção

Especificar isso no Config substituirá o modo padrão para **servir e construir** . Este valor também pode ser substituído pela opção de linha de comando `--mode` .

Veja [variáveis e modos Env](/pt/guide/env-and-mode) para obter mais detalhes.

## definir

- **Tipo:** `Record<string, any>`

Defina substituições constantes globais. As entradas serão definidas como globais durante o Dev e substituídas estaticamente durante a construção.

O Vite usa [o ESBuild define](https://esbuild.github.io/api/#define) para executar substituições, portanto, as expressões de valor devem ser uma string que contém um valor JSON-Serializable (nulo, booleano, número, string, matriz ou objeto) ou um único identificador. Para valores de não coragem, o Vite o converterá automaticamente em uma string com `JSON.stringify` .

**Exemplo:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip NOTE
Para usuários do TypeScript, adicione as declarações de tipo no arquivo `env.d.ts` ou `vite-env.d.ts` para obter verificações de tipo e IntelliSense.

Exemplo:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## plugins

- **Tipo:** `(plugin | Plugin [] | Promessa <Plugin | Plugin []>) [] `

Matriz de plugins a serem usados. Os plug -ins falsamente são ignorados e as matrizes de plugins são achatadas. Se uma promessa for devolvida, ela seria resolvida antes de executar. Consulte [a API do plug -in](/pt/guide/api-plugin) para obter mais detalhes sobre os plugins de vite.

## publicDir

- **Tipo:** `string | false`
- **Padrão:** `"public"`

Diretório para servir como ativos estáticos simples. Os arquivos neste diretório são servidos em `/` durante o Dev e copiados para a raiz de `outDir` durante a construção, e sempre são servidos ou copiados como são sem transformação. O valor pode ser um caminho absoluto do sistema de arquivos ou um caminho em relação à raiz do projeto.

Definindo `publicDir` como `false` desativa esse recurso.

Consulte [o diretório `public`](/pt/guide/assets#the-public-directory) para obter mais detalhes.

## Cachedir

- **Tipo:** `string`
- **Padrão:** `"node_modules/.vite"`

Diretório para salvar arquivos de cache. Os arquivos neste diretório são deps pré-conceituados ou alguns outros arquivos de cache gerados pelo Vite, o que pode melhorar o desempenho. Você pode usar o sinalizador `--force` ou excluir manualmente o diretório para regenerar os arquivos de cache. O valor pode ser um caminho absoluto do sistema de arquivos ou um caminho em relação à raiz do projeto. Padrão para `.vite` quando nenhum package.json for detectado.

## resolve.alias

- **Tipo:**
  `Record <string, string> | Array <{encontre: string | Regexp, Substituição: String, CustomResolver?: Resolverfunção | Resolverobject}> `

Será passado para `@rollup/plugin-alias` como sua [opção de entradas](https://github.com/rollup/plugins/tree/master/packages/alias#entries) . Pode ser um objeto ou uma matriz de `{ find, replacement, customResolver }` pares.

Ao alias para arquivar caminhos do sistema, sempre use caminhos absolutos. Os valores de alias relativos serão usados como são e não serão resolvidos nos caminhos do sistema de arquivos.

A resolução personalizada mais avançada pode ser alcançada através de [plugins](/pt/guide/api-plugin) .

::: warning Using with SSR
Se você configurou aliases para [dependências externizadas do SSR](/pt/guide/ssr.md#ssr-externals) , convém alias os pacotes `node_modules` reais. Tanto o alias de suporte [de fios](https://classic.yarnpkg.com/pt/docs/cli/add/#toc-yarn-add-alias) quanto [o PNPM](https://pnpm.io/aliases/) através do `npm:` prefixo.
:::

## resolve.dedupe

- **Tipo:** `string[]`

Se você tiver cópias duplicadas da mesma dependência em seu aplicativo (provavelmente devido a pacotes de içar ou vinculados em monorepos), use esta opção para forçar o Vite para sempre resolver dependências listadas na mesma cópia (da raiz do projeto).

:::warning SSR + ESM
Para compilações SSR, a desduplicação não funciona para saídas de compilação ESM configuradas a partir de `build.rollupOptions.output` . Uma solução alternativa é usar saídas de criação do CJS até que o ESM tenha melhor suporte ao plug -in para carregamento do módulo.
:::

## resolve.conditions

- **Tipo:** `string[]`
- **Padrão:** `['módulo', 'navegador', 'desenvolvimento|Produção '] ` (` DefaultClientConditions`)

Condições adicionais permitidas ao resolver [exportações condicionais](https://nodejs.org/api/packages.html#packages_conditional_exports) de um pacote.

Um pacote com exportações condicionais pode ter o seguinte campo `exports` em seu `package.json` :

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

Aqui, `import` e `require` são "condições". As condições podem ser aninhadas e devem ser especificadas da mais específica e menos específica.

`Desenvolvimento|Produção `is a special value that is replaced with`Produção`or`Desenvolvimento`depending on the value of`Process.env.node_env`. It is replaced with `Process`when`Process.env.node_env === 'Produção'`and` Development` Caso contrário.

Observe que as condições `import` , `require` , `default` são sempre aplicadas se os requisitos forem atendidos.

:::warning Resolving subpath exports
As chaves de exportação que terminam com "/" são descontroladas pelo nó e podem não funcionar bem. Entre em contato com o autor do pacote para usar [`*` padrões de subpatina](https://nodejs.org/api/packages.html#package-entry-points) .
:::

## resolve.mainFields

- **Tipo:** `string[]`
- **Padrão:** `['browser', 'module', 'jsnext:main', 'jsnext']` ( `defaultClientMainFields` )

Lista de campos em `package.json` para tentar ao resolver o ponto de entrada de um pacote. Observe que isso leva menor precedência do que as exportações condicionais resolvidas no campo `exports` : se um ponto de entrada for resolvido com sucesso de `exports` , o campo principal será ignorado.

## resolve.extensions

- **Tipo:** `string[]`
- **Padrão:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

Lista de extensões de arquivo para tentar importações que omitam extensões. Observe que **não** é recomendável omitir extensões para tipos de importação personalizados (por exemplo, `.vue` ), pois pode interferir no suporte de IDE e tipo.

## resolve.preserveSymlinks

- **Tipo:** `boolean`
- **Padrão:** `false`

A ativação dessa configuração faz com que o Vite determine a identidade do arquivo pelo caminho original do arquivo (ou seja, o caminho sem seguir os symblinks) em vez do caminho real do arquivo (ou seja, o caminho após seguir os symblinks).

- **Relacionado:** [Esbuild#preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks) , [webpack#resolve.symlinks
  ] ( [https://webpack.js.org/configuration/resolve/#resolvesymlinks](https://webpack.js.org/configuration/resolve/#resolvesymlinks) )

## html.cspNonce

- **Tipo:** `string`
- **Relacionado:** [Política de Segurança de Conteúdo (CSP)](/pt/guide/features#content-security-policy-csp)

Um espaço reservado para valor do NONCE que será usado ao gerar tags de script / estilo. Definir esse valor também gerará uma meta tag com valor nonce.

## css.modules

- **Tipo:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * Padrão: indefinido
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

Configurar o comportamento dos módulos CSS. As opções são transmitidas para [os módulos PostCSS](https://github.com/css-modules/postcss-modules) .

Esta opção não tem nenhum efeito ao usar [o Lightning CSS](../guide/features.md#lightning-css) . Se ativado, [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) deve ser usado.

## css.postcss

- **Tipo:** `string | (postcsss.processOptions & {plugins?: postcss.acceptedplugin []}) `

Config em linha PostCSS ou um diretório personalizado para pesquisar a configuração do PostCSS de (o padrão é o Project Root).

Para configuração postcss inline, espera o mesmo formato que `postcss.config.js` . Mas para `plugins` propriedade, apenas [o formato da matriz](https://github.com/postcss/postcss-load-config/blob/main/README.md#array) pode ser usado.

A pesquisa é feita usando [o Config do PostCSS-ROOW](https://github.com/postcss/postcss-load-config) e apenas os nomes de arquivos de configuração suportados são carregados. Os arquivos de configuração fora do espaço de trabalho raiz (ou a [raiz do projeto](/pt/guide/#index-html-and-project-root) se nenhuma área de trabalho for encontrada) não for pesquisada por padrão. Você pode especificar um caminho personalizado fora da raiz para carregar o arquivo de configuração específico, se necessário.

Nota Se for fornecida uma configuração embutida, o Vite não procurará outras fontes de configuração do PostCSS.

## css.preprocessorOptions

- **Tipo:** `Record<string, object>`

Especifique as opções para passar para os pré-processadores CSS. As extensões de arquivo são usadas como chaves para as opções. As opções suportadas para cada pré -processador podem ser encontradas em sua respectiva documentação:

- `sass` / `scss` :
  - Selecione a API SASS para usar com `API:" Modern-Compiler " | "moderno" | "Legacy" `(default`"Modern-Compiler"`if`Sass embebido em`is installed, otherwise`"Modern"`). For the best performance, it's recommended to use `API: "Modern-Compiler"`with the`Sass embebedado`package. The`"Legacy" API`A API é descontecida e será removida no Vite 7.
  - [Opções (moderno)](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
  - [Opções (legado)](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions) .
- `less` : [Opções](https://lesscss.org/usage/#less-options) .
- `styl` : [`define`](https://stylus-lang.com/docs/js.html#define-name-node) `stylus` suportado, que pode ser passado como um objeto.

**Exemplo:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // ou "moderno", "legado"
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **Tipo:** `string | ((fonte: string, nome do arquivo: string) => (string | {content: string; MAP?: SourceMap})) `

Esta opção pode ser usada para injetar código extra para cada conteúdo de estilo. Observe que, se você incluir estilos reais e não apenas variáveis, esses estilos serão duplicados no pacote final.

**Exemplo:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

## css.preprocessorMaxWorkers

- **Experimental:** [dê feedback](https://github.com/vitejs/vite/discussions/15835)
- **Tipo:** `Número | true`
- **Padrão:** `0` (não cria trabalhadores e é executado no tópico principal)

Se esta opção estiver definida, os pré -processadores do CSS serão executados em trabalhadores quando possível. `true` significa o número de CPUs menos 1.

## css.devSourcemap

- **Experimental:** [dê feedback](https://github.com/vitejs/vite/discussions/13845)
- **Tipo:** `boolean`
- **Padrão:** `false`

Se deve habilitar o SourCemaps durante o Dev.

## css.transformer

- **Experimental:** [dê feedback](https://github.com/vitejs/vite/discussions/13835)
- **Tipo:** `'Postcss' | 'Lightningcss'
- **Padrão:** `'postcss'`

Seleciona o mecanismo usado para o processamento CSS. Confira [CSS Lightning](../guide/features.md#lightning-css) para obter mais informações.

::: info Duplicate `@import`s
Observe que o PostCSS (PostCSS-IMPORT) tem um comportamento diferente com 0 Duplicado `@import` dos navegadores. Consulte [PostCSS/PostCSS-IMPORT#462](https://github.com/postcss/postcss-import/issues/462) .
:::

## css.lightningcss

- **Experimental:** [dê feedback](https://github.com/vitejs/vite/discussions/13835)
- **Tipo:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Configura CSS Lightning. As opções de transformação completas podem ser encontradas no [repo CSS Lightning](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts) .

## json.namedExports

- **Tipo:** `boolean`
- **Padrão:** `true`

Se deve apoiar as importações nomeadas de `.json` arquivos.

## json.stringify

- **Tipo:** `booleano | 'Auto'
- **Padrão:** `'auto'`

Se definido como `true` , o JSON importado será transformado em `export default JSON.parse("...")` o que é significativamente mais performante que os literais de objetos, especialmente quando o arquivo JSON é grande.

Se definido como `'auto'` , os dados serão atingidos apenas se [os dados forem maiores que 10kb](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger) .

## Esbuild

- **Tipo:** `EsbuildOptions | false`

`ESBuildOptions` estende [as próprias opções de transformação da Esbuild](https://esbuild.github.io/api/#transform) . O caso de uso mais comum é personalizar JSX:

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Por padrão, o ESBuild é aplicado a arquivos `ts` , `jsx` e `tsx` . Você pode personalizar isso com `esbuild.include` e `esbuild.exclude` , o que pode ser um regex, um padrão [de picomatch](https://github.com/micromatch/picomatch#globbing-features) ou uma matriz de qualquer um.

Além disso, você também pode usar `esbuild.jsxInject` para injetar automaticamente as importações de auxiliares JSX para cada arquivo transformado pela Esbuild:

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

Quando [`build.minify`](./build-options.md#build-minify) é `true` , todas as otimizações minifas são aplicadas por padrão. Para desativar [certos aspectos](https://esbuild.github.io/api/#minify) , defina qualquer uma das `esbuild.minifyIdentifiers` , `esbuild.minifySyntax` ou `esbuild.minifyWhitespace` opções como `false` . Observe que a opção `esbuild.minify` não pode ser usada para substituir `build.minify` .

Defina como `false` para desativar as transformações ESBuild.

## Assetsinclude

- **Tipo:** `string | Regexp | (corda | Regexp) [] `
- **Relacionado:** [Manipulação de ativos estáticos](/pt/guide/assets)

Especifique [padrões adicionais de picomatch](https://github.com/micromatch/picomatch#globbing-features) a serem tratados como ativos estáticos para que:

- Eles serão excluídos do pipeline de transformação do plug -in quando referenciados do HTML ou solicitados diretamente sobre `fetch` ou XHR.

- Importá -los do JS retornará sua sequência de URL resolvida (isso pode ser substituído se você tiver um plug -in `enforce: 'pre'` para lidar com o tipo de ativo de maneira diferente).

A lista de tipos de ativos embutida pode ser encontrada [aqui](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts) .

**Exemplo:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## Loglevel

- **Tipo:** `'info' | 'avisar' | 'erro' | 'silencioso'

Ajuste a verbosidade da saída do console. O padrão é `'info'` .

## CustomLogger

- **Tipo:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

Use um logger personalizado para registrar mensagens. Você pode usar a API `createLogger` da Vite para obter o logger padrão e personalizá -la, por exemplo, alterar a mensagem ou filtrar certos avisos.

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // Ignorar arquivos CSS vazios Aviso
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## Clearscreen

- **Tipo:** `boolean`
- **Padrão:** `true`

Defina como `false` para impedir que o Vite limpe a tela do terminal ao registrar determinadas mensagens. Via linha de comando, use `--clearScreen false` .

## Envdir

- **Tipo:** `string`
- **Padrão:** `root`

O diretório do qual `.env` arquivos são carregados. Pode ser um caminho absoluto ou um caminho em relação à raiz do projeto.

Veja [aqui](/pt/guide/env-and-mode#env-files) mais sobre os arquivos do ambiente.

## EnvPrefix

- **Tipo:** `string | String [] `
- **Padrão:** `VITE_`

As variáveis Env que começam com `envPrefix` serão expostas ao seu código -fonte do cliente via importação.meta.env.

:::warning SECURITY NOTES
`envPrefix` não deve ser definido como `''` , que exporá todas as suas variáveis ENV e causará vazamento inesperado de informações confidenciais. O Vite lançará um erro ao detectar `''` .

Se você deseja expor uma variável não prefixada, pode usar [o Definy](#define) para expô -lo:

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## AppType

- **Tipo:** `'spa' | 'mpa' | 'Custom'
- **Padrão:** `'spa'`

Se seu aplicativo é um aplicativo de página única (SPA), um [aplicativo de várias páginas (MPA)](../guide/build#multi-page-app) ou aplicativo personalizado (SSR e estruturas com manuseio HTML personalizado):

- `'spa'` : Inclua HTML Middlewares e use o Spa Fallback. Configure [o Sirv](https://github.com/lukeed/sirv) com `single: true` em visualização
- `'mpa'` : Inclua HTML Middlewares
- `'custom'` : Não inclua HTML Middlewares

Saiba mais no [Guia SSR](/pt/guide/ssr#vite-cli) da Vite. Relacionado: [`server.middlewareMode`](./server-options#server-middlewaremode) .

## futuro

- **Tipo:** `registro <string, 'warn' | indefinido> `
- **RELACIONADO:** [Breaking mudanças](/pt/changes/)

Habilite futuras mudanças de quebra para se preparar para uma migração suave para a próxima versão principal do Vite. A lista pode ser atualizada, adicionada ou removida a qualquer momento, à medida que novos recursos são desenvolvidos.

Consulte a página [de alterações de ruptura](/pt/changes/) para obter detalhes das opções possíveis.
