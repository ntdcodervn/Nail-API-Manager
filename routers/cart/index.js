const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth');
const carts = require('./../../models/carts');
const USER = require('./../../models/users');

router.post('/updateCart', auth , async (req,res) => {

    try {
        const idService = req.body.idService;
        let cartObj = await carts.findOne({users : req.id});
        
        if(cartObj === null)
        {
            console.log(cartObj + idService)
            let createCart = new carts({
                services : [],
                users : req.id
            });
            createCart.save();
            res.json('Add item successful');
        }
        else {
            
           
            let checkItemInCart = await cartObj.services.filter((value) => {
                return value == idService; 
            });
            console.log(checkItemInCart.length)
            if(checkItemInCart.length !== 0)
            {
                return res.json({mag : "This item is already in the cart"});
            }
            else{
                let updateCart = await carts.updateOne({users:req.id},{services : [...cartObj.services ,idService]});
           
                res.json('Add item successful');
            }
            
        }
    } catch (error) {
        console.log(error);
        res.status(501).json({msg : 'Server error'});
    }
   
});

router.get('/getCartByIdUser',auth,async (req,res) => {
    try {
        const cart = await carts.findOne({users : req.id});

        res.json({cart});

 
    } catch (error) {
        console.log(error);
        res.status(501).json({msg : 'server error'});
    }
   
})

module.exports = router;