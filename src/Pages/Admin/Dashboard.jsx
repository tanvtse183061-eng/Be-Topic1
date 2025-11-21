import './Dashboard.css';
import { FaShoppingCart, FaUsers, FaCar, FaMoneyBillWave, FaExclamationCircle, FaSpinner, FaArrowUp, FaArrowDown, FaClock } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import {
  customerAPI,
  orderAPI,
  inventoryAPI,
} from "../../services/API.js";

export default function Dashboard() {
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousStats, setPreviousStats] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [orders, customers, inventory] = await Promise.all([
          orderAPI.getOrders(),
          customerAPI.getCustomers(),
          inventoryAPI.getInventory().catch(() => ({ data: [] })),
        ]);

        const newOrderCount = orders.data?.length || 0;
        const newCustomerCount = customers.data?.length || 0;
        
        // Lọc chỉ lấy xe có status "available"
        const availableVehicles = (inventory.data || []).filter(v => {
          const status = (v.status || '').toLowerCase();
          return status === 'available' || status === 'có sẵn';
        });
        const newVehicleCount = availableVehicles.length;

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

        // Tính doanh số tháng hiện tại
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Lấy danh sách inventory IDs còn tồn tại (chưa bị xóa)
        const existingInventoryIds = new Set(
          (inventory.data || [])
            .filter(v => {
              const status = (v.status || '').toLowerCase();
              // Loại bỏ các xe đã bị xóa
              return status !== 'deleted' && 
                     status !== 'removed' && 
                     status !== 'archived' && 
                     status !== 'inactive';
            })
            .map(v => String(v.inventoryId || v.id || ''))
        );
        
        const monthlyOrders = (orders.data || []).filter(o => {
          // Lọc đơn hàng đã hoàn thành trong tháng hiện tại
          const status = (o.status || '').toLowerCase();
          const isCompleted = status.includes('completed') || 
                             status.includes('hoàn tất') || 
                             status.includes('delivered') || 
                             status.includes('đã giao') ||
                             status.includes('paid') ||
                             status.includes('đã thanh toán');
          
          if (!isCompleted) return false;
          
          // Kiểm tra ngày trong tháng hiện tại
          let isInCurrentMonth = false;
          if (o.orderDate) {
            const orderDate = new Date(o.orderDate);
            isInCurrentMonth = orderDate.getMonth() === currentMonth && 
                              orderDate.getFullYear() === currentYear;
          } else if (o.createdAt) {
            const createdDate = new Date(o.createdAt);
            isInCurrentMonth = createdDate.getMonth() === currentMonth && 
                              createdDate.getFullYear() === currentYear;
          }
          
          if (!isInCurrentMonth) return false;
          
          // Kiểm tra xem inventory có còn tồn tại không (chưa bị xóa)
          const orderInventoryId = o.inventoryId || o.inventory?.inventoryId || o.inventory?.id;
          if (orderInventoryId) {
            const inventoryIdStr = String(orderInventoryId);
            // Nếu inventory không còn trong danh sách tồn tại, bỏ qua order này
            if (!existingInventoryIds.has(inventoryIdStr)) {
              console.log(`🚫 Bỏ qua order ${o.orderId || o.id} - inventory ${inventoryIdStr} đã bị xóa`);
              return false;
            }
            
            // Kiểm tra thêm status của inventory trong order object
            const inventoryStatus = (o.inventory?.status || '').toLowerCase();
            if (inventoryStatus === 'deleted' || 
                inventoryStatus === 'removed' || 
                inventoryStatus === 'archived' || 
                inventoryStatus === 'inactive') {
              console.log(`🚫 Bỏ qua order ${o.orderId || o.id} - inventory có status ${inventoryStatus}`);
              return false;
            }
          }
          
          return true;
        });
        
        // Tính tổng doanh số
        const revenue = monthlyOrders.reduce((sum, o) => {
          // Ưu tiên 1: totalAmount từ order
          let total = o.totalAmount || o.total_amount;
          
          // Ưu tiên 2: finalPrice từ quotation
          if (!total || total === 0) {
            total = o.quotation?.finalPrice || o.quotation?.final_price;
          }
          
          // Ưu tiên 3: Giá từ inventory
          if (!total || total === 0) {
            const inventory = o.inventory;
            if (inventory) {
              total = inventory.sellingPrice || 
                     inventory.costPrice || 
                     inventory.price ||
                     inventory.selling_price ||
                     inventory.cost_price;
            }
          }
          
          const totalNum = typeof total === 'string' ? parseFloat(total) : (total || 0);
          return sum + totalNum;
        }, 0);
        
        setMonthlyRevenue(revenue);

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
      value: vehicleCount > 0 ? vehicleCount : 'Không có',
      trend: getTrend(vehicleCount, previousStats.vehicles),
      suffix: vehicleCount > 0 ? ' xe' : ''
    },
    { 
      id: 4, 
      icon: FaMoneyBillWave, 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bg: '#fef3c7',
      title: 'Doanh thu tháng', 
      value: monthlyRevenue,
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
                        : typeof stat.value === 'number'
                        ? `${stat.value.toLocaleString('vi-VN')}${stat.suffix}`
                        : `${stat.value}${stat.suffix}`
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
