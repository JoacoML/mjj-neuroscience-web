// Recibe las solicitudes de demo de la landing y las guarda en esta Google Sheet.
// Instalación: ver README.md → "Formulario de demo".

const SHEET_NAME = 'Solicitudes';
// Email que recibe un aviso por cada solicitud nueva. Vacío = sin aviso.
const NOTIFY_EMAIL = '';

const COLUMNS = [
  ['Fecha', null],
  ['Nombre', 'name', 120],
  ['Email', 'email', 160],
  ['Institución', 'organization', 160],
  ['Rol', 'role', 40],
  ['País', 'country', 80],
  ['Teléfono', 'phone', 40],
  ['Mensaje', 'message', 1500],
  ['Idioma', 'lang', 5],
  ['Origen', 'source', 120],
  ['Estado', null],
];

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'invalid_json' });
  }
  if (data.website) return json({ ok: true }); // honeypot: bots
  if (!data.name || !data.email || !data.organization) return json({ ok: false, error: 'missing_fields' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map((c) => c[0]));
      sheet.setFrozenRows(1);
    }
    const row = COLUMNS.map(([header, key, max]) => {
      if (header === 'Fecha') return new Date();
      if (header === 'Estado') return 'nuevo';
      return clean(data[key], max);
    });
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `Nueva solicitud de demo — ${clean(data.organization, 160)}`,
      body: COLUMNS.filter((c) => c[1]).map(([h, k, m]) => `${h}: ${clean(data[k], m)}`).join('\n'),
    });
  }
  return json({ ok: true });
}

// Recorta y evita que un texto se interprete como fórmula en la planilla.
function clean(value, max) {
  const s = String(value == null ? '' : value).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
