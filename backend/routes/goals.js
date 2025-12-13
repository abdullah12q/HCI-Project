import { Router } from "express";
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goals.js";
import verifyToken from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

router.get("/", getGoals);
router.post("/", addGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
