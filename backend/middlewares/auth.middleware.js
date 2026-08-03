import { requireAuth } from '@clerk/express';
import User from '../models/user.model.js';

const authorize = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findOne({ clerkId });

      if (!user) {
        return res.status(401).json({ message: "User not found in database" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized",
        error: error.message,
      });
    }
  }
];

export default authorize;