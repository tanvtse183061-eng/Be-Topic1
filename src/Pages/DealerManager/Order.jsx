import './Order.css';
import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { orderAPI, customerAPI, quotationAPI, dealerQuotationAPI, inventoryAPI } from "../../services/API";

export default function Order() {
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data for form
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [inventories, setInventories] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    createFrom: "quotation", // "quotation" hoặc "customer"
    quotationId: "",
    customerId: "",
    inventoryId: "",
    orderDate: new Date().toISOString().split('T')[0],
    orderType: "RETAIL",
    paymentStatus: "PENDING",
    deliveryStatus: "PENDING",
    status: "pending",
    totalAmount: "",
    depositAmount: "",
    balanceAmount: "",
    paymentMethod: "cash",
    deliveryDate: "",
    notes: "",
    specialRequests: "",
  });

  // Lấy danh sách đơn hàng
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getOrders();
      console.log("📦 Raw response từ getOrders:", res);
      console.log("📦 res.data:", res.data);
      
      // Backend trả về nested structure với customer, user, inventory
      const ordersData = res.data?.data || res.data || [];
      console.log("📦 Orders data:", ordersData);
      console.log("📦 Orders count:", Array.isArray(ordersData) ? ordersData.length : 0);
      
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        console.log("📦 First order sample:", ordersData[0]);
      }
      
      setOrder(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for form
  const fetchData = async () => {
    try {
      console.log("🔄 Đang fetch dữ liệu cho form...");
      
      // Fetch customers - giống như Admin/Customer.jsx
      try {
        const customersRes = await customerAPI.getCustomers();
        const customersData = customersRes.data || [];
        console.log("✅ Customers fetched:", customersData.length, customersData);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch customers:", err);
        console.error("❌ Error details:", err.response?.data);
        setCustomers([]);
      }
      
      // Fetch quotations
      try {
        const [customerQuotationsRes, dealerQuotationsRes] = await Promise.all([
          quotationAPI.getQuotations(),
          dealerQuotationAPI.getQuotations()
        ]);
        const customerQuotationsData = customerQuotationsRes.data || [];
        const dealerQuotationsData = dealerQuotationsRes.data || [];
        const allQuotations = [
          ...(Array.isArray(customerQuotationsData) ? customerQuotationsData : []),
          ...(Array.isArray(dealerQuotationsData) ? dealerQuotationsData : [])
        ];
        console.log("✅ Quotations fetched:", allQuotations.length);
        setQuotations(allQuotations);
      } catch (err) {
        console.error("❌ Lỗi fetch quotations:", err);
        setQuotations([]);
      }
      
      // Fetch inventories - dùng getInventory() và filter AVAILABLE
      try {
        const inventoriesRes = await inventoryAPI.getInventory();
        const allInventories = inventoriesRes.data || [];
        // Filter chỉ lấy xe có status AVAILABLE
        const availableInventories = Array.isArray(allInventories) 
          ? allInventories.filter(inv => {
              const status = inv.status?.toUpperCase() || inv.vehicleStatus?.toUpperCase() || "";
              return status === "AVAILABLE";
            })
          : [];
        console.log("✅ All Inventories:", allInventories.length);
        console.log("✅ Available Inventories:", availableInventories.length, availableInventories);
        setInventories(availableInventories);
      } catch (err) {
        console.error("❌ Lỗi fetch inventories:", err);
        console.error("❌ Error details:", err.response?.data);
        setInventories([]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchData();
  }, []);

  // Fetch lại data khi mở popup
  useEffect(() => {
    if (showPopup) {
      console.log("🔄 Popup mở, fetch lại data...");
      fetchData();
    }
  }, [showPopup]);

  // Xóa đơn hàng
  const handleDelete = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) return;
    try {
      await orderAPI.deleteOrder(orderId);
      alert("Xóa đơn hàng thành công!");
      // Xóa khỏi state ngay lập tức
      setOrder(prev => prev.filter(o => (o.orderId || o.id) !== orderId));
      // Fetch lại sau 500ms để sync
      setTimeout(() => {
        fetchOrder();
      }, 500);
    } catch (err) {
      console.error("Lỗi khi xóa đơn hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Xóa thất bại!";
      alert(`Xóa thất bại!\n${errorMsg}`);
    }
  };

  // Tìm kiếm
  const filteredOrders = (order || []).filter((o) => {
    if (!o) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (o.orderNumber && String(o.orderNumber).toLowerCase().includes(keyword)) ||
      (o.status && String(o.status).toLowerCase().includes(keyword)) ||
      // Backend mới: customer trực tiếp
      (o.customer?.firstName && String(o.customer.firstName).toLowerCase().includes(keyword)) ||
      (o.customer?.lastName && String(o.customer.lastName).toLowerCase().includes(keyword)) ||
      (o.customer?.email && String(o.customer.email).toLowerCase().includes(keyword)) ||
      (o.customer?.phone && String(o.customer.phone).toLowerCase().includes(keyword)) ||
      // Fallback: quotation?.customer (backward compatibility)
      (o.quotation?.customer?.firstName && String(o.quotation.customer.firstName).toLowerCase().includes(keyword)) ||
      (o.quotation?.customer?.lastName && String(o.quotation.customer.lastName).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (orderId) => {
    try {
      const res = await orderAPI.getOrder(orderId);
      setSelectedOrder(res.data);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      alert("Không thể tải chi tiết đơn hàng!");
    }
  };

  // Helper functions
  const getCustomerName = (order) => {
    // Backend mới trả về customer trực tiếp trong order
    if (order.customer) {
      const customer = order.customer;
      if (customer.firstName && customer.lastName) {
        return `${customer.firstName} ${customer.lastName}`;
      }
      return customer.fullName || customer.name || "—";
    }
    // Fallback: kiểm tra quotation?.customer (backward compatibility)
    if (order.quotation?.customer) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  // Tạo đơn hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation: Cần quotationId hoặc customerId
    if (formData.createFrom === "quotation") {
      if (!formData.quotationId) {
        setError("Vui lòng chọn báo giá!");
        return;
      }
    } else {
      if (!formData.customerId) {
        setError("Vui lòng chọn khách hàng!");
        return;
      }
    }

    if (!formData.orderDate) {
      setError("Vui lòng chọn ngày đặt hàng!");
      return;
    }

    try {
      // Chuẩn bị payload theo OrderRequest DTO
      // Lưu ý: Backend sẽ tự động set totalAmount = null khi tạo order mới
      const payload = {
        // UUID fields - đảm bảo là string
        quotationId: formData.createFrom === "quotation" && formData.quotationId ? String(formData.quotationId).trim() : null,
        customerId: formData.createFrom === "customer" && formData.customerId ? String(formData.customerId).trim() : null,
        inventoryId: formData.inventoryId ? String(formData.inventoryId).trim() : null,
        // Date fields - format yyyy-MM-dd
        orderDate: formData.orderDate || null,
        deliveryDate: formData.deliveryDate || null,
        // Enum fields - đảm bảo đúng giá trị enum
        orderType: formData.orderType || null, // RETAIL, WHOLESALE, DEMO, TEST_DRIVE
        paymentStatus: formData.paymentStatus || null, // PENDING, PARTIAL, PAID, OVERDUE, REFUNDED
        deliveryStatus: formData.deliveryStatus || null, // PENDING, SCHEDULED, IN_TRANSIT, DELIVERED, CANCELLED
        // String fields
        status: formData.status || null, // pending, quoted, confirmed, paid, delivered, completed, rejected, cancelled
        paymentMethod: formData.paymentMethod || null, // cash, bank_transfer, credit_card, installment
        notes: formData.notes || null,
        specialRequests: formData.specialRequests || null,
        // BigDecimal fields - chỉ gửi nếu có giá trị
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        balanceAmount: formData.balanceAmount ? parseFloat(formData.balanceAmount) : null,
        // totalAmount: KHÔNG gửi khi tạo mới - backend sẽ set null
      };

      // Xóa các field null hoặc empty để không gửi
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === "" || payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      // Đảm bảo quotationId hoặc customerId có giá trị (backend yêu cầu)
      if (!payload.quotationId && !payload.customerId) {
        setError("Vui lòng chọn báo giá hoặc khách hàng!");
        return;
      }

      console.log("📤 Payload tạo order:", payload);

      const createRes = await orderAPI.createOrder(payload);
      console.log("✅ Response từ createOrder:", createRes);
      
      alert("Tạo đơn hàng thành công!");
      setShowPopup(false);
      
      // Reset form
      setFormData({
        createFrom: "quotation",
        quotationId: "",
        customerId: "",
        inventoryId: "",
        orderDate: new Date().toISOString().split('T')[0],
        orderType: "RETAIL",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        status: "pending",
        totalAmount: "",
        depositAmount: "",
        balanceAmount: "",
        paymentMethod: "cash",
        deliveryDate: "",
        notes: "",
        specialRequests: "",
      });
      
      // Fetch lại danh sách
      setTimeout(() => {
        fetchOrder();
      }, 500);
    } catch (err) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo đơn hàng!";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý đơn hàng</div>

      <div className="title2-customer">
        <h2>Danh sách đơn hàng</h2>
        <h3 onClick={() => setShowPopup(true)}>+ Thêm đơn hàng</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
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
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "#666" }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((o, index) => {
                const orderId = o.orderId || o.id || `order-${index}`;
                return (
                  <tr key={orderId}>
                    <td>{o.orderNumber || "—"}</td>
                    <td>
                      {getCustomerName(o)}
                    </td>
                    <td>
                      {/* Backend mới: có thể có inventory với variant info */}
                      {o.inventory?.variant?.variantName 
                        ? o.inventory.variant.variantName
                        : o.quotation?.variant?.model?.brand?.brandName && o.quotation?.variant?.model?.modelName
                        ? `${o.quotation.variant.model.brand.brandName} ${o.quotation.variant.model.modelName}`
                        : "—"}
                    </td>
                    <td>{formatPrice(o.totalAmount || o.quotation?.finalPrice)}</td>
                    <td>{o.status || "—"}</td>
                    <td>{formatDate(o.orderDate)}</td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(orderId)}>
                        <FaEye />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(orderId)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm đơn hàng */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2>Thêm đơn hàng mới</h2>
            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label>Tạo từ *</label>
                <select
                  value={formData.createFrom}
                  onChange={(e) => setFormData({ ...formData, createFrom: e.target.value, quotationId: "", customerId: "", inventoryId: "" })}
                  required
                >
                  <option value="quotation">Từ báo giá</option>
                  <option value="customer">Từ khách hàng</option>
                </select>
              </div>

              {formData.createFrom === "quotation" ? (
                <div style={{ marginBottom: "15px" }}>
                  <label>Báo giá *</label>
                  <select
                    value={formData.quotationId}
                    onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn báo giá --</option>
                    {quotations
                      .filter(q => q.status === "ACCEPTED" || q.status === "accepted" || q.status === "SENT" || q.status === "sent")
                      .map(q => (
                        <option key={q.quotationId || q.id} value={q.quotationId || q.id}>
                          {q.quotationNumber || q.quotationId} - {getCustomerName(q.customer)} - {formatPrice(q.finalPrice || q.totalAmount)}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <label>Khách hàng *</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px" }}
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers && customers.length > 0 ? (
                        customers.map(c => {
                          const customerId = c.customerId || c.id;
                          return (
                            <option key={customerId} value={customerId}>
                              {getCustomerName(c)}
                            </option>
                          );
                        })
                      ) : (
                        <option value="" disabled>Không có khách hàng nào</option>
                      )}
                    </select>
                    {customers && customers.length === 0 && (
                      <small style={{ color: "#ff6b6b", display: "block", marginTop: "5px" }}>
                        ⚠️ Không có khách hàng nào. Vui lòng tạo khách hàng trước.
                      </small>
                    )}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Xe từ kho (tùy chọn)</label>
                    <select
                      value={formData.inventoryId}
                      onChange={(e) => setFormData({ ...formData, inventoryId: e.target.value })}
                      style={{ width: "100%", padding: "8px" }}
                    >
                      <option value="">-- Chọn xe từ kho --</option>
                      {inventories && inventories.length > 0 ? (
                        inventories.map(inv => {
                          const inventoryId = inv.inventoryId || inv.id;
                          const variantName = inv.variant?.variantName || inv.variantName || "N/A";
                          const colorName = inv.color?.colorName || inv.colorName || "N/A";
                          const price = inv.sellingPrice || inv.costPrice || 0;
                          return (
                            <option key={inventoryId} value={inventoryId}>
                              {variantName} - {colorName} - {formatPrice(price)}
                            </option>
                          );
                        })
                      ) : (
                        <option value="" disabled>Không có xe nào trong kho</option>
                      )}
                    </select>
                    {inventories && inventories.length === 0 && (
                      <small style={{ color: "#ff6b6b", display: "block", marginTop: "5px" }}>
                        ⚠️ Không có xe nào trong kho.
                      </small>
                    )}
                  </div>
                </>
              )}

              <div style={{ marginBottom: "15px" }}>
                <label>Ngày đặt hàng *</label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Loại đơn hàng</label>
                <select
                  value={formData.orderType}
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                >
                  <option value="RETAIL">Bán lẻ</option>
                  <option value="WHOLESALE">Bán buôn</option>
                  <option value="DEMO">Demo</option>
                  <option value="TEST_DRIVE">Lái thử</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Trạng thái thanh toán</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                >
                  <option value="PENDING">Chờ thanh toán</option>
                  <option value="PARTIAL">Thanh toán một phần</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="OVERDUE">Quá hạn</option>
                  <option value="REFUNDED">Đã hoàn tiền</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Trạng thái giao hàng</label>
                <select
                  value={formData.deliveryStatus}
                  onChange={(e) => setFormData({ ...formData, deliveryStatus: e.target.value })}
                >
                  <option value="PENDING">Chờ giao hàng</option>
                  <option value="SCHEDULED">Đã lên lịch</option>
                  <option value="IN_TRANSIT">Đang vận chuyển</option>
                  <option value="DELIVERED">Đã giao</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Trạng thái đơn hàng</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="quoted">Đã báo giá</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="delivered">Đã giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="rejected">Từ chối</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Tổng tiền</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="Tự động tính từ báo giá (không gửi khi tạo mới)"
                  disabled
                  style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                />
                <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                  💡 Tổng tiền sẽ được tính tự động từ báo giá khi tạo đơn hàng
                </small>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Tiền đặt cọc</label>
                <input
                  type="number"
                  min="0"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Số dư còn lại</label>
                <input
                  type="number"
                  min="0"
                  value={formData.balanceAmount}
                  onChange={(e) => setFormData({ ...formData, balanceAmount: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Phương thức thanh toán</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank_transfer">Chuyển khoản</option>
                  <option value="credit_card">Thẻ tín dụng</option>
                  <option value="installment">Trả góp</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ngày giao hàng</label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Yêu cầu đặc biệt</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="form-actions">
                <button type="submit">Tạo đơn hàng</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết đặt hàng */}
      {showDetail && selectedOrder && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>Thông tin đặt hàng</h2>
            <div className="detail-content">
              <p><b>Số đơn hàng:</b> {selectedOrder.orderNumber || "—"}</p>
              <p><b>Khách hàng:</b> {getCustomerName(selectedOrder)}</p>
              {selectedOrder.customer && (
                <>
                  <p><b>Email:</b> {selectedOrder.customer.email || "—"}</p>
                  <p><b>Điện thoại:</b> {selectedOrder.customer.phone || "—"}</p>
                </>
              )}
              <p><b>Xe đặt mua:</b> {
                selectedOrder.inventory?.variant?.variantName 
                  ? selectedOrder.inventory.variant.variantName
                  : selectedOrder.quotation?.variant?.model?.brand?.brandName && selectedOrder.quotation?.variant?.model?.modelName
                  ? `${selectedOrder.quotation.variant.model.brand.brandName} ${selectedOrder.quotation.variant.model.modelName}`
                  : "—"
              }</p>
              <p><b>Tổng tiền:</b> {formatPrice(selectedOrder.totalAmount || selectedOrder.quotation?.finalPrice)}</p>
              <p><b>Trạng thái:</b> {selectedOrder.status || "—"}</p>
              <p><b>Ngày đặt hàng:</b> {formatDate(selectedOrder.orderDate)}</p>
              {selectedOrder.paymentStatus && <p><b>Trạng thái thanh toán:</b> {selectedOrder.paymentStatus}</p>}
              {selectedOrder.deliveryStatus && <p><b>Trạng thái giao hàng:</b> {selectedOrder.deliveryStatus}</p>}
              {selectedOrder.paymentMethod && <p><b>Phương thức thanh toán:</b> {selectedOrder.paymentMethod}</p>}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
