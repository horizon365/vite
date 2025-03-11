# Плагины

:::tip NOTE
VITE стремится обеспечить необычную поддержку для общих моделей веб-разработки. Перед поиском плагина VITE или совместимого подключения, ознакомьтесь с [руководством по функциям](../guide/features.md) . Многие случаи, когда плагин понадобится в проекте ROLLUP, уже рассматриваются в VITE.
:::

Проверьте, [используя плагины](../guide/using-plugins) для получения информации о том, как использовать плагины.

## Официальные Плагины

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- Предоставляет Поддержку Компонентов Vue 3.

### [@vitejs/plagin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- Обеспечивает поддержку Vue 3 JSX (через [выделенное вавилочное преобразование](https://github.com/vuejs/jsx-next) ).

### [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)

- Предоставляет Vue 2.7 Поддержку Компонентов.

### [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

- Обеспечивает поддержку VUE 2.7 JSX (через [выделенное вавилочное преобразование](https://github.com/vuejs/jsx-vue2/) ).

### [@vitejs/plagin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- Использует Esbuild и Babel, достигая быстрого HMR с небольшим количеством упаковки и гибкостью способности использовать конвейер Babel Transform. Без дополнительных плагинов Вавилоны только ESBUILD используется во время сборки.

### [@vitejs/plagin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

- Заменяет Вабель на SWC во время разработки. Во время производственных сборов SWC+ESBUILD используется при использовании плагинов, а ESBUILD только в противном случае. Для крупных проектов, которые не требуют нестандартных расширений React, замена холодного запуска и горячего модуля (HMR) может быть значительно быстрее.

### [@vitejs/plagin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Обеспечивает поддержку Legacy Browsers для производственной сборки.

## Общественные Плагины

Проверьте [Awesome -vite](https://github.com/vitejs/awesome-vite#plugins) - вы также можете отправить пиар, чтобы перечислить там свои плагины.

## Плагины ROLLUP

[Плагины Vite](../guide/api-plugin) - это расширение интерфейса плагина Rollup. Ознакомьтесь [с разделом совместимости плагина Rollup](../guide/api-plugin#rollup-plugin-compatibility) для получения дополнительной информации.
