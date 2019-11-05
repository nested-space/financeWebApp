const express         = require('express');
const router = express.Router();

//Models
const Income = require('../../models/Income.js').Income;
const requiredFormat = require('../../models/Income.js').required;

// @route       GET api/income
// @desc        Get all income
// @ access     Public TODO: improve to filter for user
router.get('/', (req, res) => {
    Income.find()
        .sort({ quantity: -1 })
      .then(income => res.json(income))
});

// @route       POST api/income
// @desc        Create an income stream
// @ access     Public TODO: add authentification
router.post('/', (req, res) => {
    console.log(req.body);

    try {
        const incomeStream = new Income(req.body);
        incomeStream.save()
            .then(income => {
                res.status(201);
                res.json({
                    message: "Nice One",
                    data: income
                });
            })
            .catch(err => {
                console.log("handling rejection");
                res.status(422)
                    .json({
                        message: "We couldn't store that information for you. Please check the formatting of your income",
                        format: requiredFormat
                    });
            });
    }
    catch(err) {
        res.status(400).json({
            message: "Syntax of request not suitable to create new income stream. Please submit JSON."
        });
    }
    
});

// @route       DELETE api/income
// @desc        Delete an income stream
// @ access     Public TODO: add authentification
router.delete('/:id', (req, res) => {
    Income.findById(req.params.id)
        .then(income => income.remove()
            .then(() => res.json({ success: true })))
            .catch(err => res.status(404).json({ success: false }));

});

//TODO: create GET route for api/budgets/:id to get detail for one item

module.exports = router;
