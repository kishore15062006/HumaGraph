import React from "react";

const SearchFilterBar = ({
  searchQuery = "",
  filterByStatus = "ALL",
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className="search-filter-bar">
      {/* Search */}
      <div className="search-box">
        <span className="search-icon">⌕</span>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search health readings..."
          aria-label="Search health readings"
        />

        {searchQuery && (
          <button
            type="button"
            className="search-clear"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="status-filter">
        <label htmlFor="health-status-filter">Status</label>

        <select
          id="health-status-filter"
          value={filterByStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="NORMAL">Normal</option>
          <option value="OUT_OF_BOUNDS">Out of Bounds</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilterBar;