# SSR usando `ModuleRunner` API

::: tip Feedback
Dê -nos feedback na [discussão sobre feedback da API ambiente](https://github.com/vitejs/vite/discussions/16358)
:::

`server.ssrLoadModule` foi substituído pela importação de um [corredor do módulo](/pt/guide/api-environment#modulerunner) .

AFETO ACENDE: `Vite Plugin Authors`

::: warning Future Deprecation
`ModuleRunner` foi introduzido pela primeira vez em `v6.0` . A depreciação de `server.ssrLoadModule` está planejada para um futuro major. Para identificar seu uso, defina `future.removeSsrLoadModule` a `"warn"` na sua configuração Vite.
:::

## Motivação

O `server.ssrLoadModule(url)` apenas permite a importação de módulos no ambiente `ssr` e só pode executar os módulos no mesmo processo que o servidor de dev vite. Para aplicativos com ambientes personalizados, cada um está associado a um `ModuleRunner` que pode estar em execução em um encadeamento ou processo separado. Para importar módulos, agora temos `moduleRunner.import(url)` .

## Guia De Migração

Confira a [API do ambiente para o Guia de estruturas](../guide/api-environment-frameworks.md) .
