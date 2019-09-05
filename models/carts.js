const mongoose = require('mongoose');
const Cart = new mongoose.Schema({
    services : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'service'
        }
    ],
    users : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    }
});

module.exports = mongoose.model('carts',Cart);