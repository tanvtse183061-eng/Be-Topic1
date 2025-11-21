import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { publicCustomerAPI, publicVehicleAPI } from "../../services/API.js";
import Nvabar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./CreateCustomer.css";

export default function CreateCustomer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inventoryId = searchParams.get("inventoryId");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState(null);
  
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    province: "",
  });

  useEffect(() => {
    if (inventoryId) {
      fetchVehicleInfo();
    }
  }, [inventoryId]);

  const fetchVehicleInfo = async () => {
    try {
      const res = await publicVehicleAPI.getInventoryById(inventoryId);
      const inventoryData = res.data || res;
      setVehicleInfo(inventoryData);
    } catch (err) {
      console.error("Lỗi khi tải thông tin xe:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
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
    if (!/^[0-9]{9,11}$/.test(customerForm.phone)) {
      setError("Số điện thoại không hợp lệ (9-11 chữ số).");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: customerForm.firstName.trim(),
        lastName: customerForm.lastName.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
        dateOfBirth: customerForm.dateOfBirth || null,
        address: customerForm.address?.trim() || null,
        city: customerForm.city?.trim() || null,
        province: customerForm.province?.trim() || null,
      };

      const res = await publicCustomerAPI.createCustomer(payload);
      const newCustomerId = res.data?.customerId || res.data?.id;
      
      if (newCustomerId) {
        // Điều hướng đến trang tạo order với customerId và inventoryId
        navigate(`/public/order/create?customerId=${newCustomerId}&inventoryId=${inventoryId || ''}`);
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

  const getCarName = (inv) => {
    if (inv?.variantName) {
      return inv.variantName;
    }
    const brand = inv?.variant?.model?.brand?.brandName || "";
    const model = inv?.variant?.model?.modelName || "";
    const variant = inv?.variant?.variantName || "";
    const parts = [brand, model, variant].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Xe";
  };

  return (
    <>
      <Nvabar />
      <div className="create-customer-container" style={{ marginTop: '700px', paddingTop: '1000px', paddingBottom: '1000px' }}>
        <div className="create-customer-card">
          <div className="create-customer-header">
            <h1>Thông tin khách hàng</h1>
            <p>Vui lòng điền thông tin để tiếp tục đặt hàng</p>
          </div>

          {vehicleInfo && (
            <div className="vehicle-info-box">
              <h3>Xe bạn đang đặt mua:</h3>
              <p><strong>{getCarName(vehicleInfo)}</strong></p>
              {vehicleInfo.color?.colorName && (
                <p>Màu: {vehicleInfo.color.colorName}</p>
              )}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Họ *</label>
                <input
                  type="text"
                  name="firstName"
                  value={customerForm.firstName}
                  onChange={handleChange}
                  placeholder="Nhập họ"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tên *</label>
                <input
                  type="text"
                  name="lastName"
                  value={customerForm.lastName}
                  onChange={handleChange}
                  placeholder="Nhập tên"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={customerForm.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerForm.phone}
                  onChange={handleChange}
                  placeholder="0123456789"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={customerForm.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Thành phố</label>
                <input
                  type="text"
                  name="city"
                  value={customerForm.city}
                  onChange={handleChange}
                  placeholder="Nhập thành phố"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={customerForm.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ chi tiết"
                />
              </div>

              <div className="form-group">
                <label>Tỉnh</label>
                <input
                  type="text"
                  name="province"
                  value={customerForm.province}
                  onChange={handleChange}
                  placeholder="Nhập tỉnh"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Đang tạo..." : "Tiếp tục →"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

