// ─────────────────────────────────────────────────────────────
// Custom request sanitizer — Express 5 safe
//
// Replaces express-mongo-sanitize, xss-clean and hpp, which all try to
// REASSIGN req.query. In Express 5 req.query is a read-only getter, so
// those packages crash every request with
// "Cannot set property query of #<IncomingMessage> which has only a getter".
//
// This middleware only MUTATES objects in place, so it works on Express 5.
//   1. NoSQL injection: removes keys that start with "$" or contain "."
//   2. XSS: strips HTML tags from string values
//   3. HTTP parameter pollution: ?a=1&a=2 keeps only the last value
// ─────────────────────────────────────────────────────────────

const stripTags = (value) =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/javascript:/gi, '');

const cleanValue = (value, depth = 0) => {
  if (depth > 10) return value;                       // safety for deep objects
  if (typeof value === 'string') return stripTags(value);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = cleanValue(value[i], depth + 1);
    return value;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];                            // NoSQL injection attempt
        continue;
      }
      value[key] = cleanValue(value[key], depth + 1);
    }
  }
  return value;
};

const sanitize = (req, res, next) => {
  try {
    // Body — safe to clean in place
    if (req.body && typeof req.body === 'object') cleanValue(req.body);

    // Params — mutate in place
    if (req.params && typeof req.params === 'object') cleanValue(req.params);

    // Query — in Express 5 req.query is a getter that re-parses the URL on
    // every access, so we clean a copy and pin it as req's own property.
    const q = { ...(req.query || {}) };
    for (const key of Object.keys(q)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete q[key];
        continue;
      }
      // HPP: duplicate query params become arrays — keep the last one
      if (Array.isArray(q[key])) q[key] = q[key][q[key].length - 1];
      q[key] = cleanValue(q[key]);
    }
    Object.defineProperty(req, 'query', {
      value: q, writable: true, configurable: true, enumerable: true,
    });
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = sanitize;
