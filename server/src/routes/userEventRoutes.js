import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getUserEvents,
  createUserEvent,
  updateUserEvent,
  deleteUserEvent,
} from "../controllers/userEventController.js";

const router = express.Router();

router.get("/", authMiddleware, getUserEvents);
router.post("/", authMiddleware, createUserEvent);
router.put("/:id", authMiddleware, updateUserEvent);
router.delete("/:id", authMiddleware, deleteUserEvent);

export default router;
