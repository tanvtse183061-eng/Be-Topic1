import './Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vehicleAPI, imageAPI } from "../../services/API";
import { getColorSwatchUrl } from "../../utils/imageUtils";

export default function VehicleColor() {
  const [colors, setColors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [error, setError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    colorName: "",
    colorCode: "#FFFFFF",
    colorSwatchUrl: "",
    colorSwatchPath: "",
    isActive: true,
  });

  // ✅ Lấy danh sách màu
  const fetchColors = async () => {
    try {
      const res = await vehicleAPI.getColors();
      setColors(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách màu:", err);
      alert("Không thể tải danh sách màu!");
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  // ✅ Tìm kiếm theo tên
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchColors();
        return;
      }
      try {
        const res = await vehicleAPI.searchColors(trimmed);
        setColors(res.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết
  const handleView = (color) => {
    setSelectedColor(color);
    setShowDetail(true);
  };

  // ✅ Mở form thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setError("");
    setFormData({
      colorName: "",
      colorCode: "#FFFFFF",
      colorSwatchUrl: "",
      colorSwatchPath: "",
      isActive: true,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setShowPopup(true);
  };

  // ✅ Sửa màu
  const handleEdit = (color) => {
    setIsEdit(true);
    setSelectedColor(color);
    setError("");
    setFormData({
      colorName: color.colorName || "",
      colorCode: color.colorCode || "#FFFFFF",
      colorSwatchUrl: color.colorSwatchUrl || "",
      colorSwatchPath: color.colorSwatchPath || "",
      isActive: color.isActive !== undefined ? color.isActive : true,
    });
    setSelectedImageFile(null);
    setImagePreview(getColorSwatchUrl(color));
    setShowPopup(true);
  };

  // ✅ Xóa màu
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa màu này không?")) return;
    try {
      await vehicleAPI.deleteColor(id);
      alert("Xóa màu thành công!");
      fetchColors();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa màu!");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Vui lòng chọn file ảnh!");
        return;
      }
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  // ✅ Submit thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.colorName.trim() || !formData.colorCode.trim()) {
      setError("Vui lòng nhập tên và mã màu!");
      return;
    }

    // Upload ảnh trước nếu có file mới
    let imageUrl = formData.colorSwatchUrl || "";
    let imagePath = formData.colorSwatchPath || "";
    
    if (selectedImageFile) {
      try {
        setUploadingImage(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedImageFile);
        const uploadRes = await imageAPI.uploadColorSwatch(formDataUpload);
        // Lấy URL từ response
        imageUrl = uploadRes.data?.url || uploadRes.data?.imageUrl || uploadRes.data?.filename || uploadRes.data?.path || "";
        imagePath = uploadRes.data?.path || uploadRes.data?.imagePath || uploadRes.data?.filename || "";
      } catch (err) {
        console.error("Lỗi khi upload ảnh:", err);
        setError("Lỗi khi upload ảnh: " + (err.response?.data?.message || err.message));
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    const payload = {
      colorName: formData.colorName.trim(),
      colorCode: formData.colorCode.trim(),
      colorSwatchUrl: imageUrl,
      colorSwatchPath: imagePath,
      isActive: Boolean(formData.isActive),
    };

    try {
      if (isEdit && selectedColor) {
        await vehicleAPI.updateColor(selectedColor.colorId, payload);
        alert("Cập nhật màu thành công!");
      } else {
        await vehicleAPI.createColor(payload);
        alert("Thêm màu mới thành công!");
      }
      setShowPopup(false);
      fetchColors();
    } catch (err) {
      console.error("Lỗi khi lưu màu:", err);
      const msg = err.response?.data?.message || "Không thể lưu màu!";
      setError(msg);
      alert("Lỗi: " + msg);
    }
  };

  // ✅ ESC để đóng popup
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowPopup(false);
        setShowDetail(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="customer">
      <div className="title-customer">Quản lý màu xe</div>

      <div className="title2-customer">
        <h2>Danh sách màu ({colors.length})</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Thêm màu</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm màu..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SWATCH</th>
              <th>TÊN MÀU</th>
              <th>MÃ MÀU</th>
              <th>ĐƯỜNG DẪN ẢNH</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {colors.length > 0 ? (
              colors.map((c) => (
                <tr key={c.colorId}>
                  <td>
                    {getColorSwatchUrl(c) ? (
                      <img
                        src={getColorSwatchUrl(c)}
                        alt={c.colorName}
                        style={{ width: "60px", height: "40px", borderRadius: "6px", objectFit: "cover" }}
                        onError={(e) => { 
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div style={{
                      display: getColorSwatchUrl(c) ? "none" : "flex",
                      width: "60px", height: "40px",
                      background: "#f0f0f0", borderRadius: "6px",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "10px", color: "#999"
                    }}>No Image</div>
                  </td>
                  <td><strong>{c.colorName || "—"}</strong></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{
                        width: "24px", height: "24px",
                        backgroundColor: c.colorCode || "#ccc",
                        border: "2px solid #ccc", borderRadius: "4px"
                      }}></div>
                      <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{c.colorCode}</span>
                    </div>
                  </td>
                  <td>{c.colorSwatchPath || "—"}</td>
                  <td>
                    <span style={{
                      background: c.isActive ? "#dcfce7" : "#fee2e2",
                      color: c.isActive ? "#16a34a" : "#dc2626",
                      padding: "5px 10px", borderRadius: "5px", fontSize: "12px"
                    }}>
                      {c.isActive ? "Hoạt động" : "Ngưng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(c)}><FaEye /></button>
                    <button className="icon-btn edit" onClick={() => handleEdit(c)}><FaPen /></button>
                    <button className="icon-btn delete" onClick={() => handleDelete(c.colorId)}><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: "center", color: "#666", padding: "30px" }}>Không có dữ liệu màu xe</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <h2>{isEdit ? "✏️ Sửa màu xe" : "➕ Thêm màu mới"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Tên màu</label>
              <input
                value={formData.colorName}
                onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                placeholder="Tên màu xe"
              />

              <label>Mã màu</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  style={{ width: "60px", height: "40px", border: "none", background: "none", cursor: "pointer" }}
                />
                <input
                  type="text"
                  placeholder="#FFFFFF"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  style={{ flex: 1 }}
                />
              </div>

              <label>Ảnh Swatch</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginBottom: '10px' }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '150px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginTop: '10px'
                  }}
                />
              )}

              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                /> Hoạt động
              </label>

              {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

              {uploadingImage && (
                <div style={{ color: '#666', marginTop: '10px', marginBottom: '10px' }}>
                  Đang upload ảnh...
                </div>
              )}

              <button type="submit" className="btn-save" disabled={uploadingImage}>
                {uploadingImage ? "Đang xử lý..." : (isEdit ? "Cập nhật" : "Thêm mới")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedColor && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <h2>🎨 Thông tin màu</h2>
            {getColorSwatchUrl(selectedColor) && (
              <img
                src={getColorSwatchUrl(selectedColor)}
                alt="Color"
                style={{ width: "100%", maxHeight: "200px", borderRadius: "10px", objectFit: "cover", marginBottom: "15px" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div style={{ display: "grid", gap: "10px" }}>
              <p><b>Tên màu:</b> {selectedColor.colorName}</p>
              <p><b>Mã màu:</b> {selectedColor.colorCode}</p>
              <p><b>Đường dẫn ảnh:</b> {selectedColor.colorSwatchPath || "—"}</p>
              <p><b>Trạng thái:</b> {selectedColor.isActive ? "✅ Hoạt động" : "❌ Ngưng"}</p>
            </div>
            <button
              className="btn-close"
              onClick={() => setShowDetail(false)}
              style={{
                marginTop: "20px", padding: "10px 20px",
                background: "#4CAF50", color: "white",
                border: "none", borderRadius: "5px", width: "100%"
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
