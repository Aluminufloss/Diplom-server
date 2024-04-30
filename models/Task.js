const { Schema, model } = require('mongoose');

const RepeatDaySchema = new Schema({
    day: { type: String, required: true },
    isSelected: { type: Boolean, default: false },
})

const TaskSchema = new Schema({
    listId: [{ type: Schema.Types.ObjectId, ref: "List" }],
    title: { type: String, unique: true, required: true, default: "" },
    status: { type: String, default: "active" },
    priority: { type: String, default: "low" },
    description: { type: String, default: "" },
    plannedDate: { type: Date, default: Date.now },
    repeatDays: { type: [RepeatDaySchema], default: [] },
    category: { type: String },
});

module.exports = model('Task', TaskSchema)