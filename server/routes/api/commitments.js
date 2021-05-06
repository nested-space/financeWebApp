const express         = require('express');
const router = express.Router();

//Models
const Commitment = require('../../models/Commitment.js').Commitment;
const requiredFormat = require('../../models/Commitment.js').required;
// @route       GET api/commitments
// @desc        Get all commitments
// @ access     Public TODO: improve to filter for user
router.get('/', (req, res) => {
    Commitment.find()
        .sort({ quantity: -1 })
      .then(commitments => res.json(commitments))
});

// @route       GET api/commitments/:id
// @desc        Retrieve all details for a commitment
// @ access     Public TODO: add authentification
router.get('/:id', (req, res) => {
    Commitment.findById(req.params.id)
        .then(commitment => {
            data = [];
            data.push(commitment);
            res.status(201).json(data);
        })
        .catch(() => {
            res.status(404).json({ success: false });
        });
});


// @route       GET api/commitments/:year/:month
// @desc        Fetch all commitments for the year and month specified
// @access      Public TODO: improve to filter for user
router.get('/:year/:month', (req, res) => {
    Commitment.find()
        .sort({ quantity: -1 })
        .then(commitments => {
            data = [];
            commitments.map((commitment) => {
                let effective = true;
                if(commitment.effective.stop !== undefined){
                    const stop = new Date(commitment.effective.stop);
                    if (stop.getUTCFullYear() < req.params.year){
                        effective = false;
                    } else if(stop.getUTCMonth() < req.params.month) {
                        effective = false;
                    }
                }

                const from = new Date(commitment.effective.from || Date.now());
                if(from.getUTCFullYear() > req.params.year) {
                    effective = false;
                } else if ((from.getUTCFullYear() == req.params.year) && (from.getUTCMonth() > req.params.month)) {
                    effective = false;
                }

                if(effective){
                    data.push(commitment);
                }
            });
            res.status(201).json(data);
        });
});

// @route       POST api/commitments
// @desc        Create a commitment
// @ access     Public TODO: add authentification
router.post('/', (req, res) => {
    console.log(req.body);

    try {
        const newCommitment = new Commitment(req.body);
        newCommitment.save()
            .then(commitment => {
                res.status(201);
                res.json({
                    message: "Nice One",
                    data: commitment
                });
            })
            .catch(err => {
                console.log("handling rejection");
                res.status(422)
                    .json({
                        message: "We couldn't store that information for you. Please check the formatting of your commitment",
                        format: requiredFormat
                    });
            });
    }
    catch(err) {
        res.status(400).json({
            message: "Format of request not suitable to create new commitment"
        });
    }
    
});

// @route       DELETE api/commitments
// @desc        Delete a commitment
// @ access     Public TODO: add authentification
router.delete('/:id', (req, res) => {
    Commitment.findById(req.params.id)
        .then(commtiment => commtiment.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;
