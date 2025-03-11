# API do ambiente

:::warning Experimental
A API do ambiente é experimental. Manteremos as APIs estáveis durante o Vite 6 para permitir que o ecossistema experimente e construa sobre ele. Planejamos estabilizar essas novas APIs com possíveis mudanças de quebra no Vite 7.

Recursos:

- [Discussão sobre feedback](https://github.com/vitejs/vite/discussions/16358) onde estamos recebendo feedback sobre as novas APIs.
- [API PR do ambiente](https://github.com/vitejs/vite/pull/16471) , onde a nova API foi implementada e revisada.

Compartilhe seu feedback conosco.
:::

## Ambientes Formalizando

Vite 6 formaliza o conceito de ambientes. Até o Vite 5, havia dois ambientes implícitos ( `client` e opcionalmente `ssr` ). A nova API do ambiente permite que os usuários e os autores da estrutura criem quantos ambientes necessários para mapear a maneira como seus aplicativos funcionam na produção. Esse novo recurso exigiu uma grande refatoração interna, mas muito esforço foi colocado na compatibilidade com versões anteriores. O objetivo inicial do Vite 6 é mover o ecossistema para o novo major da maneira mais tranquila possível, atrasando a adoção dessas novas APIs experimentais até que usuários suficientes migrassem e estruturas e os autores de plug -in validaram o novo design.

## Fechando a Lacuna Entre Build E Dev

Para um spa/MPA simples, nenhuma nova APIs em torno dos ambientes é exposta à configuração. Internamente, o Vite aplicará as opções a um ambiente `client` , mas não é necessário saber desse conceito ao configurar o Vite. A configuração e o comportamento do Vite 5 devem funcionar perfeitamente aqui.

Quando passamos para um aplicativo típico do lado do servidor (SSR), teremos dois ambientes:

- `client` : executa o aplicativo no navegador.
- `server` : Executa o aplicativo no nó (ou outros horários de execução do servidor), que renderiza as páginas antes de enviá -las para o navegador.

No Dev, o Vite executa o código do servidor no mesmo processo de nó que o servidor vite dev, dando uma aproximação estreita ao ambiente de produção. No entanto, também é possível que os servidores sejam executados em outros tempos de execução do JS, como [o Workerd da CloudFlare,](https://github.com/cloudflare/workerd) que possuem restrições diferentes. Os aplicativos modernos também podem ser executados em mais de dois ambientes, por exemplo, um navegador, um servidor de nó e um servidor Edge. O Vite 5 não permitiu representar adequadamente esses ambientes.

O Vite 6 permite que os usuários configurem seu aplicativo durante o Build and Dev para mapear todos os seus ambientes. Durante o Dev, um único servidor de dev vite agora pode ser usado para executar o código em vários ambientes diferentes simultaneamente. O código -fonte do aplicativo ainda é transformado pelo servidor Vite Dev. No topo do servidor HTTP compartilhado, Middlewares, Resolved Config e Plugins Pipeline, o Vite Dev Server agora possui um conjunto de ambientes dev independentes. Cada um deles é configurado para corresponder ao ambiente de produção o mais próximo possível e está conectado a um tempo de execução do desenvolvedor em que o código é executado (para o Workerd, o código do servidor agora pode ser executado no miniflare localmente). No cliente, o navegador importa e executa o código. Em outros ambientes, um corredor do módulo busca e avalia o código transformado.

![Ambientes Vite](../../images/vite-environments.svg)

## Configuração De Ambientes

Para um spa/MPA, a configuração será semelhante ao Vite 5. Internamente, essas opções são usadas para configurar o ambiente `client` .

```js
export default defineConfig({
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
})
```

Isso é importante porque gostaríamos de manter o Vite acessível e evitar expor novos conceitos até que sejam necessários.

Se o aplicativo for composto por vários ambientes, esses ambientes poderão ser configurados explicitamente com a opção de configuração `environments` .

```js
export default {
  build: {
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['lib'],
  },
  environments: {
    server: {},
    edge: {
      resolve: {
        noExternal: true,
      },
    },
  },
}
```

Quando não está explicitamente documentado, o ambiente herda as opções de configuração de nível superior configurado (por exemplo, os novos ambientes `server` e `edge` herdarão a opção `build.sourcemap: false` ). Um pequeno número de opções de nível superior, como `optimizeDeps` , se aplica apenas ao ambiente `client` , pois elas não funcionam bem quando aplicadas como padrão nos ambientes do servidor. O ambiente `client` também pode ser configurado explicitamente até `environments.client` , mas recomendamos fazê-lo com as opções de nível superior, para que a configuração do cliente permaneça inalterada ao adicionar novos ambientes.

A interface `EnvironmentOptions` expõe todas as opções por ambiente. Existem opções de ambiente que se aplicam a `build` e `dev` , como `resolve` . E existem `DevEnvironmentOptions` e `BuildEnvironmentOptions` para o Dev e construir opções específicas (como `dev.warmup` ou `build.outDir` ). Algumas opções como `optimizeDeps` se aplica apenas ao Dev, mas são mantidas como nível superior, em vez de aninhadas em `dev` para compatibilidade com versões anteriores.

```ts
interface EnvironmentOptions {
  define?: Record<string, any>
  resolve?: EnvironmentResolveOptions
  optimizeDeps: DepOptimizationOptions
  consumer?: 'client' | 'server'
  dev: DevOptions
  build: BuildOptions
}
```

A interface `UserConfig` se estende da interface `EnvironmentOptions` , permitindo configurar o cliente e os padrões para outros ambientes, configurados através da opção `environments` . O ambiente `client` e um servidor nomeado `ssr` estão sempre presentes durante o Dev. Isso permite compatibilidade com versões anteriores com `server.ssrLoadModule(url)` e `server.moduleGraph` . Durante a construção, o ambiente `client` está sempre presente e o ambiente `ssr` está presente apenas se estiver configurado explicitamente (usando `environments.ssr` ou para compatibilidade com versões anteriores `build.ssr` ). Um aplicativo não precisa usar o nome `ssr` para seu ambiente SSR, ele pode nomeá -lo `server` por exemplo.

```ts
interface UserConfig extends EnvironmentOptions {
  environments: Record<string, EnvironmentOptions>
  // Outras opções
}
```

Observe que a propriedade `ssr` de nível superior será descontinuada assim que a API do ambiente estiver estável. Esta opção tem a mesma função que `environments` , mas para o ambiente padrão `ssr` e só permitiu a configuração de um pequeno conjunto de opções.

## Instâncias De Ambiente Personalizado

As APIs de configuração de baixo nível estão disponíveis para que os provedores de tempo de execução possam fornecer aos ambientes os padrões adequados para seus horários de execução. Esses ambientes também podem gerar outros processos ou threads para executar os módulos durante o Dev em um tempo de execução mais próximo do ambiente de produção.

```js
import { customEnvironment } from 'vite-environment-provider'

export default {
  build: {
    outDir: '/dist/client',
  },
  environments: {
    ssr: customEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
  },
}
```

## Compatibilidade Com Versões Anteriores

A API atual do servidor VITE ainda não está depreciada e é compatível com o Vite 5. A nova API de ambiente é experimental.

O `server.moduleGraph` retorna uma visualização mista dos gráficos do cliente e do módulo SSR. Os nós do módulo misto compatíveis com versões anteriores serão retornadas de todos os seus métodos. O mesmo esquema é usado para os nós do módulo passados para `handleHotUpdate` .

Ainda não recomendamos mudar para a API do ambiente. Nosso objetivo é uma boa parte da base de usuários adotar o Vite 6 antes de os plugins não precisam manter duas versões. Confira a seção de mudanças de quebra futura para obter informações sobre deprecações futuras e atualização do caminho:

- [`this.environment` em ganchos](/pt/changes/this-environment-in-hooks)
- [Gancho de plug -in HMR `hotUpdate`](/pt/changes/hotupdate-hook)
- [Mover para APIs por ambiente](/pt/changes/per-environment-apis)
- [SSR usando `ModuleRunner` API](/pt/changes/ssr-using-modulerunner)
- [Plugins compartilhados durante a construção](/pt/changes/shared-plugins-during-build)

## Usuários -Alvo

Este guia fornece os conceitos básicos sobre ambientes para usuários finais.

Os autores dos plug -in têm uma API mais consistente disponível para interagir com a configuração atual do ambiente. Se você estiver construindo no topo do Vite, o Guia [do API Plugins Ambient Api](./api-environment-plugins.md) descreve a maneira como as APIs estendidas de plug -in disponíveis para suportar vários ambientes personalizados.

As estruturas podem decidir expor ambientes em diferentes níveis. Se você é um autor da estrutura, continue lendo o [Guia do ambiente API API](./api-environment-frameworks) para aprender sobre o lado programático da API do ambiente.

Para os provedores de tempo de execução, o [API API RUNTIME GUIDE](./api-environment-runtimes.md) explica como oferecer um ambiente personalizado a ser consumido por estruturas e usuários.
