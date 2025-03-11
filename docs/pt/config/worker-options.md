# Opções De Trabalhador

A menos que seja indicado, as opções nesta seção são aplicadas a todos os desenvolvedores, construir e visualizar.

## worker.format

- **Tipo:** `'es' | 'iife'
- **Padrão:** `'iife'`

Formato de saída para pacote de trabalhador.

## worker.plugins

- **Tipo:** [`() => (plugin | Plugin []) [] `] (./ Shared-Options#Plugins)

Os plug -ins de vite que se aplicam aos pacotes do trabalhador. Observe que [o config.plugins](./shared-options#plugins) se aplica apenas aos trabalhadores do Dev, ele deve ser configurado aqui para construção.
A função deve retornar novas instâncias do plug -in, conforme elas são usadas nas compilações paralelas do Rollup Worker. Como tal, modificar `config.worker` opções no gancho `config` será ignorado.

## worker.rollupOptions

- **Tipo:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

Opções de rollup para construir um pacote de trabalhadores.
