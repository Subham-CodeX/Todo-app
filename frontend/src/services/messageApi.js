import API
  from "./api";


// =====================================
// GET CHAT HISTORY
// =====================================

export const getChatMessages =
  async (
    userId
  ) => {

    const response =
      await API.get(

        `/messages/${userId}`

      );


    return response.data;

  };