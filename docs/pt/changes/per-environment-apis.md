# Mover para APIs por ambiente

::: tip Feedback
Dê -nos feedback na [discussão sobre feedback da API ambiente](https://github.com/vitejs/vite/discussions/16358)
:::

Múltiplas APIs de `ViteDevServer` relacionadas ao gráfico e módulos de módulos As transformações foram movidas para as `DevEnvironment` instâncias.

AFETO ACENDE: `Vite Plugin Authors`

::: warning Future Deprecation
A instância `Environment` foi introduzida pela primeira vez em `v6.0` . A depreciação de `server.moduleGraph` e outros métodos que agora estão em ambientes está planejada para `v7.0` . Ainda não recomendamos me afastar dos métodos do servidor. Para identificar seu uso, defina -os na sua configuração vite.

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## Motivação

No Vite V5 e antes, um único servidor de dev vite sempre tinha dois ambientes ( `client` e `ssr` ). Os `server.moduleGraph` tinham módulos mistos de ambos os ambientes. Os nós foram conectados através de `clientImportedModules` e `ssrImportedModules` listas (mas uma única lista de `importers` foi mantida para cada uma). Um módulo transformado foi representado por um `id` e um `ssr` booleano. Este booleano precisava ser passado para as APIs, por exemplo, `server.moduleGraph.getModuleByUrl(url, ssr)` e `server.transformRequest(url, { ssr })` .

No Vite V6, agora é possível criar qualquer número de ambientes personalizados ( `client` , `ssr` , `edge` , etc). Um único `ssr` booleano não é mais suficiente. Em vez de alterar as APIs para o Formulário `server.transformRequest(url, { environment })` , movemos esses métodos para a instância do ambiente, permitindo que eles sejam chamados sem um servidor de dev vite.

## Guia De Migração

- `server.moduleGraph` -> [`environment.moduleGraph`](/pt/guide/api-environment#separate-module-graphs)
- `server.transformRequest(url, ssr)` -> `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` -> `environment.warmupRequest(url)`
