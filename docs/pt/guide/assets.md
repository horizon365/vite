# Manipulação De Ativos Estáticos

- Relacionado: [Caminho Da Base Pública](./build#Public-Base-Path)
- Relacionado: [`assetsInclude` opção de configuração](/pt/config/shared-options.md#assetsinclude)

## Importar ativo como URL

A importação de um ativo estático retornará o URL público resolvido quando for servido:

```js twoslash
import 'vite/client'
// ---corte---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Por exemplo, `imgUrl` será `/src/img.png` durante o desenvolvimento e se tornará `/assets/img.2d8efhg.png` na construção da produção.

O comportamento é semelhante ao `file-loader` de Webpack. A diferença é que a importação pode estar usando caminhos públicos absolutos (com base na raiz do projeto durante o dev) ou em caminhos relativos.

- `url()` referências no CSS são tratadas da mesma maneira.

- Se estiver usando o plug -in VUE, as referências de ativos nos modelos Vue SFC são automaticamente convertidas em importações.

- A imagem comum, a mídia e os arquivos de fonte são detectados como ativos automaticamente. Você pode estender a lista interna usando a [opção `assetsInclude`](/pt/config/shared-options.md#assetsinclude) .

- Os ativos referenciados são incluídos como parte do gráfico de ativos de construção, receberão nomes de arquivos de hash e podem ser processados por plugins para otimização.

- Os ativos menores em bytes do que a [opção `assetsInlineLimit`](/pt/config/build-options.md#build-assetsinlinelimit) serão inlinados como URLs de dados base64.

- Os espaços reservados para o Git LFS são automaticamente excluídos de inline porque não contêm o conteúdo do arquivo que representam. Para se envolver, certifique -se de baixar o conteúdo do arquivo via Git LFS antes de criar.

- O TypeScript, por padrão, não reconhece as importações estáticas de ativos como módulos válidos. Para consertar isso, inclua [`vite/client`](./features#client-types) .

::: tip Inlining SVGs through `url()`
Ao passar por um URL de SVG para uma construção manualmente `url()` por JS, a variável deve ser envolvida em citações duplas.

```js twoslash
import 'vite/client'
// ---corte---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### Importações explícitas de URL

Os ativos que não estão incluídos na lista interna ou em `assetsInclude` , podem ser explicitamente importados como URL usando o sufixo `?url` . Isso é útil, por exemplo, importar [trabalhos de tinta de Houdini](https://developer.mozilla.org/en-US/docs/Web/API/CSS/paintWorklet_static) .

```js twoslash
import 'vite/client'
// ---corte---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Manuseio Explícito Em Linha

Os ativos podem ser explicitamente importados com a inline ou não, usando o sufixo `?inline` ou `?no-inline` respectivamente.

```js twoslash
import 'vite/client'
// ---corte---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### Importar Ativo Como String

Os ativos podem ser importados como strings usando o sufixo `?raw` .

```js twoslash
import 'vite/client'
// ---corte---
import shaderString from './shader.glsl?raw'
```

### Importando script como trabalhador

Os scripts podem ser importados como trabalhadores da web com o sufixo `?worker` ou `?sharedworker` .

```js twoslash
import 'vite/client'
// ---corte---
// Separar pedaços na construção da produção
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---corte---
// SharedWorker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---corte---
// Inlined como Base64 Strings
import InlineWorker from './shader.js?worker&inline'
```

Confira a [seção Web Worker](./features.md#web-workers) para obter mais detalhes.

## O diretório `public`

Se você tem ativos que são:

- Nunca referenciado no código -fonte (por exemplo, `robots.txt` )
- Deve manter exatamente o mesmo nome de arquivo (sem hash)
- ... ou você simplesmente não quer importar um ativo primeiro apenas para obter seu URL

Em seguida, você pode colocar o ativo em um diretório `public` especial na raiz do seu projeto. Os ativos neste diretório serão servidos no caminho da raiz `/` durante o Dev e copiados para a raiz do diretório dist.

O diretório é padrão para `<root>/public` , mas pode ser configurado através da [opção `publicDir`](/pt/config/shared-options.md#publicdir) .

Observe que você sempre deve fazer referência a `public` ativos usando o caminho absoluto da raiz - por exemplo, `public/icon.png` deve ser referenciado no código -fonte como `/icon.png` .

## Novo URL (URL, Import.Meta.url)

[Import.Meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) é um recurso de ESM nativo que expõe o URL do módulo atual. Combinando -o com o [construtor de URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) nativo, podemos obter o URL resolvido e completo de um ativo estático usando o caminho relativo de um módulo JavaScript:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

Isso funciona nativamente nos navegadores modernos - na verdade, o Vite não precisa processar esse código durante o desenvolvimento!

Esse padrão também suporta URLs dinâmicos por meio de literais de modelo:

```js
function getImageUrl(name) {
  // Observe que isso não inclui arquivos nos subdiretos
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Durante a construção da produção, o Vite executará as transformações necessárias para que os URLs ainda apontem para o local correto, mesmo após o agrupamento e o hash de ativos. No entanto, a sequência de URL deve ser estática para que possa ser analisada, caso contrário, o código será deixado como está, o que pode causar erros de tempo de execução se `build.target` não suportar `import.meta.url`

```js
// Vite não vai transformar isso
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details How it works

Vite transformará a função `getImageUrl` em:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Does not work with SSR
Esse padrão não funciona se você estiver usando o Vite para renderização do lado do servidor, porque `import.meta.url` tem semântica diferente em navegadores vs. node.js. O pacote do servidor também não pode determinar o URL do host do cliente com antecedência.
:::
