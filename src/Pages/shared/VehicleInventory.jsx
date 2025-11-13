import { useEffect, useState } from "react";
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { inventoryAPI, publicVehicleAPI, warehouseAPI } from "../../services/API";
import api from "../../services/API";
import "../Admin/Customer.css";

export default function VehicleInventory() {
  const [vehicles, setVehicles] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vin: "",
    chassisNumber: "",
    licensePlate: "",
    variantId: "",
    colorId: "",
    warehouseId: "",
    manufacturingDate: "",
    arrivalDate: "",
    price: "",
    status: "available", // Theo tài liệu: lowercase
  });

  // 🔹 Helper: Lấy tên từ ID
  const getVariantName = (variantId) => {
    if (!variantId) return "—";
    const variant = variants.find(v => 
      v.variantId === variantId || 
      v.id === variantId ||
      String(v.variantId) === String(variantId) ||
      String(v.id) === String(variantId)
    );
    return variant?.variantName || variant?.name || "—";
  };

  const getColorName = (colorId) => {
    if (!colorId) return "—";
    const color = colors.find(c => 
      c.colorId === colorId || 
      c.id === colorId ||
      String(c.colorId) === String(colorId) ||
      String(c.id) === String(colorId)
    );
    return color?.colorName || color?.color || "—";
  };

  const getWarehouseName = (warehouseId) => {
    if (!warehouseId) return "—";
    const warehouse = warehouses.find(w => 
      w.warehouseId === warehouseId || 
      w.id === warehouseId ||
      String(w.warehouseId) === String(warehouseId) ||
      String(w.id) === String(warehouseId)
    );
    return warehouse?.warehouseName || warehouse?.name || "—";
  };

  // 🔹 Load data khi mở trang
  const fetchAll = async () => {
    try {
      // Fetch variants, colors trước
      const [variantRes, colorRes] = await Promise.all([
        publicVehicleAPI.getVariants(),
        publicVehicleAPI.getColors(),
      ]);

      setVariants(variantRes.data || []);
      setColors(colorRes.data || []);

      // 🔹 Thử nhiều cách để lấy inventory/vehicles
      let vehiclesData = [];
      const allVehiclesMap = new Map(); // Dùng Map để tránh duplicate
      
      // Helper function để extract array từ response
      const extractArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.content)) return data.content;
        if (data && typeof data === 'object') {
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) return possibleArrays[0];
        }
        return [];
      };

      // Cách 1: Thử inventoryAPI.getInventory() (endpoint: /inventory-management)
      try {
        const res1 = await inventoryAPI.getInventory();
        console.log("🔍 inventoryAPI.getInventory() response:", res1);
        const extracted = extractArray(res1.data);
        if (extracted.length > 0) {
          extracted.forEach(v => {
            const id = v.id || v.inventoryId || v.vehicleId;
            if (id) allVehiclesMap.set(id, v);
          });
          console.log("✅ Lấy vehicles từ inventoryAPI.getInventory():", extracted.length);
        }
      } catch (err1) {
        console.warn("⚠️ inventoryAPI.getInventory() failed:", err1.response?.status, err1.response?.data);
      }

      // Cách 2: Thử endpoint /api/inventory
      try {
        const res2 = await api.get('/inventory').catch(() => null);
        if (res2) {
          console.log("🔍 /api/inventory response:", res2);
          const extracted = extractArray(res2.data);
          if (extracted.length > 0) {
            extracted.forEach(v => {
              const id = v.id || v.inventoryId || v.vehicleId;
              if (id) allVehiclesMap.set(id, v);
            });
            console.log("✅ Lấy vehicles từ /api/inventory:", extracted.length);
          }
        }
      } catch (err2) {
        console.warn("⚠️ /api/inventory failed:", err2.response?.status);
      }

      // Cách 3: Thử endpoint /api/vehicle-inventory
      try {
        const res3 = await api.get('/vehicle-inventory').catch(() => null);
        if (res3) {
          console.log("🔍 /api/vehicle-inventory response:", res3);
          const extracted = extractArray(res3.data);
          if (extracted.length > 0) {
            extracted.forEach(v => {
              const id = v.id || v.inventoryId || v.vehicleId;
              if (id) allVehiclesMap.set(id, v);
            });
            console.log("✅ Lấy vehicles từ /api/vehicle-inventory:", extracted.length);
          }
        }
      } catch (err3) {
        console.warn("⚠️ /api/vehicle-inventory failed:", err3.response?.status);
      }

      // Cách 4: Nếu vẫn chưa có dữ liệu, thử lấy theo từng status và combine
      if (allVehiclesMap.size === 0) {
        const statuses = ['reserved', 'available', 'sold', 'in_transit', 'maintenance', 'damaged'];
        console.log("🔍 Thử lấy inventory theo từng status...");
        
        for (const status of statuses) {
          try {
            const res = await inventoryAPI.getInventoryByStatus(status).catch(() => null);
            if (res) {
              const extracted = extractArray(res.data);
              if (extracted.length > 0) {
                extracted.forEach(v => {
                  const id = v.id || v.inventoryId || v.vehicleId;
                  if (id) allVehiclesMap.set(id, v);
                });
                console.log(`✅ Lấy ${extracted.length} vehicles từ status "${status}"`);
              }
            }
          } catch (err) {
            // Ignore errors for individual status
          }
        }
      }

      // Cách 5: Thử getAvailableInventory
      if (allVehiclesMap.size === 0) {
        try {
          const res = await inventoryAPI.getAvailableInventory().catch(() => null);
          if (res) {
            const extracted = extractArray(res.data);
            if (extracted.length > 0) {
              extracted.forEach(v => {
                const id = v.id || v.inventoryId || v.vehicleId;
                if (id) allVehiclesMap.set(id, v);
              });
              console.log("✅ Lấy vehicles từ getAvailableInventory():", extracted.length);
            }
          }
        } catch (err) {
          console.warn("⚠️ getAvailableInventory() failed:", err.response?.status);
        }
      }

      vehiclesData = Array.from(allVehiclesMap.values());

      setVehicles(vehiclesData);
      console.log("📦 Final vehicles count:", vehiclesData.length);
      if (vehiclesData.length > 0) {
        console.log("📦 Sample vehicle data:", vehiclesData[0]);
      }

      // 🔹 Thử nhiều cách để lấy warehouses
      let warehousesData = [];
      
      // Cách 1: Thử warehouseAPI
      try {
        const res1 = await warehouseAPI.getWarehouses();
        if (res1?.data && Array.isArray(res1.data) && res1.data.length > 0) {
          warehousesData = res1.data;
          console.log("✅ Lấy warehouses từ warehouseAPI:", warehousesData);
        } else if (res1?.data && Array.isArray(res1.data)) {
          warehousesData = res1.data;
        }
      } catch (err1) {
        console.warn("⚠️ warehouseAPI.getWarehouses() failed:", err1.response?.status, err1.response?.data);
      }

      // Cách 2: Nếu cách 1 không có dữ liệu, thử publicVehicleAPI
      if (warehousesData.length === 0) {
        try {
          const res2 = await publicVehicleAPI.getWarehouses();
          if (res2?.data && Array.isArray(res2.data) && res2.data.length > 0) {
            warehousesData = res2.data;
            console.log("✅ Lấy warehouses từ publicVehicleAPI:", warehousesData);
          } else if (res2?.data && Array.isArray(res2.data)) {
            warehousesData = res2.data;
          }
        } catch (err2) {
          console.warn("⚠️ publicVehicleAPI.getWarehouses() failed:", err2.response?.status, err2.response?.data);
        }
      }

      // Cách 3: Nếu vẫn không có, thử extract từ inventory data
      if (warehousesData.length === 0 && vehicleRes?.data && Array.isArray(vehicleRes.data)) {
        const uniqueWarehouses = new Map();
        vehicleRes.data.forEach(vehicle => {
          // Trường hợp 1: vehicle có nested warehouse object
          if (vehicle.warehouseId && vehicle.warehouse) {
            const warehouse = vehicle.warehouse;
            const id = warehouse.warehouseId || warehouse.id;
            if (id && !uniqueWarehouses.has(id)) {
              uniqueWarehouses.set(id, {
                warehouseId: id,
                warehouseName: warehouse.warehouseName || warehouse.name || `Kho ${id}`,
                ...warehouse
              });
            }
          }
          // Trường hợp 2: vehicle chỉ có warehouseId (không có nested object)
          else if (vehicle.warehouseId && !uniqueWarehouses.has(vehicle.warehouseId)) {
            uniqueWarehouses.set(vehicle.warehouseId, {
              warehouseId: vehicle.warehouseId,
              warehouseName: `Kho ${vehicle.warehouseId}`,
              id: vehicle.warehouseId
            });
          }
        });
        if (uniqueWarehouses.size > 0) {
          warehousesData = Array.from(uniqueWarehouses.values());
          console.log("✅ Lấy warehouses từ inventory data:", warehousesData);
        }
      }

      setWarehouses(warehousesData);
      console.log("📦 Variants:", variantRes.data?.length || 0);
      console.log("🎨 Colors:", colorRes.data?.length || 0);
      console.log("🏭 Warehouses:", warehousesData.length);
    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu:", error);
      console.error("❌ Error response:", error.response?.data);
      // Đảm bảo vẫn set empty arrays để UI không crash
      setVehicles([]);
      setVariants([]);
      setColors([]);
      setWarehouses([]);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // 🔹 Tìm kiếm theo biển số
  useEffect(() => {
    const delay = setTimeout(async () => {
      const q = searchTerm.trim();
      if (!q) {
        fetchAll();
        return;
      }
      try {
        const allVehicles = await inventoryAPI.getInventory();
        const filtered = (allVehicles.data || []).filter(v => 
          v.licensePlate?.toLowerCase().includes(q.toLowerCase()) ||
          v.vin?.toLowerCase().includes(q.toLowerCase()) ||
          v.chassisNumber?.toLowerCase().includes(q.toLowerCase())
        );
        setVehicles(filtered);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // 🔹 Mở popup thêm mới
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedVehicle(null);
    setFormData({
      vin: "",
      chassisNumber: "",
      licensePlate: "",
      variantId: "",
      colorId: "",
      warehouseId: "",
      manufacturingDate: "",
      arrivalDate: "",
      price: "",
      status: "available", // Theo tài liệu: lowercase
    });
    setError("");
    setShowPopup(true);
  };

  // 🔹 Mở popup sửa
  const handleEdit = (v) => {
    setIsEdit(true);
    setSelectedVehicle(v);
    setFormData({
      vin: v.vin || "",
      chassisNumber: v.chassisNumber || "",
      licensePlate: v.licensePlate || "",
      variantId: v.variantId || "",
      colorId: v.colorId || "",
      warehouseId: v.warehouseId || "",
      manufacturingDate: v.manufacturingDate || "",
      arrivalDate: v.arrivalDate || "",
      price: v.price || "",
      status: v.status || "AVAILABLE",
    });
    setError("");
    setShowPopup(true);
  };

  // 🔹 Xem chi tiết
  const handleView = (v) => {
    setSelectedVehicle(v);
    setShowDetail(true);
  };

  // 🔹 Thêm hoặc sửa xe
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.vin || !formData.variantId) {
      setError("Vui lòng nhập đầy đủ: VIN và Biến thể.");
      return;
    }

    // 🔍 Debug: Log formData trước khi submit
    console.log("📤 FormData trước khi submit:", formData);
    console.log("📤 variantId:", formData.variantId, "type:", typeof formData.variantId);
    console.log("📤 colorId:", formData.colorId, "type:", typeof formData.colorId);
    console.log("📤 warehouseId:", formData.warehouseId, "type:", typeof formData.warehouseId);

    const payload = {
      vin: formData.vin,
      chassisNumber: formData.chassisNumber || "",
      licensePlate: formData.licensePlate || "",
      variantId: formData.variantId ? Number(formData.variantId) : null,
      colorId: formData.colorId && formData.colorId !== "" ? Number(formData.colorId) : null,
      warehouseId: formData.warehouseId && formData.warehouseId !== "" ? Number(formData.warehouseId) : null,
      manufacturingDate: formData.manufacturingDate || null,
      arrivalDate: formData.arrivalDate || null,
      price: formData.price ? Number(formData.price) : null,
      status: formData.status || "AVAILABLE",
    };

    console.log("📤 Payload gửi lên server:", payload);

    try {
      if (isEdit && selectedVehicle) {
        await inventoryAPI.updateInventory(selectedVehicle.id, payload);
        alert("✅ Cập nhật xe thành công!");
      } else {
        await inventoryAPI.createInventory(payload);
        alert("✅ Thêm xe thành công!");
      }
      setShowPopup(false);
      fetchAll();
    } catch (err) {
      console.error("❌ Lỗi lưu xe:", err);
      const msg = err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
      setError("Lưu thất bại: " + msg);
      alert("Lưu thất bại: " + msg);
    }
  };

  // 🔹 Xóa xe
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa xe này không?")) return;
    try {
      await inventoryAPI.deleteInventory(id);
      alert("✅ Xóa thành công!");
      fetchAll();
    } catch (error) {
      console.error("❌ Lỗi xóa xe:", error);
      const msg = error.response?.data?.message || error.message || "Không thể xóa xe";
      alert("Không thể xóa xe: " + msg);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">📦 Quản lý kho xe</div>

      <div className="title2-customer">
        <h2>Danh sách xe trong kho ({vehicles.length} xe)</h2>
        <h3 onClick={handleOpenAdd}><FaPlus /> Thêm xe</h3>
      </div>

      {/* Debug Info */}
      <div style={{
        background: "#f3f4f6",
        padding: "10px",
        borderRadius: "6px",
        marginBottom: "15px",
        fontSize: "12px"
      }}>
        <b>Debug:</b> Variants: {variants.length} | Colors: {colors.length} | Warehouses: {warehouses.length}
        {warehouses.length > 0 && (
          <div style={{ marginTop: "5px" }}>
            Danh sách kho: {warehouses.map(w => w.warehouseName || w.name || w.warehouseId || w.id).join(", ")}
          </div>
        )}
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm theo biển số, VIN, chassis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>VIN</th>
              <th>Biển số</th>
              <th>Biến thể</th>
              <th>Màu</th>
              <th>Kho</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((v) => {
                // Xử lý các field name khác nhau từ API
                const vehicleId = v.id || v.inventoryId || v.vehicleId;
                const vin = v.vin || v.vinNumber || "";
                const licensePlate = v.licensePlate || v.plateNumber || "";
                const variantId = v.variantId || v.variant?.variantId || v.variant?.id;
                const colorId = v.colorId || v.color?.colorId || v.color?.id;
                const warehouseId = v.warehouseId || v.warehouse?.warehouseId || v.warehouse?.id;
                const price = v.price || v.sellingPrice || v.costPrice || 0;
                const status = v.status || v.vehicleStatus || "AVAILABLE";
                
                return (
                  <tr key={vehicleId || Math.random()}>
                    <td>{vin || "—"}</td>
                    <td>{licensePlate || "—"}</td>
                    <td>{getVariantName(variantId)}</td>
                    <td>{getColorName(colorId)}</td>
                    <td>{getWarehouseName(warehouseId) || v.warehouseName || v.warehouse?.warehouseName || "—"}</td>
                    <td>{price ? `${Number(price).toLocaleString('vi-VN')} đ` : "—"}</td>
                    <td>
                      {(() => {
                        // Theo tài liệu: available, reserved, sold, maintenance, damaged, in_transit, pending_delivery (lowercase)
                        const statusLower = (status || '').toLowerCase();
                        const bgColor = statusLower === 'available' ? "#dcfce7" : statusLower === 'reserved' ? "#fef3c7" : statusLower === 'sold' ? "#dbeafe" : "#fee2e2";
                        const textColor = statusLower === 'available' ? "#16a34a" : statusLower === 'reserved' ? "#d97706" : statusLower === 'sold' ? "#2563eb" : "#dc2626";
                        return (
                          <span style={{
                            background: bgColor,
                            color: textColor,
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500"
                          }}>
                            {status || "—"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => handleView(v)} className="icon-btn view"><FaEye /></button>
                      <button onClick={() => handleEdit(v)} className="icon-btn edit"><FaPen /></button>
                      <button onClick={() => handleDelete(vehicleId)} className="icon-btn delete"><FaTrash /></button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                  Không có dữ liệu xe trong kho
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Thêm / Sửa */}
      {showPopup && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.className === 'popup-overlay') setShowPopup(false); }}>
          <div className="popup-box">
            <h2>{isEdit ? "✏️ Sửa xe" : "➕ Thêm xe"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  name="vin"
                  placeholder="VIN *"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  required
                />

                <input
                  name="chassisNumber"
                  placeholder="Số khung"
                  value={formData.chassisNumber}
                  onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                />

                <input
                  name="licensePlate"
                  placeholder="Biển số"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                />

                <select
                  name="variantId"
                  value={formData.variantId || ""}
                  onChange={(e) => {
                    console.log("🔹 Selected variantId:", e.target.value);
                    setFormData({ ...formData, variantId: e.target.value });
                  }}
                  required
                >
                  <option value="">-- Chọn biến thể --</option>
                  {variants.map((v) => {
                    const variantId = v.variantId || v.id || v.variant?.variantId || v.variant?.id;
                    const variantName = v.variantName || v.name || v.variant?.variantName || v.variant?.name || `Variant ${variantId}`;
                    return (
                      <option key={variantId} value={String(variantId || "")}>
                        {variantName}
                      </option>
                    );
                  })}
                </select>

                <select
                  name="colorId"
                  value={formData.colorId || ""}
                  onChange={(e) => {
                    console.log("🎨 Selected colorId:", e.target.value);
                    setFormData({ ...formData, colorId: e.target.value });
                  }}
                >
                  <option value="">-- Chọn màu --</option>
                  {colors.map((c) => {
                    const colorId = c.colorId || c.id || c.color?.colorId || c.color?.id;
                    const colorName = c.colorName || c.color || c.name || c.color?.colorName || c.color?.color || `Color ${colorId}`;
                    return (
                      <option key={colorId} value={String(colorId || "")}>
                        {colorName}
                      </option>
                    );
                  })}
                </select>

                <select
                  name="warehouseId"
                  value={formData.warehouseId || ""}
                  onChange={(e) => {
                    console.log("🏭 Selected warehouseId:", e.target.value);
                    setFormData({ ...formData, warehouseId: e.target.value });
                  }}
                >
                  <option value="">-- Chọn kho --</option>
                  {warehouses.map((w) => {
                    const warehouseId = w.warehouseId || w.id || w.warehouse?.warehouseId || w.warehouse?.id;
                    const warehouseName = w.warehouseName || w.name || w.warehouse?.warehouseName || w.warehouse?.name || `Warehouse ${warehouseId}`;
                    return (
                      <option key={warehouseId} value={String(warehouseId || "")}>
                        {warehouseName}
                      </option>
                    );
                  })}
                </select>

                <input
                  name="price"
                  type="number"
                  placeholder="Giá (VNĐ)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />

                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="IN_TRANSIT">In Transit</option>
                </select>

                <input
                  name="manufacturingDate"
                  type="date"
                  placeholder="Ngày sản xuất"
                  value={formData.manufacturingDate}
                  onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                />

                <input
                  name="arrivalDate"
                  type="date"
                  placeholder="Ngày nhập kho"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
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
      {showDetail && selectedVehicle && (
        <div className="popup-overlay" onClick={(e) => { if (e.target.className === 'popup-overlay') setShowDetail(false); }}>
          <div className="popup-box">
            <h2>👁️ Chi tiết xe</h2>
            <p><b>VIN:</b> {selectedVehicle.vin || "—"}</p>
            <p><b>Số khung:</b> {selectedVehicle.chassisNumber || "—"}</p>
            <p><b>Biển số:</b> {selectedVehicle.licensePlate || "—"}</p>
            <p><b>Biến thể:</b> {getVariantName(selectedVehicle.variantId)}</p>
            <p><b>Màu:</b> {getColorName(selectedVehicle.colorId)}</p>
            <p><b>Kho:</b> {getWarehouseName(selectedVehicle.warehouseId)}</p>
            <p><b>Giá:</b> {selectedVehicle.price ? `${Number(selectedVehicle.price).toLocaleString()} đ` : "—"}</p>
            <p><b>Trạng thái:</b> {selectedVehicle.status || "—"}</p>
            <p><b>Ngày sản xuất:</b> {selectedVehicle.manufacturingDate || "—"}</p>
            <p><b>Ngày nhập kho:</b> {selectedVehicle.arrivalDate || "—"}</p>
            <button onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}