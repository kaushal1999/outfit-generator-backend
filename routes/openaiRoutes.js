import { Router } from "express";
import  chatbotController  from "../controllers/openaiController.js";

const router = Router();

//route
router.post("/chatbot", chatbotController);

export default router;
