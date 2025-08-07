import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  UserX,
  User,
  Mail,
  Calendar,
  MoreVertical,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAllUsers,
  updateUserStatus,
  banUser,
} from "../../services/firestoreService";
import "../../style/UsersManagement.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [paginatedUsers, setPaginatedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filterUsers = () => {
      let filtered = users;

      // Filter out admin users
      filtered = filtered.filter((user) => user.role !== "admin");

      if (searchTerm) {
        filtered = filtered.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter((user) => user.status === statusFilter);
      }

      setFilteredUsers(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    };

    filterUsers();
  }, [users, searchTerm, statusFilter]);

  // Pagination effect
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [filteredUsers, currentPage, itemsPerPage]);

  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId, currentStatus) => {
    try {
      if (currentStatus === "banned") {
        // Reactivate the user
        await updateUserStatus(userId, "active");
        setUsers(
          users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: "active",
                  bannedAt: null,
                  banUntil: null,
                }
              : user
          )
        );
      } else {
        // Ban the user
        await banUser(userId, 30);
        setUsers(
          users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: "banned",
                  bannedAt: new Date(),
                  banUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error toggling user ban status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "#10b981", bg: "#d1fae5", text: "Active" },
      disabled: { color: "#ef4444", bg: "#fee2e2", text: "Disabled" },
      banned: { color: "#f59e0b", bg: "#fef3c7", text: "Banned" },
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span
        className="status-badge"
        style={{
          color: config.color,
          backgroundColor: config.bg,
        }}
      >
        {config.text}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Pagination functions
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredUsers.length);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-management">
      <div className="users-header">
        <h1>Users Management</h1>
        <p>Manage user accounts and permissions</p>
      </div>

      <div className="users-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-value">{filteredUsers.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredUsers.filter((u) => u.status === "disabled").length}
          </span>
          <span className="stat-label">Disabled</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredUsers.filter((u) => u.status === "banned").length}
          </span>
          <span className="stat-label">Banned</span>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="user-info">
                      <span className="user-name">
                        {user.name || "Unnamed User"}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="email-cell">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                </td>
                <td>{getStatusBadge(user.status || "active")}</td>
                <td>
                  <div className="date-cell">
                    <Calendar size={16} />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </td>
                <td>
                  <div className="actions-cell">
                    <button
                      className={`action-btn ${
                        user.status === "banned" ? "unban" : "ban"
                      }`}
                      onClick={() => handleToggleBan(user.id, user.status)}
                      title={
                        user.status === "banned"
                          ? "Reactivate User"
                          : "Ban User for 30 Days"
                      }
                      style={{
                        backgroundColor:
                          user.status === "banned" ? "#10b981" : "#f59e0b",
                        color: "white",
                      }}
                    >
                      {user.status === "banned" ? (
                        <User size={16} />
                      ) : (
                        <UserX size={16} />
                      )}
                    </button>

                    {user.status !== "disabled" ? (
                      <button
                        className="action-btn disable"
                        onClick={() => handleStatusChange(user.id, "disabled")}
                        title="Disable User"
                      >
                        <UserX size={16} />
                      </button>
                    ) : (
                      <button
                        className="action-btn enable"
                        onClick={() => handleStatusChange(user.id, "active")}
                        title="Enable User"
                      >
                        <User size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <User size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex} to {endIndex} of {filteredUsers.length} users
            </span>
          </div>
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;
                const shouldShow =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 2;

                if (!shouldShow) {
                  return page === currentPage - 3 ||
                    page === currentPage + 3 ? (
                    <span key={page} className="pagination-ellipsis">
                      ...
                    </span>
                  ) : null;
                }

                return (
                  <button
                    key={page}
                    className={`pagination-number ${
                      isCurrentPage ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
