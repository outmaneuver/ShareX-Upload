const { User } = require('../config/config');

const isAuthenticated = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Authentication required'
                });
            }
            return res.redirect('/auth/login');
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            return res.redirect('/auth/login');
        }

        if (user.isSuspended) {
            req.session.destroy();
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Account suspended'
                });
            }
            return res.redirect('/auth/login?error=account_suspended');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                status: 'error',
                message: 'Authentication error'
            });
        }
        res.redirect('/auth/login');
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(403).json({
                status: 'error',
                message: 'Admin access required'
            });
        }
        res.redirect('/auth/login');
    }
};

module.exports = {
    isAuthenticated,
    isAdmin
};
