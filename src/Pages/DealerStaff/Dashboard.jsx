// Dashboard.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCartShopping,
  faUser,
  faCar,
  faMoneyBill,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import {
  customerAPI,
  orderAPI,
  warehouseAPI,
} from "../../services/API.js"; 

export default function Dashboard() {
  // ------------------ STATE ------------------
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  // ------------------ FETCH DATA ------------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch orders và customers (dealer staff có quyền)
        const [orders, customers] = await Promise.all([
          orderAPI.getOrders().catch(err => {
            console.warn("⚠️ Không thể lấy orders:", err);
            return { data: [] };
          }),
          customerAPI.getCustomers().catch(err => {
            console.warn("⚠️ Không thể lấy customers:", err);
            return { data: [] };
          }),
        ]);

        setOrderCount(orders.data?.length || 0);
        setCustomerCount(customers.data?.length || 0);

        // Dealer staff có thể không có quyền truy cập warehouses
        // Nên không fetch warehouses, hoặc fetch với error handling
        try {
          const warehouses = await warehouseAPI.getWarehouses();
          setVehicleCount(warehouses.data?.length || 0);
        } catch (warehouseErr) {
          console.warn("⚠️ Không thể lấy warehouses (có thể không có quyền):", warehouseErr);
          setVehicleCount(0); // Set mặc định 0 nếu không có quyền
        }

        const pending = (orders.data || []).filter(o => o.status === 'PENDING');
        setPendingCount(pending.length);

        const recent = (orders.data || []).sort((a, b) => (b.id || b.orderId || 0) - (a.id || a.orderId || 0)).slice(0, 2);
        setRecentOrders(recent);
      } catch (err) {
        console.error('❌ Lỗi khi tải dữ liệu dashboard:', err);
        console.error('❌ Error response:', err.response?.data);
        console.error('❌ Error status:', err.response?.status);
      }
    };

    fetchAll();
  }, []);


  // ------------------ DASHBOARD CARDS ------------------
  const statsList = [
    { id: 1, icon: faCartShopping, color: '#3b82f6', bg: '#e0ecff', title: 'Đơn hàng', value: orderCount },
    { id: 2, icon: faUser, color: '#16a34a', bg: '#dcfce7', title: 'Khách hàng', value: customerCount },
    { id: 3, icon: faCar, color: '#9333ea', bg: '#f3e8ff', title: 'Xe trong kho', value: vehicleCount },
    { id: 4, icon: faMoneyBill, color: '#f59e0b', bg: '#fef3c7', title: 'Doanh thu', value: '0.0M VNĐ' },
  ];


  // ------------------ JSX ------------------
  return (
    <Container fluid>
      <h1 className="mb-4">Dashboard</h1>

      {/* Stats Cards */}
      <Row className="mb-4">
        {statsList.map((item) => (
          <Col md={3} key={item.id} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded p-3 me-3"
                    style={{ background: item.bg, color: item.color }}
                  >
                    <FontAwesomeIcon icon={item.icon} size="2x" />
                  </div>
                  <div>
                    <div className="h3 mb-0">{item.value}</div>
                    <div className="text-muted">{item.title}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Notice */}
      {pendingCount > 0 && (
        <Alert variant="warning" className="mb-4">
          <FontAwesomeIcon icon={faCircleExclamation} className="me-2" />
          {pendingCount} đơn hàng đang chờ xử lý
        </Alert>
      )}

      {/* Recent Orders */}
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Hoạt động gần đây</h5>
        </Card.Header>
        <Card.Body>
          {recentOrders.length > 0 ? (
            <ul className="list-unstyled mb-0">
              {recentOrders.map((o) => (
                <li key={o.orderId} className="mb-2">
                  Đơn #{o.orderNumber} - {o.status}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">Không có đơn hàng gần đây</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
