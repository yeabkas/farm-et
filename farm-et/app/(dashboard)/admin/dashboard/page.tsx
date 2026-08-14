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
} from "lucide-react";
import { fetchUserProfile, fetchAdminUsers, fetchAdminUserDetails } from "@/lib/services";

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
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setInspecting(false);
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

        <button
          onClick={loadAdminData}
          disabled={loading}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs transition border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh System Data</span>
        </button>
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
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleInspectUser(user.id)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
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
    </div>
  );
}
