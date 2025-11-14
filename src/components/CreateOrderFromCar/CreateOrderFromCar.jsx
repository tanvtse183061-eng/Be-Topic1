import { useState, useEffect } from "react";
import { publicCustomerAPI, publicOrderAPI, publicVehicleAPI } from "../../services/API.js";
import "./CreateOrderFromCar.css";

export default function CreateOrderFromCar({ 
  show, 
  onClose, 
  carName, 
  carColor, 
  carPrice 
}) {
  const [step, setStep] = useState(1); // 1: Tạo khách hàng, 2: Tạo đơn hàng
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form khách hàng
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    preferredContactMethod: "",
    creditScore: 750,
    notes: "",
  });

  // Form đơn hàng
  const [orderForm, setOrderForm] = useState({
    variantId: "",
    colorId: "",
    price: carPrice || "",
    notes: "",
  });

  // Danh sách variants và colors
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);

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
        dateOfBirth: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        preferredContactMethod: "",
        creditScore: 750,
        notes: "",
      });
      setOrderForm({
        variantId: "",
        colorId: "",
        price: carPrice || "",
        notes: "",
      });
    }
  }, [show, carPrice]);

  // Load variants và colors khi bước 2
  useEffect(() => {
    if (step === 2 && show) {
      loadVariantsAndColors();
    }
  }, [step, show]);

  const loadVariantsAndColors = async () => {
    try {
      setLoading(true);
      const [variantsRes, colorsRes] = await Promise.all([
        publicVehicleAPI.getVariants(),
        publicVehicleAPI.getColors(),
      ]);
      setVariants(variantsRes.data || []);
      setColors(colorsRes.data || []);

      // Tự động tìm variant và color dựa trên tên xe và màu
      if (carName) {
        const matchedVariant = (variantsRes.data || []).find(
          (v) =>
            v.variantName?.toLowerCase().includes(carName.toLowerCase()) ||
            v.model?.modelName?.toLowerCase().includes(carName.toLowerCase())
        );
        if (matchedVariant) {
          setOrderForm((prev) => ({
            ...prev,
            variantId: matchedVariant.variantId || matchedVariant.id,
          }));
        }
      }

      if (carColor) {
        const matchedColor = (colorsRes.data || []).find(
          (c) =>
            c.colorName?.toLowerCase().includes(carColor.toLowerCase()) ||
            c.name?.toLowerCase().includes(carColor.toLowerCase())
        );
        if (matchedColor) {
          setOrderForm((prev) => ({
            ...prev,
            colorId: matchedColor.colorId || matchedColor.id,
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi khi load variants/colors:", err);
      console.error("Chi tiết lỗi:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      
      // Hiển thị thông báo lỗi cho người dùng
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Không thể tải danh sách biến thể và màu sắc. Vui lòng thử lại sau.";
      setError(errorMessage);
      
      // Nếu lỗi 500, có thể là lỗi server
      if (err.response?.status === 500) {
        setError("Lỗi máy chủ: Không thể kết nối đến server. Vui lòng kiểm tra kết nối hoặc liên hệ quản trị viên.");
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
      const payload = {
        ...customerForm,
        creditScore: Number(customerForm.creditScore),
      };

      const res = await publicCustomerAPI.createCustomer(payload);
      const newCustomerId = res.data?.customerId || res.data?.id;
      
      if (newCustomerId) {
        setCustomerId(newCustomerId);
        setStep(2);
      } else {
        setError("Không thể lấy ID khách hàng sau khi tạo.");
      }
    } catch (err) {
      console.error("Lỗi khi tạo khách hàng:", err);
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

    if (!orderForm.variantId) {
      setError("Vui lòng chọn biến thể xe.");
      return;
    }

    setLoading(true);
    try {
      // Tạo order với quotation data
      // Backend có thể yêu cầu quotation với customer, variant, color, và finalPrice
      const finalPrice = orderForm.price ? Number(orderForm.price) : null;
      
      const orderPayload = {
        customerId: customerId,
        variantId: Number(orderForm.variantId),
        colorId: orderForm.colorId ? Number(orderForm.colorId) : null,
        finalPrice: finalPrice,
        notes: orderForm.notes || "",
        status: "PENDING",
      };

      // Sử dụng public API để tạo order
      await publicOrderAPI.createOrder(orderPayload);
      setSuccess(true);
      
      // Đóng modal sau 2 giây
      setTimeout(() => {
        onClose();
        // Refresh trang quản lý khách hàng nếu cần
        // Không reload toàn bộ trang, chỉ refresh nếu đang ở trang Customer
        if (window.location.pathname.includes("customer")) {
          window.location.reload();
        }
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      console.error("Error response:", err.response?.data);
      
      // Thử với cấu trúc quotation nếu lỗi
      if (err.response?.status === 400) {
        try {
          // Thử tạo với quotation object
          const quotationPayload = {
            quotation: {
              customerId: customerId,
              variantId: Number(orderForm.variantId),
              colorId: orderForm.colorId ? Number(orderForm.colorId) : null,
              finalPrice: orderForm.price ? Number(orderForm.price) : null,
              notes: orderForm.notes || "",
            },
            status: "PENDING",
          };
          await publicOrderAPI.createOrder(quotationPayload);
          setSuccess(true);
          setTimeout(() => {
            onClose();
            if (window.location.pathname.includes("customer")) {
              window.location.reload();
            }
          }, 2000);
        } catch (err2) {
          setError(
            err2.response?.data?.message ||
              err2.response?.data?.error ||
              "Không thể tạo đơn hàng! Vui lòng kiểm tra lại thông tin."
          );
        }
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Không thể tạo đơn hàng!"
        );
      }
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
              ? "Bước 1: Tạo khách hàng"
              : "Bước 2: Tạo đơn hàng"}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {success ? (
          <div className="success-message">
            <h3>✅ Thành công!</h3>
            <p>Đã tạo khách hàng và đơn hàng thành công.</p>
            <p>Khách hàng đã được thêm vào danh sách quản lý khách hàng.</p>
          </div>
        ) : (
          <>
            {/* Thông tin xe */}
            <div className="car-info-box">
              <h4>Thông tin xe đặt mua:</h4>
              <p>
                <strong>Xe:</strong> {carName || "—"}
              </p>
              <p>
                <strong>Màu:</strong> {carColor || "—"}
              </p>
              {carPrice && (
                <p>
                  <strong>Giá:</strong> {carPrice.toLocaleString()} ₫
                </p>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

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
                    name="dateOfBirth"
                    type="date"
                    placeholder="Ngày sinh"
                    value={customerForm.dateOfBirth}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        dateOfBirth: e.target.value,
                      })
                    }
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
                    Biến thể xe *
                    <select
                      value={orderForm.variantId}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          variantId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Chọn biến thể --</option>
                      {variants.map((v) => (
                        <option
                          key={v.variantId || v.id}
                          value={v.variantId || v.id}
                        >
                          {v.variantName ||
                            `${v.model?.brand?.brandName || ""} ${
                              v.model?.modelName || ""
                            } ${v.variantName || ""}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Màu sắc
                    <select
                      value={orderForm.colorId}
                      onChange={(e) =>
                        setOrderForm({
                          ...orderForm,
                          colorId: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Chọn màu --</option>
                      {colors.map((c) => (
                        <option
                          key={c.colorId || c.id}
                          value={c.colorId || c.id}
                        >
                          {c.colorName || c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    type="number"
                    placeholder="Giá (VNĐ)"
                    value={orderForm.price}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        price: e.target.value,
                      })
                    }
                  />
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
                <div className="form-actions">
                  <button type="button" onClick={() => setStep(1)}>
                    ← Quay lại
                  </button>
                  <button type="button" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="submit" disabled={loading}>
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

