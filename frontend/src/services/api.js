import axios from "axios";

const API = axios.create({
  baseURL:
    `${import.meta.env.VITE_API_URL}/api`,
});

// =================================
// REQUEST INTERCEPTOR
// =================================

API.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "taskflowToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =================================
// RESPONSE INTERCEPTOR
// =================================

API.interceptors.response.use(
  (response) => response,

  (error) => {

    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "taskflowToken"
      );
    }

    return Promise.reject(error);
  }
);

// =================================
// TASK API
// =================================

export const getTasks =
  async () => {

    const response =
      await API.get("/tasks");

    return response.data;
  };

export const createTask =
  async (taskData) => {

    const response =
      await API.post(
        "/tasks",
        taskData
      );

    return response.data;
  };

export const updateTask =
  async (
    taskId,
    updatedData
  ) => {

    const response =
      await API.put(
        `/tasks/${taskId}`,
        updatedData
      );

    return response.data;
  };

export const deleteTask =
  async (taskId) => {

    const response =
      await API.delete(
        `/tasks/${taskId}`
      );

    return response.data;
  };

export const toggleTaskComplete =
  async (
    taskId,
    completed
  ) => {

    const response =
      await API.put(
        `/tasks/${taskId}`,
        {
          completed,
        }
      );

    return response.data;
  };

export default API;