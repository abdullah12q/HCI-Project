import db from "../config/db.js";
const collectionName = "transactions";

export async function getTransactions(req, res) {
  try {
    const userId = req.user.uid;

    let query = db.collection(collectionName);

    if (userId) {
      query = query.where("userId", "==", userId);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const transactions = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        date: data.date ? data.date.toDate() : null,
      });
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addTransaction(req, res) {
  try {
    const { description, amount, type, category, date } = req.body;
    const userId = req.user.uid;

    const newTransaction = {
      description,
      amount: Number(amount),
      type,
      category,
      date: new Date(date),
      userId: userId || "guest",
    };

    const docRef = await db.collection(collectionName).add(newTransaction);

    res.status(201).json({
      id: docRef.id,
      message: "Transaction added successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const transaction = req.body;
    const { description, amount, type, category, date } = transaction;

    await db
      .collection(collectionName)
      .doc(id)
      .update({
        description,
        amount: Number(amount),
        type,
        category,
        date: new Date(date),
      });

    res.status(200).json({ message: "Transaction updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    await db.collection(collectionName).doc(id).delete();

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
