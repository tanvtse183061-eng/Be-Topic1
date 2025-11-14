import './Order.css';
import { FaSearch, FaEye, FaPlus, FaEdit, FaTrash, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { pricingPolicyAPI, dealerAPI } from "../../services/API";

export default function PricingPolicy() {
  const [policies, setPolicies] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    dealerId: "",
    policyType: "STANDARD",
    discountPercentage: "",
    markupPercentage: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE"
  });

  // Lấy danh sách chính sách giá
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await pricingPolicyAPI.getPolicies();
      setPolicies(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy chính sách giá:", err);
      setError("Không thể tải danh sách chính sách giá. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đại lý
  const fetchDealers = async () => {
    try {
      const res = await dealerAPI.getAll();
      setDealers(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy đại lý:", err);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchDealers();
  }, []);

  useEffect(() => {
    if (showPopup) {
      fetchDealers();
    }
  }, [showPopup]);

  // Tạo/cập nhật chính sách
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.startDate || !formData.endDate) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const payload = {
        dealerId: formData.dealerId || null,
        policyType: formData.policyType,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
        markupPercentage: formData.markupPercentage ? parseFloat(formData.markupPercentage) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status
      };

      if (isEdit && selectedPolicy) {
        await pricingPolicyAPI.updatePolicy(selectedPolicy.policyId, payload);
        alert("Cập nhật chính sách giá thành công!");
      } else {
        await pricingPolicyAPI.createPolicy(payload);
        alert("Tạo chính sách giá thành công!");
      }

      setShowPopup(false);
      setIsEdit(false);
      setSelectedPolicy(null);
      setFormData({
        dealerId: "",
        policyType: "STANDARD",
        discountPercentage: "",
        markupPercentage: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE"
      });
      await fetchPolicies();
    } catch (err) {
      console.error("Lỗi khi tạo/cập nhật chính sách:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Không thể tạo/cập nhật chính sách!");
    }
  };

  // Xóa chính sách
  const handleDelete = async (policyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chính sách này không?")) return;
    try {
      setDeleting(policyId);
      await pricingPolicyAPI.deletePolicy(policyId);
      alert("Xóa chính sách thành công!");
      await fetchPolicies();
    } catch (err) {
      console.error("Lỗi khi xóa chính sách:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Sửa chính sách
  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setIsEdit(true);
    setFormData({
      dealerId: policy.dealer?.dealerId || policy.dealerId || "",
      policyType: policy.policyType || "STANDARD",
      discountPercentage: policy.discountPercentage || "",
      markupPercentage: policy.markupPercentage || "",
      startDate: policy.startDate ? new Date(policy.startDate).toISOString().split('T')[0] : "",
      endDate: policy.endDate ? new Date(policy.endDate).toISOString().split('T')[0] : "",
      status: policy.status || "ACTIVE"
    });
    setShowPopup(true);
  };

  // Xem chi tiết
  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setShowDetail(true);
  };

  // Mở popup tạo mới
  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedPolicy(null);
    setFormData({
      dealerId: "",
      policyType: "STANDARD",
      discountPercentage: "",
      markupPercentage: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE"
    });
    setError("");
    setShowPopup(true);
  };

  // Tìm kiếm
  const filteredPolicies = policies.filter((p) => {
    if (!p) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (p.dealer?.dealerName && String(p.dealer.dealerName).toLowerCase().includes(keyword)) ||
      (p.policyType && String(p.policyType).toLowerCase().includes(keyword)) ||
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
        <span className="title-icon">💰</span>
        Quản lý chính sách giá
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách chính sách giá</h2>
          <p className="subtitle">{policies.length} chính sách tổng cộng</p>
        </div>
        <button className="btn-add" onClick={handleOpenCreate}>
          <FaPlus className="btn-icon" />
          Tạo chính sách
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo đại lý, loại, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchPolicies}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách chính sách giá...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredPolicies.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>ĐẠI LÝ</th>
                  <th>LOẠI</th>
                  <th>GIẢM GIÁ (%)</th>
                  <th>MARKUP (%)</th>
                  <th>NGÀY BẮT ĐẦU</th>
                  <th>NGÀY KẾT THÚC</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map((p) => (
                  <tr key={p.policyId}>
                    <td>{p.dealer?.dealerName || 'Chung'}</td>
                    <td>{p.policyType || 'STANDARD'}</td>
                    <td>{p.discountPercentage ? `${p.discountPercentage}%` : 'N/A'}</td>
                    <td>{p.markupPercentage ? `${p.markupPercentage}%` : 'N/A'}</td>
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
                        className="icon-btn delete" 
                        onClick={() => handleDelete(p.policyId)}
                        disabled={deleting === p.policyId}
                        title="Xóa"
                      >
                        {deleting === p.policyId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{searchTerm ? 'Không tìm thấy chính sách' : 'Chưa có chính sách nào'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup tạo/sửa */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedPolicy(null); }}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>{isEdit ? "Sửa chính sách giá" : "Tạo chính sách giá"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label>Đại lý (để trống = chính sách chung)</label>
                <select
                  value={formData.dealerId}
                  onChange={(e) => setFormData({ ...formData, dealerId: e.target.value })}
                >
                  <option value="">-- Chính sách chung --</option>
                  {dealers.map((d) => (
                    <option key={d.dealerId || d.id} value={d.dealerId || d.id}>
                      {d.dealerName || d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Loại chính sách</label>
                <select
                  value={formData.policyType}
                  onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                >
                  <option value="STANDARD">Tiêu chuẩn</option>
                  <option value="VOLUME">Theo số lượng</option>
                  <option value="SEASONAL">Theo mùa</option>
                </select>
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
                <label>Phần trăm markup (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.markupPercentage}
                  onChange={(e) => setFormData({ ...formData, markupPercentage: e.target.value })}
                  placeholder="Ví dụ: 10"
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

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo chính sách"}</button>
                <button type="button" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedPolicy(null); }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedPolicy && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết chính sách giá</h2>
            <div className="detail-content">
              <p><b>Đại lý:</b> {selectedPolicy.dealer?.dealerName || "Chung"}</p>
              <p><b>Loại:</b> {selectedPolicy.policyType || "—"}</p>
              <p><b>Giảm giá:</b> {selectedPolicy.discountPercentage ? `${selectedPolicy.discountPercentage}%` : "—"}</p>
              <p><b>Markup:</b> {selectedPolicy.markupPercentage ? `${selectedPolicy.markupPercentage}%` : "—"}</p>
              <p><b>Ngày bắt đầu:</b> {selectedPolicy.startDate ? new Date(selectedPolicy.startDate).toLocaleDateString("vi-VN") : "—"}</p>
              <p><b>Ngày kết thúc:</b> {selectedPolicy.endDate ? new Date(selectedPolicy.endDate).toLocaleDateString("vi-VN") : "—"}</p>
              <p><b>Trạng thái:</b> {selectedPolicy.status || "—"}</p>
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

