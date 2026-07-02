import axios from "axios";

const API = axios.create({

    baseURL:
    import.meta.env.VITE_API_URL

});

/* ==========================
   TASK API
========================== */

// Get All Tasks
export const getTasks =
async () => {

    try {

        const response =
        await API.get("/tasks");

        return response.data;

    }
    catch(error){

        console.error(
            "Get Tasks Error:",
            error
        );

        return [];

    }

};

// Create Task
export const createTask =
async (taskData) => {

    try {

        const response =
        await API.post(
            "/tasks",
            taskData
        );

        return response.data;

    }
    catch(error){

        console.error(
            "Create Task Error:",
            error
        );

        throw error;

    }

};

// Update Task
export const updateTask =
async (
    taskId,
    updatedData
) => {

    try {

        const response =
        await API.put(

            `/tasks/${taskId}`,

            updatedData

        );

        return response.data;

    }
    catch(error){

        console.error(
            "Update Task Error:",
            error
        );

        throw error;

    }

};

// Delete Task
export const deleteTask =
async (taskId) => {

    try {

        const response =
        await API.delete(

            `/tasks/${taskId}`

        );

        return response.data;

    }
    catch(error){

        console.error(
            "Delete Task Error:",
            error
        );

        throw error;

    }

};

// Toggle Complete
export const toggleTaskComplete =
async (
    taskId,
    completed
) => {

    try {

        const response =
        await API.put(

            `/tasks/${taskId}`,

            {
                completed
            }

        );

        return response.data;

    }
    catch(error){

        console.error(
            "Toggle Complete Error:",
            error
        );

        throw error;

    }

};

/* ==========================
   TEMPLATE API
========================== */

// Get Templates
export const getTemplates =
async () => {

    try {

        const response =
        await API.get(
            "/templates"
        );

        return response.data;

    }
    catch(error){

        console.error(
            "Get Templates Error:",
            error
        );

        return [];

    }

};

// Create Template
export const createTemplate =
async (
    templateData
) => {

    try {

        const response =
        await API.post(

            "/templates",

            templateData

        );

        return response.data;

    }
    catch(error){

        console.error(
            "Create Template Error:",
            error
        );

        throw error;

    }

};

// Delete Template
export const deleteTemplate =
async (
    templateId
) => {

    try {

        const response =
        await API.delete(

            `/templates/${templateId}`

        );

        return response.data;

    }
    catch(error){

        console.error(
            "Delete Template Error:",
            error
        );

        throw error;

    }

};

export default API;