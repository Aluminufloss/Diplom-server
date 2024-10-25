const { Schema, model } = require('mongoose')

const ListSchema = new Schema({
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    tasks: { type: [Schema.Types.ObjectId], ref: "Task" },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
})

module.exports = model('List', ListSchema)