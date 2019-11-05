const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const commitmentSchema = new Schema({
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
    constraint: {
        recurrence: {
            type: String,
            required: true
        },
        dayOfMonth: {
            type: String
        },
        dayOfWeek: {
            type: String
        },
        weekInMonth: {
            type: String
        }
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
    category: {
        type: String,
        required: true
    }
});

const required =  {
    name: {
        type: "String",
        required: "required"
    },
    quantity: {
        type: "Number",
        required: "required"
    },
    constraint: {
        recurrence: {
            type: "String",
            accepted: "Daily, Weekly, Monthly, Annual, Once Only",
            required: "required"
        },
        dayOfMonth: {
            type: "Number, between 1 and 31",
            required: "optional"
        },
        dayOfWeek: {
            type: "Number, between 1 and 7. Monday = 1",
            required: "optional"
        },
        weekInMonth: {
            type: "Number, between 1 and 4. Partial weeks at start are counted, index 1",
            required: "optional"
        } 
    },
    effective: {
        from : {
            type: "Date",
            default: "current date"
        },
        stop : {
            type: "Date"
        }
    },
    category: {
        type: "String",
        required: "required"
    }
}



const Commitment = mongoose.model('commitment', commitmentSchema);

module.exports = {
    Commitment
};
