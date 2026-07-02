const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: String,

    category: String,

    priority: String

},{
    timestamps:true
});

module.exports =
mongoose.model(
    "Template",
    TemplateSchema
);