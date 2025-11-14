import "../Admin/Customer.css";
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { warehouseAPI } from "../../services/API.js";

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    warehouseName: "",
    warehouseCode: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    email: "",
    capacity: 0,
    isActive: true,
  });

  // ✅ Lấy danh sách kho
  const fetchWarehouses = async () => {
    try {
      const res = await warehouseAPI.getWarehouses();
      setWarehouses(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách kho:", err);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // ✅ Tìm kiếm kho theo tên
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        fetchWarehouses();
        return;
      }
      try {
        const res = await warehouseAPI.searchWarehouses(trimmed);
        setWarehouses(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết kho
  const handleView = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetail(true);
  };

  // ✅ Mở form thêm kho
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      warehouseName: "",
      warehouseCode: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      phone: "",
      email: "",
      capacity: 0,
      isActive: true,
    });
    setShowPopup(true);
  };

  // ✅ Mở form sửa kho
  const handleEdit = (warehouse) => {
    setIsEdit(true);
    setSelectedWarehouse(warehouse);
    setFormData({ ...warehouse });
    setShowPopup(true);
  };

  // ✅ Xóa kho
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa kho này không?")) return;
    try {
      await warehouseAPI.deleteWarehouse(id);
      alert("Xóa kho thành công!");
      fetchWarehouses();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa kho!");
    }
  };

  // ✅ Gửi form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.warehouseName || !formData.warehouseCode) {
      setError("Vui lòng nhập tên và mã kho!");
      return;
    }

    try {
      if (isEdit && selectedWarehouse) {
        await warehouseAPI.updateWarehouse(selectedWarehouse.warehouseId, formData);
        alert("Cập nhật kho thành công!");
      } else {
        await warehouseAPI.createWarehouse(formData);
        alert("Thêm kho thành công!");
      }
      setShowPopup(false);
      fetchWarehouses();
    } catch (err) {
      console.error("Lỗi khi lưu kho:", err);
      alert("Không thể lưu kho!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý kho</div>

      <div className="title2-customer">
        <h2>Danh sách kho</h2>
        <h3 onClick={handleOpenAdd}>
          <FaPlus /> Thêm kho
        </h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm kho..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>TÊN KHO</th>
              <th>MÃ KHO</th>
              <th>ĐỊA CHỈ</th>
              <th>THÀNH PHỐ</th>
              <th>TỈNH</th>
              <th>SĐT</th>
              <th>EMAIL</th>
              <th>KHẢ NĂNG</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.length > 0 ? (
              warehouses.map((w) => (
                <tr key={w.warehouseId}>
                  <td>{w.warehouseName}</td>
                  <td>{w.warehouseCode}</td>
                  <td>{w.address}</td>
                  <td>{w.city}</td>
                  <td>{w.province}</td>
                  <td>{w.phone}</td>
                  <td>{w.email}</td>
                  <td>{w.capacity}</td>
                  <td>
                    <span
                      style={{
                        background: w.isActive ? "#dcfce7" : "#fee2e2",
                        color: w.isActive ? "#16a34a" : "#dc2626",
                        padding: "5px 8px",
                        borderRadius: "5px",
                      }}
                    >
                      {w.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(w)}><FaEye /></button>
                    <button className="icon-btn edit" onClick={() => handleEdit(w)}><FaPen /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(w.warehouseId)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu kho
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{isEdit ? "Sửa kho" : "Thêm kho mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input placeholder="Tên kho" value={formData.warehouseName} onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })} />
                <input placeholder="Mã kho" value={formData.warehouseCode} onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })} />
                <input placeholder="Địa chỉ" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                <input placeholder="Thành phố" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                <input placeholder="Tỉnh" value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} />
                <input placeholder="Postal code" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} />
                <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <input type="number" placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} />
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
      {showDetail && selectedWarehouse && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin kho</h2>
            <p><b>Tên kho:</b> {selectedWarehouse.warehouseName}</p>
            <p><b>Mã kho:</b> {selectedWarehouse.warehouseCode}</p>
            <p><b>Địa chỉ:</b> {selectedWarehouse.address}</p>
            <p><b>Thành phố:</b> {selectedWarehouse.city}</p>
            <p><b>Tỉnh:</b> {selectedWarehouse.province}</p>
            <p><b>Postal code:</b> {selectedWarehouse.postalCode}</p>
            <p><b>Phone:</b> {selectedWarehouse.phone}</p>
            <p><b>Email:</b> {selectedWarehouse.email}</p>
            <p><b>Capacity:</b> {selectedWarehouse.capacity}</p>
            <p><b>Trạng thái:</b> {selectedWarehouse.isActive ? "Hoạt động" : "Ngừng"}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
