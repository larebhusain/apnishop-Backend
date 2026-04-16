import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";

// Get all users with pagination and search
export const getAllUsersController = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    
    // Build search query
    const searchQuery = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const totalUsers = await userModel.countDocuments(searchQuery);
    
    // Get users with pagination
    const users = await userModel
      .find(searchQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // Calculate stats
    const totalCount = await userModel.countDocuments();
    const activeUsers = await userModel.countDocuments({ isBlocked: false });
    const blockedUsers = await userModel.countDocuments({ isBlocked: true });
    const adminUsers = await userModel.countDocuments({ role: 1 });
    
    res.status(200).send({
      success: true,
      users,
      stats: {
        total: totalCount,
        active: activeUsers,
        blocked: blockedUsers,
        admins: adminUsers,
      },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        totalUsers,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Block user
export const blockUserController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent blocking self
    if (id === req.user._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "You cannot block yourself",
      });
    }
    
    const user = await userModel.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error blocking user",
      error: error.message,
    });
  }
};

// Unblock user
export const unblockUserController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await userModel.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error unblocking user",
      error: error.message,
    });
  }
};

// Delete user
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self
    if (id === req.user._id.toString()) {
      return res.status(400).send({
        success: false,
        message: "You cannot delete yourself",
      });
    }
    
    const user = await userModel.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Make user admin
export const makeAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent making self admin if not needed
    const user = await userModel.findByIdAndUpdate(
      id,
      { role: 1 },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "User promoted to admin successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error making user admin",
      error: error.message,
    });
  }
};