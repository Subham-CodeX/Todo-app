import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getTemplates,
  deleteTemplate,
  updateTemplate,
  useTemplate,
} from "../services/templateApi";

const TemplateContext =
  createContext();

export const useTemplates = () =>
  useContext(TemplateContext);

export const TemplateProvider = ({
  children,
}) => {
  const [templates, setTemplates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ==========================
  // LOAD TEMPLATES
  // ==========================

  const loadTemplates =
    async () => {
      try {

        setLoading(true);

        const data =
          await getTemplates();

        setTemplates(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };

  useEffect(() => {
    loadTemplates();
  }, []);

  // ==========================
  // DELETE
  // ==========================

  const removeTemplate =
    async (id) => {

      await deleteTemplate(id);

      setTemplates((prev) =>
        prev.filter(
          (t) => t._id !== id
        )
      );

    };

  // ==========================
  // UPDATE
  // ==========================

  const editTemplate =
    async (id, data) => {

      const updated =
        await updateTemplate(
          id,
          data
        );

      setTemplates((prev) =>
        prev.map((t) =>
          t._id === id
            ? updated
            : t
        )
      );

    };

  // ==========================
  // USE TEMPLATE
  // ==========================

  const createFromTemplate =
    async (id, date) => {

      return await useTemplate(
        id,
        date
      );

    };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        loading,
        loadTemplates,
        removeTemplate,
        editTemplate,
        createFromTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};