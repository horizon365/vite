# Переменные И Режимы ENV

VITE раскрывает определенные константы под специальным объектом `import.meta.env` . Эти константы определяются как глобальные переменные во время DEV и статически заменяются при строительстве, чтобы повысить деревья эффективным.

## Встроенные постоянные

Некоторые встроенные константы доступны во всех случаях:

- **`import.meta.env.MODE`** : {строка} [режим](#modes) , в котором работает приложение.

- **`import.meta.env.BASE_URL`** : {строка} базовый URL. Приложение обслуживается. Это определяется [опцией `base` конфигурации](/en/config/shared-options.md#base) .

- **`import.meta.env.PROD`** : {boolean} независимо от того, работает ли приложение в производстве (запустив сервер Dev с `NODE_ENV='production'` или запустив приложение, построенное с `NODE_ENV='production'` ).

- **`import.meta.env.DEV`** : {boolean}, работает ли приложение в разработке (всегда противоположность `import.meta.env.PROD` )

- **`import.meta.env.SSR`** : {boolean}, работает ли приложение на [сервере](./ssr.md#conditional-logic) .

## Env Переменные

VITE разоблачает переменные ENV под `import.meta.env` объектом в виде строк автоматически.

Чтобы предотвратить случайную утечку переменных ENV с клиентом, только переменные, префиксированные `VITE_` подвергаются воздействию вашего кода, обработанного VITE. Например, для следующих переменных ENV:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

Только `VITE_SOME_KEY` будет выставлен как `import.meta.env.VITE_SOME_KEY` для вашего клиентского исходного кода, но `DB_PASSWORD` не будут.

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // неопределенный
```

Если вы хотите настроить префикс переменных ENV, см. Параметр [EnvPrefix](/en/config/shared-options.html#envprefix) .

:::tip Env parsing
Как показано выше, `VITE_SOME_KEY` - это число, но возвращает строку при разведке. То же самое также произойдет для логических переменных Env. Обязательно преобразуйте в нужный тип при его использовании в вашем коде.
:::

### `.env` файлов

Vite использует [Dotenv](https://github.com/motdotla/dotenv) для загрузки дополнительных переменных среды из следующих файлов в [каталоге вашей среды](/en/config/shared-options.md#envdir) :

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

:::tip Env Loading Priorities

Файл ENV для конкретного режима (например, `.env.production` ) будет иметь более высокий приоритет, чем общий (например, `.env` ).

VITE всегда будет загружаться `.env` и `.env.local` в дополнение к файлу `.env.[mode]` го режима. Переменные, объявленные в файлах, специфичных для режима, будут иметь приоритет над таковыми в общих файлах, но переменные, определенные только в `.env` или `.env.local` все еще будут доступны в среде.

Кроме того, переменные среды, которые уже существуют при выполнении VITE, имеют наивысший приоритет и не будут перезаписаны `.env` файлами. Например, при запуске `VITE_SOME_KEY=123 vite build` .

`.env` файлов загружаются в начале VITE. Перезагрузите сервер после внесения изменений.

:::

Кроме того, Vite использует [Dotenv-Expand](https://github.com/motdotla/dotenv-expand) для расширения переменных, написанных в файлах ENV, из коробки. Чтобы узнать больше о синтаксисе, ознакомьтесь с [их документами](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow) .

Обратите внимание, что если вы хотите использовать `$` внутри вашей среды, вы должны избежать его с помощью `\` .

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

:::warning SECURITY NOTES

- `.env.*.local` файлов только локальные и могут содержать конфиденциальные переменные. Вы должны добавить `*.local` к своим `.gitignore` , чтобы избежать их регистрации в git.

- Поскольку любые переменные, подвергшиеся воздействию вашего исходного кода Vite, окажутся в вашем клиентском пакете, `VITE_*` переменных _не_ должны содержать какую -либо конфиденциальную информацию.

:::

::: details Expanding variables in reverse order

VITE поддерживает расширение переменных в обратном порядке.
Например, `.env` ниже будет оцениваться как `VITE_FOO=foobar` , `VITE_BAR=bar` .

```[.env]
VITE_FOO=foo${VITE_BAR}
VITE_BAR=bar
```

Это не работает в сценариях оболочки и других инструментах, таких как `docker-compose` .
Тем не менее, VITE поддерживает это поведение, так как это было поддержано `dotenv-expand` в течение долгого времени, а другие инструменты в экосистеме JavaScript используют более старые версии, которые поддерживают это поведение.

Чтобы избежать проблем с взаимодействием, рекомендуется не полагаться на это поведение. VITE может начать издавать предупреждения для этого поведения в будущем.

:::

## Intellisense для TypeScript

По умолчанию Vite предоставляет определения типа для `import.meta.env` в [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) . Несмотря на то, что вы можете определить более пользовательские переменные ENV в `.env.[mode]` файлах, вы можете получить TypeScript IntelliSense для определенных пользовательских переменных ENV, которые префикс с `VITE_` .

Чтобы достичь этого, вы можете создать каталог `vite-env.d.ts` в `src` , а затем увеличить `ImportMetaEnv` как это:

```typescript [vite-env.d.ts]
///<reference types="vite/client">

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // больше переменных Env ...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Если ваш код опирается на типы из средств браузеров, таких как [DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) и [веб -работник](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts) , вы можете обновить поле [LIB](https://www.typescriptlang.org/tsconfig#lib) в `tsconfig.json` .

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Imports will break type augmentation

Если увеличение `ImportMetaEnv` не работает, убедитесь, что у вас нет `import` операторов в `vite-env.d.ts` . Смотрите [документацию TypeScript](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined) для получения дополнительной информации.

:::

## Постоянная замена HTML

VITE также поддерживает замену констант в файлах HTML. Любые свойства в `import.meta.env` могут использоваться в файлах HTML с помощью специального синтаксиса `%CONST_NAME%` :

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

Если Env не существует в `import.meta.env` , например, `%NON_EXISTENT%` , она будет игнорирована и не заменена, в отличие от `import.meta.env.NON_EXISTENT` в JS, где она заменяется как `undefined` .

Учитывая, что VITE используется многими рамками, он преднамеренно неопинирован в отношении сложных замен, таких как условные. VITE может быть расширен с помощью [существующего плагина пользователя](https://github.com/vitejs/awesome-vite#transformers) или пользовательского плагина, который реализует [крюк `transformIndexHtml`](./api-plugin#transformindexhtml) .

## Режимы

По умолчанию Dev Server (команда `dev` ) работает в режиме `development` , а команда `build` выполняется в режиме `production` .

Это означает, что при запуске `vite build` он загрузит переменные ENV из `.env.production` , если он есть:

```[.env.production]
VITE_APP_TITLE=My App
```

В вашем приложении вы можете отображать заголовок, используя `import.meta.env.VITE_APP_TITLE` .

В некоторых случаях вы можете запустить `vite build` с другим режимом, чтобы отобразить другой заголовок. Вы можете перезаписать режим по умолчанию, используемый для команды, пропустив флаг `--mode` опции. Например, если вы хотите создать свое приложение для режима постановки:

```bash
vite build --mode staging
```

И создать файл `.env.staging` :

```[.env.staging]
VITE_APP_TITLE=My App (staging)
```

Поскольку `vite build` запускает производственную сборку по умолчанию, вы также можете изменить ее и запустить сборку разработки, используя другой режим и `.env` конфигурацию файла:

```[.env.testing]
NODE_ENV=development
```

### Node_env и режимы

Важно отметить, что `NODE_ENV` ( `process.env.NODE_ENV` ) и режимы являются двумя разными понятиями. Вот как разные команды влияют на `NODE_ENV` и режим:

| Командование                                         | Node_env        | Режим           |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

Различные значения `NODE_ENV` и режима также отражаются на соответствующих `import.meta.env` свойствах:

| Командование           | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| Командование         | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` in `.env` files

`NODE_ENV=...` может быть установлен в команде, а также в вашем `.env` файле. Если `NODE_ENV` указан в `.env.[mode]` файле, режим можно использовать для управления его значением. Тем не менее, оба `NODE_ENV` и режима остаются как две разные понятия.

Основное преимущество с `NODE_ENV=...` в команде заключается в том, что он позволяет VITE обнаружить значение на раннем этапе. Это также позволяет вам читать `process.env.NODE_ENV` в конфигурации VITE, поскольку VITE может загружать файлы ENV только после того, как конфигурация будет оценена.
:::
