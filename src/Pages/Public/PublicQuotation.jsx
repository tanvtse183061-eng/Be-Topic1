import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicQuotationAPI } from "../../services/API";
import { FaCheck, FaTimes, FaSpinner, FaCreditCard } from "react-icons/fa";
import "./PublicQuotation.css";

export default function PublicQuotation() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [conditions, setConditions] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await publicQuotationAPI.getQuotation(quotationId);
      const quotationData = res.data?.data || res.data || res;
      setQuotation(quotationData);
    } catch (err) {
      console.error("❌ Lỗi khi lấy báo giá:", err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tải báo giá!");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("vi-VN");
    } catch {
      return date;
    }
  };

  const handleAccept = async () => {
    if (!conditions.trim()) {
      alert("Vui lòng nhập điều kiện chấp nhận!");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn chấp nhận báo giá này?\n\nSau khi chấp nhận, đơn hàng sẽ được xác nhận và bạn có thể tiến hành thanh toán.")) return;

    try {
      setAccepting(true);
      const res = await publicQuotationAPI.acceptQuotation(quotationId, conditions);
      const responseData = res.data?.data || res.data || res;
      
      setResult({
        type: "success",
        title: "✅ Chấp nhận báo giá thành công!",
        message: responseData.message || "Order confirmed. You can now proceed to payment.",
        orderId: responseData.orderId,
        orderNumber: responseData.orderNumber,
        status: responseData.status,
        totalAmount: responseData.totalAmount
      });
      
      await fetchQuotation();
    } catch (err) {
      console.error("❌ Lỗi khi chấp nhận báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể chấp nhận báo giá!";
      setResult({
        type: "error",
        title: "❌ Chấp nhận báo giá thất bại!",
        message: errorMsg
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="public-quotation-container">
        <div className="loading">Đang tải báo giá...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-quotation-container">
        <div className="error-box">
          <h2>Không thể tải báo giá</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="public-quotation-container">
        <div className="error-box">
          <h2>Không tìm thấy báo giá</h2>
          <p>Báo giá không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  const status = quotation.status?.toLowerCase() || "";
  const canAccept = status === "sent" || status === "pending";
  const isExpired = quotation.expiryDate && new Date(quotation.expiryDate) < new Date();
  const isAccepted = status === "accepted" || status === "converted";

  const customer = quotation.customer || {};
  const variant = quotation.variant || {};
  const color = quotation.color || {};
  const brand = variant?.model?.brand || variant?.brand || {};
  const brandName = brand?.brandName || brand?.brand_name || brand?.name || "—";
  const variantName = variant?.variantName || variant?.variant_name || variant?.name || "—";
  const colorName = color?.colorName || color?.color_name || color?.name || "—";

  return (
    <div className="public-quotation-container">
      <div className="quotation-card">
        <div className="quotation-header">
          <h1>Báo giá khách hàng</h1>
          <div className="quotation-number">Số báo giá: <strong>{quotation.quotationNumber || quotation.quotationId}</strong></div>
        </div>

        {result && (
          <div className={`result-box ${result.type}`}>
            <h3>{result.title}</h3>
            <p>{result.message}</p>
            {result.orderId && (
              <div className="order-info">
                <p><strong>Mã đơn hàng:</strong> {result.orderNumber || result.orderId}</p>
                <p><strong>Trạng thái:</strong> {result.status}</p>
                {result.totalAmount && (
                  <p><strong>Tổng tiền:</strong> {formatPrice(result.totalAmount)}</p>
                )}
                <div className="payment-link-section" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                  <p style={{ marginBottom: "10px", fontSize: "14px" }}>Bạn có thể tiến hành thanh toán ngay bây giờ:</p>
                  <button 
                    className="btn-payment-link"
                    onClick={() => navigate(`/public/orders/${result.orderId}/payment`)}
                    style={{
                      padding: "12px 24px",
                      background: "white",
                      color: "#16a34a",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <FaCreditCard /> Thanh toán đơn hàng
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button onClick={() => setResult(null)}>Đóng</button>
            </div>
          </div>
        )}

        <div className="quotation-content">
          <div className="info-row">
            <div className="info-item">
              <label>Khách hàng:</label>
              <span>{`${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim() || "—"}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{customer.email || "—"}</span>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>Thương hiệu:</label>
              <span>{brandName}</span>
            </div>
            <div className="info-item">
              <label>Dòng xe:</label>
              <span>{variantName}</span>
            </div>
            <div className="info-item">
              <label>Màu sắc:</label>
              <span>{colorName}</span>
            </div>
          </div>

          <div className="price-section">
            <div className="price-row">
              <span>Tổng giá:</span>
              <strong>{formatPrice(quotation.totalPrice)}</strong>
            </div>
            {quotation.discountAmount > 0 && (
              <div className="price-row discount">
                <span>Giảm giá:</span>
                <strong>-{formatPrice(quotation.discountAmount)}</strong>
              </div>
            )}
            <div className="price-row final">
              <span>Giá cuối cùng:</span>
              <strong>{formatPrice(quotation.finalPrice || quotation.totalPrice)}</strong>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <label>Ngày tạo:</label>
              <span>{formatDate(quotation.quotationDate || quotation.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Ngày hết hạn:</label>
              <span className={isExpired ? "expired" : ""}>{formatDate(quotation.expiryDate)}</span>
            </div>
            <div className="info-item">
              <label>Trạng thái:</label>
              <span className={`status ${status}`}>
                {status === "sent" ? "Đã gửi" : 
                 status === "accepted" ? "Đã chấp nhận" :
                 status === "converted" ? "Đã chuyển đổi" :
                 status === "rejected" ? "Đã từ chối" :
                 status === "expired" ? "Hết hạn" :
                 "Chờ xử lý"}
              </span>
            </div>
          </div>

          {quotation.notes && (
            <div className="notes">
              <label>Ghi chú:</label>
              <p>{quotation.notes}</p>
            </div>
          )}

          {!result && (
            <>
              {canAccept && !isExpired && (
                <div className="accept-form">
                  <label>
                    Điều kiện chấp nhận <span className="required">*</span>
                  </label>
                  <textarea
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="Ví dụ: Đồng ý với điều khoản và điều kiện..."
                    rows="3"
                  />
                  <button
                    className="btn-accept"
                    onClick={handleAccept}
                    disabled={accepting || !conditions.trim()}
                  >
                    {accepting ? (
                      <>
                        <FaSpinner className="spinner" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FaCheck /> Chấp nhận báo giá
                      </>
                    )}
                  </button>
                </div>
              )}

              {isAccepted && (
                <div className="success-message">
                  <FaCheck /> Báo giá đã được chấp nhận. Đơn hàng đã được xác nhận.
                </div>
              )}

              {isExpired && (
                <div className="warning-message">
                  ⚠️ Báo giá đã hết hạn.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

