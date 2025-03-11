# Variables Y Modos Env Envían

Vite expone ciertas constantes bajo el objeto `import.meta.env` especial. Estas constantes se definen como variables globales durante el desarrollo y se reemplazan estáticamente en el tiempo de construcción para que la demanda de árboles sea efectiva.

## Constantes incorporadas

Algunas constantes incorporadas están disponibles en todos los casos:

- **`import.meta.env.MODE`** : {String} en el [modo](#modes) en que se ejecuta la aplicación.

- **`import.meta.env.BASE_URL`** : {String} la URL base de la que se está sirviendo la aplicación. Esto está determinado por la [opción de configuración `base`](/es/config/shared-options.md#base) .

- **`import.meta.env.PROD`** : {boolean} si la aplicación se está ejecutando en producción (ejecutando el servidor Dev con `NODE_ENV='production'` o ejecutando una aplicación construida con `NODE_ENV='production'` ).

- **`import.meta.env.DEV`** : {boolean} si la aplicación se está ejecutando en desarrollo (siempre lo opuesto a `import.meta.env.PROD` )

- **`import.meta.env.SSR`** : {boolean} si la aplicación se está ejecutando en el [servidor](./ssr.md#conditional-logic) .

## Variables De Envío

Vite expone las variables ENV en `import.meta.env` objeto como cadenas automáticamente.

Para evitar que las variables Env accidentalmente fugan al cliente, solo las variables prefijadas con `VITE_` están expuestas a su código procesado por VITE. Por ejemplo, para las siguientes variables env:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

Solo `VITE_SOME_KEY` se expusirá como `import.meta.env.VITE_SOME_KEY` al código fuente de su cliente, pero `DB_PASSWORD` no lo hará.

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // indefinido
```

Si desea personalizar el prefijo de variables ENV, consulte la opción [EnvPrefix](/es/config/shared-options.html#envprefix) .

:::tip Env parsing
Como se muestra arriba, `VITE_SOME_KEY` es un número pero devuelve una cadena cuando se analiza. Lo mismo también sucedería para las variables de boolean env. Asegúrese de convertir al tipo deseado al usarlo en su código.
:::

### `.env` archivos

VITE usa [Dotenv](https://github.com/motdotla/dotenv) para cargar variables de entorno adicionales de los siguientes archivos en su [directorio de entorno](/es/config/shared-options.md#envdir) :

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

:::tip Env Loading Priorities

Un archivo ENV para un modo específico (por ejemplo, `.env.production` ) tendrá una prioridad más alta que uno genérico (por ejemplo, `.env` ).

VITE siempre se cargará `.env` y `.env.local` además del archivo `.env.[mode]` específico de modo. Las variables declaradas en archivos específicos del modo tendrán prioridad sobre las de los archivos genéricos, pero las variables definidas solo en `.env` o `.env.local` seguirán disponibles en el entorno.

Además, las variables de entorno que ya existen cuando se ejecuta VITE tienen la más alta prioridad y no serán sobrescribidas por `.env` archivos. Por ejemplo, cuando se ejecuta `VITE_SOME_KEY=123 vite build` .

`.env` Los archivos se cargan al comienzo de VITE. Reinicie el servidor después de hacer cambios.

:::

Además, Vite usa [Dotenv-Expand](https://github.com/motdotla/dotenv-expand) para expandir las variables escritas en archivos ENV fuera de la caja. Para obtener más información sobre la sintaxis, consulte [sus documentos](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow) .

Tenga en cuenta que si desea usar `$` dentro del valor de su entorno, debe escapar de él con `\` .

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

:::warning SECURITY NOTES

- `.env.*.local` Los archivos son solo locales y pueden contener variables sensibles. Debe agregar `*.local` a sus `.gitignore` para evitar que se lo revisen en GIT.

- Dado que las variables expuestas a su código fuente VITE terminarán en su paquete de clientes, `VITE_*` variables _no_ deben contener ninguna información confidencial.

:::

::: details Expanding variables in reverse order

VITE admite variables de expansión en orden inverso.
Por ejemplo, el `.env` a continuación se evaluará como `VITE_FOO=foobar` , `VITE_BAR=bar` .

```[.env]
VITE_FOO=foo${VITE_BAR}
VITE_BAR=bar
```

Esto no funciona en scripts de shell y otras herramientas como `docker-compose` .
Dicho esto, Vite respalda este comportamiento, ya que esto ha sido compatible con `dotenv-expand` durante mucho tiempo y otras herramientas en el ecosistema JavaScript utiliza versiones anteriores que respaldan este comportamiento.

Para evitar problemas de interoperabilidad, se recomienda evitar confiar en este comportamiento. Vite puede comenzar a emitir advertencias para este comportamiento en el futuro.

:::

## IntelliSense para TypeScript

Por defecto, VITE proporciona definiciones de tipo para `import.meta.env` en [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts) . Si bien puede definir más variables ENV personalizadas en `.env.[mode]` archivos, es posible que desee obtener TypeScript IntelliSense para variables ENV definidas por el usuario que tienen prefijo `VITE_` .

Para lograr esto, puede crear un directorio `vite-env.d.ts` en `src` , luego aumentar `ImportMetaEnv` como este:

```typescript [vite-env.d.ts]
///<reference types="vite/client">

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Más variables de env ...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Si su código se basa en tipos de entornos de navegador como [DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) y [WebWorker](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts) , puede actualizar el campo [LIB](https://www.typescriptlang.org/tsconfig#lib) en `tsconfig.json` .

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Imports will break type augmentation

Si el aumento `ImportMetaEnv` no funciona, asegúrese de no tener declaraciones `import` en `vite-env.d.ts` . Consulte la [documentación de TypeScript](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined) para obtener más información.

:::

## Reemplazo constante de HTML

Vite también admite reemplazar constantes en archivos HTML. Cualquier propiedad en `import.meta.env` se puede usar en archivos HTML con una sintaxis especial `%CONST_NAME%` :

```html
<h1>Vite is running in %MODE%</h1>
<p>Using data from %VITE_API_URL%</p>
```

Si el Env no existe en `import.meta.env` , por ejemplo, `%NON_EXISTENT%` , se ignorará y no se reemplazará, a diferencia de `import.meta.env.NON_EXISTENT` en JS, donde se reemplaza como `undefined` .

Dado que Vite es utilizado por muchos marcos, no se opina intencionalmente sobre reemplazos complejos como condicionales. VITE se puede extender utilizando [un complemento de usuarios existentes](https://github.com/vitejs/awesome-vite#transformers) o un complemento personalizado que implementa el [gancho `transformIndexHtml`](./api-plugin#transformindexhtml) .

## Modos

Por defecto, el servidor Dev (comando `dev` ) se ejecuta en el modo `development` y el comando `build` se ejecuta en el modo `production` .

Esto significa que cuando se ejecuta `vite build` , cargará las variables Env de `.env.production` si hay una:

```[.env.production]
VITE_APP_TITLE=My App
```

En su aplicación, puede representar el título con `import.meta.env.VITE_APP_TITLE` .

En algunos casos, es posible que desee ejecutar `vite build` con un modo diferente para representar un título diferente. Puede sobrescribir el modo predeterminado utilizado para un comando pasando el indicador de opción `--mode` . Por ejemplo, si desea crear su aplicación para un modo de puesta en escena:

```bash
vite build --mode staging
```

Y crear un archivo `.env.staging` :

```[.env.staging]
VITE_APP_TITLE=My App (staging)
```

Como `vite build` ejecuta una compilación de producción de forma predeterminada, también puede cambiar esto y ejecutar una compilación de desarrollo utilizando un modo diferente y `.env` configuración de archivo:

```[.env.testing]
NODE_ENV=development
```

### Node_env y modos

Es importante tener en cuenta que `NODE_ENV` ( `process.env.NODE_ENV` ) y los modos son dos conceptos diferentes. Así es como los diferentes comandos afectan el `NODE_ENV` y el modo:

| Dominio                                              | Nodo_env        | Modo            |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

Los diferentes valores de `NODE_ENV` y el modo también reflejan en sus propiedades `import.meta.env` correspondientes:

| Dominio                | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| Dominio              | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` in `.env` files

`NODE_ENV=...` se puede configurar en el comando y también en su archivo `.env` . Si se especifica `NODE_ENV` en un archivo `.env.[mode]` , el modo se puede usar para controlar su valor. Sin embargo, tanto `NODE_ENV` como modos permanecen como dos conceptos diferentes.

El principal beneficio con `NODE_ENV=...` en el comando es que permite a Vite detectar el valor temprano. También le permite leer `process.env.NODE_ENV` en su configuración VITE, ya que Vite solo puede cargar los archivos ENV una vez que se evalúa la configuración.
:::
