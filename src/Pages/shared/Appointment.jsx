import '../Admin/Order.css';
import { FaSearch, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { appointmentAPI } from "../../services/API";

export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);

  // Lấy danh sách lịch hẹn
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await appointmentAPI.getAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy lịch hẹn:", err);
      setError("Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Xác nhận lịch hẹn
  const handleConfirm = async (appointmentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xác nhận lịch hẹn này không?")) return;
    try {
      setProcessing(appointmentId);
      await appointmentAPI.confirmAppointment(appointmentId);
      alert("Xác nhận lịch hẹn thành công!");
      await fetchAppointments();
    } catch (err) {
      console.error("Lỗi khi xác nhận:", err);
      alert("Xác nhận thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Hoàn thành lịch hẹn
  const handleComplete = async (appointmentId) => {
    const notes = window.prompt("Nhập ghi chú hoàn thành (nếu có):");
    try {
      setProcessing(appointmentId);
      await appointmentAPI.completeAppointment(appointmentId, notes || null);
      alert("Hoàn thành lịch hẹn thành công!");
      await fetchAppointments();
    } catch (err) {
      console.error("Lỗi khi hoàn thành:", err);
      alert("Hoàn thành thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Hủy lịch hẹn
  const handleCancel = async (appointmentId) => {
    const reason = window.prompt("Nhập lý do hủy:");
    if (reason === null) return; // User cancelled
    try {
      setProcessing(appointmentId);
      await appointmentAPI.cancelAppointment(appointmentId, reason);
      alert("Hủy lịch hẹn thành công!");
      await fetchAppointments();
    } catch (err) {
      console.error("Lỗi khi hủy:", err);
      alert("Hủy thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Tìm kiếm
  const filteredAppointments = appointments.filter((a) => {
    if (!a) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (a.appointmentNumber && String(a.appointmentNumber).toLowerCase().includes(keyword)) ||
      (a.customerName && String(a.customerName).toLowerCase().includes(keyword)) ||
      (a.customerEmail && String(a.customerEmail).toLowerCase().includes(keyword)) ||
      (a.appointmentType && String(a.appointmentType).toLowerCase().includes(keyword)) ||
      (a.status && String(a.status).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('scheduled') || statusLower.includes('chờ')) return 'status-pending';
    if (statusLower.includes('confirmed') || statusLower.includes('xác nhận')) return 'status-confirmed';
    if (statusLower.includes('completed') || statusLower.includes('hoàn tất')) return 'status-completed';
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return 'status-cancelled';
    return 'status-default';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('scheduled') || statusLower.includes('chờ')) return <FaClock />;
    if (statusLower.includes('confirmed') || statusLower.includes('xác nhận')) return <FaCheckCircle />;
    if (statusLower.includes('completed') || statusLower.includes('hoàn tất')) return <FaCheckCircle />;
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return <FaTimesCircle />;
    return <FaExclamationCircle />;
  };

  // Get appointment type display
  const getAppointmentTypeDisplay = (type) => {
    const typeMap = {
      'test_drive': 'Lái thử',
      'consultation': 'Tư vấn',
      'delivery': 'Giao xe',
      'service': 'Dịch vụ',
      'maintenance': 'Bảo dưỡng'
    };
    return typeMap[type] || type || 'N/A';
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">📅</span>
        Quản lý lịch hẹn
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách lịch hẹn</h2>
          <p className="subtitle">{appointments.length} lịch hẹn tổng cộng</p>
        </div>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo số lịch, khách hàng, loại, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchAppointments}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredAppointments.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>SỐ LỊCH HẸN</th>
                  <th>KHÁCH HÀNG</th>
                  <th>LOẠI</th>
                  <th>NGÀY GIỜ</th>
                  <th>ĐỊA ĐIỂM</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a) => (
                  <tr key={a.appointmentId}>
                    <td>
                      <span className="order-number">{a.appointmentNumber || a.appointmentId}</span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{a.customerName || 'N/A'}</span>
                        {a.customerEmail && (
                          <span className="customer-email">{a.customerEmail}</span>
                        )}
                      </div>
                    </td>
                    <td>{getAppointmentTypeDisplay(a.appointmentType)}</td>
                    <td>
                      <span className="date-text">
                        {a.appointmentDate ? new Date(a.appointmentDate).toLocaleString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td>{a.location || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(a.status)}`}>
                        {getStatusIcon(a.status)}
                        <span>{a.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(a)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      {a.status?.toLowerCase() === 'scheduled' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleConfirm(a.appointmentId)}
                          disabled={processing === a.appointmentId}
                          title="Xác nhận"
                        >
                          {processing === a.appointmentId ? <FaSpinner className="spinner-small" /> : <FaCheckCircle />}
                        </button>
                      )}
                      {a.status?.toLowerCase() === 'confirmed' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleComplete(a.appointmentId)}
                          disabled={processing === a.appointmentId}
                          title="Hoàn thành"
                        >
                          {processing === a.appointmentId ? <FaSpinner className="spinner-small" /> : <FaCheckCircle />}
                        </button>
                      )}
                      {a.status?.toLowerCase() !== 'cancelled' && a.status?.toLowerCase() !== 'completed' && (
                        <button 
                          className="icon-btn delete" 
                          onClick={() => handleCancel(a.appointmentId)}
                          disabled={processing === a.appointmentId}
                          title="Hủy"
                        >
                          {processing === a.appointmentId ? <FaSpinner className="spinner-small" /> : <FaTimesCircle />}
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
              <h3>{searchTerm ? 'Không tìm thấy lịch hẹn' : 'Chưa có lịch hẹn nào'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedAppointment && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết lịch hẹn</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin lịch hẹn</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số lịch hẹn</span>
                    <span className="detail-value">{selectedAppointment.appointmentNumber || selectedAppointment.appointmentId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loại</span>
                    <span className="detail-value">{getAppointmentTypeDisplay(selectedAppointment.appointmentType)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${getStatusBadge(selectedAppointment.status)}`}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span>{selectedAppointment.status}</span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày giờ</span>
                    <span className="detail-value">
                      {selectedAppointment.appointmentDate ? new Date(selectedAppointment.appointmentDate).toLocaleString("vi-VN") : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Địa điểm</span>
                    <span className="detail-value">{selectedAppointment.location || 'N/A'}</span>
                  </div>
                  {selectedAppointment.durationMinutes && (
                    <div className="detail-item">
                      <span className="detail-label">Thời lượng (phút)</span>
                      <span className="detail-value">{selectedAppointment.durationMinutes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">{selectedAppointment.customerName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedAppointment.customerEmail || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedAppointment.customerPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p>{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
            <div className="popup-footer">
              <button className="btn-primary" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

