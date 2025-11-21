import './Order.css';
import { FaSearch, FaEye, FaPen, FaTrash, FaFileInvoice } from "react-icons/fa";
import { useEffect, useState } from "react";
import { orderAPI, customerAPI, quotationAPI, dealerQuotationAPI, inventoryAPI, publicVehicleAPI, vehicleAPI, customerPaymentAPI } from "../../services/API";

export default function Order() {
  const [order, setOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderForQuotation, setSelectedOrderForQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Track các ID đã xóa để không hiển thị lại
  const [deletedOrderIds, setDeletedOrderIds] = useState(new Set());
  
  // Data for form
  const [customers, setCustomers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    createFrom: "customer", // "customer" - luồng chính: Order trước → Quotation sau
    quotationId: "",
    customerId: "",
    inventoryId: "",
    quantity: 1, // Số lượng xe đặt
    orderDate: new Date().toISOString().split('T')[0],
    orderType: "RETAIL",
    paymentStatus: "PENDING",
    deliveryStatus: "PENDING",
    status: "pending",
    totalAmount: "",
    paymentMethod: "cash",
    deliveryDate: "",
    notes: "",
    specialRequests: "",
  });

  // Lấy danh sách đơn hàng
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getOrders();
      console.log("📦 Raw response từ getOrders:", res);
      console.log("📦 res.data:", res.data);
      
      // Backend trả về nested structure với customer, user, inventory
      let ordersData = res.data?.data || res.data || [];
      console.log("📦 Orders data (raw):", ordersData);
      console.log("📦 Orders count:", Array.isArray(ordersData) ? ordersData.length : 0);
      
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        console.log("📦 First order sample:", ordersData[0]);
        
        // Fetch thêm customer và inventory data nếu chỉ có ID
        const enrichedOrders = await Promise.all(
          ordersData.map(async (order) => {
            let enrichedOrder = { ...order };
            
            // Fetch customer nếu chỉ có customerId
            if (!enrichedOrder.customer && enrichedOrder.customerId) {
              try {
                console.log(`🔄 Fetching customer ${enrichedOrder.customerId} for order ${enrichedOrder.orderId || enrichedOrder.id}`);
                const customerRes = await customerAPI.getCustomer(enrichedOrder.customerId);
                const customerData = customerRes.data?.data || customerRes.data || customerRes;
                enrichedOrder.customer = customerData;
              } catch (err) {
                console.error(`❌ Lỗi fetch customer ${enrichedOrder.customerId}:`, err);
              }
            }
            
            // Fetch inventory nếu chỉ có inventoryId
            if (!enrichedOrder.inventory && enrichedOrder.inventoryId) {
              try {
                console.log(`🔄 Fetching inventory ${enrichedOrder.inventoryId} for order ${enrichedOrder.orderId || enrichedOrder.id}`);
                const inventoryRes = await inventoryAPI.getInventoryById(enrichedOrder.inventoryId);
                const inventoryData = inventoryRes.data?.data || inventoryRes.data || inventoryRes;
                enrichedOrder.inventory = inventoryData;
                
                // Fetch variant nếu inventory có variantId nhưng không có variant object
                if (enrichedOrder.inventory && !enrichedOrder.inventory.variant && enrichedOrder.inventory.variantId) {
                  try {
                    const variantId = enrichedOrder.inventory.variantId;
                    const variantRes = await vehicleAPI.getVariant(variantId);
                    const variantData = variantRes.data?.data || variantRes.data || variantRes;
                    if (variantData) {
                      enrichedOrder.inventory.variant = variantData;
                    }
                  } catch (err) {
                    console.error(`❌ Lỗi fetch variant:`, err);
                  }
                }
              } catch (err) {
                console.error(`❌ Lỗi fetch inventory ${enrichedOrder.inventoryId}:`, err);
              }
            }
            
            // 🔹 Kiểm tra payment từ thanh toán đi lên - nếu có payment completed thì có thể xóa
            const orderIdForPayment = enrichedOrder.orderId || enrichedOrder.id;
            if (orderIdForPayment) {
              try {
                const paymentsRes = await customerPaymentAPI.getPaymentsByOrder(orderIdForPayment);
                const payments = paymentsRes.data?.data || paymentsRes.data || [];
                const completedPayments = payments.filter(p => {
                  const paymentStatus = (p.status || "").toLowerCase().trim();
                  // Hỗ trợ nhiều cách viết: completed, COMPLETED, Completed, hoàn tất, đã hoàn tất
                  return paymentStatus === "completed" || 
                         paymentStatus === "hoàn tất" || 
                         paymentStatus === "đã hoàn tất" ||
                         paymentStatus === "done" ||
                         paymentStatus === "finished";
                });
                // Đánh dấu order có payment completed
                enrichedOrder.hasCompletedPayment = completedPayments.length > 0;
                enrichedOrder.completedPayments = completedPayments;
                if (enrichedOrder.hasCompletedPayment) {
                  console.log(`✅ Order ${orderIdForPayment} có ${completedPayments.length} payment(s) completed`);
                }
              } catch (paymentErr) {
                console.warn(`⚠️ Không thể kiểm tra payment cho order ${orderIdForPayment}:`, paymentErr);
                enrichedOrder.hasCompletedPayment = false;
              }
            } else {
              enrichedOrder.hasCompletedPayment = false;
            }
            
            return enrichedOrder;
          })
        );
        
        ordersData = enrichedOrders;
        console.log("📦 Orders data (enriched):", ordersData);
      }
      
      // 🔹 Filter ra các đơn hàng đã bị xóa - không hiển thị trong danh sách
      ordersData = (Array.isArray(ordersData) ? ordersData : []).filter(o => {
        const orderId = o.orderId || o.id;
        const status = (o.status || "").toLowerCase().trim();
        
        // Kiểm tra nếu ID đã được đánh dấu là đã xóa
        if (orderId && deletedOrderIds.has(String(orderId))) {
          console.log("🚫 Filtered out order (tracked as deleted):", orderId);
          return false;
        }
        
        return true;
      });
      
      setOrder(ordersData);
    } catch (err) {
      console.error("❌ Lỗi khi lấy đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  // Form data cho báo giá
  const [quotationFormData, setQuotationFormData] = useState({
    variantId: "",
    colorId: "",
    totalPrice: "",
    finalPrice: "",
    discountAmount: "",
    discountPercentage: "",
    validityDays: 7,
    notes: "",
  });

  // Fetch data for form
  const fetchData = async () => {
    try {
      console.log("🔄 Đang fetch dữ liệu cho form...");
      
      // Fetch customers - giống như Admin/Customer.jsx
      try {
        const customersRes = await customerAPI.getCustomers();
        const customersData = customersRes.data || [];
        console.log("✅ Customers fetched:", customersData.length, customersData);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch customers:", err);
        console.error("❌ Error details:", err.response?.data);
        setCustomers([]);
      }
      
      // Fetch quotations
      try {
        const [customerQuotationsRes, dealerQuotationsRes] = await Promise.all([
          quotationAPI.getQuotations(),
          dealerQuotationAPI.getQuotations()
        ]);
        const customerQuotationsData = customerQuotationsRes.data || [];
        const dealerQuotationsData = dealerQuotationsRes.data || [];
        const allQuotations = [
          ...(Array.isArray(customerQuotationsData) ? customerQuotationsData : []),
          ...(Array.isArray(dealerQuotationsData) ? dealerQuotationsData : [])
        ];
        console.log("✅ Quotations fetched:", allQuotations.length);
        setQuotations(allQuotations);
      } catch (err) {
        console.error("❌ Lỗi fetch quotations:", err);
        setQuotations([]);
      }
      
      // Fetch inventories - dùng getInventory() và filter AVAILABLE hoặc RESERVED
      try {
        const inventoriesRes = await inventoryAPI.getInventory();
        const allInventories = inventoriesRes.data || [];
        // Filter lấy xe có status AVAILABLE hoặc RESERVED (có thể chọn lại sau khi xóa đơn hàng)
        const availableInventories = Array.isArray(allInventories) 
          ? allInventories.filter(inv => {
              const status = (inv.status?.toUpperCase() || inv.vehicleStatus?.toUpperCase() || "").trim();
              return status === "AVAILABLE" || status === "RESERVED";
            })
          : [];
        console.log("✅ All Inventories:", allInventories.length);
        console.log("✅ Available/Reserved Inventories:", availableInventories.length, availableInventories);
        setInventories(availableInventories);
      } catch (err) {
        console.error("❌ Lỗi fetch inventories:", err);
        console.error("❌ Error details:", err.response?.data);
        setInventories([]);
      }

      // Fetch variants và colors cho form báo giá
      try {
        const [variantsRes, colorsRes] = await Promise.all([
          publicVehicleAPI.getVariants(),
          publicVehicleAPI.getColors()
        ]);
        setVariants(variantsRes.data || []);
        setColors(colorsRes.data || []);
        console.log("✅ Variants fetched:", variantsRes.data?.length || 0);
        console.log("✅ Colors fetched:", colorsRes.data?.length || 0);
      } catch (err) {
        console.error("❌ Lỗi fetch variants/colors:", err);
        setVariants([]);
        setColors([]);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchData();
  }, []);

  // Fetch lại data khi mở popup
  useEffect(() => {
    if (showPopup) {
      console.log("🔄 Popup mở, fetch lại data...");
      fetchData();
    }
  }, [showPopup]);

  // Xóa đơn hàng
  const handleDelete = async (orderId) => {
    // Tìm order để hiển thị thông tin
    const orderToDelete = order.find(o => (o.orderId || o.id) === orderId);
    const orderNumber = orderToDelete?.orderNumber || orderId;
    
    // Lấy danh sách tất cả payments liên quan để xóa trước
    let paymentsToDelete = [];
    try {
      const paymentsRes = await customerPaymentAPI.getPaymentsByOrder(orderId);
      const allPayments = paymentsRes.data || [];
      // Lấy tất cả payments (không chỉ completed) để xóa
      paymentsToDelete = allPayments;
      console.log(`📋 Tìm thấy ${paymentsToDelete.length} payment(s) cho order ${orderId}`);
    } catch (paymentFetchErr) {
      console.warn("⚠️ Không thể fetch payments:", paymentFetchErr);
      // Tiếp tục xóa order dù không fetch được payments
    }
    
    // Lấy inventoryId từ order để reset status về "available" sau khi xóa
    const inventoryId = orderToDelete?.inventoryId || orderToDelete?.inventory?.inventoryId || orderToDelete?.inventory?.id;
    
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng "${orderNumber}" không?\n\n⚠️ Lưu ý: Hành động này sẽ xóa cả các thanh toán liên quan và không thể hoàn tác!`)) {
      return;
    }
    
    try {
      // Xóa các payment liên quan trước để tránh foreign key constraint violation
      if (paymentsToDelete.length > 0) {
        console.log(`🗑️ Đang xóa ${paymentsToDelete.length} payment(s) liên quan...`);
        for (const payment of paymentsToDelete) {
          try {
            const paymentId = payment.paymentId || payment.id;
            if (paymentId) {
              await customerPaymentAPI.deletePayment(paymentId);
              console.log(`✅ Đã xóa payment ${paymentId}`);
            }
          } catch (paymentDeleteErr) {
            console.error(`❌ Lỗi khi xóa payment ${payment.paymentId || payment.id}:`, paymentDeleteErr);
            // Tiếp tục xóa các payment khác
          }
        }
      }
      
      // Xóa đơn hàng
      await orderAPI.deleteOrder(orderId);
      
      // Đánh dấu ID này là đã xóa
      setDeletedOrderIds(prev => new Set([...prev, String(orderId)]));
      
      // Nếu có inventoryId, reset status về "available"
      if (inventoryId) {
        try {
          console.log(`🔄 Đang reset status của inventory ${inventoryId} về "available"...`);
          await inventoryAPI.updateStatus(inventoryId, "available");
          console.log(`✅ Đã reset status của inventory ${inventoryId} về "available"`);
        } catch (invErr) {
          console.error("❌ Lỗi khi reset status inventory:", invErr);
          // Không báo lỗi cho user vì đơn hàng đã xóa thành công, chỉ log
        }
      }
      
      // Đóng popup chi tiết nếu đang mở
      if (showDetail && selectedOrder && (selectedOrder.orderId || selectedOrder.id) === orderId) {
        setShowDetail(false);
        setSelectedOrder(null);
      }
      
      // Xóa khỏi state ngay lập tức thay vì fetchAll để tránh hiển thị lại
      setOrder(prev => {
        const filtered = prev.filter(o => {
          const oid = o.orderId || o.id;
          const shouldKeep = String(oid) !== String(orderId);
          if (!shouldKeep) {
            console.log("🗑️ Removing order from state:", oid);
          }
          return shouldKeep;
        });
        console.log("📊 Orders after deletion:", filtered.length, "remaining");
        return filtered;
      });
      
      alert(`✅ Xóa đơn hàng "${orderNumber}" thành công!${inventoryId ? '\n\n✅ Đã giải phóng xe về trạng thái "available".' : ''}`);
      
      // Fetch lại inventories sau khi xóa (để cập nhật danh sách xe có thể chọn)
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (err) {
      console.error("❌ Lỗi khi xóa đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Xóa thất bại!";
      alert(`❌ Xóa thất bại!\n\n${errorMsg}`);
    }
  };

  // Tìm kiếm
  const filteredOrders = (order || []).filter((o) => {
    if (!o) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (o.orderNumber && String(o.orderNumber).toLowerCase().includes(keyword)) ||
      (o.status && String(o.status).toLowerCase().includes(keyword)) ||
      // Backend mới: customer trực tiếp
      (o.customer?.firstName && String(o.customer.firstName).toLowerCase().includes(keyword)) ||
      (o.customer?.lastName && String(o.customer.lastName).toLowerCase().includes(keyword)) ||
      (o.customer?.email && String(o.customer.email).toLowerCase().includes(keyword)) ||
      (o.customer?.phone && String(o.customer.phone).toLowerCase().includes(keyword)) ||
      // Fallback: quotation?.customer (backward compatibility)
      (o.quotation?.customer?.firstName && String(o.quotation.customer.firstName).toLowerCase().includes(keyword)) ||
      (o.quotation?.customer?.lastName && String(o.quotation.customer.lastName).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (orderId) => {
    try {
      // Tìm order trong danh sách hiện tại trước (có thể đã có customer và inventory data)
      const existingOrder = order.find(o => (o.orderId || o.id) === orderId);
      
      // Luôn fetch từ API để đảm bảo có dữ liệu mới nhất (bao gồm payment info)
      // if (existingOrder && existingOrder.customer && existingOrder.inventory) {
      //   console.log("📋 Using existing order data with customer and inventory:", existingOrder);
      //   setSelectedOrder(existingOrder);
      //   setShowDetail(true);
      //   return;
      // }
      
      // Luôn fetch từ API để đảm bảo có dữ liệu mới nhất
      const res = await orderAPI.getOrder(orderId);
      let orderData = res.data?.data || res.data || res;
      console.log("📋 Order detail data from API (FULL):", JSON.stringify(orderData, null, 2));
      console.log("📋 Customer data:", orderData.customer);
      console.log("📋 Customer ID:", orderData.customerId);
      console.log("📋 Inventory data:", orderData.inventory);
      console.log("📋 Inventory ID:", orderData.inventoryId);
      console.log("💰 Payment fields in orderData:", {
        totalAmount: orderData.totalAmount,
        totalAmountType: typeof orderData.totalAmount
      });
      
      // Nếu không có customer data nhưng có customerId, fetch customer riêng
      if (!orderData.customer && orderData.customerId) {
        try {
          console.log("🔄 Fetching customer data separately...");
          const customerRes = await customerAPI.getCustomer(orderData.customerId);
          const customerData = customerRes.data?.data || customerRes.data || customerRes;
          console.log("✅ Customer data fetched:", customerData);
          orderData = { ...orderData, customer: customerData };
        } catch (customerErr) {
          console.error("❌ Lỗi khi fetch customer:", customerErr);
          // Tiếp tục với orderData không có customer
        }
      }
      
      // Nếu không có inventory data nhưng có inventoryId, fetch inventory riêng
      if (!orderData.inventory && orderData.inventoryId) {
        try {
          console.log("🔄 Fetching inventory data separately...");
          const inventoryRes = await inventoryAPI.getInventoryById(orderData.inventoryId);
          const inventoryData = inventoryRes.data?.data || inventoryRes.data || inventoryRes;
          console.log("✅ Inventory data fetched:", inventoryData);
          orderData = { ...orderData, inventory: inventoryData };
        } catch (inventoryErr) {
          console.error("❌ Lỗi khi fetch inventory:", inventoryErr);
          // Tiếp tục với orderData không có inventory
        }
      }
      
      // Nếu có inventory nhưng variant không đầy đủ (chỉ có ID), fetch variant riêng
      if (orderData.inventory && (!orderData.inventory.variant || !orderData.inventory.variant.model) && (orderData.inventory.variantId || orderData.inventory.variant?.variantId || orderData.inventory.variant?.id)) {
        try {
          console.log("🔄 Fetching variant data separately...");
          const variantId = orderData.inventory.variantId || orderData.inventory.variant?.variantId || orderData.inventory.variant?.id;
          if (variantId) {
            // Thử fetch variant trực tiếp trước
            try {
              const variantRes = await vehicleAPI.getVariant(variantId);
              const variantData = variantRes.data?.data || variantRes.data || variantRes;
              if (variantData) {
                console.log("✅ Variant data fetched directly:", variantData);
                orderData.inventory = {
                  ...orderData.inventory,
                  variant: variantData
                };
              }
            } catch (directErr) {
              // Fallback: tìm trong danh sách variants
              console.log("⚠️ Direct fetch failed, trying list...");
              const variantRes = await publicVehicleAPI.getVariants();
              const allVariants = variantRes.data || [];
              const variantData = allVariants.find(v => (v.variantId || v.id) == variantId);
              if (variantData) {
                console.log("✅ Variant data found in list:", variantData);
                orderData.inventory = {
                  ...orderData.inventory,
                  variant: variantData
                };
              }
            }
          }
        } catch (variantErr) {
          console.error("❌ Lỗi khi fetch variant:", variantErr);
        }
      }
      
      // Nếu có inventory nhưng color không đầy đủ (chỉ có ID), fetch color riêng
      if (orderData.inventory && !orderData.inventory.color && (orderData.inventory.colorId || orderData.inventory.color?.colorId || orderData.inventory.color?.id)) {
        try {
          console.log("🔄 Fetching color data separately...");
          const colorId = orderData.inventory.colorId || orderData.inventory.color?.colorId || orderData.inventory.color?.id;
          if (colorId) {
            // Thử fetch color trực tiếp trước
            try {
              const colorRes = await vehicleAPI.getColor(colorId);
              const colorData = colorRes.data?.data || colorRes.data || colorRes;
              if (colorData) {
                console.log("✅ Color data fetched directly:", colorData);
                orderData.inventory = {
                  ...orderData.inventory,
                  color: colorData
                };
              }
            } catch (directErr) {
              // Fallback: tìm trong danh sách colors
              console.log("⚠️ Direct fetch failed, trying list...");
              const colorRes = await publicVehicleAPI.getColors();
              const allColors = colorRes.data || [];
              const colorData = allColors.find(c => (c.colorId || c.id) == colorId);
              if (colorData) {
                console.log("✅ Color data found in list:", colorData);
                orderData.inventory = {
                  ...orderData.inventory,
                  color: colorData
                };
              }
            }
          }
        } catch (colorErr) {
          console.error("❌ Lỗi khi fetch color:", colorErr);
        }
      }
      
      // Tương tự cho quotation nếu có
      if (orderData.quotation && (!orderData.quotation.variant || !orderData.quotation.variant.model) && (orderData.quotation.variantId || orderData.quotation.variant?.variantId || orderData.quotation.variant?.id)) {
        try {
          console.log("🔄 Fetching quotation variant data separately...");
          const variantId = orderData.quotation.variantId || orderData.quotation.variant?.variantId || orderData.quotation.variant?.id;
          if (variantId) {
            try {
              const variantRes = await vehicleAPI.getVariant(variantId);
              const variantData = variantRes.data?.data || variantRes.data || variantRes;
              if (variantData) {
                console.log("✅ Quotation variant data fetched directly:", variantData);
                orderData.quotation = {
                  ...orderData.quotation,
                  variant: variantData
                };
              }
            } catch (directErr) {
              const variantRes = await publicVehicleAPI.getVariants();
              const allVariants = variantRes.data || [];
              const variantData = allVariants.find(v => (v.variantId || v.id) == variantId);
              if (variantData) {
                console.log("✅ Quotation variant data found in list:", variantData);
                orderData.quotation = {
                  ...orderData.quotation,
                  variant: variantData
                };
              }
            }
          }
        } catch (variantErr) {
          console.error("❌ Lỗi khi fetch quotation variant:", variantErr);
        }
      }
      
      if (orderData.quotation && !orderData.quotation.color && (orderData.quotation.colorId || orderData.quotation.color?.colorId || orderData.quotation.color?.id)) {
        try {
          console.log("🔄 Fetching quotation color data separately...");
          const colorId = orderData.quotation.colorId || orderData.quotation.color?.colorId || orderData.quotation.color?.id;
          if (colorId) {
            try {
              const colorRes = await vehicleAPI.getColor(colorId);
              const colorData = colorRes.data?.data || colorRes.data || colorRes;
              if (colorData) {
                console.log("✅ Quotation color data fetched directly:", colorData);
                orderData.quotation = {
                  ...orderData.quotation,
                  color: colorData
                };
              }
            } catch (directErr) {
              const colorRes = await publicVehicleAPI.getColors();
              const allColors = colorRes.data || [];
              const colorData = allColors.find(c => (c.colorId || c.id) == colorId);
              if (colorData) {
                console.log("✅ Quotation color data found in list:", colorData);
                orderData.quotation = {
                  ...orderData.quotation,
                  color: colorData
                };
              }
            }
          }
        } catch (colorErr) {
          console.error("❌ Lỗi khi fetch quotation color:", colorErr);
        }
      }
      
      console.log("📋 Final order data with customer and inventory:", orderData);
      console.log("📋 Customer phone:", orderData.customer?.phone, orderData.customer?.phoneNumber, orderData.customer?.mobile);
      console.log("📋 Inventory variant:", orderData.inventory?.variant, orderData.quotation?.variant);
      console.log("💰 Payment info:", {
        totalAmount: orderData.totalAmount,
        quotationFinalPrice: orderData.quotation?.finalPrice
      });
      setSelectedOrder(orderData);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      alert("Không thể tải chi tiết đơn hàng!");
    }
  };

  // Mở form tạo báo giá
  const handleOpenQuotationForm = async (order) => {
    setSelectedOrderForQuotation(order);
    setError("");
    
    // Tự động điền dữ liệu từ order
    const inventory = order.inventory;
    const variantId = inventory?.variantId || inventory?.variant?.variantId || inventory?.variant?.id;
    const colorId = inventory?.colorId || inventory?.color?.colorId || inventory?.color?.id;
    
    // Lấy giá từ order
    let totalPrice = order.totalAmount || order.total_amount || 0;
    if (!totalPrice || totalPrice === 0) {
      totalPrice = inventory?.sellingPrice || inventory?.costPrice || inventory?.price || 0;
    }
    
    // Mặc định finalPrice = totalPrice (chưa giảm giá)
    const finalPrice = totalPrice;
    const discountAmount = 0;
    const discountPercentage = 0;
    
    setQuotationFormData({
      variantId: variantId ? String(variantId) : "",
      colorId: colorId ? String(colorId) : "",
      totalPrice: totalPrice > 0 ? String(totalPrice) : "",
      finalPrice: finalPrice > 0 ? String(finalPrice) : "",
      discountAmount: String(discountAmount),
      discountPercentage: String(discountPercentage),
      validityDays: 7,
      notes: order.notes || "",
    });
    
    setShowQuotationForm(true);
  };

  // Tính discountAmount tự động từ finalPrice (chỉ khi không có discountPercentage)
  useEffect(() => {
    // Nếu user đã nhập discountPercentage, không tự động tính từ finalPrice
    if (quotationFormData.discountPercentage && parseFloat(quotationFormData.discountPercentage) > 0) {
      return;
    }
    
    if (quotationFormData.totalPrice && quotationFormData.finalPrice) {
      const total = parseFloat(quotationFormData.totalPrice) || 0;
      const final = parseFloat(quotationFormData.finalPrice) || 0;
      const discount = total - final;
      const currentDiscount = parseFloat(quotationFormData.discountAmount || 0);
      // Chỉ update nếu discount thay đổi và >= 0
      if (discount >= 0 && Math.abs(discount - currentDiscount) > 0.01) {
        setQuotationFormData(prev => ({ ...prev, discountAmount: discount.toFixed(2) }));
      }
    } else if (!quotationFormData.totalPrice || !quotationFormData.finalPrice) {
      // Reset discount nếu một trong hai field bị xóa
      if (quotationFormData.discountAmount) {
        setQuotationFormData(prev => ({ ...prev, discountAmount: "" }));
      }
    }
  }, [quotationFormData.totalPrice, quotationFormData.finalPrice, quotationFormData.discountPercentage]);

  // Tạo báo giá từ order
  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedOrderForQuotation) {
      setError("Không tìm thấy đơn hàng!");
      return;
    }

    const orderId = selectedOrderForQuotation.orderId || selectedOrderForQuotation.id;
    if (!orderId) {
      setError("Không tìm thấy ID đơn hàng!");
      return;
    }

    if (!quotationFormData.variantId || !quotationFormData.colorId) {
      setError("Vui lòng chọn biến thể và màu sắc!");
      return;
    }

    if (!quotationFormData.totalPrice || !quotationFormData.finalPrice) {
      setError("Vui lòng nhập tổng giá và giá cuối cùng!");
      return;
    }

    try {
      const payload = {
        variantId: Number(quotationFormData.variantId),
        colorId: Number(quotationFormData.colorId),
        totalPrice: parseFloat(quotationFormData.totalPrice),
        finalPrice: parseFloat(quotationFormData.finalPrice),
        discountAmount: parseFloat(quotationFormData.discountAmount) || 0,
        validityDays: Number(quotationFormData.validityDays) || 7,
        notes: quotationFormData.notes || null,
      };

      console.log("📤 Payload tạo báo giá:", payload);
      console.log("📤 Order ID:", orderId);

      const res = await quotationAPI.createQuotationFromOrder(orderId, payload);
      console.log("✅ Response từ createQuotationFromOrder:", res);
      console.log("✅ Response data:", res.data);
      console.log("✅ Response data.data:", res.data?.data);
      
      const quotationData = res.data?.data || res.data || res;
      console.log("✅ Quotation data:", quotationData);
      console.log("✅ Quotation orderId:", quotationData.orderId);

      alert(`✅ Tạo báo giá thành công!\n\n📋 Số báo giá: ${quotationData.quotationNumber || quotationData.quotationId || "—"}\n💰 Tổng giá: ${quotationData.totalPrice ? parseFloat(quotationData.totalPrice).toLocaleString('vi-VN') : '0'} ₫\n\n💡 Vui lòng vào trang "Báo giá" để xem chi tiết.`);
      setShowQuotationForm(false);
      setSelectedOrderForQuotation(null);
      
      // Reset form
      setQuotationFormData({
        variantId: "",
        colorId: "",
        totalPrice: "",
        finalPrice: "",
        discountAmount: "",
        validityDays: 7,
        notes: "",
      });

      // Fetch lại danh sách orders
      setTimeout(() => {
        fetchOrder();
      }, 500);
    } catch (err) {
      console.error("❌ Lỗi khi tạo báo giá:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo báo giá!";
      setError(errorMsg);
      alert(`Tạo báo giá thất bại!\n${errorMsg}`);
    }
  };

  // Helper functions
  const getCustomerName = (orderOrCustomer) => {
    // Nếu là order object (backend mới)
    if (orderOrCustomer && typeof orderOrCustomer === 'object' && 'orderId' in orderOrCustomer) {
      const order = orderOrCustomer;
      // Backend mới trả về customer trực tiếp trong order
      if (order.customer) {
        const customer = order.customer;
        if (customer.firstName && customer.lastName) {
          return `${customer.firstName} ${customer.lastName}`;
        }
        return customer.fullName || customer.name || "—";
      }
      // Fallback: kiểm tra quotation?.customer (backward compatibility)
      if (order.quotation?.customer) {
        const customer = order.quotation.customer;
        if (customer.firstName && customer.lastName) {
          return `${customer.firstName} ${customer.lastName}`;
        }
        return customer.fullName || customer.name || "—";
      }
      return "—";
    }
    // Nếu là customer object (cho quotations, form dropdowns)
    const customer = orderOrCustomer;
    if (!customer) return "—";
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    return customer.fullName || customer.name || "—";
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  // Tạo đơn hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation: Cần quotationId hoặc customerId
    if (formData.createFrom === "quotation") {
      if (!formData.quotationId) {
        setError("Vui lòng chọn báo giá!");
        return;
      }
    } else {
      if (!formData.customerId) {
        setError("Vui lòng chọn khách hàng!");
        return;
      }
    }

    if (!formData.orderDate) {
      setError("Vui lòng chọn ngày đặt hàng!");
      return;
    }

    // Validation: Nếu có totalAmount thì phải có giá trị hợp lệ
    if (formData.totalAmount && parseFloat(formData.totalAmount) <= 0) {
      setError("Tổng tiền phải lớn hơn 0!");
      return;
    }


    try {
      // Chuẩn bị payload theo OrderRequest DTO - chỉ gửi các field cần thiết
      const payload = {
        // UUID fields - đảm bảo là string
        quotationId: formData.createFrom === "quotation" && formData.quotationId ? String(formData.quotationId).trim() : null,
        customerId: formData.createFrom === "customer" && formData.customerId ? String(formData.customerId).trim() : null,
        inventoryId: formData.inventoryId ? String(formData.inventoryId).trim() : null,
        // Date fields - chỉ gửi orderDate (bắt buộc), bỏ deliveryDate để tránh lỗi constraint
        orderDate: formData.orderDate || null,
        // Enum fields - chỉ gửi các field cơ bản
        orderType: formData.orderType || null,
        paymentStatus: formData.paymentStatus || null,
        deliveryStatus: formData.deliveryStatus || null,
        // String fields
        status: formData.status || null,
        paymentMethod: formData.paymentMethod || null,
        notes: formData.notes || null,
        // BigDecimal fields - chỉ gửi totalAmount
        totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : null,
      };

      // Xóa các field null/empty để tránh lỗi constraint
      // NHƯNG giữ lại totalAmount nếu có giá trị (dù là 0)
      Object.keys(payload).forEach(key => {
        if (key === 'totalAmount') {
          // Giữ lại totalAmount nếu có giá trị (kể cả 0)
        if (payload[key] === null || payload[key] === "" || payload[key] === undefined) {
          delete payload[key];
          }
        } else {
          // Xóa các field khác nếu null/empty
          if (payload[key] === null || payload[key] === "" || payload[key] === undefined) {
            delete payload[key];
          }
        }
      });
      
      console.log("📤 Payload gửi lên server (với totalAmount):", payload);
      console.log("📤 totalAmount value:", payload.totalAmount, "type:", typeof payload.totalAmount);
      
      // Đảm bảo quotationId hoặc customerId có giá trị (backend yêu cầu)
      if (!payload.quotationId && !payload.customerId) {
        setError("Vui lòng chọn báo giá hoặc khách hàng!");
        return;
      }

      console.log("📤 Payload tạo order:", payload);

      const createRes = await orderAPI.createOrder(payload);
      console.log("✅ Response từ createOrder:", createRes);
      
      const orderData = createRes.data || createRes.data?.data || createRes;
      const orderNumber = orderData?.orderNumber || orderData?.orderId || "—";
      const savedTotalAmount = orderData?.totalAmount || orderData?.total_amount || 0;
      
      console.log("💰 TotalAmount đã lưu:", savedTotalAmount);
      
      alert(`✅ Tạo đơn hàng thành công!\n\n📋 Số đơn hàng: ${orderNumber}\n💰 Tổng tiền: ${savedTotalAmount > 0 ? savedTotalAmount.toLocaleString('vi-VN') : '0'} ₫\n\n💡 Bước tiếp theo: Tạo báo giá từ đơn hàng này bằng cách click nút "Tạo báo giá" (📄) trong danh sách.`);
      setShowPopup(false);
      
      // Reset form
      setFormData({
        createFrom: "customer", // Luồng chính: Order trước → Quotation sau
        quotationId: "",
        customerId: "",
        inventoryId: "",
        quantity: 1, // Reset về 1 xe
        orderDate: new Date().toISOString().split('T')[0],
        orderType: "RETAIL",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        status: "pending",
        totalAmount: "",
        paymentMethod: "cash",
        deliveryDate: "",
        notes: "",
        specialRequests: "",
      });
      
      // Fetch lại danh sách
      setTimeout(() => {
        fetchOrder();
      }, 500);
    } catch (err) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo đơn hàng!";
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý đơn hàng</div>

      <div className="title2-customer">
        <h2>Danh sách đơn hàng</h2>
        <h3 onClick={() => setShowPopup(true)}>+ Thêm đơn hàng</h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm đơn hàng..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ ĐƠN HÀNG</th>
              <th>KHÁCH HÀNG</th>
              <th>XE ĐẶT MUA</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY ĐẶT HÀNG</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "#666" }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((o, index) => {
                const orderId = o.orderId || o.id || `order-${index}`;
                return (
                  <tr key={orderId}>
                    <td>{o.orderNumber || "—"}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {(() => {
                          const customer = o.customer || o.quotation?.customer;
                          const firstName = customer?.firstName || customer?.first_name || '';
                          const lastName = customer?.lastName || customer?.last_name || '';
                          const fullName = `${firstName} ${lastName}`.trim();
                          
                          if (!fullName && o.customerId) {
                            console.log("⚠️ Order có customerId nhưng không có customer data:", o.customerId, o);
                          }
                          
                          return fullName ? (
                            <>
                              <span style={{ fontWeight: "500" }}>{fullName}</span>
                              {customer?.email && (
                                <span style={{ fontSize: "12px", color: "#666" }}>{customer.email}</span>
                              )}
                            </>
                          ) : (
                            <span style={{ color: "#999", fontStyle: "italic" }}>—</span>
                          );
                        })()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {(() => {
                          const inventory = o.inventory;
                          const quotation = o.quotation;
                          const variant = inventory?.variant || quotation?.variant;
                          const brand = variant?.model?.brand || variant?.brand;
                          const model = variant?.model || variant;
                          
                          const brandName = brand?.brandName || brand?.brand_name || brand?.name;
                          const variantName = variant?.variantName || variant?.variant_name || variant?.name;
                          const modelName = model?.modelName || model?.model_name || model?.name;
                          
                          if (!brandName && !variantName && !modelName && (o.inventoryId || inventory?.variantId)) {
                            console.log("⚠️ Order có inventoryId/variantId nhưng không có variant data:", {
                              orderId: o.orderId || o.id,
                              inventoryId: o.inventoryId,
                              variantId: inventory?.variantId || variant?.variantId || variant?.id,
                              inventory: inventory,
                              variant: variant
                            });
                          }
                          
                          if (brandName || variantName || modelName) {
                            return (
                              <>
                                <span style={{ fontWeight: "500" }}>
                                  {brandName || modelName || variantName || 'N/A'}
                                </span>
                                <span style={{ fontSize: "12px", color: "#666" }}>
                                  {variantName || modelName || 'N/A'}
                                </span>
                              </>
                            );
                          } else {
                            return <span style={{ color: "#999", fontStyle: "italic" }}>—</span>;
                          }
                        })()}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "bold", color: "#16a34a", fontSize: "14px" }}>
                        {(() => {
                          // Ưu tiên 1: totalAmount từ order
                          let total = o.totalAmount || o.total_amount;
                          
                          // Ưu tiên 2: finalPrice từ quotation
                          if (!total || total === 0) {
                            total = o.quotation?.finalPrice || o.quotation?.final_price;
                          }
                          
                          // Ưu tiên 3: Giá từ inventory (kho xe)
                          if (!total || total === 0) {
                            const inventory = o.inventory;
                            if (inventory) {
                              total = inventory.sellingPrice 
                                || inventory.costPrice 
                                || inventory.price
                                || inventory.selling_price
                                || inventory.cost_price;
                            }
                          }
                          
                          const totalNum = typeof total === 'string' ? parseFloat(total) : (total || 0);
                          return totalNum > 0 ? totalNum.toLocaleString('vi-VN') : '0';
                        })()} ₫
                      </span>
                    </td>
                    <td>{o.status || "—"}</td>
                    <td>{formatDate(o.orderDate)}</td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(orderId)} title="Xem chi tiết">
                        <FaEye />
                      </button>
                      {/* Chỉ hiển thị nút "Tạo báo giá" cho Order có status "pending" (chưa có quotation) */}
                      {(o.status === "pending" || o.status === "PENDING") && (
                        <button 
                          className="icon-btn edit" 
                          onClick={() => handleOpenQuotationForm(o)} 
                          title="Tạo báo giá từ đơn hàng này"
                          style={{ backgroundColor: "#3b82f6", color: "white" }}
                        >
                          <FaFileInvoice />
                        </button>
                      )}
                      {/* Chỉ hiển thị nút xóa khi đơn hàng có trạng thái "cancelled" */}
                      {(() => {
                        const orderStatus = (o.status || "").toLowerCase().trim();
                        const isCancelled = orderStatus === "cancelled" || 
                                          orderStatus === "đã hủy" || 
                                          orderStatus === "hủy" ||
                                          orderStatus === "canceled";
                        return isCancelled && (
                          <button 
                            className="icon-btn delete" 
                            onClick={() => handleDelete(orderId)} 
                            title="Xóa đơn hàng đã hủy"
                          >
                            <FaTrash />
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm đơn hàng */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm đơn hàng mới</h2>
            <form onSubmit={handleSubmit}>
              <div className="info-box">
                <strong>📋 Luồng chính:</strong>
                <p>
                  1️⃣ Tạo Order từ khách hàng (bước này) → 2️⃣ Tạo Quotation từ Order → 3️⃣ Gửi báo giá → 4️⃣ Khách accept
                </p>
              </div>
              {error && <div className="error-message">{error}</div>}
              
              {/* Section: Loại tạo đơn hàng */}
              <div className="form-section">
                <div className="form-section-title">Loại tạo đơn hàng</div>
                <div className="form-grid">
                  <div className="form-field-full">
                    <label>Tạo từ *</label>
                    <select
                      value={formData.createFrom}
                      onChange={(e) => setFormData({ ...formData, createFrom: e.target.value, quotationId: "", customerId: "", inventoryId: "", quantity: 1, totalAmount: "" })}
                      required
                    >
                      <option value="customer">Từ khách hàng (Luồng chính) ✅</option>
                      <option value="quotation">Từ báo giá (Luồng phụ)</option>
                    </select>
                    <small>
                      💡 <strong>Luồng chính:</strong> Tạo Order từ khách hàng trước, sau đó tạo Quotation từ Order đó
                    </small>
                  </div>
                </div>
              </div>

              {/* Section: Thông tin khách hàng và xe */}
              {formData.createFrom === "quotation" ? (
                <div className="form-section">
                  <div className="form-section-title">Thông tin báo giá</div>
                  <div className="form-grid">
                    <div className="form-field-full">
                      <label>Báo giá *</label>
                      <select
                        value={formData.quotationId}
                        onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}
                        required
                      >
                        <option value="">-- Chọn báo giá --</option>
                        {quotations
                          .filter(q => q.status === "ACCEPTED" || q.status === "accepted" || q.status === "SENT" || q.status === "sent")
                          .map(q => (
                            <option key={q.quotationId || q.id} value={q.quotationId || q.id}>
                              {q.quotationNumber || q.quotationId} - {getCustomerName(q.customer)} - {formatPrice(q.finalPrice || q.totalAmount)}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-section">
                  <div className="form-section-title">Thông tin khách hàng và xe</div>
                  <div className="form-grid">
                    <div className="form-field-full">
                      <label>Khách hàng *</label>
                      <select
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        required
                      >
                        <option value="">-- Chọn khách hàng --</option>
                        {customers && customers.length > 0 ? (
                          customers.map(c => {
                            const customerId = c.customerId || c.id;
                            return (
                              <option key={customerId} value={customerId}>
                                {getCustomerName(c)}
                              </option>
                            );
                          })
                        ) : (
                          <option value="" disabled>Không có khách hàng nào</option>
                        )}
                      </select>
                      {customers && customers.length === 0 && (
                        <small style={{ color: "#ff6b6b" }}>
                          ⚠️ Không có khách hàng nào. Vui lòng tạo khách hàng trước.
                        </small>
                      )}
                    </div>

                    <div className="form-field-full">
                      <label>Xe từ kho (tùy chọn)</label>
                      <select
                        value={formData.inventoryId}
                        onChange={(e) => {
                          const selectedInventoryId = e.target.value;
                          const selectedInventory = inventories.find(inv => (inv.inventoryId || inv.id) === selectedInventoryId);
                          
                          // Tự động tính tổng tiền từ giá xe và số lượng
                          if (selectedInventory) {
                            const price = parseFloat(selectedInventory.sellingPrice) || parseFloat(selectedInventory.costPrice) || parseFloat(selectedInventory.price) || 0;
                            const quantity = parseFloat(formData.quantity) || 1;
                            const totalPrice = price * quantity;
                            
                            console.log("💰 Tính tổng tiền:", {
                              inventory: selectedInventory,
                              sellingPrice: selectedInventory.sellingPrice,
                              costPrice: selectedInventory.costPrice,
                              price: selectedInventory.price,
                              parsedPrice: price,
                              quantity: quantity,
                              totalPrice: totalPrice
                            });
                            
                            setFormData({ 
                              ...formData, 
                              inventoryId: selectedInventoryId,
                              totalAmount: totalPrice > 0 ? String(totalPrice) : ""
                            });
                          } else {
                            setFormData({ 
                              ...formData, 
                              inventoryId: "",
                              totalAmount: ""
                            });
                          }
                        }}
                      >
                        <option value="">-- Chọn xe từ kho --</option>
                        {inventories && inventories.length > 0 ? (
                          inventories.map(inv => {
                            const inventoryId = inv.inventoryId || inv.id;
                            const variantName = inv.variant?.variantName || inv.variantName || "N/A";
                            const colorName = inv.color?.colorName || inv.colorName || "N/A";
                            const price = inv.sellingPrice || inv.costPrice || 0;
                            return (
                              <option key={inventoryId} value={inventoryId}>
                                {variantName} - {colorName} - {formatPrice(price)}
                              </option>
                            );
                          })
                        ) : (
                          <option value="" disabled>Không có xe nào trong kho</option>
                        )}
                      </select>
                      {inventories && inventories.length === 0 && (
                        <small style={{ color: "#ff6b6b" }}>
                          ⚠️ Không có xe nào trong kho.
                        </small>
                      )}
                      {formData.inventoryId && (
                        <small style={{ color: "#16a34a" }}>
                          ✅ Đã chọn xe, giá sẽ tự động điền vào tổng tiền
                        </small>
                      )}
                    </div>

                    <div>
                      <label>Số lượng xe *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 1;
                          
                          // LUÔN tính lại tổng tiền dựa trên giá xe đã chọn và số lượng mới
                          if (formData.inventoryId) {
                            const selectedInventory = inventories.find(inv => (inv.inventoryId || inv.id) === formData.inventoryId);
                            if (selectedInventory) {
                              const price = parseFloat(selectedInventory.sellingPrice) || parseFloat(selectedInventory.costPrice) || parseFloat(selectedInventory.price) || 0;
                              const totalPrice = price * quantity;
                              
                              console.log("💰 Tính lại tổng tiền (thay đổi số lượng):", {
                                price: price,
                                quantity: quantity,
                                totalPrice: totalPrice,
                                oldTotalAmount: formData.totalAmount
                              });
                              
                              setFormData({ 
                                ...formData, 
                                quantity: quantity,
                                totalAmount: totalPrice > 0 ? String(totalPrice) : ""
                              });
                            } else {
                              setFormData({ ...formData, quantity: quantity });
                            }
                          } else {
                            // Nếu chưa chọn xe, vẫn cho phép thay đổi số lượng nhưng không tính totalAmount
                            setFormData({ ...formData, quantity: quantity });
                          }
                        }}
                        required
                        placeholder="Nhập số lượng xe"
                      />
                      <small>
                        💡 Số lượng xe cần đặt (tối thiểu 1 xe). Tổng tiền sẽ tự động tính = Giá xe × Số lượng
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Thông tin đơn hàng */}
              <div className="form-section">
                <div className="form-section-title">Thông tin đơn hàng</div>
                <div className="form-grid">
                  <div>
                    <label>Ngày đặt hàng *</label>
                    <input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label>Loại đơn hàng</label>
                    <select
                      value={formData.orderType}
                      onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                    >
                      <option value="RETAIL">Bán lẻ</option>
                      <option value="WHOLESALE">Bán buôn</option>
                      <option value="DEMO">Demo</option>
                      <option value="TEST_DRIVE">Lái thử</option>
                    </select>
                  </div>

                  <div>
                    <label>Trạng thái thanh toán</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    >
                      <option value="PENDING">Chờ thanh toán</option>
                      <option value="PARTIAL">Thanh toán một phần</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="OVERDUE">Quá hạn</option>
                      <option value="REFUNDED">Đã hoàn tiền</option>
                    </select>
                  </div>

                  <div>
                    <label>Trạng thái giao hàng</label>
                    <select
                      value={formData.deliveryStatus}
                      onChange={(e) => setFormData({ ...formData, deliveryStatus: e.target.value })}
                    >
                      <option value="PENDING">Chờ giao hàng</option>
                      <option value="SCHEDULED">Đã lên lịch</option>
                      <option value="IN_TRANSIT">Đang vận chuyển</option>
                      <option value="DELIVERED">Đã giao</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label>Trạng thái đơn hàng</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="quoted">Đã báo giá</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="delivered">Đã giao</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="rejected">Từ chối</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                  <div>
                    <label>Phương thức thanh toán</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="bank_transfer">Chuyển khoản</option>
                      <option value="credit_card">Thẻ tín dụng</option>
                      <option value="installment">Trả góp</option>
                    </select>
                  </div>

                  <div>
                    <label>Ngày giao hàng</label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Tổng tiền */}
              <div className="form-section">
                <div className="form-section-title">Tổng tiền</div>
                <div className="form-grid">
                  <div className="form-field-full">
                    <label>Tổng tiền (VNĐ) *</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.totalAmount}
                      onChange={(e) => {
                        // Nếu đã chọn xe từ kho, vẫn cho phép chỉnh sửa nhưng sẽ bị ghi đè khi quantity thay đổi
                        setFormData({ 
                          ...formData, 
                          totalAmount: e.target.value
                        });
                      }}
                      placeholder={formData.inventoryId ? "Tự động tính từ giá xe × số lượng" : "Nhập tổng tiền đặt xe"}
                      required
                      className={formData.inventoryId ? "auto-calculated" : ""}
                      title={formData.inventoryId ? "Tổng tiền sẽ tự động tính lại khi số lượng thay đổi" : ""}
                    />
                    {formData.inventoryId && formData.totalAmount && (() => {
                      const selectedInventory = inventories.find(inv => (inv.inventoryId || inv.id) === formData.inventoryId);
                      if (!selectedInventory) return null;
                      
                      const unitPrice = parseFloat(selectedInventory.sellingPrice) || parseFloat(selectedInventory.costPrice) || parseFloat(selectedInventory.price) || 0;
                      const quantity = parseFloat(formData.quantity) || 1;
                      const total = parseFloat(formData.totalAmount) || 0;
                      
                      return (
                        <small style={{ color: "#16a34a" }}>
                          ✅ Tổng tiền = Giá xe ({formatPrice(unitPrice)}) × Số lượng ({quantity} xe) = {formatPrice(total)}
                        </small>
                      );
                    })()}
                    {!formData.inventoryId && (
                      <small>
                        💡 Tổng số tiền khách hàng cần thanh toán (hoặc chọn xe từ kho để tự động tính)
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Ghi chú */}
              <div className="form-section">
                <div className="form-section-title">Ghi chú và yêu cầu</div>
                <div className="form-grid">
                  <div className="form-field-full">
                    <label>Ghi chú</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                      placeholder="Nhập ghi chú cho đơn hàng..."
                    />
                  </div>

                  <div className="form-field-full">
                    <label>Yêu cầu đặc biệt</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      rows="2"
                      placeholder="Nhập yêu cầu đặc biệt của khách hàng..."
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit">Tạo đơn hàng</button>
                <button type="button" onClick={() => setShowPopup(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết đặt hàng */}
      {showDetail && selectedOrder && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>Thông tin đặt hàng</h2>
            <div className="detail-content" style={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}>
              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#1e293b" }}>Thông tin đơn hàng</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <b>Số đơn hàng:</b> {selectedOrder.orderNumber || "—"}
                  </div>
                  <div>
                    <b>Trạng thái:</b> {selectedOrder.status || "—"}
                  </div>
                  <div>
                    <b>Loại đơn hàng:</b> {selectedOrder.orderType || "—"}
                  </div>
                  <div>
                    <b>Ngày đặt hàng:</b> {formatDate(selectedOrder.orderDate)}
                  </div>
                  {selectedOrder.paymentStatus && (
                    <div>
                      <b>Trạng thái thanh toán:</b> {selectedOrder.paymentStatus}
                    </div>
                  )}
                  {selectedOrder.deliveryStatus && (
                    <div>
                      <b>Trạng thái giao hàng:</b> {selectedOrder.deliveryStatus}
            </div>
                  )}
                  {selectedOrder.paymentMethod && (
                    <div>
                      <b>Phương thức thanh toán:</b> {selectedOrder.paymentMethod}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#1e293b" }}>Thông tin khách hàng</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <b>Họ tên:</b> {(() => {
                      const customer = selectedOrder.customer || selectedOrder.quotation?.customer;
                      const firstName = customer?.firstName || customer?.first_name || '';
                      const lastName = customer?.lastName || customer?.last_name || '';
                      const fullName = `${firstName} ${lastName}`.trim();
                      return fullName || "—";
                    })()}
                  </div>
                  <div>
                    <b>Email:</b> {(() => {
                      const customer = selectedOrder.customer || selectedOrder.quotation?.customer;
                      return customer?.email || "—";
                    })()}
                  </div>
                  <div>
                    <b>Điện thoại:</b> {(() => {
                      const customer = selectedOrder.customer || selectedOrder.quotation?.customer;
                      return customer?.phone || customer?.phoneNumber || customer?.mobile || "—";
                    })()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#1e293b" }}>Thông tin xe</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <b>Thương hiệu:</b> {(() => {
                      const inventory = selectedOrder.inventory;
                      const quotation = selectedOrder.quotation;
                      const variant = inventory?.variant || quotation?.variant;
                      const brand = variant?.model?.brand || variant?.brand || inventory?.brand || quotation?.brand;
                      const brandName = brand?.brandName || brand?.brand_name || brand?.name;
                      return brandName || "—";
                    })()}
                  </div>
                  <div>
                    <b>Dòng xe:</b> {(() => {
                      const inventory = selectedOrder.inventory;
                      const quotation = selectedOrder.quotation;
                      const variant = inventory?.variant || quotation?.variant;
                      const model = variant?.model || variant;
                      const variantName = variant?.variantName || variant?.variant_name || variant?.name;
                      const modelName = model?.modelName || model?.model_name || model?.name;
                      return variantName || modelName || "—";
                    })()}
                  </div>
                  <div>
                    <b>Màu sắc:</b> {
                      selectedOrder.inventory?.color?.colorName || 
                      selectedOrder.inventory?.colorName ||
                      selectedOrder.quotation?.color?.colorName || 
                      selectedOrder.quotation?.colorName ||
                      "—"
                    }
                  </div>
                  {(selectedOrder.inventory?.vin || selectedOrder.inventory?.chassisNumber) && (
                    <div>
                      <b>VIN:</b> {selectedOrder.inventory?.vin || "—"}
                    </div>
                  )}
                  {selectedOrder.inventory?.chassisNumber && (
                    <div>
                      <b>Số khung:</b> {selectedOrder.inventory.chassisNumber}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#e0f2fe", borderRadius: "8px", border: "1px solid #7dd3fc" }}>
                <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#0369a1" }}>Thông tin thanh toán</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                  <div>
                    <b>Tổng tiền:</b>{" "}
                    <span style={{ fontWeight: "bold", color: "#16a34a", fontSize: "18px" }}>
                      {(() => {
                        // Ưu tiên 1: totalAmount từ order
                        let total = selectedOrder.totalAmount || selectedOrder.total_amount;
                        
                        // Ưu tiên 2: finalPrice từ quotation
                        if (!total || total === 0) {
                          total = selectedOrder.quotation?.finalPrice || selectedOrder.quotation?.final_price;
                        }
                        
                        // Ưu tiên 3: Giá từ inventory (kho xe)
                        if (!total || total === 0) {
                          const inventory = selectedOrder.inventory;
                          if (inventory) {
                            total = inventory.sellingPrice 
                              || inventory.costPrice 
                              || inventory.price
                              || inventory.selling_price
                              || inventory.cost_price;
                          }
                        }
                        
                        const totalNum = typeof total === 'string' ? parseFloat(total) : (total || 0);
                        
                        console.log("💰 Displaying totalAmount in detail popup:", {
                          selectedOrder: selectedOrder,
                          totalAmount: selectedOrder.totalAmount,
                          total_amount: selectedOrder.total_amount,
                          quotationFinalPrice: selectedOrder.quotation?.finalPrice,
                          inventoryPrice: selectedOrder.inventory?.sellingPrice || selectedOrder.inventory?.costPrice || selectedOrder.inventory?.price,
                          total: total,
                          totalNum: totalNum,
                          type: typeof total
                        });
                        
                        return totalNum > 0 ? totalNum.toLocaleString('vi-VN') : '0';
                      })()} ₫
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <h3 style={{ marginTop: "0", marginBottom: "10px", color: "#1e293b" }}>Ghi chú</h3>
                  <p style={{ margin: "0", color: "#666" }}>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
              {/* Chỉ hiển thị nút "Tạo báo giá" cho Order có status "pending" (chưa có quotation) */}
              {(selectedOrder?.status === "pending" || selectedOrder?.status === "PENDING") && (
                <button 
                  className="btn-close" 
                  onClick={() => {
                    setShowDetail(false);
                    handleOpenQuotationForm(selectedOrder);
                  }}
                  style={{ backgroundColor: "#3b82f6", color: "white", padding: "10px 20px" }}
                  title="Tạo báo giá từ đơn hàng này"
                >
                  <FaFileInvoice style={{ marginRight: "5px" }} />
                  Tạo báo giá
                </button>
              )}
              <button 
                className="btn-close" 
                onClick={() => {
                  const orderId = selectedOrder?.orderId || selectedOrder?.id;
                  if (orderId) {
                    handleDelete(orderId);
                  }
                }}
                style={{ backgroundColor: "#dc2626", color: "white", padding: "10px 20px" }}
                title="Xóa đơn hàng này"
              >
                <FaTrash style={{ marginRight: "5px" }} />
                Xóa đơn hàng
              </button>
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup form tạo báo giá */}
      {showQuotationForm && selectedOrderForQuotation && (
        <div className="popup-overlay" onClick={() => setShowQuotationForm(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2>📋 Tạo báo giá từ đơn hàng</h2>
            <div style={{ 
              marginBottom: "15px", 
              padding: "12px", 
              backgroundColor: "#fef3c7", 
              borderRadius: "6px",
              border: "1px solid #fbbf24"
            }}>
              <strong style={{ color: "#92400e" }}>📌 Luồng:</strong>
              <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#78350f" }}>
                Bước 2/4: Tạo Quotation từ Order → Sau đó gửi báo giá → Khách accept → Order chuyển sang "confirmed"
              </p>
            </div>
            <p style={{ marginBottom: "15px", color: "#666" }}>
              Đơn hàng: <b>{selectedOrderForQuotation.orderNumber || selectedOrderForQuotation.id}</b>
            </p>
            
            {/* Hiển thị thông tin từ order */}
            <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#1e293b" }}>Thông tin khách hàng</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <b>Họ tên:</b> {(() => {
                    const customer = selectedOrderForQuotation.customer || selectedOrderForQuotation.quotation?.customer;
                    const firstName = customer?.firstName || customer?.first_name || '';
                    const lastName = customer?.lastName || customer?.last_name || '';
                    const fullName = `${firstName} ${lastName}`.trim();
                    return fullName || "—";
                  })()}
                </div>
                <div>
                  <b>Email:</b> {(() => {
                    const customer = selectedOrderForQuotation.customer || selectedOrderForQuotation.quotation?.customer;
                    return customer?.email || "—";
                  })()}
                </div>
                <div>
                  <b>Điện thoại:</b> {(() => {
                    const customer = selectedOrderForQuotation.customer || selectedOrderForQuotation.quotation?.customer;
                    return customer?.phone || customer?.phoneNumber || customer?.mobile || "—";
                  })()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#1e293b" }}>Thông tin xe</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <b>Thương hiệu:</b> {(() => {
                    const inventory = selectedOrderForQuotation.inventory;
                    const variant = inventory?.variant;
                    const brand = variant?.model?.brand || variant?.brand;
                    const brandName = brand?.brandName || brand?.brand_name || brand?.name;
                    return brandName || "—";
                  })()}
                </div>
                <div>
                  <b>Dòng xe:</b> {(() => {
                    const inventory = selectedOrderForQuotation.inventory;
                    const variant = inventory?.variant;
                    const variantName = variant?.variantName || variant?.variant_name || variant?.name;
                    return variantName || "—";
                  })()}
                </div>
                <div>
                  <b>Màu sắc:</b> {
                    selectedOrderForQuotation.inventory?.color?.colorName || 
                    selectedOrderForQuotation.inventory?.colorName ||
                    "—"
                  }
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#e0f2fe", borderRadius: "8px", border: "1px solid #7dd3fc" }}>
              <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#0369a1" }}>Thông tin giá</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <b>Tổng giá:</b>{" "}
                  <span style={{ fontWeight: "bold", color: "#16a34a" }}>
                    {quotationFormData.totalPrice ? parseFloat(quotationFormData.totalPrice).toLocaleString('vi-VN') : '0'} ₫
                  </span>
                </div>
                <div>
                  <b>Giá cuối cùng:</b>{" "}
                  <span style={{ fontWeight: "bold", color: "#16a34a" }}>
                    {quotationFormData.finalPrice ? parseFloat(quotationFormData.finalPrice).toLocaleString('vi-VN') : '0'} ₫
                  </span>
                </div>
                <div>
                  <b>Giảm giá:</b>{" "}
                  <span style={{ fontWeight: "500", color: "#dc2626" }}>
                    {quotationFormData.discountAmount ? parseFloat(quotationFormData.discountAmount).toLocaleString('vi-VN') : '0'} ₫
                    {quotationFormData.discountPercentage && parseFloat(quotationFormData.discountPercentage) > 0 && (
                      <span style={{ marginLeft: "8px", fontSize: "14px", color: "#666" }}>
                        ({quotationFormData.discountPercentage}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {error && <div style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#fee2e2", borderRadius: "4px" }}>{error}</div>}
            <form onSubmit={handleCreateQuotation}>
              {/* Ẩn các field này, chỉ dùng để submit */}
              <input type="hidden" value={quotationFormData.variantId} />
              <input type="hidden" value={quotationFormData.colorId} />
              <input type="hidden" value={quotationFormData.totalPrice} />
              <input type="hidden" value={quotationFormData.finalPrice} />
              <input type="hidden" value={quotationFormData.discountAmount} />

              <div style={{ marginBottom: "15px" }}>
                <label>Phần trăm giảm giá (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={quotationFormData.discountPercentage}
                  onChange={(e) => {
                    const discountPercent = parseFloat(e.target.value) || 0;
                    const total = parseFloat(quotationFormData.totalPrice) || 0;
                    const discountAmount = (total * discountPercent) / 100;
                    const finalPrice = total - discountAmount;
                    
                    setQuotationFormData({
                      ...quotationFormData,
                      discountPercentage: e.target.value,
                      discountAmount: discountAmount.toFixed(2),
                      finalPrice: finalPrice.toFixed(2)
                    });
                  }}
                  placeholder="Ví dụ: 5 (giảm 5%)"
                  style={{ width: "100%", padding: "8px" }}
                />
                <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                  💡 Nhập phần trăm giảm giá (0-100%). Số tiền giảm và giá cuối cùng sẽ tự động tính.
                </small>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Số ngày hiệu lực *</label>
                <input
                  type="number"
                  min="1"
                  value={quotationFormData.validityDays}
                  onChange={(e) => setQuotationFormData({ ...quotationFormData, validityDays: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px" }}
                  placeholder="Mặc định: 7 ngày"
                />
                <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                  💡 Số ngày báo giá có hiệu lực (tối thiểu 1 ngày)
                </small>
              </div>

              <div className="form-actions">
                <button type="submit" style={{ backgroundColor: "#3b82f6", color: "white" }}>
                  Tạo báo giá
                </button>
                <button type="button" onClick={() => setShowQuotationForm(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
