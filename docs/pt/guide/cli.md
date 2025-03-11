# Interface Da Linha De Comando

## Servidor de dev

### `vite`

Inicie o servidor de dev vite no diretório atual. `vite dev` e `vite serve` são aliases para `vite` .

#### Uso

```bash
vite [root]
```

#### Opções

| Opções                    |                                                                                                                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | Especifique o nome do host ( `string` )                                                                                                                                                                          |
| `--port <port>`           | Especifique a porta ( `number` )                                                                                                                                                                                 |
| `--open [path]`           |                                                                                                                                                                                                                  |
| `--cors`                  | Ativar cors ( `boolean` )                                                                                                                                                                                        |
| `--strictPort`            | Saia se a porta especificada já estiver em uso ( `boolean` )                                                                                                                                                     |
| `--force`                 | Forçar o otimizador a ignorar o cache e re-Bundle ( `boolean` )                                                                                                                                                  |
| `-c, --config <file>`     | Use o arquivo de configuração especificado ( `string` )                                                                                                                                                          |
| `--base <path>`           | Caminho da base pública (padrão: `/` ) ( `string` )                                                                                                                                                              |
| `-l, --logLevel <level>`  | informações \| avisar \| erro \| silencioso ( `string` )                                                                                                                                                         |
| `--clearScreen`           | Permitir/desativar a tela clara ao registrar ( `boolean` )                                                                                                                                                       |
| `--configLoader <loader>` | Use `bundle` para agrupar a configuração com ESBuild, ou `runner` (experimental) para processá -la em tempo real, ou `native` (experimental) para carregar usando o tempo de execução nativo (padrão: `bundle` ) |
| `--profile`               | Iniciar o inspetor Node.js embutido (marcar [gargalos de desempenho](/pt/guide/troubleshooting#performance-bottlenecks) )                                                                                        |
| `-d, --debug [feat]`      | Mostrar logs de depuração (`string \| booleano ')                                                                                                                                                                |
| `-f, --filter <filter>`   | Filtro de depuração Logs ( `string` )                                                                                                                                                                            |
| `-m, --mode <mode>`       | Definir modo Env ( `string` )                                                                                                                                                                                    |
| `-h, --help`              | Exibir opções de CLI disponíveis                                                                                                                                                                                 |
| `-v, --version`           | Exibir o número da versão                                                                                                                                                                                        |

## Construir

### `vite build`

Construir para produção.

#### Uso

```bash
vite build [root]
```

#### Opções

| Opções                         |                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `--target <target>`            | Target de transpilação (Padrão: `"modules"` ) ( `string` )                                                                          |
| `--outDir <dir>`               |                                                                                                                                     |
| `--assetsDir <dir>`            | Diretório em Ultir para colocar ativos em (Padrão: `"assets"` ) ( `string` )                                                        |
| `--assetsInlineLimit <number>` | Limite em linha de ativo estático64 em bytes (padrão: `4096` ) ( `number` )                                                         |
| `--ssr [entry]`                | Construir entrada especificada para renderização do lado do servidor ( `string` )                                                   |
| `--sourcemap [output]`         | Mapas de origem de saída para construção (padrão: `false` ) (`boolean \| "em linha" \| "Hidden" `)                                  |
| `--minify [minifier]`          | Ativar/desativar a minificação, ou especificar minifier para usar (padrão: `"esbuild"` ) (`boolean \| "TERSER" \| "Esbuild" `)      |
| `--manifest [name]`            | Emitir construção manifest json (`boolean \| string`)                                                                               |
| `--ssrManifest [name]`         | Emiti ssr manifesto json (`boolean \| string`)                                                                                      |
| `--emptyOutDir`                | Forçar o deslocamento vazio quando está fora da raiz ( `boolean` )                                                                  |
| `-w, --watch`                  | Reconstruir quando os módulos mudaram no disco ( `boolean` )                                                                        |
| `-c, --config <file>`          | Use o arquivo de configuração especificado ( `string` )                                                                             |
| `--base <path>`                | Caminho da base pública (padrão: `/` ) ( `string` )                                                                                 |
| `-l, --logLevel <level>`       | Informações \| avisar \| erro \| silencioso ( `string` )                                                                            |
| `--clearScreen`                | Permitir/desativar a tela clara ao registrar ( `boolean` )                                                                          |
| `--configLoader <loader>`      | Use `bundle` para agrupar a configuração com Esbuild ou `runner` (experimental) para processá -la em tempo real (padrão: `bundle` ) |
| `--profile`                    | Iniciar o inspetor Node.js embutido (marcar [gargalos de desempenho](/pt/guide/troubleshooting#performance-bottlenecks) )           |
| `-d, --debug [feat]`           | Mostrar logs de depuração (`string \| booleano ')                                                                                   |
| `-f, --filter <filter>`        | Filtro de depuração Logs ( `string` )                                                                                               |
| `-m, --mode <mode>`            | Definir modo Env ( `string` )                                                                                                       |
| `-h, --help`                   | Exibir opções de CLI disponíveis                                                                                                    |
| `--app`                        | Construa todos os ambientes, o mesmo que `builder: {}` ( `boolean` , experimental)                                                  |

## Outros

### `vite optimize`

Dependências pré-Bundle.

**Despregado** : o processo pré-Bundle é executado automaticamente e não precisa ser chamado.

#### Uso

```bash
vite optimize [root]
```

#### Opções

| Opções                    |                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `--force`                 | Forçar o otimizador a ignorar o cache e re-Bundle ( `boolean` )                                                                     |
| `-c, --config <file>`     | Use o arquivo de configuração especificado ( `string` )                                                                             |
| `--base <path>`           | Caminho da base pública (padrão: `/` ) ( `string` )                                                                                 |
| `-l, --logLevel <level>`  | Informações \| avisar \| erro \| silencioso ( `string` )                                                                            |
| `--clearScreen`           | Permitir/desativar a tela clara ao registrar ( `boolean` )                                                                          |
| `--configLoader <loader>` | Use `bundle` para agrupar a configuração com Esbuild ou `runner` (experimental) para processá -la em tempo real (padrão: `bundle` ) |
| `-d, --debug [feat]`      | Mostrar logs de depuração (`string \|                                                                                               |
| `-f, --filter <filter>`   | Filtro de depuração Logs ( `string` )                                                                                               |
| `-m, --mode <mode>`       | Definir modo Env ( `string` )                                                                                                       |
| `-h, --help`              | Exibir opções de CLI disponíveis                                                                                                    |

### `vite preview`

Visualize localmente a construção da produção. Não use isso como um servidor de produção, pois não foi projetado para ele.

#### Uso

```bash
vite preview [root]
```

#### Opções

| Opções                    |                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | Especifique o nome do host ( `string` )                                                                                             |
| `--port <port>`           | Especifique a porta ( `number` )                                                                                                    |
| `--strictPort`            | Saia se a porta especificada já estiver em uso ( `boolean` )                                                                        |
| `--open [path]`           | Navegador aberto na startup (`boolean \| string`)                                                                                   |
| `--outDir <dir>`          | Diretório de saída (Padrão: `dist` ) ( `string` )                                                                                   |
| `-c, --config <file>`     | Use o arquivo de configuração especificado ( `string` )                                                                             |
| `--base <path>`           | Caminho da base pública (padrão: `/` ) ( `string` )                                                                                 |
| `-l, --logLevel <level>`  | Informações \| avisar \| erro \| silencioso ( `string` )                                                                            |
| `--clearScreen`           | Permitir/desativar a tela clara ao registrar ( `boolean` )                                                                          |
| `--configLoader <loader>` | Use `bundle` para agrupar a configuração com Esbuild ou `runner` (experimental) para processá -la em tempo real (padrão: `bundle` ) |
| `-d, --debug [feat]`      | Mostrar logs de depuração (`string \| booleano ')                                                                                   |
| `-f, --filter <filter>`   | Filtro de depuração Logs ( `string` )                                                                                               |
| `-m, --mode <mode>`       | Definir modo Env ( `string` )                                                                                                       |
| `-h, --help`              | Exibir opções de CLI disponíveis                                                                                                    |
