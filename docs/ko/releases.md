# 릴리스

Vite 릴리스는 [시맨틱 버전을](https://semver.org/) 따릅니다. [Vite NPM 패키지 페이지](https://www.npmjs.com/package/vite) 에서 Vite의 최신 안정 버전을 볼 수 있습니다.

[Github에서 과거 릴리스의 전체 변경 사항을 사용할 수 있습니다](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md) .

## Release Cycle

Vite does not have a fixed release cycle.

- **패치** 릴리스는 필요에 따라 (보통 매주) 릴리스됩니다.
- **사소한** 릴리스에는 항상 새로운 기능이 포함되어 있으며 필요에 따라 릴리스됩니다. 사소한 릴리스에는 항상 베타 사전 방출 단계 (보통 2 개월마다)가 있습니다.
- **주요** 릴리스는 일반적으로 [Node.js EOL 일정](https://endoflife.date/nodejs) 과 일치하며 미리 발표됩니다. 이 릴리스는 생태계와의 장기 토론을 거치며 알파 및 베타 사전 릴리스 단계 (보통 매년)가 있습니다.

The Vite versions ranges that are supported by the Vite team is automatically determined by:

-
- **이전 전공** (최신 미성년자)과 **이전의 미성년자는** 중요한 수정 및 보안 패치를받습니다.
- **2 대 전공** (최신 미성년자)과 **2 대 마이너는** 보안 패치를받습니다.
- All versions before these are no longer supported.

As an example, if the Vite latest is at 5.3.10:

- 일반 패치는 `vite@5.3` 에 대해 릴리스됩니다.
- 중요한 수정 및 보안 패치는 `vite@4` 과 `vite@5.2` 으로 백 포트됩니다.
- 보안 패치도 `vite@3` 및 `vite@5.1` 으로 백 포트됩니다.
- `vite@2` 과 `vite@5.0` 더 이상 지원되지 않습니다. 사용자는 업데이트를 받기 위해 업그레이드해야합니다.

Vite를 정기적으로 업데이트하는 것이 좋습니다. 각 전공으로 업데이트 할 때 [마이그레이션 가이드를](https://vite.dev/guide/migration.html) 확인하십시오. Vite 팀은 생태계의 주요 프로젝트와 긴밀히 협력하여 새로운 버전의 품질을 보장합니다. [Vite-Ecosystem-CI 프로젝트를](https://github.com/vitejs/vite-ecosystem-ci) 통해 새로운 Vite 버전을 공개하기 전에 새로운 Vite 버전을 테스트합니다. Vite를 사용하는 대부분의 프로젝트는 출시 되 자마자 지원을 신속하게 지원하거나 새 버전으로 마이그레이션 할 수 있어야합니다.

## Semantic Versioning Edge Cases

### TypeScript Definitions

We may ship incompatible changes to TypeScript definitions between minor versions. 이것은 다음과 같습니다.

- 때때로 TypeScript 자체는 마이너 버전간에 호환되지 않는 변경 사항을 제공하며 최신 버전의 TypeScript를 지원하기 위해 유형을 조정해야 할 수도 있습니다.
- 때때로 우리는 최신 버전의 TypeScript에서만 사용할 수있는 기능을 채택하여 최소 필수 버전의 TypeScript 버전을 채택해야 할 수도 있습니다.
- TypeScript를 사용하는 경우 새 마이너 버전의 VITE가 해제 될 때 현재 마이너 및 수동으로 업그레이드되는 SEMVER 범위를 사용할 수 있습니다.

### esbuild

[Esbuild](https://esbuild.github.io/) 는 1.0.0 이전이며 때로는 새로운 기능 및 성능 향상에 액세스하기 위해 포함해야 할 변화가 있습니다. 우리는 Vite Minor에서 Esbuild의 버전을 충돌시킬 수 있습니다.

### Node.js non-LTS versions

LTS Node.js 버전 (Odd-Numbered)은 Vite CI의 일부로 테스트되지 않지만 [EOL](https://endoflife.date/nodejs) 이전에는 여전히 작동해야합니다.

## Pre Releases

Minor releases typically go through a non-fixed number of beta releases. Major releases will go through an alpha phase and a beta phase.

Pre-releases allow early adopters and maintainers from the Ecosystem to do integration and stability testing, and provide feedback. Do not use pre-releases in production. All pre-releases are considered unstable and may ship breaking changes in between. Always pin to exact versions when using pre-releases.

## 감가 상각

우리는 주기적으로 사소한 릴리스에서 더 나은 대안으로 대체 된 기능을 사용하지 않습니다. 더 이상 사용되지 않은 기능은 유형 또는 기록 된 경고로 계속 작동합니다. 더 이상 사용되지 않은 상태로 입력 한 후 다음 주요 릴리스에서 제거됩니다. 각 전공의 [마이그레이션 안내서는](https://vite.dev/guide/migration.html) 이러한 제거를 나열하고이를위한 업그레이드 경로를 문서화합니다.

## 실험적인 특징

일부 기능은 안정적인 버전의 VITE로 출시 될 때 실험적으로 표시됩니다. 실험적 기능을 통해 최종 디자인에 영향을 미치기 위해 실제 경험을 수집 할 수 있습니다. 목표는 사용자가 프로덕션에서 테스트하여 피드백을 제공 할 수 있도록하는 것입니다. 실험 특징 자체는 불안정한 것으로 간주되며 제어 된 방식으로 만 사용해야합니다. 이러한 기능은 미성년자간에 변경 될 수 있으므로 사용자는 VITE 버전에 의존 할 때 VITE 버전을 고정해야합니다. 각 실험 기능에 대한 [GitHub 토론을](https://github.com/vitejs/vite/discussions/categories/feedback?discussions_q=is%3Aopen+label%3Aexperimental+category%3AFeedback) 만들 것입니다.
