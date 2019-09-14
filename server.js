const express = require('express');
const app = express();
const connectDB = require('./config/db');
const bodyParser = require('body-parser')
const path = require('path');
const PORT = process.env.PORT || 4000;


app.listen(PORT , () => console.log('Server is start in PORT ' + PORT))
connectDB();
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/file', express.static(path.join(__dirname, 'uploads/file')));

//define Router
app.use('/api/users', require('./routers/users/users'));
app.use('/api/booking', require('./routers/booking/booking'));
app.use('/api/cart', require('./routers/cart/index'));
app.use('/api/admin', require('./routers/admin/index'));
app.use('/api/service',require('./routers/services/index'))

app.get('/', (req,res) => {
    
    res.send('Welcome Server of Duy handsome');
});