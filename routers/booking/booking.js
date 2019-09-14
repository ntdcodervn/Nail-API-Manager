const express = require('express');
const router = express.Router();
const auth = require('./../../middleware/auth');
const {
    check,
    validationResult
} = require('express-validator');
const moment = require('moment');
const mongoose = require('mongoose');
const booking = require('../../models/bookings');
const slots = require('../../models/slots');
const service = require('../../models/services');
const users = require('./../../models/users')
const io = require('socket.io')();
const carts = require('./../../models/carts');
io.listen(3000);


let changeStreamSlot = slots.watch();

changeStreamSlot.on('change', async (data) => {
    let slot = await slots.find();

    io.emit('changeSlotRealTime', slot);
})



io.on('connection', async (client) => {
    let slot = await slots.find();
    io.emit('changeSlotRealTime', slot)
})


router.post('/booking', auth, [
    check('idService', 'Service is not array').isArray(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.json({
            errors: errors.array()
        });
    }
    try {
        let {
            idSlot,
            idService,
            date,
            slotName
        } = await req.body;
        if (idSlot == null) {
            const createNewSlot = new slots({
                slotName,
                date
            });

            let newSlot = await createNewSlot.save();


            let bookingCheckUserAvaiable = await booking.findOne({
                users: req.id
            });
            let totalSlot = await slots.findById(newSlot._id);
           

            if(bookingCheckUserAvaiable !== null)
            {
            if (bookingCheckUserAvaiable.status !== 0) {

                let total = 0;
                let time = 0;
                for (var i = 0; i < idService.length; i++) {
                    let price = await service.findById(idService[i]);
                    total += price.price;
                    time += price.time;
                }
                console.log(time);
                console.log(total)
                if (time <= 120) {
                    console.log(totalSlot)
                    let updateSlot = await slots.findByIdAndUpdate(newSlot._id, {
                        total: totalSlot.total + 1
                    });
                    console.log(idService);
                    console.log(total);
                    let user = await users.findById(req.id);
                    if (user.coupons === 30) {
                        total = total * 0.7;
                    }
                    const bookingObj = await new booking({
                        users: req.id,
                        slots: newSlot._id,
                        services: idService,
                        total: total
                    });
                    bookingObj.save();
                    let deleteCart = await carts.deleteOne({users : req.id});
                    return res.json({
                        msg: 'Booking succesfull by user id ' + req.id
                    });
                } else {
                    return res.json({
                        msg: 'you must book services in about 120 min'
                    });
                }



            } else {
                return res.json({
                    msg: 'You have made a reservation, please wait to book more'
                });
            }
        }else {
            let total = 0;
                        let time = 0;
                        for(var i =0;i<idService.length;i++)
                        {
                            let price = await service.findById(idService[i]);
                            total += price.price;
                            time += price.time;
                        }
                        console.log(time);
                        console.log(total)
                        if(time <= 120)
                        {
                            console.log(totalSlot)
                            let updateSlot = await slots.findByIdAndUpdate(newSlot._id,{total : totalSlot.total + 1});
                            console.log(idService);
                            console.log(total);
                            let user = await users.findById(req.id);
                            if(user.coupons === 30)
                            {
                                total = total * 0.7;
                            }
                            const bookingObj = await new booking ({
                            users : req.id,
                            slots : newSlot._id,
                            services : idService,
                            total : total
                            });
                            bookingObj.save();
                            let deleteCart = await carts.deleteOne({users : req.id});
                            return res.json({msg : 'Booking succesfull by user id ' + req.id});
                        }
                        else{
                            return res.json({msg : 'you must book services in about 120 min'});
                        }
                        
        }

        } else {
            let totalSlot = await slots.findById(idSlot);
            if (totalSlot.total >= 2) {
                return res.json({
                    msg: 'Slot is full'
                });
            } else {
                let bookingCheckUserAvaiable = await booking.findOne({
                    users: req.id
                });
                if(bookingCheckUserAvaiable !== null)
                {
                if (bookingCheckUserAvaiable.status !== 0) {

                    let total = 0;
                    let time = 0;
                    for (var i = 0; i < idService.length; i++) {
                        let price = await service.findById(idService[i]);
                        total += price.price;
                        time += price.time;
                    }
                    console.log(time);
                    console.log(total)
                    if (time <= 120) {
                        console.log(totalSlot)
                        let updateSlot = await slots.findByIdAndUpdate(idSlot, {
                            total: totalSlot.total + 1
                        });
                        console.log(idService);
                        console.log(total);
                        const bookingObj = await new booking({
                            users: req.id,
                            slots: idSlot,
                            services: idService,
                            total: total
                        });
                        bookingObj.save();
                        let deleteCart = await carts.deleteOne({users : req.id});
                        return res.json({
                            msg: 'Booking succesfull by user id ' + req.id
                        });
                    } else {
                        return res.json({
                            msg: 'you must book services in about 120 min'
                        });
                    }



                } else {
                    return res.json({
                        msg: 'You have made a reservation, please wait to book more'
                    });
                }
            }else {
                
            }
            }
        }




    } catch (error) {
        console.log(error)
        res.status(501).json({
            msg: 'Server error'
        })
    }

});

router.get('/getAllBook', auth, [
    check('page', 'Page is not empty').not().isEmpty(),
    check('page', 'Page is number').isNumeric(),
    check('status', 'Status is not empty').not().isEmpty(),
    check('status', 'Status is number').isNumeric()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.json({
            errors: errors.array()
        });
    }
    try {
        const {page,status} = req.query;
        if (page < 0) {
            return res.json({
                errors: [{
                    msg: 'Page must be greater than or equal to 0 '
                }]
            });
        }
        let getAllBook= [];
        if(status === 0)
        {
            getAllBook = await booking.find({status : status})
            .populate('users', ['email', 'name', 'coupons', 'point', 'avatar'])
            .populate('services')
            .populate('slots').limit(10).skip(10 * page).exec();
        }
        else {
            getAllBook = await booking.find({})
            .populate('users', ['email', 'name', 'coupons', 'point', 'avatar'])
            .populate('services')
            .populate('slots').limit(10).skip(10 * page).exec();
        }

        
        res.json({
            listBooking: getAllBook
        });
    } catch (error) {
        console.log(error);
        res.status(501).json('Server error')
    }
})

router.get('/getBooked', auth,[
    check('page', 'Page is not empty').not().isEmpty(),
    check('page', 'Page is number').isNumeric(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     
      return res.json({ errors: errors.array() });
    }
    try {
        let page = req.query.page;
        let booked = await booking.find({
            users: req.id
        }).populate('services').populate('slots', ['slotName']).limit(10).skip(10 * page);

        res.json({
            booked
        });
    } catch (error) {
        res.status(501).json({
            msg: 'server error'
        });
    }
})



module.exports = router;