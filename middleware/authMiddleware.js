import User from '../models/User';

// Middleware to check if the user is authenticated
export function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        User.findById(req.session.userId, (err, user) => {
            if (user) {
                req.user = user;
                delete req.user.password; // delete the password from the session
                req.session.user = user;  // refresh the session value
                res.locals.user = user;
            }
            next();
        });
    } else {
        res.status(401).send('Unauthorized');
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
