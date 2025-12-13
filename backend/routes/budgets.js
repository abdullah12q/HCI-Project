import { Router } from "express";
import { deleteBudget, getBudgets, setBudget } from "../controllers/budgets.js";
import verifyToken from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);
router.get("/", getBudgets);
router.post("/", setBudget);
router.delete("/:id", deleteBudget);

export default router;
