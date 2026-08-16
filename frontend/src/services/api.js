import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// =================================
// REQUEST INTERCEPTOR
// =================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
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

// Get Tasks
export const getTasks = async () => {
  const response =
    await API.get("/tasks");

  return response.data;
};

// Create Task
export const createTask = async (
  taskData
) => {
  const response =
    await API.post(
      "/tasks",
      taskData
    );

  return response.data;
};

// Update Task
export const updateTask = async (
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

// Delete Task
export const deleteTask = async (
  taskId
) => {
  const response =
    await API.delete(
      `/tasks/${taskId}`
    );

  return response.data;
};

// Toggle Complete
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

// =================================
// PROFILE API
// =================================

// Get User Profile
export const getProfile =
  async () => {

    const response =
      await API.get(
        "/users/profile"
      );

    return response.data;
  };

// Update User Profile
export const updateProfile =
  async (profileData) => {

    const response =
      await API.put(
        "/users/profile",
        profileData
      );

    return response.data;
  };

// Change Password
export const changePassword =
  async (
    currentPassword,
    newPassword
  ) => {

    const response =
      await API.put(
        "/users/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

    return response.data;
  };

// =================================
// PROFILE IMAGE UPLOAD
// =================================

export const uploadProfileImage =
  async (file) => {

    const formData =
      new FormData();

    formData.append(
      "profileImage",
      file
    );

    const response =
      await API.post(
        "/users/profile/image",
        formData
      );

    return response.data;
  };

// =================================
// EXPORT
// =================================

export default API;