const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const budgetSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    effective: {
        from: {
            type: Date,
            default: Date.now()
        },
        stop: {
            type: Date
        }
    }
});

const required = {
    name: {
        type: "String",
        required: "required"
    },
    quantity: {
        type: "Number",
        required: "required"
    },
    effective: {
        from: {
            type: Date,
            default: "When inserted"
        }
    }
}

const Budget = mongoose.model('budget', budgetSchema);

module.exports = {
    Budget,
    required
};
