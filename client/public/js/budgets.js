$(document).ready(updateTable());

function updateTable() {

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

    Promise.all(promises)
        .then(function() {
            updateBudgetsTable(financeDetails.budgets);
        })
        .catch(console.error);
} 

function validateForm(){
    const quantityValid = validateQuantity();
    const nameValid = validateName();
    if(!quantityValid || !nameValid){
        return false;
    }
    return true;
}

function validateQuantity(){
    const quantBox = document.getElementById("quantity");
    //validate quantity
    if(!/^\d+$/.test(document.querySelector("#quantity").value)){
        quantBox.classList.add("error");
        quantBox.placeholder = "Please enter number (no symbols/letters)";
        return false;
    } else {
        quantBox.classList.remove("error");
        quantBox.placeholder = "Quantity..."
        return true;
    }
}

function validateName(){
    const textBox = document.getElementById("name");
    //test if name text box is empty
    if(!textBox.value){
        textBox.classList.add("error");
        textBox.placeholder = "Please enter a budget name"
        return false;
    } else {
        textBox.classList.remove("error");
        textBox.placeholder = "Budget Item Name";
        return true;
    }
}

function submit(){
    //validate the inputs
    if(!validateForm()) return;

    let name = document.querySelector("#name").value; 
    let quantity = document.querySelector("#quantity").value;
    postRequestToAddBudget(
        JSON.stringify({
            name: name,
            quantity: quantity
        }),
        function(success, response){
            console.log(response);
        });
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
    document.getElementById("loadStatus").innerHTML= "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>"
    xhr.send(data);
}

function updateBudgetsTable(budgets){
    document.getElementById("summaryTable").innerHTML = "";
    
    for(let i = 0; i < budgets.length; i++){
        $("#summaryTable").append("<tr>");
        $("#summaryTable").append("<td>" + budgets[i].name + "</td>");
        $("#summaryTable").append("<td> £" + budgets[i].quantity + "</td>");
        $("#summaryTable").append("</tr>");
    }
    $(".flat-loader").remove();
}


