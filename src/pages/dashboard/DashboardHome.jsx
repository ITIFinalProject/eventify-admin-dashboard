import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, AlertTriangle, TrendingUp } from "lucide-react";
import {
  getAllUsers,
  getAllEvents,
  getAllReports,
} from "../../services/firestoreService";
import "../../style/DashboardHome.css";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalReports: 0,
    activeUsers: 0,
    publicEvents: 0,
    privateEvents: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, events, reports] = await Promise.all([
          getAllUsers(),
          getAllEvents(),
          getAllReports(),
        ]);

        const activeUsers = users.filter(
          (user) => user.status !== "banned" && user.status !== "disabled"
        ).length;
        const publicEvents = events.filter(
          (event) => event.type?.toLowerCase() === "public"
        ).length;
        const privateEvents = events.filter(
          (event) => event.type?.toLowerCase() === "private"
        ).length;
        const pendingReports = reports.filter(
          (report) => report.status === "pending"
        ).length;

        // Generate recent activity from the data
        const activities = [];

        // Add recent users (last 5)
        const recentUsers = users
          .filter((user) => user.createdAt)
          .sort(
            (a, b) =>
              new Date(
                b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt
              ) -
              new Date(
                a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt
              )
          )
          .slice(0, 2);

        recentUsers.forEach((user) => {
          activities.push({
            type: "user",
            icon: Users,
            iconClass: "users",
            message: `New user registered: ${
              user.displayName || user.email || "Unknown User"
            }`,
            timestamp: user.createdAt,
          });
        });

        // Add recent events (last 3)
        const recentEvents = events
          .filter((event) => event.createdAt)
          .sort(
            (a, b) =>
              new Date(
                b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt
              ) -
              new Date(
                a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt
              )
          )
          .slice(0, 2);

        recentEvents.forEach((event) => {
          const eventDate = event.date
            ? new Date(
                event.date?.seconds ? event.date.seconds * 1000 : event.date
              ).toLocaleDateString()
            : "No date set";
          const eventType = event.type ? `(${event.type})` : "";
          activities.push({
            type: "event",
            icon: Calendar,
            iconClass: "events",
            message: `New ${event.type || "event"} created: "${
              event.title || "Untitled Event"
            }" ${eventType} - ${eventDate}`,
            timestamp: event.createdAt,
          });
        });

        // Add recent reports (last 2)
        const recentReports = reports
          .filter((report) => report.createdAt)
          .sort(
            (a, b) =>
              new Date(
                b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt
              ) -
              new Date(
                a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt
              )
          )
          .slice(0, 1);

        recentReports.forEach((report) => {
          activities.push({
            type: "report",
            icon: AlertTriangle,
            iconClass: "reports",
            message: `New report submitted: ${
              report.reason || "Content violation"
            }`,
            timestamp: report.createdAt,
          });
        });

        // Sort all activities by timestamp and take the most recent 5
        const sortedActivities = activities
          .sort(
            (a, b) =>
              new Date(
                b.timestamp?.seconds ? b.timestamp.seconds * 1000 : b.timestamp
              ) -
              new Date(
                a.timestamp?.seconds ? a.timestamp.seconds * 1000 : a.timestamp
              )
          )
          .slice(0, 5);

        setRecentActivity(sortedActivities);

        setStats({
          totalUsers: users.length,
          totalEvents: events.length,
          totalReports: reports.length,
          activeUsers,
          publicEvents,
          privateEvents,
          pendingReports,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Function to format timestamp
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const date = timestamp?.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes > 0
        ? `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
        : "Just now";
    }
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case "users":
        navigate("/dashboard/users");
        break;
      case "events":
        navigate("/dashboard/events");
        break;
      case "reports":
        navigate("/dashboard/reports");
        break;
      default:
        break;
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "#3b82f6",
      subtitle: `${stats.activeUsers} active`,
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      color: "#10b981",
      subtitle: `${stats.publicEvents} public, ${stats.privateEvents} private`,
    },
    {
      title: "Reports",
      value: stats.totalReports,
      icon: AlertTriangle,
      color: "#f59e0b",
      subtitle: `${stats.pendingReports} pending review`,
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to the Eventify Admin Panel</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card">
              <div
                className="stat-icon"
                style={{
                  backgroundColor: `${card.color}20`,
                  color: card.color,
                }}
              >
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{card.value}</h3>
                <p className="stat-title">{card.title}</p>
                <span className="stat-subtitle">{card.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="activity-item">
                    <div className={`activity-icon ${activity.iconClass}`}>
                      <Icon size={16} />
                    </div>
                    <div className="activity-content">
                      <p>{activity.message}</p>
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="activity-item">
                <div className="activity-content">
                  <p>No recent activity</p>
                  <span>Check back later</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button
              className="action-button users"
              onClick={() => handleQuickAction("users")}
            >
              <Users size={20} />
              <span>Manage Users</span>
            </button>
            <button
              className="action-button events"
              onClick={() => handleQuickAction("events")}
            >
              <Calendar size={20} />
              <span>Manage Events</span>
            </button>
            <button
              className="action-button reports"
              onClick={() => handleQuickAction("reports")}
            >
              <AlertTriangle size={20} />
              <span>Review Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
