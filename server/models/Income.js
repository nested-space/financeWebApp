const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const required = {
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    frequency : {
        type: String,
        required: true
    },
    effective: {
        from:  {
            type: Date,
            default: Date.now()
        },
        stop: {
            type: Date,
        }
    },
    specifics: [
        {
            date: {
                type: Date,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            reason: {
                type: String,
            }
        }
    ]
};

const incomeSchema = new Schema({
    created: {
        type: Date,
        default: Date.now()
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    frequency : {
        type: String,
        required: true
    },
    effective: {
        from:  {
            type: Date,
            default: Date.now()
        },
        stop: {
            type: Date,
        }
    },
    exceptions: [
        {
            date: {
                type: Date,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            reason: {
                type: String,
            }
        }
    ]
});
const Income = mongoose.model('income', incomeSchema);

module.exports = {
    Income,
    required
};
