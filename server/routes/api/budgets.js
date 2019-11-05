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

//TODO: create GET route for api/budgets/:id to get detail for one item

module.exports = router;

