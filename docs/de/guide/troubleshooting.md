# Fehlerbehebung

Weitere Informationen finden Sie [unter Rollups Fehlerbehebungshandbuch](https://rollupjs.org/troubleshooting/) .

Wenn die Vorschläge hier nicht funktionieren, versuchen Sie, Fragen zu [Github -Diskussionen](https://github.com/vitejs/vite/discussions) oder im `#help` -Kanal von [Vite Land Discord](https://chat.vite.dev) zu veröffentlichen.

## CJS

### Vite CJS -Knoten -API veraltet

Der CJS -Aufbau der Node -API von Vite ist veraltet und wird in Vite 6 entfernt. Weitere Kontext finden Sie in der [Github -Diskussion](https://github.com/vitejs/vite/discussions/13928) . Sie sollten Ihre Dateien oder Frameworks aktualisieren, um stattdessen den ESM -Build von VITE zu importieren.

Stellen Sie in einem grundlegenden VITE -Projekt sicher:

1. Der `vite.config.js` -Dateiinhalt verwendet die ESM -Syntax.
2. Die nächstgelegene `package.json` -Datei hat `"type": "module"` oder verwenden Sie die `.mjs` / `.mts` -Erweiterung, z. B. `vite.config.mjs` oder `vite.config.mts` .

Für andere Projekte gibt es einige allgemeine Ansätze:

- **Konfigurieren Sie ESM als Standardeinstellung, wenden Sie sich bei Bedarf bei CJS an:** Fügen Sie `"type": "module"` im Projekt `package.json` hinzu. Alle `*.js` Dateien werden jetzt als ESM interpretiert und müssen die ESM -Syntax verwenden. Sie können eine Datei mit der `.cjs` -Erweiterung umbenennen, um stattdessen CJS zu verwenden.
- **Halten Sie CJs als Standardeinsatz bei ESM bei Bedarf an:** Wenn das Projekt `package.json` nicht `"type": "module"` hat, werden alle `*.js` Dateien als CJS interpretiert. Sie können eine Datei mit der `.mjs` -Erweiterung umbenennen, um stattdessen ESM zu verwenden.
- **Dynamisch importieren vite:** Wenn Sie CJS weiterhin verwenden müssen, können Sie stattdessen dynamisch `import('vite')` importieren. Dies erfordert, dass Ihr Code in einem `async` -Kontext geschrieben wird, sollte jedoch immer noch überschaubar sein, da die API von Vite meist asynchron ist.

Wenn Sie sich nicht sicher sind, woher die Warnung kommt, können Sie Ihr Skript mit dem `VITE_CJS_TRACE=true` -Flag ausführen, um die Stapelspur zu protokollieren:

```bash
VITE_CJS_TRACE=true vite dev
```

Wenn Sie die Warnung vorübergehend ignorieren möchten, können Sie Ihr Skript mit der `VITE_CJS_IGNORE_WARNING=true` -Flagge ausführen:

```bash
VITE_CJS_IGNORE_WARNING=true vite dev
```

Beachten Sie, dass POSTCSS -Konfigurationsdateien ESM + TypeScript ( `.mts` oder `.ts` in `"type": "module"` ) noch nicht unterstützen. Wenn Sie POSTCSS -Konfigurationen mit `.ts` und `"type": "module"` zu paket.json hinzufügen, müssen Sie auch die PostCSS -Konfiguration um 5 umbenennen, um `.cts` zu verwenden.

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

Der Pfad zu Ihrem Projektordner kann `&` enthalten, der nicht mit `npm` unter Windows ( [NPM/CMD-Shim#45](https://github.com/npm/cmd-shim/issues/45) ) funktioniert.

Sie müssen beider:

- Wechseln Sie zu einem anderen Paketmanager (z. B. `pnpm` , `yarn` )
- Entfernen Sie `&` vom Pfad zu Ihrem Projekt

## Konfiguration

### Dieses Paket ist nur ESM

Beim Importieren eines ESM -Pakets um `require` kommt der folgende Fehler auf.

> Ich habe "foo" nicht behoben. Dieses Paket ist nur ESM, aber es wurde versucht, um `require` zu laden.

> ERROR [ERR_REQUIRE_ESM]: fordert () von ES modul /path/to/dependency.js von /path/to/vite.config.js nicht unterstützt.
> Ändern Sie stattdessen die Forderung von index.js in /path/to/vite.config.js in einen dynamischen Import (), der in allen CommonJS -Modulen verfügbar ist.

In node.js <= 22 können ESM -Dateien nicht standardmäßig nach [`require`](https://nodejs.org/docs/latest-v22.x/api/esm.html#require) geladen werden.

Während es mit [`--experimental-require-module`](https://nodejs.org/docs/latest-v22.x/api/modules.html#loading-ecmascript-modules-using-require) oder node.js> 22 oder in anderen Laufzeiten funktioniert, empfehlen wir dennoch, Ihre Konfiguration in ESM zu konvertieren:

- Addiere `"type": "module"` zum nächsten `package.json`
- `vite.config.js` bis `vite.config.mjs` / `vite.config.mts` `vite.config.ts`

### `failed to load config from '/path/to/config*/vite.config.js'`

> Die Konfiguration nicht aus '/path/to/config\*/vite.config.js' laden
> Fehler beim Starten von Dev Server:
> Fehler: Build ist mit 1 Fehler fehlgeschlagen:
> Fehler: Muss "Outdir" verwenden, wenn mehrere Eingabedateien vorhanden sind

Der obige Fehler kann auftreten, wenn der Pfad zu Ihrem Projektordner `*` enthält, den esbuild als GLOB behandelt. Sie müssen Ihr Verzeichnis umbenennen, um das `*` zu entfernen.

## Dev Server

### Anfragen werden für immer ins Stocken geraten

Wenn Sie Linux verwenden, können die Dateideskriptorgrenzen und die inotifizierten Grenzen das Problem verursachen. Da Vite die meisten Dateien nicht bündelt, können Browser viele Dateien anfordern, für die viele Dateideskriptoren erforderlich sind und das Limit überschreiten.

Um dies zu lösen:

- Erhöhen Sie die Dateideskriptorgrenze um `ulimit`

  ```shell
  # Überprüfen Sie die aktuelle Grenze
  $ ulimit -Sn
  # Änderungsgrenze (vorübergehend)
  $ ulimit -Sn 10000 # Möglicherweise müssen Sie auch die feste Grenze ändern
  # Starten Sie Ihren Browser neu
  ```

- Erhöhen Sie die folgenden inotifizierten Grenzen um `sysctl`

  ```shell
  # Überprüfen Sie die aktuellen Grenzen
  $ sysctl fs.inotify
  # Grenzen ändern (vorübergehend)
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

Wenn die obigen Schritte nicht funktionieren, können Sie versuchen, `DefaultLimitNOFILE=65536` als unbekannte Konfiguration zu den folgenden Dateien hinzuzufügen:

- /etc/systemd/system.conf
- /etc/systemd/user.conf

Für Ubuntu Linux müssen Sie möglicherweise die Zeile `* - nofile 65536` in die Datei `/etc/security/limits.conf` hinzufügen, anstatt Systemd -Konfigurationsdateien zu aktualisieren.

Beachten Sie, dass diese Einstellungen bestehen bleiben, aber ein **Neustart erforderlich ist** .

Wenn der Server in einem VS -Code -DevContainer ausgeführt wird, kann die Anforderung möglicherweise ins Stocken geraten. Um dieses Problem zu beheben, siehe
[Dev Container / VS -Code -Port -Weiterleitung](#dev-containers-vs-code-port-forwarding) .

### Netzwerkanfragen stoppen Sie das Laden

Bei Verwendung eines selbstsignierten SSL-Zertifikats ignoriert Chrome alle Caching-Direktiven und lädt den Inhalt neu. Vite stützt sich auf diese Caching -Richtlinien.

Um das Problem zu beheben, verwenden Sie ein vertrauenswürdiges SSL -Zertifikat.

Siehe: [Cache -Probleme](https://helpx.adobe.com/mt/experience-manager/kb/cache-problems-on-chrome-with-SSL-certificate-errors.html) , [Chromprobleme](https://bugs.chromium.org/p/chromium/issues/detail?id=110649#c8)

#### macos

Sie können ein vertrauenswürdiges Zertifikat über die CLI mit diesem Befehl installieren:

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

Oder indem Sie sie in die Schlüsselbund -Access -App importieren und das Vertrauen Ihres Zertifikats zu "immer vertrauen" aktualisieren.

### 431 Anfrage Headerfelder Zu Groß

Wenn der Server / WebSocket -Server einen großen HTTP -Header empfängt, wird die Anforderung fallen und die folgende Warnung wird angezeigt.

> Der Server antwortete mit Statuscode 431. Siehe [https://vite.dev/guide/troubleshooting.html#\_431-request-header-fields-too-Large](https://vite.dev/guide/troubleshooting.html#_431-request-header-fields-too-large) .

Dies liegt daran, dass Node.js die Anforderung an die Headergröße begrenzt, um [CVE-2018-12121](https://www.cve.org/CVERecord?id=CVE-2018-12121) zu mildern.

Um dies zu vermeiden, versuchen Sie, Ihre Anfrage -Headergröße zu reduzieren. Wenn der Cookie beispielsweise lang ist, löschen Sie es. Oder Sie können [`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize) verwenden, um die maximale Headergröße zu ändern.

### Dev Container / vs -Code -Port -Weiterleitung

Wenn Sie eine Dev -Container- oder Port -Weiterleitungsfunktion in VS -Code verwenden, müssen Sie möglicherweise die Option [`server.host`](/de/config/server-options.md#server-host) in der Konfiguration auf `127.0.0.1` festlegen, damit sie funktioniert.

Dies liegt daran, dass [die Portweiterleiterfunktion im VS -Code IPv6 nicht unterstützt](https://github.com/microsoft/vscode-remote-release/issues/7029) .

Weitere Informationen finden Sie unter [#16522](https://github.com/vitejs/vite/issues/16522) .

## HMR

### Vite erkennt eine Dateiänderung, aber die HMR funktioniert nicht

Möglicherweise importieren Sie eine Datei mit einem anderen Fall. Zum Beispiel existiert `src/foo.js` und `src/bar.js` enthält:

```js
import './Foo.js' // sollte './foo.js' sein '
```

Verwandte Ausgabe: [#964](https://github.com/vitejs/vite/issues/964)

### Vite erkennt keine Dateiänderung

Wenn Sie VITE mit WSL2 ausführen, kann Vite keine Dateiänderungen unter einigen Bedingungen ansehen. Siehe [`server.watch` Option](/de/config/server-options.md#server-watch) .

### Eine vollständige Nachlade erfolgt anstelle von HMR

Wenn HMR nicht von VITE oder einem Plugin behandelt wird, erfolgt eine vollständige Nachlade, da dies die einzige Möglichkeit ist, den Zustand zu aktualisieren.

Wenn HMR behandelt wird, es jedoch in einer kreisförmigen Abhängigkeit liegt, wird auch eine vollständige Wiederholung die Ausführungsreihenfolge wiederhergestellt. Um dies zu lösen, versuchen Sie, die Schleife zu brechen. Sie können `vite --debug hmr` ausführen, um den kreisförmigen Abhängigkeitspfad zu protokollieren, wenn eine Dateiänderung ihn ausgelöst hat.

## Bauen

### Die erstellte Datei funktioniert aufgrund eines CORS -Fehlers nicht

Wenn die HTML -Dateiausgabe mit `file` Protokoll geöffnet wurde, werden die Skripte nicht mit dem folgenden Fehler ausgeführt.

> Zugriff auf das Skript unter 'Datei: ///foo/bar.js' From Origin 'Null' wurde durch CORS-Richtlinien blockiert: Cross Origin-Anfragen werden nur für Protokollschemata unterstützt: HTTP, Daten, isoliert-App, Chrom-Extension, Chrom, HTTPS, Chrom-nicht.

> Cross-Origin-Anfrage blockiert: Die gleiche Ursprungsrichtlinie hat das Lesen der Remote-Ressource unter Datei: ///foo/bar.js nicht aus. (Grund: CORS -Anfrage nicht http).

Siehe [Grund: CORS -Anfrage nicht http - http | Mdn] ( [https://developer.mozilla.org/en-us/docs/web/http/cors/errors/corsRequestnothttp](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) ) Weitere Informationen darüber, warum dies geschieht.

Sie müssen mit `http` Protokoll auf die Datei zugreifen. Der einfachste Weg, dies zu erreichen, besteht darin, `npx vite preview` zu laufen.

## Optimierte Abhängigkeiten

### Veraltete vorbündelte DEPs bei der Verknüpfung mit einem lokalen Paket

Die Hash -Taste, mit der optimierte Abhängigkeiten ungültig werden, hängt vom Paketschloss, den auf Abhängigkeiten angewendeten Patches und den Optionen in der Vite -Konfigurationsdatei ab, die sich auf die Bündelung von Knotenmodulen auswirken. Dies bedeutet, dass VITE erfasst, wann eine Abhängigkeit unter Verwendung einer Funktion als [NPM überschrieben](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) wird, und Ihre Abhängigkeiten beim nächsten Serverstart neu zu bunkschen. Vite wird die Abhängigkeiten nicht ungültig machen, wenn Sie eine Funktion wie [NPM -Link](https://docs.npmjs.com/cli/v9/commands/npm-link) verwenden. Falls Sie eine Abhängigkeit verlinken oder verbringen, müssen Sie die Neuoptimierung des nächsten Servers mit `vite --force` erzwingen. Wir empfehlen stattdessen die Verwendung von Overrides, die jetzt von jedem Paketmanager unterstützt werden (siehe auch [PNPM -Überschreibungen](https://pnpm.io/package_json#pnpmoverrides) und [Garnauflösungen](https://yarnpkg.com/configuration/manifest/#resolutions) ).

## Leistung Engpässe

Wenn Sie Engpässe für Anwendungsleistung erleiden, die zu langsamen Ladezeiten führen, können Sie den integrierten Node.JS-Inspektor mit Ihrem Vite Dev-Server oder beim Erstellen Ihrer Anwendung zum Erstellen des CPU-Profils starten:

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite Dev Server
Sobald Ihre Anwendung im Browser geöffnet ist, warten Sie einfach zum Laden und kehren Sie dann zum Terminal zurück und drücken Sie `p` -Taste (stoppt den Node.js -Inspektor), dann drücken Sie `q` Taste, um den Dev -Server zu stoppen.
:::

Node.js Inspector generiert `vite-profile-0.cpuprofile` im Stammordner, wechseln Sie zu [https://www.speedscope.app/](https://www.speedscope.app/) und laden Sie das CPU -Profil mit der Schaltfläche `BROWSE` hoch, um das Ergebnis zu inspizieren.

Sie können [Vite-Plugin-Inspektive](https://github.com/antfu/vite-plugin-inspect) installieren, mit der Sie den Zwischenzustand von Vite-Plugins überprüfen und Ihnen auch helfen können, zu ermitteln, welche Plugins oder Middlewares der Engpass in Ihren Anwendungen sind. Das Plugin kann sowohl in den Entwicklungsmodi als auch in den Build -Modi verwendet werden. Weitere Informationen finden Sie in der LEADME -Datei.

## Andere

### Modul externalisiert für die Browserkompatibilität

Wenn Sie im Browser ein Node.js -Modul verwenden, gibt VITE die folgende Warnung aus.

> Das Modul "FS" wurde für die Browserkompatibilität externalisiert. Ich kann in Client -Code nicht auf "fs.readfile" zugreifen.

Dies liegt daran, dass VITE nicht automatisch Polyfill node.js -Module.

Wir empfehlen, Node.js -Module für den Browsercode zu vermeiden, um die Bündelgröße zu reduzieren, obwohl Sie Polyfills manuell hinzufügen können. Wenn das Modul aus einer Bibliothek von Drittanbietern importiert wird (die im Browser verwendet werden soll), wird empfohlen, das Problem der jeweiligen Bibliothek zu melden.

### Syntaxfehler / Typ Fehler treten auf

VITE kann Code nicht verarbeiten und unterstützt keinen Code, der nur im Nicht-Streng-Modus (schlampiger Modus) ausgeführt wird. Dies liegt daran, dass VITE ESM verwendet und es in ESM immer [strenger Modus](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) ist.

Zum Beispiel sehen Sie diese Fehler möglicherweise.

> [Fehler] mit Anweisungen kann aufgrund des strengen Modus nicht mit dem Ausgangsformat "ESM" verwendet werden

> TypeError: Es kann keine Eigenschaft 'foo' auf boolean 'false' erstellen

Wenn diese Codes in Abhängigkeiten verwendet werden, können Sie [`patch-package`](https://github.com/ds300/patch-package) (oder [`yarn patch`](https://yarnpkg.com/cli/patch) oder [`pnpm patch`](https://pnpm.io/cli/patch) ) für eine Fluchtschlüsselung verwenden.

### Browserverlängerungen

Einige Browser-Erweiterungen (wie Ad-Blocker) können verhindern, dass der Vite-Client Anforderungen an den Vite Dev Server sendet. Möglicherweise sehen Sie in diesem Fall einen weißen Bildschirm ohne protokollierte Fehler. Versuchen Sie, Erweiterungen zu deaktivieren, wenn Sie dieses Problem haben.

### Überqueren Sie die Laufwerkslinks unter Windows

Wenn Ihr Projekt unter Windows eine Cross -Laufwerk -Links enthält, funktioniert VITE möglicherweise nicht.

Ein Beispiel für Cross -Antrieb -Links sind:

- Ein virtuelles Laufwerk, das mit einem Befehl `subst` mit einem Ordner verknüpft ist
- Ein Symlink/Junction zu einem anderen Befehl mit `mklink` (zB Garnglobal Cache)

Verwandte Ausgabe: [#10802](https://github.com/vitejs/vite/issues/10802)
