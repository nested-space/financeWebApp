const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const attritionSchema = new Schema({
    quantity: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

const periodicSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dayOfMonth: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    cateogry: {
        type: String,
        required: true
    }
});

let categoryQuantities = function(items) {

    //for each item, if category has already been added, increment quantity
    


    //if category has not been added, add category and quantity = quantity

  console.log( "Hello" );
};

let getFinanceSummaryData = function(){
    MonthlyAttritionItem.find({}, function(err, budgets) {
        if (!err){
            PredictedPeriodicItem.find({}, (error, periodics) => {
                if(!error){
                    let summaryData = {
                        "budgets": budgets,
                        "periodics": periodics
                    } 
                    console.log("Returning Data----------------------");
                    console.log(summaryData);
                    return summaryData;
                } else {
                    throw error;
                }
            });
        } else {
            throw err;
        }
    });
}

const MonthlyAttritionItem = mongoose.model('monthlyPredictedAttrition', attritionSchema);
const PredictedPeriodicItem = mongoose.model('monthlyPredictedSetDate', periodicSchema);


module.exports = {
    MonthlyAttritionItem,
    PredictedPeriodicItem,
    categoryQuantities,
    getFinanceSummaryData
};
