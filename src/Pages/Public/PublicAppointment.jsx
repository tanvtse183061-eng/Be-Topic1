import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicAppointmentAPI, publicOrderAPI, publicCustomerAPI, publicVehicleAPI } from "../../services/API";
import { FaCheck, FaSpinner, FaCalendarAlt } from "react-icons/fa";
import "./PublicAppointment.css";

export default function PublicAppointment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    appointmentDate: "",
    appointmentTime: "",
    deliveryAddress: "",
    notes: ""
  });

  const [redirectDetected, setRedirectDetected] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Kiểm tra trạng thái appointment
  const checkAppointmentStatus = async (appointmentId = null) => {
    try {
      // Lấy appointmentId từ sessionStorage nếu không có
      const idToCheck = appointmentId || sessionStorage.getItem(`appointment_${orderId}`);
      if (!idToCheck) return;
      
      console.log("🔍 Kiểm tra trạng thái appointment:", idToCheck);
      const res = await publicAppointmentAPI.getAppointment(idToCheck);
      const appointmentData = res.data?.data || res.data || res;
      
      console.log("📋 Appointment data:", appointmentData);
      
      const appointmentStatus = (appointmentData.status || "").toLowerCase();
      if (appointmentStatus === "confirmed") {
        console.log("✅ Appointment đã được xác nhận!");
        setConfirmedAppointment(appointmentData);
        setResult({
          type: "success",
          title: "✅ Lịch hẹn đã được xác nhận!",
          message: "Lịch giao xe của bạn đã được nhân viên xác nhận thành công. Đơn giao xe sẽ sớm được tạo trong hệ thống.",
          appointmentId: appointmentData.appointmentId || appointmentData.id,
          appointmentDate: appointmentData.appointmentDate,
          status: appointmentData.status,
          deliveryAddress: appointmentData.deliveryAddress || appointmentData.location || "—"
        });
      }
    } catch (err) {
      console.warn("⚠️ Không thể kiểm tra trạng thái appointment:", err);
      // Không hiển thị lỗi vì đây chỉ là check tự động
    }
  };

  useEffect(() => {
    console.log("🔍 PublicAppointment mounted, orderId:", orderId);
    console.log("🔍 Current URL:", window.location.href);
    console.log("🔍 Is authenticated:", !!localStorage.getItem("token"));
    
    // Đảm bảo không bị redirect bởi authentication checks
    const currentPath = window.location.pathname;
    sessionStorage.setItem("publicAppointmentPath", currentPath);
    
    fetchOrder();
    
    // Kiểm tra appointment đã được xác nhận chưa (sau khi fetch order xong)
    setTimeout(() => {
      checkAppointmentStatus();
    }, 1000);
    
    // Prevent any redirects - check sau mỗi render
    const checkRedirect = setInterval(() => {
      const currentLocation = window.location.pathname;
      if (currentLocation !== currentPath && !currentLocation.includes("/public/orders")) {
        console.warn("⚠️ Phát hiện redirect ra khỏi trang public appointment:", currentLocation);
        setRedirectDetected(true);
        // Khôi phục về trang public appointment
        window.history.replaceState(null, "", currentPath);
      }
    }, 100);
    
    return () => {
      console.log("🔍 PublicAppointment unmounting");
      clearInterval(checkRedirect);
      // Clear polling interval khi unmount
      if (window.appointmentPollInterval) {
        clearInterval(window.appointmentPollInterval);
        window.appointmentPollInterval = null;
      }
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await publicOrderAPI.getOrder(orderId);
      let orderData = res.data?.data || res.data || res;
      console.log("📋 Order data from API:", JSON.stringify(orderData, null, 2));
      
      // Nếu không có customer data nhưng có customerId, fetch customer riêng
      if ((!orderData.customer || !orderData.customer.firstName) && orderData.customerId) {
        try {
          console.log("🔄 Fetching customer data separately... customerId:", orderData.customerId);
          let customerData = null;
          
          // Thử fetch từ publicCustomerAPI
          try {
            const customerRes = await publicCustomerAPI.getCustomer(orderData.customerId);
            customerData = customerRes.data?.data || customerRes.data || customerRes;
            console.log("✅ Customer data từ publicCustomerAPI:", customerData);
          } catch (e) {
            console.warn("⚠️ Không thể fetch customer từ publicCustomerAPI:", e.response?.status, e.response?.data || e.message);
            // Nếu public API không khả dụng, có thể thử authenticated API nếu có token
            // Nhưng vì đây là public page, nên không dùng authenticated API
          }
          
          if (customerData && (customerData.firstName || customerData.first_name || customerData.email)) {
            console.log("✅ Customer data fetched successfully:", customerData);
            orderData = { ...orderData, customer: customerData };
          } else {
            console.warn("⚠️ Customer data không đầy đủ hoặc không tìm thấy");
            // Vẫn giữ customerId để có thể hiển thị thông báo
          }
        } catch (customerErr) {
          console.error("❌ Lỗi khi fetch customer:", customerErr);
          console.error("❌ Error details:", customerErr.response?.data || customerErr.message);
        }
      }
      
      // Nếu không có inventory data nhưng có inventoryId, fetch inventory riêng
      if ((!orderData.inventory || !orderData.inventory.variantId) && orderData.inventoryId) {
        try {
          console.log("🔄 Fetching inventory data separately... inventoryId:", orderData.inventoryId);
          const inventoriesRes = await publicVehicleAPI.getInventory();
          const inventories = Array.isArray(inventoriesRes.data?.data) ? inventoriesRes.data.data :
                            Array.isArray(inventoriesRes.data) ? inventoriesRes.data :
                            Array.isArray(inventoriesRes) ? inventoriesRes : [];
          const inventoryData = inventories.find(inv => 
            String(inv.inventoryId || inv.id) === String(orderData.inventoryId)
          );
          if (inventoryData) {
            console.log("✅ Inventory data found:", inventoryData);
            orderData = { ...orderData, inventory: inventoryData };
          } else {
            console.warn("⚠️ Không tìm thấy inventory với ID:", orderData.inventoryId);
          }
        } catch (inventoryErr) {
          console.error("❌ Lỗi khi fetch inventory:", inventoryErr);
          console.error("❌ Error details:", inventoryErr.response?.data || inventoryErr.message);
        }
      }
      
      // Nếu có inventory nhưng variant không đầy đủ (chỉ có ID), fetch variant riêng
      if (orderData.inventory) {
        const inventory = orderData.inventory;
        const variantId = inventory.variantId || inventory.variant?.variantId || inventory.variant?.id;
        
        if (variantId && !inventory.variant?.variantName && !inventory.variant?.model) {
          try {
            console.log("🔄 Fetching variant data separately...");
            const variantsRes = await publicVehicleAPI.getVariants();
            const variants = Array.isArray(variantsRes.data?.data) ? variantsRes.data.data :
                           Array.isArray(variantsRes.data) ? variantsRes.data :
                           Array.isArray(variantsRes) ? variantsRes : [];
            const variantData = variants.find(v => 
              (v.variantId || v.id) == variantId
            );
            if (variantData) {
              console.log("✅ Variant data found:", variantData);
              orderData = {
                ...orderData,
                inventory: {
                  ...inventory,
                  variant: variantData
                }
              };
            }
          } catch (variantErr) {
            console.error("❌ Lỗi khi fetch variant:", variantErr);
          }
        }
        
        // Nếu có colorId nhưng color không đầy đủ, fetch color riêng
        const colorId = inventory.colorId || inventory.color?.colorId || inventory.color?.id;
        if (colorId && !inventory.color?.colorName) {
          try {
            console.log("🔄 Fetching color data separately...");
            const colorsRes = await publicVehicleAPI.getColors();
            const colors = Array.isArray(colorsRes.data?.data) ? colorsRes.data.data :
                          Array.isArray(colorsRes.data) ? colorsRes.data :
                          Array.isArray(colorsRes) ? colorsRes : [];
            const colorData = colors.find(c => 
              (c.colorId || c.id) == colorId
            );
            if (colorData) {
              console.log("✅ Color data found:", colorData);
              orderData = {
                ...orderData,
                inventory: {
                  ...inventory,
                  color: colorData
                }
              };
            }
          } catch (colorErr) {
            console.error("❌ Lỗi khi fetch color:", colorErr);
          }
        }
      }
      
      // Kiểm tra quotation nếu có
      if (orderData.quotation) {
        const quotation = orderData.quotation;
        
        // Nếu quotation có variantId nhưng variant không đầy đủ
        const variantId = quotation.variantId || quotation.variant?.variantId || quotation.variant?.id;
        if (variantId && !quotation.variant?.variantName && !quotation.variant?.model) {
          try {
            console.log("🔄 Fetching quotation variant data separately...");
            const variantsRes = await publicVehicleAPI.getVariants();
            const variants = Array.isArray(variantsRes.data?.data) ? variantsRes.data.data :
                           Array.isArray(variantsRes.data) ? variantsRes.data :
                           Array.isArray(variantsRes) ? variantsRes : [];
            const variantData = variants.find(v => 
              (v.variantId || v.id) == variantId
            );
            if (variantData) {
              console.log("✅ Quotation variant data found:", variantData);
              orderData = {
                ...orderData,
                quotation: {
                  ...quotation,
                  variant: variantData
                }
              };
            }
          } catch (variantErr) {
            console.error("❌ Lỗi khi fetch quotation variant:", variantErr);
          }
        }
        
        // Nếu quotation có colorId nhưng color không đầy đủ
        const colorId = quotation.colorId || quotation.color?.colorId || quotation.color?.id;
        if (colorId && !quotation.color?.colorName) {
          try {
            console.log("🔄 Fetching quotation color data separately...");
            const colorsRes = await publicVehicleAPI.getColors();
            const colors = Array.isArray(colorsRes.data?.data) ? colorsRes.data.data :
                          Array.isArray(colorsRes.data) ? colorsRes.data :
                          Array.isArray(colorsRes) ? colorsRes : [];
            const colorData = colors.find(c => 
              (c.colorId || c.id) == colorId
            );
            if (colorData) {
              console.log("✅ Quotation color data found:", colorData);
              orderData = {
                ...orderData,
                quotation: {
                  ...quotation,
                  color: colorData
                }
              };
            }
          } catch (colorErr) {
            console.error("❌ Lỗi khi fetch quotation color:", colorErr);
          }
        }
      }
      
      console.log("📦 Order after fetching all data:", JSON.stringify(orderData, null, 2));
      
      // Tự động điền thông tin customer nếu có
      if (orderData.customer) {
        setFormData(prev => ({
          ...prev,
          customerName: `${orderData.customer.firstName || orderData.customer.first_name || ""} ${orderData.customer.lastName || orderData.customer.last_name || ""}`.trim(),
          customerEmail: orderData.customer.email || "",
          customerPhone: orderData.customer.phone || orderData.customer.phoneNumber || orderData.customer.mobile || ""
        }));
      }
      
      setOrder(orderData);
      
      // Kiểm tra xem order đã được paid chưa
      const status = orderData.status?.toLowerCase() || "";
      const paymentStatus = orderData.paymentStatus?.toLowerCase() || "";
      if (status !== "paid" && paymentStatus !== "completed") {
        setError("Đơn hàng chưa được thanh toán. Vui lòng thanh toán trước khi đặt lịch giao xe.");
      }
      
      // Kiểm tra appointment từ sessionStorage (nếu có)
      const savedAppointmentId = sessionStorage.getItem(`appointment_${orderId}`);
      if (savedAppointmentId) {
        checkAppointmentStatus(savedAppointmentId);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng:", err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tải đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("vi-VN");
    } catch {
      return date;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.appointmentDate || !formData.appointmentTime) {
      alert("Vui lòng chọn ngày và giờ giao xe!");
      return;
    }

    if (!formData.deliveryAddress) {
      alert("Vui lòng nhập địa chỉ giao xe!");
      return;
    }

    // Lấy thông tin khách hàng từ order
    const customer = order?.customer || {};
    const customerName = formData.customerName || `${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim();
    const customerPhone = formData.customerPhone || customer.phone || customer.phoneNumber || customer.mobile || "";
    const customerEmail = formData.customerEmail || customer.email || "";

    if (!customerName || !customerPhone || !customerEmail) {
      alert("Không tìm thấy thông tin khách hàng. Vui lòng tải lại trang!");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn đặt lịch giao xe này?\n\nSau khi đặt lịch, bạn sẽ nhận được xác nhận từ nhân viên.")) return;

    try {
      setSubmitting(true);
      
      // Kết hợp date và time thành datetime string
      const appointmentDateTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;
      
      const payload = {
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        orderId: orderId,
        appointmentDate: appointmentDateTime,
        deliveryAddress: formData.deliveryAddress,
        notes: formData.notes || undefined
      };
      
      console.log("📅 Gửi đặt lịch giao xe:", payload);
      const res = await publicAppointmentAPI.createDelivery(payload);
      const responseData = res.data?.data || res.data || res;
      
      console.log("✅ Response từ createDelivery:", responseData);
      
      const newAppointmentId = responseData.appointmentId;
      
      // Lưu appointmentId vào sessionStorage để có thể check lại sau
      if (newAppointmentId) {
        sessionStorage.setItem(`appointment_${orderId}`, newAppointmentId);
      }
      
      setResult({
        type: "success",
        title: "✅ Đặt lịch giao xe thành công!",
        message: responseData.message || "Delivery appointment booked successfully",
        appointmentId: newAppointmentId,
        appointmentDate: responseData.appointmentDate,
        status: responseData.status
      });
      
      // Fetch lại order để cập nhật trạng thái
      await fetchOrder();
      
      // Bắt đầu polling để check appointment status (mỗi 5 giây)
      // Lưu interval vào window để có thể clear khi cần
      if (newAppointmentId && !window.appointmentPollInterval) {
        window.appointmentPollInterval = setInterval(async () => {
          try {
            const checkRes = await publicAppointmentAPI.getAppointment(newAppointmentId);
            const checkData = checkRes.data?.data || checkRes.data || checkRes;
            const checkStatus = (checkData.status || "").toLowerCase();
            
            if (checkStatus === "confirmed") {
              console.log("✅ Appointment đã được xác nhận!");
              if (window.appointmentPollInterval) {
                clearInterval(window.appointmentPollInterval);
                window.appointmentPollInterval = null;
              }
              setConfirmedAppointment(checkData);
              setResult({
                type: "success",
                title: "✅ Lịch hẹn đã được xác nhận!",
                message: "Lịch giao xe của bạn đã được nhân viên xác nhận thành công. Đơn giao xe sẽ sớm được tạo trong hệ thống.",
                appointmentId: checkData.appointmentId || checkData.id,
                appointmentDate: checkData.appointmentDate,
                status: checkData.status,
                deliveryAddress: checkData.deliveryAddress || checkData.location || formData.deliveryAddress || "—"
              });
            }
          } catch (err) {
            console.warn("⚠️ Lỗi khi check appointment status:", err);
          }
        }, 5000); // Check mỗi 5 giây
        
        // Dừng polling sau 5 phút
        setTimeout(() => {
          if (window.appointmentPollInterval) {
            clearInterval(window.appointmentPollInterval);
            window.appointmentPollInterval = null;
          }
        }, 5 * 60 * 1000);
      }
      
      // Đảm bảo không có redirect nào xảy ra
      console.log("🔍 Đảm bảo vẫn ở trang public appointment:", window.location.href);
      
      // Force stay on current page - prevent any navigation
      const currentPath = `/public/orders/${orderId}/appointment`;
      if (window.location.pathname !== currentPath) {
        console.warn("⚠️ Phát hiện redirect sau đặt lịch, đang khôi phục...");
        // Sử dụng replace thay vì push để không tạo history entry
        window.history.replaceState(null, "", currentPath);
      }
      
      // Scroll to top để hiển thị result
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("❌ Lỗi khi đặt lịch:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể đặt lịch giao xe!";
      setResult({
        type: "error",
        title: "❌ Đặt lịch thất bại!",
        message: errorMsg
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-appointment-container">
        <div className="loading">Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="public-appointment-container">
        <div className="error-box">
          <h2>Không thể tải đơn hàng</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="public-appointment-container">
        <div className="error-box">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  const status = order.status?.toLowerCase() || "";
  const paymentStatus = order.paymentStatus?.toLowerCase() || "";
  const canBook = status === "paid" || paymentStatus === "completed";

  const customer = order.customer || {};
  const inventory = order.inventory || {};
  const variant = inventory?.variant || order.quotation?.variant || {};
  const color = inventory?.color || order.quotation?.color || {};
  const brand = variant?.model?.brand || variant?.brand || {};
  const brandName = brand?.brandName || brand?.brand_name || brand?.name || "—";
  const variantName = variant?.variantName || variant?.variant_name || variant?.name || "—";
  const colorName = color?.colorName || color?.color_name || color?.name || "—";

  // Nếu phát hiện redirect, hiển thị warning
  if (redirectDetected) {
    console.warn("⚠️ Redirect đã bị phát hiện và đã khôi phục");
  }

  return (
    <div className="public-appointment-container">
      {redirectDetected && (
        <div style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#fef3c7",
          color: "#92400e",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "2px solid #f59e0b",
          zIndex: 10000,
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          ⚠️ Đã phát hiện redirect không mong muốn. Trang đã được khôi phục.
        </div>
      )}
      <div className="appointment-card">
        <div className="appointment-header">
          <h1>Đặt lịch giao xe</h1>
          <div className="order-number">Mã đơn hàng: <strong>{order.orderNumber || order.orderId}</strong></div>
        </div>

        {result && (
          <div className={`result-box ${result.type}`}>
            <h3>{result.title}</h3>
            <p>{result.message}</p>
            {result.appointmentId && (
              <div className="appointment-info">
                <p><strong>Mã lịch hẹn:</strong> {result.appointmentId}</p>
                <p><strong>Ngày giờ giao xe:</strong> {result.appointmentDate ? new Date(result.appointmentDate).toLocaleString("vi-VN") : "—"}</p>
                <p><strong>Địa chỉ giao xe:</strong> {formData.deliveryAddress || "—"}</p>
                <p><strong>Trạng thái:</strong> {result.status === "scheduled" ? "Đã đặt lịch - Chờ xác nhận" : result.status}</p>
              </div>
            )}
            {result.type === "success" && (
              <div style={{
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "1px solid rgba(255,255,255,0.3)"
              }}>
                <p style={{ marginBottom: "15px", fontSize: "14px", opacity: 0.95 }}>
                  Lịch giao xe của bạn đã được ghi nhận và đang chờ xác nhận từ nhân viên.
                  Sau khi được xác nhận, đơn giao xe sẽ tự động được tạo trong hệ thống.
                </p>
                <button 
                  onClick={() => {
                    // Có thể điều hướng hoặc đóng result box
                    setResult(null);
                    // Scroll to top để hiển thị thông tin đơn hàng
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "white",
                    color: "#16a34a",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,255,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FaCheck /> Xác nhận
                </button>
              </div>
            )}
            <div className="result-actions">
              <button onClick={() => {
                if (result.type === "success") {
                  // Nếu đã thành công, đóng result box
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  setResult(null);
                }
              }}>
                {result.type === "success" ? "Đóng" : "Đóng"}
              </button>
            </div>
          </div>
        )}

        <div className="appointment-content">
          <div className="order-info-section">
            <h3>Thông tin đơn hàng</h3>
            <div className="info-row">
              <div className="info-item">
                <label>Khách hàng:</label>
                <span>{`${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim() || "—"}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{customer.email || "—"}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <label>Thương hiệu:</label>
                <span>{brandName}</span>
              </div>
              <div className="info-item">
                <label>Dòng xe:</label>
                <span>{variantName}</span>
              </div>
              <div className="info-item">
                <label>Màu sắc:</label>
                <span>{colorName}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <label>Ngày đặt hàng:</label>
                <span>{formatDate(order.orderDate || order.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>Trạng thái:</label>
                <span className={`status ${status}`}>
                  {status === "paid" ? "Đã thanh toán" : 
                   status === "confirmed" ? "Đã xác nhận" :
                   status === "pending" ? "Chờ xử lý" :
                   status}
                </span>
              </div>
            </div>
          </div>

          {!result && (
            <>
              {canBook ? (
                <form onSubmit={handleSubmit} className="appointment-form">
                  <h3>Thông tin đặt lịch giao xe</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Ngày giao xe <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                        required
                        disabled={submitting}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Giờ giao xe <span className="required">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Địa chỉ giao xe <span className="required">*</span>
                    </label>
                    <textarea
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      required
                      disabled={submitting}
                      placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Ghi chú (tùy chọn)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      disabled={submitting}
                      placeholder="Ví dụ: Giao hàng trong giờ hành chính..."
                      rows="3"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="spinner" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FaCalendarAlt /> Xác nhận đặt lịch
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="warning-message">
                  ⚠️ Đơn hàng chưa được thanh toán. Vui lòng thanh toán trước khi đặt lịch giao xe.
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

