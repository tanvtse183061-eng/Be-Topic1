import '../Admin/Order.css';
import { FaSearch, FaEye, FaPlus, FaEdit, FaTrash, FaSpinner, FaExclamationCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { promotionAPI, publicVehicleAPI } from "../../services/API";

export default function Promotion() {
  const [promotions, setPromotions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    variantId: "",
    promotionName: "",
    description: "",
    discountPercentage: "",
    discountAmount: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
    maxUsage: "",
    minPurchaseAmount: ""
  });

  // Lấy danh sách khuyến mãi
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await promotionAPI.getPromotions();
      setPromotions(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy khuyến mãi:", err);
      setError("Không thể tải danh sách khuyến mãi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách variants
  const fetchVariants = async () => {
    try {
      const res = await publicVehicleAPI.getVariants();
      setVariants(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy variants:", err);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchVariants();
  }, []);

  useEffect(() => {
    if (showPopup) {
      fetchVariants();
    }
  }, [showPopup]);

  // Tạo/cập nhật khuyến mãi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.variantId || !formData.promotionName || !formData.startDate || !formData.endDate) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const payload = {
        variantId: formData.variantId,
        promotionName: formData.promotionName,
        description: formData.description || null,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null
      };

      if (isEdit && selectedPromotion) {
        await promotionAPI.updatePromotion(selectedPromotion.promotionId, payload);
        alert("Cập nhật khuyến mãi thành công!");
      } else {
        await promotionAPI.createPromotion(payload);
        alert("Tạo khuyến mãi thành công!");
      }

      setShowPopup(false);
      setIsEdit(false);
      setSelectedPromotion(null);
      setFormData({
        variantId: "",
        promotionName: "",
        description: "",
        discountPercentage: "",
        discountAmount: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
        maxUsage: "",
        minPurchaseAmount: ""
      });
      await fetchPromotions();
    } catch (err) {
      console.error("Lỗi khi tạo/cập nhật khuyến mãi:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Không thể tạo/cập nhật khuyến mãi!");
    }
  };

  // Xóa khuyến mãi
  const handleDelete = async (promotionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này không?")) return;
    try {
      setDeleting(promotionId);
      await promotionAPI.deletePromotion(promotionId);
      alert("Xóa khuyến mãi thành công!");
      await fetchPromotions();
    } catch (err) {
      console.error("Lỗi khi xóa khuyến mãi:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Kích hoạt/Vô hiệu hóa
  const handleToggleStatus = async (promotionId, currentStatus) => {
    try {
      setDeleting(promotionId);
      if (currentStatus === 'ACTIVE') {
        await promotionAPI.deactivatePromotion(promotionId);
        alert("Vô hiệu hóa khuyến mãi thành công!");
      } else {
        await promotionAPI.activatePromotion(promotionId);
        alert("Kích hoạt khuyến mãi thành công!");
      }
      await fetchPromotions();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Sửa khuyến mãi
  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setIsEdit(true);
    setFormData({
      variantId: promotion.variant?.variantId || promotion.variantId || "",
      promotionName: promotion.promotionName || "",
      description: promotion.description || "",
      discountPercentage: promotion.discountPercentage || "",
      discountAmount: promotion.discountAmount || "",
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : "",
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : "",
      status: promotion.status || "ACTIVE",
      maxUsage: promotion.maxUsage || "",
      minPurchaseAmount: promotion.minPurchaseAmount || ""
    });
    setShowPopup(true);
  };

  // Xem chi tiết
  const handleView = (promotion) => {
    setSelectedPromotion(promotion);
    setShowDetail(true);
  };

  // Mở popup tạo mới
  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedPromotion(null);
    setFormData({
      variantId: "",
      promotionName: "",
      description: "",
      discountPercentage: "",
      discountAmount: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE",
      maxUsage: "",
      minPurchaseAmount: ""
    });
    setError("");
    setShowPopup(true);
  };

  // Tìm kiếm
  const filteredPromotions = promotions.filter((p) => {
    if (!p) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (p.promotionName && String(p.promotionName).toLowerCase().includes(keyword)) ||
      (p.variant?.variantName && String(p.variant.variantName).toLowerCase().includes(keyword)) ||
      (p.status && String(p.status).toLowerCase().includes(keyword))
    );
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'status-confirmed';
    if (statusLower === 'inactive') return 'status-pending';
    if (statusLower === 'expired') return 'status-cancelled';
    return 'status-default';
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">🎁</span>
        Quản lý khuyến mãi
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách khuyến mãi</h2>
          <p className="subtitle">{promotions.length} khuyến mãi tổng cộng</p>
        </div>
        <button className="btn-add" onClick={handleOpenCreate}>
          <FaPlus className="btn-icon" />
          Tạo khuyến mãi
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, phiên bản, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchPromotions}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách khuyến mãi...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredPromotions.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>TÊN KHUYẾN MÃI</th>
                  <th>PHIÊN BẢN</th>
                  <th>GIẢM GIÁ</th>
                  <th>NGÀY BẮT ĐẦU</th>
                  <th>NGÀY KẾT THÚC</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((p) => (
                  <tr key={p.promotionId}>
                    <td>{p.promotionName || 'N/A'}</td>
                    <td>{p.variant?.variantName || p.variantId || 'N/A'}</td>
                    <td>
                      {p.discountPercentage ? `${p.discountPercentage}%` : ''}
                      {p.discountAmount ? `${p.discountAmount.toLocaleString('vi-VN')} ₫` : ''}
                    </td>
                    <td>
                      <span className="date-text">
                        {p.startDate ? new Date(p.startDate).toLocaleDateString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {p.endDate ? new Date(p.endDate).toLocaleDateString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(p.status)}`}>
                        <span>{p.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(p)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="icon-btn edit"
                        onClick={() => handleEdit(p)}
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="icon-btn edit"
                        onClick={() => handleToggleStatus(p.promotionId, p.status)}
                        disabled={deleting === p.promotionId}
                        title={p.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {deleting === p.promotionId ? <FaSpinner className="spinner-small" /> : 
                         p.status === 'ACTIVE' ? <FaTimesCircle /> : <FaCheckCircle />}
                      </button>
                      <button 
                        className="icon-btn delete" 
                        onClick={() => handleDelete(p.promotionId)}
                        disabled={deleting === p.promotionId}
                        title="Xóa"
                      >
                        {deleting === p.promotionId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>{searchTerm ? 'Không tìm thấy' : 'Chưa có khuyến mãi'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup tạo/sửa */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedPromotion(null); }}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>{isEdit ? "Sửa khuyến mãi" : "Tạo khuyến mãi"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
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
                      {v.variantName || `${v.model?.brand?.brandName || ""} ${v.model?.modelName || ""}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Tên khuyến mãi *</label>
                <input
                  type="text"
                  value={formData.promotionName}
                  onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
                  required
                  placeholder="Nhập tên khuyến mãi"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Mô tả khuyến mãi"
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
                  placeholder="Ví dụ: 10"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Số tiền giảm giá (₫)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  placeholder="Ví dụ: 1000000"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ngày bắt đầu *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ngày kết thúc *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">Kích hoạt</option>
                  <option value="INACTIVE">Vô hiệu hóa</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Số lần sử dụng tối đa</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUsage}
                  onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                  placeholder="Để trống = không giới hạn"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Số tiền mua tối thiểu (₫)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                  placeholder="Số tiền tối thiểu để áp dụng"
                />
              </div>

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo khuyến mãi"}</button>
                <button type="button" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedPromotion(null); }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedPromotion && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết khuyến mãi</h2>
            <div className="detail-content">
              <p><b>Tên khuyến mãi:</b> {selectedPromotion.promotionName || "—"}</p>
              <p><b>Phiên bản:</b> {selectedPromotion.variant?.variantName || "—"}</p>
              <p><b>Mô tả:</b> {selectedPromotion.description || "—"}</p>
              <p><b>Giảm giá:</b> {
                selectedPromotion.discountPercentage ? `${selectedPromotion.discountPercentage}%` : ''
              } {
                selectedPromotion.discountAmount ? `${selectedPromotion.discountAmount.toLocaleString('vi-VN')} ₫` : ''
              }</p>
              <p><b>Ngày bắt đầu:</b> {selectedPromotion.startDate ? new Date(selectedPromotion.startDate).toLocaleDateString("vi-VN") : "—"}</p>
              <p><b>Ngày kết thúc:</b> {selectedPromotion.endDate ? new Date(selectedPromotion.endDate).toLocaleDateString("vi-VN") : "—"}</p>
              <p><b>Trạng thái:</b> {selectedPromotion.status || "—"}</p>
              {selectedPromotion.maxUsage && <p><b>Số lần sử dụng tối đa:</b> {selectedPromotion.maxUsage}</p>}
              {selectedPromotion.minPurchaseAmount && <p><b>Số tiền mua tối thiểu:</b> {selectedPromotion.minPurchaseAmount.toLocaleString('vi-VN')} ₫</p>}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

