import "./Customer.css";
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus, FaSpinner, FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { customerAPI } from "../../services/API";

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // ✅ Form khách hàng (chỉ các field có trong CustomerDTO)
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    province: "",
  });

  // 📦 Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerAPI.getCustomers();
      console.log("🔍 API Response:", res);
      console.log("🔍 res.data:", res.data);
      
      // Xử lý nhiều format response
      let customersData = [];
      
      // Cách 1: res.data là array
      if (Array.isArray(res.data)) {
        customersData = res.data;
      }
      // Cách 2: res.data.data là array
      else if (Array.isArray(res.data?.data)) {
        customersData = res.data.data;
      }
      // Cách 3: res.data.content là array
      else if (Array.isArray(res.data?.content)) {
        customersData = res.data.content;
      }
      // Cách 4: res là array trực tiếp
      else if (Array.isArray(res)) {
        customersData = res;
      }
      // Cách 5: Tìm array trong object
      else if (res.data && typeof res.data === 'object') {
        const possibleArrays = Object.values(res.data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          customersData = possibleArrays[0];
        }
      }
      
      console.log("✅ Customers data sau khi extract:", customersData);
      console.log("✅ Số lượng customers:", customersData.length);
      if (customersData.length > 0) {
        console.log("✅ Sample customer:", customersData[0]);
      }
      
      setCustomers(customersData);
      
      if (customersData.length === 0) {
        console.warn("⚠️ Không có customers nào được tìm thấy!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách khách hàng:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      setError("Không thể tải danh sách khách hàng. Vui lòng thử lại sau.");
      setCustomers([]); // Đảm bảo set về [] nếu có lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);


  // 🔍 Tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchCustomers();
        return;
      }
      try {
        const res = await customerAPI.searchCustomers(trimmed);
        console.log("🔍 Search Response:", res);
        
        // Xử lý nhiều format response tương tự fetchCustomers
        let customersData = [];
        
        if (Array.isArray(res.data)) {
          customersData = res.data;
        } else if (Array.isArray(res.data?.data)) {
          customersData = res.data.data;
        } else if (Array.isArray(res.data?.content)) {
          customersData = res.data.content;
        } else if (Array.isArray(res)) {
          customersData = res;
        } else if (res.data && typeof res.data === 'object') {
          const possibleArrays = Object.values(res.data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            customersData = possibleArrays[0];
          }
        }
        
        console.log("✅ Search results:", customersData.length);
        setCustomers(customersData);
      } catch (err) {
        console.error("❌ Lỗi khi tìm kiếm:", err);
        setCustomers([]);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // 👁️ Xem chi tiết
  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  // ➕ Mở form thêm mới
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedCustomer(null);
    setCustomerForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      city: "",
      province: "",
    });
    setErrors({});
    setShowPopup(true);
  };

  // ✏️ Mở form sửa
  const handleEdit = (customer) => {
    setIsEdit(true);
    setSelectedCustomer(customer);
    setCustomerForm({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.slice(0, 10) : "",
      city: customer.city || "",
      province: customer.province || "",
    });
    setErrors({});
    setShowPopup(true);
  };

  // 🗑️ Xóa khách hàng
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
    try {
      setDeleting(id);
      await customerAPI.deleteCustomer(id);
      await fetchCustomers();
    } catch (err) {
      console.error("❌ Lỗi khi xóa khách hàng:", err);
      alert("Không thể xóa khách hàng! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // 📝 Nhập liệu form
  const handleChange = (e) => {
    setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // ✅ Kiểm tra lỗi
  const validate = () => {
    let newErrors = {};
    if (!customerForm.firstName.trim()) newErrors.firstName = "Vui lòng nhập họ.";
    if (!customerForm.lastName.trim()) newErrors.lastName = "Vui lòng nhập tên.";
    if (!customerForm.email.trim()) newErrors.email = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(customerForm.email)) newErrors.email = "Email không hợp lệ.";
    if (!customerForm.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại.";
    else if (!/^[0-9]{9,11}$/.test(customerForm.phone)) newErrors.phone = "Số điện thoại không hợp lệ.";
    return newErrors;
  };

  // 💾 Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Chỉ gửi các field có trong CustomerDTO
    const payload = {
      firstName: customerForm.firstName.trim(),
      lastName: customerForm.lastName.trim(),
      email: customerForm.email.trim(),
      phone: customerForm.phone.trim(),
      city: customerForm.city?.trim() || null,
      province: customerForm.province?.trim() || null,
      dateOfBirth: customerForm.dateOfBirth || null,
    };

    try {
      setSubmitting(true);
      if (isEdit && selectedCustomer) {
        await customerAPI.updateCustomer(selectedCustomer.customerId, payload);
      } else {
        await customerAPI.createCustomer(payload);
      }
      setShowPopup(false);
      await fetchCustomers();
    } catch (err) {
      console.error("❌ Lỗi khi lưu khách hàng:", err);
      alert("Không thể lưu khách hàng! " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">👥</span>
        Quản lý khách hàng
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách khách hàng</h2>
          <p className="subtitle">{customers.length} khách hàng tổng cộng</p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          <FaPlus className="btn-icon" />
          Thêm khách hàng
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchCustomers}>Thử lại</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách khách hàng...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {customers.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>HỌ TÊN</th>
                  <th>EMAIL</th>
                  <th>ĐIỆN THOẠI</th>
                  <th>THÀNH PHỐ</th>
                  <th>TỈNH</th>
                  <th>NGÀY SINH</th>
                  <th>NGÀY TẠO</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.customerId} className="table-row">
                    <td>
                      <span className="customer-name">{c.firstName} {c.lastName}</span>
                    </td>
                    <td>{c.email || '—'}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.city || '—'}</td>
                    <td>{c.province || '—'}</td>
                    <td>{formatDate(c.dateOfBirth)}</td>
                    <td>{formatDate(c.createdAt)}</td>
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
                        title="Chỉnh sửa"
                      >
                        <FaPen />
                      </button>
                      <button 
                        className="icon-btn delete" 
                        onClick={() => handleDelete(c.customerId)}
                        disabled={deleting === c.customerId}
                        title="Xóa khách hàng"
                      >
                        {deleting === c.customerId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>{searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào'}</h3>
              <p>
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc' 
                  : 'Bắt đầu bằng cách thêm khách hàng mới'}
              </p>
              {!searchTerm && (
                <button className="btn-primary" onClick={handleOpenAdd}>
                  Thêm khách hàng đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popup thêm/sửa khách hàng */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box popup-form" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>{isEdit ? "Sửa khách hàng" : "Thêm khách hàng"}</h2>
              <button className="popup-close" onClick={() => setShowPopup(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="form-section-title">Thông tin khách hàng</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Họ *</label>
                    <input 
                      name="firstName" 
                      placeholder="Nhập họ" 
                      value={customerForm.firstName} 
                      onChange={handleChange}
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Tên *</label>
                    <input 
                      name="lastName" 
                      placeholder="Nhập tên" 
                      value={customerForm.lastName} 
                      onChange={handleChange}
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Nhập email" 
                      value={customerForm.email} 
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input 
                      name="phone" 
                      placeholder="Nhập số điện thoại" 
                      value={customerForm.phone} 
                      onChange={handleChange}
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
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
                      name="city" 
                      placeholder="Nhập thành phố" 
                      value={customerForm.city} 
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tỉnh</label>
                    <input 
                      name="province" 
                      placeholder="Nhập tỉnh" 
                      value={customerForm.province} 
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="btn-submit">
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-small" />
                      Đang lưu...
                    </>
                  ) : (
                    isEdit ? "Cập nhật" : "Tạo mới"
                  )}
                </button>
                <button type="button" onClick={() => setShowPopup(false)} className="btn-cancel" disabled={submitting}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedCustomer && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết khách hàng</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin cá nhân</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedCustomer.email || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedCustomer.phone || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày sinh</span>
                    <span className="detail-value">{formatDate(selectedCustomer.dateOfBirth)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày tạo</span>
                    <span className="detail-value">{formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Địa chỉ</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Thành phố</span>
                    <span className="detail-value">{selectedCustomer.city || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tỉnh</span>
                    <span className="detail-value">{selectedCustomer.province || '—'}</span>
                  </div>
                </div>
              </div>
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
