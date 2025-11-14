import './Order.css';
import { FaSearch, FaEye, FaFileContract, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationCircle, FaDownload } from "react-icons/fa";
import { useEffect, useState } from "react";
import { dealerContractAPI, dealerAPI } from "../../services/API";

export default function DealerContract() {
  const [contracts, setContracts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedDealerId, setSelectedDealerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    dealerId: "",
    contractType: "DEALERSHIP",
    startDate: "",
    endDate: "",
    terms: "",
    status: "DRAFT"
  });

  // Lấy danh sách hợp đồng
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dealerContractAPI.getContracts();
      setContracts(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy hợp đồng:", err);
      setError("Không thể tải danh sách hợp đồng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đại lý
  const fetchDealers = async () => {
    try {
      const res = await dealerAPI.getAll();
      setDealers(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy đại lý:", err);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchDealers();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetchDealers();
    }
  }, [showCreateModal]);

  // Tạo hợp đồng
  const handleCreateContract = async () => {
    if (!formData.dealerId || !formData.startDate || !formData.endDate) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      setProcessing('create');
      const payload = {
        dealerId: formData.dealerId,
        contractType: formData.contractType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        terms: formData.terms || null,
        status: formData.status
      };
      
      await dealerContractAPI.createContract(payload);
      alert("Tạo hợp đồng thành công!");
      setShowCreateModal(false);
      setFormData({
        dealerId: "",
        contractType: "DEALERSHIP",
        startDate: "",
        endDate: "",
        terms: "",
        status: "DRAFT"
      });
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
      await dealerContractAPI.signContract(contractId, signedDate);
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
      await dealerContractAPI.updateStatus(contractId, newStatus);
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
      (c.dealer?.dealerName && String(c.dealer.dealerName).toLowerCase().includes(keyword)) ||
      (c.status && String(c.status).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = (contract) => {
    setSelectedContract(contract);
    setShowDetail(true);
  };

  // Get status badge
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
        <span className="title-icon">📋</span>
        Quản lý hợp đồng đại lý
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
          placeholder="Tìm kiếm theo số hợp đồng, đại lý, trạng thái..."
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
                  <th>ĐẠI LÝ</th>
                  <th>LOẠI</th>
                  <th>NGÀY BẮT ĐẦU</th>
                  <th>NGÀY KẾT THÚC</th>
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
                    <td>{c.dealer?.dealerName || c.dealerId || 'N/A'}</td>
                    <td>{c.contractType || 'DEALERSHIP'}</td>
                    <td>
                      <span className="date-text">
                        {c.startDate ? new Date(c.startDate).toLocaleDateString("vi-VN") : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : 'N/A'}
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
              <div className="empty-icon">📭</div>
              <h3>{searchTerm ? 'Không tìm thấy hợp đồng' : 'Chưa có hợp đồng nào'}</h3>
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
                <label>Đại lý *</label>
                <select
                  value={formData.dealerId}
                  onChange={(e) => setFormData({ ...formData, dealerId: e.target.value })}
                  required
                >
                  <option value="">-- Chọn đại lý --</option>
                  {dealers.map((d) => (
                    <option key={d.dealerId || d.id} value={d.dealerId || d.id}>
                      {d.dealerName || d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Loại hợp đồng</label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                >
                  <option value="DEALERSHIP">Đại lý</option>
                  <option value="DISTRIBUTOR">Nhà phân phối</option>
                  <option value="SERVICE">Dịch vụ</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ngày bắt đầu *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày kết thúc *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Điều khoản</label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows="5"
                  placeholder="Điều khoản hợp đồng..."
                />
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">Nháp</option>
                  <option value="PENDING">Chờ ký</option>
                  <option value="ACTIVE">Hiệu lực</option>
                </select>
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button 
                className="btn-primary" 
                onClick={handleCreateContract}
                disabled={processing === 'create'}
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
                    <span className="detail-value">{selectedContract.contractType || 'DEALERSHIP'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái</span>
                    <span className={`status-badge ${getStatusBadge(selectedContract.status)}`}>
                      <span>{selectedContract.status || 'N/A'}</span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày bắt đầu</span>
                    <span className="detail-value">
                      {selectedContract.startDate ? new Date(selectedContract.startDate).toLocaleDateString("vi-VN") : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày kết thúc</span>
                    <span className="detail-value">
                      {selectedContract.endDate ? new Date(selectedContract.endDate).toLocaleDateString("vi-VN") : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày ký</span>
                    <span className="detail-value">
                      {selectedContract.signedDate ? new Date(selectedContract.signedDate).toLocaleDateString("vi-VN") : 'Chưa ký'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin đại lý</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tên đại lý</span>
                    <span className="detail-value">{selectedContract.dealer?.dealerName || selectedContract.dealerId || 'N/A'}</span>
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

