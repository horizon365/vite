# Projektphilosophie

## Lean Extiderable Core

Vite beabsichtigt nicht, jeden Anwendungsfall für jeden Benutzer abzudecken. Vite zielt darauf ab, die häufigsten Muster für das Erstellen von Web-Apps außerhalb des Boxs zu unterstützen. [Vite Core](https://github.com/vitejs/vite) muss jedoch mit einer kleinen API-Oberfläche schlank bleiben, um das Projekt langfristig aufrechterhalten zu halten. Dieses Ziel ist dank des [Rollup-basierten Plugin-Systems von Vite](./api-plugin.md) möglich. Funktionen, die als externe Plugins implementiert werden können, werden im Allgemeinen nicht zum Vite -Kern hinzugefügt. [Vite-Plugin-Pwa](https://vite-pwa-org.netlify.app/) ist ein gutes Beispiel dafür, was aus Vite-Kern erreicht werden kann, und es gibt viele [gut gepflegte Plugins,](https://github.com/vitejs/awesome-vite#plugins) die Ihre Anforderungen decken. Vite arbeitet eng mit dem Rollup-Projekt zusammen, um sicherzustellen, dass Plugins sowohl in Plain-Rollup- als auch in VITE-Projekten so weit wie möglich verwendet werden können, und versuchen, die erforderlichen Erweiterungen nach Möglichkeit stromaufwärts zu überschreiten.

## Schieben Des Modernen Netzes

VITE liefert merkmale Funktionen, die das Schreiben moderner Code vorantreiben. Zum Beispiel:

- Der Quellcode kann nur in ESM geschrieben werden, wo Nicht-ESM-Abhängigkeiten [als ESM vorbündelt](./dep-pre-bundling) werden müssen, um zu arbeiten.
- Webarbeiter werden aufgefordert, mit der [`new Worker` -Syntax](./features#web-workers) geschrieben zu werden, um modernen Standards zu folgen.
- Node.js -Module können im Browser nicht verwendet werden.

Beim Hinzufügen neuer Funktionen werden diese Muster befolgt, um eine zukunftssichere API zu erstellen, die möglicherweise nicht immer mit anderen Build-Tools kompatibel ist.

## Ein pragmatischer Ansatz zur Leistung

Vite konzentrierte sich seit seiner [Herkunft](./why.md) auf die Leistung. Die Dev -Server -Architektur ermöglicht HMR, die schnell im Skala der Projekte bleibt. Vite verwendet native Tools wie [Esbuild](https://esbuild.github.io/) und [SWC](https://github.com/vitejs/vite-plugin-react-swc) , um intensive Aufgaben zu implementieren, hält jedoch den Rest des Codes in JS, um die Geschwindigkeit mit Flexibilität auszugleichen. Bei Bedarf tippen Framework -Plugins in [Babel](https://babeljs.io/) , um den Benutzercode zu kompilieren. Und während der Build Time verwendet Vite derzeit [Rollup](https://rollupjs.org/) , wo die Bündelungsgröße und der Zugriff auf ein breites Ökosystem von Plugins wichtiger sind als Rohgeschwindigkeit. Vite wird sich weiterhin intern weiterentwickeln und neue Bibliotheken verwenden, da sie DX zu verbessern scheinen und gleichzeitig seine API stabil halten.

## Bauen von Frameworks über vite

Obwohl VITE von Benutzern direkt verwendet werden kann, wird es als Tool zum Erstellen von Frameworks erscheint. Vite Core ist agnostisch, aber es gibt polierte Plugins für jedes UI -Framework. Mit seiner [JS -API](./api-javascript.md) können App -Framework -Autoren vite -Funktionen verwenden, um maßgeschneiderte Erlebnisse für ihre Benutzer zu erstellen. VITE beinhaltet die Unterstützung von [SSR-Primitiven](./ssr.md) , die normalerweise in Tools auf höherer Ebene vorhanden sind, aber für den Aufbau moderner Webrahmen von grundlegender Bedeutung sind. Und Vite -Plugins vervollständigen das Bild, indem Sie eine Möglichkeit bieten, zwischen Frameworks zu teilen. VITE passt auch gut an, wenn es mit [Backend -Frameworks](./backend-integration.md) wie [Ruby](https://vite-ruby.netlify.app/) und [Laravel](https://laravel.com/docs/10.x/vite) kombiniert wird.

## Ein Aktives Ökosystem

Vite Evolution ist eine Zusammenarbeit zwischen Framework- und Plugin -Betreuern, Benutzern und dem Vite -Team. Wir fördern eine aktive Teilnahme an der Kernentwicklung von Vite, sobald ein Projekt VITE einsetzt. Wir arbeiten eng mit den Hauptprojekten im Ökosystem zusammen, um Regressionen bei jeder Version zu minimieren, unterstützt durch Tools wie [Vite-Ecosystem-CI](https://github.com/vitejs/vite-ecosystem-ci) . Es ermöglicht uns, die CI von Großprojekten mit VITE auf ausgewählten PRs durchzuführen, und gibt uns einen klaren Status, wie das Ökosystem auf eine Veröffentlichung reagieren würde. Wir bemühen uns, Regressionen zu beheben, bevor sie Benutzer schlagen und Projekte auf die nächsten Versionen aktualisieren, sobald sie veröffentlicht werden. Wenn Sie mit Vite arbeiten, laden wir Sie ein, sich [Vite's Discord](https://chat.vite.dev) anzuschließen und sich auch in das Projekt zu beteiligen.
