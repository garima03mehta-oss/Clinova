import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../../firebase/config";

export default function ExpenseManagement() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Treatment");
  const [saving, setSaving] = useState(false);

  const fetchExpenses = async () => {
    const doctorId = auth.currentUser?.uid;

    if (!doctorId) return;

    try {
      const q = query(
        collection(db, "expenses"),
        where("doctorId", "==", doctorId)
      );

      const snapshot = await getDocs(q);

      setExpenses(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (error) {
      console.error("Expense loading error:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();

    const doctorId = auth.currentUser?.uid;

    if (!doctorId) {
      alert("Doctor is not authenticated.");
      return;
    }

    if (!description || !amount) {
      alert("Please enter expense details.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "expenses"), {
        doctorId,
        description,
        category,
        amount: Number(amount),
        createdAt: serverTimestamp(),
      });

      setDescription("");
      setAmount("");
      setCategory("Treatment");

      await fetchExpenses();

      alert("Expense added successfully.");
    } catch (error) {
      console.error("Add expense error:", error);
      alert("Unable to add expense.");
    } finally {
      setSaving(false);
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-bg font-body">

      <header className="bg-surface border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">

          <button
            onClick={() => navigate("/doctor/billing")}
            className="text-primary text-sm font-medium"
          >
            ← Billing Dashboard
          </button>

          <h1 className="text-2xl font-semibold text-text mt-3">
            Expense Management
          </h1>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        <section className="bg-surface border border-gray-200 rounded-2xl p-6">

          <h2 className="font-semibold text-lg">
            Add Expense
          </h2>

          <form
            onSubmit={handleAddExpense}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5"
          >

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expense description"
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3"
            >
              <option>Treatment</option>
              <option>Medicine</option>
              <option>Investigation</option>
              <option>Procedure</option>
              <option>Other</option>
            </select>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="border border-gray-300 rounded-xl px-4 py-3"
            />

            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white rounded-xl px-4 py-3 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Expense"}
            </button>

          </form>

        </section>

        <section className="bg-surface border border-gray-200 rounded-2xl p-6 mt-6">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-lg">
                Recorded Expenses
              </h2>

              <p className="text-sm text-text-muted mt-1">
                Total expenses recorded
              </p>
            </div>

            <p className="text-xl font-semibold">
              ₹{totalExpenses.toFixed(2)}
            </p>

          </div>

          {expenses.length === 0 ? (

            <div className="text-center py-10 text-text-muted">
              No expenses recorded yet.
            </div>

          ) : (

            <div className="mt-5 divide-y divide-gray-200">

              {expenses.map((expense) => (

                <div
                  key={expense.id}
                  className="py-4 flex items-center justify-between gap-4"
                >

                  <div>
                    <p className="font-medium">
                      {expense.description}
                    </p>

                    <p className="text-xs text-text-muted mt-1">
                      Category: {expense.category}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{Number(expense.amount || 0).toFixed(2)}
                  </p>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>
    </div>
  );
}