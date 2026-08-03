import { getAuth } from '@clerk/express';
import User from '../models/user.model.js';

const authorize = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;
    
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
};

export default authorize;