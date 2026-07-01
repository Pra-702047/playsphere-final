"use client";

import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole, deleteUserDoc, UserProfile } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { logAdminActivity } from "@/services/log.service";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const confirmChange = confirm(`Are you sure you want to change this user's role to ${newRole}?`);
    if (!confirmChange) return;

    const targetUser = users.find((u) => u.uid === userId);
    const targetName = targetUser ? targetUser.name : "Unknown User";
    const targetEmail = targetUser ? targetUser.email : "N/A";

    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        if (user) {
          await logAdminActivity(
            user.uid,
            user.displayName || "Admin",
            "UPDATE_USER_ROLE",
            `Changed role of user "${targetName}" (${targetEmail}) to "${newRole}"`
          );
        }
        alert("User role updated successfully!");
        setUsers((prev) =>
          prev.map((u) => (u.uid === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert("Failed to update role: " + res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this user? This action is irreversible.");
    if (!confirmDelete) return;

    const targetUser = users.find((u) => u.uid === userId);
    const targetName = targetUser ? targetUser.name : "Unknown User";
    const targetEmail = targetUser ? targetUser.email : "N/A";

    try {
      const res = await deleteUserDoc(userId);
      if (res.success) {
        if (user) {
          await logAdminActivity(
            user.uid,
            user.displayName || "Admin",
            "DELETE_USER",
            `Permanently deleted user account "${targetName}" (${targetEmail})`
          );
        }
        alert("User deleted successfully!");
        setUsers((prev) => prev.filter((u) => u.uid !== userId));
      } else {
        alert("Failed to delete user: " + res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Manage Users</h1>
        <p className="text-gray-400 mt-2">View player and owner directories, change access roles, or remove accounts.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-lime-500 text-sm"
          />
        </div>

        {/* Role Filters */}
        <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 gap-1 w-full md:w-auto">
          {["all", "player", "owner", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                roleFilter === role
                  ? "bg-lime-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {role === "all" ? "All Users" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No users found matching the filter criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-gray-400 text-sm bg-zinc-950/40">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6">Created On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="text-gray-300 text-sm hover:bg-zinc-950/10">
                    <td className="py-4 px-6 font-semibold text-white">{u.name}</td>
                    <td className="py-4 px-6">{u.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role || "player"}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 text-white rounded-lg p-2 text-xs font-semibold outline-none focus:border-lime-500"
                      >
                        <option value="player">Player</option>
                        <option value="owner">Turf Owner</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-zinc-500">
                      {u.createdAt?.toDate 
                        ? u.createdAt.toDate().toLocaleDateString("en-IN")
                        : u.createdAt 
                          ? new Date(u.createdAt).toLocaleDateString("en-IN")
                          : "N/A"
                      }
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        Delete User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
