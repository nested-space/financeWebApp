const express         = require('express');
const router = express.Router();

//Models
const Commitment = require('../../models/Commitment.js').Commitment;

// @route       GET api/commitments
// @desc        Get all commitments
// @ access     Public TODO: improve to filter for user
router.get('/', (req, res) => {
    Commitment.find().sort({ quantity: -1 })
      .then(commitments => res.json(commitments))
});

// @route       POST api/commitments
// @desc        Create a commitment
// @ access     Public TODO: add authentification
router.post('/', (req, res) => {
    console.log(req.body);
    const newCommitment = new Commitment({
        name: req.body.name,
        quantity: req.body.quantity,
        dayOfMonth: req.body.day,
        category: req.body.category
    });

    newCommitment.save()
      .then(commitment => res.json(commitment));
});

// @route       DELETE api/commitments
// @desc        Delete a commitment
// @ access     Public TODO: add authentification
router.delete('/:id', (req, res) => {
    Commitment.findById(req.params.id)
        .then(commitment => commitment.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));

});

//TODO: create GET route for api/budgets/:id to get detail for one item

module.exports = router;
