const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    newsImage: { type: String },
    productImage: { type: String }
});

module.exports = mongoose.model('Product', productSchema);