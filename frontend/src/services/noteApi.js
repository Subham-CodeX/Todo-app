import axios from "axios";

const API = import.meta.env.VITE_API_URL + "/api/notes";

/* GET */

export const getNotes = async () => {

    const res = await axios.get(API);

    return res.data;

};

/* CREATE */

export const createNote = async (note) => {

    const res = await axios.post(API, note);

    return res.data;

};

/* UPDATE */

export const updateNote = async (
    id,
    note
) => {

    const res = await axios.put(
        `${API}/${id}`,
        note
    );

    return res.data;

};

/* DELETE */

export const deleteNote = async (id) => {

    await axios.delete(`${API}/${id}`);

};