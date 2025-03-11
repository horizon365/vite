# Filosofia Do Projeto

## Núcleo Extensível Enxuto

O Vite não pretende cobrir todos os casos de uso para todos os usuários. A Vite visa suportar os padrões mais comuns para criar aplicativos da Web prontos para uso, mas [o núcleo vite](https://github.com/vitejs/vite) deve permanecer magro com uma pequena superfície da API para manter o projeto sustentável a longo prazo. Esse objetivo é possível graças ao [sistema de plug-in baseado em rollup da Vite](./api-plugin.md) . Os recursos que podem ser implementados como plugins externos geralmente não serão adicionados ao vite. [O Vite-Plugin-PWA](https://vite-pwa-org.netlify.app/) é um ótimo exemplo do que pode ser alcançado do Vite Core, e há muitos [plugins bem mantidos](https://github.com/vitejs/awesome-vite#plugins) para cobrir suas necessidades. O Vite trabalha em estreita colaboração com o projeto Rollup para garantir que os plug-ins possam ser usados nos projetos de rolo simples e vite o máximo possível, tentando empurrar as extensões necessárias para a API do plug-in a montante, quando possível.

## Empurrando a Teia Moderna

O Vite fornece recursos opinativos que pressionam o código moderno. Por exemplo:

- O código-fonte só pode ser escrito no ESM, onde as dependências não-ESM precisam ser [pré-concepadas como ESM](./dep-pre-bundling) para trabalhar.
- Os trabalhadores da web são incentivados a serem escritos com a [sintaxe `new Worker`](./features#web-workers) para seguir os padrões modernos.
- Os módulos Node.js não podem ser usados no navegador.

Ao adicionar novos recursos, esses padrões são seguidos para criar uma API à prova de futuro, que nem sempre pode ser compatível com outras ferramentas de construção.

## Uma abordagem pragmática do desempenho

Vite tem se concentrado no desempenho desde suas [origens](./why.md) . Sua arquitetura de servidor de desenvolvimento permite a HMR que permanece rapidamente à medida que os projetos escalam. O Vite usa ferramentas nativas como [ESBuild](https://esbuild.github.io/) e [SWC](https://github.com/vitejs/vite-plugin-react-swc) para implementar tarefas intensivas, mas mantém o restante do código no JS para equilibrar a velocidade com flexibilidade. Quando necessário, os plug -ins da estrutura tocarão em [Babel](https://babeljs.io/) para compilar o código do usuário. E durante o tempo de construção, o Vite usa atualmente [o rollup](https://rollupjs.org/) onde o tamanho do agrupamento e o acesso a um amplo ecossistema de plugins é mais importante que a velocidade bruta. A Vite continuará evoluindo internamente, usando novas bibliotecas, pois parecem melhorar o DX, mantendo sua API estável.

## Estruturas de construção em cima de Vite

Embora o Vite possa ser usado diretamente pelos usuários, ele brilha como uma ferramenta para criar estruturas. O Vite Core é a estrutura agnóstico, mas existem plugins polidos para cada estrutura da interface do usuário. Sua [API JS](./api-javascript.md) permite que os autores da estrutura do aplicativo usem recursos Vite para criar experiências personalizadas para seus usuários. O Vite inclui suporte para [primitivas SSR](./ssr.md) , geralmente presentes em ferramentas de nível superior, mas fundamental para a construção de estruturas da web modernas. E os plugins Vite completam a imagem, oferecendo uma maneira de compartilhar entre estruturas. O Vite também é um ótimo ajuste quando combinado com [estruturas de back -end](./backend-integration.md) como [Ruby](https://vite-ruby.netlify.app/) e [Laravel](https://laravel.com/docs/10.x/vite) .

## Um Ecossistema Ativo

A Evolução do Vite é uma cooperação entre os mantenedores de estrutura e plug -in, usuários e a equipe Vite. Incentivamos a participação ativa no desenvolvimento principal da Vite, uma vez que um projeto adota o Vite. Trabalhamos em estreita colaboração com os principais projetos do ecossistema para minimizar as regressões em cada liberação, auxiliadas por ferramentas como [o Vite-Ecossystem-CI](https://github.com/vitejs/vite-ecosystem-ci) . Ele nos permite executar o IC dos principais projetos usando o Vite no PRS selecionado e nos fornece um status claro de como o ecossistema reagiria a uma liberação. Nós nos esforçamos para corrigir regressões antes de atingirem os usuários e permitir que os projetos atualizem para as próximas versões assim que forem lançadas. Se você está trabalhando com o Vite, convidamos você a participar [da discórdia de Vite](https://chat.vite.dev) e se envolver no projeto também.
