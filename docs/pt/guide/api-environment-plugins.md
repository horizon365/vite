# API do ambiente para plugins

:::warning Experimental
A API do ambiente é experimental. Manteremos as APIs estáveis durante o Vite 6 para permitir que o ecossistema experimente e construa sobre ele. Planejamos estabilizar essas novas APIs com possíveis mudanças de quebra no Vite 7.

Recursos:

- [Discussão sobre feedback](https://github.com/vitejs/vite/discussions/16358) onde estamos recebendo feedback sobre as novas APIs.
- [API PR do ambiente](https://github.com/vitejs/vite/pull/16471) , onde a nova API foi implementada e revisada.

Compartilhe seu feedback conosco.
:::

## Acessando o ambiente atual em ganchos

Dado que havia apenas dois ambientes até o Vite 6 ( `client` e `ssr` ), um `ssr` booleano foi suficiente para identificar o ambiente atual nas APIs Vite. Os ganchos do plug -in receberam um `ssr` booleano no último parâmetro de opções, e várias APIs esperavam um parâmetro Último `ssr` opcional para associar adequadamente os módulos ao ambiente correto (por exemplo `server.moduleGraph.getModuleByUrl(url, { ssr })` ).

Com o advento de ambientes configuráveis, agora temos uma maneira uniforme de acessar suas opções e instância em plugins. Os ganchos do plug -in agora expõem `this.environment` em seu contexto, e as APIs que anteriormente esperavam que um `ssr` booleano agora esteja escopo para o ambiente adequado (por exemplo `environment.moduleGraph.getModuleByUrl(url)` ).

O servidor Vite possui um pipeline de plug -in compartilhado, mas quando um módulo é processado, ele sempre é feito no contexto de um determinado ambiente. A instância `environment` está disponível no contexto do plug -in.

Um plug -in pode usar a instância `environment` para alterar como um módulo é processado, dependendo da configuração do ambiente (que pode ser acessado usando `environment.config` ).

```ts
  transform(code, id) {
    console.log(this.environment.config.resolve.conditions)
  }
```

## Registrando Novos Ambientes Usando Ganchos

Os plugins podem adicionar novos ambientes no gancho `config` (por exemplo, para ter um gráfico de módulo separado para [RSC](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components) ):

```ts
  config(config: UserConfig) {
    config.environments.rsc ??= {}
  }
```

Um objeto vazio é suficiente para registrar o ambiente, valores padrão da configuração do ambiente do nível raiz.

## Configurando O Ambiente Usando Ganchos

Enquanto o gancho `config` estiver em execução, a lista completa de ambientes ainda não é conhecida e os ambientes podem ser afetados pelos valores padrão da configuração do ambiente do nível raiz ou explicitamente através do `config.environments` registro.
Os plugins devem definir valores padrão usando o gancho `config` . Para configurar cada ambiente, eles podem usar o novo gancho `configEnvironment` . Esse gancho é chamado para cada ambiente com sua configuração parcialmente resolvida, incluindo a resolução dos padrões finais.

```ts
  configEnvironment(name: string, options: EnvironmentOptions) {
    if (name === 'rsc') {
      options.resolve.conditions = // ...
```

## O gancho `hotUpdate`

- **TIPO:** `(this: {Ambiente: Devenvironment}, Opções: HotUpDateOptions) => Array<EnvironmentModuleNode> | vazio | Promessa <Matriz<EnvironmentModuleNode> | void> `
- **Veja também:** [API HMR](./api-hmr)

O gancho `hotUpdate` permite que os plugins executem manuseio de atualização HMR personalizado para um determinado ambiente. Quando um arquivo muda, o algoritmo HMR é executado para cada ambiente em série de acordo com o pedido em `server.environments` , para que o gancho `hotUpdate` seja chamado várias vezes. O gancho recebe um objeto de contexto com a seguinte assinatura:

```ts
interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

- `this.environment` é o ambiente de execução do módulo em que uma atualização de arquivo está sendo processada no momento.

- `modules` é uma variedade de módulos nesse ambiente que são afetados pelo arquivo alterado. É uma matriz porque um único arquivo pode mapear para vários módulos servidos (por exemplo, SFCS).

- `read` é uma função de leitura assíncrona que retorna o conteúdo do arquivo. Isso é fornecido porque, em alguns sistemas, o retorno de chamada de alteração do arquivo pode disparar muito rápido antes que o editor termine de atualizar o arquivo e o Direct `fs.readFile` retornará conteúdo vazio. A função de leitura passou em normaliza esse comportamento.

O gancho pode escolher:

- Filtre e restrinja a lista de módulos afetados para que o HMR seja mais preciso.

- Retorne uma matriz vazia e execute uma recarga completa:

  ```js
  hotUpdate({ modules, timestamp }) {
    if (this.environment.name !== 'client')
      return

    // Invalidar módulos manualmente
    const invalidatedModules = new Set()
    for (const mod of modules) {
      this.environment.moduleGraph.invalidateModule(
        mod,
        invalidatedModules,
        timestamp,
        true
      )
    }
    this.environment.hot.send({ type: 'full-reload' })
    return []
  }
  ```

- Retorne uma matriz vazia e execute o manuseio completo de HMR personalizado enviando eventos personalizados para o cliente:

  ```js
  hotUpdate() {
    if (this.environment.name !== 'client')
      return

    this.environment.hot.send({
      type: 'custom',
      event: 'special-update',
      data: {}
    })
    return []
  }
  ```

  O código do cliente deve registrar o manipulador correspondente usando a [API HMR](./api-hmr) (isso pode ser injetado pelo mesmo gancho `transform` do plugin):

  ```js
  if (import.meta.hot) {
    import.meta.hot.on('special-update', (data) => {
      // Execute atualização personalizada
    })
  }
  ```

## Plugins Por Ambiente

Um plug -in pode definir quais são os ambientes aos quais deve ser aplicado com a função `applyToEnvironment` .

```js
const UnoCssPlugin = () => {
  // Estado global compartilhado
  return {
    buildStart() {
      // INIT PER-ANIMANIMENTEMENTO COM FRACHMAP <Ambiente, Data>
      // Usando este.Inerambonment
    },
    configureServer() {
      // Use ganchos globais normalmente
    },
    applyToEnvironment(environment) {
      // Retorne true se este plug -in estiver ativo nesse ambiente,
      // ou retorne um novo plug -in para substituí -lo.
      // Se o gancho não for usado, o plug -in está ativo em todos os ambientes
    },
    resolveId(id, importer) {
      // pedia apenas ambientes que este plug -in aplique a
    },
  }
}
```

Se um plug-in não estiver ciente do ambiente e possui um estado que não é digitado no ambiente atual, o gancho `applyToEnvironment` permite torná-lo facilmente por ambiente.

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    {
      name: 'per-environment-plugin',
      applyToEnvironment(environment) {
        return nonShareablePlugin({ outputName: environment.name })
      },
    },
  ],
})
```

Vite Exports Um auxiliar `perEnvironmentPlugin` para simplificar esses casos em que nenhum outro ganchos é necessário:

```js
import { nonShareablePlugin } from 'non-shareable-plugin'

export default defineConfig({
  plugins: [
    perEnvironmentPlugin('per-environment-plugin', (environment) =>
      nonShareablePlugin({ outputName: environment.name }),
    ),
  ],
})
```

## Ambiente Em Ganchos De Construção

Da mesma maneira que durante o Dev, os ganchos do plug -in também recebem a instância do ambiente durante a construção, substituindo o `ssr` booleano.
Isso também funciona para `renderChunk` , `generateBundle` e outros ganchos de construção.

## Plugins Compartilhados Durante a Construção

Antes do Vite 6, os oleodutos dos plugins funcionavam de uma maneira diferente durante o Dev e a Build:

- **Durante o Dev:** os plugins são compartilhados
- **Durante a construção:** os plugins são isolados para cada ambiente (em diferentes processos: `vite build` , então `vite build --ssr` ).

Isso forçou as estruturas a compartilhar o estado entre a compilação `client` e a compilação `ssr` através de arquivos de manifesto gravados no sistema de arquivos. No Vite 6, agora estamos construindo todos os ambientes em um único processo, de modo que o pipeline do plugins e a comunicação entre o ambiente pode ser alinhada com o Dev.

Em um futuro major (Vite 7 ou 8), pretendemos ter um alinhamento completo:

- **Durante o desenvolvimento e a construção:** os plugins são compartilhados, com [filtragem por ambiente por ambiente](#per-environment-plugins)

Também haverá uma única instância `ResolvedConfig` compartilhada durante a construção, permitindo o armazenamento em cache em todo o nível do processo de construção de aplicativos da mesma maneira que estamos fazendo com `WeakMap<ResolvedConfig, CachedData>` durante o Dev.

Para o Vite 6, precisamos fazer uma etapa menor para manter a compatibilidade com versões anteriores. Os plug-ins de ecossistemas estão atualmente usando `config.build` em vez de `environment.config.build` para acessar a configuração, por isso precisamos criar um novo `ResolvedConfig` por padrão por padrão. Um projeto pode optar por compartilhar a configuração completa do pipeline de configuração e plug-ins `builder.sharedConfigBuild` a `true` .

Essa opção funcionaria apenas de um pequeno subconjunto de projetos no início, para que os autores do plug-in possam optar por um plug-in específico a ser compartilhado, definindo o sinalizador `sharedDuringBuild` como `true` . Isso permite compartilhar facilmente o estado de plugins regulares:

```js
function myPlugin() {
  // Compartilhar estado entre todos os ambientes em Dev e construir
  const sharedState = ...
  return {
    name: 'shared-plugin',
    transform(code, id) { ... },

    // Optar em uma única instância para todos os ambientes
    sharedDuringBuild: true,
  }
}
```
