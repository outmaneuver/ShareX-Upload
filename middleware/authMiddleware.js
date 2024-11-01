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
        if (!user || user.isSuspended) {
            req.session.destroy();
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid or suspended account'
                });
            }
            return res.redirect('/auth/login');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        req.session.destroy();
        if (req.xhr || req.path.startsWith('/api/')) {
            return res.status(500).json({
                status: 'error',
                message: 'Authentication error'
            });
        }
        res.redirect('/auth/login');
    }
};

module.exports = { isAuthenticated };
