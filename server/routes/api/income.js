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

// @route       GET api/income/:id
// @desc        Retrieve all details for a income
// @ access     Public TODO: add authentification
router.get('/:id', (req, res) => {
    Income.findById(req.params.id).exec()
        .then(income => {
            data = [];
            data.push(income);
            res.status(201).json(data);
        })
        .catch(() => {
            res.status(404).json({ success: false });
        });
});

// @route       GET api/income/:year/:month
// @desc        Fetch all income for the year and month specified
// @access      Public TODO: improve to filter for user
router.get('/:year/:month', (req, res) => {
    Income.find()
        .then(incomes => {
            data = [];
            incomes.map((income) => {
                let effective = true;
		if(income.effective.stop !== undefined){
		    const stop = new Date(income.effective.stop);
		    stopMonth = req.params.month - 1; //account for 0-indexed months in getUTCMonth()
		    if (stop.getUTCFullYear() < req.params.year){
		        effective = false;
		    } else if((stop.getUTCFullYear() == req.params.year) && (stop.getUTCMonth() < stopMonth)) {
		        effective = false;
		    }
		
		    if((stopMonth < 0) || (stopMonth > 11)) effective = false;
		}



                const from = new Date(income.effective.from || Date.now());
                if(from.getUTCFullYear() > req.params.year) {
                    effective = false;
                } else if ((from.getUTCFullYear() == req.params.year) && (from.getUTCMonth() >= req.params.month)) {
                    effective = false;
                }

                if(effective){
                    data.push(income);
                }
            });
            res.status(201).json(data);
        })
    .catch(err => {
        console.log("error");

    });
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
        .then(income => income.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;
