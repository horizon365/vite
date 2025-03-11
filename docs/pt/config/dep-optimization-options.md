# Opções De Otimização Do DEP

- **RELACIONADO:** [PRÉ-BINCA DE DEPENDÊNCIA](/pt/guide/dep-pre-bundling)

A menos que seja indicado, as opções nesta seção são aplicadas apenas ao otimizador de dependência, que é usado apenas no dev.

## optimizeDeps.entries

- **Tipo:** `string | String [] `

Por padrão, o VITE rasteja todos os seus `.html` arquivos para detectar dependências que precisam ser pré-encantadas (ignorando `node_modules` , `build.outDir` , `__tests__` e `coverage` ). Se `build.rollupOptions.input` for especificado, o Vite rastreará esses pontos de entrada.

Se nenhum deles atender às suas necessidades, você poderá especificar entradas personalizadas usando esta opção - o valor deve ser um [padrão `tinyglobby`](https://github.com/SuperchupuDev/tinyglobby) ou matriz de padrões que sejam relativos da raiz do projeto Vite. Isso substituirá a inferência de entradas padrão. Apenas `node_modules` e `build.outDir` pastas serão ignoradas por padrão quando `optimizeDeps.entries` forem explicitamente definidas. Se outras pastas precisarem ser ignoradas, você poderá usar um padrão de ignorar como parte da lista de entradas, marcada com um `!` inicial. Se você não deseja ignorar `node_modules` e `build.outDir` , pode especificar o uso de caminhos de cordas literais (sem `tinyglobby` padrões).

## optimizeDeps.exclude

- **Tipo:** `string[]`

Dependências a serem excluídas do pré-buraco.

:::warning CommonJS
As dependências do CommonJS não devem ser excluídas da otimização. Se uma dependência de ESM for excluída da otimização, mas possui uma dependência do CommonJS aninhada, a dependência do CommonJS deve ser adicionada a `optimizeDeps.include` . Exemplo:

```js twoslash
import { defineConfig } from 'vite'
// ---corte---
export default defineConfig({
  optimizeDeps: {
    include: ['esm-dep > cjs-dep'],
  },
})
```

:::

## optimizeDeps.include

- **Tipo:** `string[]`

Por padrão, os pacotes vinculados que não estão dentro `node_modules` não estão pré-conceituados. Use esta opção para forçar um pacote vinculado a ser pré-conceituado.

**Experimental:** se você estiver usando uma biblioteca com muitas importações profundas, também poderá especificar um padrão global à direita para preencher todas as importações profundas de uma só vez. Isso evitará constantemente pré-concepção sempre que uma nova importação profunda for usada. [Dê feedback](https://github.com/vitejs/vite/discussions/15833) . Por exemplo:

```js twoslash
import { defineConfig } from 'vite'
// ---corte---
export default defineConfig({
  optimizeDeps: {
    include: ['my-lib/components/**/*.vue'],
  },
})
```

## optimizeDeps.esbuildOptions

- **Tipo:** [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys) `<` [`EsbuildBuildOptions`](https://esbuild.github.io/api/#general-options) `,
| 'pacote'
| 'Ponto de entrada'
| 'externo'
| 'escrever'
| 'assistir'
| 'Outlir'
| 'Outfile'
| 'outbase'
| 'Outxtension'
| 'Metafile'> `

Opções para passar para o ESBuild durante a varredura e otimização de DEP.

Certas opções são omitidas, pois alterá -las não seriam compatíveis com a otimização do DEP da Vite.

- `external` também é omitido, use a opção `optimizeDeps.exclude` de Vite
- `plugins` são mesclados com o plug -in DEP de Vite

## optimizeDeps.force

- **Tipo:** `boolean`

Defina como `true` para forçar a pré-empresa da dependência, ignorando dependências otimizadas em cache anteriormente.

## optimizeDeps.holdUntilCrawlEnd

- **Experimental:** [dê feedback](https://github.com/vitejs/vite/discussions/15834)
- **Tipo:** `boolean`
- **Padrão:** `true`

Quando ativado, ele manterá os primeiros resultados otimizados de DEPS até que todas as importações estáticas estejam rastejadas no início do frio. Isso evita a necessidade de recarga de página inteira quando novas dependências são descobertas e elas acionam a geração de novos pedaços comuns. Se todas as dependências forem encontradas pelo scanner mais as definidas explicitamente em `include` , é melhor desativar essa opção para deixar o navegador processar mais solicitações em paralelo.

## optimizeDeps.disabled

- **Descontinuado**
- **Experimental:** [dê feedback](https://github.com/vitejs/vite/discussions/13839)
- **Tipo:** `booleano | 'construir' | 'Dev' '
- **Padrão:** `'build'`

Esta opção está preterida. A partir do Vite 5.1, foram removidos pré-concessão de dependências durante a construção. A configuração de `optimizeDeps.disabled` a `true` ou `'dev'` desativa o otimizador e configurada para `false` ou `'build'` deixa o otimizador durante o Dev ativado.

Para desativar completamente o otimizador, use `optimizeDeps.noDiscovery: true` para desaprovar a descoberta automática de dependências e deixar `optimizeDeps.include` indefinido ou vazio.

:::warning
Otimizar as dependências durante o tempo de construção foi um recurso **experimental** . Projetos que experimentam essa estratégia também removeram `@rollup/plugin-commonjs` usando `build.commonjsOptions: { include: [] }` . Se você fez isso, um aviso o guiará a reativá-lo a apoiar apenas os pacotes CJS enquanto agregam o agrupamento.
:::

## optimizeDeps.needsInterop

- **Experimental**
- **Tipo:** `string[]`

Força o ESM interop ao importar essas dependências. O Vite é capaz de detectar corretamente quando uma dependência precisa de interop, portanto, essa opção geralmente não é necessária. No entanto, diferentes combinações de dependências podem fazer com que algumas delas sejam pré -prebatidas de maneira diferente. Adicionar esses pacotes a `needsInterop` pode acelerar o início do frio, evitando recarregamentos de página inteira. Você receberá um aviso se esse for o caso de uma de suas dependências, sugerindo adicionar o nome do pacote a essa matriz em sua configuração.
