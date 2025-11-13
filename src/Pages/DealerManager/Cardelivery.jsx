import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import "./Customer.css"; // dùng lại style có sẵn

export default function Cardelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // 🔹 Lấy danh sách giao xe
  const fetchDeliveries = async () => {
    try {
      const res = await API.get("/api/vehicle-deliveries");
      setDeliveries(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách giao xe:", err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // 🔹 Xoá giao xe
  const handleDelete = async (deliveryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn giao xe này không?")) return;
    try {
      await API.delete(`/api/vehicle-deliveries/${deliveryId}`);
      alert("Xóa giao xe thành công!");
      fetchDeliveries();
    } catch (err) {
      console.error("Lỗi khi xóa giao xe:", err);
      alert("Xóa thất bại!");
    }
  };

  // 🔹 Lọc tìm kiếm theo khách hàng hoặc trạng thái
  const filteredDeliveries = deliveries.filter((d) => {
    const keyword = searchTerm.toLowerCase();
    return (
      d.deliveryNumber?.toLowerCase().includes(keyword) ||
      d.customer?.firstName?.toLowerCase().includes(keyword) ||
      d.customer?.lastName?.toLowerCase().includes(keyword) ||
      d.deliveryStatus?.toLowerCase().includes(keyword)
    );
  });

  // 🔹 Xử lý khi nhấn “Xem”
  const handleView = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetail(true);
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý giao xe</div>

      <div className="title2-customer">
        <h2>Danh sách giao xe</h2>
        <h3 onClick={() => setShowPopup(true)}>+ Thêm đơn giao xe</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm giao xe..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ GIAO XE</th>
              <th>KHÁCH HÀNG</th>
              <th>XE</th>
              <th>ĐỊA CHỈ GIAO</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY GIAO DỰ KIẾN</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((d) => (
                <tr key={d.deliveryId}>
                  <td>{d.deliveryNumber || "—"}</td>
                  <td>
                    {d.customer
                      ? `${d.customer.firstName} ${d.customer.lastName}`
                      : "—"}
                  </td>
                  <td>
                    {d.vehicle
                      ? `${d.vehicle.variant?.model?.brand?.brandName} ${d.vehicle.variant?.model?.modelName}`
                      : "—"}
                  </td>
                  <td>{d.deliveryAddress || "—"}</td>
                  <td>{d.deliveryStatus || "—"}</td>
                  <td>
                    {d.expectedDeliveryDate
                      ? new Date(d.expectedDeliveryDate).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="icon-btn view"
                      onClick={() => handleView(d)}
                    >
                      <FaEye />
                    </button>
                    <button className="icon-btn edit">
                      <FaPen />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(d.deliveryId)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu giao xe
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm giao xe */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thêm đơn giao xe mới</h2>
            <p>(Chưa có form, chỉ là popup mẫu)</p>
            <button className="btn-close" onClick={() => setShowPopup(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedDelivery && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin giao xe</h2>
            <p>
              <b>Số giao xe:</b> {selectedDelivery.deliveryNumber}
            </p>
            <p>
              <b>Khách hàng:</b>{" "}
              {selectedDelivery.customer
                ? `${selectedDelivery.customer.firstName} ${selectedDelivery.customer.lastName}`
                : "Không có dữ liệu"}
            </p>
            <p>
              <b>Xe:</b>{" "}
              {selectedDelivery.vehicle
                ? `${selectedDelivery.vehicle.variant?.model?.brand?.brandName} ${selectedDelivery.vehicle.variant?.model?.modelName}`
                : "Không có dữ liệu"}
            </p>
            <p>
              <b>Địa chỉ giao:</b> {selectedDelivery.deliveryAddress}
            </p>
            <p>
              <b>Trạng thái:</b> {selectedDelivery.deliveryStatus}
            </p>
            <p>
              <b>Ngày giao dự kiến:</b>{" "}
              {selectedDelivery.expectedDeliveryDate
                ? new Date(
                    selectedDelivery.expectedDeliveryDate
                  ).toLocaleDateString("vi-VN")
                : "—"}
            </p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
