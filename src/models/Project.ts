import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED", "DELETED"],
      default: "ACTIVE",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Soft delete query helpers
ProjectSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

ProjectSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

// Indexes for better performance
ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isDeleted: 1 });

export default mongoose.model("Project", ProjectSchema);
