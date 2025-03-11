# Opções de SSR

A menos que seja indicado, as opções nesta seção são aplicadas ao desenvolvimento e à construção.

## ssr.external

- **Tipo:** `string [] | true`
- **Relacionado:** [SSR External](/pt/guide/ssr#ssr-externals)

Externalize as dependências dadas e suas dependências transitivas para SSR. Por padrão, todas as dependências são externalizadas, exceto para dependências vinculadas (para HMR). Se você preferir externalizar a dependência vinculada, pode passar o nome para esta opção.

Se `true` , todas as dependências, incluindo dependências vinculadas, são externalizadas.

Observe que as dependências explicitamente listadas (usando o tipo `string[]` ) sempre terão prioridade se elas também estiverem listadas em `ssr.noExternal` (usando qualquer tipo).

## ssr.noExternal

- **Tipo:** `string | Regexp | (corda | Regexp) [] | true`
- **Relacionado:** [SSR External](/pt/guide/ssr#ssr-externals)

Impedir que as dependências listadas sejam externalizadas para SSR, que elas serão incluídas na construção. Por padrão, apenas dependências vinculadas não são externalizadas (para HMR). Se você preferir externalizar a dependência vinculada, pode passar o nome para a opção `ssr.external` .

Se `true` , nenhuma dependência é externalizada. No entanto, as dependências listadas explicitamente em `ssr.external` (usando `string[]` tipo) podem ter prioridade e ainda são externalizadas. Se `ssr.target: 'node'` estiver definido, o Node.js Build-ins também será externalizado por padrão.

Observe que se `ssr.noExternal: true` e `ssr.external: true` estiverem configurados, `ssr.noExternal` terá prioridade e nenhuma dependência será externalizada.

## ssr.target

- **Tipo:** `'nó' | 'webworker'
- **Padrão:** `node`

Construa o destino para o servidor SSR.

## ssr.resolve.conditions

- **Tipo:** `string[]`
- **Padrão:** `['módulo', 'nó', 'desenvolvimento|Produção '] ` (`DefaultServerConditions`) (`[' Módulo ',' navegador ',' Desenvolvimento|Produção ']` (`DefaultClientConditions`) for ` ssr.target ===' WebWorker ')
- **Relacionado:** [Resolva condições](./shared-options.md#resolve-conditions)

Essas condições são usadas no pipeline do plug-in e afetam apenas dependências não excternizadas durante a construção SSR. Use `ssr.resolve.externalConditions` para afetar as importações externalizadas.

## ssr.resolve.externalConditions

- **Tipo:** `string[]`
- **Padrão:** `['node']`

Condições usadas durante a importação de SSR (incluindo `ssrLoadModule` ) de dependências diretas externas (dependências externas importadas pelo Vite).

:::tip

Ao usar essa opção, execute o nó com [o sinalizador `--conditions`](https://nodejs.org/docs/latest/api/cli.html#-c-condition---conditionscondition) com os mesmos valores no dev e na construção para obter um comportamento consistente.

Por exemplo, ao definir `['node', 'custom']` , você deve executar `NODE_OPTIONS='--conditions custom' vite` em Dev e `NODE_OPTIONS="--conditions custom" node ./dist/server.js` após a construção.

:::

### ssr.resolve.mainFields

- **Tipo:** `string[]`
- **Padrão:** `['module', 'jsnext:main', 'jsnext']`

Lista de campos em `package.json` para tentar ao resolver o ponto de entrada de um pacote. Observe que isso leva menor precedência do que as exportações condicionais resolvidas no campo `exports` : se um ponto de entrada for resolvido com sucesso de `exports` , o campo principal será ignorado. Essa configuração afeta apenas dependências não externizadas.
