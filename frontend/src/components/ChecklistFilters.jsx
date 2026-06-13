function ChecklistFilters({ categories, filters, members, onChange }) {
  function updateFilter(name, value) {
    onChange({ ...filters, [name]: value });
  }

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
        <select
          value={filters.status || ""}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">All</option>
          <option value="PENDING">PENDING</option>
          <option value="PACKED">PACKED</option>
          <option value="DELIVERED">DELIVERED</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</span>
        <select
          value={filters.priority || ""}
          onChange={(event) => updateFilter("priority", event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">All</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
        <select
          value={filters.category_id || ""}
          onChange={(event) => updateFilter("category_id", event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned to</span>
        <select
          value={filters.assigned_to_id || ""}
          onChange={(event) => updateFilter("assigned_to_id", event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        >
          <option value="">All</option>
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default ChecklistFilters;
