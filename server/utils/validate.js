// Small helpers shared by controllers

// Throw an error with an HTTP status — the global error handler sends it
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Keep only the listed fields from an object (stops people setting
// fields they shouldn't, e.g. "role": "admin")
const pick = (obj = {}, fields = []) =>
  fields.reduce((out, f) => {
    if (obj[f] !== undefined) out[f] = obj[f];
    return out;
  }, {});

// Escape user text before putting it into a RegExp
const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Normalise Nigerian phone numbers so 0801..., +234801... match
const normalisePhone = (phone = '') => {
  let p = String(phone).trim().replace(/[\s\-()]/g, '');
  if (p.startsWith('+234')) p = '0' + p.slice(4);
  else if (p.startsWith('234') && p.length === 13) p = '0' + p.slice(3);
  return p;
};

const isValidPhone = (phone) => /^0[789][01]\d{8}$/.test(phone);
const isValidDate  = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

module.exports = { httpError, pick, escapeRegex, normalisePhone, isValidPhone, isValidDate };
