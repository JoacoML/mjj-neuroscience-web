# mjjneuroscience.com — web institucional

Sitio estático (HTML + CSS + JS, sin build). Bilingüe ES/EN, video demo, CTA a la plataforma y formulario de solicitud de demo.

```txt
index.html                  contenido en español (fuente de verdad)
i18n.js                     textos en inglés + fases del algoritmo
main.js                     idioma, pestañas, animaciones, formulario
styles.css                  estilos
config.js                   URL de la plataforma, casilla y asunto del formulario
vercel.json                 headers y cache para Vercel
assets/                     logo, video, póster y capturas
```

## Ver en local

```bash
npx http-server . -p 4321 -c-
```

Idioma: se elige solo según el navegador; se puede forzar con `?lang=en` o `?lang=es`. El toggle recuerda la elección.

## Editar textos

- Español: directamente en `index.html` (atributos `data-i18n`).
- Inglés: la misma clave en `i18n.js`.

## Formulario de demo — llega por mail

Cada solicitud se envía a **jjmartin@mjjneuroscience.com** con el asunto
`[Pedido de demo] Web MJJ Neuroscience — <Institución> (<Nombre>)`, con los datos en una tabla.
Responder el mail le contesta directo a quien pidió la demo.

El envío lo hace [FormSubmit](https://formsubmit.co) (gratis, sin cuenta ni backend). Casilla y asunto se cambian en `config.js`.

**Activación (una sola vez):**

1. Con el sitio publicado (o en local), enviar una solicitud de prueba.
2. Llega a la casilla un mail de FormSubmit "Action Required: Activate Form". Tocar **Activate Form**. Revisar spam si no aparece.
3. Desde ahí, cada envío llega directo. Esa primera solicitud de prueba no se entrega.
4. Opcional: el mail de activación trae un alias aleatorio (ej. `a1b2c3...`). Ponerlo en `leadInbox` en lugar del mail para que la dirección no quede visible en el código del sitio.

Para que no se pierdan entre otros correos, conviene un filtro en la casilla por asunto que contenga `[Pedido de demo]`.

## Publicar

### 1. Repo en GitHub

```bash
gh repo create mjj-neuroscience-web --private --source . --push
```

### 2. Hosting en Vercel (recomendado: ya lo usan para la plataforma)

1. vercel.com → *Add New Project* → importar `mjj-neuroscience-web`. Framework: **Other**. Sin build command; output: raíz.
2. Project → Settings → Domains → agregar `mjjneuroscience.com` y `www.mjjneuroscience.com`.
3. Cada push a `main` publica solo.

### 3. DNS en Squarespace

Squarespace → Domains → `mjjneuroscience.com` → **DNS** → *Custom records*. Borrar los registros por defecto de Squarespace que apunten al dominio raíz o `www`, y agregar:

| Host | Tipo  | Valor                  |
|------|-------|------------------------|
| `@`  | A     | `76.76.21.21`          |
| `www`| CNAME | `cname.vercel-dns.com` |

Usá los valores que muestre Vercel en Domains si difieren. La propagación tarda de minutos a unas horas; Vercel emite el certificado HTTPS solo.

### Alternativa: GitHub Pages

Settings → Pages → *Deploy from branch* `main` / root, dominio personalizado `www.mjjneuroscience.com`. En Squarespace: cuatro registros `A` para `@` (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) y `CNAME` `www` → `<usuario>.github.io`.

## Video

`assets/demo-acv-es.mp4` (13 MB) se sirve desde el propio sitio. Si más adelante pesa mucho o querés estadísticas de reproducción, conviene subirlo a YouTube (no listado) o Vimeo y reemplazar el `<video>` por el embed.
