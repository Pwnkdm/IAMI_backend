const mongoose = require("mongoose");

const IssueQuote = new mongoose.Schema({
  CarrierQuoteNumber: {
    type: String,
    required: true,
  },
  ProposalNo: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});
module.exports = mongoose.model("IssueQuote", IssueQuote);
