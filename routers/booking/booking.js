const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth');
const {check,validationResult} = require('express-validator');
const moment = require('moment');
const mongoose = require('mongoose');
const booking = require('../../models/bookings');
const slots = require('../../models/slots');
const service = require('../../models/services');


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

       
        let totalSlot = await slots.findById(idSlot);
        if(totalSlot.total >= 2)
        {
            return res.json({msg : 'Slot is full'});
        }
        else
        {
            let bookingCheckUserAvaiable = await booking.findOne({users:req.id});
            
                if(bookingCheckUserAvaiable.status !== 0)
                {
                    console.log(totalSlot)
                    let updateSlot = await slots.findByIdAndUpdate(idSlot,{total : totalSlot.total + 1});
                    console.log(idService);
                    let total = 0;
                    let time = 0;
                    for(var i =0;i<idService.length;i++)
                    {
                        let price = await service.findById(idService[0]);
                        total += price.price;
                        time += price.time;
                    }
                    if(time > 120)
                    {
                        console.log(total);
                        const bookingObj = await new booking ({
                        users : req.id,
                        slots : idSlot,
                        services : idService,
                        total : total
                        });
                        bookingObj.save();
                        return res.json({msg : 'Booking succesfull by user id ' + req.id});
                    }
                    else{
                        return res.json({msg : 'you must book services in about 120 min' + req.id});
                    }
                    
                    
                    
                }
                else{
                    return res.json({msg : 'You have made a reservation, please wait to book more'});
                }
        }
    
      } catch (error) {
          console.log(error)
          res.status(501).json({msg : 'Server error'})
      }
        
});

router.get('/getAllBook',auth,[
    check('page', 'Page is not empty').not().isEmpty(),
    check('page', 'Page is number').isNumeric(),
],async (req,res) => {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
       
        return res.json({errors: errors.array()});
      }
    try {
        const page = req.query.page;
        if(page < 0)
        {
            return res.json({errors: [{msg : 'Page must be greater than or equal to 0 '}]});
        }
        
        let getAllBook = await booking.find()
        .populate('users',['email','name','coupons','point','avatar'])
        .populate('services')
        .populate('slots').limit(10).skip(10*page).exec();
        res.json({listBooking : getAllBook});
    } catch (error) {
        console.log(error);
        res.status(501).json('Server error')
    }
})

router.get('/getBooked',auth, async (req,res) => {
    try {
        let booked = await booking.find({users : req.id}).populate('services').populate('slots',['slotName']);
        
        res.json({booked});
    } catch (error) {
        res.status(501).json({msg : 'server error'});
    }
})

module.exports = router;