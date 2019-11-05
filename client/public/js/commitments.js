$(document).ready(updateTable());

function updateTable() {
    let financeDetails = {};
    let promises = ['commitments'].map(function(suffix) {
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
            updateCommitmentsTable(financeDetails.commitments);
        })
        .catch(console.error);
} 

function validateForm(){
    const nameValid = validateName();
    const quantityValid = validateQuantity();
    const startDateValid = validateStart();
    const lengthValid = validateLength();

    if(!quantityValid || !nameValid  || !startDateValid || !lengthValid){
        return false;
    }
    return true;
}

function validateName(){
    const textBox = document.getElementById("name");
    //test if name text box is empty
    if(!textBox.value){
        textBox.classList.add("error");
        textBox.placeholder = "Please enter a name"
        return false;
    } else {
        textBox.classList.remove("error");
        textBox.placeholder = "Budget Item Name";
        return true;
    }
}

function validateQuantity(){
    const quantBox = document.getElementById("quantity");
    //validate quantity
    if(!/^\d+$/.test(document.getElementById("quantity").value)){
        quantBox.classList.add("error");
        quantBox.placeholder = "Please enter number (no symbols/letters)";
        return false;
    } else {
        quantBox.classList.remove("error");
        quantBox.placeholder = "Quantity..."
        return true;
    }
}

function validateStart(){
    const dateBox = document.getElementById("start");
    //test if start date box is empty
    if(!dateBox.value){
        dateBox.classList.add("error");
        dateBox.placeholder = "Please enter a budget name"
        return false;
    } else {
        dateBox.classList.remove("error");
        dateBox.placeholder = "Budget Item Name";
        return true;
    }
}

function validateLength(){
    const lengthBox = document.getElementById("length");
    //validate quantity
    if(!/^\d+$/.test(document.getElementById("length").value)){
        lengthBox.classList.add("error");
        lengthBox.placeholder = "Please enter number (no symbols/letters)";
        return false;
    } else {
        lengthBox.classList.remove("error");
        lengthBox.placeholder = "Length..."
        return true;
    }
}

function submit(){
    //validate the inputs
    if(!validateForm()) return;

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


    console.log(commitment);
    return;

    postRequestToAddBudget(
        JSON.stringify(),
        function(success, response){
            console.log(response);
            //provide feedback to user and update table.
        });
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

function updateCommitmentsTable(commitments){
    document.getElementById("summaryTable").innerHTML = "";
    
    for(let i = 0; i < commitments.length; i++){
        $("#summaryTable").append("<tr>");
        $("#summaryTable").append("<td>" + commitments[i].name + "</td>");
        $("#summaryTable").append("<td> £" + commitments[i].quantity + "</td>");
        $("#summaryTable").append("</tr>");
    }

    $(".flat-loader").remove();
}

