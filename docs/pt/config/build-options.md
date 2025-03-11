# Build Options

Unless noted, the options in this section are only applied to build.

## build.target

- **Tipo:** `string | String [] `
- **Padrão:** `'modules'`
-

Alvo de compatibilidade do navegador para o pacote final. O valor padrão é um valor especial do Vite, `'modules'` , que tem como alvo navegadores com [módulos ES nativos](https://caniuse.com/es6-module) , [importação dinâmica do ESM nativo](https://caniuse.com/es6-module-dynamic-import) e [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) suporte. Vite substituirá `'modules'` a `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`

Outro valor especial é `'esnext'` - que assume o suporte de importações dinâmicas nativas e executará apenas transpilagem mínima.

A transformação é realizada com o ESBuild e o valor deve ser uma [opção de destino esbuild](https://esbuild.github.io/api/#target) válida. Os alvos personalizados podem ser uma versão ES (por exemplo, `es2015` ), um navegador com versão (por exemplo, `chrome58` ) ou uma matriz de várias seqüências de destino.

Nota A construção falhará se o código contiver recursos que não podem ser transpilados com segurança pelo ESBuild. Consulte [a Esbuild Docs](https://esbuild.github.io/content-types/#javascript) para obter mais detalhes.

## build.modulePreload

- **Tipo:** `booleano | {Polyfill?: Boolean, ResolvedEndências?: ResolvemodulePreloadDependênciasfn} `
- **Padrão:** `{ polyfill: true }`

Por padrão, um [polyfil de pré -carga do módulo](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) é injetado automaticamente. O polifill é injetado automaticamente no módulo proxy de cada entrada `index.html` . Se a compilação estiver configurada para usar uma entrada personalizada que não seja HTML via `build.rollupOptions.input` , será necessário importar manualmente o poli-preenchimento em sua entrada personalizada:

```js
import 'vite/modulepreload-polyfill'
```

NOTA: O Polyfill **não** se aplica ao [modo de biblioteca](/pt/guide/build#library-mode) . Se você precisar suportar navegadores sem importação dinâmica nativa, provavelmente deve evitar usá -lo em sua biblioteca.

A lista de pedaços para pré -carregar para cada importação dinâmica é calculada pelo Vite. Por padrão, um caminho absoluto, incluindo o `base` será usado ao carregar essas dependências. Se o `base` for relativo ( `''` ou `'./'` ), `import.meta.url` for usado em tempo de execução para evitar caminhos absolutos que dependem da base final implantada.

Há suporte experimental para controle de granulação fina sobre a lista de dependências e seus caminhos usando a função `resolveDependencies` . [Dê feedback](https://github.com/vitejs/vite/discussions/13841) . Espera uma função do tipo `ResolveModulePreloadDependenciesFn` :

```ts
type ResolveModulePreloadDependenciesFn = (
  url: string,
  deps: string[],
  context: {
    hostId: string
    hostType: 'html' | 'js'
  },
) => string[]
```

A função `resolveDependencies` será chamada para cada importação dinâmica com uma lista dos pedaços depende e também será convocada para cada pedaço importado nos arquivos HTML de entrada. Uma nova matriz de dependências pode ser retornada com essas dependências filtradas ou mais injetadas e seus caminhos modificados. Os `deps` caminhos são relativos aos `build.outDir` . O valor de retorno deve ser um caminho relativo para o `build.outDir` .

```js twoslash
/** @type {import('vite').UserConfig} */
const config = {
  // Ignore mais bonito
  build: {
    // ---cut-before---
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        return deps.filter(condition)
      },
    },
    // ---cut-after---
  },
}
```

Os caminhos de dependência resolvidos podem ser ainda modificados usando [`experimental.renderBuiltUrl`](../guide/build.md#advanced-base-options) .

## build.polyfillModulePreload

- **Tipo:** `boolean`
- **Padrão:** `true`
-

Se deve injetar automaticamente um [módulo de pré -carga polyfil](https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill) .

## build.outDir

- **Tipo:** `string`
- **Padrão:** `dist`

Especifique o diretório de saída (em relação à [raiz do projeto](/pt/guide/#index-html-and-project-root) ).

## build.assetsDir

- **Tipo:** `string`
- **Padrão:** `assets`

Especifique o diretório para o ninho gerado ativos em (em relação a `build.outDir` Isso não é usado no [modo da biblioteca](/pt/guide/build#library-mode) ).

## build.assetsInlineLimit

- **Tipo:** `number` | `((filepath: string, conteúdo: buffer) => booleano | indefinido) `
- **Padrão:** `4096` (4 kib)

Os ativos importados ou referenciados menores que esse limite serão inlinados como URLs BASE64 para evitar solicitações HTTP extras. Defina como `0` para desativar completamente a inline.

If a callback is passed, a boolean can be returned to opt-in or opt-out. If nothing is returned the default logic applies.

Git LFS placeholders are automatically excluded from inlining because they do not contain the content of the file they represent.

::: tip Note
Se você especificar `build.lib` , `build.assetsInlineLimit` será ignorado e os ativos sempre serão inlinados, independentemente do tamanho do arquivo ou de ser um espaço reservado para LFS Git.
:::

## build.cssCodeSplit

- **Tipo:** `boolean`
- **Padrão:** `true`

Enable/disable CSS code splitting. When enabled, CSS imported in async JS chunks will be preserved as chunks and fetched together when the chunk is fetched.

If disabled, all CSS in the entire project will be extracted into a single CSS file.

::: tip Note
Se você especificar `build.lib` , `build.cssCodeSplit` será `false` como padrão.
:::

## build.cssTarget

- **Tipo:** `string | String [] `
- **Padrão:** o mesmo que [`build.target`](#build-target)

This option allows users to set a different browser target for CSS minification from the one used for JavaScript transpilation.

It should only be used when you are targeting a non-mainstream browser.
Um exemplo é o Android WeChat Webview, que suporta a maioria dos recursos modernos do JavaScript, mas não a [`#RGBA` de cores hexadecimais no CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#rgb_colors) .
Nesse caso, você precisa definir `build.cssTarget` a `chrome61` para impedir que o Vite transforme `rgba()` cores em `#RGBA` notações hexadecimais.

## build.cssMinify

- **Tipo:** `booleano | 'Esbuild' | 'Lightningcss'
- **Padrão:** o mesmo que [`build.minify`](#build-minify) para o cliente, `'esbuild'` para SSR

Esta opção permite que os usuários substituam a minificação CSS especificamente, em vez de não formar para `build.minify` , para que você possa configurar a minificação para JS e CSS separadamente. O Vite usa `esbuild` por padrão para minimizar o CSS. Defina a opção como `'lightningcss'` para usar [o Lightning CSS](https://lightningcss.dev/minification.html) . Se selecionado, ele pode ser configurado usando [`css.lightningcss`](./shared-options.md#css-lightningcss) .

## build.sourcemap

- **Tipo:** `booleano | 'em linha' | 'Hidden'
- **Padrão:** `false`

Gerar mapas de fonte de produção. Se `true` , um arquivo sourceMap separado será criado. Se `'inline'` , o SourCemap será anexado ao arquivo de saída resultante como um URI de dados. `'hidden'` funciona como `true` , exceto que os comentários correspondentes do SourCemap nos arquivos agrupados são suprimidos.

## build.rollupOptions

- **Tipo:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

Personalize diretamente o pacote de Rollup subjacente. É o mesmo que as opções que podem ser exportadas a partir de um arquivo de configuração do Rollup e serão mescladas com as opções internas de rollup da Vite. Consulte [os documentos de opções de rollup](https://rollupjs.org/configuration-options/) para obter mais detalhes.

## build.commonjsOptions

- **Tipo:** [`RollupCommonJSOptions`](https://github.com/rollup/plugins/tree/master/packages/commonjs#options)

Opções para passar para [@rollup/plugin-commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) .

## build.dynamicImportVarsOptions

- **Tipo:** [`RollupDynamicImportVarsOptions`](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#options)
- **Relacionado:** [Importação dinâmica](/pt/guide/features#dynamic-import)

Opções para passar para [@rollup/plugin-dinâmico-import-Vars](https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars) .

## build.lib

- **Tipo:** `{Entrada: String | corda[] | {[Entrada: String]: String}, Nome?: String, formatos?: ('Es' | 'CJS' | 'umd' | 'iife') [], nome do arquivo?: string | ((Formato: ModuleFormat, EntryName: String) => String), CSSFilename?: String} `
- **Relacionado:** [Modo da biblioteca](/pt/guide/build#library-mode)

Construir como uma biblioteca. `entry` é necessário, pois a biblioteca não pode usar o HTML como entrada. `name` é a variável global exposta e é necessária quando `formats` inclui `'umd'` ou `'iife'` . O padrão `formats` são `['es', 'umd']` ou `['es', 'cjs']` , se várias entradas forem usadas.

`fileName` é o nome da saída do arquivo de pacote, que padrão é o `"name"` em `package.json` . Ele também pode ser definido como uma função, assumindo os `format` e `entryName` como argumentos e retornando o nome do arquivo.

Se o seu pacote importar CSS, `cssFileName` poderá ser usado para especificar o nome da saída do arquivo CSS. Isso padrão é o mesmo valor que `fileName` se for definido uma string, caso contrário, ele também voltará para o `"name"` em `package.json` .

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: ['src/main.js'],
      fileName: (format, entryName) => `my-lib-${entryName}.${format}.js`,
      cssFileName: 'my-lib-style',
    },
  },
})
```

## build.manifest

- **Tipo:** `booleano | string`
- **Padrão:** `false`
- **Relacionado:** [integração de back -end](/pt/guide/backend-integration)

Se deve gerar um arquivo de manifesto que contém um mapeamento de nomes de arquivos de ativos não abalados em suas versões de hash, que podem ser usadas por uma estrutura de servidor para renderizar os links de ativos corretos.

Quando o valor for uma string, ele será usado como o caminho do arquivo de manifesto em relação a `build.outDir` . Quando definido como `true` , o caminho seria `.vite/manifest.json` .

## build.ssrManifest

- **Tipo:** `booleano | string`
- **Padrão:** `false`
- **Relacionado:** [renderização do lado do servidor](/pt/guide/ssr)

Se deve gerar um arquivo de manifesto SSR para determinar os links de estilo e as diretivas de pré -carga de ativos na produção.

Quando o valor for uma string, ele será usado como o caminho do arquivo de manifesto em relação a `build.outDir` . Quando definido como `true` , o caminho seria `.vite/ssr-manifest.json` .

## build.ssr

- **Tipo:** `booleano | string`
- **Padrão:** `false`
- **Relacionado:** [renderização do lado do servidor](/pt/guide/ssr)

Produzir compilação orientada para SSR. O valor pode ser uma string para especificar diretamente a entrada SSR, ou `true` , que requer a especificação da entrada SSR via `rollupOptions.input` .

## build.emitAssets

- **Tipo:** `boolean`
- **Padrão:** `false`

Durante as construções não-clientes, os ativos estáticos não são emitidos, pois se supõe que seriam emitidos como parte da construção do cliente. Esta opção permite que as estruturas forçam a emitir em outros ambientes construídos. É responsabilidade da estrutura mesclar os ativos com uma etapa de pós -construção.

## build.ssrEmitAssets

- **Tipo:** `boolean`
- **Padrão:** `false`

Durante a compilação SSR, os ativos estáticos não são emitidos, pois se supõe que eles seriam emitidos como parte da construção do cliente. Esta opção permite que as estruturas forçam emiti -las na compilação do cliente e do SSR. É responsabilidade da estrutura mesclar os ativos com uma etapa de pós -construção. Esta opção será substituída por `build.emitAssets` quando a API do ambiente for estável.

## build.minify

- **Tipo:** `booleano | 'Terser' | 'Esbuild'
- **Padrão:** `'esbuild'` para construção do cliente, `false` para compilação SSR

Defina como `false` para desativar a minificação ou especificar o minificador a ser usado. O padrão é [o Esbuild](https://github.com/evanw/esbuild) , que é 20 ~ 40x mais rápido que o TERSER e apenas 1 ~ 2% pior compressão. [Benchmarks](https://github.com/privatenumber/minification-benchmarks)

NOTA A opção `build.minify` não minifica os espaços em branco ao usar o formato `'es'` no modo LIB, pois remove anotações puras e quebra a troca de árvores.

O TERSER deve ser instalado quando estiver definido como `'terser'` .

```sh
npm add -D terser
```

## build.terserOptions

- **Tipo:** `TerserOptions`

[Opções de Minify](https://terser.org/docs/api-reference#minify-options) adicionais para transmitir para Terser.

Além disso, você também pode aprovar uma opção `maxWorkers: number` para especificar o número máximo de trabalhadores para gerar. Padrões para o número de CPUs menos 1.

## build.write

- **Tipo:** `boolean`
- **Padrão:** `true`

Defina como `false` para desativar a gravação do pacote no disco. Isso é usado principalmente em [chamadas programáticas `build()` ,](/pt/guide/api-javascript#build) onde é necessário um pacote posterior do pacote antes de escrever para o disco.

## build.emptyOutDir

- **Tipo:** `boolean`
- **Padrão:** `true` se `outDir` estiver dentro de `root`

Por padrão, o Vite esvaziará o `outDir` na construção se estiver dentro do Project Root. Ele emitirá um aviso se `outDir` estiver fora da raiz para evitar a remoção acidental de arquivos importantes. Você pode definir explicitamente esta opção para suprimir o aviso. Isso também está disponível via linha de comando como `--emptyOutDir` .

## build.copyPublicDir

- **Tipo:** `boolean`
- **Padrão:** `true`

Por padrão, o Vite copiará arquivos do `publicDir` para o `outDir` na compilação. Defina como `false` para desativar isso.

## build.reportCompressedSize

- **Tipo:** `boolean`
- **Padrão:** `true`

Ativar/desativar relatórios de tamanho comprimido com GZIP. A compactação de grandes arquivos de saída pode ser lenta, portanto, desativar isso pode aumentar o desempenho da criação de grandes projetos.

## build.chunkSizeWarningLimit

- **Tipo:** `number`
- **Padrão:** `500`

Limite para avisos de tamanho de pedaço (em KB). É comparado com o tamanho do pedaço não compactado, pois o [tamanho do JavaScript está relacionado ao tempo de execução](https://v8.dev/blog/cost-of-javascript-2019) .

## build.watch

- **Tipo:** [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) `| null`
- **Padrão:** `null`

Defina como `{}` para ativar o Rollup Watcher. Isso é usado principalmente em casos que envolvem plugins ou processos de integrações somente para o edifício.

::: warning Using Vite on Windows Subsystem for Linux (WSL) 2

Existem casos que a observação do sistema de arquivos não funciona com o WSL2.
Veja [`server.watch`](./server-options.md#server-watch) para mais detalhes.

:::
