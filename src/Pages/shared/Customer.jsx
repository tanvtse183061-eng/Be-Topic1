import "./Customer.css";
import { FaSearch, FaEye, FaSpinner, FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
// API cần đăng nhập - dùng cho quản lý khách hàng (Admin/Staff)
import { customerAPI } from "../../services/API";

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📦 Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerAPI.getCustomers();
      setCustomers(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách khách hàng:", err);
      setError("Không thể tải danh sách khách hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔍 Tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchCustomers();
        return;
      }
      try {
        const res = await customerAPI.searchCustomers(trimmed);
        setCustomers(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // 👁️ Xem chi tiết
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">👥</span>
        Danh sách khách hàng
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách khách hàng</h2>
          <p className="subtitle">{customers.length} khách hàng tổng cộng</p>
        </div>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="search-clear" 
            onClick={() => setSearchTerm("")}
            title="Xóa tìm kiếm"
          >
            <FaTimesCircle />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchCustomers}>Thử lại</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách khách hàng...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {customers.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>HỌ TÊN</th>
                  <th>EMAIL</th>
                  <th>ĐIỆN THOẠI</th>
                  <th>THÀNH PHỐ</th>
                  <th>TỈNH</th>
                  <th>ĐIỂM TÍN DỤNG</th>
                  <th>NGÀY SINH</th>
                  <th>NGÀY TẠO</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.customerId} className="table-row">
                    <td>
                      <span className="customer-name">{c.firstName} {c.lastName}</span>
                    </td>
                    <td>{c.email || '—'}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.city || '—'}</td>
                    <td>{c.province || '—'}</td>
                    <td>
                      <span className="credit-score">{c.creditScore || 0}</span>
                    </td>
                    <td>{formatDate(c.dateOfBirth)}</td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(c)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>{searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}</h3>
              <p>
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc' 
                  : 'Danh sách khách hàng trống'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedCustomer && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết khách hàng</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin cá nhân</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedCustomer.email || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedCustomer.phone || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày sinh</span>
                    <span className="detail-value">{formatDate(selectedCustomer.dateOfBirth)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Địa chỉ</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="detail-label">Địa chỉ</span>
                    <span className="detail-value">{selectedCustomer.address || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Thành phố</span>
                    <span className="detail-value">{selectedCustomer.city || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tỉnh</span>
                    <span className="detail-value">{selectedCustomer.province || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mã bưu điện</span>
                    <span className="detail-value">{selectedCustomer.postalCode || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khác</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Điểm tín dụng</span>
                    <span className="detail-value credit-score">
                      {selectedCustomer.creditScore || 0}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Liên hệ qua</span>
                    <span className="detail-value">{selectedCustomer.preferredContactMethod || '—'}</span>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Ghi chú</span>
                      <span className="detail-value">{selectedCustomer.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-primary" onClick={() => setShowDetail(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

