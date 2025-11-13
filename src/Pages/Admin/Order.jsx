import './Order.css'
import { FaSearch, FaEye, FaPen, FaTrash, FaSpinner, FaExclamationCircle, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { orderAPI } from "../../services/API";

export default function Order(){
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Lấy danh sách đơn hàng
  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderAPI.getOrders();
      setOrder(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng thành "${newStatus}" không?`)) return;
    try {
      setDeleting(orderId);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      await fetchOrder();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Xóa đơn hàng
  const handleDelete = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) return;
    try {
      setDeleting(orderId);
      await orderAPI.deleteOrder(orderId);
      await fetchOrder();
    } catch (err) {
      console.error("Lỗi khi xóa đơn hàng:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Tìm kiếm theo tên (real-time)
  const filteredOrders = order.filter((o) => {
    if (!o.quotation || !o.quotation.customer) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(keyword) ||
      o.quotation.customer.firstName?.toLowerCase().includes(keyword) ||
      o.quotation.customer.lastName?.toLowerCase().includes(keyword) ||
      o.status?.toLowerCase().includes(keyword)
    );
  });

  // Xử lý khi nhấn nút "Xem"
  const handleView = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending') || statusLower.includes('chờ')) return 'status-pending';
    if (statusLower.includes('confirmed') || statusLower.includes('xác nhận')) return 'status-confirmed';
    if (statusLower.includes('paid') || statusLower.includes('đã thanh toán')) return 'status-paid';
    if (statusLower.includes('delivered') || statusLower.includes('đã giao')) return 'status-delivered';
    if (statusLower.includes('completed') || statusLower.includes('hoàn tất')) return 'status-completed';
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return 'status-cancelled';
    return 'status-default';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending') || statusLower.includes('chờ')) return <FaClock />;
    if (statusLower.includes('confirmed') || statusLower.includes('xác nhận')) return <FaCheckCircle />;
    if (statusLower.includes('paid') || statusLower.includes('đã thanh toán')) return <FaCheckCircle />;
    if (statusLower.includes('delivered') || statusLower.includes('đã giao')) return <FaCheckCircle />;
    if (statusLower.includes('completed') || statusLower.includes('hoàn tất')) return <FaCheckCircle />;
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return <FaTimesCircle />;
    return <FaExclamationCircle />;
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">📦</span>
        Quản lý đơn hàng
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách đơn hàng</h2>
          <p className="subtitle">{order.length} đơn hàng tổng cộng</p>
        </div>
        <button className="btn-add" onClick={() => setShowPopup(true)}>
          <FaPen className="btn-icon" />
          Thêm đơn hàng
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo số đơn, khách hàng, trạng thái..."
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
          <button onClick={fetchOrder}>Thử lại</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredOrders.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>SỐ ĐƠN HÀNG</th>
                  <th>KHÁCH HÀNG</th>
                  <th>XE ĐẶT MUA</th>
                  <th>TỔNG TIỀN</th>
                  <th>TRẠNG THÁI</th>
                  <th>NGÀY ĐẶT HÀNG</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((c) => (
                  <tr key={c.orderId} className="table-row">
                    <td>
                      <span className="order-number">{c.orderNumber}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">
                          {c.quotation?.customer?.firstName || ''} {c.quotation?.customer?.lastName || ''}
                        </span>
                        {c.quotation?.customer?.email && (
                          <span className="customer-email">{c.quotation.customer.email}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <span className="vehicle-brand">
                          {c.quotation?.variant?.model?.brand?.brandName || 'N/A'}
                        </span>
                        <span className="vehicle-model">
                          {c.quotation?.variant?.model?.modelName || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="price-amount">
                        {c.quotation?.finalPrice?.toLocaleString('vi-VN') || '0'} ₫
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(c.status)}`}>
                        {getStatusIcon(c.status)}
                        <span>{c.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {c.orderDate ? new Date(c.orderDate).toLocaleDateString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(c)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      {c.status?.toLowerCase() === 'pending' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleUpdateStatus(c.orderId, 'confirmed')}
                          disabled={deleting === c.orderId}
                          title="Xác nhận đơn hàng"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      {c.status?.toLowerCase() === 'confirmed' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleUpdateStatus(c.orderId, 'paid')}
                          disabled={deleting === c.orderId}
                          title="Đánh dấu đã thanh toán"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      <button 
                        className="icon-btn delete" 
                        onClick={() => handleDelete(c.orderId)}
                        disabled={deleting === c.orderId}
                        title="Xóa đơn hàng"
                      >
                        {deleting === c.orderId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{searchTerm ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}</h3>
              <p>
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc' 
                  : 'Bắt đầu bằng cách tạo đơn hàng mới'}
              </p>
              {!searchTerm && (
                <button className="btn-primary" onClick={() => setShowPopup(true)}>
                  Tạo đơn hàng đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popup thêm đơn hàng */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thêm đơn hàng mới</h2>
            <p>(Chưa có form, chỉ là popup mẫu)</p>
            <button className="btn-close" onClick={() => setShowPopup(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết đặt hàng */}
      {showDetail && selectedOrder && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết đơn hàng</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số đơn hàng</span>
                    <span className="detail-value">{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${getStatusBadge(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span>{selectedOrder.status || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loại đơn hàng</span>
                    <span className="detail-value">{selectedOrder.orderType || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái thanh toán</span>
                    <span className="detail-value">{selectedOrder.paymentStatus || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái giao hàng</span>
                    <span className="detail-value">{selectedOrder.deliveryStatus || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày đặt hàng</span>
                    <span className="detail-value">
                      {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString("vi-VN") : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">
                      {selectedOrder.quotation?.customer?.firstName || ''} {selectedOrder.quotation?.customer?.lastName || ''}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedOrder.quotation?.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedOrder.quotation?.customer?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin xe</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Thương hiệu</span>
                    <span className="detail-value">
                      {selectedOrder.quotation?.variant?.model?.brand?.brandName || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dòng xe</span>
                    <span className="detail-value">
                      {selectedOrder.quotation?.variant?.model?.modelName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin thanh toán</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tổng tiền</span>
                    <span className="detail-value price-highlight">
                      {selectedOrder.totalAmount?.toLocaleString('vi-VN') || selectedOrder.quotation?.finalPrice?.toLocaleString('vi-VN') || '0'} ₫
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tiền đặt cọc</span>
                    <span className="detail-value">
                      {selectedOrder.depositAmount?.toLocaleString('vi-VN') || '0'} ₫
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Số tiền còn lại</span>
                    <span className="detail-value">
                      {selectedOrder.balanceAmount?.toLocaleString('vi-VN') || '0'} ₫
                    </span>
                  </div>
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
