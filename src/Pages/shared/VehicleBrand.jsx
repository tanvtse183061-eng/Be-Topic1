import '../Admin/Customer.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vehicleAPI, imageAPI } from "../../services/API";
import { getBrandLogoUrl } from "../../utils/imageUtils"; 

export default function VehicleBrand() {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [error, setError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Phân quyền: Admin và EVMStaff có thể sửa/xóa, Dealer chỉ xem
  const currentRole = localStorage.getItem("role") || "";
  const isAdmin = currentRole === "ADMIN";
  const isEVMStaff = currentRole === "EVM_STAFF";
  const canEdit = isAdmin || isEVMStaff; // Admin và EVMStaff có thể sửa/xóa

  const [formData, setFormData] = useState({
    brandName: "",
    country: "",
    foundedYear: "",
    brandLogoUrl: "",
    brandLogoPath: "",
    isActive: true,
  });

  // ✅ Lấy danh sách thương hiệu
  const fetchBrands = async () => {
    try {
      const res = await vehicleAPI.getBrands();
      setBrands(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách thương hiệu:", err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // ✅ Tìm kiếm thương hiệu
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchBrands();
        return;
      }
      try {
        const res = await vehicleAPI.getBrands(`/search?name=${encodeURIComponent(trimmed)}`);
        setBrands(res.data);
      } catch (err) {
        console.error("❌ Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết thương hiệu
  const handleView = (brand) => {
    setSelectedBrand(brand);
    setShowDetail(true);
  };

  // ✅ Mở form thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      brandName: "",
      country: "",
      foundedYear: "",
      brandLogoUrl: "",
      brandLogoPath: "",
      isActive: true,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setShowPopup(true);
  };

  // ✅ Mở form sửa
  const handleEdit = (brand) => {
    setIsEdit(true);
    setSelectedBrand(brand);
    setFormData({
      brandName: brand.brandName || "",
      country: brand.country || "",
      foundedYear: brand.foundedYear || "",
      brandLogoUrl: brand.brandLogoUrl || "",
      brandLogoPath: brand.brandLogoPath || "",
      isActive: brand.isActive ?? true,
    });
    setSelectedImageFile(null);
    setImagePreview(getBrandLogoUrl(brand));
    setShowPopup(true);
  };

  // ✅ Xóa thương hiệu
  const handleDelete = async (brandId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này không?")) return;
    try {
      await vehicleAPI.deleteBrand(brandId);
      alert("✅ Xóa thương hiệu thành công!");
      fetchBrands();
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      alert("Không thể xóa thương hiệu!");
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

  // ✅ Thêm / Sửa thương hiệu
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brandName || !formData.country) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Upload ảnh trước nếu có file mới
    let imageUrl = formData.brandLogoUrl || "";
    let imagePath = formData.brandLogoPath || "";
    
    if (selectedImageFile) {
      try {
        setUploadingImage(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedImageFile);
        const uploadRes = await imageAPI.uploadVehicleBrand(formDataUpload);
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
      brandName: formData.brandName,
      country: formData.country,
      foundedYear: formData.foundedYear ? Number(formData.foundedYear) : null,
      brandLogoUrl: imageUrl,
      brandLogoPath: imagePath,
      isActive: formData.isActive ?? true,
    };

    try {
      if (isEdit && selectedBrand) {
        await vehicleAPI.updateBrand(selectedBrand.brandId, payload);
        alert("✅ Cập nhật thương hiệu thành công!");
      } else {
        await vehicleAPI.createBrand(payload);
        alert("✅ Thêm thương hiệu thành công!");
      }
      setShowPopup(false);
      setError("");
      fetchBrands();
    } catch (err) {
      console.error("❌ Lỗi khi lưu thương hiệu:", err);
      alert("Không thể lưu thương hiệu!");
    }
  };

  // ✅ Xử lý logo hiển thị - dùng helper function
  const getLogoUrl = getBrandLogoUrl;

  return (
    <div className="customer">
      <div className="title-customer">Quản lý thương hiệu xe</div>

      <div className="title2-customer">
        <h2>Danh sách thương hiệu</h2>
        {canEdit && (
          <h3 onClick={handleOpenAdd}>
            <FaPlus /> Thêm thương hiệu
          </h3>
        )}
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm thương hiệu..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>LOGO</th>
              <th>TÊN THƯƠNG HIỆU</th>
              <th>QUỐC GIA</th>
              <th>NĂM THÀNH LẬP</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {brands.length > 0 ? (
              brands.map((b) => (
                <tr key={b.brandId}>
                  <td>
                    {getLogoUrl(b) ? (
                      <img
                        src={getLogoUrl(b)}
                        alt={b.brandName}
                        style={{
                          width: "60px",
                          height: "40px",
                          borderRadius: "6px",
                          objectFit: "cover",
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{b.brandName || "—"}</td>
                  <td>{b.country || "—"}</td>
                  <td>{b.foundedYear || "—"}</td>
                  <td>
                    <span
                      style={{
                        background: b.isActive ? "#dcfce7" : "#fee2e2",
                        color: b.isActive ? "#16a34a" : "#dc2626",
                        padding: "5px 8px",
                        borderRadius: "5px",
                      }}
                    >
                      {b.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(b)}>
                      <FaEye />
                    </button>
                    {canEdit && (
                      <>
                        <button className="icon-btn edit" onClick={() => handleEdit(b)}>
                          <FaPen />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDelete(b.brandId)}>
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu thương hiệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa - chỉ hiện khi có quyền */}
      {showPopup && canEdit && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{isEdit ? "Sửa thương hiệu" : "Thêm thương hiệu mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  name="brandName"
                  placeholder="Tên thương hiệu *"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  required
                />
                <input
                  name="country"
                  placeholder="Quốc gia *"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
                <input
                  name="foundedYear"
                  type="number"
                  placeholder="Năm thành lập"
                  value={formData.foundedYear}
                  onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                />
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Logo thương hiệu
                  </label>
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
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '10px'
                      }}
                    />
                  )}
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Đang hoạt động
                </label>
              </div>
              {error && <span className="error">{error}</span>}
              {uploadingImage && (
                <div style={{ color: '#666', marginTop: '10px', marginBottom: '10px' }}>
                  Đang upload ảnh...
                </div>
              )}
              <div className="form-actions">
                <button type="submit" disabled={uploadingImage}>
                  {uploadingImage ? "Đang xử lý..." : (isEdit ? "Cập nhật" : "Tạo")}
                </button>
                <button type="button" onClick={() => setShowPopup(false)} disabled={uploadingImage}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedBrand && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin thương hiệu</h2>
            {getLogoUrl(selectedBrand) && (
              <img
                src={getLogoUrl(selectedBrand)}
                alt="Logo"
                style={{ width: "120px", borderRadius: "10px", marginBottom: "15px" }}
              />
            )}
            <p><b>Tên:</b> {selectedBrand.brandName || "—"}</p>
            <p><b>Quốc gia:</b> {selectedBrand.country || "—"}</p>
            <p><b>Năm thành lập:</b> {selectedBrand.foundedYear || "—"}</p>
            <p><b>Trạng thái:</b> {selectedBrand.isActive ? "Hoạt động" : "Ngừng"}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

