# Plugins

:::tip NOTE
VITE zielt darauf ab, außergewöhnliche Unterstützung für gemeinsame Webentwicklungsmuster zu unterstützen. Bevor Sie nach einem vite- oder kompatiblen Rollup -Plugin suchen, lesen Sie die [Features -Handbuch](../guide/features.md) . Viele der Fälle, in denen ein Plugin in einem Rollup -Projekt benötigt wird, sind bereits in vite behandelt.
:::

Überprüfen Sie [die Plugins](../guide/using-plugins) , um Informationen zur Verwendung von Plugins zu erhalten.

## Offizielle Plugins

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- Bietet Vue 3 -Einzeldateikomponenten Unterstützung.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- Bietet Vue 3 JSX -Unterstützung (über [dedizierte Babel -Transformation](https://github.com/vuejs/jsx-next) ).

### [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)

- Bietet VUE 2.7 Einzeldateikomponenten Unterstützung.

### [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

- Bietet VUE 2.7 JSX -Unterstützung (über [dedizierte Babel -Transformation](https://github.com/vuejs/jsx-vue2/) ).

### [@vitejs/Plugin-React](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- Verwendet Esbuild und Babel und erreicht schnelle HMR mit einem kleinen Paket -Fußabdruck und der Flexibilität, die Babel -Transformationspipeline zu verwenden. Ohne zusätzliche Babel -Plugins wird nur ESBuild während der Builds verwendet.

### [@vitejs/Plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

- Ersetzt Babel durch SWC während der Entwicklung. Während der Produktionsergebnisse werden SWC+ESBUILD bei Verwendung von Plugins und ESBuild nur anders verwendet. Für große Projekte, bei denen keine nicht standardmäßigen Reaktionen erforderlich sind, können Kaltstart und HOT-Modulersatz (HMR) erheblich schneller sein.

### [@vitejs/Plugin-Legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Bietet Legacy Browsers Support für den Produktionsbau.

## Community -Plugins

Schauen Sie sich [Awesome -Vite](https://github.com/vitejs/awesome-vite#plugins) an - Sie können auch eine PR einreichen, um Ihre Plugins dort aufzulisten.

## Rollup -Plugins

[VITE -Plugins](../guide/api-plugin) sind eine Erweiterung der Plugin -Schnittstelle von Rollup. Weitere Informationen finden Sie [im Abschnitt "Rollup -Plugin -Kompatibilität"](../guide/api-plugin#rollup-plugin-compatibility) .
