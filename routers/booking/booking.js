const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth');
const {check,validationResult} = require('express-validator');
const moment = require('moment');
const mongoose = require('mongoose');
const booking = require('./../../models/booking');
const slot = require('./../../models/slot');
const service = require('./../../models/service')

router.post('/booking',auth,[
    check('idSlot','Slot is empty').not().isEmpty(),
    check('idService','Service is not array').isArray(),
    
    
    
],async (req,res) => {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
       
        return res.json({ errors: errors.array() });
      }
      try {
        let {idSlot , idService} = await req.body;

       
        let totalSlot = await slot.findById(idSlot);
        if(totalSlot.total >= 2)
        {
            return res.json({msg : 'Slot is full'});
        }
        else
        {
            console.log(totalSlot)
            let updateSlot = await slot.findByIdAndUpdate(idSlot,{total : totalSlot.total + 1});
            const bookingObj = new booking ({
                users : req.id,
                slot : idSlot,
                service : idService,
            })
            bookingObj.save();
            return res.json({msg : 'Booking succesful by user id ' + req.id});
        }
       

  
       
        
  
      } catch (error) {
          console.log(error)
          res.status(501).json({msg : 'Server error'})
      }
        
});

router.get('/getAllBook',auth,async (req,res) => {
    try {
        let getAllBook = await booking.find().populate('slots','slotName').select();
        res.json({listBooking : getAllBook})
    } catch (error) {
        console.log(error);
        res.status(501).json('Server error')
    }
})

module.exports = router;