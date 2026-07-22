import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// ==========================
// GET ALL TEMPLATES
// ==========================

export const getTemplates =
  async () => {
    const response =
      await API.get("/templates");

    return response.data;
  };

// ==========================
// CREATE TEMPLATE
// ==========================

export const createTemplate =
  async (templateData) => {

    const response =
      await API.post(
        "/templates",
        templateData
      );

    return response.data;
  };

// ==========================
// UPDATE TEMPLATE
// ==========================

export const updateTemplate =
  async (id, data) => {

    const response =
      await API.put(
        `/templates/${id}`,
        data
      );

    return response.data;
  };

// ==========================
// DELETE TEMPLATE
// ==========================

export const deleteTemplate =
  async (id) => {

    const response =
      await API.delete(
        `/templates/${id}`
      );

    return response.data;
  };

// ==========================
// USE TEMPLATE
// ==========================

export const useTemplate =
  async (id, date) => {

    const response =
      await API.post(
        `/templates/${id}/use`,
        {
          date,
        }
      );

    return response.data;
  };