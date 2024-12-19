const mongoose = require('mongoose');

const Policy = new mongoose.Schema({
    CarrierQuoteNumber:{
        type: String,
        required: true
    },
    ProposalNo: {
        type: String,
        required: true
    },
    data:{
        type:Object,
        required:true
    }
});
module.exports = mongoose.model("Policy", Policy);
