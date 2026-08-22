import React, { useEffect, useState } from "react";
import api from "../../services/api";
import StatCards from "./StatCard";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState([]);

  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingMetric, setEditingMetric] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    category: "CARDIO",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, metricsResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/metrics"),
      ]);

      setUsers(usersResponse.data);
      setMetrics(metricsResponse.data);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);

      setError(
        err.response?.data?.error || "Failed to load administration data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);

      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to toggle user status:", err);

      setError(err.response?.data?.error || "Failed to update user status.");
    }
  };

  const openEditModal = (metric) => {
    setEditingMetric(metric);

    setFormData({
      name: metric.name || "",
      unit: metric.unit || "",
      category: metric.category || "CARDIO",
    });
  };

  const closeEditModal = () => {
    setEditingMetric(null);

    setFormData({
      name: "",
      unit: "",
      category: "CARDIO",
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateMetric = async (event) => {
    event.preventDefault();

    if (!editingMetric) {
      return;
    }

    try {
      await api.put(`/admin/metrics/${editingMetric.id}`, {
        name: formData.name,
        unit: formData.unit,
        category: formData.category,
      });

      closeEditModal();

      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to update metric:", err);

      setError(
        err.response?.data?.error || "Failed to update biometric metric."
      );
    }
  };

  const handleDeleteMetric = async (metricId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this metric?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/metrics/${metricId}`);

      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to delete metric:", err);

      setError(err.response?.data?.error || "Failed to delete metric.");
    }
  };

  const activeMetrics = metrics.length;

  const stats = [
    {
      label: "Total Users",
      value: users.length,
    },
    {
      label: "Active Metrics",
      value: activeMetrics,
    },
  ];

  if (loading) {
    return (
      <main className="admin-dashboard">
        <div className="admin-loading">Loading administration panel...</div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-eyebrow">SYSTEM ADMINISTRATION</p>

          <h1>Administration Panel</h1>

          <p>
            Manage users and biometric health standards across the HumaGraph
            system.
          </p>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      <StatCards stats={stats} />

      <section className="admin-panel">
        <div className="admin-tabs">
          <button
            type="button"
            className={activeTab === "users" ? "admin-tab active" : "admin-tab"}
            onClick={() => setActiveTab("users")}
          >
            User Roster
          </button>

          <button
            type="button"
            className={
              activeTab === "metrics" ? "admin-tab active" : "admin-tab"
            }
            onClick={() => setActiveTab("metrics")}
          >
            Biometric Standards
          </button>
        </div>

        {activeTab === "users" && (
          <section className="admin-section">
            <div className="section-heading">
              <div>
                <h2>User Roster</h2>
                <p>Manage registered accounts and account access.</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-email">{user.email}</div>
                        </td>

                        <td>
                          <span className="role-badge">{user.role}</span>
                        </td>

                        <td>
                          <span
                            className={
                              user.isActive
                                ? "status-badge status-active"
                                : "status-badge status-inactive"
                            }
                          >
                            {user.isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={
                              user.isActive
                                ? "table-action danger"
                                : "table-action"
                            }
                            onClick={() => handleToggleStatus(user.id)}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "metrics" && (
          <section className="admin-section">
            <div className="section-heading">
              <div>
                <h2>Biometric Standards</h2>
                <p>Manage the health metrics used by the application.</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Metric Name</th>
                    <th>Unit</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        No biometric metrics found.
                      </td>
                    </tr>
                  ) : (
                    metrics.map((metric) => (
                      <tr key={metric.id}>
                        <td>
                          <strong>{metric.name}</strong>
                        </td>

                        <td>{metric.unit}</td>

                        <td>
                          <span className="category-badge">
                            {metric.category}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-action"
                              onClick={() => openEditModal(metric)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="table-action danger"
                              onClick={() => handleDeleteMetric(metric.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>

      {editingMetric && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div
            className="metric-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="admin-eyebrow">BIOMETRIC STANDARD</p>

                <h2>Edit Metric</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateMetric}>
              <div className="form-group">
                <label htmlFor="metric-name">Name</label>

                <input
                  id="metric-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="metric-unit">Unit</label>

                <input
                  id="metric-unit"
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="metric-category">Category</label>

                <select
                  id="metric-category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                >
                  <option value="CARDIO">CARDIO</option>

                  <option value="METABOLIC">METABOLIC</option>

                  <option value="FITNESS">FITNESS</option>

                  <option value="SLEEP">SLEEP</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
