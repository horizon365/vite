# Complementos

:::tip NOTE
VITE tiene como objetivo proporcionar soporte listos para los patrones de desarrollo web comunes. Antes de buscar un complemento de acumulación vite o compatible, consulte la [guía de características](../guide/features.md) . Muchos de los casos en que se necesitaría un complemento en un proyecto de rollups ya están cubiertos en VITE.
:::

Consulte [el uso de complementos](../guide/using-plugins) para obtener información sobre cómo usar complementos.

## Complementos Oficiales

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- Proporciona Soporte De Componentes De Archivo Único Vue 3.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- Proporciona soporte VUE 3 JSX (a través de [la transformación dedicada de Babel](https://github.com/vuejs/jsx-next) ).

### [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)

- Proporciona Soporte De Componentes De Un Solo Archivo VUE 2.7.

### [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

- Proporciona soporte VUE 2.7 JSX (a través de [la transformación dedicada de Babel](https://github.com/vuejs/jsx-vue2/) ).

### [@VITEJS/Plugin-React](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- Utiliza ESBuild y Babel, logrando HMR rápido con una pequeña huella de paquete y la flexibilidad de poder usar la tubería de transformación Babel. Sin complementos adicionales de Babel, solo se usa ESBuild durante las compilaciones.

### [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

- Reemplaza a Babel con SWC durante el desarrollo. Durante las compilaciones de producción, SWC+ESBuild se usa cuando se usa complementos, y ESBuild solo de lo contrario. Para grandes proyectos que no requieren extensiones no estándar, el inicio en frío y el reemplazo del módulo caliente (HMR) pueden ser significativamente más rápidos.

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Proporciona soporte de navegadores heredados para la construcción de producción.

## Complementos Comunitarios

Consulte [Awesome -Vite](https://github.com/vitejs/awesome-vite#plugins) : también puede enviar un PR para enumerar sus complementos allí.

## Complementos

[Los complementos VITE](../guide/api-plugin) son una extensión de la interfaz de complemento de Rollup. Consulte la [sección de compatibilidad del complemento de Rollup](../guide/api-plugin#rollup-plugin-compatibility) para obtener más información.
