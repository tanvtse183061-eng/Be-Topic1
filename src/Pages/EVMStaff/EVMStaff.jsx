import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserShield, faUser, faCar, faMoneyCheckDollar, faTruck, faUsers, faFileAlt, 
  faSearch, faBell, faEnvelope, faBars, faGrip, faShoppingCart, faUserPlus, 
  faWarehouse, faBoxes, faUserCog, faChartBar, faTags, faCalendarCheck, 
  faComments, faFileContract, faFileInvoice 
} from '@fortawesome/free-solid-svg-icons';
import { InputGroup, FormControl, Badge } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { getMenuItemsByRole, getRoleDisplayName } from '../../config/roleMenus';
import { feedbackAPI } from '../../services/API';

export default function EVMStaff() {
 const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
const [selectedAction, setSelectedAction] = useState(null);
 const toggleNotifications = () => {
  setShowNotifications(!showNotifications);
};
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role");
    
    // Kiểm tra cả token, username và role
    if (savedToken && savedUser && savedRole) {
      // Kiểm tra role có đúng với route không
      if (savedRole !== "EVM_STAFF") {
        // Redirect về đúng route theo role
        if (savedRole === "ADMIN") {
          navigate("/admin", { replace: true });
        } else if (savedRole === "MANAGER" || savedRole === "DEALER_MANAGER") {
          navigate("/dealermanager", { replace: true });
        } else if (savedRole === "STAFF" || savedRole === "DEALER_STAFF") {
          navigate("/dealerstaff", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
        return;
      }
      
      setUsername(savedUser);
      setUserRole(savedRole);
      setMenuItems(getMenuItemsByRole(savedRole));
      
      // Lấy số lượng phản hồi chưa xem
      fetchUnreadFeedbackCount();
    } else {
      // Nếu không có đủ thông tin, redirect về login
      console.warn("⚠️ EVMStaff: Không có đủ thông tin đăng nhập, redirect về login");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Lấy số lượng phản hồi chưa xem
  const fetchUnreadFeedbackCount = async () => {
    try {
      const res = await feedbackAPI.getFeedbacks();
      const feedbacks = res.data || [];
      // Đếm phản hồi có status pending hoặc chưa được phản hồi
      const unread = feedbacks.filter(f => {
        const status = (f.status || '').toLowerCase();
        return status.includes('pending') || 
               status.includes('chờ') || 
               !f.response;
      }).length;
      setUnreadFeedbackCount(unread);
    } catch (err) {
      console.error("Lỗi khi lấy số lượng phản hồi:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div 
        className="position-fixed top-0 start-0 bg-white border-end shadow-sm h-100 overflow-y-auto"
        style={{ 
          width: isCollapsed ? '80px' : '280px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000
        }}
      >
        <div 
          className="text-white p-4 text-center"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <div className="mb-3 d-flex justify-content-center">
            <div 
              className="bg-white bg-opacity-20 rounded-3 d-flex align-items-center justify-content-center"
              style={{ 
                backdropFilter: 'blur(10px)', 
                border: '2px solid rgba(255, 255, 255, 0.5)',
                width: isCollapsed ? '48px' : '56px',
                height: isCollapsed ? '48px' : '56px',
                minWidth: isCollapsed ? '48px' : '56px',
                minHeight: isCollapsed ? '48px' : '56px',
                padding: isCollapsed ? '8px' : '12px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <FontAwesomeIcon 
                icon={faUserShield} 
                color="white"
                size={isCollapsed ? "lg" : "2x"}
                style={{ 
                  display: 'block',
                  opacity: 1
                }}
              />
            </div>
          </div>
          {!isCollapsed && (
            <>
              <div className="mb-2">
                <p className="mb-1 fw-bold text-white" style={{ fontSize: '14px' }}>{username || "User"}</p>
                <p className="mb-2 fw-semibold text-white-50" style={{ fontSize: '12px' }}>{getRoleDisplayName(userRole) || "User"}</p>
              </div>
              <button 
                className="btn btn-sm btn-light"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          )}
          {isCollapsed && (
            <div className="mt-2 text-center">
              <div className="text-white small fw-bold" style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                {username ? username.substring(0, 3).toUpperCase() : "U"}
              </div>
            </div>
          )}
        </div>

        <div className="p-3">
          {!isCollapsed && (
            <p className="text-muted small fw-semibold mb-3 text-uppercase">Chức năng</p>
          )}
          {(() => {
            // Nhóm menu items theo category
            const groupedItems = {};
            menuItems
              .filter(item => !item.disabled)
              .forEach((item) => {
                const category = item.category || "Khác";
                if (!groupedItems[category]) {
                  groupedItems[category] = [];
                }
                groupedItems[category].push(item);
              });

            const categories = Object.keys(groupedItems);
            
            return categories.map((category, categoryIndex) => (
              <div key={category}>
                {categoryIndex > 0 && (
                  <hr className="my-3" style={{ borderColor: '#e0e0e0', borderWidth: '1px' }} />
                )}
                {!isCollapsed && (
                  <p className="text-muted small fw-semibold mb-2 mt-3 text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    {category}
                  </p>
                )}
                <ul className="list-unstyled">
                  {groupedItems[category].map((item) => {
              // Icon mapping
              const iconMap = {
                faGrip: faGrip,
                faCar: faCar,
                faUserPlus: faUserPlus,
                faUserCog: faUserCog,
                faWarehouse: faWarehouse,
                faBoxes: faBoxes,
                faTags: faTags,
                faFileAlt: faFileAlt,
                faUsers: faUsers,
                faShoppingCart: faShoppingCart,
                faTruck: faTruck,
                faMoneyCheckDollar: faMoneyCheckDollar,
                faChartBar: faChartBar,
                faCalendarCheck: faCalendarCheck,
                faComments: faComments,
                faFileContract: faFileContract,
                faFileInvoice: faFileInvoice
              };
              
              const icon = iconMap[item.icon] || faFileAlt;
              
              // Nếu có children (submenu)
              if (item.children) {
                return (
                  <li key={item.id}>
                    <div
                      className="d-flex align-items-center gap-2 py-2 px-3 rounded mb-1 cursor-pointer"
                      onClick={() => setSelectedAction(selectedAction === item.id ? null : item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon icon={icon} className={item.color || "text-primary"} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {selectedAction === item.id && !isCollapsed && (
                      <ul className="list-unstyled ms-4 ps-3 border-start border-primary">
                        {item.children.map((child) => (
                          <li 
                            key={child.id}
                            className="py-2 cursor-pointer"
                            onClick={() => navigate(child.path)}
                            style={{ cursor: 'pointer' }}
                          >
                            {child.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }
              
              return (
                <li 
                  key={item.id}
                  className="d-flex align-items-center gap-2 py-2 px-3 rounded mb-1 cursor-pointer"
                  onClick={() => item.path && navigate(item.path)}
                  style={{ cursor: item.path ? 'pointer' : 'default' }}
                >
                  <FontAwesomeIcon icon={icon} className={item.color || "text-secondary"} />
                  {!isCollapsed && <span>{item.label}</span>}
                </li>
              );
                  })}
                </ul>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-grow-1 d-flex flex-column"
        style={{ marginLeft: isCollapsed ? '80px' : '280px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Header */}
        <nav className="navbar bg-white border-bottom shadow-sm px-4 py-3">
          <button 
            className="btn btn-outline-secondary me-3"
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <InputGroup className="flex-grow-1 me-3" style={{ maxWidth: '400px' }}>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} className="text-success" />
            </InputGroup.Text>
            <FormControl placeholder="Search" />
          </InputGroup>

          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <button 
                className="btn btn-link text-dark text-decoration-none position-relative"
                onClick={toggleNotifications}
              >
                <FontAwesomeIcon icon={faBell} />
                <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill" style={{ fontSize: '0.7rem' }}>
                  3
                </Badge>
              </button>
              {showNotifications && (
                <div 
                  className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg"
                  style={{ minWidth: '300px', zIndex: 1001 }}
                >
                  <div className="p-3 border-bottom fw-semibold">
                    <FontAwesomeIcon icon={faBell} className="me-2" /> Notifications
                  </div>
                  <div className="d-flex gap-2 p-3 border-bottom">
                    <img src="https://i.pravatar.cc/30?img=1" alt="user" className="rounded-circle" />
                    <div>
                      <p className="mb-0"><strong>John Doe</strong> liked your post</p>
                      <small className="text-muted">5 mins ago</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 p-3 border-bottom">
                    <img src="https://i.pravatar.cc/30?img=2" alt="user" className="rounded-circle" />
                    <div>
                      <p className="mb-0"><strong>Moo Doe</strong> liked your cover image</p>
                      <small className="text-muted">7 mins ago</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 p-3 border-bottom">
                    <img src="https://i.pravatar.cc/30?img=3" alt="user" className="rounded-circle" />
                    <div>
                      <p className="mb-0"><strong>Lee Doe</strong> commented on your video</p>
                      <small className="text-muted">10 mins ago</small>
                    </div>
                  </div>
                  <div className="p-3 text-center bg-light">
                    <a href="#" className="text-decoration-none">View All Notifications</a>
                  </div>
                </div>
              )}
            </div>

            <div className="position-relative">
              <button 
                className="btn btn-link text-dark text-decoration-none position-relative"
                onClick={() => navigate('feedback')}
                title="Phản hồi"
              >
                <FontAwesomeIcon icon={faComments} />
                {unreadFeedbackCount > 0 && (
                <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill" style={{ fontSize: '0.7rem' }}>
                    {unreadFeedbackCount > 99 ? '99+' : unreadFeedbackCount}
                </Badge>
                )}
              </button>
            </div>

            <div className="ps-3 border-start">
              <div>
                <h6 className="mb-0 fw-bold">{username || "User"}</h6>
                <small className="text-muted">{getRoleDisplayName(userRole) || "User"}</small>
              </div>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-grow-1 p-4 bg-light">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

