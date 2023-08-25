import { Router } from "express";
import  {chatbotController,imageController}  from "../controllers/openaiController.js";

const router = Router();

//route
router.post("/chatbot", chatbotController);
router.post("/image",imageController)
export default router;
