("use strict");

import { ioColours } from "./FinanceUtil/DefaultPaletteColours.js";

import {
  getDaysInMonth,
  getDateString,
  isSameDate,
  setUTCAndZeroHMS,
} from "./FinanceUtil/DateUtils.js";

import {
  currencySymbol,
  modelLineChartOptions,
  horizontalBarChartOptions,
  defaultPieChartOptions,
  pieChartDefaults,
  extrapolatedLineDefaults,
  realLineDefaults,
  setPointLineDefaults,
} from "./FinanceUtil/ChartJSOptions.js";

const allBudgets = "All budgets";
const now = new Date(Date.now());
now.setUTCMonth(2);

const apiURL = "http://nestedspace.ddns.net:5000/finance/api/";
const DELETE_SPAN = "<span class='delete fa fa-trash'></span>";

let config = null;
let cachedData = null;

//------------------------------------------------------------------------------//
//             Whole Page Updates - to be removed / refactored                  //
//------------------------------------------------------------------------------//

export function updateSummaryPage() {
  const financeSummaryChartContainer = document
    .getElementById("FinanceIOChart")
    .getContext("2d");
  const commitmentsChartContainer = document
    .getElementById("CommitmentSummaryChart")
    .getContext("2d");
  const budgetsContext2D = document
    .getElementById("BudgetSummaryChart")
    .getContext("2d");
  const financeModelChartContainer = document.getElementById(
    "FinanceModelChart"
  );
  let financeDetails = {};

  let promises = ["budgets", "commitments", "expenses", "income"].map(function (
    suffix
  ) {
    return new Promise(function (resolve, reject) {
      const urlSuffix = suffix + "/" + now.getFullYear() + "/" + now.getMonth();
      executeGetRequest(apiURL + urlSuffix, function (success, results) {
        if (success) {
          financeDetails[suffix] = results;
          resolve();
        } else {
          reject();
        }
      });
    });
  });

  Promise.all(promises)
    .then(function () {
      //1. Update Budgets Pie Chart
      const formattedData = formatDataForPieChart(financeDetails.budgets);
      console.log(formattedData);
      updatePieChartCanvas(
        budgetsContext2D,
        createPieChartDataSet(formattedData, pieChartDefaults)
      );

      //2. Update Commitments Pie Chart
      const formattedCommitments = summariseByCategory(
        financeDetails.commitments
      );
      console.log(formattedCommitments);
      updatePieChartCanvas(
        commitmentsChartContainer,
        createPieChartDataSet(formattedCommitments, pieChartDefaults)
      );

      //3. Update Income/Outgoings Bar Chart
      let totals = calculateTotalIncomeAndOutgoings(financeDetails);
      updateTotalsChart(financeSummaryChartContainer, totals);

      //4. Update Finance Model Chart -> !! improve this by creating individual time series relative data, combining and then making absolute
      let relativeModel = createTimeSeriesRelativeData(
        financeDetails,
        new Date(now.getUTCFullYear(), now.getUTCMonth(), 0), //last day of last month,
        new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0) //last day of this month
      );

      const absoluteModel = convertRelativeToAbsolute_Subtractive(
        relativeModel,
        getInitialAccountValue()
      );

      const data = formatMultipleSeriesIntoLineChartData(
        [absoluteModel.predicted, absoluteModel.next, absoluteModel.real], //time series data
        [setPointLineDefaults, extrapolatedLineDefaults, realLineDefaults], //line chart series formats
        absoluteModel.labels
      );
      updateFinanceModelChart(financeModelChartContainer, data);

      //5. Update Insights Section
      updateInsights("insights", absoluteModel, financeDetails, getPayDay());
    })
    .catch(console.error);
}

export function updateExpensesPage() {
  const expensesBreakdownChartContainer = document
    .getElementById("ExpensesBreakdownChart")
    .getContext("2d");
  let financeDetails = {};

  let promises = ["budgets", "expenses"].map(function (suffix) {
    return new Promise(function (resolve, reject) {
      const urlSuffix = suffix + "/" + now.getFullYear() + "/" + now.getMonth();
      executeGetRequest(apiURL + urlSuffix, function (success, results) {
        if (success) {
          financeDetails[suffix] = results;
          resolve();
        } else {
          reject();
        }
      });
    });
  });

  Promise.all(promises)
    .then(function () {
      //1. Update expenses pie chart
      const formattedData = summariseByCategory(financeDetails.expenses);
      updatePieChartCanvas(
        expensesBreakdownChartContainer,
        createPieChartDataSet(formattedData, pieChartDefaults)
      );

      //YUpdate Expenses Line Graph
      updateExpensesGraphBasedOnDropDownSelection(
        "category-select",
        "ExpensesModelChart"
      );

      //3. Update Expenses Tables
      let expensesOrganisedByCategory = splitByKey(
        financeDetails.expenses,
        "category"
      );
      let combinedTableHTML = "";
      if (Object.keys(expensesOrganisedByCategory).length == 0) {
        combinedTableHTML = createSummaryTableHTML(
          "No Items Recorded To Date",
          []
        );
      } else {
        Object.keys(expensesOrganisedByCategory).forEach((key) => {
          const newSection = createSummaryTableHTML(
            key,
            expensesOrganisedByCategory[key]
          );
          combinedTableHTML += newSection;
        });
      }
      document.getElementById("tables-section").innerHTML = combinedTableHTML;

      removePageLoaderIcon();
    })
    .catch(console.error);
}

export function updateExpensesGraphBasedOnDropDownSelection(
  dropdownId,
  chartId
) {
  let financeDetails = {};
  let promises = ["budgets", "expenses"].map(function (suffix) {
    return new Promise(function (resolve, reject) {
      const urlSuffix = suffix + "/" + now.getFullYear() + "/" + now.getMonth();
      executeGetRequest(apiURL + urlSuffix, function (success, results) {
        if (success) {
          financeDetails[suffix] = results;
          resolve();
        } else {
          reject();
        }
      });
    });
  });

  Promise.all(promises).then(function () {
    let selected = document.getElementById(dropdownId).value;

    if (selected != allBudgets) {
      financeDetails.expenses = splitByKey(financeDetails.expenses, "category")[
        selected
      ];
      financeDetails.budgets = getAllItemsWithStatedName(
        financeDetails.budgets,
        selected
      );
    }

    let financeModel = createTimeSeriesRelativeData(
      financeDetails,
      new Date(now.getUTCFullYear(), now.getUTCMonth(), 0), //last day of last month
      new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0) //last day of this month
    );
    const setPoint = getTotalBudget(financeDetails.budgets);
    const formattedModel = createTimeSeriesCumulativeDataYSetPoint(
      financeModel,
      setPoint
    );

    const data = {
      labels: formattedModel.labels,
      datasets: [
        createLineGraphDataSet(formattedModel.setPoint, setPointLineDefaults),
        createLineGraphDataSet(
          formattedModel.predicted,
          extrapolatedLineDefaults
        ),
        createLineGraphDataSet(formattedModel.real, realLineDefaults),
      ],
    };
    const chartContainer = document.getElementById(chartId);
    updateFinanceModelChart(chartContainer, data);
  });
}

export function updateBudgetPage(budgetPieChartId, budgetItemsTableId) {
  let tableName = "Budgets";
  const budgetsContext2D = document.getElementById(budgetPieChartId);
  executeGetRequest(
    generateFinanceAPIURL(tableName, now),
    (success, results) => {
      if (success) {
        const formattedData = formatDataForPieChart(results);
        updatePieChartCanvas(
          budgetsContext2D,
          createPieChartDataSet(formattedData, pieChartDefaults)
        );
      }
      removePageLoaderIcon();
    }
  );

  updateTableFromServer(budgetItemsTableId, tableName);
}

//------------------------------------------------------------------------------//
//                           Direct Table Update Methods                        //
//------------------------------------------------------------------------------//

export function updateTableFromServer(DOMSectionId, financeItemType) {
  executeGetRequest(
    generateFinanceAPIURL(financeItemType, now),
    (success, results) => {
      if (success) {
        let newTable = createSummaryTableHTML(financeItemType, results);
        document.getElementById(DOMSectionId).innerHTML = newTable;
      }
      removePageLoaderIcon();
    }
  );
}

//------------------------------------------------------------------------------//
//                           Direct Chart Update Methods                        //
//------------------------------------------------------------------------------//

function updateFinanceModelChart(financeModelChartContainer, data) {
  const myChart = new Chart(financeModelChartContainer, {
    type: "line",
    data: data,
    options: modelLineChartOptions,
  });
}

function updatePieChartCanvas(commitmentsChartContainer, data) {
  const chart = new Chart(commitmentsChartContainer, {
    type: "pie",
    data: data,
    options: defaultPieChartOptions,
  });
}

//need to generify!
function updateTotalsChart(financeSummaryChartContainer, io) {
  const myBarChart = new Chart(financeSummaryChartContainer, {
    type: "horizontalBar",
    data: {
      labels: ["Income", "Outgoings"],
      datasets: [
        {
          data: [
            parseFloat(io.income).toFixed(2),
            parseFloat(io.outgoings).toFixed(2),
          ],
          backgroundColor: ioColours,
          borderWidth: 1,
        },
      ],
    },
    options: horizontalBarChartOptions,
  });
}

function createChart(targetId, chartType, options) {
  return new Chart(targetId, {
    type: chartType,
    data: {},
    options: options,
  });
}

function removeAllDataFromChart(chart) {
  chart.data.labels.pop();
  chart.data.datasets.forEach((dataset) => {
    dataset.data.pop();
  });
  chart.update();
}

function addDataToChart(chart, label, dataset) {
  chart.data.labels.push(label);
  chart.data.datasets.push(dataset);
  chart.update();
}

function getChartOptions(type) {
  if (type == "pie") {
    return defaultPieChartOptions;
  } else if (type == "line") {
    return modelLineChartOptions;
  } else if (type == "horizontalBar") {
    return horizontalBarChartOptions;
  } else {
    return {};
  }
}

//------------------------------------------------------------------------------//
//                            Prepare Data For Graphs                           //
//------------------------------------------------------------------------------//

function formatDataForPieChart(financeItems) {
  let labels = [];
  let data = [];
  for (let i = 0; i < financeItems.length; i++) {
    labels.push(financeItems[i].name);
    data.push(parseFloat(financeItems[i].quantity).toFixed(2));
  }
  return {
    labels: labels,
    data: data,
  };
}

function formatMultipleSeriesIntoLineChartData(
  timeSeriesData,
  lineFormats,
  labels
) {
  let numberOfPairedSeries = Math.min(
    timeSeriesData.length,
    lineFormats.length
  );

  let datasets = [];
  for (let i = 0; i < numberOfPairedSeries; i++) {
    datasets.push(createLineGraphDataSet(timeSeriesData[i], lineFormats[i]));
  }

  return {
    labels: labels,
    datasets: datasets,
  };
}

function createPieChartDataSet(data, settings) {
  return {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: settings.backgroundColor,
        borderWidth: settings.borderWidth,
      },
    ],
  };
}

function createLineGraphDataSet(data, settings) {
  return {
    data: data,
    label: settings.label,
    borderColor: settings.bdColor,
    borderWidth: settings.bdWidth,
    borderDash: settings.bdDash,
    pointRadius: settings.ptSize,
    backgroundColor: settings.bgColor,
    fill: settings.fillBoolean,
  };
}

function createBarChartDataSet(data, labels, settings) {
  return {
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: settings.colours,
          borderWidth: settings.borderWidth,
        },
      ],
    },
  };
}

//------------------------------------------------------------------------------//
//                  Curate Data Sets Into Consistent Format                     //
//------------------------------------------------------------------------------//

function createTimeSeriesRelativeData(financeDetails, startDate, endDate) {
  if (startDate > endDate) return {};

  let timeSeriesData = {};
  const budgets = financeDetails.budgets || [];
  const commitments = financeDetails.commitments || [];
  const expenses = financeDetails.expenses || [];
  const income = financeDetails.income || [];

  const currentDate = setUTCAndZeroHMS(startDate);
  const lastDateInTimeSeries = setUTCAndZeroHMS(endDate);

  while (currentDate <= lastDateInTimeSeries) {
    timeSeriesData[currentDate] = {};
    timeSeriesData[currentDate].predicted = 0;
    timeSeriesData[currentDate].real = 0;

    const budgetCostForDay = getBudgetCostForDay(currentDate, budgets);
    timeSeriesData[currentDate].predicted =
      timeSeriesData[currentDate].predicted - budgetCostForDay;
    //test whether day is in past or future
    if (currentDate > setUTCAndZeroHMS(now)) {
      timeSeriesData[currentDate].real =
        timeSeriesData[currentDate].real - budgetCostForDay;
    }

    commitments.forEach((item) => {
      if (constraintsFulfilled(item, currentDate)) {
        timeSeriesData[currentDate].real =
          timeSeriesData[currentDate].real - item.quantity;
        timeSeriesData[currentDate].predicted =
          timeSeriesData[currentDate].predicted - item.quantity;
      }
    });

    expenses.forEach((item) => {
      let itemDate = new Date(item.date);
      if (isSameDate(itemDate, currentDate)) {
        timeSeriesData[currentDate].real =
          timeSeriesData[currentDate].real - item.quantity;
      }
    });

    income.forEach((item) => {
      if (constraintsFulfilled(item, currentDate)) {
        timeSeriesData[currentDate].real =
          timeSeriesData[currentDate].real + item.quantity;
        timeSeriesData[currentDate].predicted =
          timeSeriesData[currentDate].predicted + item.quantity;
      }
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return timeSeriesData;
}

function createTimeSeriesCumulativeDataYSetPoint(financeModel, setPointValue) {
  let setPoint = [];
  let real = [];
  let predicted = [];
  let labels = [];
  const now = new Date(Date.now());
  let currentValue = 0;
  Object.keys(financeModel).forEach(function (key) {
    let currentDate = new Date(key);
    setPoint.push(parseFloat(setPointValue).toFixed(2));

    if (isSameDate(currentDate, now)) {
      currentValue -= financeModel[key].real;
      real.push(parseFloat(currentValue).toFixed(2));
      predicted.push(parseFloat(currentValue).toFixed(2));
    } else if (currentDate <= now) {
      currentValue -= financeModel[key].real;
      real.push(parseFloat(currentValue).toFixed(2));
      predicted.push(null);
    } else {
      currentValue -= financeModel[key].predicted;
      predicted.push(parseFloat(currentValue).toFixed(2));
    }
    labels.push(getDateString(new Date(key)));
  });

  let formattedModel = {
    setPoint: setPoint,
    real: real,
    predicted: predicted,
    labels: labels,
  };
  return formattedModel;
}

function convertRelativeToAbsolute_Subtractive(
  relativeTimeSeriesData,
  initialValue
) {
  let predicted = [];
  let real = [];
  let next = [];
  let labels = [];
  const now = new Date(Date.now());

  let currentReal = initialValue;
  let currentPredicted = initialValue;
  Object.keys(relativeTimeSeriesData).forEach(function (key) {
    let currentDate = new Date(key);

    if (
      currentDate.getDate() == now.getDate() &&
      currentDate.getUTCMonth() == now.getUTCMonth()
    ) {
      currentReal += relativeTimeSeriesData[key].real;
      real.push(parseFloat(currentReal).toFixed(2));
      next.push(parseFloat(currentReal).toFixed(2));

      currentPredicted += relativeTimeSeriesData[key].predicted;
      predicted.push(parseFloat(currentPredicted).toFixed(2));
    } else if (currentDate <= now) {
      currentReal += relativeTimeSeriesData[key].real;
      real.push(parseFloat(currentReal).toFixed(2));
      next.push(null);

      currentPredicted += relativeTimeSeriesData[key].predicted;
      predicted.push(parseFloat(currentPredicted).toFixed(2));
    } else {
      currentReal += relativeTimeSeriesData[key].predicted;
      next.push(parseFloat(currentReal).toFixed(2));
    }
    labels.push(getDateString(new Date(key)));
  });

  let formattedModel = {
    predicted: predicted,
    real: real,
    next: next,
    labels: labels,
  };
  return formattedModel;
}

//------------------------------------------------------------------------------//
//                          Data Curation Utility Methods                       //
//------------------------------------------------------------------------------//

function constraintsFulfilled(item, currentDate) {
  //TODO: if the monthly commitment occurs on a date that doesn't exist in this month (i.e 31st in September), take it out early.
  let fulfilled = true;
  let dayOfWeek = ((item || {}).constraint || {}).dayOfWeek;
  if (dayOfWeek != undefined) {
    console.log("day of week constraint currently not handled" + dayOfWeek);
  }

  let dayOfMonth = ((item || {}).constraint || {}).dayOfMonth;
  if (dayOfMonth != undefined) {
    if (dayOfMonth != currentDate.getDate()) {
      fulfilled = false;
    }
  }

  let weekOfMonth = ((item || {}).constraint || {}).weekOfMonth;
  if (weekOfMonth != undefined) {
    console.log("week of month constraint currently not handled" + weekOfMonth);
  }

  let monthOfYear = ((item || {}).constraint || {}).monthOfYear;
  if (monthOfYear != undefined) {
    if (monthOfYear != currentDate.getUTCMonth()) {
      fulfilled = false;
    }
  }

  let recurrence = (item.constraint || {}).recurrence;
  let startDate = new Date((item.effective || {}).from);
  if (recurrence == "Once Only") {
    if (!isSameDate(startDate, currentDate)) {
      fulfilled = false;
    }
  }
  return fulfilled;
}

function getBudgetCostForDay(currentDate, budgets) {
  //TODO: add weighting for budgets
  const monthLength = getDaysInMonth(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth()
  );
  let dailyCost = 0;
  budgets.forEach((item) => {
    dailyCost += item.quantity / monthLength;
  });
  return dailyCost;
}

function getTotalBudget(budgets) {
  let totalBudget = 0;
  budgets.forEach((budget) => {
    totalBudget += budget.quantity;
  });
  return totalBudget;
}

function summariseByCategory(items) {
  let categoryItems = {};
  items.forEach(function (item) {
    if (categoryItems.hasOwnProperty(item.category)) {
      categoryItems[item.category] =
        categoryItems[item.category] + item.quantity;
    } else {
      categoryItems[item.category] = item.quantity;
    }
  });
  const labels = [];
  let data = [];
  Object.keys(categoryItems).forEach(function (key) {
    labels.push(key);
    data.push(categoryItems[key]);
  });
  return {
    labels: labels,
    data: data,
  };
}

function splitByKey(items, key) {
  let splitItems = {};
  items.forEach((item) => {
    if (splitItems.hasOwnProperty(item[key])) {
      splitItems[item[key]].push(item);
    } else {
      splitItems[item[key]] = [];
      splitItems[item[key]].push(item);
    }
  });
  return splitItems;
}

function splitByRecurrence(items) {
  let splitItems = [];
  items.forEach((item) => {
    const recurrence = (item.constraint || {}).recurrence || "None";
    if (splitItems.hasOwnProperty(recurrence)) {
      splitItems[recurrence].push(item);
    } else {
      splitItems[recurrence] = [];
      splitItems[recurrence].push(item);
    }
  });
  return splitItems;
}

function getAllItemsWithStatedName(items, itemName) {
  let selectedItems = [];
  items.forEach((item) => {
    if (item.name == itemName) {
      selectedItems.push(item);
    }
  });
  return selectedItems;
}

function calculateTotalIncomeAndOutgoings(financeDetails) {
  let totalIncome = 0;
  let totalOutgoings = 0;

  const budgets = financeDetails.budgets || [];
  const commitments = financeDetails.commitments || [];
  const income = financeDetails.income || [];

  commitments.forEach((item) => {
    totalOutgoings += item.quantity;
  });

  budgets.forEach((item) => {
    totalOutgoings += item.quantity;
  });

  income.forEach((item) => {
    totalIncome += item.quantity;
  });

  return {
    income: totalIncome,
    outgoings: totalOutgoings,
  };
}

import {
  getBalanceInsight,
  getTotalsInsight,
  createInsight,
} from "./FinanceUtil/InsightUtils.js";

function updateInsights(insightsSectionId, financeDetails, payday) {
  let totals = calculateTotalIncomeAndOutgoings(financeDetails);

  document.getElementById(insightsSectionId).innerHTML =
    "<div class='insight-container'>" +
    createInsight(getBalanceInsight(financeDetails)) +
    createInsight(getTotalsInsight(totals)) +
    "</div>";
}

//------------------------------------------------------------------------------//
//                                   FORMS                                      //
//------------------------------------------------------------------------------//

function submitAddNewBudgetForm() {
  const tableName = "Budgets";
  const budgetsTableId = "tables-section";

  const inputDetails = [
    {
      type: "String",
      id: "name",
    },
    {
      type: "Currency",
      id: "quantity",
    },
  ];
  if (!validateForm(inputDetails)) return;

  let name = document.getElementById("name").value;
  let quantity = document.getElementById("quantity").value;
  postRequestToAddBudget(
    JSON.stringify({
      name: name,
      quantity: quantity,
    }),
    function (success, response) {
      document.getElementById(
        budgetsTableId
      ).innerHTML = createSummaryTableHTML(tableName, []);
      console.log(response);
    }
  );
}

export function submitAddNewExpenseItemForm() {
  const expensesTableId = "expensesTable";

  const inputDetails = [
    {
      type: "String",
      id: "name",
    },
    {
      type: "Currency",
      id: "quantity",
    },
    {
      type: "Date",
      id: "date",
    },
  ];

  if (!validateForm(inputDetails)) return;

  let name = document.getElementById("name").value;
  let quantity = document.getElementById("quantity").value;
  let date = document.getElementById("date").value;
  let description = document.getElementById("description").value;
  let category = document.getElementById("category").value;

  postRequestToAddExpense(
    JSON.stringify({
      name: name,
      quantity: quantity,
      date: date,
      description: description,
      category: category,
    }),

    function (success, response) {
      updateExpensesPage(expensesTableId);
      console.log(response);
    }
  );
}

function submitAddNewCommitment() {
  const inputDetails = [
    {
      type: "String",
      id: "name",
    },
    {
      type: "Currency",
      id: "quantity",
    },
    {
      type: "Date",
      id: "start",
    },
    {
      type: "Length",
      frequencySelectorId: "frequency",
      lengthInputId: "length",
    },
  ];

  if (!validateForm(inputDetails)) return;

  let name = document.getElementById("name").value;
  let category = document.getElementById("category").value;
  let quantity = document.getElementById("quantity").value;
  let frequency = document.getElementById("frequency").value;
  let startDate = new Date(document.getElementById("start").value);
  let length = parseInt(document.getElementById("length").value);
  let lengthUnit = document.getElementById("lengthUnit").value;

  let commitment = {
    name: name,
    quantity: quantity,
    effective: {
      from: startDate,
    },
    category: category,
    constraint: {
      recurrence: frequency,
    },
  };

  if (frequency == "Weekly") {
    commitment.constraint.dayOfWeek = startDate.getDay();
  } else if (frequency == "Monthly") {
    commitment.constraint.dayOfMonth = startDate.getDate();
  }

  if (frequency != "Once Only") {
    let stop = new Date(startDate);
    if (lengthUnit == "Days") {
      stop.setDate(startDate.getDate() + length);
    } else if (lengthUnit == "Weeks") {
      stop.setDate(startDate.getDate() + length * 7);
    } else if (lengthUnit == "Months") {
      stop.setMonth(startDate.getMonth() + length);
    } else if (lengthUnit == "Years") {
      stop.setYear(startDate.getFullYear() + length);
    }
    commitment.effective.stop = stop;
  }

  postRequestToAddCommitment(JSON.stringify(commitment), function (
    success,
    response
  ) {
    console.log(response);
    //provide feedback to user and update table.
  });
}

function submitAddNewIncome() {
  const inputDetails = [
    {
      type: "String",
      id: "name",
    },
    {
      type: "Currency",
      id: "quantity",
    },
    {
      type: "Date",
      id: "start",
    },
  ];

  if (!validateForm(inputDetails)) return;

  let name = document.getElementById("name").value;
  let quantity = document.getElementById("quantity").value;
  let frequency = document.getElementById("frequency").value;
  let startDate = document.getElementById("start").value;

  let income = {
    name: name,
    quantity: quantity,
    effective: {
      from: startDate,
    },
    constraint: {
      recurrence: frequency,
    },
  };

  if (frequency == "Weekly") {
    income.constraint.dayOfWeek = startDate.getDay();
  } else if (frequency == "Monthly") {
    income.constraint.dayOfMonth = startDate.getDate();
  }

  postRequestToAddIncome(JSON.stringify(income), function (success, response) {
    console.log(response);
    //provide feedback to user and update table.
  });
}

import {
  validateName,
  validateDate,
  validateNumber,
  validateLength,
} from "./FinanceUtil/ValidationUtil.js";

function validateForm(inputDetails) {
  let validated = true;
  inputDetails.forEach((item) => {
    if (item.type == "String") {
      if (!validateName(item.id)) validated = false;
    } else if (item.type == "Date") {
      if (!validateDate(item.id)) validated = false;
    } else if (item.type == "Currency") {
      if (!validateNumber(item.id)) validated = false;
    } else if (item.type == "Length") {
      if (!validateLength(item.frequencySelectorId, item.lengthInputId))
        validated = false;
    }
  });
  return validated;
}

//------------------------------------------------------------------------------//
//                                                                              //
//                                   API CALLS                                  //
//                                                                              //
//------------------------------------------------------------------------------//

function postRequestToAddBudget(data, callback) {
  let xhr = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP");
  let url = apiURL + "budgets";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onload = function () {
    document.getElementById("loadStatus").innerHTML = "";
    document.getElementById("submitButton").disabled = false;
    document.getElementById("submitButton").innerHTML = "Submit";
    document.getElementById("name").disabled = false;
    document.getElementById("quantity").disabled = false;

    if (xhr.status == 201) {
      callback(true, JSON.parse(xhr.response));
    } else {
      callback(false, JSON.parse(xhr.response));
      //TODO: provide feedback to user.
    }
  };

  document.getElementById("submitButton").disabled = true;
  document.getElementById("submitButton").innerHTML = "Submitting...";
  document.getElementById("name").disabled = true;
  document.getElementById("quantity").disabled = true;
  document.getElementById("loadStatus").innerHTML =
    "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>";
  xhr.send(data);
}

function postRequestToAddExpense(data, callback) {
  let xhr = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP");
  let url = apiURL + "expenses";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onload = function () {
    document.getElementById("loadStatus").innerHTML = "";
    document.getElementById("submitButton").disabled = false;
    document.getElementById("submitButton").innerHTML = "Submit";
    document.getElementById("name").disabled = false;
    document.getElementById("quantity").disabled = false;
    document.getElementById("category").disabled = false;

    if (xhr.status == 201) {
      callback(true, JSON.parse(xhr.response));
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
  document.getElementById("loadStatus").innerHTML =
    "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>";
  xhr.send(data);
}

function postRequestToAddCommitment(data, callback) {
  let xhr = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP");
  let url = apiURL + "commitments";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onload = function () {
    document.getElementById("loadStatus").innerHTML = "";
    document.getElementById("submitButton").disabled = false;
    document.getElementById("submitButton").innerHTML = "Submit";
    document.getElementById("name").disabled = false;
    document.getElementById("quantity").disabled = false;
    document.getElementById("frequency").disabled = false;
    document.getElementById("start").disabled = false;
    document.getElementById("length").disabled = false;
    document.getElementById("lengthUnit").disabled = false;

    if (xhr.status == 201) {
      callback(true, JSON.parse(xhr.response));
      updateTableFromServer("commitmentsTable", "Commitments");
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
  document.getElementById("loadStatus").innerHTML =
    "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>";
  xhr.send(data);
}

function postRequestToAddIncome(data, callback) {
  let xhr = window.XMLHttpRequest
    ? new XMLHttpRequest()
    : new ActiveXObject("Microsoft.XMLHTTP");
  let url = apiURL + "income";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onload = function () {
    document.getElementById("loadStatus").innerHTML = "";
    document.getElementById("submitButton").disabled = false;
    document.getElementById("submitButton").innerHTML = "Submit";
    document.getElementById("name").disabled = false;
    document.getElementById("quantity").disabled = false;
    document.getElementById("frequency").disabled = false;
    document.getElementById("start").disabled = false;

    if (xhr.status == 201) {
      callback(true, JSON.parse(xhr.response));
      updateTableFromServer("tables-section", "Income");
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
  document.getElementById("loadStatus").innerHTML =
    "<div class='round-flat-loader'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>";
  xhr.send(data);
}

//!! Improve this by calculating initial account value from previously recorded details.
function getInitialAccountValue() {
  return 2281.82;
}

//!! Improve this by getting from server!
function getPayDay() {
  let payday = new Date(Date.now());
  payday.setDate(25);
  return payday;
}

//------------------------------------------------------------------------------//
//                                API Call Utility Methods                      //
//------------------------------------------------------------------------------//

function executeGetRequest(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function () {
    callback(true, JSON.parse(this.responseText));
  };
  xhr.onerror = function () {
    callback(false, {});
  };
  xhr.send();
}

function generateFinanceAPIURL(itemType, date) {
  if (!date) {
    return apiURL + itemType;
  } else {
    return (
      apiURL + itemType + "/" + date.getUTCFullYear() + "/" + date.getUTCMonth()
    );
  }
}

//------------------------------------------------------------------------------//
//                      HTML TABLE Utility Methods                              //
//------------------------------------------------------------------------------//

function createSummaryTableHTML(tableTitle, financeItems) {
  let body = "";
  let totalQuantity = 0;
  for (let i = 0; i < financeItems.length; i++) {
    body += createSummaryTableRowHTML(financeItems[i]);
    totalQuantity += financeItems[i].quantity;
  }

  let header =
    "<thead><tr><th>" +
    tableTitle +
    "</th>" +
    "<th class='money-column'>" +
    currencySymbol +
    parseFloat(totalQuantity).toFixed(2) +
    "</th>" +
    "</tr></thead>";

  return "<table>" + header + body + "</table>";
}

function createSummaryTableRowHTML(financeItem) {
  let html = "<tr>";

  html += "<td>" + DELETE_SPAN;

  if (financeItem.name.length > 20) {
    html += financeItem.name.slice(0, 17) + "...";
  } else {
    html += financeItem.name;
  }

  html += "</td>";
  html +=
    "<td class='money-column'>" +
    currencySymbol +
    parseFloat(financeItem.quantity).toFixed(2) +
    "</tr>";
  return html;
}

export function setOneHeaderLinkActive_DeactivateOthers(linkId) {
  document.getElementById("modelLink").classList.remove("active");
  document.getElementById("budgetsLink").classList.remove("active");
  document.getElementById("expensesLink").classList.remove("active");
  document.getElementById("incomeLink").classList.remove("active");
  document.getElementById("commitmentsLink").classList.remove("active");
  document.getElementById(linkId).classList.add("active");
}

function removePageLoaderIcon() {
  $(".flat-loader").remove();
}
