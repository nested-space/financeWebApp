const express         = require('express');
const router = express.Router();
const cors = require('cors');
router.use(cors());
//Models
const Budget = require('../../models/Budget.js').Budget;
const requiredFormat = require('../../models/Budget.js').required;

// @route       GET api/budgetItems
// @desc        Get all budget items
// @ access     Public TODO: improve to filter for user
router.get('/', (req, res) => {
    console.log('request made');
    Budget.find().sort({ quantity: -1 })
      .then(budgets => res.json(budgets))
});

// @route       GET api/budgets/:id
// @desc        Retrieve all details for a budget item
// @ access     Public TODO: add authentification
router.get('/:id', (req, res) => {
    Budget.findById(req.params.id)
        .then(budget => {
		console.log("Budget for " + req.params.id + " is:");
		console.log(budget);
            data = [];
            data.push(budget);
            res.status(201).json(data);
        })
        .catch(() => {
            res.status(404).json({ success: false });
        });
});


// @route       GET api/budgets/:year/:month
// @desc        Fetch all budgets for the year and month specified
// @access      Public TODO: improve to filter for user
router.get('/:year/:month', (req, res) => {
    console.log("request for year: " + req.params.year + " and month: " + req.params.month);
    Budget.find()
        .then(budgets => {
            data = [];
            budgets.map((budget) => {
                let effective = true;
                if(budget.effective.stop !== undefined){
                    const stop = new Date(budget.effective.stop);
                    stopMonth = req.params.month - 1; //account for 0-indexed months in getUTCMonth()
                    if (stop.getUTCFullYear() < req.params.year){
                        effective = false;
                    } else if((stop.getUTCFullYear() == req.params.year) && (stop.getUTCMonth() < stopMonth)) {
                        effective = false;
                    }
                    if((stopMonth < 0) || (stopMonth > 11)) effective = false;
                }

                const from = new Date(budget.effective.from || Date.now());
                if(from.getUTCFullYear() > req.params.year) {
                    effective = false;
                } else if ((from.getUTCMonth() == req.params.year) && (from.getUTCMonth() >= req.params.month)) {
                    effective = false;
                }

                if(effective){
                    data.push(budget);
                }
            });
            res.status(201).json(data);
        });
});

// @route       POST api/budgets
// @desc        Create a budget item
// @ access     Public TODO: add authentification
router.post('/', (req, res) => {
    try {
        const newBudget = new Budget(req.body);
        newBudget.save()
            .then(budget => {
                res.status(201);
                res.json({
                    message: "Nice One",
                    data: budget
                });
            })
            .catch(err => {
                console.log("handling rejection");
                res.status(422)
                    .json({
                        message: "We couldn't store that information for you. Please check the formatting of your budget item",
                        format: requiredFormat
                    });
            });
    }
    catch(err) {
        res.status(400).json({
            message: "Format of request not suitable to create new budget item"
        });
    }
    
});

// @route       DELETE api/budgets
// @desc        Delete a budget item
// @ access     Public TODO: add authentification
router.delete('/:id', (req, res) => {
    Budget.findById(req.params.id)
        .then(budget => budget.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));
});


module.exports = router;

