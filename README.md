# mjjneuroscience.com — web institucional

Sitio estático (HTML + CSS + JS, sin build). Bilingüe ES/EN, video demo, CTA a la plataforma y formulario de solicitud de demo.

```txt
index.html                  contenido en español (fuente de verdad)
i18n.js                     textos en inglés + fases del algoritmo
main.js                     idioma, pestañas, animaciones, formulario
styles.css                  estilos
config.js                   URL de la plataforma, email y destino del formulario
google-apps-script.gs       script que guarda las solicitudes en Google Sheets
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

## Formulario de demo — Google Sheets (gratis)

El formulario es propio (mantiene el diseño) y cada solicitud se agrega como fila en una Google Sheet. Mientras `googleSheetsEndpoint` esté vacío, el botón abre el mail del visitante con los datos cargados.

1. Crear una Google Sheet nueva (ej. "Solicitudes de demo — MJJ") con la cuenta de Google del equipo.
2. En la planilla: **Extensiones → Apps Script**. Borrar el contenido y pegar `google-apps-script.gs`. Opcional: completar `NOTIFY_EMAIL` para recibir un mail por cada solicitud.
3. **Implementar → Nueva implementación** → tipo **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario** (el formulario es público; el script solo agrega filas, no deja leer nada).
4. Autorizar los permisos que pide Google y copiar la URL que termina en `/exec`.
5. Pegarla en `config.js` → `googleSheetsEndpoint`, commitear y pushear.

Las solicitudes aparecen en la pestaña **Solicitudes** con columna **Estado** (`nuevo`) para seguir el contacto. Si cambiás el script, hay que hacer **Implementar → Administrar implementaciones → Editar → Nueva versión** para que tome los cambios (la URL no cambia).

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
