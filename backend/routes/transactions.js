import { Router } from "express";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transactions.js";
import verifyToken from "../middleware/auth.js";

const router = Router();

router.use(verifyToken);

router.get("/", getTransactions);
router.post("/", addTransaction);
router.delete("/:id", deleteTransaction);
router.put("/:id", updateTransaction);

export default router;
