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
        const [orders, customers, warehouses] = await Promise.all([
          orderAPI.getOrders(),
          customerAPI.getCustomers(),
          warehouseAPI.getWarehouses(),
        ]);

        setOrderCount(orders.data.length);
        setCustomerCount(customers.data.length);
        setVehicleCount(warehouses.data.length);

        const pending = orders.data.filter(o => o.status === 'PENDING');
        setPendingCount(pending.length);

        const recent = orders.data.sort((a, b) => b.id - a.id).slice(0, 2);
        setRecentOrders(recent);
      } catch (err) {
        console.error('❌ Lỗi khi tải dữ liệu dashboard:', err);
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
