import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import {
  getAllUsersController,
  blockUserController,
  unblockUserController,
  deleteUserController,
  makeAdminController,
} from "../controllers/userController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

// ==================== AUTHENTICATION ROUTES ====================

// REGISTER || METHOD POST
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

// FORGOT PASSWORD || POST
router.post("/forgot-password", forgotPasswordController);

// TEST ROUTES || GET
router.get("/test", requireSignIn, isAdmin, testController);

// ==================== PRIVATE ROUTES ====================

// User auth check
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

// Admin auth check
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

// Update profile
router.put("/profile", requireSignIn, updateProfileController);

// ==================== ORDER ROUTES ====================

// Get user orders
router.get("/orders", requireSignIn, getOrdersController);

// Get all orders (Admin only)
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// Update order status (Admin only)
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

// ==================== USER MANAGEMENT ROUTES (Admin only) ====================

// Get all users with pagination and search
router.get("/all-users", requireSignIn, isAdmin, getAllUsersController);

// Block a user
router.put("/block-user/:id", requireSignIn, isAdmin, blockUserController);

// Unblock a user
router.put("/unblock-user/:id", requireSignIn, isAdmin, unblockUserController);

// Delete a user
router.delete("/delete-user/:id", requireSignIn, isAdmin, deleteUserController);

// Make a user admin
router.put("/make-admin/:id", requireSignIn, isAdmin, makeAdminController);

export default router;