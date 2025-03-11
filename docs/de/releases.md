# Veröffentlichungen

Vite -Veröffentlichungen folgen [der semantischen Versionierung](https://semver.org/) . Sie können die neueste stabile Version von Vite auf der [Seite Vite NPM -Paket](https://www.npmjs.com/package/vite) sehen.

Ein vollständiger ChangeLog von früheren Veröffentlichungen ist [auf Github erhältlich](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md) .

## Freisetzungszyklus

VITE hat keinen festen Freisetzungszyklus.

- **Patch** -Veröffentlichungen werden nach Bedarf (normalerweise jede Woche) veröffentlicht.
- **Kleinere** Veröffentlichungen enthalten immer neue Funktionen und werden nach Bedarf freigegeben. Kleinere Releases haben immer eine Beta-Vorveröffentlichungsphase (normalerweise alle zwei Monate).
- **Die wichtigsten** Veröffentlichungen entsprechen im Allgemeinen mit [dem EOL -Zeitplan von Node.js](https://endoflife.date/nodejs) und werden im Voraus bekannt gegeben. Diese Veröffentlichungen werden langfristige Diskussionen mit dem Ökosystem durchlaufen und Alpha- und Beta-Pre-veröffentlichte Phasen (normalerweise jedes Jahr) aufweisen.

Die Vite -Versionen Bereiche, die vom Vite -Team unterstützt werden, wird automatisch bestimmt:

- **Aktuelle Moll** erhält regelmäßige Korrekturen.
- **Vorheriger Major** (nur wegen seines neuesten Moll) und **früherer Moll** erhält wichtige Korrekturen und Sicherheitspatches.
- **Der zweitletzte Major** (nur für sein jüngster Moll) und **der jeweils anhaltende Moll** erhält Sicherheitspatches.
- Alle Versionen vor diesen werden nicht mehr unterstützt.

Als Beispiel, wenn das vite neueste bei 5.3.10 liegt:

- Regelmäßige Patches werden für `vite@5.3` veröffentlicht.
- Wichtige Korrekturen und Sicherheitspatches werden auf `vite@4` und `vite@5.2` zurückgeschrieben.
- Sicherheitspatches sind ebenfalls auf `vite@3` und `vite@5.1` zurückgeschrieben.
- `vite@2` und `vite@5.0` werden nicht mehr unterstützt. Benutzer sollten ein Upgrade für Aktualisierungen einlegen.

Wir empfehlen, Vite regelmäßig zu aktualisieren. Schauen Sie sich die [Migrationsführer](https://vite.dev/guide/migration.html) an, wenn Sie jedes Hauptfach aktualisieren. Das Vite -Team arbeitet eng mit den Hauptprojekten im Ökosystem zusammen, um die Qualität neuer Versionen zu gewährleisten. Wir testen neue Vite-Versionen, bevor wir sie durch das [Vite-Ecosystem-CI-Projekt](https://github.com/vitejs/vite-ecosystem-ci) freigeben. Die meisten Projekte, die VITE verwenden, sollten in der Lage sein, schnell Unterstützung anzubieten oder auf neue Versionen zu migrieren, sobald sie veröffentlicht werden.

## Semantische Versionskante Fälle

### TypeScript -Definitionen

Wir können inkompatible Änderungen an Typ -Skriptdefinitionen zwischen kleineren Versionen versenden. Das liegt daran, dass:

- Manchmal versendet TypeScript selbst inkompatible Änderungen zwischen kleineren Versionen, und wir müssen möglicherweise Typen anpassen, um neuere Versionen von TypeScript zu unterstützen.
- Gelegentlich müssen wir möglicherweise Funktionen übernehmen, die nur in einer neueren Version von TypeScript erhältlich sind, um die minimal erforderliche Version von TypeScript zu erhöhen.
- Wenn Sie TypeScript verwenden, können Sie einen Semver -Bereich verwenden, der das aktuelle Nebenfach sperrt und manuell aktualisiert wird, wenn eine neue Nebenversion von Vite veröffentlicht wird.

### Esbuild

[ESBUILD](https://esbuild.github.io/) ist vor-1.0.0 und manchmal hat es eine Bruchänderung, die wir möglicherweise einschließen müssen, um Zugriff auf neuere Funktionen und Leistungsverbesserungen zu haben. Wir können die Esbuild -Version in einem Vite -Moll stoßen.

### Node.js Nicht-LTS-Versionen

Nicht-LTS-Node.js-Versionen (ungerade zahlen) werden nicht als Teil von Vite's CI getestet, aber sie sollten immer noch vor ihrem [EOL](https://endoflife.date/nodejs) arbeiten.

## Vorveröffentlichungen

Kleinere Veröffentlichungen durchlaufen normalerweise eine nicht fixierte Anzahl von Beta-Veröffentlichungen. Die wichtigsten Veröffentlichungen werden eine Alpha -Phase und eine Beta -Phase durchlaufen.

Voraberlösungen ermöglichen es frühen Anwendern und Betreuern aus dem Ökosystem, Integrations- und Stabilitätstests durchzuführen und Feedback zu geben. Verwenden Sie keine Vorabveröffentlichungen in der Produktion. Alle Vorablösungen werden als instabil angesehen und können zwischen dazwischen langen Veränderungen versenden. Pin immer an genaue Versionen, wenn Sie vorab der Veröffentlichung verwendet werden.

## Abschreibungen

Wir machen regelmäßig Merkmale ab, die durch bessere Alternativen in geringfügigen Veröffentlichungen abgelöst wurden. Veraltete Funktionen funktionieren weiterhin mit einem Typ oder einer protokollierten Warnung. Sie werden in der nächsten großen Veröffentlichung nach dem Eintritt in einen veralteten Status entfernt. In der [Migrationshandbuch](https://vite.dev/guide/migration.html) für jedes Hauptfach werden diese Entfernungen aufgeführt und einen Upgrade -Pfad für sie dokumentiert.

## Experimentelle Merkmale

Einige Funktionen werden als experimentell markiert, wenn sie in einer stabilen Version von Vite freigegeben werden. Mit experimentellen Merkmalen können wir reale Erfahrung sammeln, um ihr endgültiges Design zu beeinflussen. Ziel ist es, Benutzer Feedback zu geben, indem sie sie in der Produktion testen. Experimentelle Merkmale selbst gelten als instabil und sollten nur kontrolliert verwendet werden. Diese Funktionen können sich zwischen Minderjährigen ändern, sodass Benutzer ihre vite -Version festlegen müssen, wenn sie sich auf sie verlassen. Wir werden für jede experimentelle Funktion [eine GitHub -Diskussion](https://github.com/vitejs/vite/discussions/categories/feedback?discussions_q=is%3Aopen+label%3Aexperimental+category%3AFeedback) erstellen.
