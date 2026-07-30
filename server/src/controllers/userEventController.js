import mongoose from "mongoose";
import UserEvent from "../models/UserEvent.js";

const isValidUser = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    res.status(401).json({ message: "Invalid session. Please log in again." });
    return false;
  }
  return true;
};

const isValidDate = (value) => {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

const sanitizeColor = (value = "") => {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return trimmed;
  }
  return "#10b981";
};

export const getUserEvents = async (req, res) => {
  try {
    if (!isValidUser(req, res)) return;

    const events = await UserEvent.find({ user: req.user.id })
      .sort({ start: 1 })
      .lean();

    res.json({ events });
  } catch (error) {
    console.error("Get user events error:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const createUserEvent = async (req, res) => {
  try {
    if (!isValidUser(req, res)) return;

    const { title, description, start, end, allDay, location, color } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!start || !isValidDate(start)) {
      return res.status(400).json({ message: "A valid start date is required" });
    }

    if (end && !isValidDate(end)) {
      return res.status(400).json({ message: "End date is invalid" });
    }

    if (end && new Date(end) < new Date(start)) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const event = await UserEvent.create({
      user: req.user.id,
      title: title.trim(),
      description: description?.trim() || "",
      start: new Date(start),
      end: end ? new Date(end) : null,
      allDay: Boolean(allDay),
      location: location?.trim() || "",
      color: sanitizeColor(color),
    });

    res.status(201).json({ message: "Event created", event });
  } catch (error) {
    console.error("Create user event error:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const updateUserEvent = async (req, res) => {
  try {
    if (!isValidUser(req, res)) return;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const existing = await UserEvent.findOne({ _id: id, user: req.user.id });

    if (!existing) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { title, description, start, end, allDay, location, color } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    if (start !== undefined && !isValidDate(start)) {
      return res.status(400).json({ message: "A valid start date is required" });
    }

    if (end !== undefined && end !== null && !isValidDate(end)) {
      return res.status(400).json({ message: "End date is invalid" });
    }

    const newStart = start !== undefined ? new Date(start) : existing.start;
    const newEnd = end !== undefined ? (end ? new Date(end) : null) : existing.end;

    if (newEnd && newEnd < newStart) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    if (title !== undefined) existing.title = title.trim();
    if (description !== undefined) existing.description = description.trim();
    existing.start = newStart;
    existing.end = newEnd;
    if (allDay !== undefined) existing.allDay = Boolean(allDay);
    if (location !== undefined) existing.location = location.trim();
    if (color !== undefined) existing.color = sanitizeColor(color);

    await existing.save();

    res.json({ message: "Event updated", event: existing });
  } catch (error) {
    console.error("Update user event error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};

export const deleteUserEvent = async (req, res) => {
  try {
    if (!isValidUser(req, res)) return;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const deleted = await UserEvent.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Delete user event error:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
