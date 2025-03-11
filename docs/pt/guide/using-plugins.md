# Usando Plugins

O Vite pode ser estendido usando plug-ins, que são baseados na interface do plug-in bem projetada do Rollup com algumas opções específicas de vite extra. Isso significa que os usuários do Vite podem confiar no ecossistema maduro de plugins de rollup, além de poder estender a funcionalidade de servidor de desenvolvimento e SSR, conforme necessário.

## Adicionando um plugin

Para usar um plug -in, ele precisa ser adicionado ao `devDependencies` do projeto e incluído na matriz `plugins` no arquivo de configuração `vite.config.js` . Por exemplo, para fornecer suporte para navegadores herdados, o oficial [@vitejs/plug-in-leis](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) pode ser usado:

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

`plugins` também aceita predefinições, incluindo vários plugins como um único elemento. Isso é útil para recursos complexos (como integração da estrutura) que são implementados usando vários plugins. A matriz será achatada internamente.

Os plug -ins falsamente serão ignorados, que podem ser usados para ativar ou desativar facilmente os plugins.

## Encontrando Plugins

:::tip NOTE
A Vite visa fornecer suporte fora da caixa para padrões comuns de desenvolvimento da Web. Antes de procurar um plug -in de rollup vite ou compatível, consulte o [guia de recursos](../guide/features.md) . Muitos dos casos em que um plug -in seria necessário em um projeto de rollup já está coberto de vite.
:::

Confira a [seção Plugins](../plugins/) para obter informações sobre plugins oficiais. Os plugins comunitários estão listados em [vítimas impressionantes](https://github.com/vitejs/awesome-vite#plugins) .

Você também pode encontrar plug-ins que seguem as [convenções recomendadas](./api-plugin.md#conventions) usando uma [pesquisa de NPM por plugin de vite](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity) para vite ou uma [pesquisa de npm por plugin rollup](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) para plugins de rollup.

## Aplicação Do Pedido Do Plug -In

Para compatibilidade com alguns plug -ins de rollup, pode ser necessário fazer cumprir a ordem do plug -in ou aplicar apenas no momento da construção. Este deve ser um detalhe de implementação para plugins de vite. Você pode aplicar a posição de um plugin com o modificador `enforce` :

- `pre` : Invoque o plug -in antes dos plug -ins do vite
- Padrão: Invoque o plug -in após os plug -ins de núcleo do vite
- `post` : Invoque o plug -in após os plugins de construção do vite

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

Confira [o Guia da API dos Plugins](./api-plugin.md#plugin-ordering) para obter informações detalhadas.

## Aplicação Condicional

Por padrão, os plug -ins são chamados para servir e construir. Nos casos em que um plug -in precisa ser aplicado condicionalmente apenas durante o serviço ou a construção, use a propriedade `apply` para invocá -los apenas durante `'build'` ou `'serve'` :

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## Plugins De Construção

Confira o [Guia da API do Plugins](./api-plugin.md) para obter documentação sobre a criação de plugins.
