#!/usr/bin/env nodemon

//Node Modules
const express         = require('express');
const app = express();


//Routes
const www_finance = require('./routes/www/finance');

//Express settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use('/finance/', www_finance);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('*', function(req, res){
    res.render('404');
});

const port = 3000;
app.listen(port, process.env.IP, function(){
    console.log(`Serving on port ${port}`);
});



