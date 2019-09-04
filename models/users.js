const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name : {
        type : 'String',
        required : true
    },
    email : {
        type : 'String',
        required : true,
        unique : true
    },
    password : {
        type : 'String',
        required : true,
    },
    avatar : {
        type : 'String',
        default : ''
    },
    point : {
        type : 'number',
        default : 0
    },
    coupons : {
        type : 'number',
        default : 0
    },
    role : {
        type : 'String',
        required : true,
        default : 'Customer'
    }

})

module.exports = mongoose.model('users',UserSchema);