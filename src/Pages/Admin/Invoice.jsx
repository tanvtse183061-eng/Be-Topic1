import "./Order.css";
import { FaSearch, FaEye, FaPen, FaTrash, FaSpinner, FaExclamationCircle, FaFileInvoice, FaTimesCircle, FaEdit, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
// API cần đăng nhập - dùng cho quản lý hóa đơn khách hàng (Admin/Staff)
import { salesContractAPI, orderAPI } from "../../services/API";

export default function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    contractNumber: "",
    contractDate: "",
    signedDate: "",
    status: "DRAFT",
    notes: ""
  });

  // Lấy danh sách hóa đơn
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await salesContractAPI.getContracts();
      setInvoices(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách hóa đơn:", err);
      setError("Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đơn hàng để tạo hóa đơn
  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      const ordersData = res.data || [];
      // Chỉ lấy đơn hàng đã thanh toán và chưa có hóa đơn
      const eligibleOrders = ordersData.filter(o => 
        (o.status === 'paid' || o.status === 'PAID' || o.paymentStatus === 'PAID') && 
        !invoices.some(inv => inv.order?.orderId === o.orderId || inv.orderId === o.orderId)
      );
      setOrders(eligibleOrders);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (showPopup) {
      fetchOrders();
    }
  }, [showPopup]);

  // Xóa hóa đơn
  const handleDelete = async (contractId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này không?")) return;
    try {
      setDeleting(contractId);
      await salesContractAPI.deleteContract(contractId);
      alert("Xóa hóa đơn thành công!");
      await fetchInvoices();
    } catch (err) {
      console.error("Lỗi khi xóa hóa đơn:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Ký hóa đơn
  const handleSignContract = async (contractId) => {
    if (!window.confirm("Bạn có chắc chắn muốn ký hóa đơn này không?")) return;
    try {
      setDeleting(contractId);
      await salesContractAPI.signContract(contractId);
      alert("Ký hóa đơn thành công!");
      await fetchInvoices();
    } catch (err) {
      console.error("Lỗi khi ký hóa đơn:", err);
      alert("Ký thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Lọc tìm kiếm
  const filteredInvoices = invoices.filter((inv) => {
    if (!inv) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (inv.contractNumber && String(inv.contractNumber).toLowerCase().includes(keyword)) ||
      (inv.order?.orderNumber && String(inv.order.orderNumber).toLowerCase().includes(keyword)) ||
      (inv.order?.quotation?.customer?.firstName && String(inv.order.quotation.customer.firstName).toLowerCase().includes(keyword)) ||
      (inv.order?.quotation?.customer?.lastName && String(inv.order.quotation.customer.lastName).toLowerCase().includes(keyword)) ||
      (inv.status && String(inv.status).toLowerCase().includes(keyword))
    );
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('draft') || statusLower.includes('nháp')) return 'status-pending';
    if (statusLower.includes('signed') || statusLower.includes('đã ký')) return 'status-completed';
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return 'status-cancelled';
    return 'status-default';
  };

  // Helper functions
  const getCustomerName = (order) => {
    if (order?.customer) {
      const customer = order.customer;
      if (customer.firstName && customer.lastName) {
        return `${customer.firstName} ${customer.lastName}`;
      }
      return customer.fullName || customer.name || "—";
    }
    if (order?.quotation?.customer) {
      const customer = order.quotation.customer;
      if (customer.firstName && customer.lastName) {
        return `${customer.firstName} ${customer.lastName}`;
      }
      return customer.fullName || customer.name || "—";
    }
    return "—";
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Xử lý khi nhấn "Xem"
  const handleView = async (invoice) => {
    try {
      const res = await salesContractAPI.getContract(invoice.contractId || invoice.id);
      setSelectedInvoice(res.data || invoice);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết hóa đơn:", err);
      setSelectedInvoice(invoice);
      setShowDetail(true);
    }
  };

  // Mở form thêm mới
  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      orderId: "",
      contractNumber: "",
      contractDate: new Date().toISOString().split('T')[0],
      signedDate: "",
      status: "DRAFT",
      notes: ""
    });
    setError(null);
    setShowPopup(true);
  };

  // Mở form sửa
  const handleEdit = async (invoice) => {
    try {
      setIsEdit(true);
      const res = await salesContractAPI.getContract(invoice.contractId || invoice.id);
      const fullInvoice = res.data || invoice;
      setFormData({
        orderId: fullInvoice.orderId || fullInvoice.order?.orderId || "",
        contractNumber: fullInvoice.contractNumber || "",
        contractDate: fullInvoice.contractDate 
          ? fullInvoice.contractDate.split('T')[0] 
          : new Date().toISOString().split('T')[0],
        signedDate: fullInvoice.signedDate 
          ? fullInvoice.signedDate.split('T')[0] 
          : "",
        status: fullInvoice.status || "DRAFT",
        notes: fullInvoice.notes || ""
      });
      setSelectedInvoice(fullInvoice);
      setError(null);
      setShowPopup(true);
    } catch (err) {
      console.error("Lỗi khi load chi tiết hóa đơn:", err);
      alert("Không thể tải chi tiết hóa đơn!");
    }
  };

  // Lưu hóa đơn
  const handleSave = async () => {
    if (!formData.orderId) {
      setError("Vui lòng chọn đơn hàng!");
      return;
    }
    if (!formData.contractDate) {
      setError("Vui lòng chọn ngày hóa đơn!");
      return;
    }

    try {
      setError(null);
      const contractData = {
        orderId: formData.orderId,
        contractNumber: formData.contractNumber || null,
        contractDate: formData.contractDate,
        signedDate: formData.signedDate || null,
        status: formData.status,
        notes: formData.notes || null
      };

      if (isEdit && selectedInvoice?.contractId) {
        await salesContractAPI.updateContract(selectedInvoice.contractId, contractData);
        alert("Cập nhật hóa đơn thành công!");
      } else {
        await salesContractAPI.createContract(contractData);
        alert("Tạo hóa đơn thành công!");
      }
      
      setShowPopup(false);
      await fetchInvoices();
    } catch (err) {
      console.error("Lỗi khi lưu hóa đơn:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể lưu hóa đơn!";
      setError(errorMsg);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">
        Hóa đơn khách hàng
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách hóa đơn</h2>
          <p className="subtitle">{invoices.length} hóa đơn tổng cộng</p>
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          <FaPlus className="btn-icon" />
          Tạo hóa đơn
        </button>
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

      {error && !showPopup && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchInvoices}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách hóa đơn...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredInvoices.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>SỐ HÓA ĐƠN</th>
                  <th>ĐƠN HÀNG</th>
                  <th>KHÁCH HÀNG</th>
                  <th>NGÀY HÓA ĐƠN</th>
                  <th>NGÀY KÝ</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.contractId || inv.id}>
                    <td>{inv.contractNumber || inv.contractId || "—"}</td>
                    <td>{inv.order?.orderNumber || inv.orderId || "—"}</td>
                    <td>
                      {inv.order?.quotation?.customer
                        ? `${inv.order.quotation.customer.firstName || ''} ${inv.order.quotation.customer.lastName || ''}`
                        : getCustomerName(inv.order) || "—"}
                    </td>
                    <td>{formatDate(inv.contractDate)}</td>
                    <td>{formatDate(inv.signedDate)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(inv.status)}`}>
                        {inv.status || "—"}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        className="icon-btn view"
                        onClick={() => handleView(inv)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="icon-btn edit"
                        onClick={() => handleEdit(inv)}
                        disabled={deleting === (inv.contractId || inv.id)}
                        title="Sửa hóa đơn"
                      >
                        <FaEdit />
                      </button>
                      {inv.status?.toLowerCase() === 'draft' && (
                        <button 
                          className="icon-btn confirm"
                          onClick={() => handleSignContract(inv.contractId || inv.id)}
                          disabled={deleting === (inv.contractId || inv.id)}
                          title="Ký hóa đơn"
                        >
                          {deleting === (inv.contractId || inv.id) ? <FaSpinner className="spinner-small" /> : <FaFileInvoice />}
                        </button>
                      )}
                      <button
                        className="icon-btn delete"
                        onClick={() => handleDelete(inv.contractId || inv.id)}
                        disabled={deleting === (inv.contractId || inv.id)}
                        title="Xóa"
                      >
                        {deleting === (inv.contractId || inv.id) ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>{searchTerm ? 'Không tìm thấy' : 'Chưa có hóa đơn'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Popup thêm/sửa hóa đơn */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>{isEdit ? "Sửa hóa đơn" : "Tạo hóa đơn mới"}</h2>
              <button className="popup-close" onClick={() => setShowPopup(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              {error && (
                <div className="error-banner" style={{ marginBottom: "16px" }}>
                  <FaExclamationCircle />
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label>Đơn hàng <span style={{ color: "red" }}>*</span></label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  disabled={isEdit}
                  required
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      {o.orderNumber || o.orderId} - {getCustomerName(o)} - {formatPrice(o.totalAmount)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Số hóa đơn</label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  placeholder="Nhập số hóa đơn (tự động nếu để trống)..."
                />
              </div>
              <div className="form-group">
                <label>Ngày hóa đơn <span style={{ color: "red" }}>*</span></label>
                <input
                  type="date"
                  value={formData.contractDate}
                  onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày ký</label>
                <input
                  type="date"
                  value={formData.signedDate}
                  onChange={(e) => setFormData({ ...formData, signedDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SIGNED">SIGNED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nhập ghi chú (nếu có)..."
                  rows="2"
                />
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-secondary" onClick={() => setShowPopup(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSave}>
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedInvoice && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết hóa đơn</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin hóa đơn</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số hóa đơn</span>
                    <span className="detail-value">{selectedInvoice.contractNumber || selectedInvoice.contractId || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${getStatusBadge(selectedInvoice.status)}`}>
                      {selectedInvoice.status || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày hóa đơn</span>
                    <span className="detail-value">{formatDate(selectedInvoice.contractDate)}</span>
                  </div>
                  {selectedInvoice.signedDate && (
                    <div className="detail-item">
                      <span className="detail-label">Ngày ký</span>
                      <span className="detail-value">{formatDate(selectedInvoice.signedDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số đơn hàng</span>
                    <span className="detail-value">{selectedInvoice.order?.orderNumber || selectedInvoice.orderId || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tổng tiền</span>
                    <span className="detail-value">{formatPrice(selectedInvoice.order?.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">
                      {selectedInvoice.order?.quotation?.customer
                        ? `${selectedInvoice.order.quotation.customer.firstName || ''} ${selectedInvoice.order.quotation.customer.lastName || ''}`
                        : getCustomerName(selectedInvoice.order) || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">
                      {selectedInvoice.order?.quotation?.customer?.email || selectedInvoice.order?.customer?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">
                      {selectedInvoice.order?.quotation?.customer?.phone || selectedInvoice.order?.customer?.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="detail-section">
                  <h3>Ghi chú</h3>
                  <p>{selectedInvoice.notes}</p>
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

