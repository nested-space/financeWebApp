const express         = require('express');
const router = express.Router();

//Models
const Budget = require('../../models/Budget.js').Budget;
const Commitment = require('../../models/Commitment.js').Commitment;

// @route GET /finance
// @desc HTML web page with finance summary
// @access Public
// TODO: ALTER THIS TO BRING IN DATA ASYNCHRONOUSLY
router.get('/', (req, res) => {
    Budget.find({}, function(err, budgets) {
        if (!err){
            Commitment.find({}, (error, commitments) => {
                if(!error){
                    res.render('portfolio/finance/finance_summary', {
                        budgets: budgets,
                        commitments: commitments
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

// @route GET /finance/modify
// @desc HTML web page to allow user to register new, or edit existing financial information
// @access Public
// TODO: ALTER THIS TO BRING DATA IN ASYNCHRONOUSLY
router.get('/modify', (req, res) => {
    Budget.find({}, function(err, budgets) {
        if (!err){
            Commitment.find({}, (error, periodics) => {
                if(!error){
                    res.render('portfolio/finance/finance_modify', {
                        budgets: budgets,
                        commitments: commitments
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

// @route POST /finance/addOutgoing
// @desc HTML 
// @access Public
// TODO: ALTER THIS TO BE PRIVATE
router.post('/addOutgoing', (req, res) => {
    const newCommitment = {
        name: req.body.outgoingName,
        quantity: req.body.quantity,
        dayOfMonth: req.body.day,
        category: req.body.category
    };

    newCommitment.save().then(item => res.json(item));
    
    res.redirect('/add');
});

// @route POST /finance/addBudget
// @desc HTML 
// @access Public
// TODO: ALTER THIS TO BE PRIVATE
router.post('/addBudget', (req, res) => {
    const newBudget = {
        name: req.body.budgetName, 
        quantity: req.body.budgetQuantity,
    };

    newBudget.save().then(item => res.json(item));

    res.redirect('/add');
});

module.exports = router;
