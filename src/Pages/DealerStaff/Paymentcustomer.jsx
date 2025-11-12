import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";


export default function PaymentCustomer() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Lấy danh sách thanh toán
  const fetchPayments = async () => {
    try {
      const res = await API.get("/api/public/payments"); // API trả danh sách CustomerPayment
      setPayments(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thanh toán:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Xoá thanh toán
  const handleDelete = async (paymentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thanh toán này không?")) return;
    try {
      await API.delete(`/api/public/payments/${paymentId}`);
      alert("Xóa thanh toán thành công!");
      fetchPayments();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Xóa thất bại!");
    }
  };

  // Lọc tìm kiếm
  const filteredPayments = payments.filter((p) => {
    const keyword = searchTerm.toLowerCase();
    return (
      p.paymentNumber.toLowerCase().includes(keyword) ||
      p.customer.firstName.toLowerCase().includes(keyword) ||
      p.customer.lastName.toLowerCase().includes(keyword) ||
      p.status.toLowerCase().includes(keyword)
    );
  });

  // Xem chi tiết
  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowDetail(true);
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý thanh toán</div>

      <div className="title2-customer">
        <h2>Danh sách thanh toán</h2>
        <h3>+ Thêm thanh toán</h3>
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
                <tr key={p.paymentId}>
                  <td>{p.paymentNumber}</td>
                  <td>
                    {p.customer.firstName} {p.customer.lastName}
                    <br />
                    <small style={{ color: "#6b7280" }}>{p.customer.email}</small>
                  </td>
                  <td>{p.order.orderNumber}</td>
                  <td>{p.amount.toLocaleString()} ₫</td>
                  <td>{p.paymentMethod}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        p.status === "COMPLETED" ? "completed" : "pending"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{new Date(p.paymentDate).toLocaleDateString("vi-VN")}</td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => handleView(p)}>
                      <FaEye />
                    </button>
                    <button className="icon-btn edit">
                      <FaPen />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(p.paymentId)}
                    >
                      <FaTrash />
                    </button>
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
            <p><b>Mã thanh toán:</b> {selectedPayment.paymentNumber}</p>
            <p><b>Khách hàng:</b> {selectedPayment.customer.firstName} {selectedPayment.customer.lastName}</p>
            <p><b>Đơn hàng:</b> {selectedPayment.order.orderNumber}</p>
            <p><b>Số tiền:</b> {selectedPayment.amount.toLocaleString()} ₫</p>
            <p><b>Phương thức:</b> {selectedPayment.paymentMethod}</p>
            <p><b>Trạng thái:</b> {selectedPayment.status}</p>
            <p><b>Ngày thanh toán:</b> {new Date(selectedPayment.paymentDate).toLocaleDateString("vi-VN")}</p>
            <p><b>Ghi chú:</b> {selectedPayment.notes || "Không có"}</p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
