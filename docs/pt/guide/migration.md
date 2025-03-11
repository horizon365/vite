# Migração de V5

## API do ambiente

Como parte da nova [API de ambiente](/pt/guide/api-environment.md) experimental, era necessária uma grande refatoração interna. O Vite 6 se esforça para evitar intervalos de mudanças para garantir que a maioria dos projetos possa atualizar rapidamente para o novo major. Vamos esperar até que grande parte do ecossistema se mova para se estabilizar e começar a recomendar o uso das novas APIs. Pode haver alguns casos de borda, mas esses devem afetar apenas o uso de baixo nível por estruturas e ferramentas. Trabalhamos com mantenedores no ecossistema para mitigar essas diferenças antes do lançamento. Por favor, [abra um problema](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml) se você encontrar uma regressão.

Algumas APIs internas foram removidas devido a alterações na implementação do Vite. Se você estava confiando em um deles, crie uma [solicitação de recurso](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml) .

## API de tempo de execução do Vite

A API Experimental Vite Runtime evoluiu para a API do Module Runner, lançada no Vite 6 como parte da nova [API Experimental Environment](/pt/guide/api-environment) . Dado que o recurso foi experimental, a remoção da API anterior introduzida no Vite 5.1 não é uma mudança de quebra, mas os usuários precisarão atualizar seu uso para o equivalente do Runner Module como parte da migração para o Vite 6.

## Mudanças Gerais

### Valor padrão para `resolve.conditions`

Essa alteração não afeta os usuários que não [`ssr.resolve.externalConditions`](/pt/config/ssr-options#ssr-resolve-externalconditions) [`resolve.conditions`](/pt/config/shared-options#resolve-conditions) [`ssr.resolve.conditions`](/pt/config/ssr-options#ssr-resolve-conditions)

No Vite 5, o valor padrão para `resolve.conditions` foi `[]` e algumas condições foram adicionadas internamente. O valor padrão para `ssr.resolve.conditions` foi o valor de `resolve.conditions` .

Do Vite 6, algumas das condições não são mais adicionadas internamente e precisam ser incluídas nos valores de configuração.
As condições que não são mais adicionadas internamente para

- `resolve.conditions` são `['módulo', 'navegador', 'desenvolvimento|Produção '] `
- `ssr.resolve.conditions` são `['módulo', 'nó', 'desenvolvimento|Produção '] `

Os valores padrão para essas opções são atualizados para os valores correspondentes e `ssr.resolve.conditions` não usa mais `resolve.conditions` como o valor padrão. Observe que `desenvolvimento|Produção `is a special variable that is replaced with`Produção`or`Desenvolvimento`depending on the value of`Process.env.node_env`. These default values are exported from `Vite`as`DefaultClientConditions`and` DefaultServerConditions`.

Se você especificou um valor personalizado para `resolve.conditions` ou `ssr.resolve.conditions` , precisará atualizá -lo para incluir as novas condições.
Por exemplo, se você especificou anteriormente `['custom']` para `resolve.conditions` , precisará especificar `['custom', ...defaultClientConditions]` .

### JSON Stringify

No Vite 5, quando [`json.stringify: true`](/pt/config/shared-options#json-stringify) é definido, [`json.namedExports`](/pt/config/shared-options#json-namedexports) foi desativado.

Do Vite 6, mesmo quando `json.stringify: true` é definido, `json.namedExports` não está desativado e o valor é respeitado. Se você deseja alcançar o comportamento anterior, pode definir `json.namedExports: false` .

O Vite 6 também apresenta um novo valor padrão para `json.stringify` , que é `'auto'` , que apenas rigem grandes arquivos JSON. Para desativar esse comportamento, defina `json.stringify: false` .

### Apoio estendido a referências de ativos em elementos HTML

No Vite 5, apenas alguns elementos HTML suportados foram capazes de fazer referência a ativos que serão processados e agrupados por Vite, como `<link href>` , `<img src>` , etc.

O Vite 6 estende o suporte a ainda mais elementos HTML. A lista completa pode ser encontrada no [HTML apresenta](/pt/guide/features.html#html) documentos.

Para desativar o processamento HTML em determinados elementos, você pode adicionar o atributo `vite-ignore` no elemento.

### POSTCSS-LOAD-CONFIG

[`postcss-load-config`](https://npmjs.com/package/postcss-load-config) foi atualizado para V6 a partir de V4. [`tsx`](https://www.npmjs.com/package/tsx) ou [`jiti`](https://www.npmjs.com/package/jiti) agora é necessário para carregar os arquivos de configuração PostCSS do TypeScript em vez de [`ts-node`](https://www.npmjs.com/package/ts-node) . Também [`yaml`](https://www.npmjs.com/package/yaml) agora é obrigado a carregar arquivos de configuração do YAML PostCSS.

### Sass agora usa API moderna por padrão

No Vite 5, a API herdada foi usada por padrão para SASS. Vite 5.4 Adicionado suporte para a API moderna.

Do Vite 6, a API moderna é usada por padrão para SASS. Se você deseja usar a API Legacy, pode [`css.preprocessorOptions.scss.api: 'legacy'` `css.preprocessorOptions.sass.api: 'legacy'`](/pt/config/shared-options#css-preprocessoroptions) . Mas observe que o suporte da API Legacy será removido no Vite 7.

Para migrar para a API moderna, consulte [a documentação SASS](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/) .

### Personalize o nome do arquivo de saída CSS no modo de biblioteca

No Vite 5, o nome do arquivo de saída CSS no modo da biblioteca sempre foi `style.css` e não pode ser facilmente alterado através da configuração Vite.

Do Vite 6, o nome do arquivo padrão agora usa `"name"` em `package.json` semelhante aos arquivos de saída JS. Se [`build.lib.fileName`](/pt/config/build-options.md#build-lib) for definido com uma string, o valor também será usado para o nome do arquivo de saída CSS. Para definir explicitamente um nome de arquivo CSS diferente, você pode usar o novo [`build.lib.cssFileName`](/pt/config/build-options.md#build-lib) para configurá -lo.

Para migrar, se você confiou no nome do arquivo `style.css` , atualize as referências a ele para o novo nome com base no nome do seu pacote. Por exemplo:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

Se você preferir ficar com `style.css` como no Vite 5, poderá definir `build.lib.cssFileName: 'style'` .

## Avançado

Existem outras mudanças de ruptura que afetam apenas poucos usuários.

- [[#17922] FIX (CSS)!: Remova a importação padrão no SSR Dev](https://github.com/vitejs/vite/pull/17922)
  - O suporte para a importação padrão dos arquivos CSS foi [descontinuado no Vite 4](https://v4.vite.dev/guide/migration.html#importing-css-as-a-string) e removido no Vite 5, mas ainda era suportado sem querer no modo SSR Dev. Esse suporte agora é removido.
- [[#15637] CIXT!: Padrão `build.cssMinify` a `'esbuild'` para SSR](https://github.com/vitejs/vite/pull/15637)
  - [`build.cssMinify`](/pt/config/build-options#build-cssminify) agora está ativado por padrão, mesmo para compilações SSR.
- [[#18070] Feat!: Proxy Bypass com WebSocket](https://github.com/vitejs/vite/pull/18070)
  - `server.proxy[path].bypass` agora é chamado para solicitações de atualização do WebSocket e, nesse caso, o parâmetro `res` será `undefined` .
- [[#18209] Refactor!: Bump Minimal Terser versão para 5.16.0](https://github.com/vitejs/vite/pull/18209)
  - A versão TERSER com suporte mínimo para [`build.minify: 'terser'`](/pt/config/build-options#build-minify) foi aumentado para 5.16.0 a partir de 5.4.0.
- [[#18231] Core (DEPS): Atualize dependência @rollup/plugin-commonjs para v28](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires) agora é `true` por padrão (era `'auto'` antes).
    - Isso pode levar a tamanhos maiores de pacote, mas resultará em construções mais determinísticas.
    - Se você estiver especificando um arquivo Commonjs como ponto de entrada, poderá precisar de etapas adicionais. Leia [a documentação do plug -in Commonjs](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#using-commonjs-files-as-entry-points) para obter mais detalhes.
- [[#18243] CORE (DEPS)!: Migrar `fast-glob` a `tinyglobby`](https://github.com/vitejs/vite/pull/18243)
  - Aparelhas ( `{01..03}` ⇒ `['01', '02', '03']` ) e aparelhos incrementais ( `{2..8..2}` ⇒ `['2', '4', '6', '8']` ) não são mais suportados nos globos.
- [[#18395] feat (resolve)!: Permitir remover condições](https://github.com/vitejs/vite/pull/18395)
  - Isso não apenas introduz uma mudança de ruptura mencionada acima como "Valor padrão para `resolve.conditions` ", mas também faz com que `resolve.mainFields` não seja usado para dependências não externizadas no SSR. Se você estava usando `resolve.mainFields` e deseja aplicá-lo a dependências não externizadas no SSR, poderá usar [`ssr.resolve.mainFields`](/pt/config/ssr-options#ssr-resolve-mainfields) .
- [[#18493] Refactor!: Remova a opção Fs.CachedChecks](https://github.com/vitejs/vite/pull/18493)
  - Essa otimização de opção foi removida devido a casos de borda ao gravar um arquivo em uma pasta em cache e importá-la imediatamente.
- ~~[[#18697] FIX (DEPS)!: Atualizar dependência dotenv-expand para v12](https://github.com/vitejs/vite/pull/18697)~~
  - ~~As variáveis usadas na interpolação devem ser declaradas antes da interpolação agora. Para mais detalhes, consulte [o `dotenv-expand` Changelog](https://github.com/motdotla/dotenv-expand/blob/v12.0.1/CHANGELOG.md#1200-2024-11-16) .~~ Essa mudança de quebra foi revertida em v6.1.0.
- [[#16471] Feat: V6 - API do ambiente](https://github.com/vitejs/vite/pull/16471)

  - As atualizações de um módulo somente SSR não desencadeiam mais uma página inteira recarregar no cliente. Para retornar ao comportamento anterior, um plug -in personalizado pode ser usado:
    <details>
    <summary>Clique para expandir o exemplo</summary>

    ```ts twoslash
    import type { Plugin, EnvironmentModuleNode } from 'vite'

    function hmrReload(): Plugin {
      return {
        name: 'hmr-reload',
        enforce: 'post',
        hotUpdate: {
          order: 'post',
          handler({ modules, server, timestamp }) {
            if (this.environment.name !== 'ssr') return

            let hasSsrOnlyModules = false

            const invalidatedModules = new Set<EnvironmentModuleNode>()
            for (const mod of modules) {
              if (mod.id == null) continue
              const clientModule =
                server.environments.client.moduleGraph.getModuleById(mod.id)
              if (clientModule != null) continue

              this.environment.moduleGraph.invalidateModule(
                mod,
                invalidatedModules,
                timestamp,
                true,
              )
              hasSsrOnlyModules = true
            }

            if (hasSsrOnlyModules) {
              server.ws.send({ type: 'full-reload' })
              return []
            }
          },
        },
      }
    }
    ```

    </details>

## Migração de V4

Verifique a [migração do guia V4](https://v5.vite.dev/guide/migration.html) nos documentos Vite V5 primeiro para ver as alterações necessárias para portar seu aplicativo para o Vite 5 e depois prossiga com as alterações nesta página.
