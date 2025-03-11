# Arbeiteroptionen

Sofern nicht angegeben, werden die Optionen in diesem Abschnitt auf alle Entwickler, Erstellen und Vorschau angewendet.

## worker.format

- **Typ:** `'es' ' | 'iife''`
- **Standard:** `'iife'`

Ausgangsformat für Worker -Bundle.

## worker.plugins

- **Typ:** [`() => (Plugin | Plugin []) [] `] (./ Shared-Options#Plugins)

VITE -Plugins, die für die Arbeiterbündel gelten. Beachten Sie, dass [Config.Plugins](./shared-options#plugins) nur für Mitarbeiter in Dev gilt, sondern hier statt für Build konfiguriert werden.
Die Funktion sollte neue Plugin -Instanzen zurückgeben, da sie in parallelen Rollup -Worker -Builds verwendet werden. Daher wird das Ändern von `config.worker` Optionen im `config` -Haken ignoriert.

## worker.rollupOptions

- **Typ:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

Rollup -Optionen zum Erstellen von Worker -Bundle.
