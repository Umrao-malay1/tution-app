function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_SECRET;
  if (!configured) {
    return res.status(503).json({ message: 'Admin is not configured (set ADMIN_SECRET)' });
  }
  const sent = req.headers['x-admin-secret'];
  if (typeof sent !== 'string' || sent !== configured) {
    return res.status(401).json({ message: 'Invalid admin secret' });
  }
  next();
}

module.exports = requireAdmin;
