import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
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

  const loadTemplates =
    async () => {

      try {

        setLoading(true);

        const data =
          await getTemplates();

        setTemplates(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Load Templates Error:",
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
  // CREATE TEMPLATE
  // ==========================

  const addTemplate =
    async (taskData) => {

      try {

        const template =
          await createTemplate({

            title: taskData.title,

            description:
              taskData.description,

            category:
              taskData.category,

            priority:
              taskData.priority,

            date:
              taskData.date,

            startTime:
              taskData.startTime,

            endTime:
              taskData.endTime,

          });

        setTemplates((prev) => [

          template,

          ...prev,

        ]);

        return template;

      } catch (error) {

        console.error(
          "Create Template Error:",
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

          prev.map((template) =>

            template._id === id

              ? updated

              : template

          )

        );

        return updated;

      } catch (error) {

        console.error(
          "Update Template Error:",
          error
        );

        throw error;

      }

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

            (template) =>

              template._id !== id

          )

        );

      } catch (error) {

        console.error(
          "Delete Template Error:",
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
          "Use Template Error:",
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

        loadTemplates,

        addTemplate,

        editTemplate,

        removeTemplate,

        createFromTemplate,

      }}

    >

      {children}

    </TemplateContext.Provider>

  );

};

export default TemplateContext;