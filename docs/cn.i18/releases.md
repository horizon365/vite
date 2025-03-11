# 发行

Vite 版本遵循[语义版本控制](https://semver.org/)。您可以在[Vite npm 包页面](https://www.npmjs.com/package/vite)中看到最新的稳定版本。

[GitHub上提供了](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md)过去版本的完整变更日志。

## 发布周期

Vite 没有固定的发布周期。

- **补丁**发布根据需要(通常每周)发布。
- **次要**发布总是包含新功能，并根据需要发布。次要发布总是有一个 beta 预发布阶段(通常每两个月一次)。
- **主要**发布通常与[Node.js EOL 计划](https://endoflife.date/nodejs)保持一致，并将提前宣布。这些发布将与生态系统进行长期讨论，并具有 alpha 和 beta 预发布阶段(通常每年)。

Vite 团队支持的 Vite 版本范围由以下方式自动确定:

- **当前次要**版本会定期修复。
- **上一个主要**版本(仅限其最新的次要版本)和**上一个次要**版本会收到重要修复和安全补丁。
- **倒数第二个主要**版本(仅限其最新的次要版本)和**倒数第二个次要**版本会收到安全补丁。
- 在这些版本之前的版本不再支持。

例如，如果 Vite 的最新版本为 5.3.10:

- 会定期为 `vite@5.3` 发布补丁。
- 重要的修复和安全补丁将回退到 `vite@4` 和 `vite@5.2`。
- 安全补丁也将回退到 `vite@3` 和 `vite@5.1`。
- `vite@2` 和 `vite@5.0` 不再支持。用户应升级以接收更新。

我们建议定期更新 Vite。当您更新到每个主要版本时，请查看[迁移指南](https://vite.dev/guide/migration.html)。Vite 团队与生态系统中的主要项目紧密合作，以确保新版本的质量。在通过[Vite-ecosystem-ci 项目](https://github.com/vitejs/vite-ecosystem-ci)发布之前，我们测试了新的 Vite 版本。大多数使用 Vite 的项目都应该能够在发布后立即提供支持或迁移到新版本。

## 语义版本控制的边缘情况

### TypeScript 定义

我们可能会在次要版本之间发布不兼容的 TypeScript 定义更改。这是因为:

- 有时 TypeScript 本身在次要版本之间会发布不兼容的更改，我们可能需要调整类型以支持新版本的 TypeScript。
- 偶尔我们可能需要采用仅在较新版本的 TypeScript 中可用的功能，从而提高最低所需版本的 TypeScript。
- 如果您使用 TypeScript，可以使用锁定当前次要版本的 semver 范围，并在发布新的 Vite 次要版本时手动升级。

### Esbuild

[esbuild](https://esbuild.github.io/) 仍在 1.0.0 之前，有时它会有破坏性的更改，我们可能需要包含这些更改以获得较新功能和性能改进。我们可能会在 Vite 次要版本中提升 esbuild 的版本。

### Node.js 非 LTS 版本

非 LTS Node.js 版本(奇数版本)未作为 Vite CI 的一部分进行测试，但它们仍应在[EOL](https://endoflife.date/nodejs)之前工作。

## 预发布

次要版本通常会经过非固定的 beta 预发布阶段。主要版本将经历 alpha 阶段和 beta 阶段。

预发布允许早期采用者和生态系统维护者进行集成和稳定性测试，并提供反馈。请勿在生产环境中使用预发布版本。所有预发布版本都被认为是不稳定的，可能会在发布之间引入破坏性更改。使用预发布版本时，请始终将其固定在精确版本上。

## 弃用

我们会在次要版本中定期弃用被更好替代方案取代的功能。弃用的功能将继续使用类型或记录的警告。它们将在进入弃用状态后的下一个主要版本中被移除。每个主要版本的[迁移指南](https://vite.dev/guide/migration.html)将列出这些移除，并为其记录升级路径。

## 实验性功能

在稳定版本的 Vite 中发布时，某些功能被标记为实验性。实验性功能使我们能够收集现实世界的经验，以影响其最终设计。目的是让用户通过在生产环境中测试这些功能来提供反馈。实验性功能本身被认为是不稳定的，只能以受控的方式使用。这些功能可能会在次要版本之间发生变化，因此用户在依赖这些功能时必须固定 Vite 版本。我们将为每个实验性功能创建[GitHub 讨论](https://github.com/vitejs/vite/discussions/categories/feedback?discussions_q=is%3Aopen+label%3Aexperimental+category%3AFeedback)。
