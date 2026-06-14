import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../api/categoryApi";
import {
  createTripItem,
  deleteTripItem,
  getTripItemById,
  getTripItems,
  updateTripItem,
  updateTripItemStatus,
} from "../api/itemApi";
import { useAuth } from "../context/AuthContext";
import Alert from "./Alert";
import ChecklistFilters from "./ChecklistFilters";
import ChecklistItemCard from "./ChecklistItemCard";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import ItemDetailModal from "./ItemDetailModal";
import ItemForm from "./ItemForm";
import LoadingSpinner from "./LoadingSpinner";
import StatCard from "./StatCard";

function getActionError(error, fallback) {
  if (error?.response?.status === 401) {
    return "Session expired. Please login again.";
  }
  if (error?.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }
  return fallback;
}

function ChecklistBoard({ members = [], tripId }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formMode, setFormMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const handleAuthFailure = useCallback((apiError) => {
    if (apiError?.response?.status === 401) {
      logout();
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  }, [logout, navigate]);

  const loadChecklistData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [categoryData, itemData] = await Promise.all([getCategories(), getTripItems(tripId, filters)]);
      setCategories(categoryData);
      setItems(itemData);
    } catch (loadError) {
      if (handleAuthFailure(loadError)) {
        return;
      }
      setError(getActionError(loadError, "Failed to load checklist items."));
    } finally {
      setIsLoading(false);
    }
  }, [filters, handleAuthFailure, tripId]);

  useEffect(() => {
    loadChecklistData();
  }, [loadChecklistData]);

  const stats = useMemo(() => {
    const pending = items.filter((item) => item.status === "PENDING").length;
    const packed = items.filter((item) => item.status === "PACKED").length;
    const delivered = items.filter((item) => item.status === "DELIVERED").length;
    return [
      { label: "Total Items", value: String(items.length), helper: "Current filter result" },
      { label: "Pending", value: String(pending), helper: "Still needs packing" },
      { label: "Packed", value: String(packed), helper: "Marked packed" },
      { label: "Delivered", value: String(delivered), helper: "Delivered items" },
    ];
  }, [items]);

  function openCreateForm() {
    setSelectedItem(null);
    setFormMode("create");
    setError("");
  }

  function openEditForm(item) {
    setSelectedItem(item);
    setFormMode("edit");
    setError("");
  }

  function closeForm() {
    setFormMode(null);
    setSelectedItem(null);
  }

  async function handleSubmitItem(payload) {
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    try {
      if (formMode === "edit" && selectedItem) {
        await updateTripItem(tripId, selectedItem.id, payload);
        setSuccessMessage("Item updated successfully.");
      } else {
        await createTripItem(tripId, payload);
        setSuccessMessage("Item added successfully.");
      }
      closeForm();
      await loadChecklistData();
    } catch (submitError) {
      if (handleAuthFailure(submitError)) {
        return;
      }
      setError(getActionError(submitError, formMode === "edit" ? "Failed to update item." : "Failed to create item."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(item, status) {
    setUpdatingStatusId(item.id);
    setError("");
    setSuccessMessage("");
    try {
      await updateTripItemStatus(tripId, item.id, { status });
      setSuccessMessage("Item status updated.");
      await loadChecklistData();
    } catch (statusError) {
      if (handleAuthFailure(statusError)) {
        return;
      }
      setError(getActionError(statusError, "Failed to update item status."));
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDeleteItem() {
    if (!itemToDelete) {
      return;
    }
    setIsDeleting(true);
    setError("");
    setSuccessMessage("");
    try {
      await deleteTripItem(tripId, itemToDelete.id);
      setItemToDelete(null);
      setSuccessMessage("Item deleted successfully.");
      await loadChecklistData();
    } catch (deleteError) {
      if (handleAuthFailure(deleteError)) {
        return;
      }
      setError(getActionError(deleteError, "Failed to delete item."));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleViewItem(item) {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailItem(null);
    setDetailError("");
    try {
      const itemData = await getTripItemById(tripId, item.id);
      setDetailItem(itemData);
    } catch (detailLoadError) {
      if (handleAuthFailure(detailLoadError)) {
        return;
      }
      setDetailError(getActionError(detailLoadError, "Failed to load item detail."));
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Packing Checklist</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Create and manage packing items for this trip.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Add Item
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-5">
        <ChecklistFilters categories={categories} filters={filters} members={members} onChange={setFilters} />
      </div>

      {successMessage && <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{successMessage}</p>}
      {error && (
        <div className="mt-5">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="mt-5">
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <LoadingSpinner label="Loading checklist" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No packing items yet"
            text="Add your first item to begin tracking what needs to be packed or delivered."
            actionLabel="Add Item"
            disabledAction
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <ChecklistItemCard
                key={item.id}
                item={item}
                isUpdatingStatus={updatingStatusId === item.id}
                onDelete={setItemToDelete}
                onEdit={openEditForm}
                onStatusChange={handleStatusChange}
                onView={handleViewItem}
              />
            ))}
          </div>
        )}
      </div>

      <ItemForm
        categories={categories}
        error={error}
        isOpen={Boolean(formMode)}
        isSubmitting={isSubmitting}
        item={formMode === "edit" ? selectedItem : null}
        members={members}
        onCancel={closeForm}
        onSubmit={handleSubmitItem}
      />

      <ItemDetailModal
        error={detailError}
        isLoading={isDetailLoading}
        isOpen={isDetailOpen}
        item={detailItem}
        onClose={() => setIsDetailOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        isLoading={isDeleting}
        title="Delete this item?"
        description="This will remove the checklist item and its status history from this trip."
        confirmLabel="Delete Item"
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
      />
    </section>
  );
}

export default ChecklistBoard;
