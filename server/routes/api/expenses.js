const express         = require('express');
const router = express.Router();

//Models
const Expense = require('../../models/Expense.js').Expense;
const requiredFormat = require('../../models/Expense.js').required;

// @route       GET api/expenses
// @desc        Get all expenses
// @ access     Public TODO: improve to filter for user
router.get('/', (req, res) => {
	Expense.find().sort({ category: 1 })
		.then(expenses => res.json(expenses))
});

// @route       GET api/expenses/:id
// @desc        Retrieve all details for an expense
// @ access     Public TODO: add authentification
router.get('/:id', (req, res) => {
    Expense.findById(req.params.id)
        .then(expense => {
		console.log("Data for expense " + req.params.id + " is:");
		console.log(expense);
            res.status(201).json(expense);
        })
        .catch(() => {
            res.status(404).json({ success: false });
        });
});


// @route       GET api/expenses/:year/:month
// @desc        Fetch all expenses for the year and month specified
// @access      Public TODO: improve to filter for user

router.get('/:year/:month', (req, res) => {
	Expense.find()
		.then(expenses => {
			data = [];
			expenses.map((expense) => {
				let date = new Date(expense.date);
				if(date.getUTCFullYear() == req.params.year && date.getUTCMonth() == req.params.month){
					data.push(expense);
				}
			});
			res.status(201).json(data);
		});
});


// @route       POST api/expenses
// @desc        Create an expense
// @ access     Public TODO: add authentification
router.post('/', (req, res) => {
	console.log(req);
	try {
		const newExpense = new Expense(req.body);
		newExpense.save()
			.then(expense => {
				res.status(201);
				res.json({
					message: "Nice One",
					data: expense
				});
			})
			.catch(err => {
				console.log("handling rejection");
				res.status(422)
					.json({
						message: "We couldn't store that information for you. Please check the formatting of your expense",
						format: requiredFormat
					});
			});
	}
	catch(err) {
		res.status(400).json({
			message: "Syntax of request not suitable to create new expense item"
		});
	}
});

	// @route       DELETE api/expenses/del
	// @desc        Delete an expense
	// @ access     Public TODO: add authentification
	router.delete('/:id', (req, res) => {
		Expense.findById(req.params.id)
			.then(expense => expense.remove().then(() => res.json({ success: true })))
			.catch(err => res.status(404).json({ success: false }));
	});

//TODO: create GET route for api/expenses/:id to get detail for one item

module.exports = router;

