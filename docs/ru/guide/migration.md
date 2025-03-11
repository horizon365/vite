# Миграция из V5

## Окружающая среда API

В рамках новой экспериментальной [среды API](/en/guide/api-environment.md) потребовался большой внутренний рефакторинг. VITE 6 стремится избежать нарушения изменений, чтобы большинство проектов могли быстро перейти на новую специальность. Мы подождем, пока большая часть экосистемы не перенесена на стабилизацию и начнете рекомендовать использование новых API. Там могут быть некоторые краевые случаи, но они должны влиять только на использование низкого уровня в рамках и инструментах. Мы работали с сопровождающими в экосистеме, чтобы смягчить эти различия перед выпуском. Пожалуйста, [откройте проблему,](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml) если вы заметите регрессию.

Некоторые внутренние API были удалены из -за изменений в реализации VITE. Если вы полагались на один из них, пожалуйста, создайте [запрос на функцию](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml) .

## Vite Runtime API

Экспериментальный API выполнения Vite Erunting превратился в API модуля, выпущенный в Vite 6 как часть нового [API экспериментальной среды](/en/guide/api-environment) . Учитывая, что эта функция была экспериментальной, удаление предыдущего API, представленного в VITE 5.1, не является нарушением, но пользователи должны будут обновить их использование для эквивалента «Бегущего модуля» как часть миграции в VITE 6.

## Общие Изменения

### Значение по умолчанию для `resolve.conditions`

Это изменение не влияет на пользователей, которые не [`ssr.resolve.externalConditions`](/en/config/ssr-options#ssr-resolve-externalconditions) [`resolve.conditions`](/en/config/shared-options#resolve-conditions) [`ssr.resolve.conditions`](/en/config/ssr-options#ssr-resolve-conditions)

В Vite 5 значение по умолчанию для `resolve.conditions` было `[]` , а некоторые условия были добавлены внутри. Значение по умолчанию для `ssr.resolve.conditions` было значением `resolve.conditions` .

Из Vite 6 некоторые условия больше не добавляются внутри и должны быть включены в значения конфигурации.
Условия, которые больше не добавляются внутри

- `resolve.conditions` - «['модуль», «браузер», «Разработка|Производство '] `
- `ssr.resolve.conditions` - «['модуль», «Узел», «Разработка|Производство '] `

Значения по умолчанию для этих параметров обновляются до соответствующих значений, а `ssr.resolve.conditions` больше не использует `resolve.conditions` в качестве значения по умолчанию. Обратите внимание, что разработка|Производство `is a special variable that is replaced with` Производство `or` Разработка `depending on the value of` Process.env.Node_env `. These default values are exported from ` Vite `as` DefaultClientConditions `and` DefaultserverConditions`.

Если вы указали пользовательское значение для `resolve.conditions` или `ssr.resolve.conditions` , вам необходимо обновить его, чтобы включить новые условия.
Например, если вы ранее указали `['custom']` для `resolve.conditions` , вам нужно указать `['custom', ...defaultClientConditions]` вместо этого.

### Json stringify

В Vite 5, когда [`json.stringify: true`](/en/config/shared-options#json-stringify) установлено, [`json.namedExports`](/en/config/shared-options#json-namedexports) был отключен.

Из Vite 6, даже когда `json.stringify: true` установлено, `json.namedExports` не отключено, а значение уважается. Если вы хотите достичь предыдущего поведения, вы можете установить `json.namedExports: false` .

VITE 6 также вводит новое значение по умолчанию для `json.stringify` , которое равно `'auto'` , которое будет строить только большие файлы JSON. Чтобы отключить это поведение, установите `json.stringify: false` .

### Расширенная поддержка ссылок на активы в HTML -элементах

В Vite 5 лишь несколько поддерживаемых HTML -элементов были способны ссылаться на активы, которые будут обработаны и связаны с помощью VITE, таких как `<link href>` , `<img src>` т. Д. И т. Д.

VITE 6 расширяет поддержку еще более HTML -элементам. Полный список можно найти в документах [HTML](/en/guide/features.html#html) .

Чтобы отказаться от обработки HTML по определенным элементам, вы можете добавить атрибут `vite-ignore` в элемент.

### Postcss-Load-Config

[`postcss-load-config`](https://npmjs.com/package/postcss-load-config) был обновлен до V6 от V4. [`tsx`](https://www.npmjs.com/package/tsx) или [`jiti`](https://www.npmjs.com/package/jiti) теперь требуются для загрузки файлов конфигурации PostCSS TypeScript вместо [`ts-node`](https://www.npmjs.com/package/ts-node) . Также [`yaml`](https://www.npmjs.com/package/yaml) теперь необходимо загрузить файлы конфигурации YAML PostCSS.

### SASS теперь использует современный API по умолчанию

В Vite 5 Legacy API использовался по умолчанию для SASS. VITE 5.4 Добавлена поддержка современного API.

Из Vite 6 современный API используется по умолчанию для SASS. Если вы хотите использовать API Legacy, вы можете [`css.preprocessorOptions.scss.api: 'legacy'` `css.preprocessorOptions.sass.api: 'legacy'`](/en/config/shared-options#css-preprocessoroptions) . Но обратите внимание, что поддержка API Legacy будет удалена в Vite 7.

Чтобы мигрировать в современный API, см. [Документацию SASS](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/) .

### Настроить имя выходного файла CSS в режиме библиотеки

В Vite 5 имя выходного файла CSS в режиме библиотеки всегда было `style.css` и не может быть легко изменено через конфигурацию VITE.

Из Vite 6 имя файла по умолчанию теперь использует `"name"` в `package.json` , аналогично выходным файлам JS. Если [`build.lib.fileName`](/en/config/build-options.md#build-lib) установлено с помощью строки, значение также будет использоваться для имени выходного файла CSS. Чтобы явно установить другое имя файла CSS, вы можете использовать новый [`build.lib.cssFileName`](/en/config/build-options.md#build-lib) для его настройки.

Чтобы мигрировать, если вы полагались на имя `style.css` файла, вы должны обновить ссылки на его новое имя на основе имени вашего пакета. Например:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

Если вы предпочитаете придерживаться `style.css` , как в Vite 5, вы можете установить `build.lib.cssFileName: 'style'` вместо этого.

## Передовой

Существуют другие нарушения, которые затрагивают лишь немногих пользователей.

- [[#17922] Исправлено (CSS)!: Удалить импорт по умолчанию в SSR Dev](https://github.com/vitejs/vite/pull/17922)
  - Поддержка импорта файлов CSS по умолчанию была [устарела в Vite 4](https://v4.vite.dev/guide/migration.html#importing-css-as-a-string) и удалена в Vite 5, но он все еще непреднамеренно поддерживался в режиме SSR DEV. Эта поддержка теперь удалена.
- [[#15637] исправить!: По умолчанию `build.cssMinify` до `'esbuild'` для SSR](https://github.com/vitejs/vite/pull/15637)
  - [`build.cssMinify`](/en/config/build-options#build-cssminify) теперь включена по умолчанию даже для сборки SSR.
- [[#18070] Feat!: Прокси -прокси -обход с WebSocket](https://github.com/vitejs/vite/pull/18070)
  - `server.proxy[path].bypass` теперь требуется для запросов на обновление WebSocket, и в этом случае параметр `res` будет `undefined` .
- [[#18209] Refactor!: Bump Minimal Terser версия до 5.16.0](https://github.com/vitejs/vite/pull/18209)
  - Минимальная поддерживаемая версия Terser для [`build.minify: 'terser'`](/en/config/build-options#build-minify) была увеличена до 5.16.0 с 5.4.0.
- [[#18231] Крута (DEPS): обновить зависимость @RULLUP/PLUGIN-CommonJS TO V28](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires) теперь `true` по умолчанию (было `'auto'` ранее).
    - Это может привести к большим размерам пучка, но приведет к более детерминированным сборкам.
    - Если вы указываете файл CommonJS в качестве точки входа, вам могут понадобиться дополнительные шаги. Прочитайте [документацию плагина CommonJS](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#using-commonjs-files-as-entry-points) для получения более подробной информации.
- [[#18243] Крута (DEPS)!: Мигрируйте `fast-glob` до `tinyglobby`](https://github.com/vitejs/vite/pull/18243)
  - Брекеты диапазона ( `{01..03}` ⇒ `['01', '02', '03']` ) и инкрементные скобки ( `{2..8..2}` ⇒ `['2', '4', '6', '8']` ) больше не поддерживаются в глобусах.
- [[#18395] Feat (Resolve)!: Разрешить условия удаления](https://github.com/vitejs/vite/pull/18395)
  - Этот PR не только вводит нарушающее изменение, упомянутое выше как «значение по умолчанию для `resolve.conditions` », но также делает `resolve.mainFields` , чтобы не использоваться для неэверно-повторных зависимостей в SSR. Если вы использовали `resolve.mainFields` и хотите применить это к неэверсированным зависимостям в SSR, вы можете использовать [`ssr.resolve.mainFields`](/en/config/ssr-options#ssr-resolve-mainfields) .
- [[#18493] Refactor!: Удалить опцию fs.cachedchecks](https://github.com/vitejs/vite/pull/18493)
  - Эта оптимизация была удалена из-за краевых случаев при написании файла в кэшированной папке и немедленно импортировал его.
- ~~[[#18697] Исправлено (DEPS)!: Обновление зависимости DOTENV-EXPAND TO V12](https://github.com/vitejs/vite/pull/18697)~~
  - ~~Переменные, используемые в интерполяции, должны быть объявлены перед интерполяцией сейчас. Для получения более подробной информации см. [`dotenv-expand` изменятелей](https://github.com/motdotla/dotenv-expand/blob/v12.0.1/CHANGELOG.md#1200-2024-11-16) .~~ Это нарушающее изменение было возвращено в V6.1.0.
- [[#16471] Подвиг: V6 - API окружающей среды](https://github.com/vitejs/vite/pull/16471)

  - Обновления модуля только SSR больше не запускают полную перезагрузку страницы в клиенте. Чтобы вернуться к предыдущему поведению, можно использовать пользовательский плагин Vite:
    <details>
    <summary>Нажмите, чтобы развернуть пример</summary>

    ```ts twoslash
    import type { Plugin, EnvironmentModuleNode } from 'vite'

    function hmrReload(): Plugin {
      return {
        name: 'hmr-reload',
        enforce: 'post',
        hotUpdate: {
          order: 'post',
          handler({ modules, server, timestamp }) {
            if (this.environment.name !== 'ssr') return

            let hasSsrOnlyModules = false

            const invalidatedModules = new Set<EnvironmentModuleNode>()
            for (const mod of modules) {
              if (mod.id == null) continue
              const clientModule =
                server.environments.client.moduleGraph.getModuleById(mod.id)
              if (clientModule != null) continue

              this.environment.moduleGraph.invalidateModule(
                mod,
                invalidatedModules,
                timestamp,
                true,
              )
              hasSsrOnlyModules = true
            }

            if (hasSsrOnlyModules) {
              server.ws.send({ type: 'full-reload' })
              return []
            }
          },
        },
      }
    }
    ```

    </details>

## Миграция из V4

Сначала проверьте [миграцию из руководства V4](https://v5.vite.dev/guide/migration.html) в документах VITE V5, чтобы увидеть необходимые изменения для переноса вашего приложения в VITE 5, а затем перейдите к изменениям на этой странице.
