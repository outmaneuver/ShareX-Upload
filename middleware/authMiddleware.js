import { User } from '../models/User.js';

export const isAuthenticated = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            return res.redirect('/auth/login');
        }

        const user = await User.findById(req.session.userId);
        if (!user || user.isSuspended) {
            req.session.destroy();
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({ message: 'Account suspended or not found' });
            }
            return res.redirect('/auth/login');
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user?.isAdmin) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            return res.redirect('/auth/login');
        }
        next();
    } catch (error) {
        next(error);
    }
};
