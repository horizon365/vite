# Migration von V5

## Umwelt -API

Im Rahmen der neuen experimentellen [Umgebung API](/de/guide/api-environment.md) war ein großes internes Refactoring erforderlich. Vite 6 ist bemüht, Veränderungen zu vermeiden, um sicherzustellen, dass die meisten Projekte schnell auf das neue Major aktualisieren können. Wir werden warten, bis ein großer Teil des Ökosystems bewegt ist, um die Verwendung der neuen APIs zu stabilisieren und zu empfehlen. Es kann einige Kantenfälle geben, aber diese sollten nur die Verwendung von Rahmenbedingungen und Tools auf niedriger Ebene beeinflussen. Wir haben mit Betreuern im Ökosystem zusammengearbeitet, um diese Unterschiede vor der Veröffentlichung zu mindern. Bitte [öffnen Sie ein Problem](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml) , wenn Sie eine Regression erkennen.

Einige interne APIs wurden aufgrund von Änderungen in der Implementierung von Vite entfernt. Wenn Sie sich auf einen von ihnen verlassen haben, erstellen Sie bitte eine [Funktionsanfrage](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml) .

## Vite Runtime API

Die experimentelle Vite -Laufzeit -API entwickelte sich zu der in Vite 6 im Rahmen der neuen experimentellen [Umgebung API veröffentlichten Modulläufer -API](/de/guide/api-environment) . Angesichts der Tatsache, dass die Funktion experimentell war, ist die Entfernung der in Vite 5.1 eingeführten vorherigen API keine Bruchänderung, aber Benutzer müssen ihre Verwendung im Rahmen der Migration in Vite 6 auf das Modulläuferäquivalent aktualisieren.

## Allgemeine Änderungen

### Standardwert für `resolve.conditions`

Diese Änderung betrifft keine Benutzer [`ssr.resolve.conditions`](/de/config/ssr-options#ssr-resolve-conditions) die [`resolve.conditions`](/de/config/shared-options#resolve-conditions) nicht konfiguriert haben [`ssr.resolve.externalConditions`](/de/config/ssr-options#ssr-resolve-externalconditions)

In Vite 5 betrug der Standardwert für `resolve.conditions` `[]` und einige Bedingungen wurden intern hinzugefügt. Der Standardwert für `ssr.resolve.conditions` war der Wert von `resolve.conditions` .

Aus Vite 6 werden einige der Bedingungen nicht mehr intern hinzugefügt und müssen in die Konfigurationswerte aufgenommen werden.
Die Bedingungen, die nicht mehr intern hinzugefügt werden für

- `resolve.conditions` sind "[" Modul "," Browser "," Entwicklung "|Produktion '] `
- `ssr.resolve.conditions` sind "[" Modul "," Knoten "," Entwicklung "|Produktion '] `

Die Standardwerte für diese Optionen werden auf die entsprechenden Werte aktualisiert und `ssr.resolve.conditions` verwendet `resolve.conditions` nicht mehr als Standardwert. Beachten Sie, dass `Entwicklung|`. These default values are exported from ` `is a special variable that is replaced with`Produktion`or`Entwicklung`depending on the value of` `and` `as`

Wenn Sie einen benutzerdefinierten Wert für `resolve.conditions` oder `ssr.resolve.conditions` angegeben haben, müssen Sie ihn aktualisieren, um die neuen Bedingungen einzuschließen.
Wenn Sie beispielsweise `['custom']` für `resolve.conditions` angegeben haben, müssen Sie stattdessen `['custom', ...defaultClientConditions]` angeben.

### Json stringify

In Vite 5 war [`json.namedExports`](/de/config/shared-options#json-namedexports) deaktiviert, wenn [`json.stringify: true`](/de/config/shared-options#json-stringify) eingestellt ist.

Ab Vite 6 ist `json.stringify: true` `json.namedExports` deaktiviert und der Wert respektiert. Wenn Sie das vorherige Verhalten erreichen möchten, können Sie `json.namedExports: false` festlegen.

Vite 6 führt außerdem einen neuen Standardwert für `json.stringify` ein, der `'auto'` ist, der nur große JSON -Dateien anstriert. Um dieses Verhalten zu deaktivieren, setz `json.stringify: false` .

### Erweiterte Unterstützung von Vermögensreferenzen in HTML -Elementen

In Vite 5 konnten nur wenige unterstützte HTML -Elemente Vermögenswerte verweisen, die von VITE verarbeitet und gebündelt werden, wie z. B. `<link href>` , `<img src>` usw.

Vite 6 erweitert die Unterstützung auf noch mehr HTML -Elemente. Die vollständige Liste finden Sie in den [HTML -Features](/de/guide/features.html#html) -Dokumenten.

Um die HTML-Verarbeitung für bestimmte Elemente abzuschalten, können Sie das `vite-ignore` Attribut für das Element hinzufügen.

### Postcss-Lastkonfiguration

[`postcss-load-config`](https://npmjs.com/package/postcss-load-config) wurde von V4 auf V6 aktualisiert. [`tsx`](https://www.npmjs.com/package/tsx) oder [`jiti`](https://www.npmjs.com/package/jiti) ist nun erforderlich, um TypeScript -PostCSS -Konfigurationsdateien anstelle von [`ts-node`](https://www.npmjs.com/package/ts-node) zu laden. Auch [`yaml`](https://www.npmjs.com/package/yaml) ist jetzt erforderlich, um YAML -Postcs -Konfigurationsdateien zu laden.

### Sass verwendet jetzt standardmäßig moderne API

In Vite 5 wurde die Legacy -API standardmäßig für SASS verwendet. VITE 5.4 Unterstützung für die moderne API.

Aus Vite 6 wird die moderne API standardmäßig für SASS verwendet. Wenn Sie die Legacy -API noch verwenden möchten, können Sie [`css.preprocessorOptions.sass.api: 'legacy'` `css.preprocessorOptions.scss.api: 'legacy'`](/de/config/shared-options#css-preprocessoroptions) . Beachten Sie jedoch, dass die Legacy -API -Unterstützung in Vite 7 entfernt wird.

Um in die moderne API zu wandern, siehe [die Sass -Dokumentation](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/) .

### Passen Sie den CSS -Ausgabedateinamen im Bibliotheksmodus an

In Vite 5 betrug der CSS -Ausgabedatei -Name im Bibliotheksmodus immer `style.css` und kann nicht einfach durch die VITE -Konfiguration geändert werden.

Aus Vite 6 verwendet der Standarddateiname jetzt `"name"` in `package.json` , ähnlich wie die JS -Ausgabedateien. Wenn [`build.lib.fileName`](/de/config/build-options.md#build-lib) mit einer Zeichenfolge festgelegt ist, wird der Wert auch für den CSS -Ausgabedateinamen verwendet. Um einen anderen CSS -Dateinamen explizit festzulegen, können Sie die neue [`build.lib.cssFileName`](/de/config/build-options.md#build-lib) verwenden, um ihn zu konfigurieren.

Um zu migrieren, sollten Sie sich auf den Dateinamen `style.css` Dateinamen anhand Ihres Paketnamens auf den neuen Namen auf den neuen Namen aktualisieren. Zum Beispiel:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

Wenn Sie es vorziehen, wie in Vite 5 bei `style.css` zu bleiben, können Sie stattdessen `build.lib.cssFileName: 'style'` einstellen.

## Fortschrittlich

Es gibt noch andere Bruchänderungen, die nur wenige Benutzer betreffen.

- [[#17922] Fix (CSS) !: Entfernen Sie den Standardimport in SSR Dev](https://github.com/vitejs/vite/pull/17922)
  - Die Unterstützung für den Standardimport von CSS -Dateien wurde [in Vite 4 veraltet](https://v4.vite.dev/guide/migration.html#importing-css-as-a-string) und in Vite 5 entfernt, wurde jedoch im SSR Dev -Modus noch unbeabsichtigt unterstützt. Diese Unterstützung wird jetzt entfernt.
- [[#15637] Fix !: Standard `build.cssMinify` bis `'esbuild'` für SSR](https://github.com/vitejs/vite/pull/15637)
  - [`build.cssMinify`](/de/config/build-options#build-cssminify) ist jetzt standardmäßig auch für SSR -Builds aktiviert.
- [[#18070] feat !: Proxy Bypass mit Websocket](https://github.com/vitejs/vite/pull/18070)
  - `server.proxy[path].bypass` ist nun für Websocket -Upgrade -Anfragen aufgerufen, und in diesem Fall beträgt der `res` Parameter `undefined` .
- [[#18209] Refactor !: Bump Minimal Terser -Version bis 5.16.0](https://github.com/vitejs/vite/pull/18209)
  - Die minimal unterstützte Terser -Version für [`build.minify: 'terser'`](/de/config/build-options#build-minify) wurde ab 5.4.0 auf 5.16.0 gestoßen.
- [[#18231] CHORE (DEPS): Abhängigkeit @rollup/plugin-commonjs auf v28 aktualisieren](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires) ist jetzt standardmäßig `true` (war `'auto'` vorher).
    - Dies kann zu größeren Bündelgrößen führen, führt jedoch zu deterministischeren Builds.
    - Wenn Sie eine CommonJS -Datei als Einstiegspunkt angeben, benötigen Sie möglicherweise zusätzliche Schritte. Lesen Sie [die CommonJS -Plugin -Dokumentation](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#using-commonjs-files-as-entry-points) für weitere Details.
- [[#18243] Aufgabe (DEPS) !: Migrieren Sie `fast-glob` bis `tinyglobby`](https://github.com/vitejs/vite/pull/18243)
  - Bereichsklammern ( `{01..03}` ⇒ `['01', '02', '03']` ) und inkrementelle Klammern ( `{2..8..2}` ⇒ `['2', '4', '6', '8']` ) werden in Globs nicht mehr unterstützt.
- [[#18395] feat (Resolve) !: Entfernen von Bedingungen zulassen](https://github.com/vitejs/vite/pull/18395)
  - Dieser PR führt nicht nur eine oben erwähnte Breaking-Änderung als "Standardwert für `resolve.conditions` " ein, sondern macht `resolve.mainFields` auch dazu, nicht für nicht externalisierte Abhängigkeiten in SSR verwendet zu werden. Wenn Sie `resolve.mainFields` verwendet haben und dies auf nicht externalisierte Abhängigkeiten in SSR anwenden möchten, können Sie [`ssr.resolve.mainFields`](/de/config/ssr-options#ssr-resolve-mainfields) verwenden.
- [[#18493] Refactor !: Entfernen Sie die Option Fs.CachedChecks](https://github.com/vitejs/vite/pull/18493)
  - Diese Optimierung der Opt-In-Optimierung wurde aufgrund von Kantenfällen beim Schreiben einer Datei in einem zwischengespeicherten Ordner und sofort importieren.
- ~~[[#18697] Fix (DEPS) !: Update Depellentcy Dotenv-Expand an V12 aktualisieren](https://github.com/vitejs/vite/pull/18697)~~
  - ~~Variablen, die bei der Interpolation verwendet werden, sollten jetzt vor der Interpolation deklariert werden. Weitere Informationen finden Sie [im `dotenv-expand` Changelog](https://github.com/motdotla/dotenv-expand/blob/v12.0.1/CHANGELOG.md#1200-2024-11-16) .~~ Diese brechende Veränderung wurde in V6.1.0 zurückgekehrt.
- [[#16471] feat: v6 - Umwelt -API](https://github.com/vitejs/vite/pull/16471)

  - Aktualisierungen eines SSR-Moduls nur auslösen keine vollständige Seite im Client. Um zum vorherigen Verhalten zurückzukehren, kann ein benutzerdefiniertes VITE -Plugin verwendet werden:
    <details>
    <summary>Klicken Sie hier, um das Beispiel zu erweitern</summary>

    ```ts twoslash
    import type { Plugin, EnvironmentModuleNode } from 'vite'

    function hmrReload(): Plugin {
      return {
        name: 'hmr-reload',
        enforce: 'post',
        hotUpdate: {
          order: 'post',
          handler({ modules, server, timestamp }) {
            if (this.environment.name !== 'ssr') return

            let hasSsrOnlyModules = false

            const invalidatedModules = new Set<EnvironmentModuleNode>()
            for (const mod of modules) {
              if (mod.id == null) continue
              const clientModule =
                server.environments.client.moduleGraph.getModuleById(mod.id)
              if (clientModule != null) continue

              this.environment.moduleGraph.invalidateModule(
                mod,
                invalidatedModules,
                timestamp,
                true,
              )
              hasSsrOnlyModules = true
            }

            if (hasSsrOnlyModules) {
              server.ws.send({ type: 'full-reload' })
              return []
            }
          },
        },
      }
    }
    ```

    </details>

## Migration von V4

Überprüfen Sie die [Migration vom V4 -Handbuch](https://v5.vite.dev/guide/migration.html) in den VITE V5 -Dokumenten zuerst, um die erforderlichen Änderungen an der Port -Port auf VITE 5 anzuzeigen, und fahren Sie dann mit den Änderungen auf dieser Seite fort.
