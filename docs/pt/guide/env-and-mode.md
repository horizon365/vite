# Variáveis E Modos Env

Vite expõe certas constantes sob o objeto `import.meta.env` especial. Essas constantes são definidas como variáveis globais durante o Dev e substituídas estaticamente no tempo de construção para tornar eficazes de troca de árvores.

## Constantes embutidas

Algumas constantes embutidas estão disponíveis em todos os casos:

- **`import.meta.env.MODE`** : {string} o [modo](#modes) em que o aplicativo está sendo executado.

- **`import.meta.env.BASE_URL`** : {string} o URL base em que o aplicativo está sendo servido. Isso é determinado pela [opção `base` configuração](/pt/config/shared-options.md#base) .

- **`import.meta.env.PROD`** : {boolean} Se o aplicativo está em execução na produção (executando o servidor dev com `NODE_ENV='production'` ou executando um aplicativo criado com `NODE_ENV='production'` ).

- **`import.meta.env.DEV`** : {boolean} se o aplicativo está em execução em desenvolvimento (sempre o oposto de `import.meta.env.PROD` )

- **`import.meta.env.SSR`** : {boolean} se o aplicativo está sendo executado no [servidor](./ssr.md#conditional-logic) .

## Variáveis Env

Vite expõe variáveis ENV no objeto `import.meta.env` como strings automaticamente.

Para evitar o vazamento acidental de variáveis ENV para o cliente, apenas as variáveis prefixadas com `VITE_` são expostas ao seu código processado por vite. por exemplo, para as seguintes variáveis Env:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

Somente `VITE_SOME_KEY` será exposto como `import.meta.env.VITE_SOME_KEY` ao seu código -fonte do cliente, mas `DB_PASSWORD` não.

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // indefinido
```

Se você deseja personalizar o prefixo das variáveis ENV, consulte a opção [EnvPrefix](/pt/config/shared-options.html#envprefix) .

:::tip Env parsing
Como mostrado acima, `VITE_SOME_KEY` é um número, mas retorna uma string quando analisado. O mesmo aconteceu também para variáveis booleanas Env. Certifique -se de converter para o tipo desejado ao usá -lo no seu código.
:::

### `.env` arquivos

O Vite usa [o DOTENV](https://github.com/motdotla/dotenv) para carregar variáveis de ambiente adicionais dos seguintes arquivos em seu [diretório de ambiente](/pt/config/shared-options.md#envdir) :

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

:::tip Env Loading Priorities

Um arquivo ENV para um modo específico (por exemplo, `.env.production` ) terá uma prioridade mais alta que a genérica (por exemplo, `.env` ).

O Vite sempre carregará `.env` e `.env.local` além do arquivo `.env.[mode]` específico do modo. As variáveis declaradas em arquivos específicos do modo terão precedência sobre os arquivos genéricos, mas as variáveis definidas apenas em `.env` ou `.env.local` ainda estarão disponíveis no ambiente.

Além disso, variáveis de ambiente que já existem quando o Vite é executado têm a maior prioridade e não serão substituídas por `.env` arquivos. Por exemplo, ao executar `VITE_SOME_KEY=123 vite build` .

`.env` arquivos são carregados no início do Vite. Reinicie o servidor depois de fazer alterações.

:::

Além disso, o VITE usa [o DOTENV-EXPAND](https://github.com/motdotla/dotenv-expand) para expandir variáveis escritas nos arquivos ENV para fora da caixa. Para saber mais sobre a sintaxe, confira [seus documentos](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow) .

Observe que, se você deseja usar `$` no valor do seu ambiente, precisará escapar com `\` .

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

:::warning SECURITY NOTES

- `.env.*.local` arquivos são somente local e podem conter variáveis sensíveis. Você deve adicionar `*.local` aos seus `.gitignore` para evitar que eles sejam verificados no Git.

- Como quaisquer variáveis expostas ao seu código -fonte vite acabarão em seu pacote de clientes, `VITE_*` variáveis _não_ devem conter nenhuma informação confidencial.

:::

::: details Expanding variables in reverse order

O Vite suporta a expansão das variáveis em ordem inversa.
Por exemplo, o `.env` abaixo será avaliado como `VITE_FOO=foobar` , `VITE_BAR=bar` .

```[.env]
VITE_FOO=foo${VITE_BAR}
VITE_BAR=bar
```

Isso não funciona em scripts de shell e outras ferramentas como `docker-compose` .
Dito isto, o Vite suporta esse comportamento, pois isso foi suportado por `dotenv-expand` por um longo tempo e outras ferramentas no ecossistema JavaScript usa versões mais antigas que suportam esse comportamento.

Para evitar problemas de interopagem, é recomendável evitar confiar nesse comportamento. Vite pode começar a emitir avisos para esse comportamento no futuro.

:::

## IntelliSense for TypeScript

Por padrão, o Vite fornece definições de tipo para `import.meta.env` em [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) . Embora você possa definir mais variáveis ENV personalizadas em `.env.[mode]` arquivos, convém obter o TypeScript IntelliSense para variáveis ENV definidas pelo usuário que são prefixadas com `VITE_` .

Para conseguir isso, você pode criar um diretório de `vite-env.d.ts` em `src` e aumentar `ImportMetaEnv` como este:

```typescript [vite-env.d.ts]
///<reference types="vite/client">

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Mais variáveis Env ...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Se o seu código depende de tipos de ambientes de navegador, como [DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) e [WebWorker](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts) , você poderá atualizar o campo [LIB](https://www.typescriptlang.org/tsconfig#lib) em `tsconfig.json` .

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Imports will break type augmentation

Se o aumento `ImportMetaEnv` não funcionar, certifique -se de não ter `import` declarações em `vite-env.d.ts` . Consulte a [documentação do TypeScript](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined) para obter mais informações.

:::

## Substituição constante HTML

O Vite também suporta a substituição de constantes nos arquivos HTML. Quaisquer propriedades em `import.meta.env` pode ser usada em arquivos HTML com uma sintaxe especial `%CONST_NAME%` :

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

Se o Env não existir em `import.meta.env` , por exemplo, `%NON_EXISTENT%` , ele será ignorado e não substituído, diferentemente de `import.meta.env.NON_EXISTENT` em JS, onde é substituído como `undefined` .

Dado que o Vite é usado por muitas estruturas, é intencionalmente poucopinionado sobre substituições complexas, como condicionais. O Vite pode ser estendido usando [um plug -in de terras do usuário existente](https://github.com/vitejs/awesome-vite#transformers) ou um plug -in personalizado que implementa o [gancho `transformIndexHtml`](./api-plugin#transformindexhtml) .

## Modos

Por padrão, o servidor dev (comando `dev` ) é executado no modo `development` e o comando `build` é executado no modo `production` .

Isso significa que, ao executar `vite build` , ele carregará as variáveis Env de `.env.production` se houver uma:

```[.env.production]
VITE_APP_TITLE=My App
```

No seu aplicativo, você pode renderizar o título usando `import.meta.env.VITE_APP_TITLE` .

Em alguns casos, você pode executar `vite build` com um modo diferente para renderizar um título diferente. Você pode substituir o modo padrão usado para um comando passando o sinalizador `--mode` de opção. Por exemplo, se você deseja criar seu aplicativo para um modo de estadiamento:

```bash
vite build --mode staging
```

E crie um arquivo `.env.staging` :

```[.env.staging]
VITE_APP_TITLE=My App (staging)
```

Como `vite build` executa uma construção de produção por padrão, você também pode alterar isso e executar uma construção de desenvolvimento usando um modo diferente e `.env` configuração de arquivo:

```[.env.testing]
NODE_ENV=development
```

### Node_env e modos

É importante observar que `NODE_ENV` ( `process.env.NODE_ENV` ) e os modos são dois conceitos diferentes. Veja como diferentes comandos afetam o `NODE_ENV` e o modo:

| Comando                                              | Node_env        | Modo            |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

Os diferentes valores de `NODE_ENV` e modo também refletem sobre suas `import.meta.env` propriedades correspondentes:

| Comando                | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| Comando              | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` in `.env` files

`NODE_ENV=...` pode ser definido no comando e também em seu arquivo `.env` . Se `NODE_ENV` for especificado em um arquivo `.env.[mode]` , o modo poderá ser usado para controlar seu valor. No entanto, os `NODE_ENV` e os modos permanecem como dois conceitos diferentes.

O principal benefício com `NODE_ENV=...` no comando é que ele permite que o Vite detecte o valor mais cedo. Ele também permite que você leia `process.env.NODE_ENV` na sua configuração Vite, pois o Vite pode carregar apenas os arquivos Env assim que a configuração for avaliada.
:::
