import { useState } from "react";

import {
  addTripMember,
  getTripMembers,
  leaveTrip,
  removeTripMember,
  updateMemberRole,
} from "../api/memberApi";
import Alert from "./Alert";
import ConfirmDialog from "./ConfirmDialog";
import LoadingSpinner from "./LoadingSpinner";

// ─── Role configuration ───────────────────────────────────────────────────────

const ROLE_CONFIG = {
  OWNER: { label: "Owner", description: "Full control over the trip" },
  ADMIN: { label: "Admin", description: "Can manage members & items" },
  MEMBER: { label: "Member", description: "Can manage items" },
  VIEWER: { label: "Viewer", description: "Read-only access" },
};

// Roles that can be ASSIGNED when adding a new member (cannot add as OWNER via form)
const ADD_ROLES = ["ADMIN", "MEMBER", "VIEWER"];

// Roles that an existing member can be CHANGED TO (owner can promote someone to OWNER)
const CHANGE_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];

function roleLabel(role) {
  return ROLE_CONFIG[role]?.label || role;
}

function roleBadgeClass(role) {
  if (role === "OWNER") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
  if (role === "ADMIN")  return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300";
  if (role === "VIEWER") return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
  return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiError(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (error?.response?.status === 403) return "You do not have permission for this action.";
  if (error?.response?.status === 404) return "User not found. Make sure the email belongs to a registered PackPal AI account.";
  if (error?.response?.status === 400) return detail || "This user is already a member of this trip.";
  return fallback;
}

function initials(name) {
  return (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function MemberAvatar({ name }) {
  return (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 ring-2 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60">
      {initials(name)}
    </span>
  );
}

// ─── Add Member Form ──────────────────────────────────────────────────────────
// The backend `POST /trips/{id}/members` looks up the user by email in the
// registered-user table. It does NOT send any invitation emails.
// Only users who have already registered in PackPal AI can be added.

function AddMemberForm({ tripId, onAdded }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newMember = await addTripMember(tripId, { email: normalized, role });
      setFormSuccess(`${newMember.name} has been added as ${roleLabel(role)}.`);
      setEmail("");
      setRole("MEMBER");
      onAdded(newMember.name);
    } catch (err) {
      setFormError(getApiError(err, "Failed to add member. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/50">
      <div className="mb-4">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Add Member</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Enter the email address of a registered PackPal AI user.
        </p>
      </div>

      {formError && (
        <div className="mb-3">
          <Alert>{formError}</Alert>
        </div>
      )}
      {formSuccess && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          {formSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="add-member-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFormError(""); setFormSuccess(""); }}
            placeholder="registered@example.com"
            required
            autoComplete="off"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-950"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Role for new member"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-emerald-950"
          >
            {ADD_ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            id="add-member-submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <LoadingSpinner label="Adding" className="text-white" spinnerClassName="border-emerald-200 border-t-white" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.046 15.253c-.058.468.172.92.57 1.175A9.953 9.953 0 0 0 8 18c1.982 0 3.83-.578 5.384-1.573.398-.254.628-.707.57-1.175a7 7 0 0 0-13.908 0ZM15.75 7.5a.75.75 0 0 0-1.5 0v2.25H12a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H18a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({ member, isMe, canChangeRole, canRemove, isUpdatingRole, onRoleChange, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80">
      <MemberAvatar name={member.name} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {member.name}
          </p>
          {isMe && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              you
            </span>
          )}
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadgeClass(member.role)}`}>
            {roleLabel(member.role)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
          {member.email}
        </p>
      </div>

      {/* Actions column */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {canChangeRole && (
          <>
            {isUpdatingRole ? (
              <div className="px-2">
                <LoadingSpinner className="text-slate-400" />
              </div>
            ) : (
              <select
                value={member.role}
                onChange={(e) => onRoleChange(member.id, e.target.value)}
                aria-label={`Change role for ${member.name}`}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:ring-emerald-900"
              >
                {CHANGE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
        {canRemove && (
          <button
            type="button"
            id={`remove-member-${member.id}`}
            aria-label={`Remove ${member.name} from trip`}
            onClick={() => onRemove(member.id, member.name)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            title="Remove member"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * MembersSection — complete member management panel.
 *
 * Props:
 *   tripId          {string}    UUID of the trip
 *   initialMembers  {Array}     Initial members list from TripDetail load
 *   currentUser     {Object}    Logged-in user from AuthContext ({ id, name, email })
 *   onMembersChanged {Function} Called after any mutation; receives fresh member list or null
 */
function MembersSection({ tripId, initialMembers = [], currentUser, onMembersChanged }) {
  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingRoleFor, setUpdatingRoleFor] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // { memberId, memberName }
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Current user's membership in this trip
  const myMembership = members.find((m) => m.user_id === currentUser?.id);
  const myRole = myMembership?.role;
  const isOwner = myRole === "OWNER";
  const isAdminOrOwner = myRole === "OWNER" || myRole === "ADMIN";

  function clearMessages() {
    setError("");
    setSuccessMessage("");
  }

  async function refreshMembers() {
    try {
      const fresh = await getTripMembers(tripId);
      setMembers(fresh);
      onMembersChanged(fresh);
    } catch {
      // Non-fatal — UI keeps existing list
    }
  }

  // ── Add Member ────────────────────────────────────────────────────
  async function handleMemberAdded(addedName) {
    clearMessages();
    setSuccessMessage(`${addedName} has been added to the trip.`);
    await refreshMembers();
  }

  // ── Change Role ───────────────────────────────────────────────────
  async function handleRoleChange(memberId, newRole) {
    clearMessages();
    setUpdatingRoleFor(memberId);
    try {
      const updated = await updateMemberRole(tripId, memberId, newRole);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: updated.role } : m)));
      setSuccessMessage(`Role updated to ${roleLabel(newRole)}.`);
      onMembersChanged(null); // signal AI panels to refresh
    } catch (err) {
      setError(getApiError(err, "Failed to update role. Please try again."));
    } finally {
      setUpdatingRoleFor(null);
    }
  }

  // ── Remove Member ─────────────────────────────────────────────────
  function handleRemoveClick(memberId, memberName) {
    clearMessages();
    setConfirmRemove({ memberId, memberName });
  }

  async function handleRemoveConfirmed() {
    if (!confirmRemove) return;
    setIsRemoving(true);
    clearMessages();
    try {
      await removeTripMember(tripId, confirmRemove.memberId);
      const removedName = confirmRemove.memberName;
      setConfirmRemove(null);
      setSuccessMessage(`${removedName} has been removed from the trip.`);
      await refreshMembers();
    } catch (err) {
      setError(getApiError(err, "Failed to remove member. Please try again."));
      setConfirmRemove(null);
    } finally {
      setIsRemoving(false);
    }
  }

  // ── Leave Trip ────────────────────────────────────────────────────
  async function handleLeaveConfirmed() {
    setIsLeaving(true);
    clearMessages();
    try {
      await leaveTrip(tripId);
      setConfirmLeave(false);
      onMembersChanged(null);
      // Redirect to dashboard — current user is no longer a member
      window.location.href = "/dashboard";
    } catch (err) {
      setError(getApiError(err, "Failed to leave trip. Please try again."));
      setConfirmLeave(false);
    } finally {
      setIsLeaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      {/* ── Section Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Members</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {members.length} {members.length === 1 ? "person" : "people"} on this trip
          </p>
        </div>

        {/* Leave Trip — only visible to non-owners who are members */}
        {myMembership && !isOwner && (
          <button
            type="button"
            id="leave-trip-btn"
            onClick={() => { clearMessages(); setConfirmLeave(true); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.04a.75.75 0 1 0-1.004-1.115l-2.5 2.5a.75.75 0 0 0 0 1.11l2.5 2.5a.75.75 0 1 0 1.004-1.115L8.704 10.75H18.25A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
            </svg>
            Leave Trip
          </button>
        )}
      </div>

      {/* ── Status Messages ── */}
      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {successMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* ── Member Cards Grid ── */}
      {members.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
          <p className="text-3xl">👥</p>
          <p className="mt-2 font-semibold text-slate-700 dark:text-slate-200">No members yet</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add members below to start collaborating on this trip.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {members.map((member) => {
            const isMe = member.user_id === currentUser?.id;
            const isMemberOwner = member.role === "OWNER";
            // Only the trip OWNER can change roles or remove members.
            // An owner cannot change their own role via the UI (prevent self-demotion).
            // An owner cannot remove themselves (use "Leave Trip" instead, blocked by backend).
            const canChangeRole = isOwner && !isMe;
            const canRemove = isOwner && !isMemberOwner && !isMe;

            return (
              <MemberCard
                key={member.id}
                member={member}
                isMe={isMe}
                canChangeRole={canChangeRole}
                canRemove={canRemove}
                isUpdatingRole={updatingRoleFor === member.id}
                onRoleChange={handleRoleChange}
                onRemove={handleRemoveClick}
              />
            );
          })}
        </div>
      )}

      {/* ── Add Member Form — only for owners and admins ── */}
      {isAdminOrOwner && (
        <AddMemberForm tripId={tripId} onAdded={handleMemberAdded} />
      )}

      {/* ── Permission note for plain members and viewers ── */}
      {myMembership && !isAdminOrOwner && (
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Only owners and admins can add or remove members.
        </p>
      )}

      {/* ── Remove Confirmation ── */}
      <ConfirmDialog
        isOpen={Boolean(confirmRemove)}
        isLoading={isRemoving}
        title={`Remove ${confirmRemove?.memberName || "member"}?`}
        description="This person will lose access to the trip and all its items immediately."
        confirmLabel="Remove Member"
        onCancel={() => { setConfirmRemove(null); }}
        onConfirm={handleRemoveConfirmed}
      />

      {/* ── Leave Confirmation ── */}
      <ConfirmDialog
        isOpen={confirmLeave}
        isLoading={isLeaving}
        title="Leave this trip?"
        description="You will immediately lose access to this trip. An owner or admin can add you back."
        confirmLabel="Leave Trip"
        onCancel={() => { setConfirmLeave(false); }}
        onConfirm={handleLeaveConfirmed}
      />
    </section>
  );
}

export default MembersSection;
