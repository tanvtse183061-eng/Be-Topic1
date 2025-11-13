import "./Customer.css";
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { customerAPI } from "../../services/API"; // ✅ API riêng

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ Form khách hàng (đồng bộ Dashboard)
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

  // 📦 Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách khách hàng:", err);
      alert("Không thể tải danh sách khách hàng!");
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
        setCustomers(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tìm kiếm:", err);
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
      address: "",
      city: "",
      province: "",
      postalCode: "",
      preferredContactMethod: "",
      creditScore: 750,
      notes: "",
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
      address: customer.address || "",
      city: customer.city || "",
      province: customer.province || "",
      postalCode: customer.postalCode || "",
      preferredContactMethod: customer.preferredContactMethod || "",
      creditScore: customer.creditScore || 750,
      notes: customer.notes || "",
    });
    setErrors({});
    setShowPopup(true);
  };

  // 🗑️ Xóa khách hàng
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
    try {
      await customerAPI.deleteCustomer(id);
      alert("Xóa khách hàng thành công!");
      fetchCustomers();
    } catch (err) {
      console.error("❌ Lỗi khi xóa khách hàng:", err);
      alert("Không thể xóa khách hàng!");
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

    const payload = {
      ...customerForm,
      creditScore: Number(customerForm.creditScore),
    };

    try {
      if (isEdit && selectedCustomer) {
        await customerAPI.updateCustomer(selectedCustomer.customerId, payload);
        alert("Cập nhật khách hàng thành công!");
      } else {
        await customerAPI.createCustomer(payload);
        alert("Thêm khách hàng thành công!");
      }
      setShowPopup(false);
      fetchCustomers();
    } catch (err) {
      console.error("❌ Lỗi khi lưu khách hàng:", err);
      alert("Không thể lưu khách hàng!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý khách hàng</div>

      <div className="title2-customer">
        <h2>Danh sách khách hàng ({customers.length})</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Thêm khách hàng</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>HỌ TÊN</th>
              <th>EMAIL</th>
              <th>ĐIỆN THOẠI</th>
              <th>THÀNH PHỐ</th>
              <th>TỈNH</th>
              <th>ĐIỂM TÍN DỤNG</th>
              <th>NGÀY SINH</th>
              <th>NGÀY TẠO</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.customerId}>
                  <td>{c.firstName} {c.lastName}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.city}</td>
                  <td>{c.province}</td>
                  <td>{c.creditScore}</td>
                  <td>{formatDate(c.dateOfBirth)}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td className="action-buttons">
                    <button onClick={() => handleView(c)}><FaEye /></button>
                    <button onClick={() => handleEdit(c)}><FaPen /></button>
                    <button onClick={() => handleDelete(c.customerId)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9">Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa khách hàng */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{isEdit ? "Sửa khách hàng" : "Thêm khách hàng"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="firstName" placeholder="Họ" value={customerForm.firstName} onChange={handleChange} />
                <input name="lastName" placeholder="Tên" value={customerForm.lastName} onChange={handleChange} />
                <input type="email" name="email" placeholder="Email" value={customerForm.email} onChange={handleChange} />
                <input name="phone" placeholder="Số điện thoại" value={customerForm.phone} onChange={handleChange} />
                <input type="date" name="dateOfBirth" value={customerForm.dateOfBirth} onChange={handleChange} />
                <input name="address" placeholder="Địa chỉ" value={customerForm.address} onChange={handleChange} />
                <input name="city" placeholder="Thành phố" value={customerForm.city} onChange={handleChange} />
                <input name="province" placeholder="Tỉnh" value={customerForm.province} onChange={handleChange} />
                <input name="postalCode" placeholder="Mã bưu điện" value={customerForm.postalCode} onChange={handleChange} />
                <select name="preferredContactMethod" value={customerForm.preferredContactMethod} onChange={handleChange}>
                  <option value="">-- Liên hệ qua --</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="phone">Điện thoại</option>
                </select>
                <input type="number" name="creditScore" placeholder="Điểm tín dụng" value={customerForm.creditScore} onChange={handleChange} />
                <textarea name="notes" placeholder="Ghi chú" value={customerForm.notes} onChange={handleChange}></textarea>
              </div>

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo mới"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedCustomer && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Chi tiết khách hàng</h2>
            <p><b>Họ tên:</b> {selectedCustomer.firstName} {selectedCustomer.lastName}</p>
            <p><b>Email:</b> {selectedCustomer.email}</p>
            <p><b>Điện thoại:</b> {selectedCustomer.phone}</p>
            <p><b>Ngày sinh:</b> {formatDate(selectedCustomer.dateOfBirth)}</p>
            <p><b>Địa chỉ:</b> {selectedCustomer.address}</p>
            <p><b>Thành phố:</b> {selectedCustomer.city}</p>
            <p><b>Tỉnh:</b> {selectedCustomer.province}</p>
            <p><b>Điểm tín dụng:</b> {selectedCustomer.creditScore}</p>
            <p><b>Liên hệ qua:</b> {selectedCustomer.preferredContactMethod}</p>
            <p><b>Ghi chú:</b> {selectedCustomer.notes}</p>
            <button onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
