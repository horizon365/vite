# リリース

viteリリースは[セマンティックバージョン](https://semver.org/)に続きます。 [Vite NPMパッケージページ](https://www.npmjs.com/package/vite)に、Viteの最新バージョンのViteバージョンを見ることができます。

## Release Cycle

Vite does not have a fixed release cycle.

-
- **Minor** releases always contain new features and are released as needed.マイナーリリースには、常にベータプレリリースフェーズ（通常は2か月ごと）があります。
- 一般に、**主要な**リリースは[node.js EOLスケジュール](https://endoflife.date/nodejs)と一致し、事前に発表されます。これらのリリースは、生態系との長期的な議論を経験し、アルファとベータのプレリリースフェーズ（通常は毎年）を持っています。

The Vite versions ranges that are supported by the Vite team is automatically determined by:

-
-
- **2番目のメジャー**（最新のマイナーのみ）と**2番目のマイナーが**セキュリティパッチを受け取ります。
- All versions before these are no longer supported.

As an example, if the Vite latest is at 5.3.10:

- 通常のパッチは`vite@5.3`でリリースされます。
-
-
- `vite@2` and `vite@5.0` are no longer supported.ユーザーはアップグレードして更新を受信する必要があります。

Viteを定期的に更新することをお勧めします。各専攻に更新するときに、[移行ガイド](https://vite.dev/guide/migration.html)をチェックしてください。 Viteチームは、エコシステムの主要なプロジェクトと緊密に連携して、新しいバージョンの品質を確保します。 [Vite-Ecosystem-CIプロジェクト](https://github.com/vitejs/vite-ecosystem-ci)を通じてリリースする前に、新しいViteバージョンをテストします。 Viteを使用するほとんどのプロジェクトは、リリースされるとすぐにサポートを提供したり、新しいバージョンに移行することができるはずです。

## Semantic Versioning Edge Cases

### TypeScript Definitions

We may ship incompatible changes to TypeScript definitions between minor versions.これは:

- TypeScript自体がマイナーバージョン間に互換性のない変更を発行する場合があり、TypeScriptの新しいバージョンをサポートするためにタイプを調整する必要がある場合があります。
- 時には、TypeScriptの新しいバージョンでのみ利用可能な機能を採用し、TypeScriptの最小バージョンを上げる必要がある場合があります。
- TypeScriptを使用している場合は、Viteの新しいマイナーバージョンがリリースされたときに現在のマイナーをロックし、手動でアップグレードするSemver範囲を使用できます。

### esbuild

[Esbuild](https://esbuild.github.io/)は1.0.0以前であり、新しい機能やパフォーマンスの改善にアクセスするために含める必要がある場合がある場合があります。 Esbuildのバージョンを未成年者にぶつけることがあります。

### Node.js non-LTS versions

非LTS node.jsバージョン（奇数番号）は、ViteのCIの一部としてテストされていませんが、 [EOL](https://endoflife.date/nodejs)の前に機能するはずです。

## Pre Releases

Minor releases typically go through a non-fixed number of beta releases. Major releases will go through an alpha phase and a beta phase.

Pre-releases allow early adopters and maintainers from the Ecosystem to do integration and stability testing, and provide feedback. Do not use pre-releases in production. All pre-releases are considered unstable and may ship breaking changes in between. Always pin to exact versions when using pre-releases.

## Deprecations

私たちは定期的に、マイナーリリースのより良い代替手段に取って代わられた機能を非難します。非推奨機能は、タイプまたはログに記録された警告で引き続き動作します。それらは、非推奨のステータスを入力した後、次の主要なリリースで削除されます。各専攻の[移行ガイドに](https://vite.dev/guide/migration.html)は、これらの撤去がリストされ、それらのアップグレードパスを文書化します。

## 実験機能

いくつかの機能は、Viteの安定したバージョンでリリースされたときに実験としてマークされています。実験的な機能により、現実世界のエクスペリエンスを収集して、最終的なデザインに影響を与えることができます。目標は、ユーザーが生産でテストすることにより、ユーザーにフィードバックを提供できるようにすることです。実験的特徴自体は不安定であると見なされ、制御された方法でのみ使用する必要があります。これらの機能は未成年者間で変更される可能性があるため、ユーザーはそれらに依存しているときにViteバージョンを固定する必要があります。実験機能ごとに[GitHubディスカッション](https://github.com/vitejs/vite/discussions/categories/feedback?discussions_q=is%3Aopen+label%3Aexperimental+category%3AFeedback)を作成します。
