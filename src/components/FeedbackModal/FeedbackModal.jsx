import { useState } from "react";
import { publicFeedbackAPI } from "../../services/API";
import "./FeedbackModal.css";

export default function FeedbackModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    feedbackType: "GENERAL",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    subject: "",
    message: "",
    rating: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.customerName || !formData.customerEmail || !formData.message) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        feedbackType: formData.feedbackType,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || null,
        subject: formData.subject || null,
        message: formData.message,
        rating: formData.rating,
      };

      await publicFeedbackAPI.createFeedback(payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          feedbackType: "GENERAL",
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          subject: "",
          message: "",
          rating: 5,
        });
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Không thể gửi phản hồi. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>Gửi phản hồi</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {success ? (
          <div className="success-message">
            <h3>✅ Gửi phản hồi thành công!</h3>
            <p>Cảm ơn bạn đã gửi phản hồi. Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Loại phản hồi *</label>
              <select
                value={formData.feedbackType}
                onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
                required
              >
                <option value="PRODUCT">Sản phẩm</option>
                <option value="SERVICE">Dịch vụ</option>
                <option value="DELIVERY">Giao hàng</option>
                <option value="GENERAL">Chung</option>
              </select>
            </div>

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
              <label>Điện thoại</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="0123456789"
              />
            </div>

            <div className="form-group">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Tiêu đề phản hồi"
              />
            </div>

            <div className="form-group">
              <label>Đánh giá *</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, rating: star })}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-text">{formData.rating}/5</span>
              </div>
            </div>

            <div className="form-group">
              <label>Nội dung phản hồi *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="5"
                required
                placeholder="Nhập nội dung phản hồi của bạn..."
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose}>Hủy</button>
              <button type="submit" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi phản hồi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

