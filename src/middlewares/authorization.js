export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ status: "error", message: "Unauthorized" });
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    return next();
  };
}

