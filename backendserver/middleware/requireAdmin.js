const crypto = require('crypto');

function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_SECRET;
  if (!configured) {
    return res.status(503).json({ message: 'Admin is not configured (set ADMIN_SECRET)' });
  }
  const sent = typeof req.headers['x-admin-secret'] === 'string' ? req.headers['x-admin-secret'] : '';
  const sentBuffer = Buffer.from(sent);
  const configuredBuffer = Buffer.from(configured);

  if (
    sentBuffer.length !== configuredBuffer.length ||
    !crypto.timingSafeEqual(sentBuffer, configuredBuffer)
  ) {
    return res.status(401).json({ message: 'Invalid admin secret' });
  }

  next();
}

module.exports = requireAdmin;
