import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EventForm from "./EventForm";

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  isSaving,
}) {
  const isEdit = Boolean(event);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
    }
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, isSaving, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSaving && onClose()}
          />

          {/* Modal panel */}
          <motion.div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-glow-lg sm:p-8"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="mb-6 text-xl font-serif font-bold text-foreground dark:text-white">
              {isEdit ? "Edit Event" : "Add Event"}
            </h2>

            <EventForm
              event={event}
              onSubmit={onSave}
              onCancel={onClose}
              onDelete={onDelete}
              isSaving={isSaving}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
