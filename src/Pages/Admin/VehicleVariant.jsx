import "./Customer.css";
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vehicleAPI, imageAPI } from "../../services/API";
import { getVariantImageUrl } from "../../utils/imageUtils";

export default function VehicleVariant() {
  const [variants, setVariants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [error, setError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    variantName: "",
    topSpeed: "",
    batteryCapacity: "",
    chargingTimeFast: "",
    chargingTimeSlow: "",
    isActive: true,
    variantImageUrl: "",
    variantImagePath: "",
    basePrice: "",
    powerKw: "",
    acceleration0100: "",
    rangeKm: "",
    valid: true,
    priceBase: "",
  });

  // ===== Fetch =====
  const fetchVariants = async () => {
    try {
      const res = await vehicleAPI.getVariants();
      const variantsData = res.data || [];
      console.log("📋 Total variants:", variantsData.length);
      
      // Debug: Log tất cả variant có ảnh
      variantsData.forEach((v, idx) => {
        const imageUrl = getVariantImageUrl(v);
        if (imageUrl) {
          console.log(`✅ Variant ${idx + 1} (${v.variantName}) có ảnh:`, {
            variantImageUrl: v.variantImageUrl,
            variantImagePath: v.variantImagePath,
            computedUrl: imageUrl
          });
        } else {
          console.log(`⚠️ Variant ${idx + 1} (${v.variantName}) không có ảnh:`, {
            variantImageUrl: v.variantImageUrl,
            variantImagePath: v.variantImagePath
          });
        }
      });
      
      setVariants(variantsData);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách variant:", err);
      console.error("❌ Error response:", err.response);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, []);

  // ===== Search =====
  useEffect(() => {
    const id = setTimeout(async () => {
      const q = searchTerm.trim();
      if (!q) return fetchVariants();
      try {
        const res = await vehicleAPI.searchVariants(q);
        setVariants(res.data || []);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // ===== Handlers =====
  const handleView = (variant) => {
    setSelectedVariant(variant);
    setShowDetail(true);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      variantName: "",
      topSpeed: "",
      batteryCapacity: "",
      chargingTimeFast: "",
      chargingTimeSlow: "",
      isActive: true,
      variantImageUrl: "",
      variantImagePath: "",
      basePrice: "",
      powerKw: "",
      acceleration0100: "",
      rangeKm: "",
      valid: true,
      priceBase: "",
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setError("");
    setShowPopup(true);
  };

  const handleEdit = (variant) => {
    setIsEdit(true);
    setSelectedVariant(variant);
    setFormData({
      variantName: variant.variantName ?? "",
      topSpeed: variant.topSpeed ?? "",
      batteryCapacity: variant.batteryCapacity ?? "",
      chargingTimeFast: variant.chargingTimeFast ?? "",
      chargingTimeSlow: variant.chargingTimeSlow ?? "",
      isActive: variant.isActive ?? true,
      variantImageUrl: variant.variantImageUrl ?? "",
      variantImagePath: variant.variantImagePath ?? "",
      basePrice: variant.basePrice ?? "",
      powerKw: variant.powerKw ?? "",
      acceleration0100: variant.acceleration0100 ?? "",
      rangeKm: variant.rangeKm ?? "",
      valid: variant.valid ?? true,
      priceBase: variant.priceBase ?? "",
    });
    setSelectedImageFile(null);
    setImagePreview(getVariantImageUrl(variant));
    setError("");
    setShowPopup(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa biến thể này không?")) return;
    try {
      await vehicleAPI.deleteVariant(id);
      alert("Xóa thành công!");
      fetchVariants();
    } catch (err) {
      console.error("Lỗi khi xóa biến thể:", err);
      alert("Xóa thất bại: " + (err.response?.data?.message || err.message));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.variantName) {
      setError("Vui lòng nhập tên biến thể!");
      return;
    }

    // Upload ảnh trước nếu có file mới
    // Khi edit: nếu không có file mới, giữ nguyên ảnh cũ
    // Khi tạo mới: nếu không có file, để null
    let imageUrl = "";
    let imagePath = "";
    
    if (isEdit && selectedVariant) {
      // Khi edit: mặc định giữ ảnh cũ
      imageUrl = selectedVariant.variantImageUrl || "";
      imagePath = selectedVariant.variantImagePath || "";
    }
    
    // Nếu có file mới, upload và thay thế
    if (selectedImageFile) {
      try {
        setUploadingImage(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedImageFile);
        console.log("📤 Uploading image:", selectedImageFile.name);
        const uploadRes = await imageAPI.uploadVehicleVariant(formDataUpload);
        console.log("📥 Upload response:", uploadRes);
        console.log("📥 Upload response data:", uploadRes.data);
        
        // Xử lý response - thử nhiều format
        // Response có thể có cấu trúc: { uploadResult: {...}, category: 'variants', ... }
        const responseData = uploadRes.data || {};
        const uploadResult = responseData.uploadResult || responseData.data || responseData;
        
        console.log("🔍 Upload result:", uploadResult);
        
        // Thử nhiều cách extract URL và path
        imageUrl = uploadResult.url || 
                   uploadResult.imageUrl || 
                   uploadResult.fileUrl ||
                   uploadResult.filePath ||
                   responseData.url ||
                   responseData.imageUrl ||
                   responseData.fileUrl ||
                   (uploadResult.filename && `/uploads/variants/${uploadResult.filename}`) ||
                   (responseData.filename && `/uploads/variants/${responseData.filename}`) ||
                   "";
        
        imagePath = uploadResult.path || 
                    uploadResult.imagePath || 
                    uploadResult.filePath ||
                    responseData.path ||
                    responseData.imagePath ||
                    responseData.filePath ||
                    (uploadResult.filename && `variants/${uploadResult.filename}`) ||
                    (responseData.filename && `variants/${responseData.filename}`) ||
                    "";
        
        // Nếu chỉ có filename, tạo path
        if (!imageUrl && uploadResult.filename) {
          imageUrl = `/uploads/variants/${uploadResult.filename}`;
        }
        if (!imageUrl && responseData.filename) {
          imageUrl = `/uploads/variants/${responseData.filename}`;
        }
        if (!imagePath && uploadResult.filename) {
          imagePath = `variants/${uploadResult.filename}`;
        }
        if (!imagePath && responseData.filename) {
          imagePath = `variants/${responseData.filename}`;
        }
        
        // Nếu vẫn không có, thử lấy từ category và filename
        if (!imageUrl && responseData.category && uploadResult.filename) {
          imageUrl = `/uploads/${responseData.category}/${uploadResult.filename}`;
        }
        if (!imagePath && responseData.category && uploadResult.filename) {
          imagePath = `${responseData.category}/${uploadResult.filename}`;
        }
        
        console.log("✅ Extracted imageUrl:", imageUrl);
        console.log("✅ Extracted imagePath:", imagePath);
        
        // Nếu vẫn không có, log toàn bộ response để debug
        if (!imageUrl || !imagePath) {
          console.warn("⚠️ Không thể extract imageUrl/imagePath từ response. Full response:", JSON.stringify(responseData, null, 2));
        }
      } catch (err) {
        console.error("❌ Lỗi khi upload ảnh:", err);
        console.error("❌ Error response:", err.response);
        setError("Lỗi khi upload ảnh: " + (err.response?.data?.message || err.response?.data?.error || err.message));
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    // ✅ convert đúng BigDecimal (string or number)
    const payload = {
      variantName: String(formData.variantName).trim(),
      topSpeed: formData.topSpeed ? Number(formData.topSpeed) : null,
      batteryCapacity: formData.batteryCapacity ? Number(formData.batteryCapacity) : null,
      chargingTimeFast: formData.chargingTimeFast ? Number(formData.chargingTimeFast) : null,
      chargingTimeSlow: formData.chargingTimeSlow ? Number(formData.chargingTimeSlow) : null,
      isActive: !!formData.isActive,
      variantImageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null, // Đảm bảo không gửi empty string
      variantImagePath: imagePath && imagePath.trim() ? imagePath.trim() : null, // Đảm bảo không gửi empty string
      basePrice: formData.basePrice ? Number(formData.basePrice) : null,
      powerKw: formData.powerKw ? Number(formData.powerKw) : null,
      acceleration0100: formData.acceleration0100 ? Number(formData.acceleration0100) : null,
      rangeKm: formData.rangeKm ? Number(formData.rangeKm) : null,
      valid: !!formData.valid,
      priceBase:
        formData.priceBase && !isNaN(formData.priceBase)
          ? Number(formData.priceBase)
          : formData.priceBase
          ? formData.priceBase.toString()
          : null,
    };

    // Log payload để debug
    console.log("📤 Payload gửi lên server:", payload);
    console.log("🖼️ Image fields trong payload:", {
      variantImageUrl: payload.variantImageUrl,
      variantImagePath: payload.variantImagePath
    });

    try {
      if (isEdit && selectedVariant) {
        console.log("✏️ Updating variant ID:", selectedVariant.variantId);
        const updateRes = await vehicleAPI.updateVariant(selectedVariant.variantId, payload);
        console.log("✅ Update response:", updateRes);
        alert("Cập nhật biến thể thành công!");
      } else {
        console.log("➕ Creating new variant");
        const createRes = await vehicleAPI.createVariant(payload);
        console.log("✅ Create response:", createRes);
        alert("Tạo biến thể thành công!");
      }
      setShowPopup(false);
      // Reset form và image states
      setSelectedImageFile(null);
      setImagePreview(null);
      fetchVariants();
    } catch (err) {
      console.error("❌ Lỗi khi lưu biến thể:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error data:", err.response?.data);
      const msg = err.response?.data?.message || err.response?.data || err.message;
      alert("Lỗi khi lưu biến thể: " + JSON.stringify(msg));
    }
  };

  // ===== utils =====
  const formatPrice = (price) =>
    price == null || price === 0
      ? "—"
      : new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";

  // ===== render =====
  return (
    <div className="customer">
      <div className="title-customer">Quản lý biến thể xe</div>

      <div className="title2-customer">
        <h2>Danh sách biến thể</h2>
        <h3 onClick={handleOpenAdd}>
          <FaPlus /> Thêm biến thể
        </h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm biến thể..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>HÌNH</th>
              <th>TÊN BIẾN THỂ</th>
              <th>TỐC ĐỘ TỐI ĐA</th>
              <th>PIN (kWh)</th>
              <th>GIÁ (VNĐ)</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {variants.length ? (
              variants.map((v) => (
                <tr key={v.variantId}>
                  <td>
                    {(() => {
                      const imageUrl = getVariantImageUrl(v);
                      if (imageUrl) {
                        return (
                          <div style={{ position: "relative", width: 70, height: 50 }}>
                            <img
                              key={`img-${v.variantId}-${imageUrl}`}
                              src={imageUrl}
                              alt={v.variantName || "Variant"}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 6,
                                display: "block",
                                backgroundColor: "#f0f0f0",
                                border: "1px solid #ddd"
                              }}
                              onError={(e) => {
                                console.error(`❌ Image load error for variant ${v.variantName}:`, imageUrl);
                                console.error("Variant data:", v);
                                e.target.style.display = "none";
                                const fallback = e.target.parentElement?.querySelector('.image-fallback');
                                if (fallback) {
                                  fallback.style.display = "flex";
                                }
                              }}
                              onLoad={() => {
                                console.log(`✅ Image loaded for variant ${v.variantName}:`, imageUrl);
                              }}
                            />
                            <div 
                              className="image-fallback"
                              style={{ 
                                display: "none",
                                width: "100%",
                                height: "100%",
                                backgroundColor: "#f0f0f0",
                                borderRadius: 6,
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                color: "#999",
                                border: "1px solid #ddd"
                              }}
                            >
                              —
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div style={{
                          width: 70,
                          height: 50,
                          backgroundColor: "#f0f0f0",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "#999",
                          border: "1px solid #ddd"
                        }}>
                          —
                        </div>
                      );
                    })()}
                  </td>
                  <td>{v.variantName || "—"}</td>
                  <td>{v.topSpeed ?? "—"} {v.topSpeed ? "km/h" : ""}</td>
                  <td>{v.batteryCapacity ?? "—"} {v.batteryCapacity ? "kWh" : ""}</td>
                  <td>{v.priceBase ? formatPrice(v.priceBase) : "—"}</td>
                  <td>
                    <span
                      style={{
                        background: v.isActive ? "#dcfce7" : "#fee2e2",
                        color: v.isActive ? "#16a34a" : "#dc2626",
                        padding: "5px 8px",
                        borderRadius: 5,
                      }}
                    >
                      {v.isActive ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(v)}>
                      <FaEye />
                    </button>
                    <button className="icon-btn edit" onClick={() => handleEdit(v)}>
                      <FaPen />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(v.variantId)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm / sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{isEdit ? "Sửa biến thể" : "Thêm biến thể mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  placeholder="Tên biến thể *"
                  value={formData.variantName}
                  onChange={(e) => setFormData({ ...formData, variantName: e.target.value })}
                  required
                />

                <input
                  type="number"
                  placeholder="Tốc độ tối đa (km/h)"
                  value={formData.topSpeed}
                  onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Dung lượng pin (kWh)"
                  value={formData.batteryCapacity}
                  onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                />

                <input
                  type="number"
                  placeholder="Giá cơ bản (VNĐ)"
                  value={formData.priceBase}
                  onChange={(e) =>setFormData({ ...formData, priceBase: e.target.value })}
                />

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Hình ảnh
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
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginTop: '10px'
                      }}
                    />
                  )}
                </div>
              </div>

              {error && <div style={{ color: "red", marginTop: '10px' }}>{error}</div>}

              {uploadingImage && (
                <div style={{ color: '#666', marginTop: '10px', marginBottom: '10px' }}>
                  Đang upload ảnh...
                </div>
              )}

              <div className="form-actions">
                <button type="submit" disabled={uploadingImage}>
                  {uploadingImage ? "Đang xử lý..." : (isEdit ? "Cập nhật" : "Tạo mới")}
                </button>
                <button type="button" onClick={() => setShowPopup(false)} disabled={uploadingImage}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chi tiết */}
      {showDetail && selectedVariant && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin biến thể</h2>
            {(() => {
              const detailImageUrl = getVariantImageUrl(selectedVariant);
              console.log("🔍 Detail variant image:", {
                variantImageUrl: selectedVariant.variantImageUrl,
                variantImagePath: selectedVariant.variantImagePath,
                computedUrl: detailImageUrl
              });
              if (detailImageUrl) {
                return (
                  <img
                    src={detailImageUrl}
                    alt="variant"
                    style={{ width: 200, height: 150, objectFit: 'cover', borderRadius: 10, marginBottom: 15 }}
                    onError={(e) => {
                      console.error("❌ Detail image load error:", detailImageUrl);
                      e.target.style.display = "none";
                    }}
                    onLoad={() => {
                      console.log("✅ Detail image loaded:", detailImageUrl);
                    }}
                  />
                );
              }
              return null;
            })()}
            <p><b>Tên:</b> {selectedVariant.variantName || "—"}</p>
            <p><b>Tốc độ tối đa:</b> {selectedVariant.topSpeed ?? "—"} {selectedVariant.topSpeed ? "km/h" : ""}</p>
            <p><b>Pin:</b> {selectedVariant.batteryCapacity ?? "—"} {selectedVariant.batteryCapacity ? "kWh" : ""}</p>
            <p><b>Giá cơ bản:</b> {formatPrice(selectedVariant.priceBase)}</p>
            <p><b>Trạng thái:</b> {selectedVariant.isActive ? "Hoạt động" : "Ngừng"}</p>
            {selectedVariant.variantImageUrl && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                <b>URL ảnh:</b> {selectedVariant.variantImageUrl}
              </p>
            )}
            <button onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
