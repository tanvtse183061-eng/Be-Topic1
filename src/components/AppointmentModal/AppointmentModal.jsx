import { useState } from "react";
import { publicAppointmentAPI } from "../../services/API";
import "./AppointmentModal.css";

export default function AppointmentModal({ show, onClose, appointmentType = "test_drive" }) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    location: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!formData.appointmentDate || !formData.appointmentTime) {
      setError("Vui lòng chọn ngày và giờ hẹn!");
      return;
    }

    setLoading(true);
    try {
      const appointmentDateTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;
      
      // Theo tài liệu: test-drive cần customerId, variantId, appointmentDate, notes
      // delivery cần orderId, appointmentDate, deliveryAddress, notes
      let payload = {};
      
      if (appointmentType === "test_drive") {
        // Cần customerId và variantId - tạm thời dùng form data hiện tại
        payload = {
          customerId: formData.customerId || null, // Cần có customerId
          variantId: formData.variantId || null, // Cần có variantId
          appointmentDate: appointmentDateTime,
          notes: formData.notes || null,
        };
        await publicAppointmentAPI.createTestDrive(payload);
      } else if (appointmentType === "delivery") {
        // Cần orderId, appointmentDate, deliveryAddress, notes
        payload = {
          orderId: formData.orderId || null, // Cần có orderId
          appointmentDate: appointmentDateTime,
          deliveryAddress: formData.location || formData.deliveryAddress || null,
          notes: formData.notes || null,
        };
        await publicAppointmentAPI.createDelivery(payload);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          appointmentDate: "",
          appointmentTime: "",
          location: "",
          notes: "",
        });
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi đặt lịch:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Không thể đặt lịch. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="appointment-modal-overlay" onClick={onClose}>
      <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="appointment-modal-header">
          <h2>
            {appointmentType === "test_drive" ? "Đặt lịch lái thử" : "Đặt lịch giao xe"}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {success ? (
          <div className="success-message">
            <h3>✅ Đặt lịch thành công!</h3>
            <p>Chúng tôi sẽ liên hệ với bạn để xác nhận lịch hẹn.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Họ tên *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                placeholder="Nhập họ tên"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
                placeholder="example@email.com"
              />
            </div>

            <div className="form-group">
              <label>Điện thoại *</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
                placeholder="0123456789"
              />
            </div>

            <div className="form-group">
              <label>Ngày hẹn *</label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Giờ hẹn *</label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Địa điểm</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Địa điểm hẹn (nếu có)"
              />
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                placeholder="Ghi chú thêm (nếu có)"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose}>Hủy</button>
              <button type="submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đặt lịch"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

