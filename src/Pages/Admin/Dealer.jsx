import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dealerAPI } from "../../services/API.js";

export default function Dealer() {
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    dealerCode: "",
    dealerName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    dealerType: "",
    licenseNumber: "",
    taxCode: "",
    bankAccount: "",
    bankName: "",
    commissionRate: 0,
    status: "ACTIVE",
    notes: "",
    contractStartDate: "",
    contractEndDate: "",
    monthlySalesTarget: 0,
    yearlySalesTarget: 0,
  });

  // ✅ Lấy danh sách dealer
  const fetchDealers = async () => {
    try {
      const res = await dealerAPI.getAll();
      setDealers(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách dealer:", err);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  // ✅ Tìm kiếm realtime
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchDealers();
        return;
      }
      try {
        const res = await dealerAPI.search(trimmed);
        setDealers(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết
  const handleView = (dealer) => {
    setSelectedDealer(dealer);
    setShowDetail(true);
  };

  // ✅ Mở form thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      dealerCode: "",
      dealerName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      dealerType: "",
      licenseNumber: "",
      taxCode: "",
      bankAccount: "",
      bankName: "",
      commissionRate: 0,
      status: "ACTIVE",
      notes: "",
      contractStartDate: "",
      contractEndDate: "",
      monthlySalesTarget: 0,
      yearlySalesTarget: 0,
    });
    setShowPopup(true);
  };

  // ✅ Mở form sửa
  const handleEdit = (dealer) => {
    setIsEdit(true);
    setSelectedDealer(dealer);
    setFormData({ ...dealer });
    setShowPopup(true);
  };

  // ✅ Xóa dealer
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dealer này không?")) return;
    try {
      await dealerAPI.delete(id);
      alert("Xóa dealer thành công!");
      fetchDealers();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa dealer!");
    }
  };

  // ✅ Gửi form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.dealerCode || !formData.dealerName) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      if (isEdit && selectedDealer) {
        await dealerAPI.update(selectedDealer.dealerId, formData);
        alert("Cập nhật dealer thành công!");
      } else {
        await dealerAPI.create(formData);
        alert("Thêm dealer thành công!");
      }
      setShowPopup(false);
      fetchDealers();
    } catch (err) {
      console.error("Lỗi khi lưu dealer:", err);
      alert("Không thể lưu dealer!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý đại lý</div>

      <div className="title2-customer">
        <h2>Danh sách đại lý</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Thêm đại lý</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm dealer..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>CODE</th>
              <th>TÊN</th>
              <th>ĐIỆN THOẠI</th>
              <th>EMAIL</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {dealers.length > 0 ? (
              dealers.map(d => (
                <tr key={d.dealerId}>
                  <td>{d.dealerCode}</td>
                  <td>{d.dealerName}</td>
                  <td>{d.phone}</td>
                  <td>{d.email}</td>
                  <td>
                    <span style={{
                      background: d.status === "ACTIVE" ? "#dcfce7" : "#fee2e2",
                      color: d.status === "ACTIVE" ? "#16a34a" : "#dc2626",
                      padding: "5px 8px",
                      borderRadius: "5px"
                    }}>
                      {d.status === "ACTIVE" ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(d)}><FaEye /></button>
                    <button className="icon-btn edit" onClick={() => handleEdit(d)}><FaPen /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(d.dealerId)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#666" }}>Không có dữ liệu dealer</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{isEdit ? "Sửa đại lý" : "Thêm đại lý mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="dealerCode" placeholder="Mã dealer" value={formData.dealerCode} onChange={e => setFormData({...formData, dealerCode: e.target.value})}/>
                <input name="dealerName" placeholder="Tên dealer" value={formData.dealerName} onChange={e => setFormData({...formData, dealerName: e.target.value})}/>
                <input name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
                <input name="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
                <input name="address" placeholder="Địa chỉ" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}/>
                <input name="city" placeholder="Thành phố" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}/>
                <input name="province" placeholder="Tỉnh/Thành" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})}/>
                <input name="dealerType" placeholder="Loại dealer" value={formData.dealerType} onChange={e => setFormData({...formData, dealerType: e.target.value})}/>
                <input name="bankName" placeholder="Ngân hàng" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})}/>
                <input name="bankAccount" placeholder="Tài khoản ngân hàng" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})}/>
                <textarea name="notes" placeholder="Ghi chú" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              {error && <span className="error">{error}</span>}
              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedDealer && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin đại lý</h2>
            <p><b>Mã:</b> {selectedDealer.dealerCode}</p>
            <p><b>Tên:</b> {selectedDealer.dealerName}</p>
            <p><b>Liên hệ:</b> {selectedDealer.contactPerson}</p>
            <p><b>Điện thoại:</b> {selectedDealer.phone}</p>
            <p><b>Email:</b> {selectedDealer.email}</p>
            <p><b>Địa chỉ:</b> {selectedDealer.address}, {selectedDealer.city}, {selectedDealer.province}</p>
            <p><b>Loại:</b> {selectedDealer.dealerType}</p>
            <p><b>Ngân hàng:</b> {selectedDealer.bankName} </p>
             <p><b>Số tiền:</b> {selectedDealer.bankAccount} </p>
            <p><b>Hoa hồng:</b> {selectedDealer.commissionRate}%</p>
            <p><b>Trạng thái:</b> {selectedDealer.status}</p>
            <p><b>Ghi chú:</b> {selectedDealer.notes}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
