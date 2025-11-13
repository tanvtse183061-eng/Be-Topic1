import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSpinner, FaExclamationCircle, FaCheckCircle, FaDollarSign, FaCreditCard, FaReceipt, FaCar } from "react-icons/fa";
// API công khai - không cần đăng nhập (dùng cho khách hàng)
import { publicOrderAPI, publicPaymentAPI, publicVehicleAPI } from "../../services/API";
import { getVariantImageUrl } from "../../utils/imageUtils";
import MainLayout from "../../layouts/MainLayout";
import "./Payment.css";

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState("full"); // full, deposit, installment
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [notes, setNotes] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [installmentMonths, setInstallmentMonths] = useState(12);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await publicOrderAPI.getOrder(orderId);
      setOrder(res.data);
      // Load payment history if available
      if (res.data?.payments) {
        setPaymentHistory(res.data.payments);
      }
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      setError(err.response?.data?.message || "Không thể tải thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (paymentType === "deposit" && !depositAmount) {
      setError("Vui lòng nhập số tiền đặt cọc.");
      return;
    }

    if (paymentType === "installment" && (!installmentMonths || installmentMonths < 1)) {
      setError("Vui lòng nhập số tháng trả góp hợp lệ.");
      return;
    }

    setSubmitting(true);
    try {
      let paymentData = {
        orderId: orderId,
        paymentMethod: paymentMethod,
        notes: notes || undefined
      };

      if (paymentType === "deposit") {
        paymentData.amount = parseFloat(depositAmount);
        const res = await publicPaymentAPI.createDeposit(paymentData);
        alert("Đặt cọc thành công! Mã thanh toán: " + (res.data?.paymentId || res.data?.paymentNumber || "N/A"));
      } else if (paymentType === "installment") {
        paymentData.installmentMonths = parseInt(installmentMonths);
        const res = await publicPaymentAPI.createInstallmentPayment(paymentData);
        alert("Thanh toán trả góp thành công! Mã thanh toán: " + (res.data?.paymentId || res.data?.paymentNumber || "N/A"));
      } else {
        // Full payment
        const res = await publicPaymentAPI.createFullPayment(paymentData);
        alert("Thanh toán thành công! Mã thanh toán: " + (res.data?.paymentId || res.data?.paymentNumber || "N/A"));
      }

      // Redirect to track order page
      setTimeout(() => {
        navigate(`/order/track/${order?.orderNumber || orderId}`);
      }, 1500);
    } catch (err) {
      console.error("Lỗi khi thanh toán:", err);
      setError(err.response?.data?.message || "Không thể thực hiện thanh toán. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
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

  const getPaymentMethodLabel = (method) => {
    const methods = {
      bank_transfer: "Chuyển khoản ngân hàng",
      cash: "Tiền mặt",
      credit_card: "Thẻ tín dụng",
      debit_card: "Thẻ ghi nợ"
    };
    return methods[method] || method;
  };

  const getPaymentStatusLabel = (status) => {
    const statusMap = {
      pending: "Chờ xác nhận",
      completed: "Đã hoàn thành",
      failed: "Thất bại",
      refunded: "Đã hoàn tiền"
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const getTotalPaid = () => {
    return paymentHistory
      .filter(p => p.status?.toLowerCase() === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getRemainingAmount = () => {
    if (!order?.totalAmount) return 0;
    return order.totalAmount - getTotalPaid();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="payment-container">
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && !order) {
    return (
      <MainLayout>
        <div className="payment-container">
          <div className="error-container">
            <FaExclamationCircle className="error-icon" />
            <h2>Không tìm thấy đơn hàng</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/order/track")} className="btn-primary">
              Theo dõi đơn hàng
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return null;
  }

  const totalPaid = getTotalPaid();
  const remainingAmount = getRemainingAmount();
  const canPayFull = remainingAmount > 0 && order.status?.toLowerCase() === "confirmed";

  return (
    <MainLayout>
      <div className="payment-container">
        <div className="payment-header">
          <h1>
            <FaDollarSign /> Thanh toán đơn hàng
          </h1>
          <div className="order-info">
            <span className="label">Mã đơn hàng:</span>
            <span className="value">{order.orderNumber || orderId}</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="section order-summary">
          <h2>
            <FaReceipt /> Thông tin đơn hàng
          </h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Tổng tiền:</span>
              <span className="value">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Đã thanh toán:</span>
              <span className="value paid">{formatPrice(totalPaid)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Còn lại:</span>
              <span className="value remaining">{formatPrice(remainingAmount)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Trạng thái:</span>
              <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Vehicle Info */}
          {order.inventory && (
            <div className="vehicle-info-section">
              <h3>
                <FaCar /> Thông tin xe
              </h3>
              <div className="vehicle-details">
                {order.inventory.variant && (
                  <div className="detail-item">
                    <span className="label">Dòng xe:</span>
                    <span className="value">{order.inventory.variant.variantName || order.inventory.variant.name}</span>
                  </div>
                )}
                {order.inventory.color && (
                  <div className="detail-item">
                    <span className="label">Màu sắc:</span>
                    <span className="value">{order.inventory.color.colorName || order.inventory.color.name}</span>
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
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className="section payment-history">
            <h2>Lịch sử thanh toán</h2>
            <div className="history-list">
              {paymentHistory.map((payment) => (
                <div key={payment.paymentId || payment.id} className="history-item">
                  <div className="history-info">
                    <div className="history-row">
                      <span className="label">Mã thanh toán:</span>
                      <span className="value">{payment.paymentNumber || payment.paymentId}</span>
                    </div>
                    <div className="history-row">
                      <span className="label">Số tiền:</span>
                      <span className="value">{formatPrice(payment.amount)}</span>
                    </div>
                    <div className="history-row">
                      <span className="label">Phương thức:</span>
                      <span className="value">{getPaymentMethodLabel(payment.paymentMethod)}</span>
                    </div>
                    <div className="history-row">
                      <span className="label">Trạng thái:</span>
                      <span className={`status-badge status-${payment.status?.toLowerCase()}`}>
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </div>
                    <div className="history-row">
                      <span className="label">Ngày thanh toán:</span>
                      <span className="value">{formatDate(payment.paymentDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Form */}
        {canPayFull && (
          <div className="section payment-form-section">
            <h2>
              <FaCreditCard /> Thông tin thanh toán
            </h2>
            {error && (
              <div className="error-message">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="payment-form">
              {/* Payment Type */}
              <div className="form-group">
                <label>Loại thanh toán *</label>
                <div className="payment-type-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="full"
                      checked={paymentType === "full"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    <span>Thanh toán toàn bộ ({formatPrice(remainingAmount)})</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="deposit"
                      checked={paymentType === "deposit"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    <span>Đặt cọc</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="installment"
                      checked={paymentType === "installment"}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    <span>Trả góp</span>
                  </label>
                </div>
              </div>

              {/* Deposit Amount */}
              {paymentType === "deposit" && (
                <div className="form-group">
                  <label>Số tiền đặt cọc *</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Nhập số tiền đặt cọc"
                    min="0"
                    max={remainingAmount}
                    required
                  />
                  <small>Tối đa: {formatPrice(remainingAmount)}</small>
                </div>
              )}

              {/* Installment Months */}
              {paymentType === "installment" && (
                <div className="form-group">
                  <label>Số tháng trả góp *</label>
                  <input
                    type="number"
                    value={installmentMonths}
                    onChange={(e) => setInstallmentMonths(e.target.value)}
                    placeholder="Nhập số tháng"
                    min="1"
                    max="60"
                    required
                  />
                  <small>Số tiền mỗi tháng: {formatPrice(remainingAmount / installmentMonths)}</small>
                </div>
              )}

              {/* Payment Method */}
              <div className="form-group">
                <label>Phương thức thanh toán *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="credit_card">Thẻ tín dụng</option>
                  <option value="debit_card">Thẻ ghi nợ</option>
                </select>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú thêm (nếu có)"
                  rows="3"
                />
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-small" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Xác nhận thanh toán
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/order/track/${order.orderNumber || orderId}`)}
                  disabled={submitting}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {!canPayFull && (
          <div className="section info-message">
            {remainingAmount <= 0 ? (
              <div className="success-message">
                <FaCheckCircle />
                <span>Đơn hàng đã được thanh toán đầy đủ.</span>
              </div>
            ) : (
              <div className="warning-message">
                <FaExclamationCircle />
                <span>Đơn hàng chưa sẵn sàng để thanh toán. Vui lòng chờ xác nhận từ nhân viên.</span>
              </div>
            )}
            <button
              className="btn-primary"
              onClick={() => navigate(`/order/track/${order.orderNumber || orderId}`)}
            >
              Xem chi tiết đơn hàng
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

