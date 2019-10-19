const express         = require('express');
const router = express.Router();

//Models
const Budget = require('../../models/Budget.js').Budget;

// @route       GET api/budgetItems
// @desc        Get all budget items
// @ access     Public TODO: improve to filter for user
router.get('/', (req, res) => {
    console.log('request made');
    Budget.find().sort({ quantity: -1 })
      .then(budgets => res.json(budgets))
});

// @route       GET api/budgetItems
// @desc        Get all budget items
// @ access     Public TODO: improve to filter for user
router.get('/dev', (req, res) => {
    Budget.find().sort({ quantity: -1 })
      .then(budgets => {

          let output = {};
          for(let i = 0; i<budgets.length; i++){ output[budgets[i]['name']] = budgets[i]['quantity']; }
          res.json(output)
      })
});

// @route       POST api/budgets
// @desc        Create a budget item
// @ access     Public TODO: add authentification
router.post('/', (req, res) => {
    const newBudget = new Budget({
        name: req.body.name,
        quantity: req.body.quantity,
    });
    
    newBudget.save()
      .then(budget => res.json(budget));
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

