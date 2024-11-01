const { User } = require('../config/config');

exports.isAuthenticated = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
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
};

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
