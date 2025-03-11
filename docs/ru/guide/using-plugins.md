# Использование Плагинов

VITE может быть расширен с помощью плагинов, которые основаны на хорошо разработанном интерфейсе плагина Rollup с несколькими дополнительными параметрами, специфичными для VITE. Это означает, что пользователи VITE могут полагаться на зрелую экосистему плагинов ROLLUP, а также возможность расширить функциональность DEV и функциональность SSR по мере необходимости.

## Добавление плагина

Чтобы использовать плагин, его необходимо добавить в `devDependencies` проекта и включить в массив `plugins` в файле `vite.config.js` конфигурации. Например, чтобы обеспечить поддержку унаследованных браузеров, можно использовать официальный [@vitejs/плагин-легачность](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) :

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

`plugins` также принимает пресеты, включая несколько плагинов в качестве одного элемента. Это полезно для сложных функций (например, интеграция Framework), которые реализованы с использованием нескольких плагинов. Массив будет сплющен внутри.

Фалисовые плагины будут игнорироваться, которые можно использовать для легкости активации или деактивации плагинов.

## Поиск Плагинов

:::tip NOTE
VITE стремится обеспечить необычную поддержку для общих моделей веб-разработки. Перед поиском плагина VITE или совместимого подключения, ознакомьтесь с [руководством по функциям](../guide/features.md) . Многие случаи, когда плагин понадобится в проекте ROLLUP, уже рассматриваются в VITE.
:::

Проверьте [раздел плагинов](../plugins/) для получения информации о официальных плагинах. Общественные плагины перечислены в [Awesome-Vite](https://github.com/vitejs/awesome-vite#plugins) .

Вы также можете найти плагины, которые следуют [рекомендуемым конвенциям,](./api-plugin.md#conventions) используя [NPM Search для Vite-Plugin](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity) для плагинов Vite или [NPM Search для Pllup-Plugin](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) для плагинов Rollup.

## Обеспечение Заказа Плагина

Для совместимости с некоторыми плагинами ROLLUP может потребоваться применение порядка плагина или применения только во время сборки. Это должно быть детализацией реализации для плагинов VITE. Вы можете обеспечить положение плагина с модификатором `enforce` :

- `pre` : плагин вызове перед плагинами Vite Core
- По умолчанию: плагин вызове после плагинов Vite Core
- `post` : плагин вызове после плагинов Vite Build

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

Проверьте [руководство API плагинов](./api-plugin.md#plugin-ordering) для подробной информации.

## Условное Применение

По умолчанию плагины вызываются как для подачи, так и для сборки. В тех случаях, когда плагин должен применяться только во время подачи или строительства, используйте свойство `apply` , чтобы вызвать их только в течение `'build'` или `'serve'` :

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

## Строительные Плагины

Проверьте [руководство API плагинов](./api-plugin.md) для документации о создании плагинов.
