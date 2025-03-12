# 预览选项

除非另有说明，本节中的选项仅应用于预览。

## preview.host

- **类型:** `字符串 |
-

指定服务器应聆听的IP地址。

::: tip NOTE

在某些情况下，其他服务器可能会响应而不是VITE。

:::

## preview.allowedHosts

- **类型:** `字符串 | 是的
-

允许Vite响应的主机名。

## preview.port

-
-

指定服务器端口。请注意，如果已经使用了端口，Vite将自动尝试下一个可用的端口，以便这可能不是服务器最终侦听的实际端口。

**例子:**

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

- **类型:** `boolean`
-

## preview.https

-
-

## preview.open

- **类型:** `布尔 |
-

## preview.proxy

- |
-

## preview.cors

- **类型:** `布尔 |
-

为预览服务器配置 CORS。

## preview.headers

-

指定服务器响应标头。
