# 작업자 옵션

언급되지 않는 한,이 섹션의 옵션은 모든 개발자, 빌드 및 미리보기에 적용됩니다.

## worker.format

- **유형 :** ` 'es' | 'iife'
- **기본값 :** `'iife'`

작업자 번들의 출력 형식.

## worker.plugins

- **유형 :** [`() => (플러그인 | 플러그인 []) []`] (./ shared-options#플러그인)

작업자 번들에 적용되는 vite 플러그인. [config.plugins는](./shared-options#plugins) DEV의 작업자에게만 적용되며 빌드 대신 여기에서 구성해야합니다.
이 기능은 새로운 플러그인 인스턴스가 병렬 롤업 작업자 빌드에서 사용될 때 반환해야합니다. 따라서 `config` 후크에서 `config.worker` 옵션을 수정하면 무시됩니다.

## worker.rollupOptions

- **유형 :** [`RollupOptions`](https://rollupjs.org/configuration-options/)

작업자 번들을 구축하기위한 롤업 옵션.
