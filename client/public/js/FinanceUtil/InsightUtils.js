export function getBalanceInsight(model) {
  let compareToBudget = parseFloat(
    model.real[model.real.length - 1] - model.predicted[model.real.length - 1]
  ).toFixed(2);
  let comparePhrase = "";
  let compareStyle = "";
  if (compareToBudget > 0) {
    comparePhrase = "Money saved compared to budget";
    compareStyle = goodHighlight;
  } else {
    comparePhrase = "Money spent over budget";
    compareToBudget = parseFloat(-compareToBudget).toFixed(2);
    compareStyle = badHighlight;
  }

  let lowest = model.real[0];
  for (let i = 0; i < model.real.length; i++) {
    const real = parseFloat(model.real[i]);
    if (lowest > model.real[i]) {
      lowest = real;
    }
  }

  let lowestStyle;
  if (lowest > 0) {
    lowestStyle = goodHighlight;
  } else {
    lowestStyle = badHighlight;
  }

  const balanceInsight = {
    icon: "fa-temperature-low",
    contents: [
      {
        text: "Month's lowest balance",
        value: lowest,
        style: lowestStyle,
      },
      {
        text: comparePhrase,
        value: compareToBudget,
        style: compareStyle,
      },
    ],
  };

  return balanceInsight;
}

export function getSpendsInsight(model) {
  const spendsInsight = {
    icon: "fa-running",
    contents: [
      {
        text: "Spent this month",
        value: parseFloat(
          model.real[0] - model.real[model.real.length - 1]
        ).toFixed(2),
        style: neutralHighlight,
      },
    ],
  };
  return spendsInsight;
}

export function getTotalsInsight(totals) {
  const totalsInsight = {
    icon: "fa-dollar-sign",
    contents: [
      {
        text: "Income",
        value: totals.income,
        style: goodHighlight,
      },
      {
        text: "Outgoings",
        value: totals.outgoings,
        style: neutralHighlight,
      },
    ],
  };
  return totalsInsight;
}

import { currencySymbol } from "./ChartJSOptions.js";

const goodHighlight = "bg-success white";
const badHighlight = "bg-danger white";
const neutralHighlight = "bg-lowlight white";

export function createInsight(insights) {
  let insightHTML = "";
  insightHTML += "<div class='insight'>";
  insightHTML += "<span class='fas " + insights.icon + " title'></span>";

  insights.contents.forEach((insight) => {
    insightHTML += "<div>";
    insightHTML += "<span class='insight-desc' >" + insight.text + "</span>";
    insightHTML +=
      "<span class='insight-amount " +
      insight.style +
      "'>" +
      currencySymbol +
      insight.value +
      "</span>";
    insightHTML += "</div>";
  });

  insightHTML += "</div>";
  return insightHTML;
}
