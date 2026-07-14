const mongoose = require("mongoose");
const Task = require("../models/Task");

/* ===========================
   CREATE TASK
=========================== */

exports.createTask = async (req, res) => {
    try {

        const task = await Task.create(req.body);

        res.status(201).json(task);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

/* ===========================
   GET ALL TASKS
=========================== */

exports.getTasks = async (req, res) => {
    try {

        const tasks = await Task.find().sort({
            createdAt: -1,
        });

        res.status(200).json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

/* ===========================
   UPDATE TASK
=========================== */

exports.updateTask = async (req, res) => {
    try {

        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Task ID",
            });
        }

        const task = await Task.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        res.status(200).json(task);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

/* ===========================
   DELETE TASK
=========================== */

exports.deleteTask = async (req, res) => {
    try {

        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Task ID",
            });
        }

        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

/* ===========================
   GET ALL TEMPLATES
=========================== */

exports.getTemplates = async (req, res) => {
    try {

        const templates = await Task.find({
            isTemplate: true,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json(templates);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

/* ===========================
   DELETE TEMPLATE
=========================== */

exports.deleteTemplate = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Template ID",
            });
        }

        const template = await Task.findOneAndDelete({
            _id: id,
            isTemplate: true,
        });

        if (!template) {
            return res.status(404).json({
                message: "Template not found",
            });
        }

        res.json({
            success: true,
            message: "Template deleted",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

/* ===========================
   UPDATE TEMPLATE
=========================== */

exports.updateTemplate = async (req, res) => {
    try {

        const { id } = req.params;

        const template = await Task.findOneAndUpdate(
            {
                _id: id,
                isTemplate: true,
            },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!template) {
            return res.status(404).json({
                message: "Template not found",
            });
        }

        res.json(template);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

/* ===========================
   USE TEMPLATE
=========================== */

exports.useTemplate = async (req, res) => {

    try {

        const { id } = req.params;

        const template = await Task.findOne({
            _id: id,
            isTemplate: true,
        });

        if (!template) {
            return res.status(404).json({
                message: "Template not found",
            });
        }

        const task = await Task.create({

            title: template.title,

            description: template.description,

            category: template.category,

            priority: template.priority,

            startTime: template.startTime,

            endTime: template.endTime,

            date: req.body.date,

            completed: false,

            isTemplate: false,

        });

        res.status(201).json(task);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};