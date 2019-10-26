const mongoose = require('mongoose');


const itemSchema = new mongoose.Schema({
    createdAt: { type: Date, required: true, default: Date.now},
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    _parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item'},
    likes : {type: Number, required: true, default: 0},
    retweeted:{type: Number, required: true, default: 0},
    childType: {type: String},
    content: {type: String, required: isThisFieldString},
    media: []
});

function isThisFieldString () {
    return typeof this.content === 'string'? false : true
}

module.exports = mongoose.model('Item', itemSchema);