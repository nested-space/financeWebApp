const primary = '#F3D250';
const primary_md = '#F6DF82'; 
const primary_light = '#FCF2CD';
const primary_very_light = '#fef9e7';
const primary_dark = '#878754';
const secondary = '#5DA2D5';
const secondary_md = '#A2CAE7';
const secondary_light = '#E8F2F9';
const secondary_dark = '#3E6C8E';
const tertiary = '#F78888';
const tertiary_md = '#F9A6A6';
const tertiary_light = '#FDE1E1';
const quaternary = '#90CCF4';
const quaternary_md = '#ACD9F7';
const quaternary_light = '#E3F2FC';
const danger = '#F78888';
const danger_md = '#FAB0B0';
const danger_light = '#FAB0B0';
const success = '#63CC9C';
const success_md = '#8AD9B5';
const success_light = '#D8F2E6';
const lowlight = '#767666';

const colours = [primary, secondary, tertiary, quaternary, success,
    primary_md, secondary_md, tertiary_md, quaternary_md, success_md,
    secondary_light, tertiary_light, quaternary_light, success_light ];

const ioColours = [success, danger];

const apiURL = 'http://nestedspace.ddns.net:5000/finance/api/';
const DELETE_SPAN = "<span class='delete fa fa-trash'></span>";

function prioritiseLink(linkId){
    document.getElementById('modelLink').classList.remove('active');
    document.getElementById('budgetsLink').classList.remove('active');
    document.getElementById('expensesLink').classList.remove('active');
    document.getElementById('incomeLink').classList.remove('active');
    document.getElementById('commitmentsLink').classList.remove('active');

    document.getElementById(linkId).classList.add('active');
}

function updateSummaryPage() {
    const financeSummaryChartContainer = document.getElementById('FinanceIOChart').getContext('2d');
    const commitmentsChartContainer = document.getElementById('CommitmentSummaryChart').getContext('2d');
    const budgetsChartContainer = document.getElementById('BudgetSummaryChart').getContext('2d');
    const financeModelChartContainer = document.getElementById("FinanceModelChart"); 
    let financeDetails = {};
    const now = new Date(Date.now());

    let promises = ['budgets', 'commitments', 'expenses', 'income'].map(function(suffix) {
        return new Promise(function(resolve, reject) {
            const urlSuffix = suffix + '/' + now.getFullYear() + "/" + now.getMonth();
            getRequestToAPI(urlSuffix, function(success, results) {
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
            updateBudgetsChart(budgetsChartContainer, financeDetails.budgets);

            let then = new Date(Date.now());
            then.setMonth(9);
            then.setDate(30);
            const oneDay = 24 * 60 * 60 * 1000;
            const difference = Math.round(Math.abs((now.getTime() - then.getTime()) / oneDay));

            let startDate = new Date(Date.now());
            startDate.setDate(startDate.getDate() - difference);
            let endDate = new Date(Date.now());
            endDate.setDate(0);
            endDate.setDate(endDate.getDate() + 30);

            updateCommitmentsChart(
                commitmentsChartContainer,
                summariseByCategory(financeDetails.commitments));

            let totals = getTotals(financeDetails.budgets, financeDetails.commitments, financeDetails.income);
            const currencyLabel = '£';
            updateTotalsChart(financeSummaryChartContainer, currencyLabel, totals);

            let financeModel = getFinanceModel(
                financeDetails.commitments,
                financeDetails.budgets,
                financeDetails.expenses,
                financeDetails.income,
                startDate,
                endDate
            );

            const initialValue = 2545;
            const formattedModel = formatModel(financeModel, initialValue);
            const data = 
                {
                    labels: formattedModel.labels,
                    datasets: [{ 
                        data: formattedModel.predicted,
                        label: "Model (past)",
                        borderColor: colours[1],
                        pointRadius: 1,
                        backgroundColor: colours[5], 
                        borderWidth: 2,
                        borderDash: [10,5],
                        fill: false,
                    }, {
                        data: formattedModel.next,
                        label: "Model (predicted)",
                        borderColor: colours[4],
                        pointRadius: 1,
                        borderWidth: 2,
                        borderDash: [10,5],
                        fill: false,
                    }, {
                        data: formattedModel.real,
                        label: "Expenses",
                        borderColor: colours[4],
                        fill: 'bottom',
                        backgroundColor: colours[5], 
                        borderWidth: 2,
                        pointRadius: 2,
                    }]
                };

            updateFinanceModelChart(financeModelChartContainer, data);

            let payday = new Date(Date.now());
            payday.setDate(25);
            const insightsDiv = 'insights';
            updateInsights(insightsDiv, totals, formattedModel, payday)
        })
        .catch(console.error);
}

function getFinanceModel(commitments, budgets, expenses, income, startDate, endDate){
    if(startDate > endDate) { return };

    let currentDate = startDate;
    currentDate = new Date(
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

    while (currentDate <= end_date_utc) {
        date_str = currentDate;
        financeModel[date_str] = {}
        financeModel[date_str].predicted = 0; 
        financeModel[date_str].real = 0; 

        //TODO: handle weighting for budgets
        let monthLength = getDaysInMonth(currentDate.getUTCFullYear(), currentDate.getUTCMonth());
        budgets.forEach((item) => {
            dailyCost = item.quantity/monthLength;
            financeModel[date_str].predicted = financeModel[date_str].predicted - (item.quantity / monthLength);

            if(currentDate > now){
                financeModel[date_str].real = financeModel[date_str].real - (item.quantity / monthLength);
            }
        });

        commitments.forEach((item) => {
            constraintsFulfilled = true; 
            let dayOfWeek = (((item || {}).constraint || {}).dayOfWeek);
            if(dayOfWeek != undefined){
                console.log("day of week constraint currently not handled" + dayOfWeek);
            }

            let dayOfMonth = (((item || {}).constraint || {}).dayOfMonth);
            if(dayOfMonth != undefined){
                if(dayOfMonth != currentDate.getDate()){
                    constraintsFulfilled = false;
                }
            }

            let weekOfMonth = (((item || {}).constraint || {}).weekOfMonth);
            if(weekOfMonth != undefined){
                console.log("week of month constraint currently not handled" + weekOfMonth);
            }

            let recurrence = ((item.constraint || {}).recurrence);
            let startDate = new Date((item.effective || {}).from);
            if(recurrence == "Once Only"){
                if(startDate.getUTCDate() != currentDate.getUTCDate() ||
                    startDate.getUTCMonth() != currentDate.getUTCMonth() ||
                    startDate.getUTCFullYear() != currentDate.getUTCFullYear()){
                    constraintsFulfilled = false;
                }
            }

            if(constraintsFulfilled){
                financeModel[date_str].real = financeModel[date_str].real - item.quantity;
                financeModel[date_str].predicted = financeModel[date_str].predicted - item.quantity;
            }

            //TODO: if the monthly commitment occurs on a date that doesn't exist in this month (i.e 31st in September), take it out early.
        });

        expenses.forEach((item) => {
            let itemDate = new Date(item.date);
            if(itemDate.getUTCFullYear() == currentDate.getUTCFullYear() &&
                itemDate.getMonth() == currentDate.getMonth() &&
                itemDate.getDate() == currentDate.getDate()){

                financeModel[date_str].real = financeModel[date_str].real - item.quantity;
            }
        });

        income.forEach((item) => {
            constraintsFulfilled = true; 
            let dayOfWeek = (((item || {}).constraint || {}).dayOfWeek);
            if(dayOfWeek != undefined){
                console.log("day of week constraint currently not handled" + dayOfWeek);
            }

            let dayOfMonth = (((item || {}).constraint || {}).dayOfMonth);
            if(dayOfMonth != undefined){
                if(dayOfMonth != currentDate.getDate()){
                    constraintsFulfilled = false;
                }
            }

            let weekOfMonth = (((item || {}).constraint || {}).weekOfMonth);
            if(weekOfMonth != undefined){
                console.log("week of month constraint currently not handled" + weekOfMonth);
            }

            let recurrence = ((item.constraint || {}).recurrence);
            let startDate = new Date((item.effective || {}).from);
            if(recurrence == "Once Only"){
                if(startDate.getUTCDate() != currentDate.getUTCDate() ||
                    startDate.getUTCMonth() != currentDate.getUTCMonth() ||
                    startDate.getUTCFullYear() != currentDate.getUTCFullYear()){
                    constraintsFulfilled = false;
                }
            }

            if(constraintsFulfilled){
                financeModel[date_str].real = financeModel[date_str].real + item.quantity;
                financeModel[date_str].predicted = financeModel[date_str].predicted + item.quantity;
            }

            //TODO: if the monthly commitment occurs on a date that doesn't exist in this month (i.e 31st in September), take it out early.
        });
        currentDate.setDate(currentDate.getDate()+1);

    }

    return financeModel
}

function formatModel(financeModel, initialValue){
    let predicted = [];
    let real = [];
    let next = [];
    let labels = [];
    let now = new Date(Date.now());

    currentReal = initialValue;
    currentPredicted = initialValue;
    Object.keys(financeModel).forEach(function(key) {
        let currentDate = new Date(key);

        if(currentDate.getDate() == now.getDate() && currentDate.getUTCMonth() == now.getUTCMonth()){
            currentReal += financeModel[key].real;
            real.push(parseFloat(currentReal).toFixed(2));
            next.push(parseFloat(currentReal).toFixed(2));

            currentPredicted += financeModel[key].predicted;
            predicted.push(parseFloat(currentPredicted).toFixed(2));
        } else if (currentDate<=now){
            currentReal += financeModel[key].real;
            real.push(parseFloat(currentReal).toFixed(2));
            next.push(null);

            currentPredicted += financeModel[key].predicted;
            predicted.push(parseFloat(currentPredicted).toFixed(2));
        } else {
            currentReal += financeModel[key].predicted;
            next.push(parseFloat(currentReal).toFixed(2));
        }
        labels.push(getDateString(new Date(key)));
    });

    formattedModel = {
        'predicted': predicted,
        'real': real,
        'next': next,
        'labels': labels
    }

    return formattedModel;
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
        totalOutgoings += item.quantity;
    });

    budgets.forEach(function(item) {
        totalOutgoings += item.quantity;
    });

    income.forEach((item) => {
        totalIncome += item.quantity;
    });

    return {
        income: parseFloat(totalIncome).toFixed(2),
        outgoings: parseFloat(totalOutgoings).toFixed(2)
    }
}

function updateInsights(insightsDiv, totals, model, payday){
    const goodHighlight = 'bg-success white';
    const badHighlight = 'bg-danger white';
    const neutralHighlight = 'bg-lowlight white';

    let clrClass = '';
    let hlghtClass = 'total';
    if(model.next[25] > 0){
        clrClass = 'success';
        hlghtClass = 'total-success';
    }

    let compareToBudget = parseFloat(model.real[model.real.length-1] - model.predicted[model.real.length-1]).toFixed(2);
    let comparePhrase = "";
    if(compareToBudget > 0){
        comparePhrase = "Money saved compared to budget";
        compareStyle = goodHighlight;
    } else {
        comparePhrase = "Money spent over budget";
        compareToBudget = parseFloat(-compareToBudget).toFixed(2);
        compareStyle = badHighlight;
    }

    const lowest = parseFloat(model.next[25]).toFixed(2);
    let lowestStyle;
    if(lowest > 0){
        lowestStyle = goodHighlight;
    } else {
        lowestStyle = badHighlight;
    }

    document.getElementById(insightsDiv).innerHTML =

        "<div class='insight-container'>" +
        "<div class='insight'>" + 
        "<span class='fas fa-temperature-low title'></span>" + 
        "<span class='insight-desc' >Month's lowest balance</span>" +
        "<span class='insight-amount " + lowestStyle + "'>£" + lowest + "</span>" +

        "<div><span class='insight-desc bg-primary-vlight'>" + comparePhrase + "</span>" +
        "<span class='insight-amount " + compareStyle + "'>£" + compareToBudget + "</span></div>" +
        "</div>" +

        "<div class='insight'>" + 
        "<span class='fas fa-dollar-sign title'></span>" + 
        "<span class='insight-desc' >Income</span>" +
        "<span class='insight-amount " + goodHighlight + "'>£" + totals.income + "</span><div>" +

        "<div><span class='insight-desc bg-primary-vlight' >Outgoings</span>" +
        "<span class='insight-amount " + neutralHighlight + "'>£" + totals.outgoings + "</span></div>" +
        "</div></div>" +

        "<div class='insight'>" + 
        "<span class='fas fa-running title'></span>" + 
        "<span class='insight-desc' >Spent this month</span>" +
        "<span class='insight-amount " + neutralHighlight + "'>£" + parseFloat(model.real[0] - model.real[model.real.length-1]).toFixed(2) + "</span>" +
        "</div>" +


        "</div>";
}

//------------------------------------------------------------------------------//
//                                                                              //
//                           DATE UTILITY FUNCTIONS                             //
//                                                                              //
//------------------------------------------------------------------------------//

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

//------------------------------------------------------------------------------//
//                                                                              //
//                                   FORMS                                      //
//                                                                              //
//------------------------------------------------------------------------------//

function submitAddNewBudgetForm(){
    const inputDetails =
        [
            {
                type: 'String',
                id: 'name'
            },
            {
                type: 'Currency',
                id: 'quantity'
            }
        ];
    if(!validateForm(inputDetails)) return;

    let name = document.getElementById('name').value; 
    let quantity = document.getElementById('quantity').value;
    postRequestToAddBudget(
        JSON.stringify({
            name: name,
            quantity: quantity
        }),
        function(success, response){
            console.log(response);
        });
}

function submitAddNewExpenseItemForm(){
    const inputDetails =
        [
            {
                type: 'String',
                id: 'name'
            },
            {
                type: 'Currency',
                id: 'quantity'
            },
            {
                type: 'Date',
                id: 'date'
            }
        ];

    if(!validateForm(inputDetails)) return;

    let name = document.getElementById('name').value;
    let quantity = document.getElementById('quantity').value;
    let date = document.getElementById('date').value;
    let description = document.getElementById('description').value;
    let category = document.getElementById('category').value;

    postRequestToAddExpense(
        JSON.stringify({
            name: name,
            quantity: quantity,
            date: date,
            description: description,
            category: category
        }),

        function(success, response){
            console.log(response);
        });
}

function submitAddNewCommitment(){
    const inputDetails =
        [
            {
                type: 'String',
                id: 'name'
            },
            {
                type: 'Currency',
                id: 'quantity'
            },
            {
                type: 'Date',
                id: 'start'
            },
            {
                type: 'Length',
                frequencySelectorId: 'frequency',
                lengthInputId: 'length'
            }
        ];

    if(!validateForm(inputDetails)) return;

    let name = document.getElementById("name").value; 
    let category = document.getElementById("category").value; 
    let quantity = document.getElementById("quantity").value;
    let frequency = document.getElementById("frequency").value;
    let startDate = new Date(document.getElementById("start").value);
    let length = parseInt(document.getElementById("length").value);
    let lengthUnit = document.getElementById("lengthUnit").value;

    let commitment = 
        {
            name: name,
            quantity: quantity,
            effective: {
                from : startDate
            },
            category : category,
            constraint: {
                recurrence : frequency
            }
        };

    if(frequency == "Weekly"){
        commitment.constraint.dayOfWeek = startDate.getDay();
    } else if (frequency == "Monthly"){
        commitment.constraint.dayOfMonth = startDate.getDate();
    }

    if(frequency != "Once Only"){
        let stop = new Date(startDate);
        if(lengthUnit == "Days"){
            stop.setDate(startDate.getDate() + length);
        } else if (lengthUnit == "Weeks"){
            stop.setDate(startDate.getDate() + length * 7);
        } else if (lengthUnit == "Months"){
            stop.setMonth(startDate.getMonth() + length);
        } else if (lengthUnit == "Years"){
            stop.setYear(startDate.getFullYear() + length);
        }
        commitment.effective.stop = stop;
    }
} 

function submitAddNewIncome(){
    const inputDetails =
        [
            {
                type: 'String',
                id: 'name'
            },
            {
                type: 'Currency',
                id: 'quantity'
            },
            {
                type: 'Date',
                id: 'start'
            }
        ];
    
    if(!validateForm(inputDetails)) return;
    return;
    let name = document.getElementById("name").value; 
    let quantity = document.getElementById("quantity").value;
    let frequency = document.getElementById("frequency").value;
    let startDate = document.getElementById("start").value;
    
    let income = 
        {
            name: name,
            quantity: quantity,
            effective: {
                from : startDate
            },
            constraint: {
                recurrence : frequency
            }
        };

    if(frequency == "Weekly"){
        income.constraint.dayOfWeek = startDate.getDay();
    } else if (frequency == "Monthly"){
        income.constraint.dayOfMonth = startDate.getDate();
    }
    
    postRequestToAddIncome(
        JSON.stringify(income),
        function(success, response){
            console.log(response);
            //provide feedback to user and update table.
        });
}


function validateForm(inputDetails){
    let validated = true;
    inputDetails.forEach((item) => {
        if(item.type == 'String'){
            if(!validateName(item.id)) validated = false;
        } else if(item.type == 'Date'){
            if(!validateDate(item.id)) validated = false;
        } else if(item.type == 'Currency'){
            if(!validateNumber(item.id)) validated = false;
        } else if(item.type == 'Length'){
            if(!validateLength(item.frequencySelectorId, item.lengthInputId)) validated = false;
        }
    });
    return validated;
}

function validateDate(inputId){
    const dateBox = document.getElementById(inputId);
    //test if start date box is empty
    if(!dateBox.value){
        dateBox.classList.add('error');
        dateBox.placeholder = 'Please enter a date'
        return false;
    } else {
        dateBox.classList.remove('error');
        dateBox.placeholder = '';
        return true;
    }
}

function validateName(inputId){
    const textBox = document.getElementById(inputId);
    //test if name text box is empty
    if(!textBox.value){
        textBox.classList.add('error');
        textBox.placeholder = 'Please enter a name'
        return false;
    } else {
        textBox.classList.remove('error');
        textBox.placeholder = 'Item Name';
        return true;
    }
}

function validateNumber(inputId){
    const quantBox = document.getElementById(inputId);
    //validate quantity
    if(!/^\d+$/.test(quantBox.value)){
        quantBox.classList.add('error');
        quantBox.placeholder = 'Please enter number (no symbols/letters)';
        return false;
    } else {
        quantBox.classList.remove('error');
        quantBox.placeholder = 'Quantity...'
        return true;
    }
}

function validateLength(frequencySelectorId, lengthInputId){
    if(document.getElementById(frequencySelectorId).value == "Once Only") return true;

    const lengthBox = document.getElementById(lengthInputId);
    //validate quantity
    if(!/^\d+$/.test(lengthBox.value)){
        lengthBox.classList.add("error");
        lengthBox.placeholder = "Please enter number (no symbols/letters)";
        return false;
    } else {
        lengthBox.classList.remove("error");
        lengthBox.placeholder = "Length..."
        return true;
    }
}

function updateLengthVisibility(frequencySelectorId, lengthContainerId){
    if(document.getElementById(frequencySelectorId).value == "Once Only") {
        $('#' + lengthContainerId).fadeOut();
    } else {
        $('#' + lengthContainerId).fadeIn();
    }
}

//------------------------------------------------------------------------------//
//                                                                              //
//                                   API CALLS                                  //
//                                                                              //
//------------------------------------------------------------------------------//

function getRequestToAPI(suffix, callback){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', apiURL + suffix, true);
    xhr.onload = function(){
        callback(true, JSON.parse(this.responseText));
    } 
    xhr.onerror = function(){
        callback(false, {});
    }
    xhr.send();
}


function postRequestToAddBudget(data, callback){
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    let url =  apiURL + 'budgets';
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function(){
        document.getElementById("loadStatus").innerHTML = "";
        document.getElementById("submitButton").disabled = false;
        document.getElementById("submitButton").innerHTML = "Submit";
        document.getElementById("name").disabled = false;
        document.getElementById("quantity").disabled = false;

        if(xhr.status == 201){
            callback(true, JSON.parse(xhr.response));
            updateBudgetsTable(budgetsTableId)
        } else {
            callback(false, JSON.parse(xhr.response));
            //TODO: provide feedback to user.
        }
    };

    document.getElementById("submitButton").disabled = true;
    document.getElementById("submitButton").innerHTML = "Submitting...";
    document.getElementById("name").disabled = true;
    document.getElementById("quantity").disabled = true;
    document.getElementById("loadStatus").innerHTML= "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>"
    xhr.send(data);
}

function postRequestToAddExpense(data, callback){
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    let url =  apiURL + 'expenses';
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function(){
        document.getElementById("loadStatus").innerHTML = "";
        document.getElementById("submitButton").disabled = false;
        document.getElementById("submitButton").innerHTML = "Submit";
        document.getElementById("name").disabled = false;
        document.getElementById("quantity").disabled = false;
        document.getElementById("category").disabled = false;

        if(xhr.status == 201){
            callback(true, JSON.parse(xhr.response));
            updateExpensesTable(expensesTableId)
        } else {
            callback(false, JSON.parse(xhr.response));
            //TODO: provide feedback to user.
        }
    };

    document.getElementById("submitButton").disabled = true;
    document.getElementById("submitButton").innerHTML = "Submitting...";
    document.getElementById("name").disabled = true;
    document.getElementById("quantity").disabled = true;
    document.getElementById("category").disabled = true;
    document.getElementById("loadStatus").innerHTML= "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>"
    xhr.send(data);
}

function postRequestToAddBudget(data, callback){
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    let url =  apiURL + 'commitments';
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function(){
        document.getElementById("loadStatus").innerHTML = "";
        document.getElementById("submitButton").disabled = false;
        document.getElementById("submitButton").innerHTML = "Submit";
        document.getElementById("name").disabled = false;
        document.getElementById("quantity").disabled = false;
        document.getElementById("frequency").disabled = false;
        document.getElementById("start").disabled = false;
        document.getElementById("length").disabled = false;
        document.getElementById("lengthUnit").disabled = false;

        if(xhr.status == 201){
            callback(true, JSON.parse(xhr.response));
            updateTable()
        } else {
            callback(false, JSON.parse(xhr.response));
            //TODO: provide feedback to user.
        }
    };

    document.getElementById("submitButton").disabled = true;
    document.getElementById("submitButton").innerHTML = "Submitting...";
    document.getElementById("name").disabled = true;
    document.getElementById("quantity").disabled = true;
    document.getElementById("frequency").disabled = true;
    document.getElementById("start").disabled = true;
    document.getElementById("length").disabled = true;
    document.getElementById("lengthUnit").disabled = true;
    document.getElementById("loadStatus").innerHTML= "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>"
    xhr.send(data);
}

function postRequestToAddIncome(data, callback){
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    let url =  apiURL + 'income';
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = function(){
        document.getElementById("loadStatus").innerHTML = "";
        document.getElementById("submitButton").disabled = false;
        document.getElementById("submitButton").innerHTML = "Submit";
        document.getElementById("name").disabled = false;
        document.getElementById("quantity").disabled = false;
        document.getElementById("frequency").disabled = false;
        document.getElementById("start").disabled = false;

        if(xhr.status == 201){
            callback(true, JSON.parse(xhr.response));
            updateTable()
        } else {
            callback(false, JSON.parse(xhr.response));
            //TODO: provide feedback to user.
        }
    };
    
    document.getElementById("submitButton").disabled = true;
    document.getElementById("submitButton").innerHTML = "Submitting...";
    document.getElementById("name").disabled = true;
    document.getElementById("quantity").disabled = true;
    document.getElementById("frequency").disabled = true;
    document.getElementById("start").disabled = true;
    document.getElementById("loadStatus").innerHTML= "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>"
    xhr.send(data);
}


//------------------------------------------------------------------------------//
//                                                                              //
//                                      TABLES                                  //
//                                                                              //
//------------------------------------------------------------------------------//

const budgetsTableId = 'budgetsTableId';
const expensesTableId = 'expensesTableId';

function updateBudgetsTable(budgetItemsTableId, budgets){
    document.getElementById(budgetItemsTableId).innerHTML = "";

    for(let i = 0; i < budgets.length; i++){
        $("#" + budgetItemsTableId).append("<tr>");
        $("#" + budgetItemsTableId).append("<td>" + DELETE_SPAN + budgets[i].name + "</td>");
        $("#" + budgetItemsTableId).append("<td> £" + budgets[i].quantity + "</td>");
        $("#" + budgetItemsTableId).append("</tr>");
    }
    $(".flat-loader").remove();
}

function updateExpensesTableHTML(tableId, expenses){
    document.getElementById(tableId).innerHTML = "";

    total = 0;
    for(let i = 0; i < expenses.length; i++){
        let name = "";
        if(expenses[i].name.length > 20){
            name = expenses[i].name.slice(17) + "...";
        } else {
            name = expenses[i].name;

        }
        $("#expensesTable").append("<tr>");
        $("#expensesTable").append("<td>" + DELETE_SPAN + name + "</td>");

        $("#expensesTable").append("<td>" + expenses[i].category  + "</td>");
        $("#expensesTable").append("<td> £" + expenses[i].quantity + "</td>");
        $("#expensesTable").append("</tr>");
        total += expenses[i].quantity;
    }

    $("#expensesTable").append("<tfoot>");
    $("#expensesTable").append("<tr>");
    $("#expensesTable").append("<td> Total: " + expenses.length  + " entries... </td>");
    $("#expensesTable").append("<td>" + parseFloat(total).toFixed(2)  + "</td>");
    $("#expensesTable").append("</tr>");
    $("#expensesTable").append("</tfoot>");

    $(".flat-loader").remove();

}

function updateCommitmentsTableHTML(tableId, commitments){
    document.getElementById(tableId).innerHTML = "";

    for(let i = 0; i < commitments.length; i++){
        $("#" + tableId).append("<tr>");
        $("#" + tableId).append("<td>" + DELETE_SPAN + commitments[i].name + "</td>");
        $("#" + tableId).append("<td> £" + commitments[i].quantity + "</td>");
        $("#" + tableId).append("</tr>");
    }

    $(".flat-loader").remove();
}

function updateIncomeTableHTML(tableId, incomeStreams){
    document.getElementById(tableId).innerHTML = "";
    
    for(let i = 0; i < incomeStreams.length; i++){
       
        $("#" + tableId).append("<tr>");
        $("#" + tableId).append("<td>" + DELETE_SPAN + incomeStreams[i].name + "</td>");
        $("#" + tableId).append("<td> £" + incomeStreams[i].quantity + "</td>");
        $("#" + tableId).append("</tr>");
    }

    $(".flat-loader").remove();
}

//------------------------------------------------------------------------------//
//                                                                              //
//                                      CHARTS                                  //
//                                                                              //
//------------------------------------------------------------------------------//

function updateFinanceModelChart(financeModelChartContainer, data){
    const myChart = new Chart(financeModelChartContainer, {
        type: 'line',
        data: data,
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

function updateBudgetsChart(budgetsChartContainer, budgets){
    let labels = [];
    let data = [];
    for (let i=0; i<budgets.length; i++){
        labels.push(budgets[i].name);
        data.push(parseFloat(budgets[i].quantity).toFixed(2));
    }

    const myChart = new Chart(budgetsChartContainer,
        {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'monthly budgets',
                    data: data,
                    backgroundColor: colours,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: 'bottom',
                }
            }
        });
}

function updateCommitmentsChart(commitmentsChartContainer, commitments){
    let labels = [];
    let data = [];
    for (let key in commitments){
        labels.push(key);
        data.push(parseFloat(commitments[key]).toFixed(2));
    }

    const chart = new Chart(commitmentsChartContainer, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Current Commitments:',
                data: data,
                backgroundColor: colours,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom',

            }
        }
    });
}

function updateTotalsChart(financeSummaryChartContainer, currencyLabel, io){    
    const myBarChart = new Chart(financeSummaryChartContainer, {
        type: 'horizontalBar',
        data: {
            labels: [
                'Income',
                'Outgoings'
            ],
            datasets: [
                {
                    data: [
                        parseFloat(io.income).toFixed(2),
                        parseFloat(io.outgoings).toFixed(2)
                    ],
                    backgroundColor: ioColours,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItems, data) {
                        return currencyLabel + data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index];
                    }
                }
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 3,
                        minRotation: 0,
                        maxRotation: 0,
                        min: 0,
                        callback: function(value, index, values) {
                            return '£' + value;
                        }
                    },
                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    }
                }]
            }
        }
    });
}

//------------------------------------------------------------------------------//
//                                                                              //
//                                UPDATE METHODS                                //
//                                                                              //
//------------------------------------------------------------------------------//

function updateBudgetItems(budgetPieChartId, budgetItemsTableId) {

    let financeDetails = {};

    let promises = ['budgets'].map(function(suffix) {
        return new Promise(function(resolve, reject) {
            getRequestToAPI(
                suffix, 
                function(success, results) {
                    if(success){
                        financeDetails[suffix] = results;
                        resolve();
                    } else {
                        reject();
                    }
                });
        });
    });

    const budgetsContext2D = document.getElementById(budgetPieChartId);

    Promise.all(promises)
        .then(function() {
            updateBudgetsTable(budgetItemsTableId, financeDetails.budgets);
            updateBudgetsChart(budgetsContext2D, financeDetails.budgets);
        })
        .catch(console.error);
} 

function updateExpensesTable(tableId) {

    let financeDetails = {};

    const now = new Date(Date.now());
    suffix = 'expenses/' + now.getFullYear() + "/" + now.getMonth();

    let promises = [suffix].map(function(suffix) {
        return new Promise(function(resolve, reject) {
            getRequestToAPI(suffix, function(success, results) {
                if(success){
                    financeDetails['expenses'] = results;
                    resolve();
                } else {
                    reject();
                }
            });
        });
    });

    Promise.all(promises)
        .then(function() {
            updateExpensesTableHTML(tableId, financeDetails.expenses);
        })
        .catch(console.error);
} 

function updateCommitmentsTable(tableId) {
    const now = new Date(Date.now());

    let commitmentsSuffix = 'commitments/';
    commitmentsSuffix += now.getUTCFullYear() + '/';
    commitmentsSuffix += now.getUTCMonth();
    let financeDetails = {};
    let promises = [commitmentsSuffix].map(function(suffix) {
        return new Promise(function(resolve, reject) {
            getRequestToAPI(suffix, function(success, results) {
                if(success){
                    financeDetails.commitments = results;
                    resolve();
                } else {
                    reject();
                }
            });
        });
    });

    Promise.all(promises)
        .then(function() {
            updateCommitmentsTableHTML(tableId, financeDetails.commitments);
        })
        .catch(console.error);
} 

function updateIncomeTable(tableId) {
    const date = new Date(Date.now());

    let financeDetails = {};
    let incomeSuffix = 'income/';
    incomeSuffix += date.getUTCFullYear() + '/';
    incomeSuffix += date.getUTCMonth();
    let promises = [incomeSuffix].map(function(suffix) {
        return new Promise(function(resolve, reject) {
            getRequestToAPI(suffix, function(success, results) {
                if(success){
                    financeDetails.income = results;
                    resolve();
                } else {
                    reject();
                }
            });
        });
    });

    Promise.all(promises)
        .then(function() {
            updateIncomeTableHTML(tableId, financeDetails.income);
        })
        .catch(console.error);
} 


