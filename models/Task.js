const { Schema, model } = require('mongoose')

const TaskSchema = new Schema({
    listId: [{ type: Schema.Types.ObjectId, ref: "List" }],
    title: { type: String, unique: true, required: true },
    status: { type: String, default: "active" },
    priority: { type: String, default: "low" },
    description: { type: String, default: "" },
    plannedDate: { type: Date, default: Date.now },
    repeat: { type: String },
    category: { type: String },
})

module.exports = model('Task', TaskSchema)