# SSR -Optionen

Sofern nicht angegeben, werden die Optionen in diesem Abschnitt sowohl auf Dev als auch auf Build angewendet.

## ssr.external

- **Typ:** `String [] | wahr "
- **Verwandte:** [SSR -Externale](/de/guide/ssr#ssr-externals)

Externalisiert die angegebenen Abhängigkeiten und ihre transitiven Abhängigkeiten für SSR. Standardmäßig werden alle Abhängigkeiten mit Ausnahme von verknüpften Abhängigkeiten (für HMR) externalisiert. Wenn Sie es vorziehen, die verknüpfte Abhängigkeit zu externalisieren, können Sie ihren Namen an diese Option übergeben.

Wenn `true` , werden alle Abhängigkeiten einschließlich verknüpfter Abhängigkeiten externalisiert.

Beachten Sie, dass die explizit aufgelisteten Abhängigkeiten (mit `string[]` Typ) immer Priorität haben, wenn sie auch in `ssr.noExternal` aufgeführt sind (unter Verwendung eines beliebigen Typs).

## ssr.noExternal

- **Typ:** `String | Regexp | (String | Regexp) [] | wahr "
- **Verwandte:** [SSR -Externale](/de/guide/ssr#ssr-externals)

Verhindern Sie, dass die aufgeführten Abhängigkeiten für SSR externalisiert werden, was sie im Build gebündelt werden. Standardmäßig werden nur verknüpfte Abhängigkeiten nicht externalisiert (für HMR). Wenn Sie es vorziehen, die verknüpfte Abhängigkeit zu externalisieren, können Sie ihren Namen an die `ssr.external` -Option übergeben.

Wenn `true` , werden keine Abhängigkeiten externalisiert. Abhängigkeiten, die explizit in `ssr.external` (unter Verwendung von `string[]` Typ) aufgeführt sind, können jedoch Priorität haben und dennoch externalisiert werden. Wenn `ssr.target: 'node'` eingestellt ist, werden Node.js-integrierte Ins standardmäßig externalisiert.

Beachten Sie, dass `ssr.noExternal` Priorität hat und keine Abhängigkeiten externalisiert sind, wenn sowohl `ssr.noExternal: true` als auch `ssr.external: true` konfiguriert sind.

## ssr.target

- **Typ:** `'Knoten' | 'Webworker''`
- **Standard:** `node`

Erstellen Sie das Ziel für den SSR -Server.

## ssr.resolve.conditions

- **Typ:** `string[]`
- **Standard:** "[" Modul "," Knoten "," Entwicklung "|Produktion '] ` (` defaultServerconditions `) (` [' Modul ',' Browser ',' Entwicklung|Produktion '] ` (` defaultClientConditions `) for ` ssr.target ===' Webworker'`)
- **Verwandte:** [Auflösungsbedingungen](./shared-options.md#resolve-conditions)

Diese Bedingungen werden in der Plugin-Pipeline verwendet und beeinflussen nur nicht externalisierte Abhängigkeiten während des SSR-Builds. Verwenden Sie `ssr.resolve.externalConditions` , um externalisierte Importe zu beeinflussen.

## ssr.resolve.externalConditions

- **Typ:** `string[]`
- **Standard:** `['node']`

Bedingungen, die während des SSR -Imports (einschließlich `ssrLoadModule` ) von externalisierten direkten Abhängigkeiten verwendet werden (externe Abhängigkeiten, die von VITE importiert werden).

:::tip

Stellen Sie bei Verwendung dieser Option sicher, dass Sie den Knoten mit [`--conditions` Flag](https://nodejs.org/docs/latest/api/cli.html#-c-condition---conditionscondition) mit denselben Werten in Dev und Build ausführen, um ein konsistentes Verhalten zu erhalten.

Wenn Sie beispielsweise `['node', 'custom']` einstellen, sollten Sie `NODE_OPTIONS='--conditions custom' vite` in Dev und `NODE_OPTIONS="--conditions custom" node ./dist/server.js` nach dem Bau ausführen.

:::

### ssr.resolve.mainFields

- **Typ:** `string[]`
- **Standard:** `['module', 'jsnext:main', 'jsnext']`

Liste der Felder in `package.json` um es zu versuchen, wenn Sie den Einstiegspunkt eines Pakets auflösen. Beachten Sie, dass dies eine geringere Vorrangszeit hat als die bedingten Exporte, die aus dem Feld `exports` aufgelöst werden: Wenn ein Einstiegspunkt erfolgreich von `exports` aufgelöst wird, wird das Hauptfeld ignoriert. Diese Einstellung wirkt sich nur auf nicht externalisierte Abhängigkeiten aus.
