const leadershipRoles = ['leader', 'vice_leader'];
const isLeadership = user => leadershipRoles.includes(user?.role);
const auth = (req, res, next) => req.session.user ? next() : res.status(401).json({ error: 'Please sign in to continue.' });
const admin = (req, res, next) => req.session.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Administrator access is required.' });
const manager = (req, res, next) => req.session.user?.role === 'admin' || isLeadership(req.session.user) ? next() : res.status(403).json({ error: 'You do not have permission for this action.' });

module.exports = { auth, admin, manager, isLeadership };
