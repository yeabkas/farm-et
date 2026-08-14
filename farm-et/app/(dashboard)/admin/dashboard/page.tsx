"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Search,
  Receipt,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Lock,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle,
  UserPlus,
  UserMinus,
  ShieldAlert
} from "lucide-react";
import { fetchUserProfile, fetchAdminUsers, fetchAdminUserDetails, createAdminUser, revokeAdminRole, promoteAdminRole, resetUserPassword } from "@/lib/services";

interface AdminUserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
  farmName: string;
  location: string;
  currency: string;
  totalTransactions: number;
  totalAnimals: number;
  totalCrops: number;
  forSaleCount: number;
  createdAt: string;
}

interface UserDetailPayload {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    farmName: string;
    currency: string;
    createdAt: string;
  };
  transactions: Array<{
    id: number | string;
    type: "Income" | "Expense";
    amount: number;
    category: string;
    payeeCustomer?: string;
    description?: string;
    date: string;
    createdAt: string;
  }>;
  productsForSale: Array<{
    id: number | string;
    name: string;
    category: string;
    type: string;
    price: number;
    status: string;
    details: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ email?: string; role?: string; data?: { role?: string, email?: string } } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalForSale: 0,
  });

  // Selected user inspection drawer/modal
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [inspectData, setInspectData] = useState<UserDetailPayload | null>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "forSale">("transactions");

  // Add Admin modal state
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({ name: "", email: "", password: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [addAdminError, setAddAdminError] = useState("");

  // Reset password state
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers();
      setUsers(res.data || []);
      if (res.summary) {
        setSummaryMetrics(res.summary);
      }
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile()
      .then((res) => {
        const u = res.data ?? res;
        setCurrentUser(u);
        const isAdmin = u.email === "yeabkasz@gmail.com" || u.role === "admin";
        setIsAuthorized(isAdmin);
        if (isAdmin) {
          loadAdminData();
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to verify admin status:", err);
        setIsAuthorized(false);
        setLoading(false);
      });
  }, []);



  const handleInspectUser = async (userId: number) => {
    setSelectedUserId(userId);
    setInspecting(true);
    setInspectData(null);
    try {
      const data = await fetchAdminUserDetails(userId);
      setInspectData(data);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to fetch user details.");
    } finally {
      setInspecting(false);
    }
  };

  const handleRevokeAdmin = async (userId: number) => {
    if (!confirm("Are you sure you want to revoke this user's admin privileges?")) return;
    try {
      await revokeAdminRole(userId);
      loadAdminData();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to revoke admin privileges.");
    }
  };

  const handlePromoteAdmin = async (userId: number) => {
    if (!confirm("Are you sure you want to promote this user to admin?")) return;
    try {
      await promoteAdminRole(userId);
      loadAdminData();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to promote user to admin.");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId) return;
    setResetError("");
    setIsResetting(true);
    try {
      await resetUserPassword(resetUserId, resetPasswordInput);
      setResetUserId(null);
      setResetPasswordInput("");
      alert("Password reset successfully.");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setResetError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError("");
    setIsAdding(true);
    try {
      await createAdminUser(addAdminForm);
      setIsAddingAdmin(false);
      setAddAdminForm({ name: "", email: "", password: "" });
      loadAdminData(); // Refresh directory
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setAddAdminError(err.response?.data?.message || "Failed to create admin account.");
    } finally {
      setIsAdding(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.farmName.toLowerCase().includes(q)
    );
  });

  // Render unauthorized access screen
  if (isAuthorized === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono p-6">
        <div className="bg-white border border-red-200 shadow-xl rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Restricted Admin Access</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            The Admin Portal is restricted strictly to account <span className="font-bold text-gray-900">yeabkasz@gmail.com</span>. Please sign in with admin credentials.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition"
          >
            Return to Main Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-sm p-4">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-gray-900 via-gray-800 to-emerald-950 text-white p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight">Platform Admin Console</h1>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
              SUPERADMIN
            </span>
          </div>
          <p className="text-xs text-gray-300">
            Real-time platform user directory, transaction ledgers, and marketplace listings
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsAddingAdmin(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin</span>
          </button>
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs transition border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh System Data</span>
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Registered Platform Users</p>
            <p className="text-2xl font-extrabold text-gray-900">{summaryMetrics.totalUsers}</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Total Platform Transactions</p>
            <p className="text-2xl font-extrabold text-gray-900">{summaryMetrics.totalTransactions}</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium">Items Currently For Sale</p>
            <p className="text-2xl font-extrabold text-amber-600">{summaryMetrics.totalForSale}</p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── User Directory Table ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header & Search */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>User Accounts Directory</span>
            <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {filteredUsers.length}
            </span>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name, email, farm..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* User Table (NO AVATARS per request) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/70 text-gray-600 font-semibold">
                <th className="p-3">User Name & Email</th>
                <th className="p-3">Farm Name</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Transactions</th>
                <th className="p-3 text-center">Items For Sale</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Loading user directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-[11px] text-gray-500">{user.email}</p>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">{user.farmName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-gray-800">{user.totalTransactions}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.forSaleCount > 0
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {user.forSaleCount} Items
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{user.createdAt}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
                      <div className="flex justify-end gap-2">
                        {currentUser?.email === "yeabkasz@gmail.com" &&
                         user.role === "admin" &&
                         user.email !== "yeabkasz@gmail.com" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevokeAdmin(user.id);
                            }}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition"
                            title="Revoke Admin Privileges"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                        {currentUser?.email === "yeabkasz@gmail.com" &&
                         user.role !== "admin" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePromoteAdmin(user.id);
                            }}
                            className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition"
                            title="Promote to Admin"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                        {currentUser?.email === "yeabkasz@gmail.com" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setResetUserId(user.id);
                            }}
                            className="text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 p-1.5 rounded-lg transition"
                            title="Reset Password"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleInspectUser(user.id)}
                          className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── User Detail Drawer / Modal ── */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span>User Details & Activities</span>
                  {inspectData && (
                    <span className="text-xs font-normal text-emerald-400">
                      ({inspectData.user.name} — {inspectData.user.farmName})
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {inspecting || !inspectData ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
                <p>Fetching user transactions and active market products...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* User Summary Box */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500">User Name</p>
                    <p className="font-bold text-gray-900">{inspectData.user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email Address</p>
                    <p className="font-bold text-gray-900 truncate">{inspectData.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Farm Name</p>
                    <p className="font-bold text-gray-900">{inspectData.user.farmName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Member Since</p>
                    <p className="font-bold text-gray-900">{inspectData.user.createdAt}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 gap-4">
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                      activeTab === "transactions"
                        ? "border-emerald-600 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Transactions ({inspectData.transactions.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("forSale")}
                    className={`pb-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                      activeTab === "forSale"
                        ? "border-emerald-600 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span>Products For Sale ({inspectData.productsForSale.length})</span>
                  </button>
                </div>

                {/* TAB 1: Transactions Ledger */}
                {activeTab === "transactions" && (
                  <div>
                    {inspectData.transactions.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No transactions recorded by this user.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-gray-100 text-gray-700 font-semibold border-b">
                              <th className="p-3">Date</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Payee / Customer</th>
                              <th className="p-3">Description</th>
                              <th className="p-3 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {inspectData.transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-600">{tx.date}</td>
                                <td className="p-3">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      tx.type === "Income"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {tx.type === "Income" ? (
                                      <ArrowDownLeft className="w-3 h-3" />
                                    ) : (
                                      <ArrowUpRight className="w-3 h-3" />
                                    )}
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-gray-800">{tx.category}</td>
                                <td className="p-3 text-gray-600">{tx.payeeCustomer || "N/A"}</td>
                                <td className="p-3 text-gray-500 max-w-xs truncate">{tx.description || "--"}</td>
                                <td className="p-3 text-right font-bold text-gray-900">
                                  ETB {tx.amount.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Products For Sale */}
                {activeTab === "forSale" && (
                  <div>
                    {inspectData.productsForSale.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        This user currently has no animals or crops listed For Sale in the Marketplace.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inspectData.productsForSale.map((prod) => (
                          <div
                            key={`${prod.category}-${prod.id}`}
                            className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs space-y-2 relative"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  {prod.category}
                                </span>
                                <h4 className="text-sm font-bold text-gray-900 mt-1">{prod.name}</h4>
                                <p className="text-xs text-gray-500">{prod.type}</p>
                              </div>
                              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                For Sale
                              </span>
                            </div>

                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                              <span className="text-gray-500">{prod.details}</span>
                              <span className="font-extrabold text-emerald-700 text-sm">
                                ETB {prod.price > 0 ? prod.price.toLocaleString() : "Price on Request"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ── Add Admin Modal ── */}
      {isAddingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Add Platform Admin
              </h3>
              <button
                onClick={() => {
                  setIsAddingAdmin(false);
                  setAddAdminForm({ name: "", email: "", password: "" });
                  setAddAdminError("");
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAdminSubmit} className="p-6 space-y-4">
              {addAdminError && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200">
                  {addAdminError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={addAdminForm.name}
                  onChange={(e) => setAddAdminForm({ ...addAdminForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Admin User"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={addAdminForm.email}
                  onChange={(e) => setAddAdminForm({ ...addAdminForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={addAdminForm.password}
                  onChange={(e) => setAddAdminForm({ ...addAdminForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{isAdding ? "Creating..." : "Create Admin Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Reset User Password</h2>
              <button
                onClick={() => setResetUserId(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {resetError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                  {resetError}
                </div>
              )}
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Enter new password"
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setResetUserId(null)}
                    className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-70 flex items-center gap-2"
                  >
                    {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
