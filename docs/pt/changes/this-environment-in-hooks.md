# `this.environment` em ganchos

::: tip Feedback
Dê -nos feedback na [discussão sobre feedback da API ambiente](https://github.com/vitejs/vite/discussions/16358)
:::

Antes do Vite 6, apenas dois ambientes estavam disponíveis: `client` e `ssr` . Um único argumento de gancho de `options.ssr` plug -in em `resolveId` , `load` e `transform` permitiu que os autores do plug -in diferenciassem entre esses dois ambientes ao processar módulos nos ganchos de plug -in. No Vite 6, um aplicativo Vite pode definir qualquer número de ambientes nomeados, conforme necessário. Estamos introduzindo `this.environment` no contexto do plug -in para interagir com o ambiente do módulo atual em ganchos.

AFETO ACENDE: `Vite Plugin Authors`

::: warning Future Deprecation
`this.environment` foi introduzido em `v6.0` . A depreciação de `options.ssr` está planejada para `v7.0` . Nesse ponto, começamos a recomendar a migração de seus plugins para usar a nova API. Para identificar seu uso, defina `future.removePluginHookSsrArgument` a `"warn"` em sua configuração vite.
:::

## Motivação

`this.environment` Não apenas permita que a implementação do gancho do plug -in conheça o nome atual do ambiente, mas também fornece acesso às opções de configuração do ambiente, informações do gráfico do módulo e transformar o pipeline ( `environment.config` , `environment.moduleGraph` , `environment.transformRequest()` ). Ter a instância do ambiente disponível no contexto permite que os autores do plug -in evitem a dependência de todo o servidor dev (normalmente armazenado em cache na inicialização através do gancho `configureServer` ).

## Guia De Migração

Para que o plugin existente faça uma migração rápida, substitua o argumento `options.ssr` por `this.environment.name !== 'client'` nos ganchos `resolveId` , `load` e `transform` :

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [! Código -]
      const isSSR = this.environment.name !== 'client' // [! Code ++]

      if (isSSR) {
        // Lógica específica do SSR
      } else {
        // Lógica específica do cliente
      }
    },
  }
}
```

Para uma implementação a longo prazo mais robusta, o gancho do plug-in deve lidar com [vários ambientes](/pt/guide/api-environment.html#accessing-the-current-environment-in-hooks) usando opções de ambiente de granulação fina, em vez de confiar no nome do ambiente.
