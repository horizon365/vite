# Befehlszeilenschnittstelle

## Dev Server

### `vite`

Starten Sie Vite Dev Server im aktuellen Verzeichnis. `vite dev` und `vite serve` sind Aliase für `vite` .

#### Verwendung

```bash
vite [root]
```

#### Optionen

| Optionen                  |                                                                                                                                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | Geben Sie Hostname ( `string` ) an                                                                                                                                                                              |
| `--port <port>`           | Anschluss angeben ( `number` )                                                                                                                                                                                  |
| `--open [path]`           | Öffnen Sie den Browser beim Start (`boolean \ \| String`))                                                                                                                                                      |
| `--cors`                  | CORS aktivieren ( `boolean` )                                                                                                                                                                                   |
| `--strictPort`            | Beenden Sie, wenn der angegebene Port bereits verwendet wird ( `boolean` )                                                                                                                                      |
| `--force`                 | Erzwingen Sie den Optimierer, den Cache und den Neuzubeuteln zu ignorieren ( `boolean` )                                                                                                                        |
| `-c, --config <file>`     | Verwenden Sie die angegebene Konfigurationsdatei ( `string` )                                                                                                                                                   |
| `--base <path>`           | Öffentlicher Basispfad (Standard: `/` ) ( `string` )                                                                                                                                                            |
| `-l, --logLevel <level>`  | Info \| warnen \| Fehler \| still ( `string` )                                                                                                                                                                  |
| `--clearScreen`           | Löschlichen Bildschirm bei der Protokollierung ( `boolean` ) zulassen/deaktivieren.                                                                                                                             |
| `--configLoader <loader>` | Verwenden Sie `bundle` , um die Konfiguration mit ESBuild oder `runner` (experimentell) zu bündeln, um sie im laufenden oder `native` (experimentellen) mit der nativen Laufzeit zu laden (Standard: `bundle` ) |
| `--profile`               | Starten Sie eingebaute Node.js Inspector (Überprüfen Sie [die Performance-Engpässe](/de/guide/troubleshooting#performance-bottlenecks) )                                                                        |
| `-d, --debug [feat]`      | Zeigen Sie Debug -Protokolle (`String \| boolean`)                                                                                                                                                              |
| `-f, --filter <filter>`   | Filter -Debug -Protokolle ( `string` )                                                                                                                                                                          |
| `-m, --mode <mode>`       | Setzen Sie den Env -Modus ( `string` )                                                                                                                                                                          |
| `-h, --help`              | Zeigen Sie die verfügbaren CLI -Optionen an                                                                                                                                                                     |
| `-v, --version`           | Versionsnummer anzeigen                                                                                                                                                                                         |

## Bauen

### `vite build`

Für die Produktion bauen.

#### Verwendung

```bash
vite build [root]
```

#### Optionen

| Optionen                       |                                                                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--target <target>`            | Transpilieren Sie Ziel (Standard: `"modules"` ) ( `string` )                                                                                                         |
| `--outDir <dir>`               | Ausgabeverzeichnis (Standard: `dist` ) ( `string` )                                                                                                                  |
| `--assetsDir <dir>`            | Verzeichnis unter Outdir, um Vermögenswerte in (Standard: `"assets"` ) ( `string` ) zu platzieren                                                                    |
| `--assetsInlineLimit <number>` | Statische Asset Base64 Inline -Schwelle in Bytes (Standard: `4096` ) ( `number` )                                                                                    |
| `--ssr [entry]`                | Erstellen Sie den angegebenen Eintrag für das serverseitige Rendering ( `string` )                                                                                   |
| `--sourcemap [output]`         | Ausgangsquellenkarten für Build (Standard: `false` ) (`boolean \| "im Einklang" \| "versteckt" ")                                                                    |
| `--minify [minifier]`          | Minifikation aktivieren/deaktivieren oder einen Minifikator angeben (Standard: `"esbuild"` ) (`boolean \| "terser" \| "Esbuild" `)                                   |
| `--manifest [name]`            | MIT BAUS OFFEST JSON (`boolean \ \| String`))                                                                                                                        |
| `--ssrManifest [name]`         | SSR Manifest JSON (`boolean \ \| String`))                                                                                                                           |
| `--emptyOutDir`                | Erzwingen Sie leer im Freien, wenn es außerhalb der Wurzel ist ( `boolean` )                                                                                         |
| `-w, --watch`                  | Wiederaufbau, wenn sich Module auf der Festplatte geändert haben ( `boolean` )                                                                                       |
| `-c, --config <file>`          | Verwenden Sie die angegebene Konfigurationsdatei ( `string` )                                                                                                        |
| `--base <path>`                | Öffentlicher Basispfad (Standard: `/` ) ( `string` )                                                                                                                 |
| `-l, --logLevel <level>`       | Info \| warnen \| Fehler \| still ( `string` )                                                                                                                       |
| `--clearScreen`                | Löschlichen Bildschirm bei der Protokollierung ( `boolean` ) zulassen/deaktivieren.                                                                                  |
| `--configLoader <loader>`      | Verwenden Sie `bundle` , um die Konfiguration mit ESBuild oder `runner` (experimentell) zu bündeln, um sie im laufenden Fliegen zu verarbeiten (Standard: `bundle` ) |
| `--profile`                    | Starten Sie eingebaute Node.js Inspector (Überprüfen Sie [die Performance-Engpässe](/de/guide/troubleshooting#performance-bottlenecks) )                             |
| `-d, --debug [feat]`           | Zeigen Sie Debug -Protokolle (`String \| boolean`)                                                                                                                   |
| `-f, --filter <filter>`        | Filter -Debug -Protokolle ( `string` )                                                                                                                               |
| `-m, --mode <mode>`            | Setzen Sie den Env -Modus ( `string` )                                                                                                                               |
| `-h, --help`                   | Zeigen Sie die verfügbaren CLI -Optionen an                                                                                                                          |
| `--app`                        | Bauen Sie alle Umgebungen auf, wie `builder: {}` ( `boolean` , experimentell)                                                                                        |

## Andere

### `vite optimize`

Abhängigkeiten vor der Bündel.

**Veraltet** : Der Vor-Bundle-Prozess wird automatisch ausgeführt und muss nicht aufgerufen werden.

#### Verwendung

```bash
vite optimize [root]
```

#### Optionen

| Optionen                  |                                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--force`                 | Erzwingen Sie den Optimierer, den Cache und den Neuzubeuteln zu ignorieren ( `boolean` )                                                                             |
| `-c, --config <file>`     | Verwenden Sie die angegebene Konfigurationsdatei ( `string` )                                                                                                        |
| `--base <path>`           | Öffentlicher Basispfad (Standard: `/` ) ( `string` )                                                                                                                 |
| `-l, --logLevel <level>`  | Info \| warnen \| Fehler \| still ( `string` )                                                                                                                       |
| `--clearScreen`           | Löschlichen Bildschirm bei der Protokollierung ( `boolean` ) zulassen/deaktivieren.                                                                                  |
| `--configLoader <loader>` | Verwenden Sie `bundle` , um die Konfiguration mit ESBuild oder `runner` (experimentell) zu bündeln, um sie im laufenden Fliegen zu verarbeiten (Standard: `bundle` ) |
| `-d, --debug [feat]`      | Zeigen Sie Debug -Protokolle (`String \| boolean`)                                                                                                                   |
| `-f, --filter <filter>`   | Filter -Debug -Protokolle ( `string` )                                                                                                                               |
| `-m, --mode <mode>`       | Setzen Sie den Env -Modus ( `string` )                                                                                                                               |
| `-h, --help`              | Zeigen Sie die verfügbaren CLI -Optionen an                                                                                                                          |

### `vite preview`

Lokal Vorschau des Produktionsbaues. Verwenden Sie dies nicht als Produktionsserver, da er nicht dafür ausgelegt ist.

#### Verwendung

```bash
vite preview [root]
```

#### Optionen

| Optionen                  |                                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--host [host]`           | Geben Sie Hostname ( `string` ) an                                                                                                                                   |
| `--port <port>`           | Anschluss angeben ( `number` )                                                                                                                                       |
| `--strictPort`            | Beenden Sie, wenn der angegebene Port bereits verwendet wird ( `boolean` )                                                                                           |
| `--open [path]`           | Öffnen Sie den Browser beim Start (`boolean \ \| String`))                                                                                                           |
| `--outDir <dir>`          | Ausgabeverzeichnis (Standard: `dist` ) ( `string` )                                                                                                                  |
| `-c, --config <file>`     | Verwenden Sie die angegebene Konfigurationsdatei ( `string` )                                                                                                        |
| `--base <path>`           | Öffentlicher Basispfad (Standard: `/` ) ( `string` )                                                                                                                 |
| `-l, --logLevel <level>`  | Info \| warnen \| Fehler \| still ( `string` )                                                                                                                       |
| `--clearScreen`           | Löschlichen Bildschirm bei der Protokollierung ( `boolean` ) zulassen/deaktivieren.                                                                                  |
| `--configLoader <loader>` | Verwenden Sie `bundle` , um die Konfiguration mit ESBuild oder `runner` (experimentell) zu bündeln, um sie im laufenden Fliegen zu verarbeiten (Standard: `bundle` ) |
| `-d, --debug [feat]`      | Zeigen Sie Debug -Protokolle (`String \| boolean`)                                                                                                                   |
| `-f, --filter <filter>`   | Filter -Debug -Protokolle ( `string` )                                                                                                                               |
| `-m, --mode <mode>`       | Setzen Sie den Env -Modus ( `string` )                                                                                                                               |
| `-h, --help`              | Zeigen Sie die verfügbaren CLI -Optionen an                                                                                                                          |
