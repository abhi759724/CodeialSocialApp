const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    accessToken: {
      type: String,
      required: true,
      default: () => Math.random().toString(36).slice(2),
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ForgotPswd = mongoose.model("ForgotPswd", forgotPasswordSchema);

module.exports = ForgotPswd;
