const mongoose = require("mongoose");

// Model for FullQuote
const FullQuote = new mongoose.Schema({
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
module.exports = mongoose.model("FullQuote", FullQuote);
