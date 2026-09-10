import express from "express";
import { register, getAllUsers,login } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", register);
router.get("/", getAllUsers);
router.post("/login", login);

export default router;
