import './Order.css';
import { FaSearch, FaFileExport, FaChartLine, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { reportAPI } from "../../services/API";

export default function Report() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Lấy báo cáo
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      let res;
      switch (reportType) {
        case "sales":
          res = await reportAPI.getSalesReport(params);
          break;
        case "inventory":
          res = await reportAPI.getInventoryReport(params);
          break;
        case "dealer":
          res = await reportAPI.getDealerReport(params);
          break;
        case "customer":
          res = await reportAPI.getCustomerReport(params);
          break;
        case "payment":
          res = await reportAPI.getPaymentReport(params);
          break;
        default:
          res = await reportAPI.getSalesReport(params);
      }

      setReports(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy báo cáo:", err);
      setError("Không thể tải báo cáo. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  // Xuất báo cáo
  const handleExport = async () => {
    try {
      alert("Tính năng xuất báo cáo đang được phát triển. Báo cáo sẽ được xuất dưới dạng Excel/PDF.");
      // Có thể implement export functionality sau
    } catch (err) {
      console.error("Lỗi khi xuất báo cáo:", err);
      alert("Xuất báo cáo thất bại!");
    }
  };

  // Render báo cáo theo loại
  const renderReportContent = () => {
    if (!reports || reports.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Không có dữ liệu báo cáo</h3>
          <p>Vui lòng chọn khoảng thời gian khác hoặc thử lại sau.</p>
        </div>
      );
    }

    switch (reportType) {
      case "sales":
        return (
          <table className="customer-table">
            <thead>
              <tr>
                <th>NGÀY</th>
                <th>SỐ ĐƠN HÀNG</th>
                <th>DOANH SỐ</th>
                <th>SỐ LƯỢNG XE</th>
                <th>TRUNG BÌNH/ĐƠN</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.date || r.reportDate || 'N/A'}</td>
                  <td>{r.orderCount || r.totalOrders || 0}</td>
                  <td>{r.totalRevenue ? r.totalRevenue.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                  <td>{r.totalQuantity || r.vehicleCount || 0}</td>
                  <td>{r.averageOrderValue ? r.averageOrderValue.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "inventory":
        return (
          <table className="customer-table">
            <thead>
              <tr>
                <th>PHIÊN BẢN</th>
                <th>TỔNG SỐ LƯỢNG</th>
                <th>ĐÃ BÁN</th>
                <th>CÒN LẠI</th>
                <th>TỶ LỆ BÁN</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.variantName || r.variant?.variantName || 'N/A'}</td>
                  <td>{r.totalQuantity || 0}</td>
                  <td>{r.soldQuantity || 0}</td>
                  <td>{r.remainingQuantity || 0}</td>
                  <td>{r.salesRate ? `${r.salesRate}%` : '0%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "dealer":
        return (
          <table className="customer-table">
            <thead>
              <tr>
                <th>ĐẠI LÝ</th>
                <th>SỐ ĐƠN HÀNG</th>
                <th>DOANH SỐ</th>
                <th>THÀNH TÍCH</th>
                <th>TỶ LỆ MỤC TIÊU</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.dealerName || r.dealer?.dealerName || 'N/A'}</td>
                  <td>{r.orderCount || 0}</td>
                  <td>{r.totalRevenue ? r.totalRevenue.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                  <td>{r.achievement ? r.achievement.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                  <td>{r.targetRate ? `${r.targetRate}%` : '0%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "customer":
        return (
          <table className="customer-table">
            <thead>
              <tr>
                <th>KHÁCH HÀNG</th>
                <th>SỐ ĐƠN HÀNG</th>
                <th>TỔNG GIÁ TRỊ</th>
                <th>ĐƠN HÀNG TRUNG BÌNH</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.customerName || `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}` || 'N/A'}</td>
                  <td>{r.orderCount || 0}</td>
                  <td>{r.totalValue ? r.totalValue.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                  <td>{r.averageOrderValue ? r.averageOrderValue.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "payment":
        return (
          <table className="customer-table">
            <thead>
              <tr>
                <th>NGÀY</th>
                <th>SỐ GIAO DỊCH</th>
                <th>TỔNG SỐ TIỀN</th>
                <th>THANH TOÁN ĐẦY ĐỦ</th>
                <th>TRẢ GÓP</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.date || r.paymentDate || 'N/A'}</td>
                  <td>{r.transactionCount || 0}</td>
                  <td>{r.totalAmount ? r.totalAmount.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                  <td>{r.fullPaymentAmount ? r.fullPaymentAmount.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                  <td>{r.installmentAmount ? r.installmentAmount.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return <div>Loại báo cáo không hợp lệ</div>;
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">📊</span>
        Báo cáo và thống kê
      </div>

      <div className="title2-customer">
        <div>
          <h2>Báo cáo hệ thống</h2>
          <p className="subtitle">Xem và xuất các báo cáo chi tiết</p>
        </div>
        <button className="btn-add" onClick={handleExport}>
          <FaFileExport className="btn-icon" />
          Xuất báo cáo
        </button>
      </div>

      {/* Bộ lọc */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Loại báo cáo</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="sales">Báo cáo bán hàng</option>
              <option value="inventory">Báo cáo kho</option>
              <option value="dealer">Báo cáo đại lý</option>
              <option value="customer">Báo cáo khách hàng</option>
              <option value="payment">Báo cáo thanh toán</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={fetchReport}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {loading ? <FaSpinner className="spinner" /> : 'Tải báo cáo'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchReport}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải báo cáo...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {renderReportContent()}
        </div>
      )}
    </div>
  );
}

