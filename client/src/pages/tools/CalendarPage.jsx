import { useEffect, useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import toast from "react-hot-toast";

import AddEventModal from "../../components/calendar/AddEventModal";
import {
  getUserEvents,
  createUserEvent,
  updateUserEvent,
  deleteUserEvent,
} from "../../services/api/userEventApi";

const eventColors = {
  Holiday: "#C0A062",       // IEEE Accent Gold
  Semester: "#00508F",      // IEEE Primary Blue
  Examination: "#ef4444",   // Examination Red
  Vacation: "#10b981",      // Vacation Green
  Event: "#4DB6AC",         // IEEE Secondary Teal
};

function CalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Fetch read-only academic + holiday events (unchanged logic) ──
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/calendar`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch calendar");
        }

        const data = await response.json();

        const formattedEvents = data.events.flatMap((event) => {
          const baseProps = {
            allDay: true,
            backgroundColor: eventColors[event.type] || "#64748b",
            borderColor: eventColors[event.type] || "#64748b",
            textColor: "#ffffff",
            extendedProps: {
              type: event.type,
              description: event.description,
              originalStart: event.start,
              originalEnd: event.end,
              source: "system",
            },
          };

          if (event.end && event.start !== event.end) {
            return [
              {
                ...baseProps,
                id: `${event.id}-start`,
                title: `${event.title} (Start)`,
                start: event.start,
              },
              {
                ...baseProps,
                id: `${event.id}-end`,
                title: `${event.title} (End)`,
                start: event.end,
              }
            ];
          }

          return {
            ...baseProps,
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
          };
        });

        setCalendarEvents(formattedEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  // ── Fetch user's personal events ──
  const fetchUserEvents = useCallback(async () => {
    try {
      const { data } = await getUserEvents();

      const formatted = (data.events || []).map((evt) => ({
        id: `user-${evt._id}`,
        title: evt.title,
        start: evt.start,
        end: evt.end || undefined,
        allDay: evt.allDay,
        backgroundColor: evt.color || "#10b981",
        borderColor: evt.color || "#10b981",
        textColor: "#ffffff",
        extendedProps: {
          source: "user",
          eventId: evt._id,
          description: evt.description,
          location: evt.location,
          color: evt.color,
          allDay: evt.allDay,
        },
      }));

      setUserEvents(formatted);
    } catch (error) {
      console.error("Failed to fetch user events:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  // ── Event click handler ──
  const handleEventClick = ({ event }) => {
    const { source } = event.extendedProps;

    if (source === "user") {
      const { eventId, description, location, color, allDay } = event.extendedProps;
      setSelectedEvent({
        _id: eventId,
        title: event.title,
        description: description || "",
        location: location || "",
        start: event.startStr,
        end: event.endStr || "",
        allDay: Boolean(allDay),
        color: color || "#10b981",
      });
      setModalOpen(true);
      return;
    }

    // Existing read-only behaviour for system events
    const { type, description, originalStart, originalEnd } = event.extendedProps;

    const startStr = originalStart ? new Date(originalStart).toLocaleDateString() : 'N/A';
    const endStr = originalEnd ? new Date(originalEnd).toLocaleDateString() : '';

    const cleanTitle = event.title.replace(" (Start)", "").replace(" (End)", "");

    alert(
      `${cleanTitle}\n\nType: ${type}\n\nStart: ${startStr}${endStr ? `\nEnd: ${endStr}` : ''}\n\n${description || ""}`
    );
  };

  // ── CRUD handlers ──
  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      if (selectedEvent?._id) {
        await updateUserEvent(selectedEvent._id, formData);
        toast.success("Event updated");
      } else {
        await createUserEvent(formData);
        toast.success("Event created");
      }
      setModalOpen(false);
      setSelectedEvent(null);
      await fetchUserEvents();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to save event";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?._id) return;
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setIsSaving(true);
    try {
      await deleteUserEvent(selectedEvent._id);
      toast.success("Event deleted");
      setModalOpen(false);
      setSelectedEvent(null);
      await fetchUserEvents();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to delete event";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateModal = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  // ── Month jump (unchanged) ──
  const handleMonthChange = (e) => {
    if (e.target.value && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(e.target.value);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg font-medium text-foreground-muted dark:text-slate-400">
          Loading calendar...
        </p>
      </div>
    );
  }

  const allEvents = [...calendarEvents, ...userEvents];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-8 shadow-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-colors duration-300">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground dark:text-white">
            Academic &amp; Holiday Calendar
          </h1>
          <p className="mt-2 text-sm text-foreground-muted dark:text-slate-400">
            View all academic events and holidays in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="month-picker" className="text-sm font-semibold text-foreground dark:text-slate-350">
              Jump to:
            </label>
            <input
              id="month-picker"
              type="month"
              onChange={handleMonthChange}
              className="cursor-pointer rounded-xl border border-border dark:border-border-dark bg-background dark:bg-surface-dark-elevated px-4 py-2 text-sm text-foreground dark:text-white outline-none transition-all duration-200"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-card transition-colors duration-300">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px] lg:min-w-full text-foreground dark:text-slate-200">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={allEvents}
              height="auto"
              fixedWeekCount={false}
              dayMaxEvents={3}
              eventDisplay="block"
              eventClick={handleEventClick}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-t border-border dark:border-border-dark pt-4 sm:gap-6">
          <Legend color="#C0A062" label="Holiday" />
          <Legend color="#00508F" label="Semester" />
          <Legend color="#ef4444" label="Examination" />
          <Legend color="#10b981" label="Vacation" />
          <Legend color="#4DB6AC" label="Event" />
          <Legend color="#10b981" label="My Events" icon="●" />
        </div>
      </div>

      <AddEventModal
        isOpen={modalOpen}
        onClose={() => {
          if (!isSaving) {
            setModalOpen(false);
            setSelectedEvent(null);
          }
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        event={selectedEvent}
        isSaving={isSaving}
      />
    </div>
  );
}

function Legend({ color, label, icon }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 sm:h-4 sm:w-4 ${icon ? "flex items-center justify-center text-xs" : "rounded-full"}`}
        style={{ backgroundColor: icon ? "transparent" : color, color: icon ? color : undefined }}
      >
        {icon || ""}
      </span>
      {!icon && (
        <span
          className="h-3 w-3 rounded-full sm:h-4 sm:w-4 hidden"
          style={{ backgroundColor: color }}
        ></span>
      )}
      <span className="text-xs text-foreground dark:text-slate-350 sm:text-sm font-semibold">{label}</span>
    </div>
  );
}

export default CalendarPage;