# Warum Vite

## Die Probleme

Bevor ES -Module in Browsern verfügbar waren, hatten Entwickler keinen nativen Mechanismus, um JavaScript modularisiert zu erfassen. Aus diesem Grund sind wir alle mit dem Konzept der "Bündelung" vertraut: Verwenden von Tools, die unsere Quellmodule in Dateien kriechen, verarbeiten und verkettet, die im Browser ausgeführt werden können.

Im Laufe der Zeit haben wir Tools wie [Webpack](https://webpack.js.org/) , [Rollup](https://rollupjs.org) und [Parcel](https://parceljs.org/) gesehen, die die Entwicklungserfahrung für Frontend -Entwickler erheblich verbessert haben.

Wenn wir jedoch immer ehrgeizigere Anwendungen erstellen, nimmt die Menge an JavaScript, mit denen wir uns befassen, auch dramatisch zu. Es ist nicht ungewöhnlich, dass große Projekte Tausende von Modulen enthalten. Wir fangen an, einen Performance -Engpass für JavaScript -basierte Tools zu treffen: Es kann oft eine unangemessen lange Wartezeit (manchmal bis zu Minuten!) Dösten, um einen Dev -Server zu drehen, und selbst mit dem Ersatz (HMR) des Hot Moduls (HMR) können die Datei -Änderungen ein paar Sekunden dauern, um im Browser nachzudenken. Die langsame Rückkopplungsschleife kann die Produktivität und das Glück der Entwickler stark beeinflussen.

VITE zielt darauf ab, diese Probleme anzugehen, indem neue Fortschritte im Ökosystem nutzt: die Verfügbarkeit nativer ES-Module im Browser und den Aufstieg von JavaScript-Tools, die in Kompilier-Native-Sprachen geschrieben wurden.

### Langsamer Serverstart

Bei der Kaltstart des Dev-Servers muss ein auf Bundler basierendes Build-Setup eifrig kriechen und Ihre gesamte Anwendung erstellen, bevor er bedient werden kann.

VITE verbessert die Dev -Server -Startzeit, indem er zuerst die Module in einer Anwendung in zwei Kategorien unterteilt: **Abhängigkeiten** und **Quellcode** .

- **Abhängigkeiten** sind meistens einfach JavaScript, die sich während der Entwicklung nicht häufig ändern. Einige große Abhängigkeiten (z. B. Bibliotheken für Komponenten mit Hunderten von Modulen) sind ebenfalls ziemlich teuer zu verarbeiten. Abhängigkeiten können auch in verschiedenen Modulformaten (z. B. ESM oder CommonJs) versendet werden.

  VITE [-Abhängigkeiten vor den Bündeln](./dep-pre-bundling.md) unter Verwendung von [Esbuild](https://esbuild.github.io/) . ESBUILD ist in Go and Pre-Bündel-Abhängigkeiten 10-100x schneller geschrieben als in JavaScript-basierte Bundler.

- **Der Quellcode** enthält häufig nicht planen JavaScript, das transformiert werden muss (z. B. JSX, CSS oder VUE/SVELTE-Komponenten) und sehr oft bearbeitet wird. Außerdem muss nicht der gesamte Quellcode gleichzeitig geladen werden (z. B. mit Routenbasis-Code-Splitting).

  VITE dient Quellcode über [native ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) . Dies lässt den Browser im Wesentlichen einen Teil der Aufgabe eines Bundlers übernehmen: Vite muss nur den Quellcode auf Bedarf transformieren und bedienen, wie der Browser ihn fordert. Der Code hinter bedingten dynamischen Importen wird nur verarbeitet, wenn sie tatsächlich auf dem aktuellen Bildschirm verwendet werden.

<script setup>
import bundlerSvg from '../../images/bundler.svg?raw'
import esmSvg from '../../images/esm.svg?raw'
</script>
<svg-image :svg="bundlerSvg" />
<svg-image :svg="esmSvg" />

### Langsame Updates

Wenn eine Datei in einem Bundler-basierten Build-Setup bearbeitet wird, ist es ineffizient, das gesamte Bundle aus einem offensichtlichen Grund wieder aufzubauen: Die Update-Geschwindigkeit wird sich linear mit der Größe der App verschlechtern.

In einigen Bündlern führt der Dev-Server die Bündelung im Speicher aus, so dass er nur einen Teil seines Moduldiagramms ungültig machen muss, wenn sich eine Datei ändert, aber das gesamte Bundle neu konstruieren und die Webseite neu laden muss. Das Rekonstruktion des Bündels kann teuer sein und das Nachladen der Seite bläst den aktuellen Status der Anwendung weg. Aus diesem Grund unterstützen einige Bundler den Ersatz (HOTOMEL STEUTMENT) (HMR): Ermöglicht ein Modul, sich selbst "heiß zu ersetzen", ohne den Rest der Seite zu beeinflussen. Dies verbessert DX erheblich - in der Praxis haben wir jedoch festgestellt, dass sich selbst die Geschwindigkeit der HMR -Aktualisierung erheblich verschlechtert, wenn die Größe der Anwendung wächst.

In vite wird HMR über native ESM durchgeführt. Wenn eine Datei bearbeitet wird, muss Vite die Kette nur genau zwischen dem bearbeiteten Modul und seiner engsten HMR -Grenze (meistens nur dem Modul selbst) ungültig machen, wodurch HMR -Updates unabhängig von der Größe Ihrer Anwendung konstant schnell sind.

VITE nutzt auch HTTP -Header, um die vollständige Seite neu zu laden (lassen Sie den Browser erneut mehr für uns arbeiten): Quellcode -Modulanforderungen werden über `304 Not Modified` bedingt, und die Anforderungen des Abhängigkeitsmoduls werden über `Cache-Control: max-age=31536000,immutable` stark zwischengespeichert, sodass sie nach dem zwischengespeicherten Server nicht erneut auf den Server klicken.

Sobald Sie erfahren, wie schnell Vite ist, bezweifeln wir sehr, dass Sie bereit sind, sich wieder mit einer gebündelten Entwicklung abzubauen.

## WARUM Bündel Für Die Produktion Bündeln

Obwohl native ESM inzwischen weit verbreitet ist, ist der Versand ungebündlicher ESM in der Produktion aufgrund der zusätzlichen Netzwerkrundfahrten, die durch verschachtelte Importe verursacht werden, immer noch ineffizient (selbst mit HTTP/2). Um die optimale Ladeleistung in der Produktion zu erhalten, ist es immer noch besser, Ihren Code mit Baumschütteln, faulem Ladung und gemeinsamem Chunk-Spalten zu bündeln (zum besseren Caching).

Es ist nicht einfach, eine optimale Ausgabe und Verhaltenskonsistenz zwischen dem Dev -Server und dem Produktionsbau zu gewährleisten. Aus diesem Grund versendet Vite mit einem vorkonfigurierten [Build-Befehl](./build.md) , der viele [Leistungsoptimierungen](./features.md#build-optimizations) aus dem Schachtel backt.

## Warum nicht mit Esbuild bündeln?

Während VITE ESBUILD nutzt, um [einige Abhängigkeiten in Dev vorzubereiten](./dep-pre-bundling.md) , verwendet Vite esbuild nicht als Bundler für Produktionsergebnisse.

Die aktuelle Plugin -API von Vite ist nicht mit `esbuild` als Bundler kompatibel. Trotz `esbuild` schnelleren, der schneller war, trug Vite die flexible Plugin -API und die Infrastruktur von Rollup stark zu seinem Erfolg im Ökosystem bei. Wir glauben vorerst, dass Rollup einen besseren Kompromiss zwischen Leistung und Flexibilität bietet.

Rollup hat auch an Leistungsverbesserungen gearbeitet und [seinen Parser in V4 auf SWC umgestellt](https://github.com/rollup/rollup/pull/5073) . Und es gibt ständige Anstrengungen, um ein Rostport von Rollup namens Rolldown zu bauen. Sobald Rolldown fertig ist, könnte es sowohl Rollup als auch Esbuild in vite ersetzen, die Build -Leistung erheblich verbessern und Inkonsistenzen zwischen Entwicklung und Build beseitigen. Sie können [Evan You's ViteConf 2023 Keynote für weitere Details](https://youtu.be/hrdwQHoAp0M) beobachten.

## Wie Vite Bezieht Sich VITE Auf Andere Ungebundene Build -Tools?

[WMR](https://github.com/preactjs/wmr) des Preact -Teams wollte einen ähnlichen Funktionssatz bereitstellen. Vite's Universal Rollup Plugin API für Dev and Build wurde davon inspiriert. WMR wird nicht mehr aufrechterhalten. Das Preact-Team empfiehlt nun vite mit [@preactjs/voreingestellten Vite](https://github.com/preactjs/preset-vite) .

[Snowpack](https://www.snowpack.dev/) war auch ein nationaler ESM-Dev-Server ohne Bundle, der im Bereich VITE sehr ähnlich war. Die Abhängigkeit von Vite ist auch von Snowpack V1 (jetzt [`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall) ) inspiriert. Die Schneeverpackung wird nicht mehr aufrechterhalten. Das Snowpack -Team arbeitet jetzt an [Astro](https://astro.build/) , einem statischen Bauherrn von Vite.

[@Web/Dev-Server](https://modern-web.dev/docs/dev-server/overview/) (zuvor `es-dev-server` ) ist ein großartiges Projekt, und der KOA-basierte Server-Setup von Vite 1.0 wurde von ihm inspiriert. Das `@web` -Dach -Projekt wird aktiv gepflegt und enthält viele andere hervorragende Tools, die auch Vite -Benutzern zugute kommen können.
