# Plugins

:::tip NOTE
A Vite visa fornecer suporte fora da caixa para padrões comuns de desenvolvimento da Web. Antes de procurar um plug -in de rollup vite ou compatível, consulte o [guia de recursos](../guide/features.md) . Muitos dos casos em que um plug -in seria necessário em um projeto de rollup já está coberto de vite.
:::

Confira [o uso de plugins](../guide/using-plugins) para obter informações sobre como usar plugins.

## Plugins Oficiais

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- Fornece Suporte De Componentes De Arquivo Único VUE 3.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- Fornece suporte JSX VUE 3 (via [Transformação de Babel dedicada](https://github.com/vuejs/jsx-next) ).

### [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)

- Fornece Suporte De Componentes De Arquivo Único VUE 2.7.

### [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

- Fornece suporte JSX VUE 2.7 (via [transformada Babel dedicada](https://github.com/vuejs/jsx-vue2/) ).

### [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- Usa Esbuild e Babel, alcançando HMR rápido com uma pequena pegada de embalagem e a flexibilidade de poder usar o pipeline de transformação Babel. Sem plug -ins Babel adicionais, apenas o ESBuild é usado durante as construções.

### [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

- Substitui Babel pelo SWC durante o desenvolvimento. Durante as compilações de produção, o SWC+ESBuild é usado ao usar plug -ins e apenas o ESBUILD. Para grandes projetos que não exigem extensões de reação não padrão, a Start Start Cold e a substituição de módulos quentes (HMR) podem ser significativamente mais rápidos.

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Fornece suporte de navegadores herdados para a construção da produção.

## Plugins Comunitários

Confira o [Awesome -Vite](https://github.com/vitejs/awesome-vite#plugins) - você também pode enviar um PR para listar seus plugins lá.

## Plugins De Rollup

[Os plug -ins de vite](../guide/api-plugin) são uma extensão da interface do plug -in da Rollup. Confira a [seção de compatibilidade do plug -in Rollup](../guide/api-plugin#rollup-plugin-compatibility) para obter mais informações.
