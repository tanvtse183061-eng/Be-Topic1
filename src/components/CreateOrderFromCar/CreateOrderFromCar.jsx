import { useState, useEffect } from "react";
import { publicCustomerAPI, publicOrderAPI, publicVehicleAPI } from "../../services/API.js";
import "./CreateOrderFromCar.css";

export default function CreateOrderFromCar({ 
  show, 
  onClose,
  preselectedInventoryId = null
}) {
  const [step, setStep] = useState(1); // 1: Tạo khách hàng, 2: Tạo đơn hàng
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form khách hàng - chỉ giữ các field theo báo cáo
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
  });

  // Form đơn hàng
  const [orderForm, setOrderForm] = useState({
    inventoryId: "",
    orderDate: new Date().toISOString().split('T')[0],
    notes: "",
  });

  // Danh sách vehicle inventory (available)
  const [inventoryList, setInventoryList] = useState([]);
  // Thông tin xe đã chọn (khi có preselectedInventoryId)
  const [selectedInventory, setSelectedInventory] = useState(null);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!show) {
      setStep(1);
      setCustomerId(null);
      setError("");
      setSuccess(false);
      setCustomerForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        province: "",
      });
      setOrderForm({
        inventoryId: "",
        orderDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
      setInventoryList([]);
      setSelectedInventory(null);
    }
  }, [show]);

  // Load vehicle inventory (available) khi bước 2
  useEffect(() => {
    if (step === 2 && show) {
      loadVehicleInventory();
    }
  }, [step, show]);

  // Set preselected inventory ID nếu có và load thông tin xe
  useEffect(() => {
    if (preselectedInventoryId && step === 2) {
      setOrderForm(prev => ({
        ...prev,
        inventoryId: preselectedInventoryId
      }));
      // Load thông tin xe đã chọn
      loadSelectedInventory();
    }
  }, [preselectedInventoryId, step]);

  // Load thông tin xe đã chọn từ API
  const loadSelectedInventory = async () => {
    if (!preselectedInventoryId) return;
    
    try {
      console.log("📡 Loading selected inventory:", preselectedInventoryId);
      // Thử public API trước
      try {
        const res = await publicVehicleAPI.getInventoryById(preselectedInventoryId);
        const inventory = res.data || res;
        setSelectedInventory(inventory);
        console.log("✅ Loaded selected inventory from public API:", inventory);
      } catch (err) {
        console.warn("⚠️ Public API failed, trying inventoryAPI...");
        // Fallback: thử inventoryAPI (có auth)
        const { inventoryAPI } = await import("../../services/API.js");
        const res = await inventoryAPI.getInventoryById(preselectedInventoryId);
        const inventory = res.data || res;
        setSelectedInventory(inventory);
        console.log("✅ Loaded selected inventory from inventoryAPI:", inventory);
      }
    } catch (err) {
      console.error("❌ Error loading selected inventory:", err);
      // Không set error, vẫn cho phép tạo order với ID
    }
  };

  const loadVehicleInventory = async () => {
    try {
      setLoading(true);
      // Load dữ liệu thực từ API - không dùng dữ liệu ảo
      const inventoryRes = await publicVehicleAPI.getInventory();
      const allInventory = inventoryRes.data || [];
      
      console.log("📦 Tất cả inventory từ API:", allInventory);
      
      // Chỉ lấy các xe có status = "available" (lowercase theo báo cáo)
      const availableInventory = allInventory.filter(
        (inv) => inv.status === "available"
      );
      
      console.log("✅ Xe có sẵn (available):", availableInventory);
      
      setInventoryList(availableInventory);
      
      if (availableInventory.length === 0) {
        setError("Hiện tại không có xe nào có sẵn. Vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi load vehicle inventory:", err);
      console.error("❌ Chi tiết lỗi:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      
      // Nếu có preselectedInventoryId, không hiển thị lỗi và cho phép tạo order
      if (preselectedInventoryId) {
        console.log("ℹ️ Error loading inventory, but preselectedInventoryId exists, allowing order creation");
        setError(""); // Không hiển thị lỗi
        setInventoryList([]); // Set empty để không hiển thị dropdown
      } else {
        // Fallback: thử inventoryAPI.getAvailableInventory() (endpoint có auth)
        try {
          console.log("📡 Trying inventoryAPI.getAvailableInventory() as fallback...");
          const { inventoryAPI } = await import("../../services/API.js");
          const inventoryRes = await inventoryAPI.getAvailableInventory();
          const allInventory = inventoryRes.data || [];
          const availableInventory = allInventory.filter(
            (inv) => inv.status === "available" || inv.status === "AVAILABLE"
          );
          setInventoryList(availableInventory);
          if (availableInventory.length === 0) {
            setError("Hiện tại không có xe nào có sẵn. Vui lòng thử lại sau.");
          }
        } catch (err2) {
          console.error("❌ Both endpoints failed:", err2);
          const errorMessage = err.response?.data?.error || 
                              err.response?.data?.message || 
                              err.message || 
                              "Lỗi máy chủ: Không thể kết nối đến server. Vui lòng kiểm tra kết nối hoặc liên hệ quản trị viên.";
          setError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate form khách hàng
  const validateCustomer = () => {
    if (!customerForm.firstName.trim()) {
      setError("Vui lòng nhập họ.");
      return false;
    }
    if (!customerForm.lastName.trim()) {
      setError("Vui lòng nhập tên.");
      return false;
    }
    if (!customerForm.email.trim()) {
      setError("Vui lòng nhập email.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(customerForm.email)) {
      setError("Email không hợp lệ.");
      return false;
    }
    if (!customerForm.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return false;
    }
    return true;
  };

  // Bước 1: Tạo khách hàng
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateCustomer()) return;

    setLoading(true);
    try {
      // Format theo báo cáo: firstName, lastName, email, phone, address, city, province
      const payload = {
        firstName: customerForm.firstName.trim(),
        lastName: customerForm.lastName.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
        address: customerForm.address?.trim() || "",
        city: customerForm.city?.trim() || "",
        province: customerForm.province?.trim() || "",
      };

      // Xóa các field empty (trừ required fields)
      Object.keys(payload).forEach(key => {
        if (key !== "firstName" && key !== "lastName" && key !== "email" && key !== "phone" && 
            (payload[key] === "" || payload[key] === null || payload[key] === undefined)) {
          delete payload[key];
        }
      });

      console.log("📤 Payload tạo customer:", payload);

      const res = await publicCustomerAPI.createCustomer(payload);
      console.log("✅ Response từ createCustomer:", res);
      
      const newCustomerId = res.data?.customerId || res.data?.id;
      
      if (newCustomerId) {
        setCustomerId(newCustomerId);
        setStep(2);
      } else {
        setError("Không thể lấy ID khách hàng sau khi tạo.");
      }
    } catch (err) {
      console.error("Lỗi khi tạo khách hàng:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Không thể tạo khách hàng!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Tạo đơn hàng
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!orderForm.inventoryId) {
      setError("Vui lòng chọn xe có sẵn.");
      return;
    }

    if (!orderForm.orderDate) {
      setError("Vui lòng chọn ngày đặt hàng.");
      return;
    }

    setLoading(true);
    try {
      // Format theo báo cáo: customerId, inventoryId, orderDate, notes
      const orderPayload = {
        customerId: customerId,
        inventoryId: orderForm.inventoryId,
        orderDate: orderForm.orderDate,
        notes: orderForm.notes || "",
      };

      console.log("📤 Payload tạo order:", orderPayload);

      // Sử dụng public API để tạo order
      const res = await publicOrderAPI.createOrder(orderPayload);
      console.log("✅ Response từ createOrder:", res);
      
      setSuccess(true);
      
      // Đóng modal sau 2 giây
      setTimeout(() => {
        onClose();
        if (window.location.pathname.includes("customer")) {
          window.location.reload();
        }
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      console.error("Error response:", err.response?.data);
      
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Không thể tạo đơn hàng! Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="create-order-modal-overlay" 
      onClick={onClose}
    >
      <div className="create-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-order-modal-header">
          <h2>
            {step === 1
              ? "Tạo khách hàng"
              : "Tạo đơn hàng"}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {success ? (
          <div className="success-message">
            <h3>Thành công!</h3>
            <p>Đã tạo khách hàng và đơn hàng thành công.</p>
          </div>
        ) : (
          <>
            {error && !preselectedInventoryId && <div className="error-message">{error}</div>}

            {step === 1 ? (
              // Form tạo khách hàng
              <form onSubmit={handleCreateCustomer}>
                <div className="form-grid">
                  <input
                    name="firstName"
                    placeholder="Họ *"
                    value={customerForm.firstName}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    name="lastName"
                    placeholder="Tên *"
                    value={customerForm.lastName}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email *"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    name="phone"
                    placeholder="Số điện thoại *"
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    name="address"
                    placeholder="Địa chỉ"
                    value={customerForm.address}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        address: e.target.value,
                      })
                    }
                  />
                  <input
                    name="city"
                    placeholder="Thành phố"
                    value={customerForm.city}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        city: e.target.value,
                      })
                    }
                  />
                  <input
                    name="province"
                    placeholder="Tỉnh"
                    value={customerForm.province}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        province: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="submit" disabled={loading}>
                    {loading ? "Đang tạo..." : "Tạo khách hàng →"}
                  </button>
                </div>
              </form>
            ) : (
              // Form tạo đơn hàng
              <form onSubmit={handleCreateOrder}>
                <div className="form-grid">
                  <label>
                    Chọn xe có sẵn *
                    <select
                      value={orderForm.inventoryId}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          inventoryId: e.target.value,
                        })
                      }
                      required
                      disabled={!!preselectedInventoryId}
                    >
                      <option value="">-- Chọn xe có sẵn --</option>
                      {/* Hiển thị xe đã chọn nếu có (khi có preselectedInventoryId) */}
                      {selectedInventory && (
                        <option
                          key={selectedInventory.inventoryId || selectedInventory.id}
                          value={selectedInventory.inventoryId || selectedInventory.id}
                        >
                          {(() => {
                            const variantName = selectedInventory.variant?.variantName || 
                                              selectedInventory.variantName || 
                                              selectedInventory.variant?.model?.modelName || 
                                              "";
                            const colorName = selectedInventory.color?.colorName || 
                                           selectedInventory.colorName || 
                                           "";
                            const price = selectedInventory.sellingPrice || selectedInventory.price || selectedInventory.priceBase;
                            const priceText = price ? `(${Number(price).toLocaleString('vi-VN')} ₫)` : "";
                            const vin = selectedInventory.vin || "";
                            const brandName = selectedInventory.variant?.model?.brand?.brandName || 
                                            selectedInventory.variant?.brandName || 
                                            "";
                            
                            // Hiển thị: Brand Model Variant - Color (Price) [VIN]
                            const displayText = [
                              brandName,
                              variantName,
                              colorName ? `- ${colorName}` : "",
                              priceText,
                              vin ? `[VIN: ${vin}]` : ""
                            ].filter(Boolean).join(" ");
                            
                            return displayText || `Xe ID: ${selectedInventory.inventoryId || selectedInventory.id}`;
                          })()}
                        </option>
                      )}
                      {/* Hiển thị danh sách xe có sẵn */}
                      {inventoryList.map((inv) => {
                        // Bỏ qua nếu đã hiển thị trong selectedInventory
                        if (selectedInventory && (inv.inventoryId || inv.id) === (selectedInventory.inventoryId || selectedInventory.id)) {
                          return null;
                        }
                        
                        // Lấy thông tin từ dữ liệu thực tế từ API
                        const variantName = inv.variant?.variantName || 
                                          inv.variantName || 
                                          inv.variant?.model?.modelName || 
                                          "";
                        const colorName = inv.color?.colorName || 
                                       inv.colorName || 
                                       "";
                        const price = inv.sellingPrice || inv.price || inv.priceBase;
                        const priceText = price ? `(${Number(price).toLocaleString('vi-VN')} ₫)` : "";
                        const vin = inv.vin || "";
                        const brandName = inv.variant?.model?.brand?.brandName || 
                                        inv.variant?.brandName || 
                                        "";
                        
                        // Hiển thị: Brand Model Variant - Color (Price) [VIN]
                        const displayText = [
                          brandName,
                          variantName,
                          colorName ? `- ${colorName}` : "",
                          priceText,
                          vin ? `[VIN: ${vin}]` : ""
                        ].filter(Boolean).join(" ");
                        
                        return (
                          <option
                            key={inv.inventoryId || inv.id}
                            value={inv.inventoryId || inv.id}
                          >
                            {displayText || `Xe ID: ${inv.inventoryId || inv.id}`}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label>
                    Ngày đặt hàng *
                    <input
                      type="date"
                      value={orderForm.orderDate}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          orderDate: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <textarea
                    placeholder="Ghi chú"
                    value={orderForm.notes}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
                  />
                </div>
                {preselectedInventoryId && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#2e7d32' }}>
                    Xe đã được chọn từ trang chi tiết.
                  </div>
                )}
                {inventoryList.length === 0 && !loading && !preselectedInventoryId && (
                  <div className="error-message" style={{ marginTop: '10px' }}>
                    Không có xe nào có sẵn. Vui lòng thử lại sau.
                  </div>
                )}
                <div className="form-actions">
                  <button type="button" onClick={() => setStep(1)}>
                    ← Quay lại
                  </button>
                  <button type="button" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="submit" disabled={loading || (!preselectedInventoryId && inventoryList.length === 0)}>
                    {loading ? "Đang tạo..." : "Tạo đơn hàng"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

