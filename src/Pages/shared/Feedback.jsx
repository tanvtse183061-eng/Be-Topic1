import '../Admin/Order.css';
import { FaSearch, FaEye, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationCircle, FaReply } from "react-icons/fa";
import { useEffect, useState } from "react";
import { feedbackAPI } from "../../services/API";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);

  // Lấy danh sách phản hồi
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await feedbackAPI.getFeedbacks();
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy phản hồi:", err);
      setError("Không thể tải danh sách phản hồi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Phản hồi phản hồi
  const handleRespond = async () => {
    if (!responseText.trim()) {
      alert("Vui lòng nhập nội dung phản hồi!");
      return;
    }
    try {
      setProcessing(selectedFeedback.feedbackId);
      await feedbackAPI.respondFeedback(selectedFeedback.feedbackId, responseText);
      alert("Phản hồi thành công!");
      setShowRespondModal(false);
      setResponseText("");
      await fetchFeedbacks();
    } catch (err) {
      console.error("Lỗi khi phản hồi:", err);
      alert("Phản hồi thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Cập nhật trạng thái
  const handleUpdateStatus = async (feedbackId, newStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành "${newStatus}" không?`)) return;
    try {
      setProcessing(feedbackId);
      await feedbackAPI.updateStatus(feedbackId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      await fetchFeedbacks();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Tìm kiếm
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (!f) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (f.subject && String(f.subject).toLowerCase().includes(keyword)) ||
      (f.customerName && String(f.customerName).toLowerCase().includes(keyword)) ||
      (f.customerEmail && String(f.customerEmail).toLowerCase().includes(keyword)) ||
      (f.feedbackType && String(f.feedbackType).toLowerCase().includes(keyword)) ||
      (f.status && String(f.status).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetail(true);
  };

  // Mở modal phản hồi
  const handleOpenRespond = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText("");
    setShowRespondModal(true);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending') || statusLower.includes('chờ')) return 'status-pending';
    if (statusLower.includes('reviewed') || statusLower.includes('đã xem')) return 'status-confirmed';
    if (statusLower.includes('responded') || statusLower.includes('đã phản hồi')) return 'status-paid';
    if (statusLower.includes('resolved') || statusLower.includes('đã giải quyết')) return 'status-completed';
    if (statusLower.includes('closed') || statusLower.includes('đóng')) return 'status-completed';
    return 'status-default';
  };

  // Get feedback type display
  const getFeedbackTypeDisplay = (type) => {
    const typeMap = {
      'PRODUCT': 'Sản phẩm',
      'SERVICE': 'Dịch vụ',
      'DELIVERY': 'Giao hàng',
      'GENERAL': 'Chung'
    };
    return typeMap[type] || type || 'N/A';
  };

  // Get rating stars
  const getRatingStars = (rating) => {
    if (!rating) return 'N/A';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating) + ` (${rating}/5)`;
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">💬</span>
        Quản lý phản hồi
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách phản hồi</h2>
          <p className="subtitle">{feedbacks.length} phản hồi tổng cộng</p>
        </div>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề, khách hàng, loại, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchFeedbacks}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách phản hồi...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredFeedbacks.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>TIÊU ĐỀ</th>
                  <th>KHÁCH HÀNG</th>
                  <th>LOẠI</th>
                  <th>ĐÁNH GIÁ</th>
                  <th>TRẠNG THÁI</th>
                  <th>NGÀY GỬI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((f) => (
                  <tr key={f.feedbackId}>
                    <td>{f.subject || 'Không có tiêu đề'}</td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{f.customerName || 'N/A'}</span>
                        {f.customerEmail && (
                          <span className="customer-email">{f.customerEmail}</span>
                        )}
                      </div>
                    </td>
                    <td>{getFeedbackTypeDisplay(f.feedbackType)}</td>
                    <td>{getRatingStars(f.rating)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(f.status)}`}>
                        <span>{f.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(f)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      {f.status?.toLowerCase() === 'pending' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleUpdateStatus(f.feedbackId, 'reviewed')}
                          disabled={processing === f.feedbackId}
                          title="Đánh dấu đã xem"
                        >
                          {processing === f.feedbackId ? <FaSpinner className="spinner-small" /> : <FaCheckCircle />}
                        </button>
                      )}
                      {f.status?.toLowerCase() !== 'responded' && f.status?.toLowerCase() !== 'closed' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleOpenRespond(f)}
                          title="Phản hồi"
                        >
                          <FaReply />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>{searchTerm ? 'Không tìm thấy' : 'Chưa có phản hồi'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedFeedback && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết phản hồi</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin phản hồi</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tiêu đề</span>
                    <span className="detail-value">{selectedFeedback.subject || 'Không có tiêu đề'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loại</span>
                    <span className="detail-value">{getFeedbackTypeDisplay(selectedFeedback.feedbackType)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Đánh giá</span>
                    <span className="detail-value">{getRatingStars(selectedFeedback.rating)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${getStatusBadge(selectedFeedback.status)}`}>
                      <span>{selectedFeedback.status || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày gửi</span>
                    <span className="detail-value">
                      {selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString("vi-VN") : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">{selectedFeedback.customerName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedFeedback.customerEmail || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedFeedback.customerPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Nội dung phản hồi</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedFeedback.message || 'N/A'}</p>
              </div>

              {selectedFeedback.response && (
                <div className="detail-section">
                  <h3>Phản hồi từ hệ thống</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedFeedback.response}</p>
                </div>
              )}
            </div>
            <div className="popup-footer">
              <button className="btn-primary" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal phản hồi */}
      {showRespondModal && selectedFeedback && (
        <div className="popup-overlay" onClick={() => setShowRespondModal(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Phản hồi phản hồi</h2>
              <button className="popup-close" onClick={() => setShowRespondModal(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="form-group">
                <label>Nội dung phản hồi *</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows="5"
                  required
                  placeholder="Nhập nội dung phản hồi..."
                />
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-secondary" onClick={() => setShowRespondModal(false)}>Hủy</button>
              <button 
                className="btn-primary" 
                onClick={handleRespond}
                disabled={processing === selectedFeedback.feedbackId || !responseText.trim()}
              >
                {processing === selectedFeedback.feedbackId ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

