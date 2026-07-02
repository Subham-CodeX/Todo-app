import { Outlet } from "react-router-dom";
import { useState } from "react";

import Navbar from "./Navbar";
import AddTaskModal from "./AddTaskModal";

function Layout() {
  const [addModalOpen, setAddModalOpen] =
    useState(false);

  // ==========================
  // OPEN ADD TASK MODAL
  // ==========================

  const handleOpenModal = () => {
    setAddModalOpen(true);
  };

  // ==========================
  // CLOSE ADD TASK MODAL
  // ==========================

  const handleCloseModal = () => {
    setAddModalOpen(false);
  };

  return (
    <>
      {/* Current Page */}
      <Outlet />

      {/* Bottom Navigation */}
      <Navbar
        onAddTask={handleOpenModal}
      />

      {/* Global Add Task Modal */}
      <AddTaskModal
        isOpen={addModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default Layout;