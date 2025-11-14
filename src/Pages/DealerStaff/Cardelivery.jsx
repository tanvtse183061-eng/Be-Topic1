import { FaSearch, FaEye, FaPen, FaTrash, FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vehicleDeliveryAPI, orderAPI } from "../../services/API";
import "./Customer.css"; // dùng lại style có sẵn

export default function Cardelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [enrichedDelivery, setEnrichedDelivery] = useState(null);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    orderId: "",
    deliveryAddress: "",
    expectedDeliveryDate: "",
    notes: ""
  });

  // 🔹 Lấy danh sách đơn hàng đã thanh toán
  const fetchPaidOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      const ordersData = res.data?.data || res.data || [];
      // Lọc các đơn hàng đã thanh toán
      const paidOrders = ordersData.filter(order => {
        const status = (order.status || "").toLowerCase();
        const paymentStatus = (order.paymentStatus || "").toLowerCase();
        return status === "paid" || paymentStatus === "completed";
      });
      setOrders(paidOrders);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", err);
      setOrders([]);
    }
  };

  // 🔹 Lấy danh sách giao xe
  const fetchDeliveries = async () => {
    try {
      const res = await vehicleDeliveryAPI.getDeliveries();
      let deliveriesData = res.data?.data || res.data || [];
      console.log("📦 Deliveries data:", deliveriesData);
      
      // Fetch order data nếu chỉ có orderId
      const enrichedDeliveries = await Promise.all(
        deliveriesData.map(async (delivery) => {
          let enrichedDelivery = { ...delivery };
          
          // Fetch order nếu chỉ có orderId
          if (!enrichedDelivery.order && enrichedDelivery.orderId) {
            try {
              const orderRes = await orderAPI.getOrder(enrichedDelivery.orderId);
              const orderData = orderRes.data?.data || orderRes.data || orderRes;
              enrichedDelivery.order = orderData;
              
              // Fetch customer nếu cần
              if (orderData.customerId && !orderData.customer) {
                try {
                  const { customerAPI } = await import("../../services/API");
                  const customerRes = await customerAPI.getCustomer(orderData.customerId);
                  const customerData = customerRes.data?.data || customerRes.data || customerRes;
                  enrichedDelivery.order = { ...orderData, customer: customerData };
                } catch (err) {
                  console.error(`❌ Lỗi fetch customer:`, err);
                }
              }
            } catch (err) {
              console.error(`❌ Lỗi fetch order:`, err);
            }
          }
          
          return enrichedDelivery;
        })
      );
      
      setDeliveries(Array.isArray(enrichedDeliveries) ? enrichedDeliveries : []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách giao xe:", err);
      setDeliveries([]);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchPaidOrders();
  }, []);

  // 🔹 Xoá giao xe
  const handleDelete = async (deliveryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn giao xe này không?")) return;
    try {
      await vehicleDeliveryAPI.deleteDelivery(deliveryId);
      alert("Xóa giao xe thành công!");
      fetchDeliveries();
    } catch (err) {
      console.error("Lỗi khi xóa giao xe:", err);
      alert("Xóa thất bại!");
    }
  };

  // 🔹 Xác nhận giao xe (chuyển từ scheduled sang in_transit hoặc delivered)
  const handleConfirmDelivery = async (deliveryId) => {
    if (!deliveryId) {
      alert("❌ Không tìm thấy mã giao xe!");
      return;
    }
    
    if (!window.confirm("Bạn có chắc chắn muốn xác nhận giao xe này?\n\nSau khi xác nhận, trạng thái sẽ được cập nhật.")) return;
    
    try {
      // Đảm bảo deliveryId là string và trim
      const idToSend = String(deliveryId).trim();
      console.log("🔍 Xác nhận giao xe với ID:", idToSend);
      
      const response = await vehicleDeliveryAPI.confirmDelivery(idToSend);
      console.log("✅ Response từ confirmDelivery:", response);
      
      alert("✅ Xác nhận giao xe thành công!");
      fetchDeliveries();
      // Đóng popup nếu đang xem chi tiết delivery này
      if (showDetail && selectedDelivery && (selectedDelivery.deliveryId || selectedDelivery.id) === deliveryId) {
        setShowDetail(false);
        setSelectedDelivery(null);
        setEnrichedDelivery(null);
      }
    } catch (err) {
      console.error("❌ Lỗi khi xác nhận giao xe:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error data:", err.response?.data);
      
      let errorMsg = "Không thể xác nhận giao xe!";
      if (err.response?.data) {
        if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      alert(`❌ Xác nhận giao xe thất bại!\n\n${errorMsg}\n\nVui lòng kiểm tra lại hoặc liên hệ hỗ trợ.`);
    }
  };

  // 🔹 Lọc tìm kiếm theo khách hàng hoặc trạng thái
  const filteredDeliveries = deliveries.filter((d) => {
    const keyword = searchTerm.toLowerCase();
    return (
      d.deliveryNumber?.toLowerCase().includes(keyword) ||
      d.customer?.firstName?.toLowerCase().includes(keyword) ||
      d.customer?.lastName?.toLowerCase().includes(keyword) ||
      d.deliveryStatus?.toLowerCase().includes(keyword)
    );
  });

  // 🔹 Xử lý khi nhấn "Xem"
  const handleView = async (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetail(true);
    setEnrichedDelivery(null);
    
    // Fetch đầy đủ dữ liệu nếu chưa có
    let enriched = { ...delivery };
    
    if (!enriched.order && enriched.orderId) {
      try {
        const orderRes = await orderAPI.getOrder(enriched.orderId);
        const orderData = orderRes.data?.data || orderRes.data || orderRes;
        enriched.order = orderData;
        
        // Fetch customer nếu cần
        if (orderData.customerId && !orderData.customer) {
          try {
            const { customerAPI } = await import("../../services/API");
            const customerRes = await customerAPI.getCustomer(orderData.customerId);
            const customerData = customerRes.data?.data || customerRes.data || customerRes;
            enriched.order = { ...orderData, customer: customerData };
          } catch (err) {
            console.error("Lỗi fetch customer trong popup:", err);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch order trong popup:", err);
      }
    }
    
    if (!enriched.appointment && enriched.appointmentId) {
      try {
        const appointmentRes = await appointmentAPI.getAppointment(enriched.appointmentId);
        const appointmentData = appointmentRes.data?.data || appointmentRes.data || appointmentRes;
        enriched.appointment = appointmentData;
        
        // Nếu appointment có orderId nhưng chưa có order, fetch order
        if (appointmentData.orderId && !enriched.order) {
          try {
            const orderRes = await orderAPI.getOrder(appointmentData.orderId);
            const orderData = orderRes.data?.data || orderRes.data || orderRes;
            enriched.order = orderData;
            
            // Fetch customer nếu cần
            if (orderData.customerId && !orderData.customer) {
              try {
                const { customerAPI } = await import("../../services/API");
                const customerRes = await customerAPI.getCustomer(orderData.customerId);
                const customerData = customerRes.data?.data || customerRes.data || customerRes;
                enriched.order = { ...orderData, customer: customerData };
              } catch (err) {
                console.error("Lỗi fetch customer từ appointment:", err);
              }
            }
          } catch (err) {
            console.error("Lỗi fetch order từ appointment:", err);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch appointment trong popup:", err);
      }
    }
    
    setEnrichedDelivery(enriched);
  };

  // 🔹 Tạo đơn giao xe mới
  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    
    if (!formData.orderId) {
      alert("Vui lòng chọn đơn hàng!");
      return;
    }
    if (!formData.deliveryAddress) {
      alert("Vui lòng nhập địa chỉ giao!");
      return;
    }
    
    try {
      const payload = {
        orderId: formData.orderId,
        deliveryAddress: formData.deliveryAddress,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        notes: formData.notes || null
      };
      
      // Xóa các field null
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === "") {
          delete payload[key];
        }
      });
      
      console.log("📤 Tạo đơn giao xe:", payload);
      await vehicleDeliveryAPI.createDelivery(payload);
      alert("✅ Tạo đơn giao xe thành công!");
      setShowPopup(false);
      setFormData({
        orderId: "",
        deliveryAddress: "",
        expectedDeliveryDate: "",
        notes: ""
      });
      fetchDeliveries();
    } catch (err) {
      console.error("❌ Lỗi khi tạo đơn giao xe:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo đơn giao xe!";
      alert(`❌ Tạo đơn giao xe thất bại!\n\n${errorMsg}`);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý giao xe</div>

      <div className="title2-customer">
        <h2>Danh sách giao xe</h2>
        <h3 onClick={() => setShowPopup(true)}>+ Thêm đơn giao xe</h3>
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

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ GIAO XE</th>
              <th>MÃ ĐƠN HÀNG</th>
              <th>KHÁCH HÀNG</th>
              <th>XE</th>
              <th>ĐỊA CHỈ GIAO</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY GIAO DỰ KIẾN</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((d) => (
                <tr key={d.deliveryId}>
                  <td>{d.deliveryNumber || d.deliveryId || "—"}</td>
                  <td style={{ fontSize: "12px", fontFamily: "monospace" }}>
                    {d.order?.orderNumber || d.order?.orderId || d.orderId || "—"}
                  </td>
                  <td>
                    {(() => {
                      // Ưu tiên: order.customer > customer > appointment.customer
                      const customer = d.order?.customer || d.customer || d.appointment?.customer;
                      if (customer) {
                        return `${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim() || customer.email || "—";
                      }
                      return "—";
                    })()}
                  </td>
                  <td>
                    {(() => {
                      // Ưu tiên: inventory.variant > order.inventory.variant > order.quotation.variant > vehicle.variant
                      const variant = d.inventory?.variant || 
                                     d.order?.inventory?.variant || 
                                     d.order?.quotation?.variant ||
                                     d.vehicle?.variant;
                      if (variant) {
                        const brand = variant.model?.brand || variant.brand;
                        const brandName = brand?.brandName || brand?.brand_name || brand?.name || "";
                        const variantName = variant.variantName || variant.variant_name || variant.model?.modelName || variant.model?.model_name || variant.name || "";
                        return `${brandName} ${variantName}`.trim() || "—";
                      }
                      return "—";
                    })()}
                  </td>
                  <td>{d.deliveryAddress || d.address || d.appointment?.deliveryAddress || "—"}</td>
                  <td>
                    <span className={`status-badge ${
                      d.status === "scheduled" || d.status === "SCHEDULED" ? "scheduled" :
                      d.status === "in_transit" || d.status === "IN_TRANSIT" ? "in-transit" :
                      d.status === "delivered" || d.status === "DELIVERED" ? "delivered" :
                      d.status === "cancelled" || d.status === "CANCELLED" ? "cancelled" : "pending"
                    }`}>
                      {d.status || d.deliveryStatus || "—"}
                    </span>
                  </td>
                  <td>
                    {(() => {
                      // Ưu tiên: appointment.appointmentDate > scheduledDate > expectedDeliveryDate
                      const date = d.appointment?.appointmentDate || 
                                  d.scheduledDate || 
                                  d.expectedDeliveryDate;
                      if (date) {
                        try {
                          return new Date(date).toLocaleDateString("vi-VN");
                        } catch {
                          return date;
                        }
                      }
                      return "—";
                    })()}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="icon-btn view"
                      onClick={() => handleView(d)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    {(() => {
                      const status = (d.status || d.deliveryStatus || "").toLowerCase();
                      const canConfirm = status === "scheduled";
                      console.log("🔍 Delivery status check:", {
                        deliveryId: d.deliveryId,
                        status: d.status,
                        deliveryStatus: d.deliveryStatus,
                        normalizedStatus: status,
                        canConfirm
                      });
                      return canConfirm ? (
                        <button 
                          className="icon-btn approve" 
                          onClick={() => handleConfirmDelivery(d.deliveryId || d.id)}
                          title="Xác nhận giao xe"
                          style={{ background: "#16a34a", color: "white", margin: "0 5px" }}
                        >
                          <FaCheck />
                        </button>
                      ) : null;
                    })()}
                    <button className="icon-btn edit" title="Chỉnh sửa">
                      <FaPen />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(d.deliveryId || d.id)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu giao xe
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm giao xe */}
      {showPopup && (
        <div className="popup-overlay" onClick={(e) => e.target.className === "popup-overlay" && setShowPopup(false)}>
          <div className="popup-box" style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2>Tạo đơn giao xe mới</h2>
            <form onSubmit={handleCreateDelivery}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                  Chọn đơn hàng đã thanh toán <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders.map((order) => {
                    const customer = order.customer || {};
                    const customerName = `${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim();
                    return (
                      <option key={order.orderId || order.id} value={order.orderId || order.id}>
                        {order.orderNumber || order.orderId} - {customerName || "N/A"} - {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') + ' ₫' : 'N/A'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                  Địa chỉ giao <span style={{ color: "red" }}>*</span>
                </label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  required
                  placeholder="Nhập địa chỉ giao xe..."
                  rows="3"
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                  Ngày giao dự kiến
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nhập ghi chú (nếu có)..."
                  rows="3"
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowPopup(false);
                    setFormData({
                      orderId: "",
                      deliveryAddress: "",
                      expectedDeliveryDate: "",
                      notes: ""
                    });
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: "#16a34a", color: "white", padding: "10px 20px" }}
                >
                  Tạo đơn giao xe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && (enrichedDelivery || selectedDelivery) && (() => {
        const delivery = enrichedDelivery || selectedDelivery;
        const customer = delivery.order?.customer || delivery.customer || delivery.appointment?.customer;
        const variant = delivery.inventory?.variant || 
                       delivery.order?.inventory?.variant || 
                       delivery.order?.quotation?.variant ||
                       delivery.vehicle?.variant;
        const brand = variant?.model?.brand || variant?.brand;
        const brandName = brand?.brandName || brand?.brand_name || brand?.name || "";
        const variantName = variant?.variantName || variant?.variant_name || variant?.model?.modelName || variant?.model?.model_name || variant?.name || "";
        const deliveryAddress = delivery.deliveryAddress || delivery.address || delivery.appointment?.deliveryAddress || "—";
        const date = delivery.appointment?.appointmentDate || 
                    delivery.scheduledDate || 
                    delivery.expectedDeliveryDate;
        const canConfirm = delivery.status === "scheduled" || delivery.status === "SCHEDULED";
        
        return (
          <div className="popup-overlay">
            <div className="popup-box">
              <h2>Thông tin giao xe</h2>
              <p>
                <b>Số giao xe:</b> {delivery.deliveryNumber || delivery.deliveryId || "—"}
              </p>
              <p>
                <b>Khách hàng:</b>{" "}
                {customer
                  ? `${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim() || customer.email || "—"
                  : "—"}
              </p>
              <p>
                <b>Email:</b> {customer?.email || "—"}
              </p>
              <p>
                <b>Số điện thoại:</b> {customer?.phone || customer?.phoneNumber || customer?.mobile || "—"}
              </p>
              <p>
                <b>Xe:</b> {`${brandName} ${variantName}`.trim() || "—"}
              </p>
              <p>
                <b>Địa chỉ giao:</b> {deliveryAddress}
              </p>
              <p>
                <b>Trạng thái:</b> {delivery.status || delivery.deliveryStatus || "—"}
              </p>
              <p>
                <b>Ngày giao dự kiến:</b>{" "}
                {date
                  ? new Date(date).toLocaleString("vi-VN")
                  : "—"}
              </p>
              {delivery.appointment && (
                <p>
                  <b>Mã lịch hẹn:</b> {delivery.appointment.appointmentId || delivery.appointmentId || "—"}
                </p>
              )}
              {delivery.order && (
                <p>
                  <b>Mã đơn hàng:</b> {delivery.order.orderNumber || delivery.order.orderId || "—"}
                </p>
              )}
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                {canConfirm && (
                  <button 
                    className="btn-primary" 
                    onClick={() => handleConfirmDelivery(delivery.deliveryId || delivery.id)}
                    style={{ background: "#16a34a", color: "white", padding: "10px 20px" }}
                  >
                    <FaCheck style={{ marginRight: "5px" }} />
                    Xác nhận giao xe
                  </button>
                )}
                <button className="btn-close" onClick={() => {
                  setShowDetail(false);
                  setSelectedDelivery(null);
                  setEnrichedDelivery(null);
                }}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
