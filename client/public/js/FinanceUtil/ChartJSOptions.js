import { colours } from "./DefaultPaletteColours.js";

/* *********************************************************************** */
/*                              CHART js OPTIONS                           */
/* *********************************************************************** */

const tickMarkCurrencyCallback = function (value, index, values) {
  let modifier = "";
  let divisor = 1;
  if (value >= 1000) {
    modifier = "K";
    divisor = 1000;
  }
  return currencySymbol + parseFloat(value / divisor).toFixed(0) + modifier;
};

const chartLabelCurrencyCallback = {
  label: function (tooltipItems, data) {
    return (
      data.labels[tooltipItems.index] +
      " " +
      currencySymbol +
      data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index]
    );
  },
};

export const currencySymbol = "£";

export const modelLineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  elements: {
    line: {
      tension: 0, // disables bezier curves
    },
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          display: true,
          color: "#DDDDDD",
        },
        ticks: {
          maxTicksLimit: 5,
          minRotation: 0,
          maxRotation: 0,
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 5,
          callback: tickMarkCurrencyCallback,
        },
      },
    ],
  },
  tooltips: {
    callbacks: chartLabelCurrencyCallback,
  },
};

export const horizontalBarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  tooltips: {
    callbacks: {
      label: function (tooltipItems, data) {
        return (
          currencySymbol +
          data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index]
        );
      },
    },
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 4,
          minRotation: 0,
          maxRotation: 0,
          min: 0,
          callback: tickMarkCurrencyCallback,
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
      },
    ],
  },
};

export const defaultPieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    position: "bottom",
  },
  tooltips: {
    callbacks: chartLabelCurrencyCallback,
  },
};

/* *********************************************************************** */
/*                              CHART js DEFAULTS                          */
/* *********************************************************************** */

export const pieChartDefaults = {
  label: "",
  backgroundColor: colours,
  borderWidth: 0,
};

export const setPointLineDefaults = {
  label: "Set Point",
  ptSize: 0,
  bdColor: colours[1],
  bdWidth: 2,
  bdDash: [10, 10],
  bgColor: colours[2],
  fillBoolean: false,
};

export const extrapolatedLineDefaults = {
  label: "Predicted",
  ptSize: 0,
  bdColor: colours[4],
  bdWidth: 2,
  bdDash: [10, 10],
  bgColor: colours[3],
  fillBoolean: false,
};

export const realLineDefaults = {
  label: "Real",
  ptSize: 0,
  bdColor: colours[4],
  bdWidth: 2,
  bdDash: [0, 0],
  bgColor: colours[0],
  fillBoolean: true,
};
