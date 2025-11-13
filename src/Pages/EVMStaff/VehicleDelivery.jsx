import '../Admin/Order.css';
import { FaSearch, FaEye, FaTruck, FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { vehicleDeliveryAPI, dealerOrderAPI, dealerAPI } from "../../services/API";

export default function VehicleDelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentRole = localStorage.getItem("role") || "";
  const isDealerManager = currentRole === "DEALER_MANAGER" || currentRole === "MANAGER";
  const isEVMStaff = currentRole === "EVM_STAFF";
  const isAdmin = currentRole === "ADMIN";
  const [currentDealerId, setCurrentDealerId] = useState("");

  // Lấy danh sách giao hàng
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await vehicleDeliveryAPI.getDeliveries();
      console.log("📦 Raw response từ getDeliveries:", res);
      const deliveriesData = res.data?.data || res.data || [];
      console.log("📦 Deliveries data:", deliveriesData);
      
      // Nếu là DEALER_MANAGER, chỉ lấy giao hàng của đại lý mình
      if (isDealerManager && currentDealerId) {
        const filtered = deliveriesData.filter(d => 
          String(d.dealer?.dealerId || d.dealerId || "") === String(currentDealerId) ||
          String(d.dealerOrder?.dealer?.dealerId || "") === String(currentDealerId)
        );
        setDeliveries(Array.isArray(filtered) ? filtered : []);
      } else {
        setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy giao hàng:", err);
      alert("Không thể tải danh sách giao hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Lấy dealerId từ user info nếu là DEALER_MANAGER
    if (isDealerManager) {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const dealerId = userInfo.dealerId || "";
      setCurrentDealerId(dealerId);
    }
    fetchDeliveries();
  }, []);

  // Bước 8: Cập nhật trạng thái giao hàng (EVM_STAFF, ADMIN)
  const handleUpdateStatus = async (deliveryId, status) => {
    if (!window.confirm(`Bạn có chắc chắn muốn cập nhật trạng thái giao hàng thành "${status}" không?`)) return;
    try {
      await vehicleDeliveryAPI.updateStatus(deliveryId, status);
      alert("Cập nhật trạng thái giao hàng thành công!");
      fetchDeliveries();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái giao hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể cập nhật trạng thái!";
      alert(`Cập nhật trạng thái thất bại!\n${errorMsg}`);
    }
  };

  // Xác nhận giao hàng bởi EVM Staff (PUT /api/vehicle-deliveries/{id}/confirm)
  const handleConfirmDelivery = async (deliveryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xác nhận đã giao hàng không?")) return;
    try {
      await vehicleDeliveryAPI.confirmDelivery(deliveryId);
      alert("Xác nhận giao hàng thành công!");
      fetchDeliveries();
    } catch (err) {
      console.error("Lỗi khi xác nhận giao hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể xác nhận giao hàng!";
      alert(`Xác nhận giao hàng thất bại!\n${errorMsg}`);
    }
  };

  // Xác nhận đã nhận hàng bởi Dealer Manager (PUT /api/vehicle-deliveries/{id}/dealer-confirm)
  const handleDealerConfirmDelivery = async (deliveryId) => {
    if (!window.confirm("Bạn có chắc chắn đã nhận được hàng không?")) return;
    try {
      await vehicleDeliveryAPI.dealerConfirmDelivery(deliveryId);
      alert("Xác nhận đã nhận hàng thành công!");
      fetchDeliveries();
    } catch (err) {
      console.error("Lỗi khi xác nhận đã nhận hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể xác nhận đã nhận hàng!";
      alert(`Xác nhận đã nhận hàng thất bại!\n${errorMsg}`);
    }
  };

  // Helper functions
  const getDealerName = (delivery) => {
    if (delivery.dealer) {
      return delivery.dealer.dealerName || delivery.dealer.name || "—";
    }
    if (delivery.dealerOrder?.dealer) {
      return delivery.dealerOrder.dealer.dealerName || delivery.dealerOrder.dealer.name || "—";
    }
    return "—";
  };

  const getOrderNumber = (delivery) => {
    if (delivery.dealerOrder) {
      return delivery.dealerOrder.dealerOrderNumber || "—";
    }
    return "—";
  };

  const getVariantName = (delivery) => {
    if (delivery.variant) {
      return delivery.variant.variantName || `${delivery.variant.model?.brand?.brandName || ""} ${delivery.variant.model?.modelName || ""}` || "—";
    }
    if (delivery.vehicle) {
      return delivery.vehicle.variant?.variantName || "—";
    }
    return "—";
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: "badge-warning",
      scheduled: "badge-warning",
      IN_TRANSIT: "badge-info",
      in_transit: "badge-info",
      DELIVERED: "badge-success",
      delivered: "badge-success",
      CANCELLED: "badge-danger",
      cancelled: "badge-danger"
    };
    return statusMap[status] || "badge-secondary";
  };

  // Tìm kiếm
  const filteredDeliveries = (deliveries || []).filter((d) => {
    if (!d) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (d.deliveryNumber && String(d.deliveryNumber).toLowerCase().includes(keyword)) ||
      (d.status && String(d.status).toLowerCase().includes(keyword)) ||
      (d.dealerOrder?.dealerOrderNumber && String(d.dealerOrder.dealerOrderNumber).toLowerCase().includes(keyword)) ||
      (d.deliveryAddress && String(d.deliveryAddress).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (deliveryId) => {
    try {
      const res = await vehicleDeliveryAPI.getDelivery(deliveryId);
      setSelectedDelivery(res.data);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết giao hàng:", err);
      alert("Không thể tải chi tiết giao hàng!");
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Giao hàng đại lý</div>

      <div className="title2-customer">
        <h2>Danh sách giao hàng đại lý</h2>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm giao hàng..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ GIAO HÀNG</th>
              <th>ĐẠI LÝ</th>
              <th>SỐ ĐƠN HÀNG</th>
              <th>XE</th>
              <th>ĐỊA CHỈ GIAO HÀNG</th>
              <th>NGÀY DỰ KIẾN</th>
              <th>NGÀY GIAO</th>
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
            ) : filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((d, index) => {
                const deliveryId = d.deliveryId || d.id || `delivery-${index}`;
                return (
                  <tr key={deliveryId}>
                    <td>{d.deliveryNumber || "—"}</td>
                    <td>{getDealerName(d)}</td>
                    <td>{getOrderNumber(d)}</td>
                    <td>{getVariantName(d)}</td>
                    <td>{d.deliveryAddress || "—"}</td>
                    <td>{formatDate(d.scheduledDate)}</td>
                    <td>{formatDate(d.deliveredDate)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(d.status)}`}>
                        {d.status || "—"}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(deliveryId)}>
                        <FaEye />
                      </button>
                      {(isEVMStaff || isAdmin) && d.status !== "DELIVERED" && d.status !== "CANCELLED" && (
                        <>
                          {d.status === "scheduled" && (
                            <button 
                              className="icon-btn approve" 
                              onClick={() => handleConfirmDelivery(deliveryId)}
                              title="Xác nhận đã giao hàng (EVM Staff)"
                            >
                              <FaCheck />
                            </button>
                          )}
                          {d.status === "in_transit" && (
                            <button 
                              className="icon-btn approve" 
                              onClick={() => handleUpdateStatus(deliveryId, "delivered")}
                              title="Cập nhật trạng thái đã giao"
                            >
                              <FaCheck />
                            </button>
                          )}
                        </>
                      )}
                      {isDealerManager && d.status === "in_transit" && (
                        <button 
                          className="icon-btn approve" 
                          onClick={() => handleDealerConfirmDelivery(deliveryId)}
                          title="Xác nhận đã nhận hàng (Dealer)"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu giao hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup xem chi tiết */}
      {showDetail && selectedDelivery && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết giao hàng</h2>
            <div className="detail-content">
              <p><b>Số giao hàng:</b> {selectedDelivery.deliveryNumber || "—"}</p>
              <p><b>Đại lý:</b> {getDealerName(selectedDelivery)}</p>
              <p><b>Số đơn hàng:</b> {getOrderNumber(selectedDelivery)}</p>
              <p><b>Xe:</b> {getVariantName(selectedDelivery)}</p>
              <p><b>Địa chỉ giao hàng:</b> {selectedDelivery.deliveryAddress || "—"}</p>
              <p><b>Ngày dự kiến:</b> {formatDate(selectedDelivery.scheduledDate)}</p>
              <p><b>Ngày giao:</b> {formatDate(selectedDelivery.deliveredDate)}</p>
              <p><b>Trạng thái:</b> {selectedDelivery.status || "—"}</p>
              {selectedDelivery.driverName && (
                <p><b>Tài xế:</b> {selectedDelivery.driverName}</p>
              )}
              {selectedDelivery.vehiclePlateNumber && (
                <p><b>Biển số xe:</b> {selectedDelivery.vehiclePlateNumber}</p>
              )}
              {selectedDelivery.notes && (
                <p><b>Ghi chú:</b> {selectedDelivery.notes}</p>
              )}
            </div>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

