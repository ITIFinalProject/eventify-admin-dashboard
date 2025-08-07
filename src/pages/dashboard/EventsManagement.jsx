import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Clock,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllEvents, deleteEvent } from "../../services/firestoreService";
import "../../style/EventsManagement.css";

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [paginatedEvents, setPaginatedEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const filterEvents = () => {
      let filtered = events;

      if (searchTerm) {
        filtered = filtered.filter(
          (event) =>
            event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (typeFilter !== "all") {
        filtered = filtered.filter(
          (event) => event.type?.toLowerCase() === typeFilter.toLowerCase()
        );
      }

      setFilteredEvents(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    };
    filterEvents();
  }, [events, searchTerm, typeFilter]);

  // Pagination effect
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedEvents(filteredEvents.slice(startIndex, endIndex));
  }, [filteredEvents, currentPage, itemsPerPage]);

  const fetchEvents = async () => {
    try {
      const eventsData = await getAllEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (event) => {
    setViewingEvent(event);
    setShowViewModal(true);
  };

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(deletingEvent.id);
      setEvents(events.filter((event) => event.id !== deletingEvent.id));
      setShowDeleteModal(false);
      setDeletingEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const openDeleteModal = (event) => {
    setDeletingEvent(event);
    setShowDeleteModal(true);
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      public: { color: "#10b981", bg: "#d1fae5", text: "Public" },
      private: { color: "#f59e0b", bg: "#fef3c7", text: "Private" },
    };

    const normalizedType = type?.toLowerCase() || "public";
    const config = typeConfig[normalizedType] || typeConfig.public;

    return (
      <span
        className="type-badge"
        style={{
          color: config.color,
          backgroundColor: config.bg,
        }}
      >
        {type || "Public"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Handle the date format like "2025-08-04 _ 2025-08-05"
    if (typeof dateString === "string" && dateString.includes("_")) {
      const dates = dateString.split("_").map((d) => d.trim());
      return dates[0] + (dates[1] ? ` to ${dates[1]}` : "");
    }
    // Handle timestamp objects
    if (dateString.toDate) {
      const date = dateString.toDate();
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
    // Handle regular date strings
    return dateString;
  };

  // Pagination functions
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredEvents.length);

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
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="events-management">
      <div className="events-header">
        <h1>Events Management</h1>
        <p>Manage all events (Public & Private)</p>
      </div>

      <div className="events-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search events by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={20} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      <div className="events-stats">
        <div className="stat-item">
          <span className="stat-value">{filteredEvents.length}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {
              filteredEvents.filter((e) => e.type?.toLowerCase() === "public")
                .length
            }
          </span>
          <span className="stat-label">Public</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {
              filteredEvents.filter((e) => e.type?.toLowerCase() === "private")
                .length
            }
          </span>
          <span className="stat-label">Private</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredEvents.reduce(
              (sum, event) => sum + (event.currentAttendees || 0),
              0
            )}
          </span>
          <span className="stat-label">Total Attendees</span>
        </div>
      </div>

      <div className="events-grid">
        {paginatedEvents.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <div className="event-title-section">
                <h3 className="event-title">{event.title}</h3>
                {getTypeBadge(event.type)}
              </div>
              <div className="event-actions">
                <button
                  className="action-btn view"
                  title="View Details"
                  onClick={() => handleViewEvent(event)}
                >
                  <Eye size={16} />
                </button>

                <button
                  className="action-btn delete"
                  onClick={() => openDeleteModal(event)}
                  title="Delete Event"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="event-content">
              <p className="event-description">
                {event.description?.length > 100
                  ? event.description.substring(0, 100) + "..."
                  : event.description || "No description available"}
              </p>

              <div className="event-details">
                <div className="event-detail">
                  <Calendar size={16} />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="event-detail">
                  <Clock size={16} />
                  <span>{event.time || "No time specified"}</span>
                </div>
                <div className="event-detail">
                  <MapPin size={16} />
                  <span>{event.location || "No location specified"}</span>
                </div>
                <div className="event-detail">
                  <Users size={16} />
                  <span>
                    {event.currentAttendees || 0} /{" "}
                    {event.capacity || "Unlimited"}
                  </span>
                </div>
                {event.category && (
                  <div className="event-detail">
                    <span className="category-tag">{event.category}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="event-footer">
              <div className="event-organizer">
                <div className="organizer-avatar">
                  {event.hostName?.charAt(0).toUpperCase() || "H"}
                </div>
                <div className="organizer-info">
                  <span className="organizer-name">
                    {event.hostName || "Unknown Host"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="no-events">
          <Calendar size={48} />
          <h3>No events found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {startIndex} to {endIndex} of {filteredEvents.length}{" "}
              events
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingEvent && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h3>Delete Event</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <Trash2 size={48} color="#ef4444" />
                <h4>Are you sure you want to delete this event?</h4>
                <p>
                  <strong>{deletingEvent.title}</strong>
                </p>
                <p>
                  This action cannot be undone. All event data and attendee
                  information will be permanently removed.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteEvent}>
                <Trash2 size={16} />
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {showViewModal && viewingEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Event Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="event-view-content">
                <div className="form-group">
                  <label>Title</label>
                  <div className="view-field">{viewingEvent.title}</div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <div className="view-field">
                    {viewingEvent.description || "No description"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <div className="view-field">
                    {viewingEvent.location || "No location specified"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <div className="view-field">
                    {formatDate(viewingEvent.date)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <div className="view-field">
                    {viewingEvent.time || "No time specified"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <div className="view-field">
                    {getTypeBadge(viewingEvent.type)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <div className="view-field">
                    {viewingEvent.category || "No category"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Capacity</label>
                  <div className="view-field">
                    {viewingEvent.capacity || "Unlimited"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Current Attendees</label>
                  <div className="view-field">
                    {viewingEvent.currentAttendees || 0}
                  </div>
                </div>

                <div className="form-group">
                  <label>Host</label>
                  <div className="view-field">
                    {viewingEvent.hostName || "Unknown Host"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Host ID</label>
                  <div className="view-field">{viewingEvent.hostId}</div>
                </div>

                {viewingEvent.bannerUrl && (
                  <div className="form-group">
                    <label>Event Banner</label>
                    <div className="view-field">
                      <img
                        src={viewingEvent.bannerUrl}
                        alt="Event Banner"
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
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
