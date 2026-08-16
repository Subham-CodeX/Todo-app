import API from "./api";

// ==========================
// GET NOTES
// ==========================

export const getNotes =
  async () => {
    const response =
      await API.get(
        "/notes"
      );

    return response.data;
  };

// ==========================
// CREATE NOTE
// ==========================

export const createNote =
  async (note) => {
    const response =
      await API.post(
        "/notes",
        note
      );

    return response.data;
  };

// ==========================
// UPDATE NOTE
// ==========================

export const updateNote =
  async (
    id,
    note
  ) => {
    const response =
      await API.put(
        `/notes/${id}`,
        note
      );

    return response.data;
  };

// ==========================
// DELETE NOTE
// ==========================

export const deleteNote =
  async (id) => {
    await API.delete(
      `/notes/${id}`
    );
  };