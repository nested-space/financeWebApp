#!/usr/bin/env nodemon

const   express         = require("express"),
        app             = express(),
        mongoose        = require("mongoose"),
        bodyParser      = require("body-parser"),
        finance         = require("./modules/expenses.js"),
        Attrition       = finance.MonthlyAttritionItem,
        Periodic        = finance.PredictedPeriodicItem;

app.use(bodyParser.urlencoded({extended: true}));

//* ------------------------------------------------------------------------------------
//*  Mongoose Connection
//* ------------------------------------------------------------------------------------

const options = {
    user: "finance",
    pass: "finance",
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const mongooseConnectionString = 'mongodb://localhost:27017/finance?authSource=admin';

mongoose.connect(mongooseConnectionString,options);
mongoose.set("useCreateIndex", true);

//* ------------------------------------------------------------------------------------
//*                                     DEFAULTS
//* ------------------------------------------------------------------------------------

app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));

//* ------------------------------------------------------------------------------------
//*                                     PORTFOLIO 
//* ------------------------------------------------------------------------------------
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/webDev", (req, res) => {
    res.render("portfolio/webDev/webDev");
});

//* ------------------------------------------------------------------------------------
//*                                  apps -> finance  
//* ------------------------------------------------------------------------------------

app.get("/finance", (req, res) => {
    Attrition.find({}, function(err, budgets) {
        if (!err){
            Periodic.find({}, (error, periodics) => {
                if(!error){
                    res.render("portfolio/finance/finance_summary", {
                        budgets: budgets,
                        periodics: periodics
                    });
                } else {
                    throw error;
                }
            });
        } else {
            throw err;
        }
    });
});

app.get("/finance/add", (req, res) => {
    Attrition.find({}, function(err, budgets) {
        if (!err){
            Periodic.find({}, (error, periodics) => {
                if(!error){
                    res.render("portfolio/finance/finance_addItems", {
                        budgets: budgets,
                        periodics: periodics
                    });
                } else {
                    throw error;
                }
            });
        } else {
            throw err;
        }
    });
});

app.post("/finance/addOutgoing", (req, res) => {
    let name = req.body.outgoingName;
    let quantity = req.body.quantity;
    let day = req.body.day;
    let category = req.body.category;
    let newOutgoing = {
        name: name,
        quantity: quantity,
        dayOfMonth: day,
        category: category
    };

    Periodic.create(newOutgoing, (err, newly) => {
        if(err){
            console.log(err);
        } else {
            console.log(newly);
        }
    });
    res.redirect("portfolio/finance/finance_addItems");
});

app.post("/finance/addBudget", (req, res) => {
    let name = req.body.budgetName;
    let quantity = req.body.budgetQuantity;
    let newBudget = {
        name: name, 
        quantity: quantity
    };
    Attrition.create(newBudget, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
        }
    });
    res.redirect("portfolio/finance/finance_addItems");
});

app.get("*", function(req, res){
    res.render("404");
});

app.listen(3001, process.env.IP, function(){
    console.log("Serving on port 3001");
});
