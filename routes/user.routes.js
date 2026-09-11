import express from "express";
import { register, getAllUsers,login } from "../controllers/user.controller.js";
import authorizeToken from "../middlewares/authorizeToken.js";

const router = express.Router();

router.post("/",authorizeToken, register);
router.get("/", getAllUsers);
router.post("/login", login);

export default router;
