const Template = require("../models/Template");

/* ==========================
   CREATE TEMPLATE
========================== */

exports.createTemplate = async (req, res) => {

    try {

        const template =
        await Template.create(req.body);

        res.status(201).json(template);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

/* ==========================
   GET TEMPLATES
========================== */

exports.getTemplates = async (req, res) => {

    try {

        const templates =
        await Template.find();

        res.json(templates);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

/* ==========================
   UPDATE TEMPLATE
========================== */

exports.updateTemplate = async (req, res) => {

    try {

        const template =
        await Template.findByIdAndUpdate(

            req.params.id,

            req.body,

            { new: true }

        );

        res.json(template);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

/* ==========================
   DELETE TEMPLATE
========================== */

exports.deleteTemplate = async (req, res) => {

    try {

        await Template.findByIdAndDelete(
            req.params.id
        );

        res.json({
            success: true
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};