import './Order.css'
import { FaSearch, FaEye, FaPen, FaTrash, FaSpinner, FaExclamationCircle, FaCheckCircle, FaClock, FaTimesCircle, FaPlus, FaExternalLinkAlt, FaFileAlt, FaDollarSign } from "react-icons/fa";
import { useEffect, useState } from "react";
// API cần đăng nhập - dùng cho quản lý đơn hàng khách hàng (Admin/Staff)
import { orderAPI, customerAPI, quotationAPI, dealerQuotationAPI, inventoryAPI } from "../../services/API";

export default function Order(){
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  
  // Form data for create/edit
  const [formData, setFormData] = useState({
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
  
  // Data for form
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [inventories, setInventories] = useState([]);

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

  // Fetch data for form
  const fetchData = async () => {
    try {
      // Fetch customers
      try {
        const customersRes = await customerAPI.getCustomers();
        const customersData = customersRes.data || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch customers:", err);
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
        setQuotations(allQuotations);
      } catch (err) {
        console.error("❌ Lỗi fetch quotations:", err);
        setQuotations([]);
      }
      
      // Fetch inventories
      try {
        const inventoriesRes = await inventoryAPI.getInventory();
        const allInventories = inventoriesRes.data || [];
        const availableInventories = Array.isArray(allInventories) 
          ? allInventories.filter(inv => {
              const status = inv.status?.toUpperCase() || inv.vehicleStatus?.toUpperCase() || "";
              return status === "AVAILABLE";
            })
          : [];
        setInventories(availableInventories);
      } catch (err) {
        console.error("❌ Lỗi fetch inventories:", err);
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
      fetchData();
    }
  }, [showPopup]);

  // Tìm kiếm realtime với debounce (giống Dealer.jsx)
  useEffect(() => {
    const delay = setTimeout(() => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchOrder();
        return;
      }
      // Filter local data
      const filtered = order.filter((o) => {
        const keyword = trimmed.toLowerCase();
        return (
          (o.orderNumber && String(o.orderNumber).toLowerCase().includes(keyword)) ||
          (o.status && String(o.status).toLowerCase().includes(keyword)) ||
          (o.customer?.firstName && String(o.customer.firstName).toLowerCase().includes(keyword)) ||
          (o.customer?.lastName && String(o.customer.lastName).toLowerCase().includes(keyword)) ||
          (o.customer?.email && String(o.customer.email).toLowerCase().includes(keyword)) ||
          (o.quotation?.customer?.firstName && String(o.quotation.customer.firstName).toLowerCase().includes(keyword)) ||
          (o.quotation?.customer?.lastName && String(o.quotation.customer.lastName).toLowerCase().includes(keyword))
        );
      });
      // Note: In a real app, you might want to call an API search endpoint here
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

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
      alert("Xóa đơn hàng thành công!");
      await fetchOrder();
    } catch (err) {
      console.error("Lỗi khi xóa đơn hàng:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Mở form thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedOrder(null);
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
    setError(null);
    setShowPopup(true);
  };

  // Mở form sửa
  const handleEdit = async (orderItem) => {
    try {
      setIsEdit(true);
      setSelectedOrder(orderItem);
      // Load full order details
      const res = await orderAPI.getOrder(orderItem.orderId || orderItem.id);
      const fullOrder = res.data || orderItem;
      
      setFormData({
        createFrom: fullOrder.quotationId ? "quotation" : "customer",
        quotationId: fullOrder.quotationId || "",
        customerId: fullOrder.customerId || "",
        inventoryId: fullOrder.inventoryId || "",
        orderDate: fullOrder.orderDate ? fullOrder.orderDate.split('T')[0] : new Date().toISOString().split('T')[0],
        orderType: fullOrder.orderType || "RETAIL",
        paymentStatus: fullOrder.paymentStatus || "PENDING",
        deliveryStatus: fullOrder.deliveryStatus || "PENDING",
        status: fullOrder.status || "pending",
        totalAmount: fullOrder.totalAmount || "",
        depositAmount: fullOrder.depositAmount || "",
        balanceAmount: fullOrder.balanceAmount || "",
        paymentMethod: fullOrder.paymentMethod || "cash",
        deliveryDate: fullOrder.deliveryDate ? fullOrder.deliveryDate.split('T')[0] : "",
        notes: fullOrder.notes || "",
        specialRequests: fullOrder.specialRequests || "",
      });
      setError(null);
      setShowPopup(true);
    } catch (err) {
      console.error("Lỗi khi load chi tiết đơn hàng:", err);
      alert("Không thể tải chi tiết đơn hàng!");
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
      (o.customer?.firstName && String(o.customer.firstName).toLowerCase().includes(keyword)) ||
      (o.customer?.lastName && String(o.customer.lastName).toLowerCase().includes(keyword)) ||
      (o.customer?.email && String(o.customer.email).toLowerCase().includes(keyword)) ||
      (o.quotation?.customer?.firstName && String(o.quotation.customer.firstName).toLowerCase().includes(keyword)) ||
      (o.quotation?.customer?.lastName && String(o.quotation.customer.lastName).toLowerCase().includes(keyword))
    );
  });

  // Xử lý khi nhấn nút "Xem"
  const handleView = async (orderItem) => {
    try {
      const res = await orderAPI.getOrder(orderItem.orderId || orderItem.id);
      setSelectedOrder(res.data || orderItem);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      setSelectedOrder(orderItem);
      setShowDetail(true);
    }
  };

  // Helper functions
  const getCustomerName = (orderOrCustomer) => {
    if (orderOrCustomer && typeof orderOrCustomer === 'object' && 'orderId' in orderOrCustomer) {
      const order = orderOrCustomer;
      if (order.customer) {
        const customer = order.customer;
        if (customer.firstName && customer.lastName) {
          return `${customer.firstName} ${customer.lastName}`;
        }
        return customer.fullName || customer.name || "—";
      }
      if (order.quotation?.customer) {
        const customer = order.quotation.customer;
        if (customer.firstName && customer.lastName) {
          return `${customer.firstName} ${customer.lastName}`;
        }
        return customer.fullName || customer.name || "—";
      }
      return "—";
    }
    const customer = orderOrCustomer;
    if (!customer) return "—";
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    return customer.fullName || customer.name || "—";
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

  // Tạo/sửa đơn hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
      const payload = {
        quotationId: formData.createFrom === "quotation" && formData.quotationId ? String(formData.quotationId).trim() : null,
        customerId: formData.createFrom === "customer" && formData.customerId ? String(formData.customerId).trim() : null,
        inventoryId: formData.inventoryId ? String(formData.inventoryId).trim() : null,
        orderDate: formData.orderDate || null,
        deliveryDate: formData.deliveryDate || null,
        orderType: formData.orderType || null,
        paymentStatus: formData.paymentStatus || null,
        deliveryStatus: formData.deliveryStatus || null,
        status: formData.status || null,
        paymentMethod: formData.paymentMethod || null,
        notes: formData.notes || null,
        specialRequests: formData.specialRequests || null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        balanceAmount: formData.balanceAmount ? parseFloat(formData.balanceAmount) : null,
      };

      // Khi edit, có thể gửi totalAmount
      if (isEdit && formData.totalAmount) {
        payload.totalAmount = parseFloat(formData.totalAmount);
      }

      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === "" || payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      if (!payload.quotationId && !payload.customerId) {
        setError("Vui lòng chọn báo giá hoặc khách hàng!");
        return;
      }

      if (isEdit && selectedOrder) {
        await orderAPI.updateOrder(selectedOrder.orderId || selectedOrder.id, payload);
        alert("Cập nhật đơn hàng thành công!");
      } else {
        await orderAPI.createOrder(payload);
        alert("Tạo đơn hàng thành công!");
      }
      
      setShowPopup(false);
      await fetchOrder();
      
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
    } catch (err) {
      console.error("Lỗi khi lưu đơn hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể lưu đơn hàng!";
      setError(errorMsg);
    }
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
      <div className="title-customer">Đơn hàng khách hàng</div>

      <div className="title2-customer">
        <h2>Danh sách đơn hàng</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Thêm đơn hàng</h3>
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
      {error && !showPopup && (
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
                      <span className="order-number">{c.orderNumber || "—"}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">
                          {getCustomerName(c)}
                        </span>
                        {(c.customer?.email || c.quotation?.customer?.email) && (
                          <span className="customer-email">{c.customer?.email || c.quotation?.customer?.email}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <span className="vehicle-brand">
                          {c.inventory?.variant?.variantName 
                            ? c.inventory.variant.variantName
                            : c.quotation?.variant?.model?.brand?.brandName || 'N/A'}
                        </span>
                        <span className="vehicle-model">
                          {c.quotation?.variant?.model?.modelName || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="price-amount">
                        {formatPrice(c.totalAmount || c.quotation?.finalPrice)}
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
                        {formatDate(c.orderDate)}
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
                      <button 
                        className="icon-btn edit" 
                        onClick={() => handleEdit(c)}
                        disabled={deleting === c.orderId}
                        title="Sửa đơn hàng"
                      >
                        <FaPen />
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
              <h3>{searchTerm ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng'}</h3>
              {!searchTerm && (
                <button className="btn-primary" onClick={handleOpenAdd}>
                  Tạo đơn hàng
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popup thêm/sửa đơn hàng */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2>{isEdit ? "Sửa đơn hàng" : "Thêm đơn hàng mới"}</h2>
            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              {!isEdit && (
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
              )}

              {(!isEdit && formData.createFrom === "quotation") ? (
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
                    <label>Khách hàng {!isEdit && "*"}</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      required={!isEdit}
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

              {isEdit && (
                <div style={{ marginBottom: "15px" }}>
                  <label>Tổng tiền</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  />
                </div>
              )}

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
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo đơn hàng"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
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
                    <span className="detail-value">
                      {selectedOrder.orderNumber || "—"}
                      {selectedOrder.orderNumber && (
                        <a
                          href={`/order/track/${selectedOrder.orderNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            marginLeft: "12px",
                            color: "#667eea",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            fontWeight: "600"
                          }}
                          title="Xem trang theo dõi đơn hàng"
                        >
                          <FaExternalLinkAlt />
                          Xem trang công khai
                        </a>
                      )}
                    </span>
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
                      {formatDate(selectedOrder.orderDate)}
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
                      {getCustomerName(selectedOrder)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedOrder.customer?.email || selectedOrder.quotation?.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedOrder.customer?.phone || selectedOrder.quotation?.customer?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin xe</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Thương hiệu</span>
                    <span className="detail-value">
                      {selectedOrder.inventory?.variant?.model?.brand?.brandName || selectedOrder.quotation?.variant?.model?.brand?.brandName || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dòng xe</span>
                    <span className="detail-value">
                      {selectedOrder.inventory?.variant?.variantName || selectedOrder.quotation?.variant?.model?.modelName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quotation Information */}
              {(selectedOrder.quotationId || selectedOrder.quotation) && (
                <div className="detail-section">
                  <h3>
                    <FaFileAlt style={{ marginRight: "8px" }} />
                    Báo giá liên quan
                  </h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Số báo giá</span>
                      <span className="detail-value">
                        {selectedOrder.quotation?.quotationNumber || selectedOrder.quotationId || "—"}
                        {selectedOrder.quotationId && (
                          <a
                            href={`/quotation/${selectedOrder.quotationId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              marginLeft: "12px",
                              color: "#667eea",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "14px",
                              fontWeight: "600"
                            }}
                            title="Xem báo giá"
                          >
                            <FaExternalLinkAlt />
                            Xem
                          </a>
                        )}
                      </span>
                    </div>
                    {selectedOrder.quotation?.finalPrice && (
                      <div className="detail-item">
                        <span className="detail-label">Giá báo giá</span>
                        <span className="detail-value">
                          {formatPrice(selectedOrder.quotation.finalPrice)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.quotation?.status && (
                      <div className="detail-item">
                        <span className="detail-label">Trạng thái báo giá</span>
                        <span className="detail-value">{selectedOrder.quotation.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Thông tin thanh toán</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tổng tiền</span>
                    <span className="detail-value price-highlight">
                      {formatPrice(selectedOrder.totalAmount || selectedOrder.quotation?.finalPrice)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tiền đặt cọc</span>
                    <span className="detail-value">
                      {formatPrice(selectedOrder.depositAmount)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Số tiền còn lại</span>
                    <span className="detail-value">
                      {formatPrice(selectedOrder.balanceAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <FaDollarSign style={{ marginRight: "8px" }} />
                    Lịch sử thanh toán
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {selectedOrder.payments.map((payment, index) => (
                      <div
                        key={payment.paymentId || payment.id || index}
                        style={{
                          padding: "16px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          borderLeft: "4px solid #667eea"
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Mã thanh toán:</span>
                            <div style={{ color: "#1e293b", fontSize: "16px", fontWeight: "600" }}>
                              {payment.paymentNumber || payment.paymentId || "—"}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Số tiền:</span>
                            <div style={{ color: "#1e293b", fontSize: "16px", fontWeight: "600" }}>
                              {formatPrice(payment.amount)}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Phương thức:</span>
                            <div style={{ color: "#1e293b", fontSize: "16px", fontWeight: "600" }}>
                              {payment.paymentMethod || "—"}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Trạng thái:</span>
                            <div>
                              <span className={`status-badge ${getStatusBadge(payment.status)}`}>
                                {payment.status || "—"}
                              </span>
                            </div>
                          </div>
                          {payment.paymentDate && (
                            <div style={{ gridColumn: "1 / -1" }}>
                              <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Ngày thanh toán:</span>
                              <div style={{ color: "#1e293b", fontSize: "16px", fontWeight: "600" }}>
                                {formatDate(payment.paymentDate)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
