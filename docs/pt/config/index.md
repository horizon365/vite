---
title: Configurando Vite
---

# Configurando Vite

Ao executar `vite` na linha de comando, o Vite tentará automaticamente resolver um arquivo de configuração chamado `vite.config.js` Inside [Project Root](/pt/guide/#index-html-and-project-root) (outras extensões JS e TS também são suportadas).

O arquivo de configuração mais básico se parece com o seguinte:

```js [vite.config.js]
export default {
  // opções de configuração
}
```

Nota O VITE suporta o uso da sintaxe dos módulos ES no arquivo de configuração, mesmo que o projeto não esteja usando o NODE Native ESM, por exemplo, `type: "module"` em `package.json` . Nesse caso, o arquivo de configuração é pré-processado automático antes da carga.

Você também pode especificar explicitamente um arquivo de configuração para usar com a opção `--config` CLI (resolvida em relação a `cwd` ):

```bash
vite --config my-config.js
```

::: tip CONFIG LOADING
Por padrão, o Vite usa `esbuild` para agrupar a configuração em um arquivo temporário e carregá -lo. Isso pode causar problemas ao importar arquivos de tipscript em um monorepo. Se você encontrar algum problema com essa abordagem, poderá especificar `--configLoader runner` para usar o [Runner do Módulo](/pt/guide/api-environment-runtimes.html#modulerunner) , que não criará uma configuração temporária e transformará quaisquer arquivos em tempo real. Observe que o Module Runner não suporta CJs nos arquivos de configuração, mas os pacotes CJS externos devem funcionar como de costume.

Como alternativa, se você estiver usando um ambiente que suporta o TypeScript (por exemplo, `node --experimental-strip-types` ), ou se estiver escrevendo apenas JavaScript simples, poderá especificar `--configLoader native` para usar o tempo de execução nativo do ambiente para carregar o arquivo de configuração. Observe que as atualizações dos módulos importadas pelo arquivo de configuração não são detectadas e, portanto, não recomendariam automaticamente o servidor Vite.
:::

## Config Intellisense

Como o Vite é enviado com as tímidas do TypeScript, você pode aproveitar o Intellisense do seu IDE com dicas do tipo JSDoc:

```js
/** @Type {import ('vite'). UserConfig} */
export default {
  // ...
}
```

Como alternativa, você pode usar o auxiliar `defineConfig` que deve fornecer IntelliSense sem a necessidade de anotações JSDOC:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

O Vite também suporta arquivos de configuração do TypeScript. Você pode usar `vite.config.ts` com a função `defineConfig` ajudante acima ou com o operador `satisfies` :

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## Config Condicional

Se a configuração precisar determinar condicionalmente as opções com base no comando ( `serve` ou `build` ), o [modo](/pt/guide/env-and-mode#modes) que está sendo usado, se for uma compilação SSR ( `isSsrBuild` ) ou estiver visualizando a construção ( `isPreview` ), poderá exportar uma função:

```js twoslash
import { defineConfig } from 'vite'
// ---corte---
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // CONFIG específico do dev
    }
  } else {
    // comando === 'Build'
    return {
      // construir configuração específica
    }
  }
})
```

É importante observar que na API de Vite o valor `command` é `serve` durante o Dev (na CLI [`vite`](/pt/guide/cli#vite) , `vite dev` e `vite serve` são aliases) e `build` ao construir para a produção ( [`vite build`](/pt/guide/cli#vite-build) ).

`isSsrBuild` e `isPreview` são sinalizadores opcionais adicionais para diferenciar o tipo de comandos `build` e `serve` , respectivamente. Algumas ferramentas que carregam a configuração Vite podem não suportar esses sinalizadores e passarão `undefined` . Portanto, é recomendável usar comparação explícita com `true` e `false` .

## Config Assíncrono

Se a configuração precisar chamar funções assíncronas, ela poderá exportar uma função assíncrona. E essa função assíncrona também pode ser passada por `defineConfig` para melhorar o apoio do Intellisense:

```js twoslash
import { defineConfig } from 'vite'
// ---corte---
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // Config vite
  }
})
```

## Usando Variáveis De Ambiente Na Configuração

As variáveis ambientais podem ser obtidas de `process.env` como de costume.

Observe que o Vite não carrega `.env` arquivos por padrão, pois os arquivos a serem carregados só podem ser determinados após a avaliação da configuração do Vite, por exemplo, as opções `root` e `envDir` afetam o comportamento de carregamento. No entanto, você pode usar o Helper exportado `loadEnv` para carregar o arquivo `.env` específico, se necessário.

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Carregue o arquivo Env com base em `mode` no diretório de trabalho atual.
  // Defina o terceiro parâmetro como '' para carregar tudo o que é
  // `VITE_` prefixo.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // Config vite
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
