import '../Admin/Order.css';
import { FaSearch, FaEye, FaFileContract, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationCircle, FaDownload } from "react-icons/fa";
import { useEffect, useState } from "react";
import { salesContractAPI, orderAPI } from "../../services/API";

export default function SalesContract() {
  const [contracts, setContracts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);

  // Lấy danh sách hợp đồng
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await salesContractAPI.getContracts();
      setContracts(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy hợp đồng:", err);
      setError("Không thể tải danh sách hợp đồng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đơn hàng để tạo hợp đồng
  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      const ordersData = res.data || [];
      // Chỉ lấy đơn hàng đã xác nhận và chưa có hợp đồng
      const eligibleOrders = ordersData.filter(o => 
        (o.status === 'confirmed' || o.status === 'CONFIRMED') && 
        !contracts.some(c => c.order?.orderId === o.orderId)
      );
      setOrders(eligibleOrders);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetchOrders();
    }
  }, [showCreateModal]);

  // Tạo hợp đồng
  const handleCreateContract = async () => {
    if (!selectedOrderId) {
      alert("Vui lòng chọn đơn hàng!");
      return;
    }
    try {
      setProcessing('create');
      const order = orders.find(o => o.orderId === selectedOrderId);
      if (!order) {
        alert("Không tìm thấy đơn hàng!");
        return;
      }
      
      const payload = {
        orderId: selectedOrderId,
        contractType: 'SALES',
        status: 'DRAFT'
      };
      
      await salesContractAPI.createContract(payload);
      alert("Tạo hợp đồng thành công!");
      setShowCreateModal(false);
      setSelectedOrderId("");
      await fetchContracts();
    } catch (err) {
      console.error("Lỗi khi tạo hợp đồng:", err);
      alert("Tạo hợp đồng thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Ký hợp đồng
  const handleSignContract = async (contractId) => {
    if (!window.confirm("Bạn có chắc chắn muốn ký hợp đồng này không?")) return;
    try {
      setProcessing(contractId);
      const signedDate = new Date().toISOString().split('T')[0];
      await salesContractAPI.signContract(contractId, signedDate);
      alert("Ký hợp đồng thành công!");
      await fetchContracts();
    } catch (err) {
      console.error("Lỗi khi ký hợp đồng:", err);
      alert("Ký hợp đồng thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Cập nhật trạng thái
  const handleUpdateStatus = async (contractId, newStatus) => {
    if (!window.confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thành "${newStatus}" không?`)) return;
    try {
      setProcessing(contractId);
      await salesContractAPI.updateStatus(contractId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      await fetchContracts();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  // Tải hợp đồng
  const handleDownload = async (contractId) => {
    try {
      // Backend có thể cung cấp endpoint download
      // Tạm thời chỉ hiển thị thông báo
      alert("Tính năng tải hợp đồng đang được phát triển.");
    } catch (err) {
      console.error("Lỗi khi tải hợp đồng:", err);
      alert("Tải hợp đồng thất bại!");
    }
  };

  // Tìm kiếm
  const filteredContracts = contracts.filter((c) => {
    if (!c) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (c.contractNumber && String(c.contractNumber).toLowerCase().includes(keyword)) ||
      (c.order?.orderNumber && String(c.order.orderNumber).toLowerCase().includes(keyword)) ||
      (c.customer?.firstName && String(c.customer.firstName).toLowerCase().includes(keyword)) ||
      (c.customer?.lastName && String(c.customer.lastName).toLowerCase().includes(keyword)) ||
      (c.status && String(c.status).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = (contract) => {
    setSelectedContract(contract);
    setShowDetail(true);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('draft') || statusLower.includes('nháp')) return 'status-pending';
    if (statusLower.includes('pending') || statusLower.includes('chờ')) return 'status-pending';
    if (statusLower.includes('signed') || statusLower.includes('đã ký')) return 'status-completed';
    if (statusLower.includes('active') || statusLower.includes('hiệu lực')) return 'status-confirmed';
    if (statusLower.includes('expired') || statusLower.includes('hết hạn')) return 'status-cancelled';
    if (statusLower.includes('cancelled') || statusLower.includes('hủy')) return 'status-cancelled';
    return 'status-default';
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">📄</span>
        Quản lý hợp đồng bán hàng
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách hợp đồng</h2>
          <p className="subtitle">{contracts.length} hợp đồng tổng cộng</p>
        </div>
        <button className="btn-add" onClick={() => setShowCreateModal(true)}>
          <FaFileContract className="btn-icon" />
          Tạo hợp đồng
        </button>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo số hợp đồng, đơn hàng, khách hàng, trạng thái..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchContracts}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách hợp đồng...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredContracts.length > 0 ? (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>SỐ HỢP ĐỒNG</th>
                  <th>ĐƠN HÀNG</th>
                  <th>KHÁCH HÀNG</th>
                  <th>NGÀY TẠO</th>
                  <th>NGÀY KÝ</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((c) => (
                  <tr key={c.contractId}>
                    <td>
                      <span className="order-number">{c.contractNumber || c.contractId}</span>
                    </td>
                    <td>{c.order?.orderNumber || c.orderId || 'N/A'}</td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">
                          {c.customer?.firstName || ''} {c.customer?.lastName || ''}
                        </span>
                        {c.customer?.email && (
                          <span className="customer-email">{c.customer.email}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="date-text">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {c.signedDate ? new Date(c.signedDate).toLocaleDateString("vi-VN") : 'Chưa ký'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(c.status)}`}>
                        <span>{c.status || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="icon-btn view" 
                        onClick={() => handleView(c)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      {c.status?.toLowerCase() === 'draft' && (
                        <button 
                          className="icon-btn edit"
                          onClick={() => handleSignContract(c.contractId)}
                          disabled={processing === c.contractId}
                          title="Ký hợp đồng"
                        >
                          {processing === c.contractId ? <FaSpinner className="spinner-small" /> : <FaFileContract />}
                        </button>
                      )}
                      <button 
                        className="icon-btn view"
                        onClick={() => handleDownload(c.contractId)}
                        title="Tải hợp đồng"
                      >
                        <FaDownload />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>{searchTerm ? 'Không tìm thấy' : 'Chưa có hợp đồng'}</h3>
            </div>
          )}
        </div>
      )}

      {/* Modal tạo hợp đồng */}
      {showCreateModal && (
        <div className="popup-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Tạo hợp đồng mới</h2>
              <button className="popup-close" onClick={() => setShowCreateModal(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="form-group">
                <label>Chọn đơn hàng *</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      {o.orderNumber} - {o.quotation?.customer?.firstName || ''} {o.quotation?.customer?.lastName || ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button 
                className="btn-primary" 
                onClick={handleCreateContract}
                disabled={processing === 'create' || !selectedOrderId}
              >
                {processing === 'create' ? 'Đang tạo...' : 'Tạo hợp đồng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedContract && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box detail-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Chi tiết hợp đồng</h2>
              <button className="popup-close" onClick={() => setShowDetail(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="popup-content">
              <div className="detail-section">
                <h3>Thông tin hợp đồng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số hợp đồng</span>
                    <span className="detail-value">{selectedContract.contractNumber || selectedContract.contractId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loại hợp đồng</span>
                    <span className="detail-value">{selectedContract.contractType || 'SALES'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${getStatusBadge(selectedContract.status)}`}>
                      <span>{selectedContract.status || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày tạo</span>
                    <span className="detail-value">
                      {selectedContract.createdAt ? new Date(selectedContract.createdAt).toLocaleString("vi-VN") : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày ký</span>
                    <span className="detail-value">
                      {selectedContract.signedDate ? new Date(selectedContract.signedDate).toLocaleDateString("vi-VN") : 'Chưa ký'}
                    </span>
                  </div>
                  {selectedContract.expiryDate && (
                    <div className="detail-item">
                      <span className="detail-label">Ngày hết hạn</span>
                      <span className="detail-value">
                        {new Date(selectedContract.expiryDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Số đơn hàng</span>
                    <span className="detail-value">{selectedContract.order?.orderNumber || selectedContract.orderId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Họ tên</span>
                    <span className="detail-value">
                      {selectedContract.customer?.firstName || ''} {selectedContract.customer?.lastName || ''}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedContract.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Điện thoại</span>
                    <span className="detail-value">{selectedContract.customer?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedContract.terms && (
                <div className="detail-section">
                  <h3>Điều khoản</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContract.terms}</p>
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

