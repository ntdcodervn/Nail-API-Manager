const express = require('express');
const app = express();
const connectDB = require('./config/db');
const bodyParser = require('body-parser')
const path = require('path');
const PORT = process.env.PORT || 3000

app.listen(PORT , () => console.log('Server is start in PORT ' + PORT))
connectDB();
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//define Router
app.use('/api/users', require('./routers/users/users'));
app.use('/api/booking', require('./routers/booking/booking'));
app.use('/api/cart', require('./routers/cart/index'));


app.get('/', (req,res) => {
    
    res.send('Welcome Server of Duy handsome');
});