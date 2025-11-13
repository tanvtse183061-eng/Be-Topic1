import './DealerOrder.css';
import { FaSearch, FaEye, FaMoneyBillWave, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dealerPaymentAPI, dealerInvoiceAPI, dealerAPI } from "../../services/API";

export default function DealerPayment() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentRole = localStorage.getItem("role") || "";
  const isDealerManager = currentRole === "DEALER_MANAGER" || currentRole === "MANAGER";
  const isEVMStaff = currentRole === "EVM_STAFF";
  const isAdmin = currentRole === "ADMIN";
  const [currentDealerId, setCurrentDealerId] = useState("");

  // Form data - Bước 6: Thanh toán
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "BANK_TRANSFER",
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: "",
    notes: ""
  });

  // Lấy danh sách thanh toán
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await dealerPaymentAPI.getPayments();
      console.log("📦 Raw response từ getPayments:", res);
      const paymentsData = res.data?.data || res.data || [];
      console.log("📦 Payments data:", paymentsData);
      
      // Nếu là DEALER_MANAGER, chỉ lấy thanh toán của đại lý mình
      if (isDealerManager && currentDealerId) {
        const filtered = paymentsData.filter(p => 
          String(p.dealer?.dealerId || p.dealerId || "") === String(currentDealerId)
        );
        setPayments(Array.isArray(filtered) ? filtered : []);
      } else {
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy thanh toán:", err);
      alert("Không thể tải danh sách thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách hóa đơn chưa thanh toán đủ (để thanh toán)
  const fetchUnpaidInvoices = async () => {
    try {
      const res = await dealerInvoiceAPI.getInvoices();
      const invoicesData = res.data?.data || res.data || [];
      // Chỉ lấy hóa đơn chưa thanh toán đủ (ISSUED, PARTIALLY_PAID)
      const unpaidInvoices = Array.isArray(invoicesData) 
        ? invoicesData.filter(inv => 
            (inv.status === "ISSUED" || inv.status === "PARTIALLY_PAID") &&
            (inv.remainingAmount > 0 || inv.balanceAmount > 0 || !inv.paidAmount || inv.paidAmount < inv.totalAmount)
          )
        : [];
      
      // Nếu là DEALER_MANAGER, chỉ lấy hóa đơn của đại lý mình
      if (isDealerManager && currentDealerId) {
        const filtered = unpaidInvoices.filter(inv => 
          String(inv.dealer?.dealerId || inv.dealerId || "") === String(currentDealerId)
        );
        setInvoices(filtered);
      } else {
        setInvoices(unpaidInvoices);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy hóa đơn:", err);
      setInvoices([]);
    }
  };

  useEffect(() => {
    // Lấy dealerId từ user info nếu là DEALER_MANAGER
    if (isDealerManager) {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const dealerId = userInfo.dealerId || "";
      setCurrentDealerId(dealerId);
    }
    fetchPayments();
    fetchUnpaidInvoices();
  }, []);

  // Fetch lại data khi mở popup
  useEffect(() => {
    if (showPopup) {
      fetchUnpaidInvoices();
    }
  }, [showPopup]);

  // Bước 6: Thanh toán (DEALER_MANAGER, EVM_STAFF, ADMIN)
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.invoiceId) {
      setError("Vui lòng chọn hóa đơn!");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Vui lòng nhập số tiền thanh toán!");
      return;
    }
    if (!formData.paymentDate) {
      setError("Vui lòng chọn ngày thanh toán!");
      return;
    }

    try {
      // Chuẩn bị payload theo API
      const payload = {
        invoiceId: String(formData.invoiceId).trim(),
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod || "BANK_TRANSFER",
        paymentDate: formData.paymentDate,
        referenceNumber: formData.referenceNumber || null,
        notes: formData.notes || null
      };

      // Xóa các field null
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === "" || payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log("📤 Payload thanh toán:", payload);

      const res = await dealerPaymentAPI.processPayment(payload);
      console.log("✅ Response từ processPayment:", res);
      
      alert("Thanh toán thành công! Hệ thống sẽ tự động tạo VehicleDelivery nếu thanh toán đủ.");
      setShowPopup(false);
      
      // Reset form
      setFormData({
        invoiceId: "",
        amount: "",
        paymentMethod: "BANK_TRANSFER",
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNumber: "",
        notes: ""
      });
      
      // Fetch lại danh sách
      setTimeout(() => {
        fetchPayments();
        fetchUnpaidInvoices();
      }, 500);
    } catch (err) {
      console.error("Lỗi khi thanh toán:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể thanh toán!";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // Helper functions
  const getDealerName = (payment) => {
    if (payment.dealer) {
      return payment.dealer.dealerName || payment.dealer.name || "—";
    }
    if (payment.invoice?.dealer) {
      return payment.invoice.dealer.dealerName || payment.invoice.dealer.name || "—";
    }
    return "—";
  };

  const getInvoiceNumber = (payment) => {
    if (payment.invoice) {
      return payment.invoice.invoiceNumber || "—";
    }
    return "—";
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: "badge-warning",
      COMPLETED: "badge-success",
      FAILED: "badge-danger",
      CANCELLED: "badge-secondary"
    };
    return statusMap[status] || "badge-secondary";
  };

  // Tìm kiếm
  const filteredPayments = (payments || []).filter((p) => {
    if (!p) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (p.paymentNumber && String(p.paymentNumber).toLowerCase().includes(keyword)) ||
      (p.status && String(p.status).toLowerCase().includes(keyword)) ||
      (p.invoice?.invoiceNumber && String(p.invoice.invoiceNumber).toLowerCase().includes(keyword)) ||
      (p.referenceNumber && String(p.referenceNumber).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (paymentId) => {
    try {
      const res = await dealerPaymentAPI.getPayment(paymentId);
      setSelectedPayment(res.data);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết thanh toán:", err);
      alert("Không thể tải chi tiết thanh toán!");
    }
  };

  // Khi chọn hóa đơn, tự động điền số tiền còn lại
  const handleInvoiceChange = (invoiceId) => {
    const invoice = invoices.find(inv => (inv.invoiceId || inv.id) === invoiceId);
    if (invoice) {
      const remaining = invoice.remainingAmount || invoice.balanceAmount || 
        (invoice.totalAmount - (invoice.paidAmount || 0));
      setFormData(prev => ({
        ...prev,
        invoiceId: invoiceId,
        amount: remaining > 0 ? remaining.toString() : ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        invoiceId: invoiceId,
        amount: ""
      }));
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý thanh toán đại lý</div>

      <div className="title2-customer">
        <h2>Danh sách thanh toán đại lý</h2>
        {(isDealerManager || isEVMStaff || isAdmin) && (
          <h3 onClick={() => setShowPopup(true)}>+ Thanh toán</h3>
        )}
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm thanh toán..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ THANH TOÁN</th>
              <th>ĐẠI LÝ</th>
              <th>SỐ HÓA ĐƠN</th>
              <th>SỐ TIỀN</th>
              <th>PHƯƠNG THỨC</th>
              <th>NGÀY THANH TOÁN</th>
              <th>MÃ THAM CHIẾU</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "#666" }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((p, index) => {
                const paymentId = p.dealerPaymentId || p.id || `payment-${index}`;
                return (
                  <tr key={paymentId}>
                    <td>{p.paymentNumber || "—"}</td>
                    <td>{getDealerName(p)}</td>
                    <td>{getInvoiceNumber(p)}</td>
                    <td>{formatPrice(p.amount)}</td>
                    <td>{p.paymentMethod || "—"}</td>
                    <td>{formatDate(p.paymentDate)}</td>
                    <td>{p.referenceNumber || "—"}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(p.status)}`}>
                        {p.status || "—"}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(paymentId)}>
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu thanh toán
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thanh toán - Bước 6 */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>Thanh toán hóa đơn (Bước 6)</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleProcessPayment}>
              <div style={{ marginBottom: "15px" }}>
                <label>Hóa đơn *</label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  required
                >
                  <option value="">-- Chọn hóa đơn --</option>
                  {invoices.map((inv) => {
                    const remaining = inv.remainingAmount || inv.balanceAmount || 
                      (inv.totalAmount - (inv.paidAmount || 0));
                    return (
                      <option key={inv.invoiceId || inv.id} value={inv.invoiceId || inv.id}>
                        {inv.invoiceNumber} - {formatPrice(inv.totalAmount)} - Còn lại: {formatPrice(remaining)}
                      </option>
                    );
                  })}
                </select>
                {invoices.length === 0 && (
                  <small style={{ color: "red" }}>Không có hóa đơn nào chưa thanh toán đủ</small>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Số tiền thanh toán (VND) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="Nhập số tiền..."
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Phương thức thanh toán *</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  required
                >
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                  <option value="CASH">Tiền mặt</option>
                  <option value="CREDIT_CARD">Thẻ tín dụng</option>
                  <option value="CHEQUE">Séc</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ngày thanh toán *</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Mã tham chiếu</label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="Ví dụ: TXN-123456789"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Ghi chú thanh toán..."
                />
              </div>

              <div className="form-actions">
                <button type="submit">Thanh toán</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedPayment && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết thanh toán</h2>
            <div className="detail-content">
              <p><b>Số thanh toán:</b> {selectedPayment.paymentNumber || "—"}</p>
              <p><b>Đại lý:</b> {getDealerName(selectedPayment)}</p>
              <p><b>Số hóa đơn:</b> {getInvoiceNumber(selectedPayment)}</p>
              <p><b>Số tiền:</b> {formatPrice(selectedPayment.amount)}</p>
              <p><b>Phương thức:</b> {selectedPayment.paymentMethod || "—"}</p>
              <p><b>Ngày thanh toán:</b> {formatDate(selectedPayment.paymentDate)}</p>
              <p><b>Mã tham chiếu:</b> {selectedPayment.referenceNumber || "—"}</p>
              <p><b>Trạng thái:</b> {selectedPayment.status || "—"}</p>
              {selectedPayment.notes && (
                <p><b>Ghi chú:</b> {selectedPayment.notes}</p>
              )}
              {selectedPayment.isFullyPaid !== undefined && (
                <p><b>Đã thanh toán đủ:</b> {selectedPayment.isFullyPaid ? "Có" : "Chưa"}</p>
              )}
              {selectedPayment.remainingBalance !== undefined && (
                <p><b>Số dư còn lại:</b> {formatPrice(selectedPayment.remainingBalance)}</p>
              )}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

