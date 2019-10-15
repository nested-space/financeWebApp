const express         = require('express');
const router = express.Router();

const Attrition = require('../../models/BudgetItem').MonthlyAttritionItem;
const Periodic = require('../../models/BudgetItem').PredictedPeriodicItem;

// @route GET /finance
// @desc HTML web page with finance summary
// @access currently public
app.get('/', (req, res) => {
    Attrition.find({}, function(err, budgets) {
        if (!err){
            Periodic.find({}, (error, periodics) => {
                if(!error){
                    res.render('portfolio/finance/finance_summary', {
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

app.get('/add', (req, res) => {
    Attrition.find({}, function(err, budgets) {
        if (!err){
            Periodic.find({}, (error, periodics) => {
                if(!error){
                    res.render('portfolio/finance/finance_addItems', {
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

app.post('/addOutgoing', (req, res) => {
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
    res.redirect('/add');
});

app.post('/addBudget', (req, res) => {
    let name = req.body.budgetName;
    let quantity = req.body.budgetQuantity;
    let newBudget = {
        name: name, 
        quantity: quantity,
        cateogry: category
    };
    Attrition.create(newBudget, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
        }
    });
    res.redirect('/add');
});


module.exports = router;