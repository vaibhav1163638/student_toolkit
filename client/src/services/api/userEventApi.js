import axiosInstance from "./axiosInstance";

export const getUserEvents = () => axiosInstance.get("/user-events");

export const createUserEvent = (data) => axiosInstance.post("/user-events", data);

export const updateUserEvent = (id, data) =>
  axiosInstance.put(`/user-events/${id}`, data);

export const deleteUserEvent = (id) =>
  axiosInstance.delete(`/user-events/${id}`);
