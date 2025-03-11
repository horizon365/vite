# API HMR

:::tip Note
Esta é a API do cliente HMR. Para lidar com a atualização HMR nos plugins, consulte [o HandleHotUpDate](./api-plugin#handlehotupdate) .

A API manual de HMR destina -se principalmente à estrutura e autores de ferramentas. Como usuário final, o HMR provavelmente já é tratado para você nos modelos de partida específicos da estrutura.
:::

Vite expõe sua API manual de HMR por meio do objeto Special `import.meta.hot` :

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'

// ---corte---
interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  off<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}
```

## Guarda Condicional Necessária

Primeiro de tudo, certifique-se de guardar todo o uso da API HMR com um bloco condicional para que o código possa ser abalado na produção:

```js
if (import.meta.hot) {
  // Código HMR
}
```

## IntelliSense for TypeScript

O Vite fornece definições de tipo para `import.meta.hot` em [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) . Você pode criar um `env.d.ts` no diretório `src` , para que o TypeScript colhe as definições de tipo:

```ts
///<reference types="vite/client">
```

## `hot.accept(cb)`

Para um módulo para se auto-aceitar, use `import.meta.hot.accept` com um retorno de chamada que recebe o módulo atualizado:

```js twoslash
import 'vite/client'
// ---corte---
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // O Newmodule é indefinido quando a SyntaxError aconteceu
      console.log('updated: count is now ', newModule.count)
    }
  })
}
```

Um módulo que "aceita" as atualizações quentes é considerado um **limite de HMR** .

A HMR da Vite não troca o módulo originalmente importado: se um módulo de limite HMR reexportar as importações de um DEP, é responsável por atualizar esses reexports (e essas exportações devem estar usando `let` ). Além disso, os importadores da cadeia do módulo de limite não serão notificados da alteração. Essa implementação simplificada de HMR é suficiente para a maioria dos casos de uso de desenvolvedores, enquanto nos permite pular o trabalho caro de gerar módulos de proxy.

O Vite exige que a chamada para esta função apareça como `import.meta.hot.accept(` (sensível ao espaço em branco) no código-fonte para que o módulo aceite a atualização. Este é um requisito da análise estática que o Vite faz para ativar o suporte à HMR para um módulo.

## `hot.accept(deps, cb)`

Um módulo também pode aceitar atualizações de dependências diretas sem recarregar a si mesma:

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
// ---corte---
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // O retorno de chamada recebe o módulo atualizado './foo.js'
    newFoo?.foo()
  })

  // Também pode aceitar uma variedade de módulos de DEP:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // O retorno de chamada recebe uma matriz onde apenas o módulo atualizado é
      // não nulo. Se a atualização não foi bem -sucedida (erro de sintaxe para Ex.),
      // A matriz está vazia
    },
  )
}
```

## `hot.dispose(cb)`

Um módulo de auto-aceitação ou um módulo que espera ser aceito por outros pode usar `hot.dispose` para limpar quaisquer efeitos colaterais persistentes criados por sua cópia atualizada:

```js twoslash
import 'vite/client'
// ---corte---
function setupSideEffect() {}

setupSideEffect()

if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // Efeito colateral da limpeza
  })
}
```

## `hot.prune(cb)`

Registre um retorno de chamada que ligará quando o módulo não for mais importado na página. Comparado a `hot.dispose` , isso pode ser usado se o código-fonte limpar os efeitos colaterais por si só em atualizações e você precisar apenas limpar quando for removido da página. Atualmente, o Vite usa isso para `.css` importações.

```js twoslash
import 'vite/client'
// ---corte---
function setupOrReuseSideEffect() {}

setupOrReuseSideEffect()

if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // Efeito colateral da limpeza
  })
}
```

## `hot.data`

O objeto `import.meta.hot.data` é persistido em diferentes instâncias do mesmo módulo atualizado. Ele pode ser usado para transmitir informações de uma versão anterior do módulo para a próxima.

Observe que a reinicialização de `data` em si não é suportada. Em vez disso, você deve mudar as propriedades do objeto `data` para que as informações adicionadas a outros manipuladores sejam preservadas.

```js twoslash
import 'vite/client'
// ---corte---
// OK
import.meta.hot.data.someValue = 'hello'

// não suportado
import.meta.hot.data = { someValue: 'hello' }
```

## `hot.decline()`

Atualmente, este é um Noop e existe para compatibilidade com versões anteriores. Isso pode mudar no futuro se houver um novo uso para isso. Para indicar que o módulo não é utilizável a quente, use `hot.invalidate()` .

## `hot.invalidate(message?: string)`

Um módulo de auto-aceitação pode realizar durante o tempo de execução que não pode lidar com uma atualização HMR e, portanto, a atualização precisa ser propagada com força aos importadores. Ao ligar `import.meta.hot.invalidate()` , o servidor HMR invalidará os importadores do chamador, como se o chamador não fosse auto-aceitável. Isso registrará uma mensagem no console do navegador e no terminal. Você pode passar uma mensagem para dar algum contexto sobre por que a invalidação aconteceu.

Observe que você deve sempre ligar `import.meta.hot.accept` mesmo que planeje ligar `invalidate` imediatamente depois, ou então o cliente HMR não ouvirá mudanças futuras no módulo auto-aceitável. Para comunicar sua intenção com clareza, recomendamos ligar `invalidate` dentro dos `accept` retorno de chamada como assim:

```js twoslash
import 'vite/client'
// ---corte---
import.meta.hot.accept((module) => {
  // Você pode usar a nova instância do módulo para decidir se deve invalidar.
  if (cannotHandleUpdate(module)) {
    import.meta.hot.invalidate()
  }
})
```

## `hot.on(event, cb)`

Ouça um evento HMR.

Os seguintes eventos HMR são despachados pela Vite automaticamente:

- `'vite:beforeUpdate'` Quando uma atualização está prestes a ser aplicada (por exemplo, um módulo será substituído)
- `'vite:afterUpdate'` Quando uma atualização acaba de ser aplicada (por exemplo, um módulo foi substituído)
- `'vite:beforeFullReload'` Quando uma recarga completa está prestes a ocorrer
- `'vite:beforePrune'` Quando os módulos que não são mais necessários estão prestes a ser podados
- `'vite:invalidate'` Quando um módulo é invalidado com `import.meta.hot.invalidate()`
- `'vite:error'` Quando ocorre um erro (por exemplo, erro de sintaxe)
- `'vite:ws:disconnect'` Quando a conexão WebSocket é perdida
- `'vite:ws:connect'` Quando a conexão WebSocket é (re) estabelecida

Os eventos HMR personalizados também podem ser enviados a partir de plugins. Consulte [o HandleHotUpdate](./api-plugin#handlehotupdate) para obter mais detalhes.

## `hot.off(event, cb)`

Remova o retorno de chamada dos ouvintes do evento.

## `hot.send(event, data)`

Envie eventos personalizados de volta ao servidor de dev do Vite.

Se chamado antes conectado, os dados serão buffer e enviados assim que a conexão for estabelecida.

Consulte [a comunicação do cliente-servidor](/pt/guide/api-plugin.html#client-server-communication) para obter mais detalhes, incluindo uma seção sobre [a digitação de eventos personalizados](/pt/guide/api-plugin.html#typescript-for-custom-events) .

## Leitura Adicional

Se você quiser aprender mais sobre como usar a API HMR e como ela funciona sob a alojamento. Confira estes recursos:

- [A substituição do módulo quente é fácil](https://bjornlu.com/blog/hot-module-replacement-is-easy)
