
// import mongoose from "mongoose";

// const contactSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//       minlength: [2, "Name must be at least 2 characters"],
//       maxlength: [100, "Name cannot exceed 100 characters"],
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       trim: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
//     },
//     phone: {
//       type: String,
//       required: [true, "Phone number is required"],
//       trim: true,
//       match: [/^\+?[\d\s-]{10,}$/, "Please enter a valid phone number"],
//     },
//     subject: {
//       type: String,
//       required: [true, "Subject is required"],
//       trim: true,
//       minlength: [3, "Subject must be at least 3 characters"],
//       maxlength: [200, "Subject cannot exceed 200 characters"],
//     },
//     message: {
//       type: String,
//       required: [true, "Message is required"],
//       trim: true,
//       minlength: [10, "Message must be at least 10 characters"],
//       maxlength: [5000, "Message cannot exceed 5000 characters"],
//     },
//     status: {
//       type: String,
//       enum: ["unread", "read", "replied"],
//       default: "unread",
//     },
//     adminNotes: {
//       type: String,
//       default: "",
//     },
//     readAt: {
//       type: Date,
//     },
//     repliedAt: {
//       type: Date,
//     },
//     repliedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//     },
//   },
//   { timestamps: true }
// );

// // Indexes for better query performance
// contactSchema.index({ createdAt: -1 });
// contactSchema.index({ email: 1 });
// contactSchema.index({ status: 1 });
// contactSchema.index({ createdAt: -1, status: 1 });

// // Virtual for formatted date
// contactSchema.virtual("formattedDate").get(function() {
//   return this.createdAt.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// });

// // Method to mark as read
// contactSchema.methods.markAsRead = async function() {
//   if (this.status === "unread") {
//     this.status = "read";
//     this.readAt = new Date();
//     await this.save();
//   }
//   return this;
// };

// // Method to mark as replied
// contactSchema.methods.markAsReplied = async function(adminId, notes) {
//   this.status = "replied";
//   this.repliedAt = new Date();
//   this.repliedBy = adminId;
//   if (notes) this.adminNotes = notes;
//   await this.save();
//   return this;
// };

// export default mongoose.model("Contact", contactSchema);

import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["unread", "read", "replied"],
      default: "unread",
    },
    adminReply: {
      type: String,
      default: null,
    },
    repliedBy: {
      type: String,
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);