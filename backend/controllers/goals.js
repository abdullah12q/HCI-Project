import db from "../config/db.js";
const collectionName = "goals";

export async function getGoals(req, res) {
  try {
    const userId = req.user.uid;
    const snapshot = await db
      .collection(collectionName)
      .where("userId", "==", userId)
      .get();

    const goals = [];
    snapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addGoal(req, res) {
  try {
    const { name, targetAmount, currentAmount } = req.body;
    const userId = req.user.uid;

    const newGoal = {
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      userId,
    };

    const docRef = await db.collection(collectionName).add(newGoal);
    res.status(201).json({ id: docRef.id, message: "Goal created" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateGoal(req, res) {
  try {
    const { id } = req.params;
    const { currentAmount } = req.body;

    await db
      .collection(collectionName)
      .doc(id)
      .update({
        currentAmount: Number(currentAmount),
      });

    res.status(200).json({ message: "Goal updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteGoal(req, res) {
  try {
    const { id } = req.params;

    await db.collection(collectionName).doc(id).delete();

    res.status(200).json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
