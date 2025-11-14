import { FaSearch, FaEye, FaPen, FaTrash, FaSpinner, FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { customerPaymentAPI, orderAPI } from "../../services/API";

export default function PaymentCustomer() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách thanh toán
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerPaymentAPI.getPayments();
      setPayments(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thanh toán:", err);
      setError("Không thể tải danh sách thanh toán. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Lọc tìm kiếm
  const filteredPayments = payments.filter((p) => {
    if (!p) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (p.paymentNumber && String(p.paymentNumber).toLowerCase().includes(keyword)) ||
      (p.customer?.firstName && String(p.customer.firstName).toLowerCase().includes(keyword)) ||
      (p.customer?.lastName && String(p.customer.lastName).toLowerCase().includes(keyword)) ||
      (p.order?.orderNumber && String(p.order.orderNumber).toLowerCase().includes(keyword)) ||
      (p.status && String(p.status).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowDetail(true);
  };

  // Xác nhận thanh toán (chuyển từ pending sang completed)
  const handleConfirmPayment = async (paymentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xác nhận thanh toán này?\n\nSau khi xác nhận, trạng thái sẽ chuyển sang 'completed' và đơn hàng sẽ được cập nhật.")) return;
    
    try {
      await customerPaymentAPI.updatePaymentStatus(paymentId, "completed");
      alert("✅ Xác nhận thanh toán thành công!");
      fetchPayments();
      // Đóng popup nếu đang xem chi tiết payment này
      if (showDetail && selectedPayment && (selectedPayment.paymentId || selectedPayment.id) === paymentId) {
        setShowDetail(false);
        setSelectedPayment(null);
      }
    } catch (err) {
      console.error("❌ Lỗi khi xác nhận thanh toán:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể xác nhận thanh toán!";
      alert(`❌ Xác nhận thanh toán thất bại!\n\n${errorMsg}`);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý thanh toán</div>

      <div className="title2-customer">
        <h2>Danh sách thanh toán</h2>
        <h3>+ Thêm thanh toán</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm thanh toán..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={fetchPayments}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách thanh toán...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>MÃ THANH TOÁN</th>
                <th>KHÁCH HÀNG</th>
                <th>ĐƠN HÀNG</th>
                <th>SỐ TIỀN</th>
                <th>LOẠI</th>
                <th>PHƯƠNG THỨC</th>
                <th>TRẠNG THÁI</th>
                <th>NGÀY THANH TOÁN</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.paymentId}>
                    <td>{p.paymentNumber || p.paymentId}</td>
                    <td>
                      {p.customer?.firstName || ''} {p.customer?.lastName || ''}
                      <br />
                      <small style={{ color: "#6b7280" }}>{p.customer?.email || 'N/A'}</small>
                    </td>
                    <td>{p.order?.orderNumber || p.orderId || 'N/A'}</td>
                    <td>{p.amount ? p.amount.toLocaleString('vi-VN') : '0'} ₫</td>
                    <td>{p.paymentType || 'N/A'}</td>
                    <td>{p.paymentMethod || 'N/A'}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          p.status === "COMPLETED" || p.status === "completed" ? "completed" : 
                          p.status === "FAILED" || p.status === "failed" ? "failed" : "pending"
                        }`}
                      >
                        {p.status || 'N/A'}
                      </span>
                    </td>
                    <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("vi-VN") : 'N/A'}</td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(p)} title="Xem chi tiết">
                        <FaEye />
                      </button>
                      {(p.status === "pending" || p.status === "PENDING") && (
                        <button 
                          className="icon-btn approve" 
                          onClick={() => handleConfirmPayment(p.paymentId || p.id)}
                          title="Xác nhận thanh toán"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "#666" }}>
                    {searchTerm ? 'Không tìm thấy thanh toán' : 'Không có dữ liệu thanh toán'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedPayment && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết thanh toán</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>×</button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin thanh toán</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Mã thanh toán</span>
                    <span className="detail-value">{selectedPayment.paymentNumber || selectedPayment.paymentId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loại thanh toán</span>
                    <span className="detail-value">{selectedPayment.paymentType || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Số tiền</span>
                    <span className="detail-value price-highlight">
                      {selectedPayment.amount ? selectedPayment.amount.toLocaleString('vi-VN') : '0'} ₫
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phương thức</span>
                    <span className="detail-value">{selectedPayment.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${
                      selectedPayment.status === "COMPLETED" || selectedPayment.status === "completed" ? "completed" : 
                      selectedPayment.status === "FAILED" || selectedPayment.status === "failed" ? "failed" : "pending"
                    }`}>
                      {selectedPayment.status || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày thanh toán</span>
                    <span className="detail-value">
                      {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString("vi-VN") : 'N/A'}
                    </span>
                  </div>
                  {selectedPayment.referenceNumber && (
                    <div className="detail-item">
                      <span className="detail-label">Số tham chiếu</span>
                      <span className="detail-value">{selectedPayment.referenceNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">
                      {selectedPayment.customer?.firstName || ''} {selectedPayment.customer?.lastName || ''}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedPayment.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedPayment.customer?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số đơn hàng</span>
                    <span className="detail-value">{selectedPayment.order?.orderNumber || selectedPayment.orderId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedPayment.notes && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p>{selectedPayment.notes}</p>
                </div>
              )}
            </div>
            <div className="popup-footer">
              {(selectedPayment.status === "pending" || selectedPayment.status === "PENDING") && (
                <button 
                  className="btn-success" 
                  onClick={() => {
                    handleConfirmPayment(selectedPayment.paymentId || selectedPayment.id);
                  }}
                  style={{ marginRight: "10px" }}
                >
                  <FaCheck /> Xác nhận thanh toán
                </button>
              )}
              <button className="btn-primary" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
