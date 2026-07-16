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

const TemplateContext = createContext();

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
        console.error(
          "Error loading templates:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadTemplates();
  }, []);

  // ==========================
  // ADD TEMPLATE (NEW)
  // ==========================

  const addTemplate = (template) => {
    if (!template) return;

    setTemplates((prev) => [
      template,
      ...prev,
    ]);
  };

  // ==========================
  // DELETE TEMPLATE
  // ==========================

  const removeTemplate =
    async (id) => {
      try {
        await deleteTemplate(id);

        setTemplates((prev) =>
          prev.filter(
            (t) => t._id !== id
          )
        );
      } catch (error) {
        console.error(
          "Error deleting template:",
          error
        );
        throw error;
      }
    };

  // ==========================
  // UPDATE TEMPLATE
  // ==========================

  const editTemplate =
    async (id, data) => {
      try {
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

        return updated;
      } catch (error) {
        console.error(
          "Error updating template:",
          error
        );
        throw error;
      }
    };

  // ==========================
  // USE TEMPLATE
  // ==========================

  const createFromTemplate =
    async (id, date) => {
      try {
        return await useTemplate(
          id,
          date
        );
      } catch (error) {
        console.error(
          "Error creating task from template:",
          error
        );
        throw error;
      }
    };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        loading,

        // actions
        loadTemplates,
        addTemplate,
        removeTemplate,
        editTemplate,
        createFromTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};