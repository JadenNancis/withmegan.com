"use client";

import { useState, useEffect, useCallback } from "react";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export function UserManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setError("Could not load users. The database may be waking up.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, action: "approve" | "revoke" | "promote" | "demote" | "delete") {
    setActing(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Operation failed.");
      } else {
        await load();
      }
    } catch {
      setError("Network error.");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">Loading accounts…</p>;
  }

  const pending = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const revoked = users.filter((u) => u.status === "revoked");

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={() => { setError(null); setLoading(true); load(); }}
            className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">Pending approval</h2>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              {pending.length}
            </span>
          </div>
          <div className="space-y-2">
            {pending.map((u) => (
              <UserCard key={u.id} user={u} acting={acting === u.id} onAct={act} />
            ))}
          </div>
        </section>
      )}

      {approved.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">Active accounts</h2>
          <div className="space-y-2">
            {approved.map((u) => (
              <UserCard key={u.id} user={u} acting={acting === u.id} onAct={act} />
            ))}
          </div>
        </section>
      )}

      {revoked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">Revoked</h2>
          <div className="space-y-2">
            {revoked.map((u) => (
              <UserCard key={u.id} user={u} acting={acting === u.id} onAct={act} />
            ))}
          </div>
        </section>
      )}

      {users.length === 0 && (
        <p className="text-sm text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">No user accounts yet. Sign up to create one.</p>
      )}
    </div>
  );
}

function UserCard({
  user,
  acting,
  onAct,
}: {
  user: UserRow;
  acting: boolean;
  onAct: (id: string, action: "approve" | "revoke" | "promote" | "demote" | "delete") => void;
}) {
  const statusStyle: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    revoked: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{user.name ?? "Unnamed"}</p>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[user.status] ?? "bg-gray-100 text-gray-600"}`}>
            {user.status}
          </span>
          {user.role === "admin" && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              Admin
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
        <p className="text-[11px] text-gray-600 mt-0.5">
          Joined {new Date(user.createdAt).toLocaleDateString("en-TT")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {user.status === "pending" && (
          <button
            onClick={() => onAct(user.id, "approve")}
            disabled={acting}
            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Approve
          </button>
        )}
        {user.status === "approved" && (
          <button
            onClick={() => onAct(user.id, "revoke")}
            disabled={acting}
            className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            Revoke
          </button>
        )}
        {user.status === "revoked" && (
          <button
            onClick={() => onAct(user.id, "approve")}
            disabled={acting}
            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Reactivate
          </button>
        )}
        {user.status === "approved" && user.role !== "admin" && (
          <button
            onClick={() => onAct(user.id, "promote")}
            disabled={acting}
            className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            Promote
          </button>
        )}
        {user.role === "admin" && (
          <button
            onClick={() => onAct(user.id, "demote")}
            disabled={acting}
            className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Demote
          </button>
        )}
        <button
          onClick={() => onAct(user.id, "delete")}
          disabled={acting}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}