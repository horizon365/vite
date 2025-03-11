# Solução De Problemas

Consulte [o guia de solução de problemas da Rollup](https://rollupjs.org/troubleshooting/) para mais informações.

Se as sugestões aqui não funcionarem, tente postar perguntas sobre [discussões no Github](https://github.com/vitejs/vite/discussions) ou no canal `#help` da [Vite Land Discord](https://chat.vite.dev) .

## CJS

### Vite CJS Node API

A compilação do CJS da API do nó do Vite é descontinuada e será removida no Vite 6. Veja a [discussão do Github](https://github.com/vitejs/vite/discussions/13928) para obter mais contexto. Você deve atualizar seus arquivos ou estruturas para importar a construção do ESM do Vite.

Em um projeto BASIC VITE, verifique se: Certifique -se:

1. O conteúdo do arquivo `vite.config.js` está usando a sintaxe ESM.
2. O arquivo `package.json` mais próximo possui `"type": "module"` ou use a extensão `.mjs` , por exemplo `.mts` `vite.config.mjs` ou `vite.config.mts` .

Para outros projetos, existem algumas abordagens gerais:

- **Configure o ESM como padrão, opte como CJS, se necessário:** adicione `"type": "module"` no projeto `package.json` . Todos os `*.js` arquivos agora são interpretados como ESM e precisam usar a sintaxe ESM. Você pode renomear um arquivo com a extensão `.cjs` para continuar usando o CJS.
- **Mantenha o CJS como padrão, opte pelo ESM, se necessário:** se o projeto `package.json` não tiver `"type": "module"` , todos os `*.js` arquivos serão interpretados como CJs. Você pode renomear um arquivo com a extensão `.mjs` para usar o ESM.
- **Importar dinamicamente o Vite:** se você precisar continuar usando o CJS, poderá importar dinamicamente o Vite usando `import('vite')` . Isso exige que seu código seja escrito em um contexto `async` , mas ainda deve ser gerenciável, pois a API da Vite é principalmente assíncrona.

Se você não tiver certeza de onde vem o aviso, você pode executar seu script com a bandeira `VITE_CJS_TRACE=true` para registrar o rastreamento da pilha:

```bash
VITE_CJS_TRACE=true vite dev
```

Se você deseja ignorar temporariamente o aviso, poderá executar seu script com a bandeira `VITE_CJS_IGNORE_WARNING=true` :

```bash
VITE_CJS_IGNORE_WARNING=true vite dev
```

Observe que os arquivos de configuração do PostCSS ainda não oferecem suporte ao ESM + TypeScript ( `.mts` ou `.ts` em `"type": "module"` ). Se você tiver configurações PostCSS com `.ts` e adicionou `"type": "module"` ao package.json, também precisará renomear a configuração do PostCSS para usar `.cts` .

## CLI

### `Error: Cannot find module 'C:\foo\bar&baz\vite\bin\vite.js'`

O caminho para a pasta do projeto pode incluir `&` , o que não funciona com `npm` no Windows ( [NPM/CMD-Shim#45](https://github.com/npm/cmd-shim/issues/45) ).

Você precisará:

- Mude para outro gerenciador de pacotes (por exemplo, `pnpm` , `yarn` )
- Remova `&` do caminho para o seu projeto

## Config

### Este pacote é apenas ESM

Ao importar um pacote ESM apenas por `require` , o seguinte erro acontece.

> Falhou em resolver "foo". Este pacote é apenas ESM, mas foi tentado carregar por `require` .

> Erro [err_require_esm]: require () de es Module /path/to/dependency.js de /path/to/vite.config.js não suportado.
> Em vez disso, altere a necessidade de index.js in /path/to/vite.config.js para um importação dinâmica () disponível em todos os módulos Commonjs.

No Node.js <= 22, os arquivos ESM não podem ser carregados por [`require`](https://nodejs.org/docs/latest-v22.x/api/esm.html#require) por padrão.

Embora possa funcionar usando [`--experimental-require-module`](https://nodejs.org/docs/latest-v22.x/api/modules.html#loading-ecmascript-modules-using-require) , ou node.js> 22, ou em outros tempos de execução, ainda recomendamos a conversão de sua configuração em ESM por:

- Adicionando `"type": "module"` ao `package.json` mais próximo
- renomear `vite.config.js` / `vite.config.ts` `vite.config.mts` `vite.config.mjs`

### `failed to load config from '/path/to/config*/vite.config.js'`

> Falha ao carregar a configuração de '/path/to/config\*/vite.config.js'
> erro ao iniciar o servidor de dev:
> Erro: a construção falhou com 1 erro:
> ERRO: Deve usar "Uper" quando houver vários arquivos de entrada

O erro acima pode ocorrer se o caminho para a pasta do projeto contiver `*` , o que o Esbuild trata como um glob. Você precisará renomear seu diretório para remover o `*` .

## Servidor De Dev

### Os pedidos são paralisados para sempre

Se você estiver usando o Linux, os limites do descritor de arquivos e os limites inotificar podem estar causando o problema. Como o Vite não agrupa a maioria dos arquivos, os navegadores podem solicitar muitos arquivos que exigem muitos descritores de arquivos, passando pelo limite.

Para resolver isso:

- Aumentar o limite do descritor de arquivo em `ulimit`

  ```shell
  # Verifique o limite atual
  $ ulimit -Sn
  # Limite de mudança (temporário)
  $ ulimit -Sn 10000 # Você pode precisar mudar o limite rígido também
  # Reinicie seu navegador
  ```

- Aumente os seguintes limites relacionados à inotificar por `sysctl`

  ```shell
  # Verifique os limites atuais
  $ sysctl fs.inotify
  # Limites de mudança (temporário)
  $ sudo sysctl fs.inotify.max_queued_events=16384
  $ sudo sysctl fs.inotify.max_user_instances=8192
  $ sudo sysctl fs.inotify.max_user_watches=524288
  ```

Se as etapas acima não funcionarem, você pode tentar adicionar `DefaultLimitNOFILE=65536` como uma configuração não contratada aos seguintes arquivos:

- /etc/systemd/system.conf
- /etc/systemd/user.conf

Para o Ubuntu Linux, pode ser necessário adicionar a linha `* - nofile 65536` ao arquivo `/etc/security/limits.conf` em vez de atualizar os arquivos de configuração do Systemd.

Observe que essas configurações persistem, mas **é necessária uma reinicialização** .

Como alternativa, se o servidor estiver em execução dentro de um vs Code DevContainer, a solicitação poderá parecer paralisada. Para corrigir este problema, consulte
[Contêineres de dev / vs por porta de código encaminhamento](#dev-containers-vs-code-port-forwarding) .

### Solicitações de rede param de carregar

Ao usar um certificado SSL autoassinado, o Chrome ignora todas as diretivas de cache e recarrega o conteúdo. Vite depende dessas diretivas de cache.

Para resolver o problema, use um certificado SSL confiável.

Veja: [Problemas de cache](https://helpx.adobe.com/mt/experience-manager/kb/cache-problems-on-chrome-with-SSL-certificate-errors.html) , [questão do Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=110649#c8)

#### macos

Você pode instalar um certificado confiável através da CLI com este comando:

```
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

Ou, importando -o para o aplicativo de acesso ao chaveiro e atualizando a confiança do seu certificado para "sempre confiar".

### 431 Solicitar Campos De Cabeçalho Muito Grandes

Quando o servidor / servidor WebSocket receber um cabeçalho HTTP grande, a solicitação será retirada e o aviso a seguir será mostrado.

> O servidor respondeu com o código de status 431. Consulte [https://vite.dev/guide/troubleSleshooting.html#\_431-request-heade-fields-large](https://vite.dev/guide/troubleshooting.html#_431-request-header-fields-too-large) .

Isso ocorre porque o Node.js limita o tamanho do cabeçalho da solicitação para mitigar [CVE-2018-12121](https://www.cve.org/CVERecord?id=CVE-2018-12121) .

Para evitar isso, tente reduzir o tamanho do cabeçalho da solicitação. Por exemplo, se o cookie for longo, exclua -o. Ou você pode usar [`--max-http-header-size`](https://nodejs.org/api/cli.html#--max-http-header-sizesize) para alterar o tamanho do cabeçalho máximo.

### Contêineres De Dev / vs Por Porta De Código Encaminhamento

Se você estiver usando um recipiente de dev ou recurso de encaminhamento de porta no código VS, pode ser necessário definir a opção [`server.host`](/pt/config/server-options.md#server-host) como `127.0.0.1` na configuração para fazê -la funcionar.

Isso ocorre porque [o recurso de encaminhamento de porta no código VS não suporta IPv6](https://github.com/microsoft/vscode-remote-release/issues/7029) .

Veja [#16522](https://github.com/vitejs/vite/issues/16522) para mais detalhes.

## HMR

### Vite detecta uma mudança de arquivo, mas o HMR não está funcionando

Você pode estar importando um arquivo com um caso diferente. Por exemplo, `src/foo.js` existe e `src/bar.js` contém:

```js
import './Foo.js' // deve ser './foo.js'
```

Edição relacionada: [#964](https://github.com/vitejs/vite/issues/964)

### Vite não detecta uma mudança de arquivo

Se você estiver executando o Vite com o WSL2, o Vite não pode assistir a alterações de arquivo em algumas condições. Veja [`server.watch` opção](/pt/config/server-options.md#server-watch) .

### Uma recarga completa acontece em vez de HMR

Se o HMR não for tratado pela Vite ou um plug -in, uma recarga completa acontecerá, pois é a única maneira de atualizar o estado.

Se o HMR for tratado, mas estiver dentro de uma dependência circular, uma recarga completa também recuperará a ordem de execução. Para resolver isso, tente quebrar o loop. Você pode executar `vite --debug hmr` para registrar o caminho de dependência circular se uma alteração de arquivo o acionar.

## Construir

### O arquivo construído não funciona devido ao erro do CORS

Se a saída do arquivo HTML foi aberta com o protocolo `file` , os scripts não serão executados com o seguinte erro.

> Acesso ao script em 'arquivo: ///foo/bar.js' de origem 'null' foi bloqueado pela política da CORS: as solicitações de origem cruzada são suportadas apenas para esquemas de protocolo: http, dados, app isolado, cromo-extensão, cromo, https, cromado-ignorados.

> Solicitação de origem cruzada: a mesma política de origem não permite a leitura do recurso remoto no arquivo: ///foo/bar.js. (Motivo: os CORS solicitam não http).

Veja [Motivo: os CORs solicitam não http - http | Mdn] ( [https://developer.mozilla.org/en-us/docs/web/http/cors/errors/corsRequestNothttp](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp) ) Para obter mais informações sobre por que isso acontece.

Você precisará acessar o arquivo com `http` protocolo. A maneira mais fácil de conseguir isso é executar `npx vite preview` .

## Dependências Otimizadas

### Deps pré-burburizados desatualizados ao vincular a um pacote local

A chave de hash usada para invalidar dependências otimizadas depende do conteúdo da bloqueio da embalagem, dos patches aplicados às dependências e das opções no arquivo de configuração do Vite que afeta o agrupamento de módulos de nó. Isso significa que o Vite detectará quando uma dependência é substituída usando um recurso como [substituição do NPM](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides) e recupere suas dependências no próximo servidor. O Vite não invalida as dependências quando você usar um recurso como [o link NPM](https://docs.npmjs.com/cli/v9/commands/npm-link) . Caso você vincule ou desvincule uma dependência, você precisará forçar a reepitização no próximo servidor, iniciando `vite --force` . Recomendamos o uso de substituições, que são suportadas agora por todos os gerenciadores de pacotes (consulte também [as substituições do PNPM](https://pnpm.io/package_json#pnpmoverrides) e [as resoluções de fios](https://yarnpkg.com/configuration/manifest/#resolutions) ).

## Gargalos De Desempenho

Se você sofrer qualquer gargalo de desempenho do aplicativo, resultando em tempos de carregamento lento, poderá iniciar o inspetor Node.js embutido com seu servidor de dev vite ou ao criar seu aplicativo para criar o perfil da CPU:

::: code-group

```bash [dev server]
vite --profile --open
```

```bash [build]
vite build --profile
```

:::

::: tip Vite Dev Server
Depois que seu aplicativo for aberto no navegador, aguarde o acabamento e volte para o terminal e pressione a tecla `p` (interromperá o inspetor Node.js), pressione `q` tecla para interromper o servidor dev.
:::

O inspetor Node.js gerará `vite-profile-0.cpuprofile` na pasta raiz, vá para [https://www.speedscope.app/](https://www.speedscope.app/) e envie o perfil da CPU usando o botão `BROWSE` para inspecionar o resultado.

Você pode instalar [o inspetor de vite-plugin](https://github.com/antfu/vite-plugin-inspect) , o que permite inspecionar o estado intermediário dos plug-ins de vite e também pode ajudá-lo a identificar quais plugins ou middlewares são o gargalo em seus aplicativos. O plug -in pode ser usado nos modos de desenvolvimento e construção. Verifique o arquivo ReadMe para obter mais detalhes.

## Outros

### Módulo externalizado para compatibilidade do navegador

Quando você usa um módulo Node.js no navegador, o Vite produzirá o seguinte aviso.

> O módulo "FS" foi externalizado para compatibilidade do navegador. Não é possível acessar "FS.Readfile" no código do cliente.

Isso ocorre porque o Vite não é automaticamente os módulos Polyfill Node.js.

Recomendamos evitar módulos Node.js para o código do navegador para reduzir o tamanho do pacote, embora você possa adicionar poli -preenchimentos manualmente. Se o módulo for importado de uma biblioteca de terceiros (que deve ser usada no navegador), é aconselhável relatar o problema à respectiva biblioteca.

### Erro de sintaxe / tipo de erro acontece

O Vite não pode manipular e não suporta código que seja executado apenas no modo não rito (modo desleixado). Isso ocorre porque o Vite usa o ESM e é sempre [o modo rigoroso](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) dentro do ESM.

Por exemplo, você pode ver esses erros.

> [Erro] com declarações não podem ser usadas com o formato de saída "ESM" devido ao modo rigoroso

> TypeError: não é possível criar a propriedade 'foo' em boolean 'false'

Se esses códigos forem usados dentro de dependências, você poderá usar [`patch-package`](https://github.com/ds300/patch-package) (ou [`yarn patch`](https://yarnpkg.com/cli/patch) ou [`pnpm patch`](https://pnpm.io/cli/patch) ) para uma escotilha de fuga.

### Extensões do navegador

Algumas extensões de navegador (como bloqueadores de anúncios) podem impedir que o cliente Vite envie solicitações para o servidor vite dev. Você pode ver uma tela branca sem erros registrados neste caso. Tente desativar extensões se você tiver esse problema.

### Links cruzados no Windows

Se houver links de tração cruzada no seu projeto no Windows, o Vite pode não funcionar.

Um exemplo de links de tração cruzada são:

- Uma unidade virtual ligada a uma pasta por `subst` comando
- Um symlink/junção para uma unidade diferente por `mklink` comando (por exemplo, cache global de Yarn)

Edição relacionada: [#10802](https://github.com/vitejs/vite/issues/10802)
