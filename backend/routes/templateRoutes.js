const express = require("express");

const router = express.Router();

const {
    createTemplate,
    getTemplates,
    deleteTemplate,
    updateTemplate
} = require("../controllers/templateController");

/* ==========================
   GET ALL TEMPLATES
========================== */

router.get("/", getTemplates);

/* ==========================
   CREATE TEMPLATE
========================== */

router.post("/", createTemplate);

/* ==========================
   UPDATE TEMPLATE
========================== */

router.put("/:id", updateTemplate);

/* ==========================
   DELETE TEMPLATE
========================== */

router.delete("/:id", deleteTemplate);

module.exports = router;