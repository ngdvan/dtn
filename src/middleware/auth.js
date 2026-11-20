const leadershipRoles = ['leader', 'vice_leader'];
const rolesOf = user => [...new Set([user?.role,...(Array.isArray(user?.roles)?user.roles:[])].filter(Boolean))];
const hasRole = (user,role) => rolesOf(user).includes(role);
const isLeadership = user => leadershipRoles.some(role=>hasRole(user,role));
const canManageYearbook = user => hasRole(user,'admin') || hasRole(user,'ky-yeu-admin');
const auth = (req, res, next) => req.session.user ? next() : res.status(401).json({ error: 'Please sign in to continue.' });
const admin = (req, res, next) => hasRole(req.session.user,'admin') ? next() : res.status(403).json({ error: 'Administrator access is required.' });
const manager = (req, res, next) => hasRole(req.session.user,'admin') || isLeadership(req.session.user) ? next() : res.status(403).json({ error: 'You do not have permission for this action.' });
const yearbookAdmin = (req,res,next) => canManageYearbook(req.session.user) ? next() : res.status(403).json({error:'Yearbook administrator access is required. / Cần quyền quản trị kỷ yếu.'});

module.exports = { auth, admin, manager, yearbookAdmin, rolesOf, hasRole, isLeadership, canManageYearbook };
