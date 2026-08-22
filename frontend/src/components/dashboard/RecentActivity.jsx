import React from "react";
import "../../styles/HealthComponent.css";

const RecentActivity = ({ items }) => {
    return (
        <div className="recent-activity-card">
            <div className="activity-header">
                <div>
                    <p className="chart-eyebrow">HEALTH TIMELINE</p>
                    <h2>Recent Activity</h2>
                </div>
            </div>

            {!items || items.length === 0 ? (
                <div className="activity-empty">
                    No recent health activity.
                </div>
            ) : (
                <ul className="timeline-list">
                    {items.map((item, index) => {
                        const date = new Date(item.recordedAt);

                        return (
                            <li
                                className="timeline-item"
                                key={`${item.recordedAt}-${index}`}
                            >
                                <div className="timeline-marker">
                                    <span />
                                </div>

                                <div className="timeline-content">
                                    <time>
                                        {isNaN(date.getTime())
                                            ? item.recordedAt
                                            : date.toLocaleString()}
                                    </time>

                                    <p>{item.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default RecentActivity;