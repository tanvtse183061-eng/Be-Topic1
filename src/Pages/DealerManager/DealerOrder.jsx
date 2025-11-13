import './DealerOrder.css';
import { FaSearch, FaEye, FaCheck, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dealerOrderAPI, dealerAPI, publicVehicleAPI } from "../../services/API";
import api from "../../services/API";

export default function DealerOrder() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentRole = localStorage.getItem("role") || "";
  const isDealerManager = currentRole === "DEALER_MANAGER" || currentRole === "MANAGER";
  const isEVMStaff = currentRole === "EVM_STAFF";
  const isAdmin = currentRole === "ADMIN";

  // Data for form
  const [dealers, setDealers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [currentDealerId, setCurrentDealerId] = useState("");

  // Form data - Bước 1: Tạo đơn hàng
  const [formData, setFormData] = useState({
    dealerId: "",
    evmStaffId: "",
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: "",
    orderType: "PURCHASE",
    priority: "NORMAL",
    paymentTerms: "NET_30",
    deliveryTerms: "FOB_FACTORY",
    notes: "",
    items: [{ variantId: "", colorId: "", quantity: 1, unitPrice: "", discountPercentage: "", notes: "" }]
  });

  // Helper function để extract array từ response
  const extractArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.content)) return data.content;
    if (data && typeof data === 'object') {
      const possibleArrays = Object.values(data).filter(Array.isArray);
      if (possibleArrays.length > 0) return possibleArrays[0];
    }
    return [];
  };

  // Helper function để normalize status
  const normalizeStatus = (status) => {
    if (!status) return status;
    // Convert WAITING to WAITING_FOR_QUOTATION
    if (status === 'WAITING') return 'WAITING_FOR_QUOTATION';
    return status;
  };

  // Helper function để tính totalQuantity và totalAmount từ items
  const calculateOrderTotals = (order) => {
    if (order.totalQuantity && order.totalAmount) {
      return { totalQuantity: order.totalQuantity, totalAmount: order.totalAmount };
    }
    
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      const totalQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalAmount = order.items.reduce((sum, item) => {
        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice || 0;
        const discount = item.discountPercentage || 0;
        const itemTotal = quantity * unitPrice * (1 - discount / 100);
        return sum + itemTotal;
      }, 0);
      return { totalQuantity, totalAmount };
    }
    
    return { totalQuantity: 0, totalAmount: 0 };
  };

  // Helper function để normalize enum values thành UPPERCASE
  const normalizeEnum = (value, defaultValue = null) => {
    if (!value || typeof value !== 'string') return defaultValue;
    return value.toUpperCase().trim();
  };

  // Helper function để normalize tất cả enum fields trong payload
  const normalizeDealerOrderPayload = (payload) => {
    const normalized = { ...payload };
    
    // Normalize Priority: LOW, NORMAL, HIGH, URGENT
    if (normalized.priority) {
      normalized.priority = normalizeEnum(normalized.priority, "NORMAL");
    }
    
    // Normalize OrderType: PURCHASE, RESERVE, SAMPLE
    if (normalized.orderType) {
      normalized.orderType = normalizeEnum(normalized.orderType, "PURCHASE");
    }
    
    // Normalize PaymentTerms: NET_15, NET_30, NET_45, NET_60, CASH_ON_DELIVERY, ADVANCE_PAYMENT
    if (normalized.paymentTerms) {
      normalized.paymentTerms = normalizeEnum(normalized.paymentTerms);
    }
    
    // Normalize DeliveryTerms: FOB_FACTORY, FOB_DESTINATION, EX_WORKS, CIF, DDP
    if (normalized.deliveryTerms) {
      normalized.deliveryTerms = normalizeEnum(normalized.deliveryTerms);
    }
    
    // Normalize Status (nếu có)
    if (normalized.status) {
      normalized.status = normalizeEnum(normalized.status);
    }
    
    // Normalize ApprovalStatus (nếu có)
    if (normalized.approvalStatus) {
      normalized.approvalStatus = normalizeEnum(normalized.approvalStatus);
    }
    
    return normalized;
  };

  // Lấy danh sách đơn hàng đại lý
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await dealerOrderAPI.getOrders();
      console.log("📦 Raw response từ getOrders:", res);
      
      // Extract orders data với nhiều cấu trúc response khác nhau
      let ordersData = extractArray(res.data);
      console.log("📦 Orders data extracted:", ordersData);
      console.log("📦 Orders count:", ordersData.length);
      
      // Normalize và enrich data
      ordersData = ordersData.map(order => {
        const totals = calculateOrderTotals(order);
        return {
          ...order,
          // Normalize status
          status: normalizeStatus(order.status),
          // Ensure totals
          totalQuantity: totals.totalQuantity,
          totalAmount: totals.totalAmount,
          // Ensure dealerOrderId
          dealerOrderId: order.dealerOrderId || order.id || order.orderId,
          // Ensure dealerOrderNumber
          dealerOrderNumber: order.dealerOrderNumber || order.orderNumber || `DO-${order.dealerOrderId || order.id || ''}`,
        };
      });
      
      console.log("📦 Orders data normalized:", ordersData);
      if (ordersData.length > 0) {
        console.log("📦 Sample order:", ordersData[0]);
      }
      
      // Nếu là DEALER_MANAGER, chỉ lấy đơn hàng của đại lý mình
      if (isDealerManager && currentDealerId) {
        const filtered = ordersData.filter(o => {
          const orderDealerId = o.dealer?.dealerId || o.dealerId || o.dealer?.id;
          return String(orderDealerId || "") === String(currentDealerId);
        });
        setOrders(Array.isArray(filtered) ? filtered : []);
        console.log("📦 Filtered orders for dealer:", filtered.length);
      } else {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("Không thể tải danh sách đơn hàng!");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for form
  const fetchData = async () => {
    try {
      console.log("🔄 Đang fetch dữ liệu cho form...");
      
      // Fetch dealers
      if (isAdmin || isEVMStaff) {
        try {
          const dealersRes = await dealerAPI.getAll();
          const dealersData = dealersRes.data || [];
          console.log("✅ Dealers fetched:", dealersData.length);
          setDealers(Array.isArray(dealersData) ? dealersData : []);
        } catch (err) {
          console.error("❌ Lỗi fetch dealers:", err);
          setDealers([]);
        }
      } else if (isDealerManager) {
        // Lấy dealerId từ user info
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const dealerId = userInfo.dealerId || "";
        setCurrentDealerId(dealerId);
        setFormData(prev => ({ ...prev, dealerId }));
      }
      
      // Fetch variants và colors
      try {
        const [variantsRes, colorsRes] = await Promise.all([
          publicVehicleAPI.getVariants(),
          publicVehicleAPI.getColors()
        ]);
        const variantsData = variantsRes.data || [];
        const colorsData = colorsRes.data || [];
        console.log("✅ Variants fetched:", variantsData.length);
        console.log("✅ Colors fetched:", colorsData.length);
        setVariants(Array.isArray(variantsData) ? variantsData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch variants/colors:", err);
        setVariants([]);
        setColors([]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchData();
  }, []);

  // Fetch lại data khi mở popup
  useEffect(() => {
    if (showPopup) {
      fetchData();
    }
  }, [showPopup]);

  // Bước 1: Tạo đơn hàng
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.dealerId) {
      setError("Vui lòng chọn đại lý!");
      return;
    }
    if (!formData.orderDate) {
      setError("Vui lòng chọn ngày đặt hàng!");
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      setError("Vui lòng thêm ít nhất một xe vào đơn hàng!");
      return;
    }
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.variantId || !item.colorId || !item.quantity) {
        setError(`Vui lòng điền đầy đủ thông tin cho xe thứ ${i + 1}!`);
        return;
      }
    }

    try {
      // Chuẩn bị payload theo CreateDealerOrderRequest
      let payload = {
        dealerId: String(formData.dealerId).trim(),
        orderDate: formData.orderDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        orderType: formData.orderType || "PURCHASE",
        priority: formData.priority || "NORMAL",
        paymentTerms: formData.paymentTerms || null,
        deliveryTerms: formData.deliveryTerms || null,
        notes: formData.notes || null,
        items: formData.items.map(item => ({
          variantId: parseInt(item.variantId),
          colorId: parseInt(item.colorId),
          quantity: parseInt(item.quantity),
          unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null,
          discountPercentage: item.discountPercentage ? parseFloat(item.discountPercentage) : null,
          notes: item.notes || null
        }))
      };

      // ⚠️ QUAN TRỌNG: Normalize tất cả enum values thành UPPERCASE
      payload = normalizeDealerOrderPayload(payload);
      console.log("📤 Payload trước khi normalize:", payload);

      // Xóa các field null
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === "" || payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log("📤 Payload tạo dealer order (sau normalize):", payload);

      const createRes = await dealerOrderAPI.createDetailedOrder(payload);
      console.log("✅ Response từ createDetailedOrder:", createRes);
      
      alert("Tạo đơn hàng đại lý thành công!");
      setShowPopup(false);
      
      // Reset form
      setFormData({
        dealerId: currentDealerId || "",
        evmStaffId: "",
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: "",
        orderType: "PURCHASE",
        priority: "NORMAL",
        paymentTerms: "NET_30",
        deliveryTerms: "FOB_FACTORY",
        notes: "",
        items: [{ variantId: "", colorId: "", quantity: 1, unitPrice: "", discountPercentage: "", notes: "" }]
      });
      
      // Fetch lại danh sách
      setTimeout(() => {
        fetchOrders();
      }, 500);
    } catch (err) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo đơn hàng!";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // Bước 2: Duyệt đơn hàng (EVM_STAFF, ADMIN)
  const handleApproveOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt đơn hàng này không?")) return;
    try {
      await dealerOrderAPI.approveOrder(orderId);
      alert("Duyệt đơn hàng thành công!");
      fetchOrders();
    } catch (err) {
      console.error("Lỗi khi duyệt đơn hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể duyệt đơn hàng!";
      alert(`Duyệt đơn hàng thất bại!\n${errorMsg}`);
    }
  };

  // Từ chối đơn hàng
  const handleRejectOrder = async (orderId) => {
    const reason = window.prompt("Nhập lý do từ chối đơn hàng:");
    if (!reason) return;
    try {
      await dealerOrderAPI.rejectOrder(orderId, reason);
      alert("Từ chối đơn hàng thành công!");
      fetchOrders();
    } catch (err) {
      console.error("Lỗi khi từ chối đơn hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể từ chối đơn hàng!";
      alert(`Từ chối đơn hàng thất bại!\n${errorMsg}`);
    }
  };

  // Thêm item vào form
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { variantId: "", colorId: "", quantity: 1, unitPrice: "", discountPercentage: "", notes: "" }]
    }));
  };

  // Xóa item khỏi form
  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Cập nhật item trong form
  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Helper functions
  const getDealerName = (order) => {
    if (order.dealer) {
      return order.dealer.dealerName || order.dealer.name || "—";
    }
    return "—";
  };

  const getVariantName = (variantId) => {
    if (!variantId) return "—";
    const variant = variants.find(v => 
      v.variantId === variantId || v.id === variantId || String(v.variantId) === String(variantId)
    );
    return variant?.variantName || `${variant?.model?.brand?.brandName || ""} ${variant?.model?.modelName || ""}` || "—";
  };

  const getColorName = (colorId) => {
    if (!colorId) return "—";
    const color = colors.find(c => 
      c.colorId === colorId || c.id === colorId || String(c.colorId) === String(colorId)
    );
    return color?.colorName || color?.name || "—";
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: "badge-warning",
      WAITING_FOR_QUOTATION: "badge-info",
      WAITING: "badge-info",
      CONFIRMED: "badge-info",
      PROCESSING: "badge-primary",
      SHIPPED: "badge-secondary",
      DELIVERED: "badge-success",
      CANCELLED: "badge-danger",
      COMPLETED: "badge-success",
      REJECTED: "badge-danger"
    };
    return statusMap[status] || "badge-secondary";
  };

  const getApprovalStatusBadge = (status) => {
    const statusMap = {
      PENDING: "badge-warning",
      APPROVED: "badge-success",
      REJECTED: "badge-danger"
    };
    return statusMap[status] || "badge-secondary";
  };

  // Tìm kiếm
  const filteredOrders = (orders || []).filter((o) => {
    if (!o) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (o.dealerOrderNumber && String(o.dealerOrderNumber).toLowerCase().includes(keyword)) ||
      (o.status && String(o.status).toLowerCase().includes(keyword)) ||
      (o.approvalStatus && String(o.approvalStatus).toLowerCase().includes(keyword)) ||
      (o.dealer?.dealerName && String(o.dealer.dealerName).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (orderId) => {
    try {
      const res = await dealerOrderAPI.getOrder(orderId);
      console.log("📦 Order detail response:", res);
      
      let orderData = res.data?.data || res.data;
      
      // Nếu không có items, thử fetch items riêng
      if (!orderData.items || orderData.items.length === 0) {
        try {
          const itemsRes = await api.get(`/dealer-orders/${orderId}/items`).catch(() => null);
          if (itemsRes && itemsRes.data) {
            const items = extractArray(itemsRes.data);
            if (items.length > 0) {
              orderData = { ...orderData, items };
              console.log("📦 Fetched items separately:", items);
            }
          }
        } catch (itemsErr) {
          console.warn("⚠️ Could not fetch items separately:", itemsErr);
        }
      }
      
      // Normalize order data
      const totals = calculateOrderTotals(orderData);
      orderData = {
        ...orderData,
        status: normalizeStatus(orderData.status),
        totalQuantity: totals.totalQuantity,
        totalAmount: totals.totalAmount,
        dealerOrderId: orderData.dealerOrderId || orderData.id || orderId,
        dealerOrderNumber: orderData.dealerOrderNumber || orderData.orderNumber || `DO-${orderData.dealerOrderId || orderData.id || orderId}`,
      };
      
      setSelectedOrder(orderData);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("Không thể tải chi tiết đơn hàng!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý đơn hàng đại lý</div>

      <div className="title2-customer">
        <h2>Danh sách đơn hàng đại lý</h2>
        {(isDealerManager || isAdmin || isEVMStaff) && (
          <h3 onClick={() => setShowPopup(true)}>+ Tạo đơn hàng</h3>
        )}
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
              <th>ĐẠI LÝ</th>
              <th>NGÀY ĐẶT</th>
              <th>TỔNG SỐ LƯỢNG</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>DUYỆT</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((o, index) => {
                const orderId = o.dealerOrderId || o.id || `order-${index}`;
                return (
                  <tr key={orderId}>
                    <td>{o.dealerOrderNumber || "—"}</td>
                    <td>{getDealerName(o)}</td>
                    <td>{formatDate(o.orderDate)}</td>
                    <td>{o.totalQuantity || 0}</td>
                    <td>{formatPrice(o.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(o.status)}`}>
                        {o.status || "—"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getApprovalStatusBadge(o.approvalStatus)}`}>
                        {o.approvalStatus || "—"}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(orderId)}>
                        <FaEye />
                      </button>
                      {(isEVMStaff || isAdmin) && o.approvalStatus === "PENDING" && (
                        <>
                          <button className="icon-btn approve" onClick={() => handleApproveOrder(orderId)}>
                            <FaCheck />
                          </button>
                          <button className="icon-btn reject" onClick={() => handleRejectOrder(orderId)}>
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup tạo đơn hàng - Bước 1 */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo đơn hàng đại lý (Bước 1)</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreateOrder}>
              <div style={{ marginBottom: "15px" }}>
                <label>Đại lý *</label>
                {isDealerManager ? (
                  <input type="text" value={getDealerName({ dealer: { dealerId: currentDealerId } })} disabled />
                ) : (
                  <select
                    value={formData.dealerId}
                    onChange={(e) => setFormData({ ...formData, dealerId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn đại lý --</option>
                    {dealers.map((d) => (
                      <option key={d.dealerId || d.id} value={d.dealerId || d.id}>
                        {d.dealerName || d.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

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
                <label>Ngày giao hàng dự kiến</label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>Loại đơn hàng</label>
                  <select
                    value={formData.orderType}
                    onChange={(e) => {
                      // ⚠️ Đảm bảo giá trị luôn là UPPERCASE
                      const value = e.target.value.toUpperCase();
                      setFormData({ ...formData, orderType: value });
                    }}
                  >
                    <option value="PURCHASE">Mua hàng</option>
                    <option value="RESERVE">Đặt trước</option>
                    <option value="SAMPLE">Mẫu</option>
                  </select>
                </div>

                <div>
                  <label>Độ ưu tiên</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => {
                      // ⚠️ Đảm bảo giá trị luôn là UPPERCASE
                      const value = e.target.value.toUpperCase();
                      setFormData({ ...formData, priority: value });
                    }}
                  >
                    <option value="LOW">Thấp</option>
                    <option value="NORMAL">Bình thường</option>
                    <option value="HIGH">Cao</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label>Điều khoản thanh toán</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => {
                      // ⚠️ Đảm bảo giá trị luôn là UPPERCASE
                      const value = e.target.value.toUpperCase();
                      setFormData({ ...formData, paymentTerms: value });
                    }}
                  >
                    <option value="NET_15">NET 15</option>
                    <option value="NET_30">NET 30</option>
                    <option value="NET_45">NET 45</option>
                    <option value="NET_60">NET 60</option>
                    <option value="CASH_ON_DELIVERY">Thanh toán khi nhận hàng</option>
                    <option value="ADVANCE_PAYMENT">Thanh toán trước</option>
                  </select>
                </div>

                <div>
                  <label>Điều khoản giao hàng</label>
                  <select
                    value={formData.deliveryTerms}
                    onChange={(e) => {
                      // ⚠️ Đảm bảo giá trị luôn là UPPERCASE
                      const value = e.target.value.toUpperCase();
                      setFormData({ ...formData, deliveryTerms: value });
                    }}
                  >
                    <option value="FOB_FACTORY">FOB Factory</option>
                    <option value="FOB_DESTINATION">FOB Destination</option>
                    <option value="EX_WORKS">EX Works</option>
                    <option value="CIF">CIF</option>
                    <option value="DDP">DDP</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Danh sách xe *</label>
                {formData.items.map((item, index) => (
                  <div key={index} style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "10px", borderRadius: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <strong>Xe {index + 1}</strong>
                      {formData.items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(index)} style={{ background: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}>
                          <FaTrash /> Xóa
                        </button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <div>
                        <label>Phiên bản xe *</label>
                        <select
                          value={item.variantId}
                          onChange={(e) => handleItemChange(index, "variantId", e.target.value)}
                          required
                        >
                          <option value="">-- Chọn phiên bản --</option>
                          {variants.map((v) => (
                            <option key={v.variantId || v.id} value={v.variantId || v.id}>
                              {v.variantName || `${v.model?.brand?.brandName || ""} ${v.model?.modelName || ""}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Màu sắc *</label>
                        <select
                          value={item.colorId}
                          onChange={(e) => handleItemChange(index, "colorId", e.target.value)}
                          required
                        >
                          <option value="">-- Chọn màu --</option>
                          {colors.map((c) => (
                            <option key={c.colorId || c.id} value={c.colorId || c.id}>
                              {c.colorName || c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                      <div>
                        <label>Số lượng *</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label>Giá đơn vị (VND)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Giảm giá (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={item.discountPercentage}
                          onChange={(e) => handleItemChange(index, "discountPercentage", e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label>Ghi chú</label>
                      <textarea
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                        rows="2"
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddItem} style={{ background: "#28a745", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", marginTop: "10px" }}>
                  <FaPlus /> Thêm xe
                </button>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ghi chú đơn hàng</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
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

      {/* Popup xem chi tiết */}
      {showDetail && selectedOrder && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết đơn hàng đại lý</h2>
            <div className="detail-content">
              <p><b>Số đơn hàng:</b> {selectedOrder.dealerOrderNumber || "—"}</p>
              <p><b>Đại lý:</b> {getDealerName(selectedOrder)}</p>
              <p><b>Ngày đặt hàng:</b> {formatDate(selectedOrder.orderDate)}</p>
              <p><b>Ngày giao hàng dự kiến:</b> {formatDate(selectedOrder.expectedDeliveryDate)}</p>
              <p><b>Loại đơn hàng:</b> {selectedOrder.orderType || "—"}</p>
              <p><b>Độ ưu tiên:</b> {selectedOrder.priority || "—"}</p>
              <p><b>Tổng số lượng:</b> {selectedOrder.totalQuantity || 0}</p>
              <p><b>Tổng tiền:</b> {formatPrice(selectedOrder.totalAmount)}</p>
              <p><b>Trạng thái:</b> {selectedOrder.status || "—"}</p>
              <p><b>Trạng thái duyệt:</b> {selectedOrder.approvalStatus || "—"}</p>
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <b>Danh sách xe:</b>
                  <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f0f0f0" }}>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>STT</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Phiên bản</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Màu</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Số lượng</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Giá đơn vị</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{index + 1}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{getVariantName(item.variantId)}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{getColorName(item.colorId)}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.quantity || 0}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{formatPrice(item.unitPrice)}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{formatPrice((item.unitPrice || 0) * (item.quantity || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

