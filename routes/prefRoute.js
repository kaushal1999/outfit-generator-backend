import  express  from "express";
import prefController from "../controllers/prefController.js"


const router = express.Router();


router.post("/",prefController)

export default router
