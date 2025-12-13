import db from "../config/db.js";
const collectionName = "budgets";

export async function getBudgets(req, res) {
  try {
    const userId = req.user.uid;
    const snapshot = await db
      .collection(collectionName)
      .where("userId", "==", userId)
      .get();

    const budgets = [];
    snapshot.forEach((doc) => budgets.push({ id: doc.id, ...doc.data() }));

    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function setBudget(req, res) {
  try {
    const { category, limit } = req.body;
    const userId = req.user.uid;

    // Check if budget for this category already exists
    const snapshot = await db
      .collection(collectionName)
      .where("userId", "==", userId)
      .where("category", "==", category)
      .get();

    if (!snapshot.empty) {
      // Update existing
      const docId = snapshot.docs[0].id;
      await db
        .collection(collectionName)
        .doc(docId)
        .update({ limit: Number(limit) });
      res.status(200).json({ id: docId, message: "Budget updated" });
    } else {
      // Create new
      const docRef = await db.collection(collectionName).add({
        category,
        limit: Number(limit),
        userId,
      });
      res.status(201).json({ id: docRef.id, message: "Budget created" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteBudget(req, res) {
  try {
    const { id } = req.params;

    await db.collection(collectionName).doc(id).delete();

    res.status(200).json({ message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
