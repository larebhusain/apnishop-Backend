import contactModel from "../models/contactModel.js";
import userModel from "../models/userModel.js";
import { sendReplyEmail } from "../services/emailService.js";

// ==================== PUBLIC CONTROLLERS ====================

// Send contact message (Public)
export const sendContactMessageController = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).send({
        success: false,
        message: "Please provide a valid phone number",
      });
    }

    // Check for duplicate messages (within 5 minutes)
    const existingMessage = await contactModel.findOne({
      email,
      message,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (existingMessage) {
      return res.status(400).send({
        success: false,
        message: "You have already sent a similar message recently. Please wait a few minutes.",
      });
    }

    // Save to database
    const contactMessage = new contactModel({
      name,
      email,
      phone,
      subject,
      message,
      status: "unread",
      createdAt: new Date(),
    });

    await contactMessage.save();

    res.status(201).send({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon.",
      data: {
        id: contactMessage._id,
        name: contactMessage.name,
        email: contactMessage.email,
        subject: contactMessage.subject,
        status: contactMessage.status,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).send({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).send({
      success: false,
      message: "Error sending message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==================== ADMIN CONTROLLERS ====================

// Get all messages (Admin only) - Simplified version for admin panel
export const getAllMessagesController = async (req, res) => {
  try {
    const messages = await contactModel.find().sort({ createdAt: -1 });
    
    // Get statistics
    const stats = {
      total: messages.length,
      unread: messages.filter(m => m.status === "unread").length,
      read: messages.filter(m => m.status === "read").length,
      replied: messages.filter(m => m.status === "replied").length,
    };
    
    res.status(200).send({
      success: true,
      messages,
      stats,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

// Get all contact messages with filters and pagination (Admin only)
export const getAllContactMessagesController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Search by name, email, or subject
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;
    
    // Get messages with pagination
    const messages = await contactModel
      .find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const total = await contactModel.countDocuments(query);
    
    // Get statistics
    const stats = {
      total: await contactModel.countDocuments(),
      unread: await contactModel.countDocuments({ status: "unread" }),
      read: await contactModel.countDocuments({ status: "read" }),
      replied: await contactModel.countDocuments({ status: "replied" }),
      today: await contactModel.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      thisWeek: await contactModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    };
    
    res.status(200).send({
      success: true,
      messages,
      stats,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalMessages: total,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

// Get single contact message (Admin only)
export const getSingleContactMessageController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await contactModel.findById(id);
    
    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }
    
    // Mark as read if it's unread
    if (message.status === "unread") {
      message.status = "read";
      message.readAt = new Date();
      await message.save();
    }
    
    res.status(200).send({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching message",
      error: error.message,
    });
  }
};

// Update message status (Admin only)
export const updateMessageStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === "replied") {
        updateData.repliedAt = new Date();
        updateData.repliedBy = req.user._id;
      }
      if (status === "read") {
        updateData.readAt = new Date();
      }
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    
    const message = await contactModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Message status updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).send({
      success: false,
      message: "Error updating message status",
      error: error.message,
    });
  }
};

// Delete message (Admin only)
export const deleteMessageController = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await contactModel.findByIdAndDelete(id);
    
    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting message",
      error: error.message,
    });
  }
};

// Delete contact message (Alias for deleteMessageController)
export const deleteContactMessageController = async (req, res) => {
  return deleteMessageController(req, res);
};

// Bulk delete messages (Admin only)
export const bulkDeleteMessagesController = async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    if (!messageIds || !messageIds.length) {
      return res.status(400).send({
        success: false,
        message: "No message IDs provided",
      });
    }
    
    const result = await contactModel.deleteMany({
      _id: { $in: messageIds }
    });
    
    res.status(200).send({
      success: true,
      message: `${result.deletedCount} messages deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting messages:", error);
    res.status(500).send({
      success: false,
      message: "Error deleting messages",
      error: error.message,
    });
  }
};

// Get message statistics (Admin only)
export const getMessageStatsController = async (req, res) => {
  try {
    const stats = {
      total: await contactModel.countDocuments(),
      unread: await contactModel.countDocuments({ status: "unread" }),
      read: await contactModel.countDocuments({ status: "read" }),
      replied: await contactModel.countDocuments({ status: "replied" }),
      today: await contactModel.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      thisWeek: await contactModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      thisMonth: await contactModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      lastMonth: await contactModel.countDocuments({
        createdAt: { 
          $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      })
    };
    
    // Get recent messages (last 5)
    const recentMessages = await contactModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email subject status createdAt");
    
    res.status(200).send({
      success: true,
      stats,
      recentMessages,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).send({
      success: false,
      message: "Error getting statistics",
      error: error.message,
    });
  }
};

// Mark multiple messages as read (Admin only)
export const markAsReadController = async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    if (!messageIds || !messageIds.length) {
      return res.status(400).send({
        success: false,
        message: "No message IDs provided",
      });
    }
    
    const result = await contactModel.updateMany(
      { _id: { $in: messageIds }, status: "unread" },
      { 
        $set: { 
          status: "read",
          readAt: new Date()
        } 
      }
    );
    
    res.status(200).send({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).send({
      success: false,
      message: "Error marking messages as read",
      error: error.message,
    });
  }
};
// Send reply to user (Admin only)
export const replyToMessageController = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, repliedBy } = req.body;

    if (!adminReply || adminReply.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Reply message is required",
      });
    }

    const message = await contactModel.findById(id);
    
    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }

    // Update message with reply
    message.adminReply = adminReply;
    message.status = "replied";
    message.repliedBy = repliedBy;
    message.repliedAt = new Date();
    
    await message.save();

    // Send email notification to user
    try {
      await sendReplyEmail(message.email, message.name, adminReply, message.subject);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the API if email fails
    }

    res.status(200).send({
      success: true,
      message: "Reply sent successfully! User has been notified.",
      data: message,
    });
  } catch (error) {
    console.error("Reply error:", error);
    res.status(500).send({
      success: false,
      message: "Error sending reply",
      error: error.message,
    });
  }
};

// Get user's own messages (for user dashboard)
export const getUserMessagesController = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const messages = await contactModel
      .find({ email: user.email })
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      messages,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

// Get unread reply count for user
export const getUnreadReplyCountController = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const unreadReplies = await contactModel.countDocuments({
      email: user.email,
      status: "replied",
      adminReply: { $ne: null },
      userRead: false,
    });

    res.status(200).send({
      success: true,
      count: unreadReplies,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).send({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Mark message as read by user
export const markMessageAsReadController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await contactModel.findByIdAndUpdate(
      id,
      { userRead: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).send({
        success: false,
        message: "Message not found",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).send({
      success: false,
      message: "Error updating status",
      error: error.message,
    });
  }
};