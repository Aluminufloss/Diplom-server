const { Schema, model } = require('mongoose')

const ListSchema = new Schema({
    lists: { type: [Schema.Types.ObjectId], ref: "List" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
})

module.exports = model('List', ListSchema)