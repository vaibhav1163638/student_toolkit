import mongoose from "mongoose";

const userEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      default: null,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    color: {
      type: String,
      default: "#10b981",
      trim: true,
      maxlength: 30,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserEvent", userEventSchema);
