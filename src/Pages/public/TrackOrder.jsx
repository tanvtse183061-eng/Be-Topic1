import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch, FaSpinner, FaExclamationCircle, FaCheckCircle, FaClock, FaTruck, FaDollarSign, FaFileAlt, FaCar, FaUser } from "react-icons/fa";
// API công khai - không cần đăng nhập (dùng cho khách hàng)
import { publicOrderAPI, publicQuotationAPI, publicVehicleAPI } from "../../services/API";
import { getVariantImageUrl } from "../../utils/imageUtils";
import MainLayout from "../../layouts/MainLayout";
import "./TrackOrder.css";

export default function TrackOrder() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [searchOrderNumber, setSearchOrderNumber] = useState(orderNumber || "");
  const [order, setOrder] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(!!orderNumber);

  useEffect(() => {
    if (orderNumber) {
      searchOrder();
    }
  }, [orderNumber]);

  const searchOrder = async () => {
    if (!searchOrderNumber.trim()) {
      setError("Vui lòng nhập mã đơn hàng.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      // Try to get order by number
      const res = await publicOrderAPI.getOrderByNumber(searchOrderNumber.trim());
      const orderData = res.data;
      setOrder(orderData);

      // Load quotation if exists
      if (orderData.quotationId) {
        try {
          const quotationRes = await publicQuotationAPI.getQuotation(orderData.quotationId);
          setQuotation(quotationRes.data);
        } catch (err) {
          console.error("Không thể tải quotation:", err);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tìm đơn hàng:", err);
      setError(err.response?.data?.message || "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.");
      setOrder(null);
      setQuotation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchOrder();
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: "Chờ xử lý", step: 1, icon: <FaClock />, color: "#d97706" },
      quoted: { label: "Đã báo giá", step: 2, icon: <FaFileAlt />, color: "#2563eb" },
      confirmed: { label: "Đã xác nhận", step: 3, icon: <FaCheckCircle />, color: "#059669" },
      paid: { label: "Đã thanh toán", step: 4, icon: <FaDollarSign />, color: "#059669" },
      delivered: { label: "Đã giao hàng", step: 5, icon: <FaTruck />, color: "#059669" },
      completed: { label: "Hoàn thành", step: 6, icon: <FaCheckCircle />, color: "#059669" },
      rejected: { label: "Đã từ chối", step: 0, icon: <FaTimesCircle />, color: "#dc2626" },
      cancelled: { label: "Đã hủy", step: 0, icon: <FaTimesCircle />, color: "#6b7280" }
    };
    return statusMap[status?.toLowerCase()] || { label: status, step: 0, icon: null, color: "#6b7280" };
  };

  const getStatusSteps = () => {
    const steps = [
      { key: "pending", label: "Chờ xử lý", icon: <FaClock /> },
      { key: "quoted", label: "Đã báo giá", icon: <FaFileAlt /> },
      { key: "confirmed", label: "Đã xác nhận", icon: <FaCheckCircle /> },
      { key: "paid", label: "Đã thanh toán", icon: <FaDollarSign /> },
      { key: "delivered", label: "Đã giao hàng", icon: <FaTruck /> },
      { key: "completed", label: "Hoàn thành", icon: <FaCheckCircle /> }
    ];
    return steps;
  };

  const getCurrentStep = () => {
    if (!order) return 0;
    const statusInfo = getStatusInfo(order.status);
    return statusInfo.step;
  };

  const canPay = () => {
    return order?.status?.toLowerCase() === "confirmed" && order?.totalAmount > 0;
  };

  return (
    <MainLayout>
      <div className="track-order-container">
        <div className="track-header">
          <h1>
            <FaSearch /> Theo dõi đơn hàng
          </h1>
          <p>Nhập mã đơn hàng để xem thông tin chi tiết</p>
        </div>

        {/* Search Form */}
        <div className="section search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                placeholder="Nhập mã đơn hàng (ví dụ: ORD-20251113-793996)"
                className="search-input"
              />
            </div>
            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? <FaSpinner className="spinner-small" /> : "Tìm kiếm"}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && hasSearched && (
          <div className="section error-section">
            <FaExclamationCircle className="error-icon" />
            <h3>Không tìm thấy đơn hàng</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="section loading-section">
            <FaSpinner className="spinner" />
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        )}

        {/* Order Details */}
        {order && !loading && (
          <>
            {/* Status Timeline */}
            <div className="section status-section">
              <h2>Trạng thái đơn hàng</h2>
              <div className="status-timeline">
                {getStatusSteps().map((step, index) => {
                  const currentStep = getCurrentStep();
                  const isActive = index + 1 <= currentStep;
                  const isCurrent = index + 1 === currentStep;
                  
                  return (
                    <div key={step.key} className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-icon">{step.icon}</div>
                      <div className="step-label">{step.label}</div>
                      {index < getStatusSteps().length - 1 && <div className="step-line" />}
                    </div>
                  );
                })}
              </div>
              <div className="current-status">
                <span className="status-badge" style={{ backgroundColor: getStatusInfo(order.status).color + "20", color: getStatusInfo(order.status).color }}>
                  {getStatusInfo(order.status).icon}
                  {getStatusInfo(order.status).label}
                </span>
              </div>
            </div>

            {/* Order Information */}
            <div className="section order-info-section">
              <h2>
                <FaFileAlt /> Thông tin đơn hàng
              </h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Mã đơn hàng:</span>
                  <span className="value">{order.orderNumber}</span>
                </div>
                <div className="info-item">
                  <span className="label">Ngày đặt hàng:</span>
                  <span className="value">{formatDate(order.orderDate)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tổng tiền:</span>
                  <span className="value">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Đã đặt cọc:</span>
                  <span className="value">{formatPrice(order.depositAmount || 0)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Còn lại:</span>
                  <span className="value">{formatPrice((order.totalAmount || 0) - (order.depositAmount || 0))}</span>
                </div>
                <div className="info-item">
                  <span className="label">Trạng thái thanh toán:</span>
                  <span className="value">{order.paymentStatus || "PENDING"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Trạng thái giao hàng:</span>
                  <span className="value">{order.deliveryStatus || "PENDING"}</span>
                </div>
                {order.notes && (
                  <div className="info-item full-width">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            {order.customer && (
              <div className="section customer-section">
                <h2>
                  <FaUser /> Thông tin khách hàng
                </h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Họ tên:</span>
                    <span className="value">
                      {order.customer.firstName} {order.customer.lastName}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span className="value">{order.customer.email || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Điện thoại:</span>
                    <span className="value">{order.customer.phone || "—"}</span>
                  </div>
                  {order.customer.address && (
                    <div className="info-item full-width">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">{order.customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Information */}
            {order.inventory && (
              <div className="section vehicle-section">
                <h2>
                  <FaCar /> Thông tin xe
                </h2>
                <div className="vehicle-info">
                  {order.inventory.variant && (
                    <div className="info-item">
                      <span className="label">Dòng xe:</span>
                      <span className="value">
                        {order.inventory.variant.variantName || order.inventory.variant.name}
                      </span>
                    </div>
                  )}
                  {order.inventory.color && (
                    <div className="info-item">
                      <span className="label">Màu sắc:</span>
                      <span className="value">
                        {order.inventory.color.colorName || order.inventory.color.name}
                      </span>
                    </div>
                  )}
                  {order.inventory.vin && (
                    <div className="info-item">
                      <span className="label">Số VIN:</span>
                      <span className="value">{order.inventory.vin}</span>
                    </div>
                  )}
                  {order.inventory.variantId && (
                    <div className="vehicle-image">
                      <img
                        src={getVariantImageUrl(order.inventory.variantId)}
                        alt={order.inventory.variant?.variantName || "Xe"}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quotation Information */}
            {quotation && (
              <div className="section quotation-section">
                <h2>
                  <FaFileAlt /> Báo giá
                </h2>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Số báo giá:</span>
                    <span className="value">{quotation.quotationNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Giá gốc:</span>
                    <span className="value">{formatPrice(quotation.totalPrice)}</span>
                  </div>
                  {quotation.discountAmount > 0 && (
                    <div className="info-item">
                      <span className="label">Giảm giá:</span>
                      <span className="value">-{formatPrice(quotation.discountAmount)}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="label">Giá cuối:</span>
                    <span className="value">{formatPrice(quotation.finalPrice || quotation.totalPrice)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Ngày báo giá:</span>
                    <span className="value">{formatDate(quotation.quotationDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Hết hạn:</span>
                    <span className="value">{formatDate(quotation.expiryDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Trạng thái:</span>
                    <span className="value">{quotation.status}</span>
                  </div>
                  {quotation.quotationId && (
                    <div className="info-item full-width">
                      <a
                        href={`/quotation/${quotation.quotationId}`}
                        className="link-quotation"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem chi tiết báo giá
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment History */}
            {order.payments && order.payments.length > 0 && (
              <div className="section payment-section">
                <h2>
                  <FaDollarSign /> Lịch sử thanh toán
                </h2>
                <div className="payment-list">
                  {order.payments.map((payment) => (
                    <div key={payment.paymentId || payment.id} className="payment-item">
                      <div className="payment-row">
                        <span className="label">Mã thanh toán:</span>
                        <span className="value">{payment.paymentNumber || payment.paymentId}</span>
                      </div>
                      <div className="payment-row">
                        <span className="label">Số tiền:</span>
                        <span className="value">{formatPrice(payment.amount)}</span>
                      </div>
                      <div className="payment-row">
                        <span className="label">Phương thức:</span>
                        <span className="value">{payment.paymentMethod || "—"}</span>
                      </div>
                      <div className="payment-row">
                        <span className="label">Trạng thái:</span>
                        <span className={`status-badge status-${payment.status?.toLowerCase()}`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="payment-row">
                        <span className="label">Ngày thanh toán:</span>
                        <span className="value">{formatDate(payment.paymentDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="section actions-section">
              {canPay() && (
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/payment/${order.orderId || order.id}`)}
                >
                  <FaDollarSign />
                  Thanh toán ngay
                </button>
              )}
              {quotation && quotation.status?.toLowerCase() === "sent" && (
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/quotation/${quotation.quotationId || order.quotationId}`)}
                >
                  <FaFileAlt />
                  Xem báo giá
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

