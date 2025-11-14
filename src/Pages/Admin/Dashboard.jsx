import './Dashboard.css';
import { FaShoppingCart, FaUsers, FaCar, FaMoneyBillWave, FaExclamationCircle, FaSpinner, FaArrowUp, FaArrowDown, FaClock } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import {
  customerAPI,
  orderAPI,
  warehouseAPI,
} from "../../services/API.js";

export default function Dashboard() {
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousStats, setPreviousStats] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [orders, customers, warehouses] = await Promise.all([
          orderAPI.getOrders(),
          customerAPI.getCustomers(),
          warehouseAPI.getWarehouses(),
        ]);

        const newOrderCount = orders.data?.length || 0;
        const newCustomerCount = customers.data?.length || 0;
        const newVehicleCount = warehouses.data?.length || 0;

        // Save previous stats for comparison
        setPreviousStats({
          orders: orderCount,
          customers: customerCount,
          vehicles: vehicleCount,
        });

        setOrderCount(newOrderCount);
        setCustomerCount(newCustomerCount);
        setVehicleCount(newVehicleCount);

        const pending = orders.data?.filter(o => 
          o.status?.toLowerCase().includes('pending') || 
          o.status?.toLowerCase().includes('chờ')
        ) || [];
        setPendingCount(pending.length);

        // Sort by orderDate instead of id
        const recent = orders.data
          ?.filter(o => o.orderDate)
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 5) || [];
        setRecentOrders(recent);
      } catch (err) {
        console.error('❌ Lỗi khi tải dữ liệu dashboard:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Calculate trend (up/down/stable)
  const getTrend = (current, previous) => {
    if (!previous || previous === 0) return 'stable';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const statsList = [
    { 
      id: 1, 
      icon: FaShoppingCart, 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bg: '#e0e7ff',
      title: 'Tổng đơn hàng', 
      value: orderCount,
      trend: getTrend(orderCount, previousStats.orders),
      suffix: ' đơn'
    },
    { 
      id: 2, 
      icon: FaUsers, 
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bg: '#d1fae5',
      title: 'Khách hàng', 
      value: customerCount,
      trend: getTrend(customerCount, previousStats.customers),
      suffix: ' người'
    },
    { 
      id: 3, 
      icon: FaCar, 
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      bg: '#ede9fe',
      title: 'Xe trong kho', 
      value: vehicleCount,
      trend: getTrend(vehicleCount, previousStats.vehicles),
      suffix: ' xe'
    },
    { 
      id: 4, 
      icon: FaMoneyBillWave, 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bg: '#fef3c7',
      title: 'Doanh thu tháng', 
      value: '0',
      trend: 'stable',
      suffix: ' VNĐ',
      isMoney: true
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pending') || statusLower.includes('chờ')) return 'status-pending';
    if (statusLower.includes('confirmed') || statusLower.includes('xác nhận')) return 'status-confirmed';
    if (statusLower.includes('completed') || statusLower.includes('hoàn tất')) return 'status-completed';
    return 'status-default';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            Dashboard
          </h1>
          <p className="dashboard-subtitle">Tổng quan hệ thống quản lý</p>
        </div>
        <div className="dashboard-time">
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            {statsList.map((stat, index) => {
              const Icon = stat.icon;
              const TrendIcon = stat.trend === 'up' ? FaArrowUp : stat.trend === 'down' ? FaArrowDown : null;
              
              return (
                <div 
                  key={stat.id} 
                  className="stat-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="stat-card-header">
                    <div 
                      className="stat-icon-box"
                      style={{ background: stat.bg }}
                    >
                      <Icon className="stat-icon" style={{ color: stat.gradient.includes('667eea') ? '#667eea' : stat.gradient.includes('10b981') ? '#10b981' : stat.gradient.includes('8b5cf6') ? '#8b5cf6' : '#f59e0b' }} />
                    </div>
                    {TrendIcon && (
                      <div className={`stat-trend stat-trend-${stat.trend}`}>
                        <TrendIcon />
                      </div>
                    )}
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {stat.isMoney 
                        ? `${parseInt(stat.value).toLocaleString('vi-VN')}${stat.suffix}`
                        : `${stat.value.toLocaleString('vi-VN')}${stat.suffix}`
                      }
                    </div>
                    <div className="stat-title">{stat.title}</div>
                  </div>
                  <div className="stat-card-footer">
                    <div className="stat-indicator" style={{ background: stat.gradient }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notice Banner */}
          {pendingCount > 0 && (
            <div className="notice-banner">
              <FaExclamationCircle className="notice-icon" />
              <div className="notice-content">
                <strong>{pendingCount} đơn hàng</strong> đang chờ xử lý
              </div>
              <button className="notice-action">Xem ngay</button>
            </div>
          )}

          {/* Recent Orders */}
          <div className="recent-orders-card">
            <div className="card-header">
              <h3 className="card-title">
                <FaClock className="card-title-icon" />
                Hoạt động gần đây
              </h3>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <div key={order.orderId} className="order-item">
                      <div className="order-info">
                        <div className="order-number">#{order.orderNumber}</div>
                        <div className="order-meta">
                          {order.quotation?.customer && (
                            <span className="order-customer">
                              {order.quotation.customer.firstName} {order.quotation.customer.lastName}
                            </span>
                          )}
                          <span className="order-date">{formatDate(order.orderDate)}</span>
                        </div>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${getStatusBadge(order.status)}`}>
                          {order.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-small">
                  <p>Không có đơn hàng gần đây</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
