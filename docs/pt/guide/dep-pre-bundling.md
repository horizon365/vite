# Dependência Pré-Incentivo

Quando você executa `vite` pela primeira vez, o Vite pré -prebunda as dependências do seu projeto antes de carregar seu site localmente. É feito automaticamente e transparentemente por padrão.

## O Porquê

Este é o Vite executando o que chamamos de "pré-burgo de dependência". Este processo serve a dois propósitos:

1. **Commonjs e UMD Compatibilidade:** Durante o desenvolvimento, o Dev do Vite serve todo o código como ESM nativo. Portanto, o Vite deve converter dependências enviadas como CommonJs ou UMD em ESM primeiro.

   Ao converter dependências do CommonJS, o Vite executa a análise de importação inteligente, para que as importações nomeadas para os módulos CommonJS funcionem conforme o esperado, mesmo que as exportações sejam atribuídas dinamicamente (por exemplo, React):

   ```js
   // funciona como esperado
   import React, { useState } from 'react'
   ```

2. **Desempenho:** o Vite converte as dependências do ESM com muitos módulos internos em um único módulo para melhorar o desempenho subsequente da carga da página.

   Alguns pacotes enviam seus módulos ES, constrói muitos arquivos separados que se importam. Por exemplo, [`lodash-es` possui mais de 600 módulos internos](https://unpkg.com/browse/lodash-es/) ! Quando fazemos `import { debounce } from 'lodash-es'` , o navegador dispara mais de 600 solicitações HTTP ao mesmo tempo! Embora o servidor não tenha problemas para lidar com eles, a grande quantidade de solicitações cria um congestionamento de rede no lado do navegador, fazendo com que a página carregue notavelmente mais lenta.

   Ao pré-controlar `lodash-es` em um único módulo, agora precisamos apenas de uma solicitação HTTP!

::: tip NOTE
A dependência de pré-financiamento se aplica apenas no modo de desenvolvimento e usa `esbuild` para converter dependências no ESM. Nas construções de produção, `@rollup/plugin-commonjs` é usado.
:::

## Descoberta De Dependência Automática

Se um cache existente não for encontrado, o Vite rastreará seu código-fonte e descobrirá automaticamente as importações de dependência (ou seja, "importações nuas" que esperam ser resolvidas a partir de `node_modules` ) e usarem essas importações encontradas como pontos de entrada para o pré-Bundle. O pré-buraco é realizado com `esbuild` , por isso é normalmente muito rápido.

Após o início do servidor, se for encontrada uma nova importação de dependência que ainda não esteja no cache, o Vite reencaminhará o processo de agrupamento de dep e recarregará a página, se necessário.

## Monorepos E Dependências Vinculadas

Em uma configuração Monorepo, uma dependência pode ser um pacote vinculado do mesmo repo. O Vite detecta automaticamente dependências que não são resolvidas de `node_modules` e trata o DEP vinculado como código -fonte. Ele não tentará agrupar o DEP vinculado e analisará a lista de dependência do DEP vinculado.

No entanto, isso exige que o DEP vinculado seja exportado como ESM. Caso contrário, você pode adicionar a dependência a [`optimizeDeps.include`](/pt/config/dep-optimization-options.md#optimizedeps-include) e [`build.commonjsOptions.include`](/pt/config/build-options.md#build-commonjsoptions) na sua configuração.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
// ---corte---
export default defineConfig({
  optimizeDeps: {
    include: ['linked-dep'],
  },
  build: {
    commonjsOptions: {
      include: [/linked-dep/, /node_modules/],
    },
  },
})
```

Ao fazer alterações no DEP vinculado, reinicie o servidor dev com a opção de linha de comando `--force` para que as alterações entrem em vigor.

## Personalizando o comportamento

As heurísticas de descoberta de dependência padrão nem sempre podem ser desejáveis. Nos casos em que você deseja incluir/excluir dependências explicitamente da lista, use as [opções de configuração `optimizeDeps`](/pt/config/dep-optimization-options.md) .

Um caso de uso típico para `optimizeDeps.include` ou `optimizeDeps.exclude` é quando você tem uma importação que não é diretamente descoberta no código -fonte. Por exemplo, talvez a importação seja criada como resultado de uma transformação de plug -in. Isso significa que o Vite não será capaz de descobrir a importação na varredura inicial - ele só pode descobri -lo depois que o arquivo é solicitado pelo navegador e transformado. Isso fará com que o servidor se refira imediatamente após o início do servidor.

`include` e `exclude` podem ser usados para lidar com isso. Se a dependência for grande (com muitos módulos internos) ou for Commonjs, você deve incluí -lo; Se a dependência for pequena e já for válida, você poderá excluí -lo e deixar o navegador carregá -lo diretamente.

Você também pode personalizar o ESBuild com a [opção `optimizeDeps.esbuildOptions`](/pt/config/dep-optimization-options.md#optimizedeps-esbuildoptions) . Por exemplo, adicionar um plug -in esbuild para lidar com arquivos especiais em dependências ou alterar a [construção `target`](https://esbuild.github.io/api/#target) .

## Cache

### Cache Do Sistema De Arquivos

Vite cache as dependências pré-conceituadas em `node_modules/.vite` . Ele determina se precisa re-executar a etapa de pré-conclusão com base em algumas fontes:

- Conteúdo do arquivo de bloqueio do gerenciador de pacotes, por exemplo, `package-lock.json` , `yarn.lock` , `pnpm-lock.yaml` ou `bun.lockb` .
- Patches Horário de modificação da pasta.
- Campos relevantes em seu `vite.config.js` , se presente.
- `NODE_ENV` valor.

A etapa de pré-conclusão só precisará ser executada quando um dos itens acima mudar.

Se, por algum motivo, você deseja forçar o Vite a refazer os deps, você poderá iniciar o servidor dev com a opção de linha de comando `--force` ou excluir manualmente o diretório `node_modules/.vite` cache.

### Cache Do Navegador

As solicitações de dependência resolvidas são fortemente armazenadas em cache com os cabeçalhos HTTP `max-age=31536000,immutable` para melhorar o desempenho da recarga da página durante o Dev. Uma vez em cache, essas solicitações nunca mais atingirão o servidor dev. Eles são invalidados automaticamente pela consulta da versão anexa se uma versão diferente estiver instalada (conforme refletido no arquivo de bloqueio do seu gerenciador de pacotes). Se você deseja depurar suas dependências fazendo edições locais, você pode:

1. Desativar temporariamente o cache através da guia de rede do seu navegador Devtools;
2. Reinicie o servidor de dev vite com o sinalizador `--force` para refazer os departamentos;
3. Recarregue a página.
