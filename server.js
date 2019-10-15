#!/usr/bin/env nodemon

//Node Modules
const express         = require('express');
const mongoose        = require('mongoose');
const bodyParser      = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));

//Models
const Attrition = require('./models/BudgetItem.js/index.js').finance.MonthlyAttritionItem,
const Periodic = require('./models/BudgetItem.js/index.js').finance.PredictedPeriodicItem;

//Routes
const finance = require('./routes/www/finance');

//Mongo config options
const options = require('./config/keys.js').mongoOptions; 
const mongoURI = require('./config/keys.js').mongoURI;

//Establish Mongo Connection
const mongooseConnectionString = mongoURI;
mongoose
    .connect(mongooseConnectionString,options)
    .then(() => {
        mongoose.set('useCreateIndex', true);
        console.log('DB Connected')
    })
    .catch((err) => console.log(err));

//Express settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.use('/finance/*', finance);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('*', function(req, res){
    res.render('404');
});

const port = 3001;
app.listen(port, process.env.IP, function(){
    console.log(`Serving on port ${port}`);
});
