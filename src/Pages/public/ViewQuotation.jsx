import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationCircle, FaCopy, FaCalendarAlt, FaDollarSign, FaCar } from "react-icons/fa";
// API công khai - không cần đăng nhập (dùng cho khách hàng)
import { publicQuotationAPI, publicVehicleAPI } from "../../services/API";
import { getVariantImageUrl, getColorSwatchUrl } from "../../utils/imageUtils";
import MainLayout from "../../layouts/MainLayout";
import "./ViewQuotation.css";

export default function ViewQuotation() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [conditions, setConditions] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [adjustmentRequest, setAdjustmentRequest] = useState("");

  useEffect(() => {
    if (quotationId) {
      loadQuotation();
    }
  }, [quotationId]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await publicQuotationAPI.getQuotation(quotationId);
      setQuotation(res.data);
    } catch (err) {
      console.error("Lỗi khi tải quotation:", err);
      setError(err.response?.data?.message || "Không thể tải báo giá. Vui lòng kiểm tra lại link.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!conditions.trim()) {
      alert("Vui lòng nhập điều kiện chấp nhận báo giá.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await publicQuotationAPI.acceptQuotation(quotationId, conditions);
      alert("Chấp nhận báo giá thành công! Bạn có thể tiến hành thanh toán.");
      // Redirect to payment page
      if (res.data?.orderId) {
        navigate(`/payment/${res.data.orderId}`);
      } else {
        navigate("/order/track");
      }
    } catch (err) {
      console.error("Lỗi khi chấp nhận báo giá:", err);
      alert(err.response?.data?.message || "Không thể chấp nhận báo giá. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
      setShowAcceptModal(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setActionLoading(true);
      await publicQuotationAPI.rejectQuotation(
        quotationId,
        rejectReason,
        adjustmentRequest || undefined
      );
      alert("Đã từ chối báo giá thành công.");
      loadQuotation(); // Reload để cập nhật status
    } catch (err) {
      console.error("Lỗi khi từ chối báo giá:", err);
      alert(err.response?.data?.message || "Không thể từ chối báo giá. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert("Đã copy link báo giá!");
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: "Chờ xử lý", class: "status-pending", icon: <FaSpinner /> },
      sent: { label: "Đã gửi", class: "status-sent", icon: <FaCheckCircle /> },
      accepted: { label: "Đã chấp nhận", class: "status-accepted", icon: <FaCheckCircle /> },
      rejected: { label: "Đã từ chối", class: "status-rejected", icon: <FaTimesCircle /> },
      expired: { label: "Hết hạn", class: "status-expired", icon: <FaExclamationCircle /> },
      converted: { label: "Đã chuyển đổi", class: "status-converted", icon: <FaCheckCircle /> }
    };
    return statusMap[status?.toLowerCase()] || { label: status, class: "status-unknown", icon: null };
  };

  const isExpired = () => {
    if (!quotation?.expiryDate) return false;
    return new Date(quotation.expiryDate) < new Date();
  };

  const canAccept = () => {
    return quotation?.status?.toLowerCase() === "sent" && !isExpired();
  };

  const canReject = () => {
    return quotation?.status?.toLowerCase() === "sent" && !isExpired();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="view-quotation-container">
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Đang tải báo giá...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !quotation) {
    return (
      <MainLayout>
        <div className="view-quotation-container">
          <div className="error-container">
            <FaExclamationCircle className="error-icon" />
            <h2>Không tìm thấy báo giá</h2>
            <p>{error || "Báo giá không tồn tại hoặc đã bị xóa."}</p>
            <button onClick={() => navigate("/home")} className="btn-primary">
              Về trang chủ
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const statusInfo = getStatusInfo(quotation.status);
  const expired = isExpired();

  return (
    <MainLayout>
      <div className="view-quotation-container">
        <div className="quotation-header">
          <div className="header-content">
            <h1>Báo giá xe điện</h1>
            <div className="quotation-number">
              <span className="label">Số báo giá:</span>
              <span className="value">{quotation.quotationNumber || quotationId}</span>
              <button onClick={copyLink} className="btn-copy" title="Copy link">
                <FaCopy />
              </button>
            </div>
          </div>
          <div className={`status-badge ${statusInfo.class}`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {expired && quotation.status?.toLowerCase() === "sent" && (
          <div className="expiry-warning">
            <FaExclamationCircle />
            <span>Báo giá này đã hết hạn vào ngày {formatDate(quotation.expiryDate)}</span>
          </div>
        )}

        <div className="quotation-content">
          {/* Thông tin xe */}
          <div className="section vehicle-info">
            <h2>
              <FaCar /> Thông tin xe
            </h2>
            <div className="vehicle-details">
              {quotation.variant && (
                <div className="detail-item">
                  <span className="label">Dòng xe:</span>
                  <span className="value">{quotation.variant.variantName || quotation.variant.name}</span>
                </div>
              )}
              {quotation.color && (
                <div className="detail-item">
                  <span className="label">Màu sắc:</span>
                  <span className="value">
                    {quotation.color.colorName || quotation.color.name}
                    {quotation.colorId && (
                      <img
                        src={getColorSwatchUrl(quotation.colorId)}
                        alt={quotation.color.colorName || quotation.color.name}
                        className="color-swatch"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </span>
                </div>
              )}
              {quotation.variantId && (
                <div className="vehicle-image">
                  <img
                    src={getVariantImageUrl(quotation.variantId)}
                    alt={quotation.variant?.variantName || "Xe"}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Thông tin giá */}
          <div className="section pricing-info">
            <h2>
              <FaDollarSign /> Thông tin giá
            </h2>
            <div className="pricing-details">
              <div className="price-row">
                <span className="label">Giá gốc:</span>
                <span className="value">{formatPrice(quotation.totalPrice)}</span>
              </div>
              {quotation.discountAmount > 0 && (
                <>
                  <div className="price-row discount">
                    <span className="label">Giảm giá:</span>
                    <span className="value">-{formatPrice(quotation.discountAmount)}</span>
                  </div>
                  {quotation.discountPercentage && (
                    <div className="price-row discount-percent">
                      <span className="label">Tỷ lệ giảm:</span>
                      <span className="value">{quotation.discountPercentage}%</span>
                    </div>
                  )}
                </>
              )}
              <div className="price-row final">
                <span className="label">Tổng thanh toán:</span>
                <span className="value">{formatPrice(quotation.finalPrice || quotation.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Thông tin thời gian */}
          <div className="section time-info">
            <h2>
              <FaCalendarAlt /> Thông tin thời gian
            </h2>
            <div className="time-details">
              <div className="detail-item">
                <span className="label">Ngày báo giá:</span>
                <span className="value">{formatDate(quotation.quotationDate)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Hết hạn:</span>
                <span className={`value ${expired ? 'expired' : ''}`}>
                  {formatDate(quotation.expiryDate)}
                </span>
              </div>
              {quotation.validityDays && (
                <div className="detail-item">
                  <span className="label">Thời hạn hiệu lực:</span>
                  <span className="value">{quotation.validityDays} ngày</span>
                </div>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          {quotation.notes && (
            <div className="section notes-info">
              <h2>Ghi chú</h2>
              <p>{quotation.notes}</p>
            </div>
          )}

          {/* Actions */}
          {canAccept() || canReject() ? (
            <div className="section actions-section">
              <div className="action-buttons">
                {canAccept() && (
                  <button
                    className="btn-accept"
                    onClick={() => setShowAcceptModal(true)}
                    disabled={actionLoading}
                  >
                    <FaCheckCircle />
                    Chấp nhận báo giá
                  </button>
                )}
                {canReject() && (
                  <button
                    className="btn-reject"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                  >
                    <FaTimesCircle />
                    Từ chối báo giá
                  </button>
                )}
              </div>
            </div>
          ) : quotation.status?.toLowerCase() === "accepted" || quotation.status?.toLowerCase() === "converted" ? (
            <div className="section actions-section">
              <div className="success-message">
                <FaCheckCircle />
                <span>Báo giá đã được chấp nhận. Bạn có thể tiến hành thanh toán.</span>
              </div>
              {quotation.orderId && (
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/payment/${quotation.orderId}`)}
                >
                  Thanh toán ngay
                </button>
              )}
            </div>
          ) : quotation.status?.toLowerCase() === "rejected" ? (
            <div className="section actions-section">
              <div className="rejected-message">
                <FaTimesCircle />
                <span>Báo giá đã bị từ chối.</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Accept Modal */}
        {showAcceptModal && (
          <div className="modal-overlay" onClick={() => !actionLoading && setShowAcceptModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Chấp nhận báo giá</h3>
              <p>Vui lòng nhập điều kiện chấp nhận (nếu có):</p>
              <textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Ví dụ: Đồng ý với điều khoản và điều kiện..."
                rows="4"
              />
              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={handleAccept}
                  disabled={actionLoading || !conditions.trim()}
                >
                  {actionLoading ? <FaSpinner className="spinner-small" /> : <FaCheckCircle />}
                  Xác nhận chấp nhận
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowAcceptModal(false)}
                  disabled={actionLoading}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => !actionLoading && setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Từ chối báo giá</h3>
              <p>Vui lòng nhập lý do từ chối:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Giá quá cao, không phù hợp với ngân sách..."
                rows="3"
                required
              />
              <p style={{ marginTop: "12px", fontSize: "14px" }}>Yêu cầu điều chỉnh (tùy chọn):</p>
              <textarea
                value={adjustmentRequest}
                onChange={(e) => setAdjustmentRequest(e.target.value)}
                placeholder="Ví dụ: Mong muốn giảm giá thêm 5%..."
                rows="3"
              />
              <div className="modal-actions">
                <button
                  className="btn-danger"
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? <FaSpinner className="spinner-small" /> : <FaTimesCircle />}
                  Xác nhận từ chối
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

