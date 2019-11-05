$(document).ready(updateTable());

function updateTable() {

    let financeDetails = {};

    const now = new Date(Date.now());
    suffix = 'expenses/' + now.getFullYear() + "/" + now.getMonth();
    console.log(suffix);

    let promises = [suffix].map(function(suffix) {
        return new Promise(function(resolve, reject) {
            getRequestToAPI(suffix, function(success, results) {
                if(success){
                    console.log(results);
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
            updateExpensesTable(financeDetails.expenses);
        })
        .catch(console.error);
} 

function validateForm(){
    const quantityValid = validateQuantity();
    const nameValid = validateName();
    const dateValid = validateDate();
    if(!quantityValid || !nameValid || !dateValid){
        return false;
    }
    return true;
}

function validateQuantity(){
    const quantBox = document.getElementById("quantity");
    //validate quantity
    if(!/(\d+(\.\d+){0,1})/.test(document.querySelector("#quantity").value)){
        quantBox.classList.add("error");
        quantBox.placeholder = "Please enter number (no symbols/letters)";
        return false;
    } else {
        quantBox.classList.remove("error");
        quantBox.placeholder = "Quantity..."
        return true;
    }
}

function validateDate(){
    const dateBox = document.getElementById("date");
    //test if start date box is empty
    if(!dateBox.value){
        dateBox.classList.add("error");
        dateBox.placeholder = "Please enter a date"
        return false;
    } else {
        dateBox.classList.remove("error");
        dateBox.placeholder = "";
        return true;
    }
}

function validateName(){
    const textBox = document.getElementById("name");
    //test if name text box is empty
    if(!textBox.value){
        textBox.classList.add("error");
        textBox.placeholder = "Please enter an expense name"
        return false;
    } else {
        textBox.classList.remove("error");
        textBox.placeholder = "Expense Item Name";
        return true;
    }
}

function submit(){
    //validate the inputs
    if(!validateForm()) return;

    let name = document.querySelector("#name").value; 
    let quantity = document.querySelector("#quantity").value;
    let date = document.querySelector('#date').value;
    let description = document.querySelector('#description').value;
    let category = document.querySelector('#category').value;
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
    document.getElementById("category").disabled = true;
    document.getElementById("loadStatus").innerHTML= "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>"
    xhr.send(data);
}

function updateExpensesTable(expenses){
    document.getElementById("summaryTable").innerHTML = "";
    
    total = 0;
    for(let i = 0; i < expenses.length; i++){
        $("#summaryTable").append("<tr>");
        $("#summaryTable").append("<td>" + expenses[i].name + "</td>");
        $("#summaryTable").append("<td>" + expenses[i].category  + "</td>");
        $("#summaryTable").append("<td> £" + expenses[i].quantity + "</td>");
        $("#summaryTable").append("</tr>");
        total += expenses[i].quantity;
    }

    $("#summaryTable").append("<tfoot>");
    $("#summaryTable").append("<tr>");
    $("#summaryTable").append("<td> Total: " + expenses.length  + " entries... </td>");
    $("#summaryTable").append("<td>" + parseFloat(total).toFixed(2)  + "</td>");
    $("#summaryTable").append("</tr>");
    $("#summaryTable").append("</tfoot>");

    $(".flat-loader").remove();

}

