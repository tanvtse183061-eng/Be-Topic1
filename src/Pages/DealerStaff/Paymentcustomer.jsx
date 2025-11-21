import { FaSearch, FaEye, FaPen, FaTrash, FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { customerPaymentAPI, customerAPI, orderAPI } from "../../services/API";


export default function PaymentCustomer() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Lấy danh sách thanh toán
  const fetchPayments = async () => {
    try {
      const res = await customerPaymentAPI.getPayments();
      let paymentsData = res.data || [];
      
      // Enrich payments với customer và order data nếu cần
      const enrichedPayments = await Promise.all(
        paymentsData.map(async (payment) => {
          let enriched = { ...payment };
          
          // Nếu không có customer data nhưng có customerId, fetch customer
          if ((!payment.customer || !payment.customer.firstName) && payment.customerId) {
            try {
              const customerRes = await customerAPI.getCustomer(payment.customerId);
              const customerData = customerRes.data?.data || customerRes.data || customerRes;
              enriched.customer = customerData;
            } catch (err) {
              console.error(`❌ Lỗi fetch customer cho payment ${payment.paymentId}:`, err);
            }
          }
          
          // Nếu không có order data nhưng có orderId, fetch order (có thể có customer trong order)
          if ((!payment.order || !payment.order.orderNumber) && payment.orderId) {
            try {
              const orderRes = await orderAPI.getOrder(payment.orderId);
              const orderData = orderRes.data?.data || orderRes.data || orderRes;
              enriched.order = orderData;
              
              // Nếu order có customer nhưng payment chưa có, dùng customer từ order
              if (orderData.customer && !enriched.customer) {
                enriched.customer = orderData.customer;
              }
              
              // Nếu order có customerId nhưng chưa có customer object, fetch customer
              if (orderData.customerId && !enriched.customer) {
                try {
                  const customerRes = await customerAPI.getCustomer(orderData.customerId);
                  const customerData = customerRes.data?.data || customerRes.data || customerRes;
                  enriched.customer = customerData;
                } catch (err) {
                  console.error(`❌ Lỗi fetch customer từ order:`, err);
                }
              }
            } catch (err) {
              console.error(`❌ Lỗi fetch order cho payment ${payment.paymentId}:`, err);
            }
          }
          
          return enriched;
        })
      );
      
      setPayments(enrichedPayments);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thanh toán:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Xoá thanh toán
  const handleDelete = async (payment) => {
    const paymentId = payment.paymentId || payment.id;
    const paymentNumber = payment.paymentNumber || paymentId;
    const paymentStatus = (payment.status || "").toLowerCase().trim();
    
    // Chỉ cho phép xóa khi status = "completed"
    if (paymentStatus !== "completed" && 
        paymentStatus !== "hoàn tất" && 
        paymentStatus !== "đã hoàn tất" &&
        paymentStatus !== "done" &&
        paymentStatus !== "finished") {
      alert("❌ Chỉ có thể xóa thanh toán với trạng thái 'completed'!");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thanh toán "${paymentNumber}" không?\n\n⚠️ Lưu ý: Hành động này không thể hoàn tác!`)) {
      return;
    }
    
    try {
      // Thử xóa bằng customerPaymentAPI
    try {
        await customerPaymentAPI.deletePayment(paymentId);
        alert("✅ Xóa thanh toán thành công!");
        // Xóa khỏi state ngay lập tức
        setPayments(prev => prev.filter(p => {
          const pid = p.paymentId || p.id;
          return String(pid) !== String(paymentId);
        }));
        // Đóng popup chi tiết nếu đang mở
        if (showDetail && selectedPayment && (selectedPayment.paymentId || selectedPayment.id) === paymentId) {
          setShowDetail(false);
          setSelectedPayment(null);
        }
        return;
      } catch (deleteErr) {
        // Nếu lỗi là "Access denied" hoặc 403, thử endpoint khác hoặc thông báo
        if (deleteErr.response?.status === 403 || 
            deleteErr.response?.status === 401 ||
            (deleteErr.response?.data?.message && deleteErr.response.data.message.includes("Access denied"))) {
          console.warn("⚠️ Không có quyền xóa payment, thử cách khác...");
          // Có thể thử endpoint khác hoặc thông báo cần quyền admin
          // Tạm thời vẫn hiển thị lỗi từ backend
          throw deleteErr;
        }
        throw deleteErr;
      }
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      let errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Xóa thất bại!";
      
      // Nếu lỗi là về quyền truy cập, thông báo rõ ràng hơn
      if (err.response?.status === 403 || 
          (errorMsg && errorMsg.includes("Access denied"))) {
        errorMsg = "Bạn không có quyền xóa thanh toán này. Vui lòng liên hệ Admin hoặc kiểm tra quyền truy cập trong backend.";
      }
      
      alert(`❌ Xóa thất bại!\n\n${errorMsg}`);
    }
  };

  // Lọc tìm kiếm
  const filteredPayments = payments.filter((p) => {
    if (!p) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (p.paymentNumber && String(p.paymentNumber).toLowerCase().includes(keyword)) ||
      (p.customer?.firstName && String(p.customer.firstName).toLowerCase().includes(keyword)) ||
      (p.customer?.lastName && String(p.customer.lastName).toLowerCase().includes(keyword)) ||
      (p.status && String(p.status).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowDetail(true);
  };

  // Xác nhận thanh toán (chuyển từ pending sang completed)
  const handleConfirmPayment = async (paymentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xác nhận thanh toán này?\n\nSau khi xác nhận, trạng thái sẽ chuyển sang 'completed' và đơn hàng sẽ được cập nhật.")) return;
    
    try {
      await customerPaymentAPI.updatePaymentStatus(paymentId, "completed");
      alert("✅ Xác nhận thanh toán thành công!");
      fetchPayments();
      // Đóng popup nếu đang xem chi tiết payment này
      if (showDetail && selectedPayment && (selectedPayment.paymentId || selectedPayment.id) === paymentId) {
        setShowDetail(false);
        setSelectedPayment(null);
      }
    } catch (err) {
      console.error("❌ Lỗi khi xác nhận thanh toán:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể xác nhận thanh toán!";
      alert(`❌ Xác nhận thanh toán thất bại!\n\n${errorMsg}`);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý thanh toán</div>

      <div className="title2-customer">
        <h2>Danh sách thanh toán</h2>
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
              <th>MÃ THANH TOÁN</th>
              <th>KHÁCH HÀNG</th>
              <th>ĐƠN HÀNG</th>
              <th>SỐ TIỀN</th>
              <th>PHƯƠNG THỨC</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY THANH TOÁN</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((p) => (
                <tr key={p.paymentId || p.id}>
                  <td>{p.paymentNumber || p.paymentId || 'N/A'}</td>
                  <td>
                    {p.customer?.firstName && p.customer?.lastName
                      ? `${p.customer.firstName} ${p.customer.lastName}`.trim()
                      : p.customer?.firstName || p.customer?.lastName || 'N/A'}
                    {p.customer?.email && (
                      <>
                        <br />
                        <small style={{ color: "#6b7280" }}>{p.customer.email}</small>
                      </>
                    )}
                  </td>
                  <td>{p.order?.orderNumber || p.orderId || 'N/A'}</td>
                  <td>{p.amount ? p.amount.toLocaleString('vi-VN') : '0'} ₫</td>
                  <td>{p.paymentMethod || 'N/A'}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        p.status === "COMPLETED" || p.status === "completed" ? "completed" : 
                        p.status === "FAILED" || p.status === "failed" ? "failed" : "pending"
                      }`}
                    >
                      {p.status || 'N/A'}
                    </span>
                  </td>
                  <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("vi-VN") : 'N/A'}</td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(p)} title="Xem chi tiết">
                        <FaEye />
                      </button>
                      {(p.status === "pending" || p.status === "PENDING") && (
                        <button 
                          className="icon-btn approve" 
                          onClick={() => handleConfirmPayment(p.paymentId || p.id)}
                          title="Xác nhận thanh toán"
                        >
                          <FaCheck />
                        </button>
                      )}
                      {(() => {
                        const status = (p.status || "").toLowerCase().trim();
                        // Chỉ hiển thị nút xóa khi thanh toán có status = "completed"
                        if (status === "completed" || 
                            status === "hoàn tất" || 
                            status === "đã hoàn tất" ||
                            status === "done" ||
                            status === "finished") {
                          return (
                            <button 
                              className="icon-btn delete" 
                              onClick={() => handleDelete(p)}
                              title="Xóa thanh toán (chỉ khi completed)"
                            >
                              <FaTrash />
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu thanh toán
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup xem chi tiết */}
      {showDetail && selectedPayment && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Chi tiết thanh toán</h2>
            <p><b>Mã thanh toán:</b> {selectedPayment.paymentNumber || selectedPayment.paymentId || 'N/A'}</p>
            <p><b>Khách hàng:</b> {selectedPayment.customer?.firstName || ''} {selectedPayment.customer?.lastName || ''}</p>
            <p><b>Đơn hàng:</b> {selectedPayment.order?.orderNumber || selectedPayment.orderId || 'N/A'}</p>
            <p><b>Số tiền:</b> {selectedPayment.amount ? selectedPayment.amount.toLocaleString('vi-VN') : '0'} ₫</p>
            <p><b>Phương thức:</b> {selectedPayment.paymentMethod || 'N/A'}</p>
            <p><b>Trạng thái:</b> {selectedPayment.status || 'N/A'}</p>
            <p><b>Ngày thanh toán:</b> {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString("vi-VN") : 'N/A'}</p>
            <p><b>Ghi chú:</b> {selectedPayment.notes || "Không có"}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {(selectedPayment.status === "pending" || selectedPayment.status === "PENDING") && (
                <button 
                  className="btn-success" 
                  onClick={() => {
                    handleConfirmPayment(selectedPayment.paymentId || selectedPayment.id);
                  }}
                  style={{ 
                    padding: "10px 20px", 
                    background: "#16a34a", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <FaCheck /> Xác nhận thanh toán
                </button>
              )}
              <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
