// VehicleModel.jsx
import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vehicleAPI } from "../../services/API";
import { getModelImageUrl } from "../../utils/imageUtils";

export default function VehicleModel() {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    modelName: "",
    vehicleType: "SEDAN",      // mặc định
    description: "",
    modelImageUrl: "",         // ví dụ: "/uploads/models/model3.jpg"
    modelImagePath: "",        // ví dụ: "models/model3.jpg"
    isActive: true,
    effectiveModelYear: 0,
    brandId: "",
    modelYear: new Date().getFullYear(),
    year: new Date().getFullYear()
  });

  // load models + brands
  useEffect(() => {
    fetchModels();
    fetchBrands();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await vehicleAPI.getModels();
      setModels(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách dòng xe:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await vehicleAPI.getBrands();
      setBrands(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách hãng:", err);
    }
  };

  // tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const q = searchTerm.trim();
      if (!q) {
        fetchModels();
        return;
      }
      try {
        const res = await vehicleAPI.searchModels(q);
        setModels(res.data || []);
      } catch (err) {
        console.error("Lỗi tìm kiếm dòng xe:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedModel(null);
    setFormData({
      modelName: "",
      vehicleType: "SEDAN",
      description: "",
      modelImageUrl: "",
      modelImagePath: "",
      isActive: true,
      effectiveModelYear: 0,
      brandId: "",
      modelYear: new Date().getFullYear(),
      year: new Date().getFullYear()
    });
    setError("");
    setShowPopup(true);
  };

  const handleEdit = (m) => {
    setIsEdit(true);
    setSelectedModel(m);
    setFormData({
      modelName: m.modelName || "",
      vehicleType: m.vehicleType || "SEDAN",
      description: m.description || "",
      modelImageUrl: m.modelImageUrl || "",
      modelImagePath: m.modelImagePath || "",
      isActive: m.isActive ?? true,
      effectiveModelYear: m.effectiveModelYear ?? 0,
      brandId: m.brand?.brandId ?? "",
      modelYear: m.modelYear ?? (m.year ?? new Date().getFullYear()),
      year: m.year ?? (m.modelYear ?? new Date().getFullYear())
    });
    setError("");
    setShowPopup(true);
  };

  const handleView = async (m) => {
    try {
      // Fetch chi tiết từ API để đảm bảo có đầy đủ dữ liệu
      let modelData = m;
      try {
        const res = await vehicleAPI.getModel(m.modelId);
        modelData = res.data || m;
      } catch (err) {
        console.warn("⚠️ Không thể fetch chi tiết model, dùng dữ liệu từ list:", err);
      }

      // Merge brand từ danh sách brands nếu không có trong modelData
      if (!modelData.brand && (modelData.brandId || m.brandId)) {
        const brandId = modelData.brandId || m.brandId;
        const brandFromList = brands.find((b) => b.brandId === brandId);
        if (brandFromList) {
          modelData.brand = brandFromList;
        }
      }

      setSelectedModel(modelData);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi xem chi tiết:", err);
      setSelectedModel(m);
      setShowDetail(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dòng xe này không?")) return;
    try {
      await vehicleAPI.deleteModel(id);
      alert("✅ Xóa thành công!");
      fetchModels();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      const msg = err.response?.data?.message || err.message || "Không thể xóa dòng xe";
      alert("Không thể xóa dòng xe: " + msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // kiểm tra bắt buộc
    if (!formData.modelName || !formData.brandId) {
      setError("Vui lòng nhập đầy đủ: Tên dòng xe và Hãng.");
      return;
    }

    // chuẩn hóa payload giống mẫu backend
    const payload = {
      modelName: formData.modelName,
      vehicleType: formData.vehicleType || null,
      description: formData.description || "",
      modelImageUrl: formData.modelImageUrl || "",
      modelImagePath: formData.modelImagePath || "",
      isActive: formData.isActive ?? true,
      effectiveModelYear: formData.effectiveModelYear ?? 0,
      brandId: Number(formData.brandId),
      modelYear: formData.modelYear ? Number(formData.modelYear) : null,
      year: formData.year ? Number(formData.year) : (formData.modelYear ? Number(formData.modelYear) : null)
    };

    try {
      if (isEdit && selectedModel) {
        await vehicleAPI.updateModel(selectedModel.modelId, payload);
        alert("✅ Cập nhật dòng xe thành công!");
      } else {
        await vehicleAPI.createModel(payload);
        alert("✅ Thêm dòng xe thành công!");
      }
      setShowPopup(false);
      fetchModels();
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      const msg = err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
      setError("Lưu thất bại: " + msg);
      alert("Lưu thất bại: " + msg);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý dòng xe</div>

      <div className="title2-customer">
        <h2>Danh sách dòng xe</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Thêm dòng xe</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm dòng xe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Tên dòng xe</th>
              <th>Hãng xe</th>
              <th>Mô tả</th>
              <th>Năm</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {models.length > 0 ? (
              models.map((m) => (
                  <tr key={m.modelId}>
                    <td>{m.modelName}</td>
                    <td>{m.brand?.brandName || (m.brandId ? brands.find(b => b.brandId === m.brandId)?.brandName : null) || "—"}</td>
                    <td>{m.description || "—"}</td>
                  <td>{m.modelYear || m.year || "—"}</td>
                  <td>
                    <span style={{
                      background: m.isActive ? "#dcfce7" : "#fee2e2",
                      color: m.isActive ? "#16a34a" : "#dc2626",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}>
                      {m.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button onClick={() => handleView(m)} className="icon-btn view"><FaEye /></button>
                    <button onClick={() => handleEdit(m)} className="icon-btn edit"><FaPen /></button>
                    <button onClick={() => handleDelete(m.modelId)} className="icon-btn delete"><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: "center" }}>Không có dữ liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.className === 'popup-overlay') setShowPopup(false); }}>
          <div className="popup-box">
            <h2>{isEdit ? "Sửa dòng xe" : "Thêm dòng xe"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  name="modelName"
                  placeholder="Tên dòng xe *"
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                  required
                />

                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn hãng xe --</option>
                  {brands.map((b) => (
                    <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
                  ))}
                </select>

                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="MPV">MPV</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="COUPE">Coupe</option>
                  <option value="CONVERTIBLE">Convertible</option>
                </select>

                <input
                  name="modelYear"
                  type="number"
                  placeholder="Năm sản xuất"
                  value={formData.modelYear}
                  onChange={(e) => setFormData({ ...formData, modelYear: e.target.value, year: e.target.value })}
                />

                <input
                  name="effectiveModelYear"
                  type="number"
                  placeholder="Năm hiệu lực (effectiveModelYear)"
                  value={formData.effectiveModelYear}
                  onChange={(e) => setFormData({ ...formData, effectiveModelYear: Number(e.target.value) })}
                />

                <input
                  name="modelImageUrl"
                  placeholder="URL ảnh (modelImageUrl)"
                  value={formData.modelImageUrl}
                  onChange={(e) => setFormData({ ...formData, modelImageUrl: e.target.value })}
                />

                <input
                  name="modelImagePath"
                  placeholder="Đường dẫn file (modelImagePath)"
                  value={formData.modelImagePath}
                  onChange={(e) => setFormData({ ...formData, modelImagePath: e.target.value })}
                />

                <textarea
                  name="description"
                  placeholder="Mô tả"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ gridColumn: '1 / -1' }}
                />

                <label style={{ gridColumn: '1 / -1' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />{" "}
                  Đang hoạt động
                </label>
              </div>

              {error && <div className="error" style={{ color: 'red', marginTop: 8 }}>{error}</div>}

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo mới"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedModel && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.className === 'popup-overlay') setShowDetail(false); }}>
          <div className="popup-box">
            <h2>Chi tiết dòng xe</h2>
            <p><b>Tên:</b> {selectedModel.modelName || "—"}</p>
            <p><b>Hãng:</b> {
              selectedModel.brand?.brandName || 
              (selectedModel.brandId ? brands.find(b => b.brandId === selectedModel.brandId)?.brandName : null) || 
              "—"
            }</p>
            <p><b>Vehicle Type:</b> {selectedModel.vehicleType || "—"}</p>
            <p><b>Năm:</b> {selectedModel.modelYear || selectedModel.year || "—"}</p>
            <p><b>Effective Model Year:</b> {selectedModel.effectiveModelYear ?? 0}</p>
            <p><b>Mô tả:</b> {selectedModel.description || "—"}</p>
            <div>
              <b>Ảnh:</b> {
                getModelImageUrl(selectedModel) ? (
                  <div style={{ marginTop: "10px" }}>
                    <img 
                      src={getModelImageUrl(selectedModel)} 
                      alt={selectedModel.modelName || "Model image"}
                      style={{ 
                        maxWidth: "100%", 
                        maxHeight: "300px", 
                        borderRadius: "8px",
                        border: "1px solid #ddd"
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "block";
                      }}
                    />
                    <span style={{ display: "none", color: "#666" }}>
                      {selectedModel.modelImageUrl || selectedModel.modelImagePath || "—"}
                    </span>
                  </div>
                ) : "—"
              }
            </div>
            <p><b>Trạng thái:</b> {selectedModel.isActive ? "Hoạt động" : "Ngừng"}</p>
            <button onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
