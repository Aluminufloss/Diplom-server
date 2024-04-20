const { Schema, model } = require('mongoose')

const ListSchema = new Schema({
    taskId: { type: [Schema.Types.ObjectId], ref: "Task" },
    groupId: { type: Number },
})

module.exports = model('List', ListSchema)