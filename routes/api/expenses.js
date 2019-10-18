const express         = require('express');
const router = express.Router();

//Models
const Expense = require('../../models/Expense.js').Expense;

// @route       GET api/expenses
// @desc        Get all expenses
// @ access     Public TODO: improve to filter for user
router.get('/', (req, res) => {
    Expense.find().sort({ quantity: -1 })
      .then(expenses => res.json(expenses))
});

// @route       POST api/expenses
// @desc        Create an expense
// @ access     Public TODO: add authentification
router.post('/', (req, res) => {
    const newExpense = new Expense({
        name: req.body.name,
        quantity: req.body.quantity,
    });
    
    newExpense.save()
      .then(expense => res.json(expense));
});

// @route       DELETE api/expenses/del
// @desc        Delete an expense
// @ access     Public TODO: add authentification
router.delete('/:id', (req, res) => {
    Expense.findById(req.params.id)
        .then(expense => expense.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));
});

//TODO: create GET route for api/budgets/:id to get detail for one item

module.exports = router;

