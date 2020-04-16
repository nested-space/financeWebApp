export function validateDate(inputId) {
  const dateBox = document.getElementById(inputId);
  //test if start date box is empty
  if (!dateBox.value) {
    dateBox.classList.add("error");
    dateBox.placeholder = "Please enter a date";
    return false;
  } else {
    dateBox.classList.remove("error");
    dateBox.placeholder = "";
    return true;
  }
}

export function validateName(inputId) {
  const textBox = document.getElementById(inputId);
  //test if name text box is empty
  if (!textBox.value) {
    textBox.classList.add("error");
    textBox.placeholder = "Please enter a name";
    return false;
  } else {
    textBox.classList.remove("error");
    textBox.placeholder = "Item Name";
    return true;
  }
}

export function validateNumber(inputId) {
  const quantBox = document.getElementById(inputId);
  //validate quantity
  if (!/^(?!0\.00)\d{1,}(\.\d\d)?$/.test(quantBox.value)) {
    quantBox.classList.add("error");
    quantBox.placeholder = "Please enter number (no symbols/letters)";
    return false;
  } else {
    quantBox.classList.remove("error");
    quantBox.placeholder = "Quantity...";
    return true;
  }
}

export function validateLength(frequencySelectorId, lengthInputId) {
  if (document.getElementById(frequencySelectorId).value == "Once Only")
    return true;

  const lengthBox = document.getElementById(lengthInputId);
  //validate quantity
  if (!/^\d+$/.test(lengthBox.value)) {
    lengthBox.classList.add("error");
    lengthBox.placeholder = "Please enter number (no symbols/letters)";
    return false;
  } else {
    lengthBox.classList.remove("error");
    lengthBox.placeholder = "Length...";
    return true;
  }
}

export function updateLengthVisibility(frequencySelectorId, lengthContainerId) {
  if (document.getElementById(frequencySelectorId).value == "Once Only") {
    $("#" + lengthContainerId).fadeOut();
  } else {
    $("#" + lengthContainerId).fadeIn();
  }
}
