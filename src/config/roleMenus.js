// Role-based menu configuration
// Định nghĩa menu items cho từng user role

export const ROLE_NAMES = {
  ADMIN: "Quản trị viên",
  EVM_STAFF: "Nhân viên EVM",
  EVM_MANAGER: "Quản lý EVM",
  MANAGER: "Quản lý đại lý",
  DEALER_MANAGER: "Quản lý đại lý", // Map DEALER_MANAGER -> Quản lý đại lý
  STAFF: "Nhân viên đại lý",
  DEALER_STAFF: "Nhân viên đại lý" // Map DEALER_STAFF -> Nhân viên đại lý
};

// Menu items cho Admin (có đầy đủ quyền)
const adminMenuItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: "faGrip",
    path: "dashboard",
    color: "text-secondary",
    category: "Tổng quan"
  },
  {
    id: "vehicle",
    label: "Truy vấn thông tin xe",
    icon: "faCar",
    color: "text-primary",
    category: "Quản lý sản phẩm",
    children: [
      { id: "vehicle-brand", label: "Thương hiệu", path: "vehiclebrand" },
      { id: "vehicle-model", label: "Dòng xe", path: "vehiclemodel" },
      { id: "vehicle-variant", label: "Phiên bản", path: "vehiclevariant" },
      { id: "vehicle-color", label: "Màu sắc", path: "vehiclcolor" }
    ]
  },
  {
    id: "warehouse",
    label: "Kho",
    icon: "faWarehouse",
    path: "warehouse",
    color: "text-info",
    category: "Quản lý sản phẩm"
  },
  {
    id: "vehicleinventory",
    label: "Tồn kho xe",
    icon: "faBoxes",
    path: "vehicleinventory",
    color: "text-info",
    category: "Quản lý sản phẩm"
  },
  {
    id: "quotation",
    label: "Báo giá khách hàng",
    icon: "faFileAlt",
    path: "quotation",
    color: "text-warning",
    category: "Quản lý đơn hàng"
  },
  {
    id: "customer-order",
    label: "Khách hàng",
    icon: "faUsers",
    path: "customer",
    color: "text-info",
    category: "Quản lý đơn hàng"
  },
  {
    id: "order",
    label: "Đơn hàng",
    icon: "faShoppingCart",
    path: "order",
    color: "text-primary",
    category: "Quản lý đơn hàng"
  },
  {
    id: "paymentcustomer",
    label: "Thanh toán",
    icon: "faMoneyCheckDollar",
    path: "paymentcustomer",
    color: "text-success",
    category: "Quản lý đơn hàng"
  },
  {
    id: "invoice",
    label: "Hóa đơn",
    icon: "faFileInvoice",
    path: "invoice",
    color: "text-warning",
    category: "Quản lý đơn hàng"
  },
  {
    id: "cardelivery",
    label: "Giao hàng",
    icon: "faTruck",
    path: "cardelivery",
    color: "text-info",
    category: "Quản lý đơn hàng"
  },
  {
    id: "dealerorder",
    label: "Đơn hàng đại lý",
    icon: "faShoppingCart",
    path: "dealerorder",
    color: "text-primary",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerquotation",
    label: "Báo giá đại lý",
    icon: "faFileAlt",
    path: "dealerquotation",
    color: "text-warning",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerinvoice",
    label: "Hóa đơn đại lý",
    icon: "faFileInvoice",
    path: "dealerinvoice",
    color: "text-info",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerpayment",
    label: "Thanh toán đại lý",
    icon: "faMoneyCheckDollar",
    path: "dealerpayment",
    color: "text-success",
    category: "Quản lý đại lý"
  },
  {
    id: "vehicledelivery",
    label: "Giao hàng đại lý",
    icon: "faTruck",
    path: "vehicledelivery",
    color: "text-info",
    category: "Quản lý đại lý"
  },
  {
    id: "dealer",
    label: "Tạo Dealer",
    icon: "faUserPlus",
    path: "createdealer",
    color: "text-info",
    category: "Quản lý hệ thống"
  },
  {
    id: "usermanagement",
    label: "Quản lý tài khoản",
    icon: "faUserCog",
    path: "usermanagement",
    color: "text-primary",
    category: "Quản lý hệ thống"
  },
  {
    id: "imagemanagement",
    label: "Quản lý hình ảnh",
    icon: "faImages",
    path: "imagemanagement",
    color: "text-info",
    category: "Quản lý hệ thống"
  },
  {
    id: "appointment",
    label: "Lịch hẹn",
    icon: "faCalendarCheck",
    path: "appointment",
    color: "text-primary",
    category: "Dịch vụ"
  },
  {
    id: "feedback",
    label: "Phản hồi",
    icon: "faComments",
    path: "feedback",
    color: "text-info",
    category: "Dịch vụ"
  },
  {
    id: "salescontract",
    label: "Hợp đồng bán hàng",
    icon: "faFileContract",
    path: "salescontract",
    color: "text-warning",
    category: "Dịch vụ"
  },
  {
    id: "promotion",
    label: "Khuyến mãi",
    icon: "faTags",
    path: "promotion",
    color: "text-success",
    category: "Khuyến mãi & Chính sách"
  },
  {
    id: "dealertarget",
    label: "Mục tiêu đại lý",
    icon: "faBullseye",
    path: "dealertarget",
    color: "text-primary",
    category: "Khuyến mãi & Chính sách"
  },
  {
    id: "dealercontract",
    label: "Hợp đồng đại lý",
    icon: "faFileSignature",
    path: "dealercontract",
    color: "text-warning",
    category: "Khuyến mãi & Chính sách"
  },
  {
    id: "pricingpolicy",
    label: "Chính sách giá",
    icon: "faDollarSign",
    path: "pricingpolicy",
    color: "text-success",
    category: "Khuyến mãi & Chính sách"
  },
  {
    id: "report",
    label: "Báo cáo",
    icon: "faChartBar",
    path: "report",
    color: "text-secondary",
    category: "Báo cáo & Tài chính"
  },
  {
    id: "installmentplan",
    label: "Kế hoạch trả góp",
    icon: "faCalendarAlt",
    path: "installmentplan",
    color: "text-primary",
    category: "Báo cáo & Tài chính"
  },
  {
    id: "installmentschedule",
    label: "Lịch trả góp",
    icon: "faListAlt",
    path: "installmentschedule",
    color: "text-info",
    category: "Báo cáo & Tài chính"
  }
];

// Menu items cho EVM Staff (không có Dealer và UserManagement)
const evmStaffMenuItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: "faGrip",
    path: "dashboard",
    color: "text-secondary",
    category: "Tổng quan"
  },
  {
    id: "vehicle",
    label: "Truy vấn thông tin xe",
    icon: "faCar",
    color: "text-primary",
    category: "Quản lý sản phẩm",
    children: [
      { id: "vehicle-brand", label: "Thương hiệu", path: "vehiclebrand" },
      { id: "vehicle-model", label: "Dòng xe", path: "vehiclemodel" },
      { id: "vehicle-variant", label: "Phiên bản", path: "vehiclevariant" },
      { id: "vehicle-color", label: "Màu sắc", path: "vehiclcolor" }
    ]
  },
  {
    id: "warehouse",
    label: "Kho",
    icon: "faWarehouse",
    path: "warehouse",
    color: "text-info",
    category: "Quản lý sản phẩm"
  },
  {
    id: "vehicleinventory",
    label: "Tồn kho xe",
    icon: "faBoxes",
    path: "vehicleinventory",
    color: "text-info",
    category: "Quản lý sản phẩm"
  },
  {
    id: "quotation",
    label: "Báo giá khách hàng",
    icon: "faFileAlt",
    path: "quotation",
    color: "text-warning",
    category: "Quản lý đơn hàng"
  },
  {
    id: "customer-order",
    label: "Khách hàng",
    icon: "faUsers",
    path: "customer",
    color: "text-info",
    category: "Quản lý đơn hàng"
  },
  {
    id: "order",
    label: "Đơn hàng",
    icon: "faShoppingCart",
    path: "order",
    color: "text-primary",
    category: "Quản lý đơn hàng"
  },
  {
    id: "paymentcustomer",
    label: "Thanh toán",
    icon: "faMoneyCheckDollar",
    path: "paymentcustomer",
    color: "text-success",
    category: "Quản lý đơn hàng"
  },
  {
    id: "invoice",
    label: "Hóa đơn",
    icon: "faFileInvoice",
    path: "invoice",
    color: "text-warning",
    category: "Quản lý đơn hàng"
  },
  {
    id: "cardelivery",
    label: "Giao hàng",
    icon: "faTruck",
    path: "cardelivery",
    color: "text-info",
    category: "Quản lý đơn hàng"
  },
  {
    id: "dealerorder",
    label: "Đơn hàng đại lý",
    icon: "faShoppingCart",
    path: "dealerorder",
    color: "text-primary",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerquotation",
    label: "Báo giá đại lý",
    icon: "faFileAlt",
    path: "dealerquotation",
    color: "text-warning",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerinvoice",
    label: "Hóa đơn đại lý",
    icon: "faFileInvoice",
    path: "dealerinvoice",
    color: "text-info",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerpayment",
    label: "Thanh toán đại lý",
    icon: "faMoneyCheckDollar",
    path: "dealerpayment",
    color: "text-success",
    category: "Quản lý đại lý"
  },
  {
    id: "vehicledelivery",
    label: "Giao hàng đại lý",
    icon: "faTruck",
    path: "vehicledelivery",
    color: "text-info",
    category: "Quản lý đại lý"
  },
  {
    id: "appointment",
    label: "Lịch hẹn",
    icon: "faCalendarCheck",
    path: "appointment",
    color: "text-primary",
    category: "Dịch vụ"
  },
  {
    id: "feedback",
    label: "Phản hồi",
    icon: "faComments",
    path: "feedback",
    color: "text-info",
    category: "Dịch vụ"
  },
  {
    id: "salescontract",
    label: "Hợp đồng bán hàng",
    icon: "faFileContract",
    path: "salescontract",
    color: "text-warning",
    category: "Dịch vụ"
  },
  {
    id: "promotion",
    label: "Khuyến mãi",
    icon: "faTags",
    path: "promotion",
    color: "text-success",
    category: "Khuyến mãi & Chính sách"
  }
];

// Menu items cho Dealer Manager và Dealer Staff
const dealerMenuItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: "faGrip",
    path: "dashboard",
    color: "text-secondary",
    category: "Tổng quan"
  },
  {
    id: "vehicle",
    label: "Truy vấn thông tin xe",
    icon: "faCar",
    color: "text-primary",
    category: "Quản lý sản phẩm",
    children: [
      { id: "vehicle-brand", label: "Thương hiệu", path: "vehiclebrand", viewOnly: true },
      { id: "vehicle-model", label: "Dòng xe", path: "vehiclemodel", viewOnly: true },
      { id: "vehicle-variant", label: "Phiên bản", path: "vehiclevariant", viewOnly: true },
      { id: "vehicle-color", label: "Màu sắc", path: "vehiclcolor", viewOnly: true }
    ]
  },
  {
    id: "dealerorder",
    label: "Đơn hàng đại lý",
    icon: "faShoppingCart",
    path: "dealerorder",
    color: "text-primary",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerquotation",
    label: "Báo giá đại lý",
    icon: "faFileAlt",
    path: "dealerquotation",
    color: "text-warning",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerinvoice",
    label: "Hóa đơn đại lý",
    icon: "faFileInvoice",
    path: "dealerinvoice",
    color: "text-info",
    category: "Quản lý đại lý"
  },
  {
    id: "dealerpayment",
    label: "Thanh toán đại lý",
    icon: "faMoneyCheckDollar",
    path: "dealerpayment",
    color: "text-success",
    category: "Quản lý đại lý"
  },
  {
    id: "vehicledelivery",
    label: "Giao hàng đại lý",
    icon: "faTruck",
    path: "vehicledelivery",
    color: "text-info",
    category: "Quản lý đại lý"
  },
  {
    id: "customer",
    label: "Khách hàng",
    icon: "faUsers",
    path: "customer",
    color: "text-success",
    category: "Quản lý khách hàng"
  },
  {
    id: "order",
    label: "Đơn hàng khách hàng",
    icon: "faShoppingCart",
    path: "order",
    color: "text-purple",
    category: "Quản lý khách hàng"
  },
  {
    id: "quotation",
    label: "Báo giá khách hàng",
    icon: "faFileAlt",
    path: "quotation",
    color: "text-warning",
    category: "Quản lý khách hàng"
  },
  {
    id: "paymentcustomer",
    label: "Thanh toán khách hàng",
    icon: "faMoneyCheckDollar",
    path: "paymentcustomer",
    color: "text-success",
    category: "Quản lý khách hàng"
  },
  {
    id: "cardelivery",
    label: "Giao xe khách hàng",
    icon: "faTruck",
    path: "cardelivery",
    color: "text-info",
    category: "Quản lý khách hàng"
  },
  {
    id: "contract",
    label: "Hợp Đồng",
    icon: "faFileAlt",
    path: "contract",
    color: "text-danger",
    disabled: true, // Chưa có component
    category: "Quản lý khách hàng"
  }
];

// Function để lấy menu items theo role
export const getMenuItemsByRole = (role) => {
  console.log("🔍 getMenuItemsByRole - role:", role);
  switch (role) {
    case "ADMIN":
      return adminMenuItems;
    case "EVM_STAFF":
      return evmStaffMenuItems;
    case "MANAGER":
    case "DEALER_MANAGER": // Xử lý cả DEALER_MANAGER
    case "STAFF":
    case "DEALER_STAFF": // Xử lý cả DEALER_STAFF
      return dealerMenuItems;
    default:
      console.warn("⚠️ Role không khớp, trả về menu rỗng:", role);
      return [];
  }
};

// Function để lấy role display name
export const getRoleDisplayName = (role) => {
  return ROLE_NAMES[role] || role;
};

// Function để check xem user có quyền truy cập route không
export const hasAccessToRoute = (role, routePath) => {
  const menuItems = getMenuItemsByRole(role);
  
  // Check trong menu items
  const hasAccess = menuItems.some(item => {
    if (item.path === routePath) return true;
    if (item.children) {
      return item.children.some(child => child.path === routePath);
    }
    return false;
  });
  
  return hasAccess;
};

// Function để nhóm menu items theo category
export const groupMenuItemsByCategory = (menuItems) => {
  const grouped = {};
  
  menuItems.forEach(item => {
    if (item.disabled) return; // Bỏ qua các item bị disabled
    
    const category = item.category || "Khác";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  return grouped;
};

