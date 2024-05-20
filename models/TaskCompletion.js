const { Schema, model } = require("mongoose");

const { getDateInISOFormat } = require("../utils/datesUtils");

const TaskCompletionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  statuses: [{ type: String, enum: ["expired", "active", "completed"], default: "active" }],
  priorities: [{ type: String, enum: ["low", "medium", "high"], default: "low" }],
  categories: [{ type: String, default: "Without" }],
  timeDurations: [{
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
  }],
  completedAt: [{ type: String, default: getDateInISOFormat() }],
  isRepatedTask: { type: Boolean, default: false },
});

module.exports = model("TaskCompletion", TaskCompletionSchema);