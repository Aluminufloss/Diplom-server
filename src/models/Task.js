const { Schema, model } = require("mongoose");

const { getDateInISOFormat } = require("../utils/datesUtils");

const TaskSchema = new Schema(
  {
    listId: [{ type: Schema.Types.ObjectId, ref: "List" }],
    title: { type: String, required: true, default: "" },
    status: { type: String, default: "active" },
    priority: { type: String, default: "low" },
    description: { type: String, default: "" },
    plannedDate: { type: String, default: getDateInISOFormat() },
    repeatDays: { type: Array, default: [] },
    category: { type: String, default: "" },
    timeDuration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },
  },
  {
    useFindAndModify: false,
  }
);

module.exports = model("Task", TaskSchema);
