import User from "../models/user.model.js";



export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Only allow updating specific fields (e.g., name, email)
    const { name, email } = req.body;
    
    // Check if user is updating their own profile
    if (req.user.id !== req.params.id) {
      const error = new Error("You can only update your own profile");
      error.statusCode = 403;
      throw error;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Check if user is deleting their own profile
    if (req.user.id !== req.params.id) {
      const error = new Error("You can only delete your own profile");
      error.statusCode = 403;
      throw error;
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
