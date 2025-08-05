import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Edit,
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
  updateUser,
  banUser,
} from "../../services/firestoreService";
import "../../style/UsersManagement.css";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      status: user.status || "active", // Ensure status has a default value
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      // Validate required fields
      if (!editingUser.name || !editingUser.email) {
        alert("Please fill in all required fields");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editingUser.email)) {
        alert("Please enter a valid email address");
        return;
      }

      // Prepare update data for basic info
      const basicUpdateData = {
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
      };

      const newStatus = editingUser.status || "active";

      console.log("Updating user with data:", {
        ...basicUpdateData,
        status: newStatus,
      });

      // Update basic user info first
      await updateUser(editingUser.id, basicUpdateData);

      // Handle status update - use banUser function for banned status
      if (newStatus === "banned") {
        await banUser(editingUser.id, 30); // Ban for 30 days by default
      } else {
        await updateUserStatus(editingUser.id, newStatus);
      }

      // Prepare the complete update data for state update
      const completeUpdateData = {
        ...basicUpdateData,
        status: newStatus,
      };

      // If user is being banned, add ban-related fields to the state update
      if (newStatus === "banned") {
        const bannedAt = new Date();
        const banUntil = new Date();
        banUntil.setDate(banUntil.getDate() + 30);

        completeUpdateData.bannedAt = bannedAt;
        completeUpdateData.banUntil = banUntil;
      }

      // Update the users state with the new data
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...completeUpdateData } : user
        )
      );

      setShowEditModal(false);
      setEditingUser(null);

      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
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
                      className="action-btn edit"
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
                    >
                      <Edit size={16} />
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

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingUser.name || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingUser.status || "active"}
                  onChange={(e) => {
                    console.log("Status changed to:", e.target.value);
                    setEditingUser({
                      ...editingUser,
                      status: e.target.value,
                    });
                  }}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveUser}>
                <Check size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
