import "./Customer.css";
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vehicleAPI } from "../../services/API";

export default function VehicleVariant() {
  const [variants, setVariants] = useState([]);
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [error, setError] = useState("");

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
    modelId: "",
    valid: true,
    priceBase: "", // ✅ đổi {} → ""
  });

  // ===== Fetch =====
  const fetchModels = async () => {
    try {
      const res = await vehicleAPI.getModels();
      setModels(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách model:", err);
    }
  };

  const fetchVariants = async () => {
    try {
      const res = await vehicleAPI.getVariants();
      setVariants(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách variant:", err);
    }
  };

  useEffect(() => {
    fetchModels();
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
      modelId: "",
      valid: true,
      priceBase: "",
    });
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
      modelId: variant.model?.modelId ?? "",
      valid: variant.valid ?? true,
      priceBase: variant.priceBase ?? "",
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.variantName || !formData.modelId) {
      setError("Vui lòng nhập tên biến thể và chọn dòng xe!");
      return;
    }

    // ✅ convert đúng BigDecimal (string or number)
    const payload = {
      variantName: String(formData.variantName).trim(),
      topSpeed: formData.topSpeed ? Number(formData.topSpeed) : null,
      batteryCapacity: formData.batteryCapacity ? Number(formData.batteryCapacity) : null,
      chargingTimeFast: formData.chargingTimeFast ? Number(formData.chargingTimeFast) : null,
      chargingTimeSlow: formData.chargingTimeSlow ? Number(formData.chargingTimeSlow) : null,
      isActive: !!formData.isActive,
      variantImageUrl: formData.variantImageUrl || "",
      variantImagePath: formData.variantImagePath || "",
      basePrice: formData.basePrice ? Number(formData.basePrice) : null,
      powerKw: formData.powerKw ? Number(formData.powerKw) : null,
      acceleration0100: formData.acceleration0100 ? Number(formData.acceleration0100) : null,
      rangeKm: formData.rangeKm ? Number(formData.rangeKm) : null,
      modelId: Number(formData.modelId),
      valid: !!formData.valid,
      priceBase:
        formData.priceBase && !isNaN(formData.priceBase)
          ? Number(formData.priceBase)
          : formData.priceBase
          ? formData.priceBase.toString()
          : null,
    };

    try {
      if (isEdit && selectedVariant) {
        await vehicleAPI.updateVariant(selectedVariant.variantId, payload);
        alert("Cập nhật biến thể thành công!");
      } else {
        await vehicleAPI.createVariant(payload);
        alert("Tạo biến thể thành công!");
      }
      setShowPopup(false);
      fetchVariants();
    } catch (err) {
      console.error("Lỗi khi lưu biến thể:", err);
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
              <th>DÒNG XE</th>
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
                    {v.variantImageUrl ? (
                      <img
                        src={v.variantImageUrl}
                        alt={v.variantName}
                        style={{
                          width: 70,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{v.variantName}</td>
                  <td>{v.model?.modelName ?? "—"}</td>
                  <td>{v.topSpeed ?? "—"} km/h</td>
                  <td>{v.batteryCapacity ?? "—"} kWh</td>
                  <td>{v.priceBase}</td>
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
                <td colSpan={8} style={{ textAlign: "center", color: "#666" }}>
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
                <select
                  value={formData.modelId}
                  onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn dòng xe --</option>
                  {models.map((m) => (
                    <option key={m.modelId} value={m.modelId}>
                      {m.modelName}
                    </option>
                  ))}
                </select>

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

                <input
                  type="text"
                  placeholder="URL ảnh"
                  value={formData.variantImageUrl}
                  onChange={(e) => setFormData({ ...formData, variantImageUrl: e.target.value })}
                />
              </div>

              {error && <div style={{ color: "red" }}>{error}</div>}

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo mới"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>
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
            {selectedVariant.variantImageUrl && (
              <img
                src={selectedVariant.variantImageUrl}
                alt="variant"
                style={{ width: 120, borderRadius: 10 }}
              />
            )}
            <p><b>Tên:</b> {selectedVariant.variantName}</p>
            <p><b>Tốc độ tối đa:</b> {selectedVariant.topSpeed ?? "—"} km/h</p>
            <p><b>Pin:</b> {selectedVariant.batteryCapacity ?? "—"} kWh</p>
            <p><b>Giá cơ bản:</b> {formatPrice(selectedVariant.priceBase)}</p>
            <p><b>Trạng thái:</b> {selectedVariant.isActive ? "Hoạt động" : "Ngừng"}</p>
            <button onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
