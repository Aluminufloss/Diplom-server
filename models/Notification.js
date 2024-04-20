const { Schema, model } = require('mongoose')

const NotificationSchema = new Schema({
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    title: { type: String, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    timeToTask: { type: Number },
})

module.exports = model('Notification', NotificationSchema)