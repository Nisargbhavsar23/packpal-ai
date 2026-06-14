import { useEffect, useState } from "react";

import Alert from "./Alert";
import LoadingSpinner from "./LoadingSpinner";

const emptyItem = {
  name: "",
  category_id: "",
  quantity: 1,
  priority: "MEDIUM",
  assigned_to_id: "",
  due_date: "",
  notes: "",
};

function getInitialValues(item) {
  if (!item) {
    return emptyItem;
  }

  return {
    name: item.name || "",
    category_id: item.category_id || "",
    quantity: item.quantity || 1,
    priority: item.priority || "MEDIUM",
    assigned_to_id: item.assigned_to?.id || "",
    due_date: item.due_date || "",
    notes: item.notes || "",
  };
}

function validateItem(values) {
  if (!values.name.trim()) {
    return "Item name is required";
  }
  if (!values.category_id) {
    return "Category is required";
  }
  if (Number(values.quantity) < 1) {
    return "Quantity must be at least 1";
  }
  return "";
}

function ItemForm({ categories, error, isOpen, isSubmitting, item, members, onCancel, onSubmit }) {
  const [values, setValues] = useState(getInitialValues(item));
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setValues(getInitialValues(item));
    setValidationError("");
  }, [item, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const message = validateItem(values);
    if (message) {
      setValidationError(message);
      return;
    }

    setValidationError("");
    await onSubmit({
      name: values.name.trim(),
      category_id: values.category_id,
      quantity: Number(values.quantity),
      priority: values.priority,
      assigned_to_id: values.assigned_to_id || null,
      due_date: values.due_date || null,
      notes: values.notes.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-5 py-8">
      <form className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">{item ? "Edit checklist item" : "Add checklist item"}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Save packing details for this trip.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            Close
          </button>
        </div>

        {(validationError || error) && (
          <div className="mt-5">
            <Alert>{validationError || error}</Alert>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Item name</span>
            <input
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              placeholder="Power Bank"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-950"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category</span>
            <select
              name="category_id"
              value={values.category_id}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quantity</span>
            <input
              name="quantity"
              type="number"
              min="1"
              value={values.quantity}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Priority</span>
            <select
              name="priority"
              value={values.priority}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assigned to</span>
            <select
              name="assigned_to_id"
              value={values.assigned_to_id}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Due date</span>
            <input
              name="due_date"
              type="date"
              value={values.due_date}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notes</span>
            <textarea
              name="notes"
              rows="3"
              value={values.notes || ""}
              onChange={handleChange}
              placeholder="Carry fully charged power banks"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-emerald-950"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoadingSpinner label="Saving" className="text-white" spinnerClassName="border-emerald-200 border-t-white" />
            ) : (
              "Save Item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ItemForm;
