#!/usr/bin/env nodemon

//Node Modules
const express         = require('express');
const mongoose        = require('mongoose');
const bodyParser      = require('body-parser');
const app = express();
//app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Routes
const www_finance = require('./routes/www/finance');
const api_budgets = require('./routes/api/budgets');
const api_expenses = require('./routes/api/expenses');
const api_commitments = require('./routes/api/commitments');

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

app.use('/finance/', www_finance);
app.use('/finance/api/budgets', api_budgets);
app.use('/finance/api/commitments', api_commitments);
app.use('/finance/api/expenses', api_expenses);

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
