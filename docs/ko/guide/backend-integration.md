# 백엔드 통합

:::tip Note
기존 백엔드 (EG Rails, Laravel)를 사용하여 HTML에 서비스를 제공하려면 자산을 제공하는 데 Vite를 사용하려면 [멋진 Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends) 에 나열된 기존 통합을 확인하십시오.

사용자 정의 통합이 필요한 경우이 안내서의 단계를 따라 수동으로 구성 할 수 있습니다.
:::

1. Vite 구성에서 항목을 구성하고 빌드 매니페스트를 활성화합니다.

   ```js twoslash [vite.config.js]
   import { defineConfig } from 'vite'
   // ---자르다---
   export default defineConfig({
     server: {
       cors: {
         // 브라우저를 통해 액세스 할 원점
         origin: 'http://my-backend.example.com',
       },
     },
     build: {
       // Outdir에서 .vite/manifest.json을 생성하십시오
       manifest: true,
       rollupOptions: {
         // 기본 .html 항목을 덮어 쓰십시오
         input: '/path/to/main.js',
       },
     },
   })
   ```

   [Module Poload Polyfill 모듈을](/ko/config/build-options.md#build-polyfillmodulepreload) 비활성화하지 않은 경우 항목에서 PolyFill도 가져와야합니다.

   ```js
   // 앱 항목의 시작을 추가하십시오
   import 'vite/modulepreload-polyfill'
   ```

2. 개발을 위해 서버의 HTML 템플릿에 다음을 주입하십시오 (로컬 URL VITE와 함께 대체 `http://localhost:5173` 실행 중) :

   ```html
   <!-- if development -->
   <script type="module" src="http://localhost:5173/@vite/client"></script>
   <script type="module" src="http://localhost:5173/main.js"></script>
   ```

   자산을 올바르게 제공하려면 두 가지 옵션이 있습니다.

   - 서버가 Vite 서버에 정적 자산 요청을 프록시하도록 구성되어 있는지 확인하십시오.
   - 생성 된 자산 URL이 상대 경로 대신 백엔드 서버 URL을 사용하여 해결되도록 [`server.origin`](/ko/config/server-options.md#server-origin) 설정하십시오.

   이미지와 같은 자산이 제대로로드하는 데 필요합니다.

   참고 0 With `@vitejs/plugin-react` 을 사용하는 경우 플러그인이 서빙중인 HTML을 수정할 수 없으므로 위의 스크립트 전에 추가해야합니다 (로컬 URL VITE와 함께 대체 `http://localhost:5173` 실행 중임).

   ```html
   <script type="module">
     import RefreshRuntime from 'http://localhost:5173/@react-refresh'
     RefreshRuntime.injectIntoGlobalHook(window)
     window.$RefreshReg$ = () => {}
     window.$RefreshSig$ = () => (type) => type
     window.__vite_plugin_react_preamble_installed__ = true
   </script>
   ```

3. 생산의 경우 : `vite build` 실행 한 후 다른 자산 파일과 함께 `.vite/manifest.json` 파일이 생성됩니다. 예제 Manifest 파일은 다음과 같습니다.

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

   - 매니페스트에는 `Record<name, chunk>` 구조가 있습니다
   - 항목 또는 동적 입력 청크의 경우 키는 프로젝트 루트의 상대 SRC 경로입니다.
   - 비 입력 청크의 경우 키는 `_` 으로 접두사가 발표 된 생성 된 파일의 기본 이름입니다.
   - [`build.cssCodeSplit`](/ko/config/build-options.md#build-csscodesplit) `false` 인 경우 생성 된 CSS 파일의 경우 키는 `style.css` 입니다.
   - 청크에는 정적 및 동적 수입에 대한 정보 (둘 다 매니페스트의 해당 청크에 매핑되는 키) 및 해당 CSS 및 자산 파일 (있는 경우)이 포함됩니다.

4. 이 파일을 사용하여 해시 파일 이름으로 링크 또는 예압 지시문을 렌더링 할 수 있습니다.

   다음은 적절한 링크를 렌더링하는 예제 HTML 템플릿입니다. 여기 구문은
   설명 만, 서버 템플릿 언어로 대체하십시오. `importedChunks`
   기능은 그림을위한 것이며 Vite에서 제공하지 않습니다.

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

   구체적으로, HTML을 생성하는 백엔드에는 매니페스트가 주어진 다음 태그가 포함되어야합니다.
   파일 및 진입 점 :

   - 진입 점 청크의 `css` 목록에있는 각 파일에 대한 `<link rel="stylesheet">` 태그
   - Entry Point의 `imports` 목록에있는 모든 청크를 재귀 적으로 팔로우하고
     가져 오기 각각의 각 CSS 파일에 대해 `<link rel="stylesheet">` 태그.
   - 진입 점 덩어리의 `file` 키에 대한 태그 (JavaScript의 경우 `<script type="module">` ,
     또는 CSS의 경우 `<link rel="stylesheet">` )
   - 선택적으로, 각 수입 된 JavaScript의 `file` 에 대한 `<link rel="modulepreload">` 태그
     덩어리는 진입 점 청크에서 시작하여 수입을 다시 재귀 적으로 따릅니다.

   위의 예제에 따라 진입 점 `views/foo.js` 의 경우 다음 태그가 생산에 포함되어야합니다.

   ```html
   <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/foo-BRBmoGS9.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   진입 점 `views/bar.js` 에 대해 다음이 포함되어야하지만

   ```html
   <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
   <script type="module" src="assets/bar-gkvgaI9m.js"></script>
   <!-- optional -->
   <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
   ```

   ::: details Pseudo implementation of `importedChunks`
   TypeScript에서 `importedChunks` 의 예를 들어있는 예제 (이것은
   프로그래밍 언어 및 템플릿 언어에 적응해야합니다) :

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
