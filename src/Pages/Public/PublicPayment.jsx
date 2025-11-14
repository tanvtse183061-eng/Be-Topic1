import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicPaymentAPI, publicOrderAPI, publicCustomerAPI, publicVehicleAPI } from "../../services/API";
import { FaCheck, FaSpinner, FaCreditCard, FaCalendarAlt } from "react-icons/fa";
import "./PublicPayment.css";

export default function PublicPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    paymentMethod: "bank_transfer",
    notes: ""
  });
  
  const [redirectDetected, setRedirectDetected] = useState(false);

  useEffect(() => {
    console.log("🔍 PublicPayment mounted, orderId:", orderId);
    console.log("🔍 Current URL:", window.location.href);
    console.log("🔍 Is authenticated:", !!localStorage.getItem("token"));
    
    // Đảm bảo không bị redirect bởi authentication checks
    // Lưu URL hiện tại để có thể restore nếu bị redirect
    const currentPath = window.location.pathname;
    sessionStorage.setItem("publicPaymentPath", currentPath);
    
    fetchOrder();
    
    // Prevent any redirects - check sau mỗi render
    const checkRedirect = setInterval(() => {
      const currentLocation = window.location.pathname;
      if (currentLocation !== currentPath && !currentLocation.includes("/public/orders")) {
        console.warn("⚠️ Phát hiện redirect ra khỏi trang public payment:", currentLocation);
        setRedirectDetected(true);
        // Khôi phục về trang public payment
        window.history.replaceState(null, "", currentPath);
      }
    }, 100);
    
    return () => {
      console.log("🔍 PublicPayment unmounting");
      clearInterval(checkRedirect);
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
      if (!orderData.customer && orderData.customerId) {
        try {
          console.log("🔄 Fetching customer data separately...");
          // Thử dùng publicCustomerAPI.getCustomer nếu có, nếu không thì dùng publicOrderAPI
          let customerData = null;
          try {
            if (publicCustomerAPI.getCustomer) {
              const customerRes = await publicCustomerAPI.getCustomer(orderData.customerId);
              customerData = customerRes.data?.data || customerRes.data || customerRes;
            }
          } catch (e) {
            console.warn("⚠️ publicCustomerAPI.getCustomer không khả dụng, bỏ qua");
          }
          
          // Nếu vẫn không có customer data, thử lấy từ order response hoặc bỏ qua
          if (!customerData) {
            console.warn("⚠️ Không thể fetch customer data, sẽ hiển thị với thông tin có sẵn");
          } else {
            console.log("✅ Customer data fetched:", customerData);
            orderData = { ...orderData, customer: customerData };
          }
        } catch (customerErr) {
          console.error("❌ Lỗi khi fetch customer:", customerErr);
        }
      }
      
      // Nếu không có inventory data nhưng có inventoryId, fetch inventory riêng
      if (!orderData.inventory && orderData.inventoryId) {
        try {
          console.log("🔄 Fetching inventory data separately...");
          // Sử dụng public API để lấy inventory
          const inventoriesRes = await publicVehicleAPI.getInventories();
          const inventories = Array.isArray(inventoriesRes.data?.data) ? inventoriesRes.data.data :
                            Array.isArray(inventoriesRes.data) ? inventoriesRes.data :
                            Array.isArray(inventoriesRes) ? inventoriesRes : [];
          const inventoryData = inventories.find(inv => 
            (inv.inventoryId || inv.id) === orderData.inventoryId
          );
          if (inventoryData) {
            console.log("✅ Inventory data found:", inventoryData);
            orderData = { ...orderData, inventory: inventoryData };
          }
        } catch (inventoryErr) {
          console.error("❌ Lỗi khi fetch inventory:", inventoryErr);
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
      setOrder(orderData);
      
      // Kiểm tra xem order đã được confirmed chưa
      const status = orderData.status?.toLowerCase() || "";
      if (status !== "confirmed") {
        setError("Đơn hàng chưa được xác nhận. Vui lòng chấp nhận báo giá trước khi thanh toán.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng:", err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tải đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
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
    
    if (!formData.paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn thanh toán đơn hàng này?\n\nSau khi thanh toán, đơn hàng sẽ chuyển sang trạng thái 'pending' và chờ xác nhận từ nhân viên.")) return;

    try {
      setSubmitting(true);
      const payload = {
        orderId: orderId,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined
      };
      
      console.log("💳 Gửi thanh toán:", payload);
      const res = await publicPaymentAPI.createFullPayment(payload);
      const responseData = res.data?.data || res.data || res;
      
      console.log("✅ Response từ createFullPayment:", responseData);
      console.log("🔍 Current URL sau khi thanh toán:", window.location.href);
      
      setResult({
        type: "success",
        title: "✅ Tạo thanh toán thành công!",
        message: responseData.message || "Full payment created successfully",
        paymentId: responseData.paymentId,
        paymentNumber: responseData.paymentNumber,
        amount: responseData.amount,
        status: responseData.status
      });
      
      // Fetch lại order để cập nhật trạng thái
      await fetchOrder();
      
      // Đảm bảo không có redirect nào xảy ra
      console.log("🔍 Đảm bảo vẫn ở trang public payment:", window.location.href);
      
      // Force stay on current page - prevent any navigation
      const currentPath = `/public/orders/${orderId}/payment`;
      if (window.location.pathname !== currentPath) {
        console.warn("⚠️ Phát hiện redirect sau thanh toán, đang khôi phục...");
        // Sử dụng replace thay vì push để không tạo history entry
        window.history.replaceState(null, "", currentPath);
      }
      
      // Scroll to top để hiển thị result
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("❌ Lỗi khi thanh toán:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo thanh toán!";
      setResult({
        type: "error",
        title: "❌ Thanh toán thất bại!",
        message: errorMsg
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-payment-container">
        <div className="loading">Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="public-payment-container">
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
      <div className="public-payment-container">
        <div className="error-box">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  const status = order.status?.toLowerCase() || "";
  const canPay = status === "confirmed";
  const totalAmount = order.totalAmount || order.total_amount || order.quotation?.finalPrice || order.quotation?.final_price || 0;

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
    <div className="public-payment-container">
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
      <div className="payment-card">
        <div className="payment-header">
          <h1>Thanh toán đơn hàng</h1>
          <div className="order-number">Mã đơn hàng: <strong>{order.orderNumber || order.orderId}</strong></div>
        </div>

        {result && (
          <div className={`result-box ${result.type}`}>
            <h3>{result.title}</h3>
            <p>{result.message}</p>
            {result.paymentId && (
              <div className="payment-info">
                <p><strong>Mã thanh toán:</strong> {result.paymentNumber || result.paymentId}</p>
                <p><strong>Số tiền:</strong> {formatPrice(result.amount)}</p>
                <p><strong>Trạng thái:</strong> {result.status === "pending" ? "Chờ xác nhận" : result.status}</p>
              </div>
            )}
            {result.type === "success" && (
              <div style={{
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "1px solid rgba(255,255,255,0.3)"
              }}>
                <p style={{ marginBottom: "10px", fontSize: "14px", opacity: 0.95 }}>
                  Bạn có thể đặt lịch giao xe ngay bây giờ:
                </p>
                <button 
                  onClick={() => navigate(`/public/orders/${orderId}/appointment`)}
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
                  <FaCalendarAlt /> Đặt lịch giao xe
                </button>
              </div>
            )}
            <div className="result-actions">
              <button onClick={() => {
                // Không cho phép đóng nếu đã thanh toán thành công
                if (result.type === "success") {
                  return;
                }
                setResult(null);
              }}>
                {result.type === "success" ? "Hoàn tất" : "Đóng"}
              </button>
            </div>
          </div>
        )}

        <div className="payment-content">
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
                  {status === "confirmed" ? "Đã xác nhận" : 
                   status === "paid" ? "Đã thanh toán" :
                   status === "pending" ? "Chờ xử lý" :
                   status === "quoted" ? "Đã báo giá" :
                   status}
                </span>
              </div>
            </div>
          </div>

          <div className="amount-section">
            <div className="amount-row">
              <span>Tổng tiền cần thanh toán:</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>
          </div>

          {!result && (
            <>
              {canPay ? (
                <form onSubmit={handleSubmit} className="payment-form">
                  <h3>Thông tin thanh toán</h3>
                  
                  <div className="form-group">
                    <label>
                      Phương thức thanh toán <span className="required">*</span>
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      required
                      disabled={submitting}
                    >
                      <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                      <option value="credit_card">Thẻ tín dụng</option>
                      <option value="debit_card">Thẻ ghi nợ</option>
                      <option value="e_wallet">Ví điện tử</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ghi chú (tùy chọn)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Ví dụ: Đã chuyển khoản vào tài khoản..."
                      rows="3"
                      disabled={submitting}
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
                        <FaCreditCard /> Xác nhận thanh toán
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="warning-message">
                  ⚠️ Đơn hàng chưa được xác nhận. Vui lòng chấp nhận báo giá trước khi thanh toán.
                </div>
              )}
            </>
          )}

          {result && result.type === "success" && (
            <div className="success-info-box" style={{
              marginTop: "20px",
              padding: "20px",
              background: "#f0fdf4",
              border: "2px solid #16a34a",
              borderRadius: "12px"
            }}>
              <h3 style={{ margin: "0 0 15px 0", color: "#065f46", fontSize: "18px" }}>
                ✅ Thanh toán đã được ghi nhận
              </h3>
              <p style={{ margin: "0 0 15px 0", color: "#065f46", fontSize: "15px" }}>
                Thanh toán của bạn đã được tạo thành công và đang chờ xác nhận từ nhân viên.
                Vui lòng giữ lại thông tin thanh toán để theo dõi.
              </p>
              <div style={{
                background: "white",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "15px"
              }}>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  <strong>Mã thanh toán:</strong> {result.paymentNumber || result.paymentId}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  <strong>Số tiền:</strong> {formatPrice(result.amount)}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  <strong>Phương thức:</strong> {
                    formData.paymentMethod === "bank_transfer" ? "Chuyển khoản ngân hàng" :
                    formData.paymentMethod === "credit_card" ? "Thẻ tín dụng" :
                    formData.paymentMethod === "debit_card" ? "Thẻ ghi nợ" :
                    formData.paymentMethod === "e_wallet" ? "Ví điện tử" :
                    formData.paymentMethod
                  }
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  <strong>Trạng thái:</strong> <span style={{ 
                    color: result.status === "pending" ? "#f59e0b" : "#16a34a",
                    fontWeight: "600"
                  }}>
                    {result.status === "pending" ? "Chờ xác nhận" : result.status}
                  </span>
                </p>
              </div>
              <div style={{
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(22, 163, 74, 0.2)"
              }}>
                <p style={{ marginBottom: "10px", fontSize: "14px", color: "#065f46" }}>
                  Sau khi thanh toán được xác nhận, bạn có thể đặt lịch giao xe:
                </p>
                <button 
                  onClick={() => navigate(`/public/orders/${orderId}/appointment`)}
                  style={{
                    padding: "12px 24px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FaCalendarAlt /> Đặt lịch giao xe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

