const mongoose = require('mongoose');


const mediaSchema = new mongoose.Schema({
    createdAt: { type: Date, required: true, default: Date.now},
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    _contentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'}
});

module.exports = mongoose.model('Media', mediaSchema);