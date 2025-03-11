# Desempenho

Enquanto o Vite é rápido por padrão, os problemas de desempenho podem surgir à medida que os requisitos do projeto crescem. Este guia tem como objetivo ajudá -lo a identificar e corrigir problemas comuns de desempenho, como:

- O servidor lento é iniciado
- Carregos de página lenta
- Construções lentas

## Revise Sua Configuração Do Navegador

Algumas extensões de navegador podem interferir nas solicitações e desacelerar os horários de inicialização e recarregar para aplicativos grandes, especialmente ao usar ferramentas de desenvolvimento do navegador. Recomendamos a criação de um perfil somente em desenvolvimento sem extensões ou mude para o modo incógnito, enquanto usa o servidor de dev vite nesses casos. O modo incógnito também deve ser mais rápido que um perfil regular sem extensões.

O servidor de dev vite faz cache difícil de dependências pré-conceituadas e implementa 304 respostas rápidas para o código-fonte. Desativar o cache enquanto as ferramentas de desenvolvimento do navegador estão abertas podem ter um grande impacto nos horários de inicialização e recarga da página inteira. Verifique se "desativar o cache" não está ativado enquanto você trabalha com o servidor Vite.

## Auditoria Plugins De Vite Configurados

Os plug -ins internos e oficiais da Vite são otimizados para fazer a menor quantidade de trabalho possível, fornecendo compatibilidade com o ecossistema mais amplo. Por exemplo, as transformações de código usam o regex no dev, mas faça uma análise completa em construção para garantir a correção.

No entanto, o desempenho dos plugins comunitários está fora do controle da Vite, o que pode afetar a experiência do desenvolvedor. Aqui estão algumas coisas que você pode cuidar ao usar plugins de vite adicionais:

1. As grandes dependências usadas apenas em certos casos devem ser importadas dinamicamente para reduzir o tempo de inicialização do Node.js. Exemplo de refatores: [vite-plugin-react#212](https://github.com/vitejs/vite-plugin-react/pull/212) e [vite-plugin-pwa#224](https://github.com/vite-pwa/vite-plugin-pwa/pull/244) .

2. Os ganchos `buildStart` , `config` e `configResolved` não devem executar operações longas e extensas. Esses ganchos são aguardados durante a inicialização do Dev Server, que atrasa quando você pode acessar o site no navegador.

3. Os ganchos `resolveId` , `load` e `transform` podem fazer com que alguns arquivos carreguem mais lentos que outros. Embora às vezes inevitável, ainda vale a pena verificar as áreas possíveis para otimizar. Por exemplo, a verificação se o `code` contém uma palavra -chave específica, ou os `id` correspondem a uma extensão específica, antes de fazer a transformação completa.

   Quanto mais tempo necessário para transformar um arquivo, mais significativo será a solicitação de cachoeira ao carregar o site no navegador.

   Você pode inspecionar a duração necessária para transformar um arquivo usando `vite --debug plugin-transform` ou [vite-plugin-inspecion](https://github.com/antfu/vite-plugin-inspect) . Observe que, como as operações assíncronas tendem a fornecer horários imprecisos, você deve tratar os números como uma estimativa aproximada, mas ainda deve revelar as operações mais caras.

::: tip Profiling
Você pode executar `vite --profile` , visitar o site e pressionar `p + enter` no seu terminal para gravar um `.cpuprofile` . Uma ferramenta como [a SpeedScope](https://www.speedscope.app) pode ser usada para inspecionar o perfil e identificar os gargalos. Você também pode [compartilhar os perfis](https://chat.vite.dev) com a equipe Vite para nos ajudar a identificar problemas de desempenho.
:::

## Reduzir as Operações De Resolução

A resolução de caminhos de importação pode ser uma operação cara ao atingir seu pior caso com frequência. Por exemplo, o Vite suporta caminhos de importação de "adivinhação" com a opção [`resolve.extensions`](/pt/config/shared-options.md#resolve-extensions) , que padroniza para `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']` .

Quando você tenta importar `./Component.jsx` com `import './Component'` , o Vite executará estas etapas para resolvê -lo:

1. Verifique se `./Component` existe, não.
2. Verifique se `./Component.mjs` existe, não.
3. Verifique se `./Component.js` existe, não.
4. Verifique se `./Component.mts` existe, não.
5. Verifique se `./Component.ts` existe, não.
6. Verifique se `./Component.jsx` existe, sim!

Como mostrado, é necessário um total de 6 verificações do sistema de arquivos para resolver um caminho de importação. Quanto mais importações implícitas você tiver, mais tempo ele aumenta para resolver os caminhos.

Portanto, geralmente é melhor ser explícito com seus caminhos de importação, por exemplo, `import './Component.jsx'` . Você também pode restringir a lista para `resolve.extensions` para reduzir as verificações gerais do sistema de arquivos, mas também deve garantir que ela funcione para arquivos em `node_modules` .

Se você é um autor de plug -in, ligue apenas para [`this.resolve`](https://rollupjs.org/plugin-development/#this-resolve) quando necessário para reduzir o número de cheques acima.

::: tip TypeScript
Se você estiver usando o TypeScript, ative `"moduleResolution": "bundler"` e `"allowImportingTsExtensions": true` nos seus `tsconfig.json` de `compilerOptions` para usar as extensões `.ts` e `.tsx` diretamente em seu código.
:::

## Evite Arquivos De Barril

Arquivos de barril são arquivos que reexportam as APIs de outros arquivos no mesmo diretório. Por exemplo:

```js [src/utils/index.js]
export * from './color.js'
export * from './dom.js'
export * from './slash.js'
```

Quando você importa apenas uma API individual, por `import { slash } from './utils'` , todos os arquivos nesse arquivo de barril precisam ser buscados e transformados, pois eles podem conter a API `slash` e também podem conter efeitos colaterais que são executados na inicialização. Isso significa que você está carregando mais arquivos do que o necessário no carregamento inicial da página, resultando em um carregamento de página mais lento.

Se possível, você deve evitar arquivos de barril e importar as APIs individuais diretamente, por exemplo, `import { slash } from './utils/slash.js'` . Você pode ler [a edição nº 8237](https://github.com/vitejs/vite/issues/8237) para obter mais informações.

## Aquecimento Com Arquivos Usados Com Frequência

O servidor Vite Dev transforma apenas os arquivos conforme solicitado pelo navegador, o que permite iniciar rapidamente e aplicar apenas transformações para arquivos usados. Ele também pode pré-transformar arquivos se antecipar determinados arquivos serão solicitados em breve. No entanto, as cachoeiras de solicitação ainda podem acontecer se alguns arquivos levarem mais tempo para se transformar do que outros. Por exemplo:

Dado um gráfico de importação onde o arquivo esquerdo importa o arquivo direito:

```
main.js -> BigComponent.vue -> big-utils.js -> large-data.json
```

O relacionamento de importação só pode ser conhecido após a transformação do arquivo. Se `BigComponent.vue` leva algum tempo para se transformar, `big-utils.js` que esperar por sua vez, e assim por diante. Isso causa uma cascata interna, mesmo com pré-transformação embutida.

O Vite permite que você aqueça os arquivos que você conhece são usados com frequência, por exemplo, `big-utils.js` , usando a opção [`server.warmup`](/pt/config/server-options.md#server-warmup) . Dessa forma, `big-utils.js` estará pronto e armazenado em cache para ser servido imediatamente quando solicitado.

Você pode encontrar arquivos que são usados com frequência executando `vite --debug transform` e inspecionar os logs:

```bash
vite:transform 28.72ms /@vite/client +1ms
vite:transform 62.95ms /src/components/BigComponent.vue +1ms
vite:transform 102.54ms /src/utils/big-utils.js +1ms
```

```js [vite.config.js]
export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/components/BigComponent.vue',
        './src/utils/big-utils.js',
      ],
    },
  },
})
```

Observe que você deve aquecer apenas arquivos que são frequentemente usados para não sobrecarregar o servidor de dev vite na inicialização. Verifique a opção [`server.warmup`](/pt/config/server-options.md#server-warmup) para obter mais informações.

O uso de [`--open` ou `server.open`](/pt/config/server-options.html#server-open) também fornece um impulso de desempenho, pois o Vite aquece automaticamente o ponto de entrada do seu aplicativo ou o URL fornecido para abrir.

## Use Ferramentas Menores Ou Nativas

Manter o Vite rapidamente com uma base de código em crescimento é sobre reduzir a quantidade de trabalho para os arquivos de origem (JS/TS/CSS).

Exemplos de fazer menos trabalho:

- Use CSS em vez de SASS/LESS/STYLUS quando possível (o ninho pode ser tratado pelo PostCSS)
- Não transforme SVGs em componentes da estrutura da interface do usuário (React, Vue, etc.). Importe -os como cordas ou URLs.
- Ao usar `@vitejs/plugin-react` , evite configurar as opções Babel, para que ele ignore a transformação durante a construção (apenas o ESBuild será usado).

Exemplos de uso de ferramentas nativas:

O uso de ferramentas nativas geralmente traz tamanho de instalação maior e, assim, não é o padrão ao iniciar um novo projeto Vite. Mas pode valer o custo para aplicações maiores.

- Experimente o apoio experimental para [o LightningCSS](https://github.com/vitejs/vite/discussions/13835)
- Use [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc) no lugar de `@vitejs/plugin-react` .
