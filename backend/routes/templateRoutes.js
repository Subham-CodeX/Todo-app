const express = require("express");

const router = express.Router();

const {

    getTemplates,

    deleteTemplate,

    updateTemplate,

    useTemplate,

} = require("../controllers/taskController");

router.get("/", getTemplates);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

router.post("/:id/use", useTemplate);

module.exports = router;