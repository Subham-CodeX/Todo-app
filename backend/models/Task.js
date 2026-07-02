const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({

    title: {
    type: String,
    required: true,
    trim: true
},

    description: String,

    category: String,

    priority: String,

    date: String,

    startTime: String,

    endTime: String,

    completed: {
        type: Boolean,
        default: false
    },

    isTemplate: {
        type: Boolean,
        default: false
    }

},{
    timestamps:true
});

module.exports =
mongoose.model("Task",TaskSchema);