$(document).ready(function() {

    let financeDetails = {};

    let promises = ['budgets', 'commitments', 'expenses'].map(function(suffix) {
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

            updateCommitmentsChart(
                summariseByCategory(
                    financeDetails.commitments));

            updateTotalsChart(
                getTotals(
                    financeDetails.budgets, 
                    financeDetails.commitments));

            updateFinanceModelChart(
                modelFinancesForMonth(
                    financeDetails.budgets,
                    financeDetails.commitments,
                    0),
                calculateExpensesForMonth(
                    financeDetails.expenses,
                    financeDetails.commitments,
                    0)
            );
        })
        .catch(console.error);
});

//TODO: include auth for user
function getRequestToAPI(suffix, callback){
    let xhr = new XMLHttpRequest();
    let url = 'http://nestedspace.ddns.net:5000/finance/api/' + suffix;
    xhr.open('GET', url, true);
    xhr.onload = function(){
        callback(true, JSON.parse(this.responseText));
    } 
    xhr.onerror = function(){
        callback(false, {});
    }
    xhr.send();
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

function getTotals(budgets, commitments){
    let totalIncome = 0;
    let totalOutgoings = 0;

    commitments.forEach(function(item) {                           
        if(item.quantity> 0) {
            totalIncome += item.quantity;
        } else {
            totalOutgoings -= item.quantity;
        };
    });

    budgets.forEach(function(budget) {
        totalOutgoings += budget.quantity;
    });

    return {
        income: parseFloat(totalIncome).toFixed(2),
        outgoings: parseFloat(totalOutgoings).toFixed(2)
    }
}

function getDailyTotalsForMonth(budgets, commitments){
    dailyAttrition = getDailyAttritionCost(budgets) 


}

function modelFinancesForMonth(budgets, commitments, startingMoney){
    let dailyAttrition = getDailyAttritionCost(budgets);
    let monthLength = 31; //TODO: get month length from actual month
    let currentMoney = startingMoney;
    let month = {};

    for (let i = 0; i < monthLength; i++){
        currentMoney = currentMoney += (getCostForDay(commitments, i+1) + dailyAttrition);
        month[i] = currentMoney;
    }
    return month;
}

function calculateExpensesForMonth(expenses, commitments, startingMoney){
    let monthLength = 31; //TODO: get month length from actual month
    let currentMoney = startingMoney;
    let month = {};

    for (let i = 0; i < monthLength; i++){
        currentMoney = currentMoney += (getCostForDay(expenses, i+1) + getCostForDay(commitments, i+1));
        month[i] = currentMoney;
    }
    return month;

}

function getCostForDay(commitments, day){
    let costForDay = 0;

    for (let i = 0; i < commitments.length; i++){
        if(commitments[i].dayOfMonth == day){
            costForDay += commitments[i].quantity;
        }
    }

    return costForDay;
}

function getDailyAttritionCost(budgets) {

    let attritionCost = 0;
    let monthLength = 31 //TODO: calculate from this month

    for (let i = 0; i < budgets.length; i++){
        attritionCost -= budgets[i].quantity;
    }

    return attritionCost/monthLength;
}

const budgets_chart = document.getElementById('BudgetSummaryChart').getContext('2d');
const commitments_chart = document.getElementById('CommitmentSummaryChart').getContext('2d');
const finance_chart = document.getElementById('FinanceIOChart').getContext('2d'); 
const modelChart = document.getElementById('FinanceModelChart').getContext('2d');


function updateFinanceModelChart(model, expenses){
    let modelData = [];
    let modelLabels = [];
    modelLabels.push(0);
    modelData.push(0);

    Object.keys(model).forEach(function(key) {
        modelData.push(
            parseFloat(model[key]).toFixed(2)
        );
        modelLabels.push(key);
    });

    let expenseData = [];
    let expenseLabels = [];
    expenseLabels.push(0);
    expenseData.push(0);

    Object.keys(expenses).forEach(function(key) {
        expenseData.push(
            parseFloat(expenses[key]).toFixed(2)
        );
        expenseLabels.push(key);
    });

    const myChart = new Chart(document.getElementById("FinanceModelChart"), {
        type: 'line',
        data: {
            labels: modelLabels,
            datasets: [{ 
                data: modelData,
                label: "Predicted",
                borderColor: "#3e95cd",
                fill: false
            }, {
                data: expenseData,
                label: "Expenses",
                borderColor: "#8e5ea2",
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'FInance Model',
                fontFamily: "'Indie Flower', cursive",
                fontSize: 16 
            },
            elements: {
                line: {
                    tension: 0 // disables bezier curves
                }
            }
        }
    });
    /*
    const myChart = new Chart(modelChart, {
        type: 'line',
        data: {
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'FInance Model',
                fontFamily: "'Indie Flower', cursive",
                fontSize: 16 
            },
        },
        scales: {
            xAxes: [{
                ticks: {
                    max: 32,
                    min: 0,
                    stepSize: 1
                }
            }]
        },
    });
    */
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
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderWidth: 0
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
        if (commitments[key] < 0){
            labels.push(key);
            data.push(parseFloat(-commitments[key]).toFixed(2));
        }
    }

    const chart = new Chart(commitments_chart, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Current Commitments:',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderWidth: 0
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
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ]
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

