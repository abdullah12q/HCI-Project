import express from "express";
import cors from "cors";

import transactionRoutes from "./routes/transactions.js";
import goalRoutes from "./routes/goals.js";
import budgetRoutes from "./routes/budgets.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/transactions", transactionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/budgets", budgetRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
