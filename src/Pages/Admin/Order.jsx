import './Order.css'
import { FaSearch, FaEye, FaPen, FaTrash, FaSpinner, FaExclamationCircle, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { orderAPI, customerPaymentAPI } from "../../services/API";

export default function Order(){
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  // Track các ID đã xóa để không hiển thị lại
  const [deletedOrderIds, setDeletedOrderIds] = useState(new Set());

  // Lấy danh sách đơn hàng (bao gồm cả đơn hàng từ DealerStaff)
  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderAPI.getOrders();
      console.log("📦 Raw response từ getOrders (Admin):", res);
      let ordersData = res.data?.data || res.data || [];
      console.log("📦 Orders data (Admin):", ordersData);
      console.log("📦 Total orders:", Array.isArray(ordersData) ? ordersData.length : 0);
      
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        // 🔹 Kiểm tra payment từ thanh toán đi lên - nếu có payment completed thì có thể xóa
        ordersData = await Promise.all(
          ordersData.map(async (order) => {
            const orderIdForPayment = order.orderId || order.id;
            if (orderIdForPayment) {
              try {
                const paymentsRes = await customerPaymentAPI.getPaymentsByOrder(orderIdForPayment);
                const payments = paymentsRes.data?.data || paymentsRes.data || [];
                const completedPayments = payments.filter(p => {
                  const paymentStatus = (p.status || "").toLowerCase().trim();
                  // Hỗ trợ nhiều cách viết: completed, COMPLETED, Completed, hoàn tất, đã hoàn tất
                  return paymentStatus === "completed" || 
                         paymentStatus === "hoàn tất" || 
                         paymentStatus === "đã hoàn tất" ||
                         paymentStatus === "done" ||
                         paymentStatus === "finished";
                });
                // Đánh dấu order có payment completed
                order.hasCompletedPayment = completedPayments.length > 0;
                order.completedPayments = completedPayments;
                if (order.hasCompletedPayment) {
                  console.log(`✅ Order ${orderIdForPayment} có ${completedPayments.length} payment(s) completed`);
                }
              } catch (paymentErr) {
                console.warn(`⚠️ Không thể kiểm tra payment cho order ${orderIdForPayment}:`, paymentErr);
                order.hasCompletedPayment = false;
              }
            } else {
              order.hasCompletedPayment = false;
            }
            return order;
          })
        );
      }
      
      // 🔹 Filter ra các đơn hàng đã bị xóa - không hiển thị trong danh sách
      ordersData = (Array.isArray(ordersData) ? ordersData : []).filter(o => {
        const orderId = o.orderId || o.id;
        // Kiểm tra nếu ID đã được đánh dấu là đã xóa
        if (orderId && deletedOrderIds.has(String(orderId))) {
          console.log("🚫 Filtered out order (tracked as deleted):", orderId);
          return false;
        }
        return true;
      });
      
      setOrder(ordersData);
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng:", err);
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
    // Tìm order để hiển thị thông tin
    const orderToDelete = order.find(o => (o.orderId || o.id) === orderId);
    const orderNumber = orderToDelete?.orderNumber || orderId;
    
    // Lấy danh sách tất cả payments liên quan để xóa trước
    let paymentsToDelete = [];
    try {
      const paymentsRes = await customerPaymentAPI.getPaymentsByOrder(orderId);
      const allPayments = paymentsRes.data || [];
      // Lấy tất cả payments (không chỉ completed) để xóa
      paymentsToDelete = allPayments;
      console.log(`📋 Tìm thấy ${paymentsToDelete.length} payment(s) cho order ${orderId}`);
    } catch (paymentFetchErr) {
      console.warn("⚠️ Không thể fetch payments:", paymentFetchErr);
      // Tiếp tục xóa order dù không fetch được payments
    }
    
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng "${orderNumber}" không?\n\n⚠️ Lưu ý: Hành động này sẽ xóa cả các thanh toán liên quan và không thể hoàn tác!`)) {
      return;
    }
    
    try {
      setDeleting(orderId);
      
      // Xóa các payment liên quan trước để tránh foreign key constraint violation
      if (paymentsToDelete.length > 0) {
        console.log(`🗑️ Đang xóa ${paymentsToDelete.length} payment(s) liên quan...`);
        for (const payment of paymentsToDelete) {
          try {
            const paymentId = payment.paymentId || payment.id;
            if (paymentId) {
              await customerPaymentAPI.deletePayment(paymentId);
              console.log(`✅ Đã xóa payment ${paymentId}`);
            }
          } catch (paymentDeleteErr) {
            console.error(`❌ Lỗi khi xóa payment ${payment.paymentId || payment.id}:`, paymentDeleteErr);
            // Tiếp tục xóa các payment khác
          }
        }
      }
      
      await orderAPI.deleteOrder(orderId);
      
      // Đánh dấu ID này là đã xóa
      setDeletedOrderIds(prev => new Set([...prev, String(orderId)]));
      
      // Đóng popup chi tiết nếu đang mở
      if (showDetail && selectedOrder && (selectedOrder.orderId || selectedOrder.id) === orderId) {
        setShowDetail(false);
        setSelectedOrder(null);
      }
      
      // Xóa khỏi state ngay lập tức thay vì fetchAll để tránh hiển thị lại
      setOrder(prev => {
        const filtered = prev.filter(o => {
          const oid = o.orderId || o.id;
          const shouldKeep = String(oid) !== String(orderId);
          if (!shouldKeep) {
            console.log("🗑️ Removing order from state:", oid);
          }
          return shouldKeep;
        });
        console.log("📊 Orders after deletion:", filtered.length, "remaining");
        return filtered;
      });
      
      alert(`✅ Xóa đơn hàng "${orderNumber}" thành công!`);
    } catch (err) {
      console.error("Lỗi khi xóa đơn hàng:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Tìm kiếm theo tên (real-time) - hỗ trợ cả orders có và không có quotation
  const filteredOrders = order.filter((o) => {
    if (!o) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    // Tìm trong orderNumber
    if (o.orderNumber?.toLowerCase().includes(keyword)) return true;
    
    // Tìm trong status
    if (o.status?.toLowerCase().includes(keyword)) return true;
    
    // Tìm trong customer (có thể từ quotation hoặc trực tiếp)
    const customer = o.customer || o.quotation?.customer;
    if (customer) {
      if (customer.firstName?.toLowerCase().includes(keyword)) return true;
      if (customer.lastName?.toLowerCase().includes(keyword)) return true;
      if (customer.email?.toLowerCase().includes(keyword)) return true;
      if (customer.phone?.toLowerCase().includes(keyword)) return true;
    }
    
    return false;
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
          <p className="subtitle">{order.length} đơn hàng tổng cộng (bao gồm cả đơn hàng từ DealerStaff)</p>
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
                          {c.customer?.firstName || c.quotation?.customer?.firstName || ''} {c.customer?.lastName || c.quotation?.customer?.lastName || ''}
                        </span>
                        {(c.customer?.email || c.quotation?.customer?.email) && (
                          <span className="customer-email">{c.customer?.email || c.quotation?.customer?.email}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <span className="vehicle-brand">
                          {c.inventory?.variant?.model?.brand?.brandName || c.quotation?.variant?.model?.brand?.brandName || 'N/A'}
                        </span>
                        <span className="vehicle-model">
                          {c.inventory?.variant?.variantName || c.inventory?.variant?.model?.modelName || c.quotation?.variant?.variantName || c.quotation?.variant?.model?.modelName || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="price-amount">
                        {c.totalAmount?.toLocaleString('vi-VN') || c.quotation?.finalPrice?.toLocaleString('vi-VN') || '0'} ₫
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
                      {/* Chỉ hiển thị nút xóa khi đơn hàng có trạng thái "cancelled" */}
                      {(() => {
                        const orderStatus = (c.status || "").toLowerCase().trim();
                        const isCancelled = orderStatus === "cancelled" || 
                                          orderStatus === "đã hủy" || 
                                          orderStatus === "hủy" ||
                                          orderStatus === "canceled";
                        return isCancelled && (
                          <button 
                            className="icon-btn delete" 
                            onClick={() => handleDelete(c.orderId)}
                            disabled={deleting === c.orderId}
                            title="Xóa đơn hàng đã hủy"
                          >
                            {deleting === c.orderId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                          </button>
                        );
                      })()}
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
