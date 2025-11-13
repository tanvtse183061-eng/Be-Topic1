import '../Admin/Order.css';
import { FaSearch, FaEye, FaCheck, FaTimes, FaPaperPlane, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { quotationAPI, customerAPI, publicVehicleAPI } from "../../services/API";

export default function Quotation() {
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const currentRole = localStorage.getItem("role") || "";
  const isEVMStaff = currentRole === "EVM_STAFF";
  const isAdmin = currentRole === "ADMIN";

  // Data for form
  const [customers, setCustomers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);

  // Form data - Báo giá khách hàng
  const [formData, setFormData] = useState({
    customerId: "",
    variantId: "",
    colorId: "",
    quantity: 1,
    unitPrice: "",
    discountPercentage: "",
    notes: "",
    expiryDate: ""
  });

  // Lấy danh sách báo giá khách hàng
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await quotationAPI.getQuotations();
      console.log("📦 Raw response từ getQuotations:", res);
      const quotationsData = res.data?.data || res.data || [];
      console.log("📦 Customer Quotations data:", quotationsData);
      setQuotations(Array.isArray(quotationsData) ? quotationsData : []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy báo giá:", err);
      alert("Không thể tải danh sách báo giá!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for form
  const fetchData = async () => {
    try {
      console.log("🔄 Đang fetch dữ liệu cho form...");
      
      // Fetch customers
      try {
        const customersRes = await customerAPI.getCustomers();
        const customersData = customersRes.data || [];
        console.log("✅ Customers fetched:", customersData.length);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch customers:", err);
        setCustomers([]);
      }
      
      // Fetch variants và colors
      try {
        const [variantsRes, colorsRes] = await Promise.all([
          publicVehicleAPI.getVariants(),
          publicVehicleAPI.getColors()
        ]);
        const variantsData = variantsRes.data || [];
        const colorsData = colorsRes.data || [];
        console.log("✅ Variants fetched:", variantsData.length);
        console.log("✅ Colors fetched:", colorsData.length);
        setVariants(Array.isArray(variantsData) ? variantsData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch variants/colors:", err);
        setVariants([]);
        setColors([]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchData();
  }, []);

  // Fetch lại data khi mở popup
  useEffect(() => {
    if (showPopup) {
      fetchData();
    }
  }, [showPopup]);

  // Tạo báo giá mới
  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.customerId || !formData.variantId || !formData.colorId) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const payload = {
        customerId: formData.customerId,
        variantId: formData.variantId,
        colorId: formData.colorId,
        quantity: parseInt(formData.quantity) || 1,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
        notes: formData.notes || null,
        expiryDate: formData.expiryDate || null
      };

      console.log("📤 Payload tạo báo giá:", payload);

      if (isEdit && selectedQuotation) {
        // Cập nhật báo giá
        const res = await quotationAPI.updateQuotation(selectedQuotation.quotationId || selectedQuotation.id, payload);
        console.log("✅ Response từ updateQuotation:", res);
        alert("Cập nhật báo giá thành công!");
      } else {
        // Tạo mới
        const res = await quotationAPI.createQuotation(payload);
        console.log("✅ Response từ createQuotation:", res);
        alert("Tạo báo giá thành công!");
      }
      
      setShowPopup(false);
      setIsEdit(false);
      setSelectedQuotation(null);
      
      // Reset form
      setFormData({
        customerId: "",
        variantId: "",
        colorId: "",
        quantity: 1,
        unitPrice: "",
        discountPercentage: "",
        notes: "",
        expiryDate: ""
      });
      
      // Fetch lại danh sách
      setTimeout(() => {
        fetchQuotations();
      }, 500);
    } catch (err) {
      console.error("Lỗi khi tạo/cập nhật báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo/cập nhật báo giá!";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // Gửi báo giá cho khách hàng
  const handleSendQuotation = async (quotationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi báo giá này cho khách hàng không?")) return;
    try {
      await quotationAPI.sendQuotation(quotationId);
      alert("Gửi báo giá thành công!");
      fetchQuotations();
    } catch (err) {
      console.error("Lỗi khi gửi báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể gửi báo giá!";
      alert(`Gửi báo giá thất bại!\n${errorMsg}`);
    }
  };

  // Xóa báo giá
  const handleDeleteQuotation = async (quotationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa báo giá này không?")) return;
    try {
      await quotationAPI.deleteQuotation(quotationId);
      alert("Xóa báo giá thành công!");
      fetchQuotations();
    } catch (err) {
      console.error("Lỗi khi xóa báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể xóa báo giá!";
      alert(`Xóa báo giá thất bại!\n${errorMsg}`);
    }
  };

  // Sửa báo giá
  const handleEditQuotation = async (quotationId) => {
    try {
      const res = await quotationAPI.getQuotation(quotationId);
      const quotation = res.data;
      setSelectedQuotation(quotation);
      setIsEdit(true);
      
      // Điền form với dữ liệu hiện tại
      setFormData({
        customerId: quotation.customer?.customerId || quotation.customerId || "",
        variantId: quotation.variant?.variantId || quotation.variantId || "",
        colorId: quotation.color?.colorId || quotation.colorId || "",
        quantity: quotation.quantity || 1,
        unitPrice: quotation.unitPrice || "",
        discountPercentage: quotation.discountPercentage || "",
        notes: quotation.notes || "",
        expiryDate: quotation.expiryDate ? new Date(quotation.expiryDate).toISOString().split('T')[0] : ""
      });
      
      setShowPopup(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết báo giá:", err);
      alert("Không thể tải thông tin báo giá!");
    }
  };

  // Helper functions
  const getCustomerName = (quotation) => {
    if (quotation.customer) {
      const firstName = quotation.customer.firstName || "";
      const lastName = quotation.customer.lastName || "";
      return `${firstName} ${lastName}`.trim() || "—";
    }
    return "—";
  };

  const getVariantName = (quotation) => {
    if (quotation.variant) {
      const variantName = quotation.variant.variantName || "";
      const modelName = quotation.variant.model?.modelName || "";
      const brandName = quotation.variant.model?.brand?.brandName || "";
      if (brandName && modelName) {
        return `${brandName} ${modelName} - ${variantName}`;
      }
      return variantName || "—";
    }
    return "—";
  };

  const getColorName = (quotation) => {
    if (quotation.color) {
      return quotation.color.colorName || quotation.color.name || "—";
    }
    return "—";
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: "badge-warning",
      SENT: "badge-info",
      ACCEPTED: "badge-success",
      REJECTED: "badge-danger",
      EXPIRED: "badge-secondary"
    };
    return statusMap[status] || "badge-secondary";
  };

  // Tìm kiếm
  const filteredQuotations = (quotations || []).filter((q) => {
    if (!q) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (q.quotationNumber && String(q.quotationNumber).toLowerCase().includes(keyword)) ||
      (q.status && String(q.status).toLowerCase().includes(keyword)) ||
      (q.customer?.firstName && String(q.customer.firstName).toLowerCase().includes(keyword)) ||
      (q.customer?.lastName && String(q.customer.lastName).toLowerCase().includes(keyword)) ||
      (q.customer?.email && String(q.customer.email).toLowerCase().includes(keyword)) ||
      (q.variant?.variantName && String(q.variant.variantName).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (quotationId) => {
    try {
      const res = await quotationAPI.getQuotation(quotationId);
      setSelectedQuotation(res.data);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết báo giá:", err);
      alert("Không thể tải chi tiết báo giá!");
    }
  };

  // Mở popup tạo mới
  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedQuotation(null);
    setFormData({
      customerId: "",
      variantId: "",
      colorId: "",
      quantity: 1,
      unitPrice: "",
      discountPercentage: "",
      notes: "",
      expiryDate: ""
    });
    setError("");
    setShowPopup(true);
  };

  return (
    <div className="customer">
      <div className="title-customer">Báo giá khách hàng</div>

      <div className="title2-customer">
        <h2>Danh sách báo giá khách hàng</h2>
        {(isEVMStaff || isAdmin) && (
          <h3 onClick={handleOpenCreate}>+ Tạo báo giá</h3>
        )}
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm báo giá..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ BÁO GIÁ</th>
              <th>KHÁCH HÀNG</th>
              <th>PHIÊN BẢN</th>
              <th>MÀU</th>
              <th>SỐ LƯỢNG</th>
              <th>ĐƠN GIÁ</th>
              <th>GIẢM GIÁ</th>
              <th>THÀNH TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY TẠO</th>
              <th>NGÀY HẾT HẠN</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" style={{ textAlign: "center", color: "#666" }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredQuotations.length > 0 ? (
              filteredQuotations.map((q, index) => {
                const quotationId = q.quotationId || q.id || `quotation-${index}`;
                const finalPrice = q.finalPrice || (q.unitPrice && q.quantity ? (q.unitPrice * q.quantity * (1 - (q.discountPercentage || 0) / 100)) : 0);
                return (
                  <tr key={quotationId}>
                    <td>{q.quotationNumber || "—"}</td>
                    <td>{getCustomerName(q)}</td>
                    <td>{getVariantName(q)}</td>
                    <td>{getColorName(q)}</td>
                    <td>{q.quantity || 0}</td>
                    <td>{formatPrice(q.unitPrice)}</td>
                    <td>{q.discountPercentage ? `${q.discountPercentage}%` : "0%"}</td>
                    <td>{formatPrice(finalPrice)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(q.status)}`}>
                        {q.status || "—"}
                      </span>
                    </td>
                    <td>{formatDate(q.createdAt || q.createdDate)}</td>
                    <td>{formatDate(q.expiryDate)}</td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(quotationId)}>
                        <FaEye />
                      </button>
                      {(isEVMStaff || isAdmin) && (
                        <>
                          <button className="icon-btn edit" onClick={() => handleEditQuotation(quotationId)} title="Sửa">
                            <FaEdit />
                          </button>
                          {q.status === "PENDING" && (
                            <button className="icon-btn send" onClick={() => handleSendQuotation(quotationId)} title="Gửi báo giá">
                              <FaPaperPlane />
                            </button>
                          )}
                          <button className="icon-btn delete" onClick={() => handleDeleteQuotation(quotationId)} title="Xóa">
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu báo giá
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup tạo/sửa báo giá */}
      {showPopup && (isEVMStaff || isAdmin) && (
        <div className="popup-overlay" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedQuotation(null); }}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>{isEdit ? "Sửa báo giá khách hàng" : "Tạo báo giá khách hàng"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreateQuotation}>
              <div style={{ marginBottom: "15px" }}>
                <label>Khách hàng *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.customerId || c.id} value={c.customerId || c.id}>
                      {c.firstName} {c.lastName} - {c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Phiên bản xe *</label>
                <select
                  value={formData.variantId}
                  onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn phiên bản --</option>
                  {variants.map((v) => (
                    <option key={v.variantId || v.id} value={v.variantId || v.id}>
                      {v.model?.brand?.brandName || ""} {v.model?.modelName || ""} - {v.variantName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Màu sắc *</label>
                <select
                  value={formData.colorId}
                  onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn màu --</option>
                  {colors.map((c) => (
                    <option key={c.colorId || c.id} value={c.colorId || c.id}>
                      {c.colorName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Số lượng *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Đơn giá (₫)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="Ví dụ: 500000000"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Phần trăm giảm giá (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  placeholder="Ví dụ: 5"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ngày hết hạn</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Ghi chú"
                />
              </div>

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo báo giá"}</button>
                <button type="button" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedQuotation(null); }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedQuotation && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết báo giá khách hàng</h2>
            <div className="detail-content">
              <p><b>Số báo giá:</b> {selectedQuotation.quotationNumber || "—"}</p>
              <p><b>Khách hàng:</b> {getCustomerName(selectedQuotation)}</p>
              {selectedQuotation.customer?.email && (
                <p><b>Email:</b> {selectedQuotation.customer.email}</p>
              )}
              {selectedQuotation.customer?.phone && (
                <p><b>Điện thoại:</b> {selectedQuotation.customer.phone}</p>
              )}
              <p><b>Phiên bản:</b> {getVariantName(selectedQuotation)}</p>
              <p><b>Màu sắc:</b> {getColorName(selectedQuotation)}</p>
              <p><b>Số lượng:</b> {selectedQuotation.quantity || 0}</p>
              <p><b>Đơn giá:</b> {formatPrice(selectedQuotation.unitPrice)}</p>
              <p><b>Giảm giá:</b> {selectedQuotation.discountPercentage ? `${selectedQuotation.discountPercentage}%` : "0%"}</p>
              <p><b>Thành tiền:</b> {formatPrice(selectedQuotation.finalPrice || (selectedQuotation.unitPrice && selectedQuotation.quantity ? (selectedQuotation.unitPrice * selectedQuotation.quantity * (1 - (selectedQuotation.discountPercentage || 0) / 100)) : 0))}</p>
              <p><b>Trạng thái:</b> {selectedQuotation.status || "—"}</p>
              <p><b>Ngày tạo:</b> {formatDate(selectedQuotation.createdAt || selectedQuotation.createdDate)}</p>
              <p><b>Ngày hết hạn:</b> {formatDate(selectedQuotation.expiryDate)}</p>
              {selectedQuotation.notes && (
                <p><b>Ghi chú:</b> {selectedQuotation.notes}</p>
              )}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

