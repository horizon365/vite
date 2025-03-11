# 플러그인

:::tip NOTE
Vite는 일반적인 웹 개발 패턴에 대한 기본 지원을 제공하는 것을 목표로합니다. Vite 또는 호환 롤업 플러그인을 검색하기 전에 [기능 안내서를](../guide/features.md) 확인하십시오. 롤업 프로젝트에서 플러그인이 필요한 많은 경우가 이미 Vite로 덮여 있습니다.
:::

플러그인 사용 방법에 대한 정보는 [플러그인을 사용하여](../guide/using-plugins) 확인하십시오.

## 공식 플러그인

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- VUE 3 단일 파일 구성 요소 지원을 제공합니다.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- VUE 3 JSX 지원을 제공합니다 ( [전용 바벨 변환을](https://github.com/vuejs/jsx-next) 통해).

### [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)

- VUE 2.7 단일 파일 구성 요소 지원을 제공합니다.

### [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

- VUE 2.7 JSX 지원을 제공합니다 ( [전용 바벨 변환을](https://github.com/vuejs/jsx-vue2/) 통해).

### [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- Esbuild와 Babel을 사용하여 작은 패키지 발자국으로 빠른 HMR을 달성하고 Babel 변환 파이프 라인을 사용할 수있는 유연성. 추가 바벨 플러그인이 없으면 빌드 중에 Esbuild 만 사용됩니다.

### [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

- 개발 중에 바벨을 SWC로 대체합니다. 생산 빌드 중에 SWC+Esbuild는 플러그인을 사용할 때 사용되며 다른 방법으로 만 Esbuild가 사용됩니다. 비표준 반응 연장이 필요하지 않은 대규모 프로젝트의 경우 콜드 스타트 및 핫 모듈 교체 (HMR)가 훨씬 빠를 수 있습니다.

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- 레거시 브라우저는 생산 빌드에 대한 지원을 제공합니다.

## 커뮤니티 플러그인

[Awesome -Vite를](https://github.com/vitejs/awesome-vite#plugins) 확인하십시오 - PR을 제출하여 플러그인을 나열 할 수도 있습니다.

## 롤업 플러그인

[Vite 플러그인은](../guide/api-plugin) 롤업 플러그인 인터페이스의 확장입니다. 자세한 내용은 [롤업 플러그인 호환 섹션을](../guide/api-plugin#rollup-plugin-compatibility) 확인하십시오.
