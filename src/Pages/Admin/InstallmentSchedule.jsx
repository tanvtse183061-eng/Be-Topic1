import './Order.css';
import { FaSearch, FaEye, FaCheckCircle, FaSpinner, FaExclamationCircle, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { installmentScheduleAPI, installmentPlanAPI } from "../../services/API";

export default function InstallmentSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [filterPlanId, setFilterPlanId] = useState("");

  // Lấy danh sách lịch trả góp
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (filterPlanId) {
        res = await installmentPlanAPI.getPlansByInvoice(filterPlanId);
        // Nếu API trả về plan, cần lấy schedules từ plan
        const plan = res.data;
        if (plan && plan.schedules) {
          setSchedules(plan.schedules);
        } else {
          res = await installmentScheduleAPI.getSchedules();
          setSchedules(res.data || []);
        }
      } else {
        res = await installmentScheduleAPI.getSchedules();
        setSchedules(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi lấy lịch trả góp:", err);
      setError("Không thể tải danh sách lịch trả góp. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách kế hoạch
  const fetchPlans = async () => {
    try {
      const res = await installmentPlanAPI.getPlans();
      setPlans(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy kế hoạch:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchPlans();
  }, [filterPlanId]);

  // Đánh dấu đã thanh toán
  const handleMarkPaid = async (scheduleId) => {
    if (!window.confirm("Bạn có chắc chắn muốn đánh dấu đã thanh toán không?")) return;
    try {
      setProcessing(scheduleId);
      await installmentScheduleAPI.markPaid(scheduleId);
      alert("Đánh dấu đã thanh toán thành công!");
      await fetchSchedules();
    } catch (err) {
      console.error("Lỗi khi đánh dấu đã thanh toán:", err);
      alert("Thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Cập nhật trạng thái
  const handleUpdateStatus = async (scheduleId, newStatus) => {
    try {
      setProcessing(scheduleId);
      await installmentScheduleAPI.updateStatus(scheduleId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      await fetchSchedules();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Xem chi tiết
  const handleView = (schedule) => {
    setSelectedSchedule(schedule);
    setShowDetail(true);
  };

  // Tìm kiếm
  const filteredSchedules = schedules.filter((s) => {
    if (!s) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (s.scheduleNumber && String(s.scheduleNumber).toLowerCase().includes(keyword)) ||
      (s.plan?.planName && String(s.plan.planName).toLowerCase().includes(keyword)) ||
      (s.status && String(s.status).toLowerCase().includes(keyword))
    );
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'pending' || statusLower === 'chờ') return 'status-pending';
    if (statusLower === 'paid' || statusLower === 'đã thanh toán') return 'status-completed';
    if (statusLower === 'overdue' || statusLower === 'quá hạn') return 'status-cancelled';
    if (statusLower === 'cancelled' || statusLower === 'hủy') return 'status-cancelled';
    return 'status-default';
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">📋</span>
        Quản lý lịch trả góp
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách lịch trả góp</h2>
          <p className="subtitle">{schedules.length} kỳ trả góp tổng cộng</p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Lọc theo kế hoạch</label>
            <select
              value={filterPlanId}
              onChange={(e) => setFilterPlanId(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Tất cả kế hoạch</option>
              {plans.map((p) => (
                <option key={p.planId} value={p.planId}>
                  {p.planName || p.planId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo số lịch, kế hoạch, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchSchedules}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách lịch trả góp...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredSchedules.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>SỐ KỲ</th>
                  <th>KẾ HOẠCH</th>
                  <th>SỐ TIỀN</th>
                  <th>NGÀY ĐẾN HẠN</th>
                  <th>NGÀY THANH TOÁN</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((s) => (
                  <tr key={s.scheduleId}>
                    <td>{s.installmentNumber || s.scheduleNumber || 'N/A'}</td>
                    <td>{s.plan?.planName || s.planId || 'N/A'}</td>
                    <td>{s.amount ? s.amount.toLocaleString('vi-VN') + ' ₫' : 'N/A'}</td>
                    <td>
                      <span className="date-text">
                        {s.dueDate ? new Date(s.dueDate).toLocaleDateString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {s.paidDate ? new Date(s.paidDate).toLocaleDateString("vi-VN") : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(s.status)}`}>
                        <span>{s.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(s)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      {s.status?.toLowerCase() === 'pending' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleMarkPaid(s.scheduleId)}
                          disabled={processing === s.scheduleId}
                          title="Đánh dấu đã thanh toán"
                        >
                          {processing === s.scheduleId ? <FaSpinner className="spinner-small" /> : <FaCheckCircle />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>{searchTerm ? 'Không tìm thấy lịch trả góp' : 'Chưa có lịch trả góp nào'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedSchedule && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết lịch trả góp</h2>
            <div className="detail-content">
              <p><b>Số kỳ:</b> {selectedSchedule.installmentNumber || selectedSchedule.scheduleNumber || "—"}</p>
              <p><b>Kế hoạch:</b> {selectedSchedule.plan?.planName || selectedSchedule.planId || "—"}</p>
              <p><b>Số tiền:</b> {selectedSchedule.amount ? selectedSchedule.amount.toLocaleString('vi-VN') + ' ₫' : "—"}</p>
              <p><b>Ngày đến hạn:</b> {selectedSchedule.dueDate ? new Date(selectedSchedule.dueDate).toLocaleDateString("vi-VN") : "—"}</p>
              <p><b>Ngày thanh toán:</b> {selectedSchedule.paidDate ? new Date(selectedSchedule.paidDate).toLocaleDateString("vi-VN") : "Chưa thanh toán"}</p>
              <p><b>Trạng thái:</b> {selectedSchedule.status || "—"}</p>
              {selectedSchedule.notes && <p><b>Ghi chú:</b> {selectedSchedule.notes}</p>}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

