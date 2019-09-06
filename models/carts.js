const mongoose = require('mongoose');
const Cart = new mongoose.Schema({
    services : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'services'
        }
    ],
    users : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        unique : true,
        required : true
    }
});

module.exports = mongoose.model('carts',Cart);