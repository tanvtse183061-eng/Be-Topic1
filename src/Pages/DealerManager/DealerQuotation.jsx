import './DealerOrder.css';
import { FaSearch, FaEye, FaCheck, FaTimes, FaPaperPlane } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dealerQuotationAPI, dealerOrderAPI, dealerAPI, publicVehicleAPI } from "../../services/API";

export default function DealerQuotation() {
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentRole = localStorage.getItem("role") || "";
  const isDealerManager = currentRole === "DEALER_MANAGER" || currentRole === "MANAGER";
  const isEVMStaff = currentRole === "EVM_STAFF";
  const isAdmin = currentRole === "ADMIN";

  // Data for form
  const [dealers, setDealers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [currentDealerId, setCurrentDealerId] = useState("");

  // Form data - Bước 3: Tạo báo giá từ đơn hàng
  const [formData, setFormData] = useState({
    dealerOrderId: "",
    evmStaffId: "",
    discountPercentage: "",
    notes: ""
  });

  // Lấy danh sách báo giá
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await dealerQuotationAPI.getQuotations();
      console.log("📦 Raw response từ getQuotations:", res);
      const quotationsData = res.data?.data || res.data || [];
      console.log("📦 Quotations data:", quotationsData);
      
      // Nếu là DEALER_MANAGER, chỉ lấy báo giá của đại lý mình
      if (isDealerManager && currentDealerId) {
        const filtered = quotationsData.filter(q => 
          String(q.dealer?.dealerId || q.dealerId || "") === String(currentDealerId)
        );
        setQuotations(Array.isArray(filtered) ? filtered : []);
      } else {
        setQuotations(Array.isArray(quotationsData) ? quotationsData : []);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy báo giá:", err);
      alert("Không thể tải danh sách báo giá!");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đơn hàng đã duyệt (để tạo báo giá)
  const fetchApprovedOrders = async () => {
    try {
      const res = await dealerOrderAPI.getOrders();
      const ordersData = res.data?.data || res.data || [];
      // Chỉ lấy đơn hàng đã được duyệt (APPROVED) và chưa có báo giá
      const approvedOrders = Array.isArray(ordersData) 
        ? ordersData.filter(o => o.approvalStatus === "APPROVED")
        : [];
      setOrders(approvedOrders);
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng:", err);
      setOrders([]);
    }
  };

  // Fetch data for form
  const fetchData = async () => {
    try {
      console.log("🔄 Đang fetch dữ liệu cho form...");
      
      // Fetch dealers (nếu cần)
      if (isAdmin || isEVMStaff) {
        try {
          const dealersRes = await dealerAPI.getAll();
          const dealersData = dealersRes.data || [];
          console.log("✅ Dealers fetched:", dealersData.length);
          setDealers(Array.isArray(dealersData) ? dealersData : []);
        } catch (err) {
          console.error("❌ Lỗi fetch dealers:", err);
          setDealers([]);
        }
      } else if (isDealerManager) {
        // Lấy dealerId từ user info
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const dealerId = userInfo.dealerId || "";
        setCurrentDealerId(dealerId);
      }
      
      // Fetch variants và colors (để hiển thị)
      try {
        const [variantsRes, colorsRes] = await Promise.all([
          publicVehicleAPI.getVariants(),
          publicVehicleAPI.getColors()
        ]);
        const variantsData = variantsRes.data || [];
        const colorsData = colorsRes.data || [];
        console.log("✅ Variants fetched:", variantsData.length);
        console.log("✅ Colors fetched:", colorsData.length);
        setVariants(Array.isArray(variantsData) ? variantsData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch variants/colors:", err);
        setVariants([]);
        setColors([]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchData();
    if (isEVMStaff || isAdmin) {
      fetchApprovedOrders();
    }
  }, []);

  // Fetch lại data khi mở popup
  useEffect(() => {
    if (showPopup) {
      fetchData();
      if (isEVMStaff || isAdmin) {
        fetchApprovedOrders();
      }
    }
  }, [showPopup]);

  // Bước 3: Tạo báo giá từ đơn hàng (EVM_STAFF, ADMIN)
  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.dealerOrderId) {
      setError("Vui lòng chọn đơn hàng!");
      return;
    }

    try {
      // Chuẩn bị params theo API - API nhận các tham số riêng lẻ
      const evmStaffId = formData.evmStaffId || null;
      const discountPercentage = formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined;
      const notes = formData.notes || null;

      console.log("📤 Params tạo báo giá:", { evmStaffId, discountPercentage, notes });

      const createRes = await dealerQuotationAPI.createQuotationFromOrder(
        formData.dealerOrderId,
        evmStaffId,
        discountPercentage,
        notes
      );
      console.log("✅ Response từ createQuotationFromOrder:", createRes);
      
      alert("Tạo báo giá thành công!");
      setShowPopup(false);
      
      // Reset form
      setFormData({
        dealerOrderId: "",
        evmStaffId: "",
        discountPercentage: "",
        notes: ""
      });
      
      // Fetch lại danh sách
      setTimeout(() => {
        fetchQuotations();
        fetchApprovedOrders();
      }, 500);
    } catch (err) {
      console.error("Lỗi khi tạo báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo báo giá!";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  // Bước 4: Gửi báo giá cho đại lý (EVM_STAFF, ADMIN)
  const handleSendQuotation = async (quotationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi báo giá này cho đại lý không?")) return;
    try {
      await dealerQuotationAPI.sendQuotation(quotationId);
      alert("Gửi báo giá thành công!");
      fetchQuotations();
    } catch (err) {
      console.error("Lỗi khi gửi báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể gửi báo giá!";
      alert(`Gửi báo giá thất bại!\n${errorMsg}`);
    }
  };

  // Bước 5: Chấp nhận báo giá (DEALER_MANAGER, ADMIN)
  const handleAcceptQuotation = async (quotationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn chấp nhận báo giá này? Hệ thống sẽ tự động tạo hóa đơn.")) return;
    try {
      const res = await dealerQuotationAPI.acceptQuotation(quotationId);
      console.log("✅ Response từ acceptQuotation:", res);
      alert("Chấp nhận báo giá thành công! Hóa đơn đã được tạo tự động.");
      fetchQuotations();
    } catch (err) {
      console.error("Lỗi khi chấp nhận báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể chấp nhận báo giá!";
      alert(`Chấp nhận báo giá thất bại!\n${errorMsg}`);
    }
  };

  // Từ chối báo giá
  const handleRejectQuotation = async (quotationId) => {
    const reason = window.prompt("Nhập lý do từ chối báo giá:");
    if (!reason) return;
    try {
      await dealerQuotationAPI.rejectQuotation(quotationId, reason);
      alert("Từ chối báo giá thành công!");
      fetchQuotations();
    } catch (err) {
      console.error("Lỗi khi từ chối báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể từ chối báo giá!";
      alert(`Từ chối báo giá thất bại!\n${errorMsg}`);
    }
  };

  // Helper functions
  const getDealerName = (quotation) => {
    if (quotation.dealer) {
      return quotation.dealer.dealerName || quotation.dealer.name || "—";
    }
    if (quotation.dealerOrder?.dealer) {
      return quotation.dealerOrder.dealer.dealerName || quotation.dealerOrder.dealer.name || "—";
    }
    return "—";
  };

  const getOrderNumber = (quotation) => {
    if (quotation.dealerOrder) {
      return quotation.dealerOrder.dealerOrderNumber || "—";
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
      SENT: "badge-info",
      ACCEPTED: "badge-success",
      REJECTED: "badge-danger",
      EXPIRED: "badge-secondary"
    };
    return statusMap[status] || "badge-secondary";
  };

  // Tìm kiếm
  const filteredQuotations = (quotations || []).filter((q) => {
    if (!q) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (q.quotationNumber && String(q.quotationNumber).toLowerCase().includes(keyword)) ||
      (q.status && String(q.status).toLowerCase().includes(keyword)) ||
      (q.dealer?.dealerName && String(q.dealer.dealerName).toLowerCase().includes(keyword)) ||
      (q.dealerOrder?.dealerOrderNumber && String(q.dealerOrder.dealerOrderNumber).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (quotationId) => {
    try {
      const res = await dealerQuotationAPI.getQuotation(quotationId);
      setSelectedQuotation(res.data);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết báo giá:", err);
      alert("Không thể tải chi tiết báo giá!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Báo giá đại lý</div>

      <div className="title2-customer">
        <h2>Danh sách báo giá đại lý</h2>
        {(isEVMStaff || isAdmin) && (
          <h3 onClick={() => setShowPopup(true)}>+ Tạo báo giá</h3>
        )}
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm báo giá..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ BÁO GIÁ</th>
              <th>ĐẠI LÝ</th>
              <th>SỐ ĐƠN HÀNG</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY TẠO</th>
              <th>NGÀY HẾT HẠN</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredQuotations.length > 0 ? (
              filteredQuotations.map((q, index) => {
                const quotationId = q.quotationId || q.id || `quotation-${index}`;
                return (
                  <tr key={quotationId}>
                    <td>{q.quotationNumber || "—"}</td>
                    <td>{getDealerName(q)}</td>
                    <td>{getOrderNumber(q)}</td>
                    <td>{formatPrice(q.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(q.status)}`}>
                        {q.status || "—"}
                      </span>
                    </td>
                    <td>{formatDate(q.createdAt || q.createdDate)}</td>
                    <td>{formatDate(q.expiryDate)}</td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(quotationId)}>
                        <FaEye />
                      </button>
                      {(isEVMStaff || isAdmin) && q.status === "PENDING" && (
                        <button className="icon-btn send" onClick={() => handleSendQuotation(quotationId)} title="Gửi báo giá">
                          <FaPaperPlane />
                        </button>
                      )}
                      {(isDealerManager || isAdmin) && q.status === "SENT" && (
                        <>
                          <button className="icon-btn approve" onClick={() => handleAcceptQuotation(quotationId)} title="Chấp nhận">
                            <FaCheck />
                          </button>
                          <button className="icon-btn reject" onClick={() => handleRejectQuotation(quotationId)} title="Từ chối">
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu báo giá
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup tạo báo giá */}
      {showPopup && (isEVMStaff || isAdmin) && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>Tạo báo giá từ đơn hàng</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreateQuotation}>
              <div style={{ marginBottom: "15px" }}>
                <label>Đơn hàng đã duyệt *</label>
                <select
                  value={formData.dealerOrderId}
                  onChange={(e) => setFormData({ ...formData, dealerOrderId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders.map((o) => (
                    <option key={o.dealerOrderId || o.id} value={o.dealerOrderId || o.id}>
                      {o.dealerOrderNumber} - {o.dealer?.dealerName || o.dealer?.name || "—"} - {formatPrice(o.totalAmount)}
                    </option>
                  ))}
                </select>
                {orders.length === 0 && (
                  <small style={{ color: "red" }}>Chưa có đơn hàng đã duyệt</small>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Phần trăm giảm giá (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  placeholder="Ví dụ: 5"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Ghi chú"
                />
              </div>

              <div className="form-actions">
                <button type="submit">Tạo báo giá</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedQuotation && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết báo giá đại lý</h2>
            <div className="detail-content">
              <p><b>Số báo giá:</b> {selectedQuotation.quotationNumber || "—"}</p>
              <p><b>Đại lý:</b> {getDealerName(selectedQuotation)}</p>
              <p><b>Số đơn hàng:</b> {getOrderNumber(selectedQuotation)}</p>
              <p><b>Tổng tiền:</b> {formatPrice(selectedQuotation.totalAmount)}</p>
              <p><b>Trạng thái:</b> {selectedQuotation.status || "—"}</p>
              <p><b>Ngày tạo:</b> {formatDate(selectedQuotation.createdAt || selectedQuotation.createdDate)}</p>
              <p><b>Ngày hết hạn:</b> {formatDate(selectedQuotation.expiryDate)}</p>
              {selectedQuotation.discountPercentage && (
                <p><b>Giảm giá:</b> {selectedQuotation.discountPercentage}%</p>
              )}
              {selectedQuotation.notes && (
                <p><b>Ghi chú:</b> {selectedQuotation.notes}</p>
              )}
              {selectedQuotation.items && selectedQuotation.items.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <b>Danh sách xe:</b>
                  <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f0f0f0" }}>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>STT</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Phiên bản</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Màu</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Số lượng</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Đơn giá</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Giảm giá</th>
                        <th style={{ padding: "8px", border: "1px solid #ddd" }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation.items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{index + 1}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                            {item.variant?.variantName || `Variant ${item.variantId}`}
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                            {item.color?.colorName || item.color?.name || `Color ${item.colorId}`}
                          </td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.quantity || 0}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{formatPrice(item.unitPrice)}</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.discountPercentage || 0}%</td>
                          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{formatPrice(item.totalPrice || item.finalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

