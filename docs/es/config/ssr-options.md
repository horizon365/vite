# Opciones de SSR

A menos que se indique, las opciones en esta sección se aplican tanto al desarrollo como a la compilación.

## ssr.external

- **Tipo:** `cadena [] | verdadero
- **RELACIONADO:** [SSR externos](/es/guide/ssr#ssr-externals)

Externalizar las dependencias dadas y sus dependencias transitivas para la SSR. Por defecto, todas las dependencias están externalizadas, excepto las dependencias vinculadas (para HMR). Si prefiere externalizar la dependencia vinculada, puede pasar su nombre a esta opción.

Si `true` , todas las dependencias, incluidas las dependencias vinculadas, están externalizadas.

Tenga en cuenta que las dependencias listadas explícitamente (usando el tipo `string[]` ) siempre tendrán prioridad si también se enumeran en `ssr.noExternal` (usando cualquier tipo).

## ssr.noExternal

- **Tipo:** `cadena | Regexp | (cadena | Regexp) [] | verdadero
- **RELACIONADO:** [SSR externos](/es/guide/ssr#ssr-externals)

Evite que las dependencias listadas se externalicen para la SSR, que se incluirán en la construcción. Por defecto, solo las dependencias vinculadas no están externalizadas (para HMR). Si prefiere externalizar la dependencia vinculada, puede pasar su nombre a la opción `ssr.external` .

Si `true` , no se externalizan dependencias. Sin embargo, las dependencias enumeradas explícitamente en `ssr.external` (usando `string[]` de tipo 2) pueden tener prioridad y aún estar externalizadas. Si se establece `ssr.target: 'node'` , Node.js Built-Ins también se externalizará de forma predeterminada.

Tenga en cuenta que si se configuran `ssr.noExternal: true` y `ssr.external: true` , `ssr.noExternal` toma prioridad y no se externalizan dependencias.

## ssr.target

- **Tipo:** `'nodo' | 'WebWorker'`
- **Valor predeterminado:** `node`

Construya el objetivo para el servidor SSR.

## ssr.resolve.conditions

- **Tipo:** `string[]`
- **Predeterminado:** `['módulo', 'nodo', 'desarrollo|producción '] ` (`defaultServerconditions`) (`[' módulo ',' navegador ', desarrollo de|producción ']` (`defaultClientConditions`) for ` ssr.target ===' WebWorker'`)
- **Relacionado:** [Resolver condiciones](./shared-options.md#resolve-conditions)

Estas condiciones se utilizan en la tubería del complemento y solo afectan las dependencias no externalizadas durante la construcción de SSR. Use `ssr.resolve.externalConditions` para afectar las importaciones externalizadas.

## ssr.resolve.externalConditions

- **Tipo:** `string[]`
- **Valor predeterminado:** `['node']`

Condiciones que se utilizan durante la importación de SSR (incluida `ssrLoadModule` ) de dependencias directas externalizadas (dependencias externas importadas por VITE).

:::tip

Al usar esta opción, asegúrese de ejecutar el nodo con [el indicador `--conditions`](https://nodejs.org/docs/latest/api/cli.html#-c-condition---conditionscondition) con los mismos valores tanto en Dev como en la compilación para obtener un comportamiento consistente.

Por ejemplo, al configurar `['node', 'custom']` , debe ejecutar `NODE_OPTIONS='--conditions custom' vite` en dev y `NODE_OPTIONS="--conditions custom" node ./dist/server.js` después de la compilación.

:::

### ssr.resolve.mainFields

- **Tipo:** `string[]`
- **Valor predeterminado:** `['module', 'jsnext:main', 'jsnext']`

Lista de campos en `package.json` para intentar al resolver el punto de entrada de un paquete. Nota Esto toma una precedencia menor que las exportaciones condicionales resueltas desde el campo `exports` : si un punto de entrada se resuelve con éxito a partir de `exports` , el campo principal se ignorará. Esta configuración solo afecta las dependencias no externalizadas.
