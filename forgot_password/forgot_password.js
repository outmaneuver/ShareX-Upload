import express from 'express';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { SiteStatistic } from '../models/SiteStatistic.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Get domain from site statistics
        const domainStat = await SiteStatistic.findOne({ name: 'forgot_password_domain' });
        const domain = domainStat?.value || req.get('host');

        const resetUrl = `${req.protocol}://${domain}/reset-password/${resetToken}`;
        
        // Send email logic would go here
        
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

export default router;
