const express = require("express");
const router = express.Router();

// @route GET /finance
// @desc HTML web page with finance summary
// @access Public
// TODO: ALTER THIS TO BRING IN DATA ASYNCHRONOUSLY
router.get("/", (req, res) => {
  res.render("finance/summary");
});

// @route GET /finance/budgets
// @desc HTML web page to allow user to see all of their budgets
// @access Public
// TODO: USER VERIFICATION
router.get("/budgets", (req, res) => {
  res.render("finance/budgets");
});

// @route GET /finance/commitments
// @desc HTML web page to allow user to see all of their commitments
// @access Public
// TODO: USER VERIFICATION
router.get("/commitments", (req, res) => {
  res.render("finance/commitments");
});

// @route GET /finance/expenses
// @desc HTML web page to allow user to see all of their expenses
// @access Public
// TODO: USER VERIFICATION
router.get("/expenses", (req, res) => {
  res.render("finance/expenses");
});

router.get("/income", (req, res) => {
  res.render("finance/income");
});

module.exports = router;
