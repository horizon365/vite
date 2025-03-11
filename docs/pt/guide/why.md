# Por Que Vite

## Os Problemas

Antes de os módulos ES estavam disponíveis nos navegadores, os desenvolvedores não tinham mecanismo nativo para a criação de JavaScript de maneira modularizada. É por isso que todos estamos familiarizados com o conceito de "agrupamento": usando ferramentas que rastejam, processam e concatam nossos módulos de origem em arquivos que podem ser executados no navegador.

Com o tempo, vimos ferramentas como [Webpack](https://webpack.js.org/) , [Rollup](https://rollupjs.org) e [Parcel](https://parceljs.org/) , o que melhorou bastante a experiência de desenvolvimento para desenvolvedores de front -end.

No entanto, à medida que construímos cada vez mais aplicações ambiciosas, a quantidade de JavaScript com a qual estamos lidando também está aumentando drasticamente. Não é incomum que projetos em larga escala contenham milhares de módulos. Estamos começando a atingir um gargalo de desempenho para ferramentas baseadas em JavaScript: muitas vezes pode levar uma espera excessivamente longa (às vezes até minutos!) Para aumentar um servidor de desenvolvimento e, mesmo com a substituição de módulos quentes (HMR), as edições de arquivo podem levar alguns segundos para serem refletidos no navegador. O loop de feedback lento pode afetar bastante a produtividade e a felicidade dos desenvolvedores.

O Vite pretende abordar esses problemas, aproveitando novos avanços no ecossistema: a disponibilidade dos módulos N nativos no navegador e a ascensão das ferramentas JavaScript escritas em idiomas de compilação a nativa.

### Iniciar O Servidor Lento

Ao iniciar a frio do servidor de desenvolvimento, uma configuração de compilação baseada em Bundler precisa rastejar e criar ansiosamente todo o seu aplicativo antes que ele possa ser servido.

O Vite melhora o tempo de início do servidor de desenvolvimento dividindo os módulos em um aplicativo em duas categorias: **dependências** e **código -fonte** .

- **As dependências** são principalmente JavaScript simples que não mudam frequentemente durante o desenvolvimento. Algumas grandes dependências (por exemplo, bibliotecas de componentes com centenas de módulos) também são bastante caros de processar. As dependências também podem ser enviadas em vários formatos de módulo (por exemplo, ESM ou Commonjs).

  Vite [Pré-Bundles Dependências](./dep-pre-bundling.md) usando [ESBuild](https://esbuild.github.io/) . O ESBUILD está escrito nas dependências GO e pré-bundas 10-100X mais rápido que os pacotes baseados em JavaScript.

- **O código-fonte** geralmente contém JavaScript que não é da planície que precisa de transformar (por exemplo, JSX, CSS ou componentes Vue/Siete) e será editado com muita frequência. Além disso, nem todo o código-fonte precisa ser carregado ao mesmo tempo (por exemplo, com divisão de código baseada em rota).

  O Vite serve código -fonte sobre [o ESM nativo](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) . Isso está essencialmente deixando o navegador assumir parte do trabalho de um empurrador: o Vite precisa apenas transformar e servir o código -fonte sob demanda, conforme o navegador solicita. O código atrás das importações dinâmicas condicionais é processado apenas se realmente usado na tela atual.

<script setup>
import bundlerSvg from '../../images/bundler.svg?raw'
import esmSvg from '../../images/esm.svg?raw'
</script>
<svg-image :svg="bundlerSvg" />
<svg-image :svg="esmSvg" />

### Atualizações Lentas

Quando um arquivo é editado em uma configuração de compilação baseada em Bundler, é ineficiente reconstruir todo o pacote por um motivo óbvio: a velocidade de atualização se degradará linearmente com o tamanho do aplicativo.

Em alguns pacotes, o servidor de desenvolvimento executa o agrupamento na memória, para que ele precise invalidar parte do gráfico do módulo quando um arquivo muda, mas ainda precisa recrutar o pacote inteiro e recarregar a página da web. Reconstruir o pacote pode ser caro e recarregar a página sopra o estado atual do aplicativo. É por isso que alguns pacotes suportam a substituição do módulo quente (HMR): permitindo que um módulo "substitua" a si mesmo sem afetar o restante da página. Isso melhora bastante o DX - no entanto, na prática, descobrimos que mesmo a velocidade de atualização do HMR se deteriora significativamente à medida que o tamanho do aplicativo cresce.

No Vite, o HMR é realizado sobre o ESM nativo. Quando um arquivo é editado, o Vite precisa apenas invalidar com precisão a cadeia entre o módulo editado e o limite HMR mais próximo (na maioria das vezes apenas o próprio módulo), tornando as atualizações de HMR constantemente rápidas, independentemente do tamanho do seu aplicativo.

O Vite também aproveita os cabeçalhos HTTP para acelerar as recargas de página inteira (novamente, deixe o navegador fazer mais trabalho para nós): as solicitações do módulo de código -fonte são condicionadas via `304 Not Modified` e as solicitações de módulos de dependência são fortemente armazenadas em cache por `Cache-Control: max-age=31536000,immutable` para que não acertem o servidor novamente depois de cache.

Depois de experimentar o quão rápido é o Vite, duvidamos que você esteja disposto a suportar o desenvolvimento agrupado novamente.

## Por Que Agrupar Para Produção

Embora o ESM nativo agora seja amplamente suportado, o envio de ESM de produção na produção ainda é ineficiente (mesmo com HTTP/2) devido às viagens de renda de rede adicionais causadas por importações aninhadas. Para obter o desempenho ideal de carregamento na produção, ainda é melhor agrupar seu código com troca de árvores, carregamento preguiçoso e divisão comum (para um cache melhor).

Garantir a saída ideal e a consistência comportamental entre o servidor de desenvolvimento e a construção de produção não é fácil. É por isso que o Vite Ships com um [comando de construção](./build.md) pré-configurado que assa em muitas [otimizações de desempenho](./features.md#build-optimizations) pronta para uso.

## Por que não agrupar com Esbuild?

Enquanto o Vite aproveita a Esbuild para [pré-embalar algumas dependências no Dev](./dep-pre-bundling.md) , o Vite não usa o Esbuild como um empacotador para compilações de produção.

A API atual do plug -in da Vite não é compatível com o uso `esbuild` como um empacotador. Apesar de `esbuild` ser mais rápido, a adoção da Vite da API flexível de plug -in da Rollup e a infraestrutura contribuiu fortemente para o seu sucesso no ecossistema. Por enquanto, acreditamos que a Rollup oferece uma melhor troca de desempenho-VS-flexibilidade.

A Rollup também tem trabalhado em melhorias de desempenho, [trocando seu analisador para o SWC no V4](https://github.com/rollup/rollup/pull/5073) . E há um esforço contínuo para construir um portão de ferrugem de Rollup chamado Rolldown. Depois que o rolo estiver pronto, ele poderá substituir o Rollup e o Esbuild no Vite, melhorando significativamente o desempenho da construção e removendo inconsistências entre desenvolvimento e construção. Você pode assistir [à palestra VITECONF 2023 EVAN You para obter mais detalhes](https://youtu.be/hrdwQHoAp0M) .

## Como O Vite Se Relaciona Com Outras Ferramentas De Compilação Sem Ponte?

[A WMR](https://github.com/preactjs/wmr) da equipe PREACT procurou fornecer um conjunto de recursos semelhantes. A API Universal Rollup Plugin da Vite para Dev e Build foi inspirada por ela. A WMR não é mais mantida. A equipe PREACT agora recomenda o Vite com [@preactjs/predefinição-vite](https://github.com/preactjs/preset-vite) .

[O Snowpack](https://www.snowpack.dev/) também era um servidor de dev native não-Bundle, muito semelhante ao Vite. O pré-incentivo de dependência da Vite também é inspirado no Snowpack V1 (agora [`esinstall`](https://github.com/snowpackjs/snowpack/tree/main/esinstall) ). Snowpack não está mais sendo mantido. A equipe de Snowpack agora está trabalhando no [Astro](https://astro.build/) , um construtor de locais estáticos alimentado por Vite.

[@Web/Dev-Server](https://modern-web.dev/docs/dev-server/overview/) (anteriormente `es-dev-server` ) é um ótimo projeto e a configuração do servidor baseada em KOA do Vite 1.0 foi inspirada nele. O projeto `@web` Umbrella é mantido ativamente e contém muitas outras excelentes ferramentas que também podem beneficiar os usuários do Vite.
