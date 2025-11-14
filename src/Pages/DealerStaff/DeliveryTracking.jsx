import { FaSearch, FaEye, FaCalendarAlt, FaTruck, FaCheckCircle, FaClock } from "react-icons/fa";
import { useEffect, useState } from "react";
import { appointmentAPI, orderAPI, vehicleDeliveryAPI, customerAPI } from "../../services/API";
import "./Customer.css"; // dùng lại style có sẵn

export default function DeliveryTracking() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [enrichedAppointment, setEnrichedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy danh sách lịch hẹn giao xe
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentAPI.getAppointments();
      let appointmentsData = res.data?.data || res.data || [];
      
      // Chỉ lấy appointments loại "delivery"
      appointmentsData = appointmentsData.filter(apt => {
        const type = (apt.appointmentType || apt.type || "").toLowerCase();
        return type === "delivery" || type === "giao xe";
      });
      
      console.log("📅 Delivery appointments data:", appointmentsData);
      
      // Enrich appointments với order, customer, và delivery data
      const enrichedAppointments = await Promise.all(
        appointmentsData.map(async (appointment) => {
          let enriched = { ...appointment };
          
          // Fetch order nếu có orderId
          if (appointment.orderId && !appointment.order) {
            try {
              const orderRes = await orderAPI.getOrder(appointment.orderId);
              const orderData = orderRes.data?.data || orderRes.data || orderRes;
              enriched.order = orderData;
              
              // Fetch customer nếu cần
              if (orderData.customerId && !orderData.customer) {
                try {
                  const customerRes = await customerAPI.getCustomer(orderData.customerId);
                  const customerData = customerRes.data?.data || customerRes.data || customerRes;
                  enriched.order = { ...orderData, customer: customerData };
                } catch (err) {
                  console.error(`❌ Lỗi fetch customer:`, err);
                }
              }
            } catch (err) {
              console.error(`❌ Lỗi fetch order:`, err);
            }
          }
          
          // Fetch delivery nếu có (từ orderId)
          if (appointment.orderId) {
            try {
              const deliveryRes = await vehicleDeliveryAPI.getDeliveriesByOrder(appointment.orderId);
              const deliveriesData = deliveryRes.data?.data || deliveryRes.data || [];
              if (deliveriesData.length > 0) {
                enriched.delivery = deliveriesData[0]; // Lấy delivery đầu tiên
              }
            } catch (err) {
              console.warn(`⚠️ Không tìm thấy delivery cho order ${appointment.orderId}:`, err);
            }
          }
          
          return enriched;
        })
      );
      
      setAppointments(Array.isArray(enrichedAppointments) ? enrichedAppointments : []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách lịch hẹn:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🔹 Xem chi tiết
  const handleView = async (appointment) => {
    setSelectedAppointment(appointment);
    setEnrichedAppointment(null);
    setShowDetail(true);
    
    // Fetch thêm data nếu cần
    try {
      let enriched = { ...appointment };
      
      // Fetch order nếu chưa có
      if (appointment.orderId && !appointment.order) {
        const orderRes = await orderAPI.getOrder(appointment.orderId);
        const orderData = orderRes.data?.data || orderRes.data || orderRes;
        enriched.order = orderData;
        
        // Fetch customer
        if (orderData.customerId && !orderData.customer) {
          const customerRes = await customerAPI.getCustomer(orderData.customerId);
          const customerData = customerRes.data?.data || customerRes.data || customerRes;
          enriched.order = { ...orderData, customer: customerData };
        }
      }
      
      // Fetch delivery
      if (appointment.orderId) {
        try {
          const deliveryRes = await vehicleDeliveryAPI.getDeliveriesByOrder(appointment.orderId);
          const deliveriesData = deliveryRes.data?.data || deliveryRes.data || [];
          if (deliveriesData.length > 0) {
            enriched.delivery = deliveriesData[0];
          }
        } catch (err) {
          console.warn("⚠️ Không tìm thấy delivery");
        }
      }
      
      setEnrichedAppointment(enriched);
    } catch (err) {
      console.error("❌ Lỗi khi fetch chi tiết:", err);
    }
  };

  // 🔹 Lọc tìm kiếm
  const filteredAppointments = appointments.filter((a) => {
    if (!a) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (a.appointmentNumber && String(a.appointmentNumber).toLowerCase().includes(keyword)) ||
      (a.customerName && String(a.customerName).toLowerCase().includes(keyword)) ||
      (a.order?.orderNumber && String(a.order.orderNumber).toLowerCase().includes(keyword)) ||
      (a.status && String(a.status).toLowerCase().includes(keyword))
    );
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower === "scheduled" || statusLower.includes("chờ")) return "status-pending";
    if (statusLower === "confirmed" || statusLower.includes("xác nhận")) return "status-confirmed";
    if (statusLower === "completed" || statusLower.includes("hoàn tất")) return "status-completed";
    if (statusLower === "cancelled" || statusLower.includes("hủy")) return "status-cancelled";
    return "status-default";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower === "scheduled" || statusLower.includes("chờ")) return <FaClock />;
    if (statusLower === "confirmed" || statusLower.includes("xác nhận")) return <FaCheckCircle />;
    if (statusLower === "completed" || statusLower.includes("hoàn tất")) return <FaCheckCircle />;
    return <FaCalendarAlt />;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString("vi-VN");
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <div className="customer">
        <div className="loading-container">
          <p>Đang tải danh sách lịch hẹn giao xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">🚚</span>
        Theo dõi giao xe từ lịch hẹn
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách lịch hẹn giao xe</h2>
          <p className="subtitle">{appointments.length} lịch hẹn tổng cộng</p>
        </div>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã lịch hẹn, khách hàng, mã đơn hàng..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        {filteredAppointments.length > 0 ? (
          <table className="customer-table">
            <thead>
              <tr>
                <th>MÃ LỊCH HẸN</th>
                <th>KHÁCH HÀNG</th>
                <th>MÃ ĐƠN HÀNG</th>
                <th>NGÀY GIỜ GIAO XE</th>
                <th>ĐỊA CHỈ GIAO XE</th>
                <th>TRẠNG THÁI</th>
                <th>ĐƠN GIAO XE</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => {
                const customer = a.order?.customer || {};
                const customerName = a.customerName || 
                  `${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim() || "—";
                const orderNumber = a.order?.orderNumber || a.order?.orderId || "—";
                const deliveryStatus = a.delivery?.status || a.delivery?.deliveryStatus || "";
                const hasDelivery = !!a.delivery;
                
                return (
                  <tr key={a.appointmentId || a.id}>
                    <td>
                      <span className="order-number">{a.appointmentNumber || a.appointmentId || a.id}</span>
                    </td>
                    <td>{customerName}</td>
                    <td>
                      <span className="order-number">{orderNumber}</span>
                    </td>
                    <td>
                      <span className="date-text">
                        {formatDate(a.appointmentDate)}
                      </span>
                    </td>
                    <td>{a.deliveryAddress || a.location || "—"}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(a.status)}`}>
                        {getStatusIcon(a.status)}
                        <span>{a.status || "—"}</span>
                      </span>
                    </td>
                    <td>
                      {hasDelivery ? (
                        <span className="status-badge status-confirmed">
                          <FaTruck />
                          <span>{deliveryStatus || "Đã tạo"}</span>
                        </span>
                      ) : (
                        <span className="status-badge status-pending">
                          <FaClock />
                          <span>Chưa tạo</span>
                        </span>
                      )}
                    </td>
                    <td className="action-buttons">
                      <button
                        className="icon-btn view"
                        onClick={() => handleView(a)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>{searchTerm ? "Không tìm thấy lịch hẹn" : "Chưa có lịch hẹn giao xe nào"}</h3>
          </div>
        )}
      </div>

      {/* Popup xem chi tiết */}
      {showDetail && (enrichedAppointment || selectedAppointment) && (() => {
        const appointment = enrichedAppointment || selectedAppointment;
        const customer = appointment.order?.customer || {};
        const customerName = appointment.customerName || 
          `${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim() || "—";
        const order = appointment.order || {};
        const delivery = appointment.delivery || {};
        const variant = order.inventory?.variant || order.quotation?.variant || {};
        const brand = variant?.model?.brand || variant?.brand || {};
        const brandName = brand?.brandName || brand?.brand_name || brand?.name || "—";
        const variantName = variant?.variantName || variant?.variant_name || variant?.name || "—";
        
        return (
          <div className="popup-overlay">
            <div className="popup-box detail-popup" style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
              <div className="popup-header">
                <h2>Chi tiết lịch hẹn giao xe</h2>
                <button className="popup-close" onClick={() => {
                  setShowDetail(false);
                  setSelectedAppointment(null);
                  setEnrichedAppointment(null);
                }}>
                  ✕
                </button>
              </div>
              <div className="popup-content">
                <div className="detail-section">
                  <h3>Thông tin lịch hẹn</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Mã lịch hẹn</span>
                      <span className="detail-value">{appointment.appointmentNumber || appointment.appointmentId || appointment.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Ngày giờ giao xe</span>
                      <span className="detail-value">{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Địa chỉ giao xe</span>
                      <span className="detail-value">{appointment.deliveryAddress || appointment.location || "—"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Trạng thái</span>
                      <span className={`status-badge ${getStatusBadge(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span>{appointment.status || "—"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Thông tin khách hàng</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Họ tên</span>
                      <span className="detail-value">{customerName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{customer.email || appointment.customerEmail || "—"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Điện thoại</span>
                      <span className="detail-value">{customer.phone || customer.phoneNumber || appointment.customerPhone || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Thông tin đơn hàng</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Mã đơn hàng</span>
                      <span className="detail-value">{order.orderNumber || order.orderId || "—"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Thương hiệu</span>
                      <span className="detail-value">{brandName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Dòng xe</span>
                      <span className="detail-value">{variantName}</span>
                    </div>
                  </div>
                </div>

                {delivery && Object.keys(delivery).length > 0 && (
                  <div className="detail-section">
                    <h3>Thông tin đơn giao xe</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Mã đơn giao xe</span>
                        <span className="detail-value">{delivery.deliveryNumber || delivery.deliveryId || delivery.id || "—"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Trạng thái</span>
                        <span className={`status-badge ${getStatusBadge(delivery.status || delivery.deliveryStatus)}`}>
                          <FaTruck />
                          <span>{delivery.status || delivery.deliveryStatus || "—"}</span>
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Ngày giao dự kiến</span>
                        <span className="detail-value">{formatDate(delivery.expectedDeliveryDate || delivery.scheduledDate)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {appointment.notes && (
                  <div className="detail-section">
                    <h3>Ghi chú</h3>
                    <p>{appointment.notes}</p>
                  </div>
                )}
              </div>
              <div className="popup-footer">
                <button className="btn-primary" onClick={() => {
                  setShowDetail(false);
                  setSelectedAppointment(null);
                  setEnrichedAppointment(null);
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

