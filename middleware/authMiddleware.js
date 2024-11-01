const User = require('../config/config').User;

// Update isAuthenticated middleware
async function isAuthenticated(req, res, next) {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Authentication error'
        });
    }
}

// Middleware to check if the user is an admin
export function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
}
