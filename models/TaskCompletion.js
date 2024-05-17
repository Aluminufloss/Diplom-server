const { Schema, model } = require("mongoose");

const TaskCompletionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  status: { type: String, enum: ["expired", "active", "completed"], default: "active" },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  category: { type: String, default: "Without" },
  completedAt: { type: Date, default: Date.now }
});

module.exports = model("TaskCompletion", TaskCompletionSchema);