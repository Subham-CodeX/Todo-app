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