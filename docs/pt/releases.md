# Releases

## Release Cycle

Vite does not have a fixed release cycle.

-
-
- **Os principais** lançamentos geralmente se alinham ao [cronograma Node.JS EOL](https://endoflife.date/nodejs) e serão anunciados com antecedência. Esses lançamentos passarão por discussões de longo prazo com o ecossistema e terão fases de pré-lançamento alfa e beta (geralmente todos os anos).

The Vite versions ranges that are supported by the Vite team is automatically determined by:

-
- **O maior número anterior** (apenas para seu menor menor) e **o menor anterior** recebe correções importantes e patches de segurança.
- **O segundo a longo prazo** (apenas para o seu menor menor) e **o segundo a poucos** recebem patches de segurança.
- All versions before these are no longer supported.

As an example, if the Vite latest is at 5.3.10:

-
-
- Os patches de segurança também são de volta para `vite@3` e `vite@5.1` .
- `vite@2` e `vite@5.0` não são mais suportados. Os usuários devem atualizar para receber atualizações.

We recommend updating Vite regularly. Confira os [guias de migração](https://vite.dev/guide/migration.html) quando você atualizar para cada uma das principais. A equipe Vite trabalha em estreita colaboração com os principais projetos do ecossistema para garantir a qualidade de novas versões. Testamos novas versões de vite antes de liberá-las através do [projeto Vite-Ecossystem-CI](https://github.com/vitejs/vite-ecosystem-ci) . A maioria dos projetos que usam o Vite deve poder oferecer suporte ou migrar rapidamente para novas versões assim que forem lançadas.

## Semantic Versioning Edge Cases

### TypeScript Definitions

We may ship incompatible changes to TypeScript definitions between minor versions. This is because:

- Às vezes, o próprio Typescript envia alterações incompatíveis entre versões menores, e podemos ter que ajustar os tipos para suportar versões mais recentes do TypeScript.
- Ocasionalmente, podemos precisar adotar recursos disponíveis apenas em uma versão mais recente do TypeScript, aumentando a versão mínima necessária do TypeScript.
- Se você estiver usando o TypeScript, poderá usar um intervalo de semver que bloqueia o menor e atualize manualmente quando uma nova versão menor do Vite for lançada.

### esbuild

[O Esbuild](https://esbuild.github.io/) é pré-1.0.0 e, às vezes, tem uma mudança de ruptura, podemos precisar incluir o acesso a recursos mais recentes e melhorias de desempenho. Podemos aumentar a versão da Esbuild em um Vite Menor.

### Node.js non-LTS versions

## Pre Releases

Minor releases typically go through a non-fixed number of beta releases. Major releases will go through an alpha phase and a beta phase.

Pre-releases allow early adopters and maintainers from the Ecosystem to do integration and stability testing, and provide feedback. Do not use pre-releases in production. All pre-releases are considered unstable and may ship breaking changes in between. Sempre prenda versões exatas ao usar pré-liberação.

## Deprecações

Periodicamente, depreciamos os recursos que foram substituídos por melhores alternativas em pequenos lançamentos. Os recursos depreciados continuarão a trabalhar com um tipo ou aviso registrado. Eles serão removidos na próxima versão importante após a entrada de status depreciado. O [guia de migração](https://vite.dev/guide/migration.html) para cada principal listará essas remoções e documentará um caminho de atualização para eles.

## Características Experimentais

Alguns recursos são marcados como experimentais quando lançados em uma versão estável do Vite. Os recursos experimentais nos permitem reunir experiência no mundo real para influenciar seu design final. O objetivo é permitir que os usuários forneçam feedback testando -os em produção. As características experimentais são consideradas instáveis e devem ser usadas apenas de maneira controlada. Esses recursos podem mudar entre menores, para que os usuários devem fixar sua versão vite quando confiarem neles. Criaremos [uma discussão no GitHub](https://github.com/vitejs/vite/discussions/categories/feedback?discussions_q=is%3Aopen+label%3Aexperimental+category%3AFeedback) para cada recurso experimental.
