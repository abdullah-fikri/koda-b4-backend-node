import { Router } from "express";
import { seedAll } from "../controllers/seed.controllers.js";

const router = Router();

router.post("/seed", seedAll);

export default router;
