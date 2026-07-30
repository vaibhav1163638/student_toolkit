import { useState, useEffect } from "react";

const COLOR_OPTIONS = [
  "#10b981", // Green (default)
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
];

const toLocalDatetime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const toLocalDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
};

export default function EventForm({
  event,
  onSubmit,
  onCancel,
  onDelete,
  isSaving,
}) {
  const isEdit = Boolean(event);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setLocation(event.location || "");
      setAllDay(Boolean(event.allDay));
      setColor(event.color || COLOR_OPTIONS[0]);

      if (event.allDay) {
        setStart(toLocalDate(event.start));
        setEnd(toLocalDate(event.end));
      } else {
        setStart(toLocalDatetime(event.start));
        setEnd(toLocalDatetime(event.end));
      }
    } else {
      setTitle("");
      setDescription("");
      setLocation("");
      setStart("");
      setEnd("");
      setAllDay(false);
      setColor(COLOR_OPTIONS[0]);
    }
    setErrors({});
  }, [event]);

  const handleAllDayToggle = (checked) => {
    setAllDay(checked);
    if (checked) {
      setStart(start ? start.slice(0, 10) : "");
      setEnd(end ? end.slice(0, 10) : "");
    } else {
      setStart(start ? `${start.slice(0, 10)}T09:00` : "");
      setEnd(end ? `${end.slice(0, 10)}T10:00` : "");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!start) newErrors.start = "Start date is required";
    if (start && end && new Date(end) < new Date(start)) {
      newErrors.end = "End cannot be before start";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      start: new Date(start).toISOString(),
      end: end ? new Date(end).toISOString() : null,
      allDay,
      color,
    });
  };

  const inputBase =
    "w-full rounded-xl border border-border dark:border-border-dark bg-background dark:bg-surface-dark-elevated px-4 py-2.5 text-sm text-foreground dark:text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground dark:text-slate-300">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          maxLength={200}
          className={inputBase}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground dark:text-slate-300">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          maxLength={1000}
          rows={3}
          className={`${inputBase} resize-none`}
        />
      </div>

      {/* Location */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-foreground dark:text-slate-300">
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Optional location"
          maxLength={300}
          className={inputBase}
        />
      </div>

      {/* All Day toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => handleAllDayToggle(e.target.checked)}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-primary transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:after:translate-x-5"></div>
        </label>
        <span className="text-sm font-medium text-foreground dark:text-slate-300">
          All day
        </span>
      </div>

      {/* Start / End */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground dark:text-slate-300">
            Start <span className="text-red-500">*</span>
          </label>
          <input
            type={allDay ? "date" : "datetime-local"}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputBase}
          />
          {errors.start && (
            <p className="mt-1 text-xs text-red-500">{errors.start}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground dark:text-slate-300">
            End
          </label>
          <input
            type={allDay ? "date" : "datetime-local"}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={inputBase}
          />
          {errors.end && (
            <p className="mt-1 text-xs text-red-500">{errors.end}</p>
          )}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground dark:text-slate-300">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition-all duration-150 ${
                color === c
                  ? "border-foreground dark:border-white scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-border dark:border-border-dark pt-5 sm:flex-row sm:justify-between">
        <div>
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="rounded-xl border border-red-300 dark:border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-xl border border-border dark:border-border-dark px-5 py-2.5 text-sm font-semibold text-foreground dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-surface-dark-elevated disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isSaving ? "Saving…" : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
