# Começando

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## Visão Geral

Vite (French word for "quick", pronounced `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>, like "veet") is a build tool that aims to provide a faster and leaner development experience for modern web projects. It consists of two major parts:

- Um servidor de desenvolvimento que fornece [aprimoramentos ricos de recursos](./features) sobre [os módulos ES nativos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) , por exemplo [, substituição de módulos HOT extremamente rápida (HMR)](./features#hot-module-replacement) .

- Um comando de compilação que agrupa seu código com [Rollup](https://rollupjs.org) , pré-configurado para produzir ativos estáticos altamente otimizados para produção.

O Vite é opinativo e vem com padrões sensatos da caixa. Leia sobre o que é possível no [guia de recursos](./features) . O suporte a estruturas ou integração com outras ferramentas é possível através de [plugins](./using-plugins) . A [seção Config](../config/) explica como adaptar o Vite ao seu projeto, se necessário.

O Vite também é altamente extensível por meio da [API do plug -in](./api-plugin) e [da API JavaScript](./api-javascript) com suporte completo de digitação.

Você pode aprender mais sobre a lógica por trás do projeto na seção [Why Vite](./why) .

## Suporte Do Navegador

Durante o desenvolvimento, o Vite Sets [`esnext` como o alvo de transformação](https://esbuild.github.io/api/#target) , porque assumimos que um navegador moderno é usado e suporta todos os mais recentes recursos JavaScript e CSS. Isso impede a redução da sintaxe, permitindo que o Vite sirva módulos o mais próximo possível do código -fonte original.

Para a construção da produção, por padrão os navegadores de vítimas que suportam JavaScript moderno, como [módulos de ES nativos](https://caniuse.com/es6-module) , [importação dinâmica de ESM nativa](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [coalescante angustiante](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) e [bigint](https://caniuse.com/bigint) . Os navegadores herdados podem ser suportados pelo oficial [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) . Consulte o [edifício da seção de produção](./build) para obter mais detalhes.

## Tentando Vite Online

Você pode experimentar o Vite online no [Stackblitz](https://vite.new/) . Ele executa a configuração de compilação baseada em vite diretamente no navegador, por isso é quase idêntico à configuração local, mas não requer instalação de nada na sua máquina. Você pode navegar para `vite.new/{template}` para selecionar qual estrutura usar.

As predefinições de modelo suportadas são:

|              JavaScript              |                 TypeScript                 |
| :----------------------------------: | :----------------------------------------: |
| [baunilha](https://vite.new/vanilla) | [baunilha-ts](https://vite.new/vanilla-ts) |
|     [Vue](https://vite.new/vue)      |     [vue-ts](https://vite.new/vue-ts)      |
|   [reagir](https://vite.new/react)   |   [react-ts](https://vite.new/react-ts)    |
|  [Preact](https://vite.new/preact)   |  [Preact-ts](https://vite.new/preact-ts)   |
|  [iluminado](https://vite.new/lit)   |     [lit-ts](https://vite.new/lit-ts)      |
|  [SVELTE](https://vite.new/svelte)   |  [SVELTE-TS](https://vite.new/svelte-ts)   |
|   [sólido](https://vite.new/solid)   |   [Solid-ts](https://vite.new/solid-ts)    |
|    [Qwik](https://vite.new/qwik)     |    [Qwik-ts](https://vite.new/qwik-ts)     |

## Andaime Seu Primeiro Projeto De Vite

::: tip Compatibility Note
O Vite requer [Node.js](https://nodejs.org/pt/) versão 18+ ou 20+. No entanto, alguns modelos exigem uma versão mais alta do Node.js para funcionar, atualize se o seu gerenciador de pacotes alertar sobre isso.
:::

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

Em seguida, siga os prompts!

Você também pode especificar diretamente o nome do projeto e o modelo que deseja usar através de opções adicionais de linha de comando. Por exemplo, para andaime um projeto Vite + Vue, Run:

::: code-group

```bash [npm]
# NPM 7+, é necessário dupla dash extra:
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

Consulte [Create-Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) para obter mais detalhes sobre cada modelo suportado: `vanilla` , `vanilla-ts` , `vue` , `vue-ts` , `react` , `react-ts` , `react-swc` , `react-swc-ts` , `preact` , 9, `preact-ts` , `lit` , `lit-ts` , `svelte` , `svelte-ts` , `solid` , `solid-ts` , `qwik` , `qwik-ts`

Você pode usar `.` para o nome do projeto para andaime no diretório atual.

## Modelos Comunitários

Create-Vite é uma ferramenta para iniciar rapidamente um projeto de um modelo básico para estruturas populares. Confira [modelos impressionantes de vite para a comunidade](https://github.com/vitejs/awesome-vite#templates) que incluem outras ferramentas ou segmentam estruturas diferentes.

Para um modelo em `https://github.com/user/project` , você pode experimentá -lo on -line usando `https://github.stackblitz.com/user/project` (adicionando `.stackblitz` após `github` ao URL do projeto).

Você também pode usar uma ferramenta como [o Degit](https://github.com/Rich-Harris/degit) para andaime do seu projeto com um dos modelos. Supondo que o projeto esteja no Github e use `main` como a filial padrão, você pode criar uma cópia local usando:

```bash
npx degit user/project#Principal My-Project
cd my-project

npm install
npm run dev
```

## Instalação Manual

No seu projeto, você pode instalar a CLI `vite` usando:

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

E crie um arquivo `index.html` como este:

```html
<p>Hello Vite!</p>
```

Em seguida, execute o comando da CLI apropriado em seu terminal:

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

:::

O `index.html` será servido em `http://localhost:5173` .

## `index.html` e raiz do projeto

Uma coisa que você deve ter notado é que, em um projeto Vite, `index.html` é a frente e o centro, em vez de ser escondido dentro de `public` . Isso é intencional: durante o desenvolvimento, o Vite é um servidor e `index.html` é o ponto de entrada para o seu aplicativo.

Vite trata `index.html` como código -fonte e parte do gráfico do módulo. Ele resolve `<script type="module" src="...">` que faz referência ao seu código -fonte JavaScript. Mesmo em linha `<script type="module">` e CSS mencionados por `<link href>` também desfrutam de recursos específicos de vite. Além disso, os URLs dentro de `index.html` são automaticamente reencontrados, para que não haja necessidade de `%PUBLIC_URL%` espaços reservados especiais.

Semelhante aos servidores HTTP estáticos, o Vite tem o conceito de um "diretório raiz" da qual seus arquivos são servidos. Você o verá referenciado como `<root>` ao longo do restante dos documentos. Os URLs absolutos no seu código -fonte serão resolvidos usando a raiz do projeto como base, para que você possa escrever código como se estivesse trabalhando com um servidor de arquivo estático normal (exceto muito mais poderoso!). O Vite também é capaz de lidar com dependências que resolvem os locais do sistema de arquivos fora de raízes, o que o torna utilizável mesmo em uma configuração baseada em Monorepo.

O Vite também suporta [aplicativos de várias páginas](./build#multi-page-app) com vários pontos de entrada `.html` .

#### Especificando Raiz Alternativa

A execução `vite` inicia o servidor dev usando o diretório de trabalho atual como root. Você pode especificar uma raiz alternativa com `vite serve some/sub/dir` .
Observe que o Vite também resolverá [seu arquivo de configuração (ou seja, `vite.config.js` )](/pt/config/#configuring-vite) dentro da raiz do projeto, então você precisará movê -lo se a raiz for alterada.

## Interface Da Linha De Comando

Em um projeto em que o Vite é instalado, você pode usar o `vite` binário em seus scripts NPM ou executá -lo diretamente com `npx vite` . Aqui estão os scripts NPM padrão em um projeto Vite de andaime:

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // start dev server, aliases: `vite dev`, `vite serve`
    "build": "vite build", // build for production
    "preview": "vite preview" // locally preview production build
  }
}
```

Você pode especificar opções adicionais de CLI, como `--port` ou `--open` . Para uma lista completa de opções de CLI, execute `npx vite --help` em seu projeto.

Saiba mais sobre a [interface da linha de comando](./cli.md)

## Usando Compromissos Não Lançados

Se você não pode esperar que um novo lançamento teste os recursos mais recentes, poderá instalar uma confirmação específica de vite com https://pkg.pr.new:

::: code-group

```bash [npm]
$ npm install -D https://pkg.pr.new/vite@SHA
```

```bash [Yarn]
$ yarn add -D https://pkg.pr.new/vite@SHA
```

```bash [pnpm]
$ pnpm add -D https://pkg.pr.new/vite@SHA
```

```bash [Bun]
$ bun add -D https://pkg.pr.new/vite@SHA
```

:::

Substitua `SHA` por qualquer um dos [shas de compromisso da Vite](https://github.com/vitejs/vite/commits/main/) . Observe que apenas os compromissos no último mês funcionarão, pois os lançamentos de comprometimento mais antigos são purgados.

Como alternativa, você também pode clonar o [repositório do Vite](https://github.com/vitejs/vite) para sua máquina local e depois construí -la e vincular você mesmo ( [o PNPM](https://pnpm.io/) é necessário):

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # Use seu gerenciador de pacotes preferido para esta etapa
```

Em seguida, vá para o seu projeto baseado em vite e execute `pnpm link --global vite` (ou o gerenciador de pacotes que você usou para vincular `vite` globalmente). Agora reinicie o servidor de desenvolvimento para andar na borda sangrando!

::: tip Dependencies using Vite
Para substituir a versão vite usada pelas dependências transmissíveis, você deve usar [substituições de NPM](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides) ou [substituições de PNPM](https://pnpm.io/package_json#pnpmoverrides) .
:::

## Comunidade

Se você tiver dúvidas ou precisar de ajuda, entre em contato com a comunidade nas discussões [Discord](https://chat.vite.dev) e [Github](https://github.com/vitejs/vite/discussions) .
