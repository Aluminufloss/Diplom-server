const { Schema, model } = require('mongoose')

const TaskSchema = new Schema({
    title: { type: String, unique: true, required: true },
    priority: { type: String },
    description: { type: String },
    plannedDate: { type: Date },
    repeat: { type: String },
    category: { type: String }
})

module.exports = model('Task', TaskSchema)