let colours = [
    'rgba(128, 0  , 128, 1)',
    'rgba(255, 99 , 132, 1)',
    'rgba(54 , 162, 235, 1)',
    'rgba(255, 255, 102 , 1)',
    'rgba(75 , 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64 , 1)',
    'rgba(0  , 191, 255, 1)',
    'rgba(0  , 255, 127, 1)',
    'rgba(220, 20 , 60 , 1)',
    'rgba(255, 206, 86 , 1)',
    'rgba(102, 255, 255 , 1)'
];

let lightColours = [
    'rgba(128, 0  , 128, 0.3)',
    'rgba(255, 99 , 132, 0.3)',
    'rgba(54 , 162, 235, 0.3)',
    'rgba(255, 255, 102 , 0.3)',
    'rgba(75 , 192, 192, 0.3)',
    'rgba(153, 102, 255, 0.3)',
    'rgba(255, 159, 64 , 0.3)',
    'rgba(0  , 191, 255, 0.3)',
    'rgba(0  , 255, 127, 0.3)',
    'rgba(220, 20 , 60 , 0.3)',
    'rgba(255, 206, 86 , 0.3)',
    'rgba(102, 255, 255 , 0.3)'
];

$(document).ready(function() {

    let financeDetails = {};

    let promises = ['budgets', 'commitments', 'expenses', 'income'].map(function(suffix) {
        return new Promise(function(resolve, reject) {
            getRequestToAPI(suffix, function(success, results) {
                if(success){
                    financeDetails[suffix] = results;
                    resolve();
                } else {
                    reject();
                }
            });
        });
    });

    Promise.all(promises)
        .then(function() {
            updateBudgetsChart(financeDetails.budgets);
            

            let startDate = new Date(Date.now());
            startDate.setDate(0);
            
            let endDate = new Date(Date.now());
            endDate.setDate(0);
            endDate.setDate(endDate.getDate() + 30);

            updateCommitmentsChart(
                summariseByCategory(financeDetails.commitments));

            updateTotalsChart(
                getTotals(
                    financeDetails.budgets, 
                    financeDetails.commitments,
                    financeDetails.income));

            let financeModel = getFinanceModel(
                financeDetails.commitments,
                financeDetails.budgets,
                financeDetails.expenses,
                financeDetails.income,
                startDate,
                endDate
            );

            updateFinanceModelChart(financeModel, 2545.01);
        })
        .catch(console.error);
});

function getFinanceModel(commitments, budgets, expenses, income, startDate, endDate){
    if(startDate > endDate) { return };

    let current_date = startDate;
    current_date = new Date(
        startDate.getUTCFullYear(), 
        startDate.getUTCMonth(), 
        startDate.getUTCDate());
    
    let end_date_utc = endDate;
    end_date_utc = new Date(
        end_date_utc.getUTCFullYear(), 
        end_date_utc.getUTCMonth(), 
        end_date_utc.getUTCDate());
    let now = new Date(Date.now());
    now = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate());

    let financeModel = {};
    
    while (current_date <= end_date_utc) {
        date_str = current_date;
        financeModel[date_str] = {}
        financeModel[date_str].predicted = 0; 
        financeModel[date_str].real = 0; 
        
        //iterate through budgets to add to predicted TODO: handle weighting for budgets
        let monthLength = getDaysInMonth(current_date.getUTCFullYear(), current_date.getUTCMonth());
        budgets.forEach((item) => {
            dailyCost = item.quantity/monthLength;
            financeModel[date_str].predicted = financeModel[date_str].predicted - (item.quantity / monthLength);

            if(current_date > now){
                financeModel[date_str].real = financeModel[date_str].real - (item.quantity / monthLength);
            }
        });

        //iterate through commitments to see whether constraints fulfilled:
        commitments.forEach((item) => {
            constraintsFulfilled = true; 
            let dayOfWeek = (((item || {}).constraint || {}).dayOfWeek);
            if(dayOfWeek != undefined){
                console.log("day of week constraint currently not handled" + dayOfWeek);
            }

            let dayOfMonth = (((item || {}).constraint || {}).dayOfMonth);
            if(dayOfMonth != undefined){
                if(dayOfMonth != current_date.getDate()){
                    constraintsFulfilled = false;
                }
            }

            let weekOfMonth = (((item || {}).constraint || {}).weekOfMonth);
            if(weekOfMonth != undefined){
                console.log("week of month constraint currently not handled" + weekOfMonth);
            }

            if(constraintsFulfilled){
                financeModel[date_str].real = financeModel[date_str].real - item.quantity;
                financeModel[date_str].predicted = financeModel[date_str].predicted - item.quantity;
            }

            //TODO: if the monthly commitment occurs on a date that doesn't exist in this month (i.e 31st in September), take out on 30th.
        });

        //iterate through all expenses and add to real
        expenses.forEach((item) => {
            let itemDate = new Date(item.date);
            if(itemDate.getUTCFullYear() == current_date.getUTCFullYear() &&
                itemDate.getMonth() == current_date.getMonth() &&
                itemDate.getDate() == current_date.getDate()){

                financeModel[date_str].real = financeModel[date_str].real - item.quantity;
            }
        });

        //iterate through income and add to both real and predicted
        income.forEach((item) => {
            constraintsFulfilled = true; 
            let dayOfWeek = (((item || {}).constraint || {}).dayOfWeek);
            if(dayOfWeek != undefined){
                console.log("day of week constraint currently not handled" + dayOfWeek);
            }

            let dayOfMonth = (((item || {}).constraint || {}).dayOfMonth);
            if(dayOfMonth != undefined){
                if(dayOfMonth != current_date.getDate()){
                    constraintsFulfilled = false;
                }
            }

            let weekOfMonth = (((item || {}).constraint || {}).weekOfMonth);
            if(weekOfMonth != undefined){
                console.log("week of month constraint currently not handled" + weekOfMonth);
            }

            if(constraintsFulfilled){
                financeModel[date_str].real = financeModel[date_str].real + item.quantity;
                financeModel[date_str].predicted = financeModel[date_str].predicted + item.quantity;
            }

            //TODO: if the monthly commitment occurs on a date that doesn't exist in this month (i.e 31st in September), take out on 30th.
        });
        current_date.setDate(current_date.getDate()+1);
    }
    return financeModel;
}

function summariseByCategory(commitments){
    let categoryCommitments = {};
    commitments.forEach(function(item) {                           
        if(categoryCommitments.hasOwnProperty(item.category)){  
            categoryCommitments[item.category] = categoryCommitments[item.category] + item.quantity;
        } else {                                                
            categoryCommitments[item.category] = item.quantity;
        }                                                       
    }); 
    return categoryCommitments;
}

function getTotals(budgets, commitments, income){
    let totalIncome = 0;
    let totalOutgoings = 0;

    commitments.forEach(function(item) {                           
            totalOutgoings -= item.quantity;
    });

    budgets.forEach(function(item) {
        totalOutgoings += item.quantity;
    });

    income.forEach((item) => {
        const dt = new Date(Date.now());
        totalIncome += item.quantity;
    });

    return {
        income: parseFloat(totalIncome).toFixed(2),
        outgoings: parseFloat(totalOutgoings).toFixed(2)
    }
}

function getDailyTotalsForMonth(budgets, commitments){
    dailyAttrition = getDailyAttritionCost(budgets) 
    //TODO: improve by refining budget spends to specific days (e.g. entertainment on friday night and weekends)
}

function modelFinancesForMonth(budgets, commitments, startingMoney){
    let dailyAttrition = getDailyAttritionCost(budgets);
    let monthLength = 31; //TODO: get month length from actual month
    let currentMoney = startingMoney;
    let month = {};

    for (let i = 0; i < monthLength; i++){
        currentMoney = currentMoney -= (getDaysCommitmentCost(commitments, i+1) + dailyAttrition);
        month[i] = currentMoney;
    }
    return month;
}

function calculateExpensesForMonth(expenses, commitments, startingMoney){
    let date = new Date(Date.now());
    let currentYear = date.getYear();
    let currentMonth = date.getMonth();
    let monthLength = getDaysInMonth(currentYear, currentMonth); //TODO: get month length from actual month
    
    let currentMoney = startingMoney;
    let month = {};
    //TODO: set bounds by date bounds (allow to be set by user)
    for (let i = 0; i < monthLength; i++){
        date.setDate(i);
        currentMoney = currentMoney -= (getDaysExpenseCost(expenses, date) + getDaysCommitmentCost(commitments, i+1));
        month[i] = currentMoney;
    }
    return month;
}

function getDaysCommitmentCost(commitments, day){

    let costForDay = 0;
    for (let i = 0; i < commitments.length; i++){
        if(commitments[i].dayOfMonth == day){
            costForDay += commitments[i].quantity;
        }
    }
    return costForDay;
}

function getDaysExpenseCost(items, date){
    let costForDay = 0;
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    for (let i = 0; i < items.length; i++){
        itemDate = new Date(items[i].date);
        if(itemDate.getDate() == day){
            costForDay += items[i].quantity;
        }
    }
    return costForDay;
}

function getDailyAttritionCost(budgets) {
    let attritionCost = 0;
    let monthLength = 31 //TODO: calculate from this month
    for (let i = 0; i < budgets.length; i++){
        attritionCost += budgets[i].quantity;
    }
    return attritionCost/monthLength;
}

Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Month here is 1-indexed (January is 1, February is 2, etc). This is
// because we're using 0 as the day so that it returns the last day
// of the last month, so you have to add 1 to the month number 
// so it returns the correct amount of days
function getDaysInMonth (year, month) {
    return new Date(year, month, 0).getDate();
}

function getShortMonth(date)
{
    return Date.shortMonths[date.getMonth()];
}

function getDateString(date){
    return date.getDate() + "-" +
        getShortMonth(date)
}


const budgets_chart = document.getElementById('BudgetSummaryChart').getContext('2d');
const commitments_chart = document.getElementById('CommitmentSummaryChart').getContext('2d');
const finance_chart = document.getElementById('FinanceIOChart').getContext('2d'); 
const modelChart = document.getElementById('FinanceModelChart').getContext('2d');


function updateFinanceModelChart(model, initialValue){
    let predicted = [];
    let real = [];
    let labels = [];
    let now = Date.now();

    currentReal = initialValue;
    currentPredicted = initialValue;
    Object.keys(model).forEach(function(key) {
        let currentDate = new Date(key);

        currentPredicted += model[key].predicted;
        predicted.push(currentPredicted);

        if(currentDate<=now){
            currentReal += model[key].real;
            real.push(currentReal);
        }
        labels.push(getDateString(new Date(key)));
    });

    const myChart = new Chart(document.getElementById("FinanceModelChart"), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ 
                data: predicted,
                label: "Predicted",
                borderColor: lightColours[5],
                pointRadius: 0,
                borderWidth: 2,
                borderDash: [10,5],
                fill: false,
            }, {
                data: real,
                label: "Expenses",
                borderColor: colours[4],
                fill: 'bottom',
                backgroundColor: lightColours[4], 
                borderWidth: 2,
                pointRadius: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false,
            },
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display:true,
                        color: '#DDDDDD'
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        minRotation: 0,
                        maxRotation: 0
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display:false
                    },
                    ticks: {
                        maxTicksLimit: 5,
                        callback: function(value, index, values) {
                        return '£' + value;
                        }
                    }
                }]
            }
        }
    });
}

function updateBudgetsChart(budgets){
    let labels = [];
    let data = [];
    for (let i=0; i<budgets.length; i++){
        labels.push(budgets[i].name);
        data.push(parseFloat(budgets[i].quantity).toFixed(2));
    }

    const myChart = new Chart(budgets_chart, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'monthly budgets',
                data: data,
                backgroundColor: colours,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Current Budgets:',
                fontFamily: "'Indie Flower', cursive",
                fontSize: 16 
            },
            legend: {
                position: 'bottom',
            }
        }
    });
}

function updateCommitmentsChart(commitments){
    let labels = [];
    let data = [];
    for (let key in commitments){
            labels.push(key);
            data.push(parseFloat(-commitments[key]).toFixed(2));
    }

    const chart = new Chart(commitments_chart, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Current Commitments:',
                data: data,
                backgroundColor: colours,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Current Commitments:',
                fontFamily: "'Indie Flower', cursive",
                fontSize: 16 
            },
            legend: {
                position: 'bottom',

            }
        }
    });
}

function updateTotalsChart(io){    

    const myBarChart = new Chart(finance_chart, {
        type: 'horizontalBar',
        data: {
            labels: [
                'Income',
                'Outgoings'
            ],
            datasets: [
                {
                    data: [
                        io.income, io.outgoings
                    ],
                    backgroundColor: colours,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Predicted Income Vs Outgoings:',
                fontFamily: "'Indie Flower', cursive",
                fontSize: 16 
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    ticks: {
                        min: 0,
                    }
                }]
            }
        }
    });
}

