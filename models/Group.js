const { Schema, model } = require('mongoose')

const ListSchema = new Schema({
    name: { type: String, required: true },
    lists: [{ type: Schema.Types.ObjectId, ref: "List", default: [] }],
    userId: { type: Schema.Types.ObjectId, ref: "User" },
})

module.exports = model('List', ListSchema)