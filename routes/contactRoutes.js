// import express from "express";
// import {
//   sendContactMessageController,
//   getAllMessagesController,
//   getAllContactMessagesController,
//   getSingleContactMessageController,
//   updateMessageStatusController,
//   deleteMessageController,
//   deleteContactMessageController,
//   bulkDeleteMessagesController,
//   getMessageStatsController,
//   markAsReadController,
// } from "../controllers/contactController.js";
// import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// // ==================== PUBLIC ROUTES ====================
// router.post("/send-message", sendContactMessageController);

// // ==================== ADMIN ROUTES (Protected) ====================

// // Get all messages (simplified)
// router.get("/all-messages", requireSignIn, isAdmin, getAllMessagesController);

// // Get messages with filters and pagination
// router.get("/get-all-messages", requireSignIn, isAdmin, getAllContactMessagesController);

// // Get message statistics
// router.get("/get-stats", requireSignIn, isAdmin, getMessageStatsController);

// // Get single message
// router.get("/get-message/:id", requireSignIn, isAdmin, getSingleContactMessageController);

// // Update message status
// router.put("/update-status/:id", requireSignIn, isAdmin, updateMessageStatusController);

// // Update message status (alternative endpoint)
// router.put("/status/:id", requireSignIn, isAdmin, updateMessageStatusController);

// // Delete single message
// router.delete("/delete/:id", requireSignIn, isAdmin, deleteMessageController);

// // Delete single message (alternative endpoint)
// router.delete("/delete-message/:id", requireSignIn, isAdmin, deleteContactMessageController);

// // Bulk delete messages
// router.post("/bulk-delete", requireSignIn, isAdmin, bulkDeleteMessagesController);

// // Mark multiple messages as read
// router.post("/mark-as-read", requireSignIn, isAdmin, markAsReadController);

// export default router;

import express from "express";
import {
  sendContactMessageController,
  getAllMessagesController,
  deleteMessageController,
  updateMessageStatusController,
  replyToMessageController,
  getUserMessagesController,
  getUnreadReplyCountController,
  markMessageAsReadController,
} from "../controllers/contactController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/send-message", sendContactMessageController);

// Admin routes
router.get("/all-messages", requireSignIn, isAdmin, getAllMessagesController);
router.delete("/delete/:id", requireSignIn, isAdmin, deleteMessageController);
router.put("/status/:id", requireSignIn, isAdmin, updateMessageStatusController);
router.put("/reply/:id", requireSignIn, isAdmin, replyToMessageController);

// User routes (protected)
router.get("/my-messages", requireSignIn, getUserMessagesController);
router.get("/unread-count", requireSignIn, getUnreadReplyCountController);
router.put("/mark-read/:id", requireSignIn, markMessageAsReadController);

export default router;