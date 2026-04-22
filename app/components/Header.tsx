import { Search, X, Upload } from "lucide-react";

interface HeaderProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  isLoggedIn: boolean;
  username?: string;
  isAdmin?: boolean;
}

export function Header({ 
  searchInput, 
  onSearchInputChange, 
  onSearch, 
  onClearSearch, 
  isLoggedIn, 
  username,
  isAdmin = false
}: HeaderProps) {
  
  const handleUploadClick = () => {
    // Navigate to admin page
    window.location.href = '/admin';
  };

  return (
    <div className="header">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search on Frozen Beats... (Press Enter)"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch();
            }
          }}
          className="search-input"
        />
        {searchInput && (
          <button onClick={onClearSearch} className="clear-search">
            <X className="clear-icon" />
          </button>
        )}
      </div>
      <div className="user-section">
        {/* Upload button for admin - navigates to /admin */}
        {isAdmin && (
          <button onClick={handleUploadClick} className="upload-button" title="Admin Panel">
            <Upload size={18} />
            <span>Upload</span>
          </button>
        )}
        <div className="user-greeting">
          <p className="welcome-text">Welcome back</p>
          <p className="user-name">
            {isLoggedIn ? username : "❄️ Guest"}
          </p>
        </div>
      </div>
    </div>
  );
}