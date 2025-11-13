import { FaSearch, FaEye, FaPen, FaTrash, FaSpinner, FaExclamationCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vehicleDeliveryAPI, orderAPI } from "../../services/API";
import "./Order.css";

export default function Cardelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // 🔹 Lấy danh sách giao xe
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await vehicleDeliveryAPI.getDeliveries();
      setDeliveries(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách giao xe:", err);
      setError("Không thể tải danh sách giao xe. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đơn hàng để tạo giao hàng
  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      const ordersData = res.data || [];
      // Chỉ lấy đơn hàng đã thanh toán và chưa có giao hàng
      const eligibleOrders = ordersData.filter(o => 
        (o.status === 'paid' || o.status === 'PAID') && 
        !deliveries.some(d => d.order?.orderId === o.orderId)
      );
      setOrders(eligibleOrders);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    if (showPopup) {
      fetchOrders();
    }
  }, [showPopup]);

  // 🔹 Xoá giao xe
  const handleDelete = async (deliveryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn giao xe này không?")) return;
    try {
      setDeleting(deliveryId);
      await vehicleDeliveryAPI.deleteDelivery(deliveryId);
      alert("Xóa giao xe thành công!");
      await fetchDeliveries();
    } catch (err) {
      console.error("Lỗi khi xóa giao xe:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Xác nhận giao hàng
  const handleConfirmDelivery = async (deliveryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xác nhận đã giao hàng không?")) return;
    try {
      setDeleting(deliveryId);
      await vehicleDeliveryAPI.confirmDelivery(deliveryId);
      alert("Xác nhận giao hàng thành công!");
      await fetchDeliveries();
    } catch (err) {
      console.error("Lỗi khi xác nhận giao hàng:", err);
      alert("Xác nhận thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // 🔹 Lọc tìm kiếm theo khách hàng hoặc trạng thái
  const filteredDeliveries = deliveries.filter((d) => {
    if (!d) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (d.deliveryNumber && String(d.deliveryNumber).toLowerCase().includes(keyword)) ||
      (d.order?.quotation?.customer?.firstName && String(d.order.quotation.customer.firstName).toLowerCase().includes(keyword)) ||
      (d.order?.quotation?.customer?.lastName && String(d.order.quotation.customer.lastName).toLowerCase().includes(keyword)) ||
      (d.status && String(d.status).toLowerCase().includes(keyword)) ||
      (d.deliveryAddress && String(d.deliveryAddress).toLowerCase().includes(keyword))
    );
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending') || statusLower.includes('chờ')) return 'status-pending';
    if (statusLower.includes('in_transit') || statusLower.includes('đang vận chuyển')) return 'status-confirmed';
    if (statusLower.includes('delivered') || statusLower.includes('đã giao')) return 'status-completed';
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return 'status-cancelled';
    return 'status-default';
  };

  // 🔹 Xử lý khi nhấn “Xem”
  const handleView = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetail(true);
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">🚚</span>
        Quản lý giao xe
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách giao xe</h2>
          <p className="subtitle">{deliveries.length} đơn giao xe tổng cộng</p>
        </div>
        <button className="btn-add" onClick={() => setShowPopup(true)}>
          <FaPen className="btn-icon" />
          Tạo đơn giao xe
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm giao xe..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchDeliveries}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách giao xe...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredDeliveries.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>SỐ GIAO XE</th>
                  <th>ĐƠN HÀNG</th>
                  <th>KHÁCH HÀNG</th>
                  <th>XE</th>
                  <th>ĐỊA CHỈ GIAO</th>
                  <th>TRẠNG THÁI</th>
                  <th>NGÀY GIAO DỰ KIẾN</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((d) => (
                  <tr key={d.deliveryId}>
                    <td>{d.deliveryNumber || d.deliveryId || "—"}</td>
                    <td>{d.order?.orderNumber || d.orderId || "—"}</td>
                    <td>
                      {d.order?.quotation?.customer
                        ? `${d.order.quotation.customer.firstName || ''} ${d.order.quotation.customer.lastName || ''}`
                        : "—"}
                    </td>
                    <td>
                      {d.inventory?.variant?.variantName || 
                       d.vehicle?.variant?.variantName ||
                       d.variant?.variantName || "—"}
                    </td>
                    <td>{d.deliveryAddress || "—"}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(d.status)}`}>
                        {d.status || "—"}
                      </span>
                    </td>
                    <td>
                      {d.scheduledDate || d.expectedDeliveryDate
                        ? new Date(d.scheduledDate || d.expectedDeliveryDate).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="action-buttons">
                      <button
                        className="icon-btn view"
                        onClick={() => handleView(d)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      {d.status?.toLowerCase() === 'in_transit' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleConfirmDelivery(d.deliveryId)}
                          disabled={deleting === d.deliveryId}
                          title="Xác nhận đã giao"
                        >
                          {deleting === d.deliveryId ? <FaSpinner className="spinner-small" /> : <FaCheckCircle />}
                        </button>
                      )}
                      <button
                        className="icon-btn delete"
                        onClick={() => handleDelete(d.deliveryId)}
                        disabled={deleting === d.deliveryId}
                        title="Xóa"
                      >
                        {deleting === d.deliveryId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{searchTerm ? 'Không tìm thấy đơn giao xe' : 'Chưa có đơn giao xe nào'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup thêm giao xe */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thêm đơn giao xe mới</h2>
            <p>(Chưa có form, chỉ là popup mẫu)</p>
            <button className="btn-close" onClick={() => setShowPopup(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedDelivery && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết đơn giao xe</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin giao hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số giao xe</span>
                    <span className="detail-value">{selectedDelivery.deliveryNumber || selectedDelivery.deliveryId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${getStatusBadge(selectedDelivery.status)}`}>
                      {selectedDelivery.status || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Địa chỉ giao</span>
                    <span className="detail-value">{selectedDelivery.deliveryAddress || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày giao dự kiến</span>
                    <span className="detail-value">
                      {selectedDelivery.scheduledDate || selectedDelivery.expectedDeliveryDate
                        ? new Date(selectedDelivery.scheduledDate || selectedDelivery.expectedDeliveryDate).toLocaleDateString("vi-VN")
                        : 'N/A'}
                    </span>
                  </div>
                  {selectedDelivery.deliveredDate && (
                    <div className="detail-item">
                      <span className="detail-label">Ngày giao thực tế</span>
                      <span className="detail-value">
                        {new Date(selectedDelivery.deliveredDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số đơn hàng</span>
                    <span className="detail-value">{selectedDelivery.order?.orderNumber || selectedDelivery.orderId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">
                      {selectedDelivery.order?.quotation?.customer
                        ? `${selectedDelivery.order.quotation.customer.firstName || ''} ${selectedDelivery.order.quotation.customer.lastName || ''}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">
                      {selectedDelivery.order?.quotation?.customer?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">
                      {selectedDelivery.order?.quotation?.customer?.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin xe</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Phiên bản</span>
                    <span className="detail-value">
                      {selectedDelivery.inventory?.variant?.variantName || 
                       selectedDelivery.vehicle?.variant?.variantName ||
                       selectedDelivery.variant?.variantName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-primary" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
