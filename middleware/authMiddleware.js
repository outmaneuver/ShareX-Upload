const { User } = require('../config/config');

async function isAuthenticated(req, res, next) {
    try {
        if (!req.session || !req.session.userId || !req.session.isAuthenticated) {
            if (req.xhr || req.headers.accept.includes('json')) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized'
                });
            }
            return res.redirect('/auth/login');
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy(() => {
                if (req.xhr || req.headers.accept.includes('json')) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'User not found'
                    });
                }
                res.redirect('/auth/login');
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Authentication error'
        });
    }
}

function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({
            status: 'error',
            message: 'Admin access required'
        });
    }
}

module.exports = {
    isAuthenticated,
    isAdmin
};
