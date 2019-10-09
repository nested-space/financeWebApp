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

module.exports = {
    MonthlyAttritionItem,
    PredictedPeriodicItem
};
