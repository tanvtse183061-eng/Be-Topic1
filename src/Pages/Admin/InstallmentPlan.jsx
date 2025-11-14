import './Order.css';
import { FaSearch, FaEye, FaPlus, FaEdit, FaTrash, FaSpinner, FaExclamationCircle, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { installmentPlanAPI, dealerInvoiceAPI } from "../../services/API";

export default function InstallmentPlan() {
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    invoiceId: "",
    planName: "",
    totalAmount: "",
    downPayment: "",
    numberOfMonths: "",
    interestRate: "",
    status: "PENDING"
  });

  // Lấy danh sách kế hoạch trả góp
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await installmentPlanAPI.getPlans();
      setPlans(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy kế hoạch trả góp:", err);
      setError("Không thể tải danh sách kế hoạch trả góp. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách hóa đơn
  const fetchInvoices = async () => {
    try {
      const res = await dealerInvoiceAPI.getInvoices();
      const invoicesData = res.data || [];
      // Chỉ lấy hóa đơn chưa có kế hoạch trả góp
      setInvoices(invoicesData);
    } catch (err) {
      console.error("Lỗi khi lấy hóa đơn:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (showPopup) {
      fetchInvoices();
    }
  }, [showPopup]);

  // Tạo/cập nhật kế hoạch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.invoiceId || !formData.totalAmount || !formData.numberOfMonths) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const payload = {
        invoiceId: formData.invoiceId,
        planName: formData.planName || null,
        totalAmount: parseFloat(formData.totalAmount),
        downPayment: formData.downPayment ? parseFloat(formData.downPayment) : null,
        numberOfMonths: parseInt(formData.numberOfMonths),
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : null,
        status: formData.status
      };

      if (isEdit && selectedPlan) {
        await installmentPlanAPI.updatePlan(selectedPlan.planId, payload);
        alert("Cập nhật kế hoạch trả góp thành công!");
      } else {
        await installmentPlanAPI.createPlan(payload);
        alert("Tạo kế hoạch trả góp thành công!");
      }

      setShowPopup(false);
      setIsEdit(false);
      setSelectedPlan(null);
      setFormData({
        invoiceId: "",
        planName: "",
        totalAmount: "",
        downPayment: "",
        numberOfMonths: "",
        interestRate: "",
        status: "PENDING"
      });
      await fetchPlans();
    } catch (err) {
      console.error("Lỗi khi tạo/cập nhật kế hoạch:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Không thể tạo/cập nhật kế hoạch!");
    }
  };

  // Xóa kế hoạch
  const handleDelete = async (planId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa kế hoạch này không?")) return;
    try {
      setDeleting(planId);
      await installmentPlanAPI.deletePlan(planId);
      alert("Xóa kế hoạch thành công!");
      await fetchPlans();
    } catch (err) {
      console.error("Lỗi khi xóa kế hoạch:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Cập nhật trạng thái
  const handleUpdateStatus = async (planId, newStatus) => {
    try {
      setDeleting(planId);
      await installmentPlanAPI.updateStatus(planId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      await fetchPlans();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Sửa kế hoạch
  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setIsEdit(true);
    setFormData({
      invoiceId: plan.invoice?.invoiceId || plan.invoiceId || "",
      planName: plan.planName || "",
      totalAmount: plan.totalAmount || "",
      downPayment: plan.downPayment || "",
      numberOfMonths: plan.numberOfMonths || "",
      interestRate: plan.interestRate || "",
      status: plan.status || "PENDING"
    });
    setShowPopup(true);
  };

  // Xem chi tiết
  const handleView = (plan) => {
    setSelectedPlan(plan);
    setShowDetail(true);
  };

  // Mở popup tạo mới
  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedPlan(null);
    setFormData({
      invoiceId: "",
      planName: "",
      totalAmount: "",
      downPayment: "",
      numberOfMonths: "",
      interestRate: "",
      status: "PENDING"
    });
    setError("");
    setShowPopup(true);
  };

  // Tìm kiếm
  const filteredPlans = plans.filter((p) => {
    if (!p) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (p.planName && String(p.planName).toLowerCase().includes(keyword)) ||
      (p.invoice?.invoiceNumber && String(p.invoice.invoiceNumber).toLowerCase().includes(keyword)) ||
      (p.status && String(p.status).toLowerCase().includes(keyword))
    );
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'active') return 'status-confirmed';
    if (statusLower === 'completed') return 'status-completed';
    if (statusLower === 'cancelled') return 'status-cancelled';
    return 'status-default';
  };

  // Tính số tiền mỗi tháng
  const calculateMonthlyPayment = (plan) => {
    if (!plan.totalAmount || !plan.numberOfMonths) return 0;
    const principal = plan.totalAmount - (plan.downPayment || 0);
    const monthly = principal / plan.numberOfMonths;
    if (plan.interestRate) {
      const interest = (principal * plan.interestRate / 100) / plan.numberOfMonths;
      return monthly + interest;
    }
    return monthly;
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">📅</span>
        Quản lý kế hoạch trả góp
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách kế hoạch trả góp</h2>
          <p className="subtitle">{plans.length} kế hoạch tổng cộng</p>
        </div>
        <button className="btn-add" onClick={handleOpenCreate}>
          <FaPlus className="btn-icon" />
          Tạo kế hoạch
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, hóa đơn, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchPlans}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách kế hoạch trả góp...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredPlans.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>TÊN KẾ HOẠCH</th>
                  <th>HÓA ĐƠN</th>
                  <th>TỔNG TIỀN</th>
                  <th>TRẢ TRƯỚC</th>
                  <th>SỐ THÁNG</th>
                  <th>MỖI THÁNG</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((p) => (
                  <tr key={p.planId}>
                    <td>{p.planName || 'N/A'}</td>
                    <td>{p.invoice?.invoiceNumber || p.invoiceId || 'N/A'}</td>
                    <td>{p.totalAmount ? p.totalAmount.toLocaleString('vi-VN') + ' ₫' : 'N/A'}</td>
                    <td>{p.downPayment ? p.downPayment.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                    <td>{p.numberOfMonths || 'N/A'}</td>
                    <td>{calculateMonthlyPayment(p).toLocaleString('vi-VN')} ₫</td>
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
                      {p.status?.toLowerCase() === 'pending' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleUpdateStatus(p.planId, 'active')}
                          disabled={deleting === p.planId}
                          title="Kích hoạt"
                        >
                          {deleting === p.planId ? <FaSpinner className="spinner-small" /> : '✓'}
                        </button>
                      )}
                      <button 
                        className="icon-btn delete" 
                        onClick={() => handleDelete(p.planId)}
                        disabled={deleting === p.planId}
                        title="Xóa"
                      >
                        {deleting === p.planId ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{searchTerm ? 'Không tìm thấy kế hoạch' : 'Chưa có kế hoạch nào'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup tạo/sửa */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedPlan(null); }}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>{isEdit ? "Sửa kế hoạch trả góp" : "Tạo kế hoạch trả góp"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label>Hóa đơn *</label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn hóa đơn --</option>
                  {invoices.map((inv) => (
                    <option key={inv.invoiceId || inv.id} value={inv.invoiceId || inv.id}>
                      {inv.invoiceNumber || inv.invoiceId} - {inv.totalAmount ? inv.totalAmount.toLocaleString('vi-VN') + ' ₫' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Tên kế hoạch</label>
                <input
                  type="text"
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  placeholder="Tên kế hoạch trả góp"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Tổng số tiền (₫) *</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  required
                  placeholder="Tổng số tiền"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Trả trước (₫)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                  placeholder="Số tiền trả trước"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Số tháng *</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.numberOfMonths}
                  onChange={(e) => setFormData({ ...formData, numberOfMonths: e.target.value })}
                  required
                  placeholder="Số tháng trả góp"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Lãi suất (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  placeholder="Lãi suất hàng năm"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo kế hoạch"}</button>
                <button type="button" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedPlan(null); }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedPlan && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết kế hoạch trả góp</h2>
            <div className="detail-content">
              <p><b>Tên kế hoạch:</b> {selectedPlan.planName || "—"}</p>
              <p><b>Hóa đơn:</b> {selectedPlan.invoice?.invoiceNumber || selectedPlan.invoiceId || "—"}</p>
              <p><b>Tổng số tiền:</b> {selectedPlan.totalAmount ? selectedPlan.totalAmount.toLocaleString('vi-VN') + ' ₫' : "—"}</p>
              <p><b>Trả trước:</b> {selectedPlan.downPayment ? selectedPlan.downPayment.toLocaleString('vi-VN') + ' ₫' : "0 ₫"}</p>
              <p><b>Số tháng:</b> {selectedPlan.numberOfMonths || "—"}</p>
              <p><b>Mỗi tháng:</b> {calculateMonthlyPayment(selectedPlan).toLocaleString('vi-VN')} ₫</p>
              <p><b>Lãi suất:</b> {selectedPlan.interestRate ? `${selectedPlan.interestRate}%` : "0%"}</p>
              <p><b>Trạng thái:</b> {selectedPlan.status || "—"}</p>
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

