# Opciones De Trabajadores

A menos que se indique, las opciones en esta sección se aplican a todos los desarrollo, compilación y vista previa.

## worker.format

- **Tipo:** '' Es ' | 'iife' '
- **Valor predeterminado:** `'iife'`

Formato de salida para el paquete de trabajadores.

## worker.plugins

- **Tipo:** [`() => (complemento | Complemento []) [] `] (./ Complementos De#Opciones Compartidas)

Complementos vitados que se aplican a los paquetes de trabajadores. Tenga en cuenta que [config.plugins](./shared-options#plugins) solo se aplica a los trabajadores en Dev, debe configurarse aquí en su lugar para la compilación.
La función debe devolver nuevas instancias de complemento, ya que se usan en compilaciones de trabajadores enrollados paralelos. Como tal, se ignorará la modificación de `config.worker` opciones en el `config` gancho.

## worker.rollupOptions

- **Tipo:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

Opciones de rollup para construir trabajadores.
