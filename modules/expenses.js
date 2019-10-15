const mongoose = require("mongoose"),
      Schema = mongoose.Schema;

const attritionSchema = new Schema({
    "quantity": Number,
    "name": String
});

const periodicSchema = new Schema({
    "name": String,
    "dayOfMonth": Number,
    "quantity": Number,
    "cateogry": String
});

const MonthlyAttritionItem = mongoose.model('monthlyPredictedAttrition', attritionSchema);
const PredictedPeriodicItem = mongoose.model('monthlyPredictedSetDate', periodicSchema);


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

module.exports = {
    MonthlyAttritionItem,
    PredictedPeriodicItem,
    categoryQuantities,
    getFinanceSummaryData
};
