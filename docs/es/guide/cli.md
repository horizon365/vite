# Interfaz De Línea De Comando

## Servidor de desarrollo

### `vite`

Inicie Vite Dev Server en el directorio actual. `vite dev` y `vite serve` son alias para `vite` .

#### Uso

```bash
vite [root]
```

#### Opción

| Opción                    |                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | Especificar el nombre de host ( `string` )                                                                                                                                                                                |
| `--port <port>`           | Especificar puerto ( `number` )                                                                                                                                                                                           |
| `--open [path]`           | Abra el navegador en la inicio (`boolean \| cadena ')                                                                                                                                                                     |
| `--cors`                  | Habilitar Cors ( `boolean` )                                                                                                                                                                                              |
| `--strictPort`            | Salir si el puerto especificado ya está en uso ( `boolean` )                                                                                                                                                              |
| `--force`                 | Forzar al optimizador a ignorar el caché y volver a superar ( `boolean` )                                                                                                                                                 |
| `-c, --config <file>`     | Use el archivo de configuración especificado ( `string` )                                                                                                                                                                 |
| `--base <path>`           | Ruta de base pública (predeterminado: `/` ) ( `string` )                                                                                                                                                                  |
| `-l, --logLevel <level>`  | Información \| advertir \| error \| silencioso ( `string` )                                                                                                                                                               |
| `--clearScreen`           | Permitir/deshabilitar la pantalla Clear cuando registra ( `boolean` )                                                                                                                                                     |
| `--configLoader <loader>` | Use `bundle` para agrupar la configuración con ESBuild, o `runner` (experimental) para procesarla en la mosca, o `native` (experimental) para cargar utilizando el tiempo de ejecución nativo (predeterminado: `bundle` ) |
| `--profile`               | Inicie el inspector de node.js de inicio (verifique [los cuellos de botella de rendimiento](/es/guide/troubleshooting#performance-bottlenecks) )                                                                          |
| `-d, --debug [feat]`      | Mostrar registros de depuración (`string \| boolean`)                                                                                                                                                                     |
| `-f, --filter <filter>`   | Registros de depuración de filtro ( `string` )                                                                                                                                                                            |
| `-m, --mode <mode>`       | Establecer el modo ENV ( `string` )                                                                                                                                                                                       |
| `-h, --help`              | Muestra opciones de CLI disponibles                                                                                                                                                                                       |
| `-v, --version`           | Mostrar número de versión                                                                                                                                                                                                 |

## Construir

### `vite build`

Construcción para la producción.

#### Uso

```bash
vite build [root]
```

#### Opción

| Opción                         |                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--target <target>`            | Target de transpilado (predeterminado: `"modules"` ) ( `string` )                                                                                |
| `--outDir <dir>`               | Directorio de salida (predeterminado: `dist` ) ( `string` )                                                                                      |
| `--assetsDir <dir>`            | Directorio bajo OutDir para colocar activos en (predeterminado: `"assets"` ) ( `string` )                                                        |
| `--assetsInlineLimit <number>` | Umbral en línea de la base de activos estáticos64 en bytes (predeterminado: `4096` ) ( `number` )                                                |
| `--ssr [entry]`                | Construir entrada especificada para la representación del lado del servidor ( `string` )                                                         |
| `--sourcemap [output]`         | Mapas de origen de salida para compilación (predeterminado: `false` ) (`boolean \| "Inline" \| "Hidden" `)                                       |
| `--minify [minifier]`          | Habilitar/deshabilitar minificación o especificar el minificador para usar (predeterminado: `"esbuild"` ) (`boolean \| "Terser" \| "Esbuild" `)  |
| `--manifest [name]`            | EMIT Build Manifest JSON (`boolean \| cadena ')                                                                                                  |
| `--ssrManifest [name]`         | EMIT SSR MANIFEST JSON (`Boolean \| cadena ')                                                                                                    |
| `--emptyOutDir`                | Forzar vacío al aire libre cuando está fuera de la raíz ( `boolean` )                                                                            |
| `-w, --watch`                  | Reconstruye cuando los módulos han cambiado en el disco ( `boolean` )                                                                            |
| `-c, --config <file>`          | Use el archivo de configuración especificado ( `string` )                                                                                        |
| `--base <path>`                | Ruta de base pública (predeterminado: `/` ) ( `string` )                                                                                         |
| `-l, --logLevel <level>`       | Información \| advertir \| error \| silencioso ( `string` )                                                                                      |
| `--clearScreen`                | Permitir/deshabilitar la pantalla Clear cuando registra ( `boolean` )                                                                            |
| `--configLoader <loader>`      | Use `bundle` para agrupar la configuración con ESBuild o `runner` (experimental) para procesarlo en la mosca (predeterminado: `bundle` )         |
| `--profile`                    | Inicie el inspector de node.js de inicio (verifique [los cuellos de botella de rendimiento](/es/guide/troubleshooting#performance-bottlenecks) ) |
| `-d, --debug [feat]`           | Mostrar registros de depuración (`string \| boolean`)                                                                                            |
| `-f, --filter <filter>`        | Registros de depuración de filtro ( `string` )                                                                                                   |
| `-m, --mode <mode>`            | Establecer el modo ENV ( `string` )                                                                                                              |
| `-h, --help`                   | Muestra opciones de CLI disponibles                                                                                                              |
| `--app`                        | Construir todos los entornos, igual que `builder: {}` ( `boolean` , experimental)                                                                |

## Otros

### `vite optimize`

Dependencias previas a los hundimientos.

**Deprecido** : el proceso previo al final se ejecuta automáticamente y no es necesario llamar.

#### Uso

```bash
vite optimize [root]
```

#### Opción

| Opción                    |                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--force`                 | Forzar al optimizador a ignorar el caché y volver a superar ( `boolean` )                                                                |
| `-c, --config <file>`     | Use el archivo de configuración especificado ( `string` )                                                                                |
| `--base <path>`           | Ruta de base pública (predeterminado: `/` ) ( `string` )                                                                                 |
| `-l, --logLevel <level>`  | Información \| advertir \| error \| silencioso ( `string` )                                                                              |
| `--clearScreen`           | Permitir/deshabilitar la pantalla Clear cuando registra ( `boolean` )                                                                    |
| `--configLoader <loader>` | Use `bundle` para agrupar la configuración con ESBuild o `runner` (experimental) para procesarlo en la mosca (predeterminado: `bundle` ) |
| `-d, --debug [feat]`      | Mostrar registros de depuración (`string \| boolean`)                                                                                    |
| `-f, --filter <filter>`   | Registros de depuración de filtro ( `string` )                                                                                           |
| `-m, --mode <mode>`       | Establecer el modo ENV ( `string` )                                                                                                      |
| `-h, --help`              | Muestra opciones de CLI disponibles                                                                                                      |

### `vite preview`

Vista previa localmente la construcción de producción. No use esto como servidor de producción, ya que no está diseñado para ello.

#### Uso

```bash
vite preview [root]
```

#### Opción

| Opción                    |                                                                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | Especificar el nombre de host ( `string` )                                                                                               |
| `--port <port>`           | Especificar puerto ( `number` )                                                                                                          |
| `--strictPort`            | Salir si el puerto especificado ya está en uso ( `boolean` )                                                                             |
| `--open [path]`           | Abra el navegador en la inicio (`boolean \| cadena ')                                                                                    |
| `--outDir <dir>`          | Directorio de salida (predeterminado: `dist` ) ( `string` )                                                                              |
| `-c, --config <file>`     | Use el archivo de configuración especificado ( `string` )                                                                                |
| `--base <path>`           | Ruta de base pública (predeterminado: `/` ) ( `string` )                                                                                 |
| `-l, --logLevel <level>`  | Información \| advertir \| error \| silencioso ( `string` )                                                                              |
| `--clearScreen`           | Permitir/deshabilitar la pantalla Clear cuando registra ( `boolean` )                                                                    |
| `--configLoader <loader>` | Use `bundle` para agrupar la configuración con ESBuild o `runner` (experimental) para procesarlo en la mosca (predeterminado: `bundle` ) |
| `-d, --debug [feat]`      | Mostrar registros de depuración (`string \| boolean`)                                                                                    |
| `-f, --filter <filter>`   | Registros de depuración de filtro ( `string` )                                                                                           |
| `-m, --mode <mode>`       | Establecer el modo ENV ( `string` )                                                                                                      |
| `-h, --help`              | Muestra opciones de CLI disponibles                                                                                                      |
