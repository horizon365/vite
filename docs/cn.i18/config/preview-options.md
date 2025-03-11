# 预览选项

除非另有说明，本节中的选项仅应用于预览。

## preview.host

- |
-

指定服务器应监听的IP地址。

::: tip NOTE

在某些情况下，其他服务器可能会响应而不是 Vite。

:::

## preview.allowedHosts

- |
-

Vite 允许响应的主机名。

## preview.port

-
-

指定服务器端口。请注意，如果端口已被占用，Vite 将自动尝试下一个可用的端口，因此这可能不是服务器最终监听的实际端口。

**示例:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

-
-

## preview.https

-
-

## preview.open

- |
-

## preview.proxy

- |
-

## preview.cors

- |
-

为预览服务器配置 CORS。

## preview.headers

-

指定服务器响应头。
