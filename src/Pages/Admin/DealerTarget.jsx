import './Order.css';
import { FaSearch, FaEye, FaPlus, FaEdit, FaTrash, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dealerTargetAPI, dealerAPI } from "../../services/API";

export default function DealerTarget() {
  const [targets, setTargets] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    dealerId: "",
    targetYear: new Date().getFullYear(),
    targetMonth: "",
    targetQuantity: "",
    targetAmount: "",
    status: "ACTIVE"
  });

  // Lấy danh sách mục tiêu
  const fetchTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dealerTargetAPI.getTargets();
      setTargets(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy mục tiêu:", err);
      setError("Không thể tải danh sách mục tiêu. Vui lòng thử lại sau.");
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
    fetchTargets();
    fetchDealers();
  }, []);

  useEffect(() => {
    if (showPopup) {
      fetchDealers();
    }
  }, [showPopup]);

  // Tạo/cập nhật mục tiêu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.dealerId || !formData.targetYear) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const payload = {
        dealerId: formData.dealerId,
        targetYear: parseInt(formData.targetYear),
        targetMonth: formData.targetMonth ? parseInt(formData.targetMonth) : null,
        targetQuantity: formData.targetQuantity ? parseInt(formData.targetQuantity) : null,
        targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : null,
        status: formData.status
      };

      if (isEdit && selectedTarget) {
        await dealerTargetAPI.updateTarget(selectedTarget.targetId, payload);
        alert("Cập nhật mục tiêu thành công!");
      } else {
        await dealerTargetAPI.createTarget(payload);
        alert("Tạo mục tiêu thành công!");
      }

      setShowPopup(false);
      setIsEdit(false);
      setSelectedTarget(null);
      setFormData({
        dealerId: "",
        targetYear: new Date().getFullYear(),
        targetMonth: "",
        targetQuantity: "",
        targetAmount: "",
        status: "ACTIVE"
      });
      await fetchTargets();
    } catch (err) {
      console.error("Lỗi khi tạo/cập nhật mục tiêu:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Không thể tạo/cập nhật mục tiêu!");
    }
  };

  // Xóa mục tiêu
  const handleDelete = async (targetId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục tiêu này không?")) return;
    try {
      setDeleting(targetId);
      await dealerTargetAPI.deleteTarget(targetId);
      alert("Xóa mục tiêu thành công!");
      await fetchTargets();
    } catch (err) {
      console.error("Lỗi khi xóa mục tiêu:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Cập nhật thành tích
  const handleUpdateAchievement = async (targetId) => {
    const achievement = window.prompt("Nhập thành tích đạt được:");
    if (achievement === null) return;
    try {
      setDeleting(targetId);
      await dealerTargetAPI.updateAchievement(targetId, parseFloat(achievement));
      alert("Cập nhật thành tích thành công!");
      await fetchTargets();
    } catch (err) {
      console.error("Lỗi khi cập nhật thành tích:", err);
      alert("Cập nhật thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Sửa mục tiêu
  const handleEdit = (target) => {
    setSelectedTarget(target);
    setIsEdit(true);
    setFormData({
      dealerId: target.dealer?.dealerId || target.dealerId || "",
      targetYear: target.targetYear || new Date().getFullYear(),
      targetMonth: target.targetMonth || "",
      targetQuantity: target.targetQuantity || "",
      targetAmount: target.targetAmount || "",
      status: target.status || "ACTIVE"
    });
    setShowPopup(true);
  };

  // Xem chi tiết
  const handleView = (target) => {
    setSelectedTarget(target);
    setShowDetail(true);
  };

  // Mở popup tạo mới
  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedTarget(null);
    setFormData({
      dealerId: "",
      targetYear: new Date().getFullYear(),
      targetMonth: "",
      targetQuantity: "",
      targetAmount: "",
      status: "ACTIVE"
    });
    setError("");
    setShowPopup(true);
  };

  // Tìm kiếm
  const filteredTargets = targets.filter((t) => {
    if (!t) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (t.dealer?.dealerName && String(t.dealer.dealerName).toLowerCase().includes(keyword)) ||
      (t.targetYear && String(t.targetYear).includes(keyword)) ||
      (t.status && String(t.status).toLowerCase().includes(keyword))
    );
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') return 'status-confirmed';
    if (statusLower === 'completed') return 'status-completed';
    if (statusLower === 'inactive') return 'status-pending';
    return 'status-default';
  };

  // Tính tỷ lệ hoàn thành
  const getCompletionRate = (target) => {
    if (!target.targetAmount || !target.achievement) return 0;
    return ((target.achievement / target.targetAmount) * 100).toFixed(1);
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">🎯</span>
        Quản lý mục tiêu đại lý
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách mục tiêu</h2>
          <p className="subtitle">{targets.length} mục tiêu tổng cộng</p>
        </div>
        <button className="btn-add" onClick={handleOpenCreate}>
          <FaPlus className="btn-icon" />
          Tạo mục tiêu
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo đại lý, năm, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchTargets}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách mục tiêu...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredTargets.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>ĐẠI LÝ</th>
                  <th>NĂM</th>
                  <th>THÁNG</th>
                  <th>MỤC TIÊU SỐ LƯỢNG</th>
                  <th>MỤC TIÊU DOANH SỐ</th>
                  <th>THÀNH TÍCH</th>
                  <th>TỶ LỆ HOÀN THÀNH</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map((t) => (
                  <tr key={t.targetId}>
                    <td>{t.dealer?.dealerName || t.dealerId || 'N/A'}</td>
                    <td>{t.targetYear || 'N/A'}</td>
                    <td>{t.targetMonth || 'Cả năm'}</td>
                    <td>{t.targetQuantity ? t.targetQuantity.toLocaleString('vi-VN') : 'N/A'}</td>
                    <td>{t.targetAmount ? t.targetAmount.toLocaleString('vi-VN') + ' ₫' : 'N/A'}</td>
                    <td>{t.achievement ? t.achievement.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                    <td>
                      <span className={getCompletionRate(t) >= 100 ? 'status-completed' : 'status-pending'}>
                        {getCompletionRate(t)}%
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(t.status)}`}>
                        <span>{t.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(t)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="icon-btn edit"
                        onClick={() => handleEdit(t)}
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="icon-btn edit"
                        onClick={() => handleUpdateAchievement(t.targetId)}
                        disabled={deleting === t.targetId}
                        title="Cập nhật thành tích"
                      >
                        {deleting === t.targetId ? <FaSpinner className="spinner-small" /> : '✓'}
                      </button>
                      <button 
                        className="icon-btn delete" 
                        onClick={() => handleDelete(t.targetId)}
                        disabled={deleting === t.targetId}
                        title="Xóa"
                      >
                        {deleting === t.targetId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{searchTerm ? 'Không tìm thấy mục tiêu' : 'Chưa có mục tiêu nào'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup tạo/sửa */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedTarget(null); }}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>{isEdit ? "Sửa mục tiêu" : "Tạo mục tiêu"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label>Đại lý *</label>
                <select
                  value={formData.dealerId}
                  onChange={(e) => setFormData({ ...formData, dealerId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn đại lý --</option>
                  {dealers.map((d) => (
                    <option key={d.dealerId || d.id} value={d.dealerId || d.id}>
                      {d.dealerName || d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Năm *</label>
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  value={formData.targetYear}
                  onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Tháng (để trống = cả năm)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.targetMonth}
                  onChange={(e) => setFormData({ ...formData, targetMonth: e.target.value })}
                  placeholder="1-12"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Mục tiêu số lượng</label>
                <input
                  type="number"
                  min="0"
                  value={formData.targetQuantity}
                  onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                  placeholder="Số lượng xe"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Mục tiêu doanh số (₫)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="Doanh số mục tiêu"
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
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo mục tiêu"}</button>
                <button type="button" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedTarget(null); }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedTarget && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết mục tiêu</h2>
            <div className="detail-content">
              <p><b>Đại lý:</b> {selectedTarget.dealer?.dealerName || selectedTarget.dealerId || "—"}</p>
              <p><b>Năm:</b> {selectedTarget.targetYear || "—"}</p>
              <p><b>Tháng:</b> {selectedTarget.targetMonth || "Cả năm"}</p>
              <p><b>Mục tiêu số lượng:</b> {selectedTarget.targetQuantity ? selectedTarget.targetQuantity.toLocaleString('vi-VN') : "—"}</p>
              <p><b>Mục tiêu doanh số:</b> {selectedTarget.targetAmount ? selectedTarget.targetAmount.toLocaleString('vi-VN') + ' ₫' : "—"}</p>
              <p><b>Thành tích:</b> {selectedTarget.achievement ? selectedTarget.achievement.toLocaleString('vi-VN') + ' ₫' : "0 ₫"}</p>
              <p><b>Tỷ lệ hoàn thành:</b> {getCompletionRate(selectedTarget)}%</p>
              <p><b>Trạng thái:</b> {selectedTarget.status || "—"}</p>
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

