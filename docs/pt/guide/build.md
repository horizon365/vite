# Construção para produção

Quando é hora de implantar seu aplicativo para produção, basta executar o comando `vite build` . Por padrão, ele usa `<root>/index.html` como ponto de entrada de compilação e produz um pacote de aplicativos adequado para ser servido em um serviço de hospedagem estática. Confira a [implantação de um site estático](./static-deploy) para obter guias sobre serviços populares.

## Compatibilidade Do Navegador

Por padrão, o pacote de produção assume suporte para JavaScript moderno, como [módulos de ES nativos](https://caniuse.com/es6-module) , [importação dinâmica do ESM nativo](https://caniuse.com/es6-module-dynamic-import) , [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , [coalescência nula](https://caniuse.com/mdn-javascript_operators_nullish_coalescing) e [bigint](https://caniuse.com/bigint) . A linha de suporte padrão do navegador é:

<!-- Search for the `ESBUILD_MODULES_TARGET` constant for more information -->

- Chrome> = 87
- Firefox> = 78
- Safari> = 14
- Edge> = 88

Você pode especificar metas personalizadas através da [opção de configuração `build.target`](/pt/config/build-options.md#build-target) , onde o destino mais baixo é `es2015` . Se um alvo mais baixo estiver definido, o Vite ainda exigirá esses intervalos mínimos de suporte ao navegador, pois se baseia na [importação dinâmica do ESM nativo](https://caniuse.com/es6-module-dynamic-import) e [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) :

<!-- Search for the `defaultEsbuildSupported` constant for more information -->

- Chrome> = 64
- Firefox> = 67
- Safari> = 11.1
- Edge> = 79

Observe que, por padrão, o Vite lida apenas com as transformações de sintaxe e **não cobre os poli -filos** . Você pode conferir [https://cdnjs.cloudflare.com/polyfill/](https://cdnjs.cloudflare.com/polyfill/) , que gera automaticamente feixes de polyfill com base na sequência do usuário do navegador do usuário.

Os navegadores herdados podem ser suportados via [@vitejs/plugin-leis](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) , que gerarão automaticamente pedaços herdados e os compatíveis com o recurso de linguagem ES correspondentes. Os pedaços herdados são carregados condicionalmente apenas em navegadores que não possuem suporte de ESM nativo.

## Caminho Da Base Pública

- Relacionado: [Manuseio de ativos](./assets)

Se você estiver implantando seu projeto sob um caminho público aninhado, basta especificar a [opção de configuração `base`](/pt/config/shared-options.md#base) e todos os caminhos de ativos serão reescritos de acordo. Esta opção também pode ser especificada como um sinalizador de linha de comando, por exemplo, `vite build --base=/my/public/path/` .

Os URLs de ativos de JS-Pomported, CSS `url()` e referências de ativos em seus `.html` arquivos são ajustadas automaticamente para respeitar essa opção durante a compilação.

A exceção é quando você precisa concatenar dinamicamente URLs em tempo real. Nesse caso, você pode usar a variável `import.meta.env.BASE_URL` injetada globalmente, que será o caminho da base pública. Observe que essa variável é substituída estaticamente durante a compilação, para que pareça exatamente como está (ou `import.meta.env['BASE_URL']` não funcionará).

Para controle avançado do caminho da base, consulte [as opções de base avançada](#advanced-base-options) .

### Base relativa

Se você não conhece o caminho base com antecedência, poderá definir um caminho base relativo com `"base": "./"` ou `"base": ""` . Isso fará com que todos os URLs gerados sejam relativos a cada arquivo.

:::warning Support for older browsers when using relative bases

`import.meta` Suporte é necessário para bases relativas. Se você precisar suportar [navegadores que não suportem `import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta) , poderá usar [o plug -in `legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) .

:::

## Personalizando a construção

A compilação pode ser personalizada através de várias [opções de configuração de construção](/pt/config/build-options.md) . Especificamente, você pode ajustar diretamente as [opções de rollup](https://rollupjs.org/configuration-options/) subjacentes via `build.rollupOptions` :

```js [vite.config.js]
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

Por exemplo, você pode especificar várias saídas de rollup com plug -ins que são aplicados apenas durante a construção.

## Estratégia De Chunking

Você pode configurar como os pedaços são divididos usando `build.rollupOptions.output.manualChunks` (consulte [Rollup Docs](https://rollupjs.org/configuration-options/#output-manualchunks) ). Se você usar uma estrutura, consulte a documentação deles para configurar como os pedaços são divididos.

## Carregar O Manuseio De Erros

O Vite emite `vite:preloadError` evento quando não carrega as importações dinâmicas. `event.payload` contém o erro de importação original. Se você ligar `event.preventDefault()` , o erro não será jogado.

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // Por exemplo, atualize a página
})
```

Quando ocorre uma nova implantação, o serviço de hospedagem pode excluir os ativos de implantações anteriores. Como resultado, um usuário que visitou seu site antes da nova implantação pode encontrar um erro de importação. Esse erro acontece porque os ativos em execução no dispositivo desse usuário estão desatualizados e tenta importar o bloco antigo correspondente, que é excluído. Este evento é útil para abordar essa situação.

## Reconstrua as Mudanças De Arquivos

Você pode ativar o Rollup Watcher com `vite build --watch` . Ou, você pode ajustar diretamente o [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) subjacente via `build.watch` :

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

Com o sinalizador `--watch` ativado, as alterações no `vite.config.js` , bem como qualquer arquivo a ser agrupado, acionarão uma reconstrução.

## Aplicativo De Várias Páginas

Suponha que você tenha a seguinte estrutura de código -fonte:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Durante o Dev, basta navegar ou vincular para `/nested/` - ele funciona como esperado, assim como para um servidor de arquivo estático normal.

Durante a construção, tudo o que você precisa fazer é especificar vários arquivos `.html` como pontos de entrada:

```js twoslash [vite.config.js]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

Se você especificar uma raiz diferente, lembre -se de que `__dirname` ainda será a pasta do seu arquivo vite.config.js ao resolver os caminhos de entrada. Portanto, você precisará adicionar sua entrada `root` aos argumentos de `resolve` .

Observe que, para arquivos HTML, o Vite ignora o nome dado à entrada no objeto `rollupOptions.input` e, em vez disso, respeita o ID resolvido do arquivo ao gerar o ativo HTML na pasta Dist. Isso garante uma estrutura consistente com a maneira como o servidor de desenvolvimento funciona.

## Modo De Biblioteca

Quando você está desenvolvendo uma biblioteca orientada para o navegador, provavelmente está gastando a maior parte do tempo em uma página de teste/demonstração que importa sua biblioteca real. Com o Vite, você pode usar o seu `index.html` para esse fim para obter a experiência de desenvolvimento suave.

Quando chegar a hora de agrupar sua biblioteca para distribuição, use a [opção de configuração `build.lib`](/pt/config/build-options.md#build-lib) . Certifique -se de externalizar também quaisquer dependências que você não deseja agrupar em sua biblioteca, por exemplo, `vue` ou `react` :

::: code-group

```js twoslash [vite.config.js (single entry)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // as extensões adequadas serão adicionadas
      fileName: 'my-lib',
    },
    rollupOptions: {
      // Certifique -se de externalizar deípões que não devem ser incluídos
      // em sua biblioteca
      external: ['vue'],
      output: {
        // Forneça variáveis globais a serem usadas na compilação UMD
        // para deps externalizados
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (multiple entries)]
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        secondary: resolve(__dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rollupOptions: {
      // Certifique -se de externalizar deípões que não devem ser incluídos
      // em sua biblioteca
      external: ['vue'],
      output: {
        // Forneça variáveis globais a serem usadas na compilação UMD
        // para deps externalizados
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

O arquivo de entrada conteria as exportações que podem ser importadas pelos usuários do seu pacote:

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

A execução `vite build` com esta configuração usa uma predefinição de Rollup que é orientada para bibliotecas de remessa e produz dois formatos de pacote:

- `es` e `umd` (para entrada única)
- `es` e `cjs` (para várias entradas)

Os formatos podem ser configurados com a opção [`build.lib.formats`](/pt/config/build-options.md#build-lib) .

```
$ vite build
building for production...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

Recomendado `package.json` para o seu Lib:

::: code-group

```json [package.json (single entry)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (multiple entries)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### Suporte CSS

Se sua biblioteca importar qualquer CSS, ela será incluída como um único arquivo CSS além dos arquivos JS construídos, por exemplo, `dist/my-lib.css` . O nome é padrão para `build.lib.fileName` , mas também pode ser alterado com [`build.lib.cssFileName`](/pt/config/build-options.md#build-lib) .

Você pode exportar o arquivo CSS no seu `package.json` a ser importado pelos usuários:

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip File Extensions
Se o `package.json` não contiver `"type": "module"` , o Vite gerará diferentes extensões de arquivo para compatibilidade do Node.js. `.js` se tornará `.mjs` e `.cjs` se tornará `.js` .
:::

::: tip Environment Variables
No modo da biblioteca, todo [`import.meta.env.*`](./env-and-mode.md) uso é substituído estaticamente ao criar para produção. No entanto, `process.env.*` uso não é, para que os consumidores da sua biblioteca possam alterá -lo dinamicamente. Se isso for indesejável, você pode usar `define: { 'process.env.NODE_ENV': '"production"' }` por exemplo, para substituí -los estaticamente ou usar [`esm-env`](https://github.com/benmccann/esm-env) para melhor compatibilidade com pacotes e tempos de execução.
:::

::: warning Advanced Usage
O modo da biblioteca inclui uma configuração simples e opinativa para bibliotecas de estrutura orientada ao navegador e JS. Se você estiver criando bibliotecas não navegadores ou precisar de fluxos de construção avançados, poderá usar diretamente [o Rollup](https://rollupjs.org) ou [o Esbuild](https://esbuild.github.io) .
:::

## Opções De Base Avançadas

::: warning
Esse recurso é experimental. [Dê feedback](https://github.com/vitejs/vite/discussions/13834) .
:::

Para casos de uso avançado, os ativos e arquivos públicos implantados podem estar em diferentes caminhos, por exemplo, para usar diferentes estratégias de cache.
Um usuário pode optar por implantar em três caminhos diferentes:

- Os arquivos HTML de entrada gerados (que podem ser processados durante o SSR)
- Os ativos de hash gerados (JS, CSS e outros tipos de arquivos, como imagens)
- Os [arquivos públicos](assets.md#the-public-directory) copiados

Uma única [base](#public-base-path) estática não é suficiente nesses cenários. O Vite fornece suporte experimental para opções de base avançada durante a construção, usando `experimental.renderBuiltUrl` .

```ts twoslash
import type { UserConfig } from 'vite'
// Ignore mais bonito
const config: UserConfig = {
  // --- corte antes ---
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
      } else {
        return { relative: true }
      }
    },
  },
  // --- Cut-After ---
}
```

Se os ativos hashed e arquivos públicos não forem implantados juntos, as opções para cada grupo poderão ser definidas independentemente usando o ativo `type` incluído no segundo param `context` dado à função.

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// Ignore mais bonito
const config: UserConfig = {
  // --- corte antes ---
  experimental: {
    renderBuiltUrl(filename, { hostId, hostType, type }) {
      if (type === 'public') {
        return 'https://www.domain.com/' + filename
      } else if (path.extname(hostId) === '.js') {
        return {
          runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
        }
      } else {
        return 'https://cdn.domain.com/assets/' + filename
      }
    },
  },
  // --- Cut-After ---
}
```

Observe que o `filename` passado é um URL decodificado e, se a função retornar uma sequência de URL, também deverá ser decodificada. O Vite lidará com a codificação automaticamente ao renderizar os URLs. Se um objeto com `runtime` for retornado, a codificação deve ser manuseada onde necessário, pois o código de tempo de execução será renderizado como está.
