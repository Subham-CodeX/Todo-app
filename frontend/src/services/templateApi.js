import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// ==========================
// GET ALL TEMPLATES
// ==========================

export const getTemplates = async () => {
  console.log("API Base URL:", API.defaults.baseURL);

  const response = await API.get("/templates");

  console.log("Templates Response:", response.data);

  return response.data;
};

// ==========================
// UPDATE TEMPLATE
// ==========================

export const updateTemplate = async (id, data) => {
  const response = await API.put(
    `/templates/${id}`,
    data
  );

  return response.data;
};

// ==========================
// DELETE TEMPLATE
// ==========================

export const deleteTemplate = async (id) => {
  const response = await API.delete(
    `/templates/${id}`
  );

  return response.data;
};

// ==========================
// USE TEMPLATE
// ==========================

export const useTemplate = async (
  id,
  date
) => {
  const response = await API.post(
    `/templates/${id}/use`,
    {
      date,
    }
  );

  return response.data;
};