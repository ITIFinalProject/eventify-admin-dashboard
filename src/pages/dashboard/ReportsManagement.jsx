import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  Eye,
  MessageSquare,
  UserX,
  Trash2,
  Check,
  X,
  Calendar,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getAllReports,
  updateReportStatus,
  banUser,
  deleteEvent,
} from "../../services/firestoreService";
import "../../style/ReportsManagement.css";

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);
  const [paginatedReports, setPaginatedReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const filterReports = () => {
      let filtered = reports;

      if (searchTerm) {
        filtered = filtered.filter(
          (report) =>
            report.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            report.eventTitle
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            report.reporterName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter((report) => report.status === statusFilter);
      }

      setFilteredReports(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    };

    filterReports();
  }, [reports, searchTerm, statusFilter]);

  // Pagination effect
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedReports(filteredReports.slice(startIndex, endIndex));
  }, [filteredReports, currentPage, itemsPerPage]);

  const fetchReports = async () => {
    try {
      const reportsData = await getAllReports();
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewEvent = async (reportId) => {
    try {
      await updateReportStatus(reportId, "resolved", "review_event");
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? { ...report, status: "resolved", action: "review_event" }
            : report
        )
      );
      setShowActionModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error marking event for review:", error);
    }
  };

  const handleBanUser = async (reportId, userId) => {
    try {
      await Promise.all([
        banUser(userId, 30), // Ban for 30 days
        updateReportStatus(reportId, "resolved", "user_banned"),
      ]);

      setReports(
        reports.map((report) =>
          report.id === reportId
            ? { ...report, status: "resolved", action: "user_banned" }
            : report
        )
      );
      setShowActionModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const handleDeleteEvent = async (reportId, eventId) => {
    try {
      await Promise.all([
        deleteEvent(eventId),
        updateReportStatus(reportId, "resolved", "event_deleted"),
      ]);

      setReports(
        reports.map((report) =>
          report.id === reportId
            ? { ...report, status: "resolved", action: "event_deleted" }
            : report
        )
      );
      setShowActionModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleRejectReport = async (reportId) => {
    try {
      await updateReportStatus(reportId, "rejected", "no_action");
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? { ...report, status: "rejected", action: "no_action" }
            : report
        )
      );
      setShowActionModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error rejecting report:", error);
    }
  };

  const openActionModal = (report, action) => {
    setSelectedReport(report);
    setActionType(action);
    setShowActionModal(true);
  };

  const openViewModal = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#f59e0b", bg: "#fef3c7", text: "Pending" },
      resolved: { color: "#10b981", bg: "#d1fae5", text: "Resolved" },
      rejected: { color: "#6b7280", bg: "#f3f4f6", text: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;

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

  const getActionBadge = (action) => {
    if (!action || action === "no_action") return null;

    const actionConfig = {
      review_event: { color: "#3b82f6", bg: "#dbeafe", text: "Event Reviewed" },
      user_banned: { color: "#ef4444", bg: "#fee2e2", text: "User Banned" },
      event_deleted: { color: "#dc2626", bg: "#fecaca", text: "Event Deleted" },
    };

    const config = actionConfig[action];
    if (!config) return null;

    return (
      <span
        className="action-badge"
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
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Pagination functions
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredReports.length);

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
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-management">
      <div className="reports-header">
        <h1>Reports & Moderation</h1>
        <p>Review and take action on user reports</p>
      </div>

      <div className="reports-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search reports by reason, description, or event..."
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
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="reports-stats">
        <div className="stat-item">
          <span className="stat-value">{filteredReports.length}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredReports.filter((r) => r.status === "pending").length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredReports.filter((r) => r.status === "resolved").length}
          </span>
          <span className="stat-label">Resolved</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredReports.filter((r) => r.action === "user_banned").length}
          </span>
          <span className="stat-label">Users Banned</span>
        </div>
      </div>

      <div className="reports-grid">
        {paginatedReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-title-section">
                <div className="report-type">
                  <AlertTriangle size={20} />
                  <span>{report.reason || "Generic Report"}</span>
                </div>
                <div className="report-badges">
                  {getStatusBadge(report.status)}
                  {getActionBadge(report.action)}
                </div>
              </div>
              <div className="report-date">
                <Calendar size={16} />
                <span>{formatDate(report.createdAt)}</span>
              </div>
            </div>

            <div className="report-content">
              <div className="reported-event">
                <h4>Reported Event</h4>
                <p>{report.eventTitle || "Event title not available"}</p>
              </div>

              <div className="report-description">
                <h4>Report Description</h4>
                <p>{report.description || "No description provided"}</p>
                {report.evidenceImageUrl && (
                  <div className="evidence-image">
                    <h5>Evidence Image</h5>
                    <img
                      src={report.evidenceImageUrl}
                      alt="Evidence"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        marginTop: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="report-details">
                <div className="reporter-info">
                  <User size={16} />
                  <span>Reporter: {report.reporterName || "Anonymous"}</span>
                </div>
                <div className="reported-user-info">
                  <UserX size={16} />
                  <span>
                    Event Host ID: {report.eventHostId?.slice(0, 10) || "N/A"}
                    ...
                  </span>
                </div>
              </div>
            </div>

            {report.status === "pending" && (
              <div className="report-actions">
                <button
                  className="action-btn view"
                  onClick={() => openViewModal(report)}
                  title="View Report Details"
                >
                  <Eye size={16} />
                  <span>View Report</span>
                </button>
                <button
                  className="action-btn ban"
                  onClick={() => openActionModal(report, "ban")}
                  title="Ban User"
                >
                  <UserX size={16} />
                  <span>Ban User</span>
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => openActionModal(report, "delete")}
                  title="Delete Event"
                >
                  <Trash2 size={16} />
                  <span>Delete Event</span>
                </button>
                <button
                  className="action-btn reject"
                  onClick={() => openActionModal(report, "reject")}
                  title="Reject Report"
                >
                  <X size={16} />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="no-reports">
          <Shield size={48} />
          <h3>No reports found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Pagination */}
      {filteredReports.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex} to {endIndex} of {filteredReports.length}{" "}
              reports
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

      {/* Action Confirmation Modal */}
      {showActionModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Action</h3>
              <button
                className="modal-close"
                onClick={() => setShowActionModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="action-confirmation">
                {actionType === "review" && (
                  <>
                    <Eye size={48} color="#3b82f6" />
                    <h4>Review Event</h4>
                    <p>
                      This will mark the event for review and resolve the
                      report.
                    </p>
                    <div className="report-summary">
                      <strong>Reported Event:</strong>{" "}
                      {selectedReport.eventTitle}
                      <br />
                      <strong>Host ID:</strong> {selectedReport.eventHostId}
                    </div>
                  </>
                )}

                {actionType === "ban" && (
                  <>
                    <UserX size={48} color="#ef4444" />
                    <h4>Ban User (30 Days)</h4>
                    <p>
                      This will ban the reported user for 30 days and mark the
                      report as resolved.
                    </p>
                    <div className="report-summary">
                      <strong>User to ban:</strong> {selectedReport.eventHostId}
                      <br />
                      <strong>Reason:</strong> {selectedReport.reason}
                    </div>
                  </>
                )}

                {actionType === "delete" && (
                  <>
                    <Trash2 size={48} color="#dc2626" />
                    <h4>Delete Event</h4>
                    <p>
                      This will permanently delete the reported event and mark
                      the report as resolved.
                    </p>
                    <div className="report-summary">
                      <strong>Event to delete:</strong>{" "}
                      {selectedReport.eventTitle}
                      <br />
                      <strong>Event Host:</strong> {selectedReport.eventHostId}
                    </div>
                  </>
                )}

                {actionType === "reject" && (
                  <>
                    <X size={48} color="#6b7280" />
                    <h4>Reject Report</h4>
                    <p>
                      This will mark the report as rejected with no action
                      taken.
                    </p>
                    <div className="report-summary">
                      <strong>Report:</strong> {selectedReport.reason}
                      <br />
                      <strong>Event:</strong> {selectedReport.eventTitle}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowActionModal(false)}
              >
                Cancel
              </button>
              <button
                className={`btn ${
                  actionType === "review"
                    ? "btn-primary"
                    : actionType === "ban"
                    ? "btn-danger"
                    : actionType === "delete"
                    ? "btn-danger"
                    : "btn-secondary"
                }`}
                onClick={() => {
                  if (actionType === "review") {
                    handleReviewEvent(selectedReport.id);
                  } else if (actionType === "ban") {
                    handleBanUser(
                      selectedReport.id,
                      selectedReport.eventHostId
                    );
                  } else if (actionType === "delete") {
                    handleDeleteEvent(
                      selectedReport.id,
                      selectedReport.eventId
                    );
                  } else if (actionType === "reject") {
                    handleRejectReport(selectedReport.id);
                  }
                }}
              >
                <Check size={16} />
                Confirm{" "}
                {actionType === "review"
                  ? "Review"
                  : actionType === "ban"
                  ? "Ban"
                  : actionType === "delete"
                  ? "Delete"
                  : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Report Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="report-details-view">
                <div className="detail-section">
                  <div className="detail-row">
                    <strong>Report ID:</strong>
                    <span>{selectedReport.id}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                  <div className="detail-row">
                    <strong>Report Date:</strong>
                    <span>{formatDate(selectedReport.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Reason:</strong>
                    <span>{selectedReport.reason || "Generic Report"}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Reported Event Information</h4>
                  <div className="detail-row">
                    <strong>Event Title:</strong>
                    <span>
                      {selectedReport.eventTitle || "Event title not available"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Event ID:</strong>
                    <span>{selectedReport.eventId || "N/A"}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Event Host ID:</strong>
                    <span>{selectedReport.eventHostId || "N/A"}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Reporter Information</h4>
                  <div className="detail-row">
                    <strong>Reporter Name:</strong>
                    <span>{selectedReport.reporterName || "Anonymous"}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Reporter ID:</strong>
                    <span>{selectedReport.reporterId || "N/A"}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Report Description</h4>
                  <div className="description-content">
                    <p>
                      {selectedReport.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {selectedReport.evidenceImageUrl && (
                  <div className="detail-section">
                    <h4>Evidence Image</h4>
                    <div className="evidence-image-full">
                      <img
                        src={selectedReport.evidenceImageUrl}
                        alt="Evidence"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedReport.action && (
                  <div className="detail-section">
                    <h4>Action Taken</h4>
                    <div className="detail-row">
                      <strong>Action:</strong>
                      {getActionBadge(selectedReport.action)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              {selectedReport.status === "pending" && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowViewModal(false);
                      openActionModal(selectedReport, "review");
                    }}
                  >
                    <Check size={16} />
                    Mark as Reviewed
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setShowViewModal(false);
                      openActionModal(selectedReport, "ban");
                    }}
                  >
                    <UserX size={16} />
                    Ban User
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setShowViewModal(false);
                      openActionModal(selectedReport, "delete");
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Event
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowViewModal(false);
                      openActionModal(selectedReport, "reject");
                    }}
                  >
                    <X size={16} />
                    Reject Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
