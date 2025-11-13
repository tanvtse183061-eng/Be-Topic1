import './DealerOrder.css';
import { FaSearch, FaEye, FaFileInvoice } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dealerInvoiceAPI, dealerQuotationAPI, dealerAPI } from "../../services/API";

export default function DealerInvoice() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentRole = localStorage.getItem("role") || "";
  const isDealerManager = currentRole === "DEALER_MANAGER" || currentRole === "MANAGER";
  const isEVMStaff = currentRole === "EVM_STAFF";
  const isAdmin = currentRole === "ADMIN";
  const [currentDealerId, setCurrentDealerId] = useState("");

  // Lấy danh sách hóa đơn
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await dealerInvoiceAPI.getInvoices();
      console.log("📦 Raw response từ getInvoices:", res);
      console.log("📦 res.data:", res.data);
      console.log("📦 res.data?.data:", res.data?.data);
      
      // Xử lý response structure
      let invoicesData = [];
      if (Array.isArray(res.data)) {
        invoicesData = res.data;
      } else if (Array.isArray(res.data?.data)) {
        invoicesData = res.data.data;
      } else if (res.data?.content && Array.isArray(res.data.content)) {
        invoicesData = res.data.content;
      } else if (res.data?.invoices && Array.isArray(res.data.invoices)) {
        invoicesData = res.data.invoices;
      }
      
      console.log("📦 Invoices data sau khi parse:", invoicesData);
      console.log("📦 Số lượng invoices:", invoicesData.length);
      console.log("🔑 isDealerManager:", isDealerManager);
      console.log("🔑 currentDealerId:", currentDealerId);
      
      // Nếu là DEALER_MANAGER và có dealerId, chỉ lấy hóa đơn của đại lý mình
      // Nếu không có dealerId hoặc là ADMIN/EVM_STAFF, hiển thị tất cả
      if (isDealerManager && currentDealerId) {
        console.log("🔍 Filtering cho dealerId:", currentDealerId);
        const filtered = invoicesData.filter(inv => {
          const invDealerId = inv.dealer?.dealerId || inv.dealerId || inv.dealerOrder?.dealer?.dealerId || inv.dealerOrder?.dealerId || "";
          const match = String(invDealerId) === String(currentDealerId);
          console.log("  Invoice:", inv.invoiceNumber, "dealerId:", invDealerId, "match:", match);
          return match;
        });
        console.log("📦 Filtered invoices:", filtered.length);
        setInvoices(Array.isArray(filtered) ? filtered : []);
      } else {
        console.log("📦 Setting all invoices (not filtering) - isDealerManager:", isDealerManager, "currentDealerId:", currentDealerId);
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy hóa đơn:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("Không thể tải danh sách hóa đơn: " + (err.response?.data?.message || err.message));
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Lấy dealerId từ user info nếu là DEALER_MANAGER
    if (isDealerManager) {
      // Thử nhiều cách để lấy dealerId
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const dealerId = userInfo.dealerId || userInfo.dealer?.dealerId || "";
      console.log("🔑 DealerId từ userInfo:", dealerId);
      setCurrentDealerId(dealerId);
    }
  }, [isDealerManager]);

  useEffect(() => {
    fetchInvoices();
  }, [currentDealerId]);

  // Helper functions
  const getDealerName = (invoice) => {
    if (invoice.dealer) {
      return invoice.dealer.dealerName || invoice.dealer.name || "—";
    }
    if (invoice.dealerOrder?.dealer) {
      return invoice.dealerOrder.dealer.dealerName || invoice.dealerOrder.dealer.name || "—";
    }
    return "—";
  };

  const getQuotationNumber = (invoice) => {
    if (invoice.quotation) {
      return invoice.quotation.quotationNumber || "—";
    }
    return "—";
  };

  const getOrderNumber = (invoice) => {
    if (invoice.dealerOrder) {
      return invoice.dealerOrder.dealerOrderNumber || "—";
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
      ISSUED: "badge-info",
      PARTIALLY_PAID: "badge-warning",
      PAID: "badge-success",
      OVERDUE: "badge-danger",
      CANCELLED: "badge-secondary"
    };
    return statusMap[status] || "badge-secondary";
  };

  // Tìm kiếm
  const filteredInvoices = (invoices || []).filter((inv) => {
    if (!inv) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (inv.invoiceNumber && String(inv.invoiceNumber).toLowerCase().includes(keyword)) ||
      (inv.status && String(inv.status).toLowerCase().includes(keyword)) ||
      (inv.dealer?.dealerName && String(inv.dealer.dealerName).toLowerCase().includes(keyword)) ||
      (inv.quotation?.quotationNumber && String(inv.quotation.quotationNumber).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (invoiceId) => {
    try {
      const res = await dealerInvoiceAPI.getInvoice(invoiceId);
      setSelectedInvoice(res.data);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết hóa đơn:", err);
      alert("Không thể tải chi tiết hóa đơn!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý hóa đơn đại lý</div>

      <div className="title2-customer">
        <h2>Danh sách hóa đơn đại lý</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaFileInvoice style={{ fontSize: "20px", color: "#5b4bdf" }} />
          <small style={{ color: "#666" }}>Hóa đơn được tạo tự động sau khi chấp nhận báo giá</small>
        </div>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm hóa đơn..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ HÓA ĐƠN</th>
              <th>ĐẠI LÝ</th>
              <th>SỐ BÁO GIÁ</th>
              <th>SỐ ĐƠN HÀNG</th>
              <th>TỔNG TIỀN</th>
              <th>ĐÃ THANH TOÁN</th>
              <th>CÒN LẠI</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY TẠO</th>
              <th>HẠN THANH TOÁN</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" style={{ textAlign: "center", color: "#666" }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv, index) => {
                const invoiceId = inv.invoiceId || inv.id || `invoice-${index}`;
                return (
                  <tr key={invoiceId}>
                    <td>{inv.invoiceNumber || "—"}</td>
                    <td>{getDealerName(inv)}</td>
                    <td>{getQuotationNumber(inv)}</td>
                    <td>{getOrderNumber(inv)}</td>
                    <td>{formatPrice(inv.totalAmount)}</td>
                    <td>{formatPrice(inv.paidAmount || 0)}</td>
                    <td>{formatPrice(inv.remainingAmount || inv.balanceAmount || 0)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(inv.status)}`}>
                        {inv.status || "—"}
                      </span>
                    </td>
                    <td>{formatDate(inv.invoiceDate || inv.createdAt || inv.createdDate || inv.issueDate || inv.date)}</td>
                    <td>{formatDate(inv.dueDate || inv.dueDate)}</td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(invoiceId)}>
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu hóa đơn
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup xem chi tiết */}
      {showDetail && selectedInvoice && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết hóa đơn đại lý</h2>
            <div className="detail-content">
              <p><b>Số hóa đơn:</b> {selectedInvoice.invoiceNumber || "—"}</p>
              <p><b>Đại lý:</b> {getDealerName(selectedInvoice)}</p>
              <p><b>Số báo giá:</b> {getQuotationNumber(selectedInvoice)}</p>
              <p><b>Số đơn hàng:</b> {getOrderNumber(selectedInvoice)}</p>
              <p><b>Tổng tiền:</b> {formatPrice(selectedInvoice.totalAmount)}</p>
              <p><b>Đã thanh toán:</b> {formatPrice(selectedInvoice.paidAmount || 0)}</p>
              <p><b>Còn lại:</b> {formatPrice(selectedInvoice.remainingAmount || selectedInvoice.balanceAmount || 0)}</p>
              <p><b>Trạng thái:</b> {selectedInvoice.status || "—"}</p>
              <p><b>Ngày tạo:</b> {formatDate(selectedInvoice.invoiceDate || selectedInvoice.createdAt || selectedInvoice.createdDate || selectedInvoice.issueDate || selectedInvoice.date)}</p>
              <p><b>Hạn thanh toán:</b> {formatDate(selectedInvoice.dueDate)}</p>
              {selectedInvoice.paymentTerms && (
                <p><b>Điều khoản thanh toán:</b> {selectedInvoice.paymentTerms}</p>
              )}
              {selectedInvoice.notes && (
                <p><b>Ghi chú:</b> {selectedInvoice.notes}</p>
              )}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

