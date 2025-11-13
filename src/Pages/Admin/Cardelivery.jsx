import { FaSearch, FaEye, FaPen, FaTrash, FaSpinner, FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
// API cần đăng nhập - dùng cho quản lý giao hàng khách hàng (Admin/Staff)
import { vehicleDeliveryAPI, orderAPI, inventoryAPI } from "../../services/API";
import "./Order.css";

export default function Cardelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    inventoryId: "",
    deliveryAddress: "",
    scheduledDate: "",
    status: "PENDING",
    notes: ""
  });

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
        (o.status === 'paid' || o.status === 'PAID' || o.paymentStatus === 'PAID') && 
        !deliveries.some(d => d.order?.orderId === o.orderId || d.orderId === o.orderId)
      );
      setOrders(eligibleOrders);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
    }
  };

  // Lấy danh sách tồn kho
  const fetchInventories = async () => {
    try {
      const res = await inventoryAPI.getInventories();
      const inventoriesData = res.data || [];
      setInventories(inventoriesData);
    } catch (err) {
      console.error("Lỗi khi lấy tồn kho:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    if (showPopup) {
      fetchOrders();
      fetchInventories();
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

  // Helper functions
  const getCustomerName = (order) => {
    if (order?.customer) {
      const customer = order.customer;
      if (customer.firstName && customer.lastName) {
        return `${customer.firstName} ${customer.lastName}`;
      }
      return customer.fullName || customer.name || "—";
    }
    if (order?.quotation?.customer) {
      const customer = order.quotation.customer;
      if (customer.firstName && customer.lastName) {
        return `${customer.firstName} ${customer.lastName}`;
      }
      return customer.fullName || customer.name || "—";
    }
    return "—";
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // 🔹 Xử lý khi nhấn "Xem"
  const handleView = async (delivery) => {
    try {
      const res = await vehicleDeliveryAPI.getDelivery(delivery.deliveryId);
      setSelectedDelivery(res.data || delivery);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết giao hàng:", err);
      setSelectedDelivery(delivery);
      setShowDetail(true);
    }
  };

  // Mở form thêm mới
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      orderId: "",
      inventoryId: "",
      deliveryAddress: "",
      scheduledDate: "",
      status: "PENDING",
      notes: ""
    });
    setError(null);
    setShowPopup(true);
  };

  // Mở form sửa
  const handleEdit = async (delivery) => {
    try {
      setIsEdit(true);
      const res = await vehicleDeliveryAPI.getDelivery(delivery.deliveryId);
      const fullDelivery = res.data || delivery;
      setFormData({
        orderId: fullDelivery.orderId || fullDelivery.order?.orderId || "",
        inventoryId: fullDelivery.inventoryId || fullDelivery.inventory?.inventoryId || "",
        deliveryAddress: fullDelivery.deliveryAddress || "",
        scheduledDate: fullDelivery.scheduledDate 
          ? fullDelivery.scheduledDate.split('T')[0] 
          : fullDelivery.expectedDeliveryDate 
            ? fullDelivery.expectedDeliveryDate.split('T')[0] 
            : "",
        status: fullDelivery.status || "PENDING",
        notes: fullDelivery.notes || ""
      });
      setSelectedDelivery(fullDelivery);
      setError(null);
      setShowPopup(true);
    } catch (err) {
      console.error("Lỗi khi load chi tiết giao hàng:", err);
      alert("Không thể tải chi tiết giao hàng!");
    }
  };

  // Lưu giao hàng
  const handleSave = async () => {
    if (!formData.orderId) {
      setError("Vui lòng chọn đơn hàng!");
      return;
    }
    if (!formData.deliveryAddress) {
      setError("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }
    if (!formData.scheduledDate) {
      setError("Vui lòng chọn ngày giao dự kiến!");
      return;
    }

    try {
      setError(null);
      const deliveryData = {
        orderId: formData.orderId,
        inventoryId: formData.inventoryId || null,
        deliveryAddress: formData.deliveryAddress,
        scheduledDate: formData.scheduledDate,
        status: formData.status,
        notes: formData.notes || null
      };

      if (isEdit && selectedDelivery?.deliveryId) {
        await vehicleDeliveryAPI.updateDelivery(selectedDelivery.deliveryId, deliveryData);
        alert("Cập nhật giao hàng thành công!");
      } else {
        await vehicleDeliveryAPI.createDelivery(deliveryData);
        alert("Tạo giao hàng thành công!");
      }
      
      setShowPopup(false);
      await fetchDeliveries();
    } catch (err) {
      console.error("Lỗi khi lưu giao hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể lưu giao hàng!";
      setError(errorMsg);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">
        Giao xe khách hàng
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách giao xe</h2>
          <p className="subtitle">{deliveries.length} đơn giao xe tổng cộng</p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
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
                      <button
                        className="icon-btn edit"
                        onClick={() => handleEdit(d)}
                        disabled={deleting === d.deliveryId}
                        title="Sửa giao hàng"
                      >
                        <FaEdit />
                      </button>
                      {d.status?.toLowerCase() === 'in_transit' && (
                        <button 
                          className="icon-btn confirm"
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
              <h3>{searchTerm ? 'Không tìm thấy' : 'Chưa có đơn giao xe'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup thêm/sửa giao xe */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>{isEdit ? "Sửa đơn giao xe" : "Thêm đơn giao xe mới"}</h2>
              <button className="popup-close" onClick={() => setShowPopup(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              {error && (
                <div className="error-banner" style={{ marginBottom: "16px" }}>
                  <FaExclamationCircle />
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label>Đơn hàng <span style={{ color: "red" }}>*</span></label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  disabled={isEdit}
                  required
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      {o.orderNumber || o.orderId} - {getCustomerName(o)} - {formatPrice(o.totalAmount)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tồn kho (nếu có)</label>
                <select
                  value={formData.inventoryId}
                  onChange={(e) => setFormData({ ...formData, inventoryId: e.target.value })}
                >
                  <option value="">-- Chọn tồn kho (tùy chọn) --</option>
                  {inventories.map((inv) => (
                    <option key={inv.inventoryId} value={inv.inventoryId}>
                      {inv.variant?.variantName || inv.inventoryId} - {inv.vin || "N/A"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Địa chỉ giao hàng <span style={{ color: "red" }}>*</span></label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Nhập địa chỉ giao hàng..."
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày giao dự kiến <span style={{ color: "red" }}>*</span></label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nhập ghi chú (nếu có)..."
                  rows="2"
                />
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-secondary" onClick={() => setShowPopup(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSave}>
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
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
