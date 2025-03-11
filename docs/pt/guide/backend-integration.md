# Integração De Back -End

:::tip Note
Se você deseja servir o HTML usando um back -end tradicional (por exemplo, Rails, Laravel), mas use o Vite para servir ativos, verifique se as integrações existentes listadas no [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) .

Se você precisar de uma integração personalizada, poderá seguir as etapas deste guia para configurá -lo manualmente
:::

1. Na sua configuração vite, configure a entrada e habilite o manifesto de construção:

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   // ---corte---
   export default defineConfig({
     server: {
       cors: {
         // a origem que você estará acessando via navegador
         origin: 'http://my-backend.example.com',
       },
     },
     build: {
       // gerar .vite/manifest.json em tiro
       manifest: true,
       rollupOptions: {
         // substituir a entrada de padrão .html
         input: '/path/to/main.js',
       },
     },
   })
   ```

   Se você não desativou o [módulo pré -carregado polyfill](/pt/config/build-options.md#build-polyfillmodulepreload) , também precisará importar o polyfill em sua entrada

   ```js
   // Adicione o início da entrada do seu aplicativo
   import 'vite/modulepreload-polyfill'
   ```

2. Para o desenvolvimento, injete o seguinte no modelo HTML do seu servidor (substitua `http://localhost:5173` pelo URL Local Vite está em execução):

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   Para servir adequadamente ativos, você tem duas opções:

   - Verifique se o servidor está configurado para solicitações de ativos estáticos proxy para o servidor Vite
   - Defina [`server.origin`](/pt/config/server-options.md#server-origin) para que os URLs de ativos gerados sejam resolvidos usando o URL do servidor de back-end em vez de um caminho relativo

   Isso é necessário para que ativos como imagens carreguem corretamente.

   Observe que se você estiver usando o React com `@vitejs/plugin-react` , também precisará adicionar isso antes dos scripts acima, pois o plug -in não poderá modificar o HTML que você está servindo (o substituto `http://localhost:5173` pelo URL local está em execução):

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. Para produção: Após a execução `vite build` , um arquivo `.vite/manifest.json` será gerado juntamente com outros arquivos de ativos. Um exemplo de arquivo de manifesto se parece com o seguinte:

   ```json [.vite/manifest.json]
   {
     "_shared-B7PI925R.js": {
       "file": "assets/shared-B7PI925R.js",
       "name": "shared",
       "css": ["assets/shared-ChJ_j-JJ.css"]
     },
     "_shared-ChJ_j-JJ.css": {
       "file": "assets/shared-ChJ_j-JJ.css",
       "src": "_shared-ChJ_j-JJ.css"
     },
     "baz.js": {
       "file": "assets/baz-B2H3sXNv.js",
       "name": "baz",
       "src": "baz.js",
       "isDynamicEntry": true
     },
     "views/bar.js": {
       "file": "assets/bar-gkvgaI9m.js",
       "name": "bar",
       "src": "views/bar.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "dynamicImports": ["baz.js"]
     },
     "views/foo.js": {
       "file": "assets/foo-BRBmoGS9.js",
       "name": "foo",
       "src": "views/foo.js",
       "isEntry": true,
       "imports": ["_shared-B7PI925R.js"],
       "css": ["assets/foo-5UjPuW-k.css"]
     }
   }
   ```

   - O manifesto tem uma estrutura `Record<name, chunk>`
   - Para pedaços de entrada ou entrada dinâmica, a chave é o caminho SRC relativo da raiz do projeto.
   - Para pedaços de entrada sem entrada, a chave é o nome base do arquivo gerado prefixado com `_` .
   - Para o arquivo CSS gerado quando [`build.cssCodeSplit`](/pt/config/build-options.md#build-csscodesplit) é `false` , a chave é `style.css` .
   - Os pedaços conterão informações sobre suas importações estáticas e dinâmicas (ambas são chaves que mapeiam para o pedaço correspondente no manifesto) e também seus CSs e arquivos de ativos correspondentes (se houver).

4. Você pode usar este arquivo para renderizar links ou diretivas de pré -carga com nomes de arquivos de hash.

   Aqui está um exemplo de modelo HTML para renderizar os links adequados. A sintaxe aqui é para
   Somente explicação, substitua a linguagem de modelos do servidor. O `importedChunks`
   A função é para ilustração e não é fornecida pelo Vite.

   ```html
   <!-- if production -->

   <!-- for cssFile of manifest[name].css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <!-- for chunk of importedChunks(manifest, name) -->
   <!-- for cssFile of chunk.css -->
   <link rel="stylesheet" href="/{{ cssFile }}" />

   <script type="module" src="/{{ manifest[name].file }}"></script>

   <!-- for chunk of importedChunks(manifest, name) -->
   <link rel="modulepreload" href="/{{ chunk.file }}" />
   ```

   Especificamente, um HTML de geração de back -end deve incluir as seguintes tags, dadas um manifesto
   Arquivo e um ponto de entrada:

   - Uma tag `<link rel="stylesheet">` para cada arquivo na lista de `css` ponto de entrada
   - Siga recursivamente todos os pedaços na lista `imports` do ponto de entrada e inclua um
     `<link rel="stylesheet">` tag para cada arquivo CSS de cada pedaço importado.
   - Uma tag para a chave `file` do ponto de entrada ( `<script type="module">` para JavaScript,
     ou `<link rel="stylesheet">` para CSS)
   - Opcionalmente, `<link rel="modulepreload">` tag para o `file` de cada javascript importado
     Chunk, novamente recursivamente seguindo as importações a partir do pedaço de ponto de entrada.

   Seguindo o exemplo do exemplo acima, para o ponto de entrada `views/foo.js` as seguintes tags devem ser incluídas na produção:

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   Enquanto o seguinte deve ser incluído para o ponto de entrada `views/bar.js` :

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details Pseudo implementation of `importedChunks`
   Um exemplo de implementação `importedChunks`
   Precisa ser adaptado para sua linguagem de programação e linguagem de modelos):

   ```ts
   import type { Manifest, ManifestChunk } from 'vite'

   export default function importedChunks(
     manifest: Manifest,
     name: string,
   ): ManifestChunk[] {
     const seen = new Set<string>()

     function getImportedChunks(chunk: ManifestChunk): ManifestChunk[] {
       const chunks: ManifestChunk[] = []
       for (const file of chunk.imports ?? []) {
         const importee = manifest[file]
         if (seen.has(file)) {
           continue
         }
         seen.add(file)

         chunks.push(...getImportedChunks(importee))
         chunks.push(importee)
       }

       return chunks
     }

     return getImportedChunks(manifest[name])
   }
   ```

   :::
