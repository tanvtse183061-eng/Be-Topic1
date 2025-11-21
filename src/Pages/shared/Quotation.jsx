import '../Admin/Order.css';
import { FaSearch, FaEye, FaCheck, FaTimes, FaPaperPlane, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { quotationAPI, customerAPI, publicVehicleAPI, orderAPI, vehicleAPI, inventoryAPI } from "../../services/API";

export default function Quotation() {
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [publicLink, setPublicLink] = useState("");
  const currentRole = localStorage.getItem("role") || "";
  const isEVMStaff = currentRole === "EVM_STAFF";
  const isAdmin = currentRole === "ADMIN";
  const isDealerStaff = currentRole === "DEALER_STAFF" || currentRole === "STAFF";

  // Data for form
  const [customers, setCustomers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrderData, setSelectedOrderData] = useState(null); // Lưu order data đã fetch để hiển thị

  // Form data - Báo giá khách hàng
  const [formData, setFormData] = useState({
    createFrom: "direct", // "direct" hoặc "order"
    orderId: "", // Optional - ID đơn hàng nếu tạo từ order
    customerId: "",
    variantId: "",
    colorId: "",
    quantity: 1,
    unitPrice: "",
    totalPrice: "", // Giá gốc (tính từ unitPrice * quantity)
    discountPercentage: "",
    discountAmount: "", // Số tiền giảm giá (tính từ totalPrice * discountPercentage / 100)
    finalPrice: "", // Giá cuối cùng (totalPrice - discountAmount)
    validityDays: 7, // Số ngày hiệu lực (default 7)
    notes: "",
    expiryDate: "" // Sẽ được tính từ quotationDate + validityDays
  });

  // Lấy danh sách báo giá khách hàng
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await quotationAPI.getQuotations();
      console.log("📦 Raw response từ getQuotations:", res);
      let quotationsData = res.data?.data || res.data || [];
      console.log("📦 Customer Quotations data (raw):", quotationsData);
      
      // Fetch thêm customer và variant data nếu chỉ có ID
      if (Array.isArray(quotationsData) && quotationsData.length > 0) {
        const enrichedQuotations = await Promise.all(
          quotationsData.map(async (q) => {
            let enrichedQuotation = { ...q };
            
            // Fetch customer nếu chỉ có customerId
            if (!enrichedQuotation.customer && enrichedQuotation.customerId) {
              try {
                console.log(`🔄 Fetching customer ${enrichedQuotation.customerId} for quotation ${enrichedQuotation.quotationId || enrichedQuotation.id}`);
                const customerRes = await customerAPI.getCustomer(enrichedQuotation.customerId);
                const customerData = customerRes.data?.data || customerRes.data || customerRes;
                enrichedQuotation.customer = customerData;
              } catch (err) {
                console.error(`❌ Lỗi fetch customer ${enrichedQuotation.customerId}:`, err);
              }
            }
            
            // Fetch variant nếu chỉ có variantId
            if (!enrichedQuotation.variant && enrichedQuotation.variantId) {
              try {
                console.log(`🔄 Fetching variant ${enrichedQuotation.variantId} for quotation ${enrichedQuotation.quotationId || enrichedQuotation.id}`);
                const variantId = enrichedQuotation.variantId;
                try {
                  const variantRes = await vehicleAPI.getVariant(variantId);
                  const variantData = variantRes.data?.data || variantRes.data || variantRes;
                  if (variantData) {
                    enrichedQuotation.variant = variantData;
                  }
                } catch (directErr) {
                  // Fallback: tìm trong danh sách variants
                  const variantRes = await publicVehicleAPI.getVariants();
                  const allVariants = variantRes.data || [];
                  const variantData = allVariants.find(v => (v.variantId || v.id) == variantId);
                  if (variantData) {
                    enrichedQuotation.variant = variantData;
                  }
                }
              } catch (err) {
                console.error(`❌ Lỗi fetch variant:`, err);
              }
            }
            
            // Fetch color nếu chỉ có colorId
            if (!enrichedQuotation.color && enrichedQuotation.colorId) {
              try {
                console.log(`🔄 Fetching color ${enrichedQuotation.colorId} for quotation ${enrichedQuotation.quotationId || enrichedQuotation.id}`);
                const colorId = enrichedQuotation.colorId;
                try {
                  const colorRes = await vehicleAPI.getColor(colorId);
                  const colorData = colorRes.data?.data || colorRes.data || colorRes;
                  if (colorData) {
                    enrichedQuotation.color = colorData;
                  }
                } catch (directErr) {
                  // Fallback: tìm trong danh sách colors
                  const colorRes = await publicVehicleAPI.getColors();
                  const allColors = colorRes.data || [];
                  const colorData = allColors.find(c => (c.colorId || c.id) == colorId);
                  if (colorData) {
                    enrichedQuotation.color = colorData;
                  }
                }
              } catch (err) {
                console.error(`❌ Lỗi fetch color:`, err);
              }
            }
            
            // Fetch order nếu có orderId nhưng không có order data
            if (enrichedQuotation.orderId && !enrichedQuotation.order) {
              try {
                console.log(`🔄 Fetching order ${enrichedQuotation.orderId} for quotation ${enrichedQuotation.quotationId || enrichedQuotation.id}`);
                const orderRes = await orderAPI.getOrder(enrichedQuotation.orderId);
                const orderData = orderRes.data?.data || orderRes.data || orderRes;
                enrichedQuotation.order = orderData;
              } catch (err) {
                console.error(`❌ Lỗi fetch order ${enrichedQuotation.orderId}:`, err);
              }
            }
            
            return enrichedQuotation;
          })
        );
        
        quotationsData = enrichedQuotations;
        console.log("📦 Quotations data (enriched):", quotationsData);
      }
      
      // Hiển thị báo giá - cho DealerStaff: ưu tiên hiển thị có orderId, nhưng nếu không có thì vẫn hiển thị tất cả
      let quotationsFromOrders = [];
      if (isDealerStaff) {
        // Tạm thời hiển thị tất cả báo giá để debug
        quotationsFromOrders = Array.isArray(quotationsData) ? quotationsData : [];
      } else {
        // Admin và EVMStaff: hiển thị tất cả
        quotationsFromOrders = Array.isArray(quotationsData) ? quotationsData : [];
      }
      
      console.log("📦 Quotations to display:", quotationsFromOrders.length);
      console.log("📦 Quotations details:", quotationsFromOrders);
      setQuotations(quotationsFromOrders);
    } catch (err) {
      console.error("❌ Lỗi khi lấy báo giá:", err);
      alert("Không thể tải danh sách báo giá!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for form
  const fetchData = async () => {
    try {
      console.log("🔄 Đang fetch dữ liệu cho form...");
      
      // Fetch customers
      try {
        const customersRes = await customerAPI.getCustomers();
        const customersData = customersRes.data || [];
        console.log("✅ Customers fetched:", customersData.length);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch customers:", err);
        setCustomers([]);
      }
      
      // Fetch variants và colors
      try {
        const [variantsRes, colorsRes] = await Promise.all([
          publicVehicleAPI.getVariants(),
          publicVehicleAPI.getColors()
        ]);
        const variantsData = variantsRes.data || [];
        const colorsData = colorsRes.data || [];
        console.log("✅ Variants fetched:", variantsData.length);
        console.log("✅ Colors fetched:", colorsData.length);
        setVariants(Array.isArray(variantsData) ? variantsData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
      } catch (err) {
        console.error("❌ Lỗi fetch variants/colors:", err);
        setVariants([]);
        setColors([]);
      }

      // Fetch orders (chỉ cho DealerStaff)
      if (isDealerStaff) {
        try {
          const ordersRes = await orderAPI.getOrders();
          const ordersData = ordersRes.data?.data || ordersRes.data || [];
          console.log("✅ Orders fetched:", ordersData.length);
          // Chỉ lấy đơn hàng có status pending hoặc quoted (chưa có báo giá)
          const availableOrders = Array.isArray(ordersData) 
            ? ordersData.filter(o => {
                const status = (o.status || "").toLowerCase();
                return status === "pending" || status === "quoted";
              })
            : [];
          setOrders(availableOrders);
          console.log("✅ Available orders for quotation:", availableOrders.length);
        } catch (err) {
          console.error("❌ Lỗi fetch orders:", err);
          setOrders([]);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchData();
  }, []);

  // Fetch lại data khi mở popup
  useEffect(() => {
    if (showPopup) {
      fetchData();
    }
  }, [showPopup]);

  // Tính toán giá từ unitPrice, quantity, discountPercentage
  const calculatePrices = (unitPrice, quantity, discountPercentage) => {
    const unitPriceNum = parseFloat(unitPrice) || 0;
    const quantityNum = parseInt(quantity) || 1;
    const discountPercentNum = parseFloat(discountPercentage) || 0;
    
    const totalPrice = unitPriceNum * quantityNum;
    const discountAmount = totalPrice * (discountPercentNum / 100);
    const finalPrice = totalPrice - discountAmount;
    
    return { totalPrice, discountAmount, finalPrice };
  };

  // Xử lý khi chọn đơn hàng
  const handleOrderChange = async (orderId) => {
    if (!orderId) {
      setFormData({
        ...formData,
        orderId: "",
        customerId: "",
        variantId: "",
        colorId: "",
        unitPrice: "",
        totalPrice: "",
        finalPrice: "",
        discountAmount: "",
      });
      setSelectedOrderData(null); // Reset order data
      return;
    }

    try {
      const res = await orderAPI.getOrder(orderId);
      let order = res.data?.data || res.data || res;
      console.log("📦 Order selected (full object):", JSON.stringify(order, null, 2));

      // Fetch đầy đủ thông tin từ order nếu chỉ có ID
      // Fetch customer nếu chỉ có customerId
      if (!order.customer && order.customerId) {
        try {
          console.log("🔄 Fetching customer data separately...");
          const customerRes = await customerAPI.getCustomer(order.customerId);
          const customerData = customerRes.data?.data || customerRes.data || customerRes;
          console.log("✅ Customer data fetched:", customerData);
          order = { ...order, customer: customerData };
        } catch (customerErr) {
          console.error("❌ Lỗi khi fetch customer:", customerErr);
        }
      }

      // Fetch inventory nếu chỉ có inventoryId
      if (!order.inventory && order.inventoryId) {
        try {
          console.log("🔄 Fetching inventory data separately...");
          const inventoryRes = await inventoryAPI.getInventoryById(order.inventoryId);
          const inventoryData = inventoryRes.data?.data || inventoryRes.data || inventoryRes;
          console.log("✅ Inventory data fetched:", inventoryData);
          order = { ...order, inventory: inventoryData };
        } catch (inventoryErr) {
          console.error("❌ Lỗi khi fetch inventory:", inventoryErr);
        }
      }

      // Fetch variant nếu chỉ có variantId
      if (order.inventory && (!order.inventory.variant || !order.inventory.variant.model) && (order.inventory.variantId || order.inventory.variant?.variantId)) {
        try {
          console.log("🔄 Fetching variant data separately...");
          const variantId = order.inventory.variantId || order.inventory.variant?.variantId || order.inventory.variant?.id;
          if (variantId) {
            try {
              const variantRes = await vehicleAPI.getVariant(variantId);
              const variantData = variantRes.data?.data || variantRes.data || variantRes;
              if (variantData) {
                console.log("✅ Variant data fetched directly:", variantData);
                order.inventory = { ...order.inventory, variant: variantData };
              }
            } catch (directErr) {
              // Fallback: tìm trong danh sách variants
              console.log("⚠️ Direct fetch failed, trying list...");
              const variantRes = await publicVehicleAPI.getVariants();
              const allVariants = variantRes.data || [];
              const variantData = allVariants.find(v => (v.variantId || v.id) == variantId);
              if (variantData) {
                console.log("✅ Variant data found in list:", variantData);
                order.inventory = { ...order.inventory, variant: variantData };
              }
            }
          }
        } catch (variantErr) {
          console.error("❌ Lỗi khi fetch variant:", variantErr);
        }
      }

      // Fetch color nếu chỉ có colorId
      if (order.inventory && !order.inventory.color && (order.inventory.colorId || order.inventory.color?.colorId)) {
        try {
          console.log("🔄 Fetching color data separately...");
          const colorId = order.inventory.colorId || order.inventory.color?.colorId || order.inventory.color?.id;
          if (colorId) {
            try {
              const colorRes = await vehicleAPI.getColor(colorId);
              const colorData = colorRes.data?.data || colorRes.data || colorRes;
              if (colorData) {
                console.log("✅ Color data fetched directly:", colorData);
                order.inventory = { ...order.inventory, color: colorData };
              }
            } catch (directErr) {
              // Fallback: tìm trong danh sách colors
              console.log("⚠️ Direct fetch failed, trying list...");
              const colorRes = await publicVehicleAPI.getColors();
              const allColors = colorRes.data || [];
              const colorData = allColors.find(c => (c.colorId || c.id) == colorId);
              if (colorData) {
                console.log("✅ Color data found in list:", colorData);
                order.inventory = { ...order.inventory, color: colorData };
              }
            }
          }
        } catch (colorErr) {
          console.error("❌ Lỗi khi fetch color:", colorErr);
        }
      }

      // Kiểm tra từ quotation nếu có
      if (order.quotation) {
        if (!order.quotation.variant && order.quotation.variantId) {
          try {
            const variantId = order.quotation.variantId;
            try {
              const variantRes = await vehicleAPI.getVariant(variantId);
              const variantData = variantRes.data?.data || variantRes.data || variantRes;
              if (variantData) {
                order.quotation = { ...order.quotation, variant: variantData };
              }
            } catch (directErr) {
              const variantRes = await publicVehicleAPI.getVariants();
              const allVariants = variantRes.data || [];
              const variantData = allVariants.find(v => (v.variantId || v.id) == variantId);
              if (variantData) {
                order.quotation = { ...order.quotation, variant: variantData };
              }
            }
          } catch (variantErr) {
            console.error("❌ Lỗi khi fetch quotation variant:", variantErr);
          }
        }

        if (!order.quotation.color && order.quotation.colorId) {
          try {
            const colorId = order.quotation.colorId;
            try {
              const colorRes = await vehicleAPI.getColor(colorId);
              const colorData = colorRes.data?.data || colorRes.data || colorRes;
              if (colorData) {
                order.quotation = { ...order.quotation, color: colorData };
              }
            } catch (directErr) {
              const colorRes = await publicVehicleAPI.getColors();
              const allColors = colorRes.data || [];
              const colorData = allColors.find(c => (c.colorId || c.id) == colorId);
              if (colorData) {
                order.quotation = { ...order.quotation, color: colorData };
              }
            }
          } catch (colorErr) {
            console.error("❌ Lỗi khi fetch quotation color:", colorErr);
          }
        }
      }

      console.log("📦 Order after fetching all data:", JSON.stringify(order, null, 2));

      // Lưu order data để hiển thị trong form
      setSelectedOrderData(order);

      // Cập nhật danh sách customers, variants, colors nếu có dữ liệu mới từ order
      if (order.customer && !customers.find(c => (c.customerId || c.id) === (order.customer.customerId || order.customer.id))) {
        setCustomers(prev => [...prev, order.customer]);
      }

      const variant = order.quotation?.variant || order.inventory?.variant;
      if (variant && !variants.find(v => (v.variantId || v.id) == (variant.variantId || variant.id))) {
        setVariants(prev => [...prev, variant]);
      }

      const color = order.quotation?.color || order.inventory?.color;
      if (color && !colors.find(c => (c.colorId || c.id) == (color.colorId || color.id))) {
        setColors(prev => [...prev, color]);
      }

      // Tự động điền thông tin từ đơn hàng
      const customerId = order.customer?.customerId || order.customerId || "";
      const variantId = order.quotation?.variantId || order.inventory?.variantId || order.variantId || "";
      const colorId = order.quotation?.colorId || order.inventory?.colorId || order.colorId || "";
      
      // Lấy giá từ order - kiểm tra nhiều field names
      let orderPrice = 0;
      
      // Thử nhiều cách để lấy giá
      if (order.totalAmount) {
        orderPrice = order.totalAmount;
        console.log("💰 Lấy giá từ order.totalAmount:", orderPrice);
      } else if (order.quotation?.finalPrice) {
        orderPrice = order.quotation.finalPrice;
        console.log("💰 Lấy giá từ order.quotation.finalPrice:", orderPrice);
      } else if (order.quotation?.totalPrice) {
        orderPrice = order.quotation.totalPrice;
        console.log("💰 Lấy giá từ order.quotation.totalPrice:", orderPrice);
      } else if (order.inventory?.price) {
        orderPrice = order.inventory.price;
        console.log("💰 Lấy giá từ order.inventory.price:", orderPrice);
      } else if (order.inventory?.sellingPrice) {
        orderPrice = order.inventory.sellingPrice;
        console.log("💰 Lấy giá từ order.inventory.sellingPrice:", orderPrice);
      } else if (order.inventory?.costPrice) {
        orderPrice = order.inventory.costPrice;
        console.log("💰 Lấy giá từ order.inventory.costPrice:", orderPrice);
      } else if (order.price) {
        orderPrice = order.price;
        console.log("💰 Lấy giá từ order.price:", orderPrice);
      } else {
        console.warn("⚠️ Không tìm thấy giá trong order object. Các field có sẵn:", Object.keys(order));
        alert("⚠️ Đơn hàng này chưa có giá. Vui lòng nhập giá thủ công.");
      }

      const totalPrice = orderPrice;
      const finalPrice = orderPrice; // Mặc định finalPrice = totalPrice (chưa giảm giá)

      console.log("✅ Giá đã lấy được:", { totalPrice, finalPrice, orderPrice });

      const newFormData = {
        ...formData,
        orderId: orderId,
        customerId: customerId,
        variantId: variantId ? String(variantId) : "",
        colorId: colorId ? String(colorId) : "",
        totalPrice: totalPrice > 0 ? String(totalPrice) : "",
        finalPrice: finalPrice > 0 ? String(finalPrice) : "",
        discountAmount: "0", // Mặc định chưa giảm giá
        notes: order.notes || formData.notes,
      };
      
      setFormData(newFormData);
      
      console.log("✅ Đã điền giá từ đơn hàng:", { 
        totalPrice: newFormData.totalPrice, 
        finalPrice: newFormData.finalPrice,
        customerId: newFormData.customerId,
        variantId: newFormData.variantId,
        colorId: newFormData.colorId
      });
      
      // Hiển thị thông báo nếu có giá
      if (orderPrice > 0) {
        const formattedPrice = new Intl.NumberFormat("vi-VN", { 
          style: "currency", 
          currency: "VND" 
        }).format(orderPrice);
        console.log(`✅ Đã tự động điền giá: ${formattedPrice}`);
      }
      
      if (orderPrice === 0) {
        alert("⚠️ Đơn hàng này chưa có giá. Vui lòng nhập giá thủ công.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy thông tin đơn hàng:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("Không thể tải thông tin đơn hàng!");
    }
  };

  // Hàm điều chỉnh giá (cộng/trừ)
  const adjustPrice = (field, amount) => {
    const currentValue = parseFloat(formData[field]) || 0;
    const newValue = Math.max(0, currentValue + amount);
    setFormData(prev => {
      const updated = { ...prev, [field]: String(newValue) };
      
      // Tự động tính discountAmount nếu thay đổi totalPrice hoặc finalPrice
      if (field === "totalPrice" || field === "finalPrice") {
        const total = parseFloat(updated.totalPrice) || 0;
        const final = parseFloat(updated.finalPrice) || 0;
        const discount = total - final;
        updated.discountAmount = discount >= 0 ? discount.toFixed(2) : "0";
      }
      
      return updated;
    });
  };

  // Tạo báo giá mới
  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.createFrom === "order") {
      // Tạo báo giá từ đơn hàng
      if (!formData.orderId || !formData.variantId || !formData.colorId) {
        setError("Vui lòng chọn đơn hàng và điền đầy đủ thông tin!");
        return;
      }

      if (!formData.totalPrice || !formData.finalPrice) {
        setError("Vui lòng nhập tổng giá và giá cuối cùng!");
        return;
      }

      try {
        const payload = {
          variantId: Number(formData.variantId),
          colorId: Number(formData.colorId),
          totalPrice: parseFloat(formData.totalPrice),
          finalPrice: parseFloat(formData.finalPrice),
          discountAmount: parseFloat(formData.discountAmount) || 0,
          validityDays: Number(formData.validityDays) || 7,
          notes: formData.notes || null,
        };

        console.log("📤 Payload tạo báo giá từ order:", payload);
        console.log("📤 Order ID:", formData.orderId);

        const res = await quotationAPI.createQuotationFromOrder(formData.orderId, payload);
        console.log("✅ Response từ createQuotationFromOrder:", res);
        
        // Hiển thị thông tin chi tiết báo giá vừa tạo
        const quotationData = res.data || res.data?.data || res;
        if (quotationData) {
          const message = `✅ Tạo báo giá thành công!\n\n` +
            `📋 Số báo giá: ${quotationData.quotationNumber || quotationData.quotationId}\n` +
            `👤 Khách hàng ID: ${quotationData.customerId || "—"}\n` +
            `🚗 Biến thể ID: ${quotationData.variantId || "—"}\n` +
            `🎨 Màu ID: ${quotationData.colorId || "—"}\n` +
            `💰 Tổng giá: ${quotationData.totalPrice ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(quotationData.totalPrice) : "—"}\n` +
            `💵 Giảm giá: ${quotationData.discountAmount ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(quotationData.discountAmount) : "—"}\n` +
            `💳 Giá cuối: ${quotationData.finalPrice ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(quotationData.finalPrice) : "—"}\n` +
            `📅 Ngày hết hạn: ${quotationData.expiryDate || "—"}\n` +
            `📊 Trạng thái: ${quotationData.status || "pending"}\n` +
            `📝 Ghi chú: ${quotationData.notes || "—"}`;
          
          alert(message);
          
          // Tự động mở popup xem chi tiết báo giá vừa tạo
          if (quotationData.quotationId || quotationData.id) {
            setSelectedQuotation(quotationData);
            setShowDetail(true);
          }
        } else {
          alert("✅ Tạo báo giá từ đơn hàng thành công!");
        }
        
        // Đóng popup form nhưng giữ popup detail nếu đã mở
        setShowPopup(false);
        setIsEdit(false);
        
        // Reset form
        setFormData({
          createFrom: isDealerStaff ? "order" : "direct",
          orderId: "",
          customerId: "",
          variantId: "",
          colorId: "",
          quantity: 1,
          unitPrice: "",
          totalPrice: "",
          discountPercentage: "",
          discountAmount: "",
          finalPrice: "",
          validityDays: 7,
          notes: "",
          expiryDate: ""
        });
        
        // Fetch lại danh sách
        setTimeout(() => {
          fetchQuotations();
        }, 500);
      } catch (err) {
        console.error("❌ Lỗi khi tạo báo giá từ order:", err);
        const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo báo giá!";
        setError(errorMsg);
        alert(`Tạo báo giá thất bại!\n${errorMsg}`);
        return;
      }
    } else {
      // Tạo báo giá trực tiếp (không từ order)
      if (!formData.customerId || !formData.variantId || !formData.colorId) {
        setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      // Tính toán giá nếu có unitPrice
      const { totalPrice, discountAmount, finalPrice } = formData.unitPrice 
        ? calculatePrices(formData.unitPrice, formData.quantity, formData.discountPercentage)
        : { totalPrice: formData.totalPrice || 0, discountAmount: formData.discountAmount || 0, finalPrice: formData.finalPrice || 0 };

      try {
        const payload = {
          customerId: formData.customerId,
          variantId: parseInt(formData.variantId),
          colorId: parseInt(formData.colorId),
          totalPrice: totalPrice,
          discountAmount: discountAmount,
          finalPrice: finalPrice,
          validityDays: parseInt(formData.validityDays) || 7,
          status: "pending", // Default status
          notes: formData.notes || null
        };

        console.log("📤 Payload tạo báo giá:", payload);

        if (isEdit && selectedQuotation) {
          // Cập nhật báo giá
          const res = await quotationAPI.updateQuotation(selectedQuotation.quotationId || selectedQuotation.id, payload);
          console.log("✅ Response từ updateQuotation:", res);
          alert("Cập nhật báo giá thành công!");
        } else {
          // Tạo mới
          const res = await quotationAPI.createQuotation(payload);
          console.log("✅ Response từ createQuotation:", res);
          
          // Hiển thị thông tin chi tiết báo giá vừa tạo
          const quotationData = res.data || res.data?.data || res;
          if (quotationData) {
            const message = `✅ Tạo báo giá thành công!\n\n` +
              `📋 Số báo giá: ${quotationData.quotationNumber || quotationData.quotationId || "—"}\n` +
              `👤 Khách hàng ID: ${quotationData.customerId || "—"}\n` +
              `🚗 Biến thể ID: ${quotationData.variantId || "—"}\n` +
              `🎨 Màu ID: ${quotationData.colorId || "—"}\n` +
              `💰 Tổng giá: ${quotationData.totalPrice ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(quotationData.totalPrice) : "—"}\n` +
              `💵 Giảm giá: ${quotationData.discountAmount ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(quotationData.discountAmount) : "—"}\n` +
              `💳 Giá cuối: ${quotationData.finalPrice ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(quotationData.finalPrice) : "—"}\n` +
              `📅 Ngày hết hạn: ${quotationData.expiryDate || "—"}\n` +
              `📊 Trạng thái: ${quotationData.status || "pending"}\n` +
              `📝 Ghi chú: ${quotationData.notes || "—"}`;
            
            alert(message);
            
            // Tự động mở popup xem chi tiết báo giá vừa tạo
            if (quotationData.quotationId || quotationData.id) {
              setSelectedQuotation(quotationData);
              setShowDetail(true);
            }
          } else {
            alert("Tạo báo giá thành công!");
          }
        }
        
        // Đóng popup form nhưng giữ popup detail nếu đã mở
        setShowPopup(false);
        setIsEdit(false);
        
        // Reset form
        setFormData({
          createFrom: isDealerStaff ? "order" : "direct",
          orderId: "",
          customerId: "",
          variantId: "",
          colorId: "",
          quantity: 1,
          unitPrice: "",
          totalPrice: "",
          discountPercentage: "",
          discountAmount: "",
          finalPrice: "",
          validityDays: 7,
          notes: "",
          expiryDate: ""
        });
        
        // Fetch lại danh sách
        setTimeout(() => {
          fetchQuotations();
        }, 500);
      } catch (err) {
        console.error("❌ Lỗi khi tạo/cập nhật báo giá:", err);
        const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể tạo/cập nhật báo giá!";
        setError(errorMsg);
        alert(errorMsg);
        return;
      }
    }
  };

  // Gửi báo giá cho khách hàng
  const handleSendQuotation = async (quotationId) => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi báo giá này cho khách hàng không?\n\nSau khi gửi:\n- Báo giá sẽ chuyển sang trạng thái 'sent'\n- Khách hàng có thể xem và chấp nhận báo giá qua link công khai")) return;
    try {
      const res = await quotationAPI.sendQuotation(quotationId);
      console.log("✅ Response từ sendQuotation:", res);
      
      const responseData = res.data?.data || res.data || res;
      const newStatus = responseData.status || "sent";
      const message = responseData.message || "Quotation sent to customer";
      
      // Tạo link công khai để khách hàng xem và chấp nhận báo giá
      const frontendUrl = window.location.origin;
      const link = `${frontendUrl}/public/quotations/${quotationId}`;
      
      // Hiển thị popup với link để copy
      setPublicLink(link);
      setShowLinkPopup(true);
      
      fetchQuotations();
    } catch (err) {
      console.error("❌ Lỗi khi gửi báo giá:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error data:", err.response?.data);
      
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể gửi báo giá!";
      alert(`❌ Gửi báo giá thất bại!\n\n${errorMsg}\n\n💡 Lưu ý: Báo giá phải ở trạng thái 'pending' hoặc 'PENDING' mới có thể gửi.`);
    }
  };

  // Xóa báo giá
  const handleDeleteQuotation = async (quotationId) => {
    // Tìm quotation để kiểm tra order liên kết
    const quotationToDelete = quotations.find(q => (q.quotationId || q.id) === quotationId);
    const quotationNumber = quotationToDelete?.quotationNumber || quotationId;
    
    // Kiểm tra xem quotation có đang được liên kết với order không
    let linkedOrder = null;
    if (quotationToDelete?.orderId) {
      try {
        const orderRes = await orderAPI.getOrder(quotationToDelete.orderId);
        linkedOrder = orderRes.data?.data || orderRes.data || orderRes;
      } catch (orderErr) {
        console.warn("⚠️ Không thể kiểm tra order liên kết:", orderErr);
      }
    } else if (quotationToDelete?.order) {
      linkedOrder = quotationToDelete.order;
    }
    
    // Nếu có order liên kết, kiểm tra trạng thái
    let cancelOrderIfNeeded = false;
    if (linkedOrder) {
      const orderStatus = (linkedOrder.status || "").toUpperCase().trim();
      const orderId = linkedOrder.orderId || linkedOrder.id;
      const orderNumber = linkedOrder.orderNumber || orderId;
      
      // Các trạng thái quan trọng cần hủy order trước khi xóa báo giá
      const criticalStatuses = ["PAID", "DELIVERED", "COMPLETED"];
      const isCritical = criticalStatuses.includes(orderStatus);
      
      if (isCritical) {
        // Nếu đơn hàng ở trạng thái quan trọng, hỏi user có muốn hủy order không
        const shouldCancel = window.confirm(
          `Báo giá này đang được liên kết với đơn hàng "${orderNumber}" có trạng thái "${linkedOrder.status}".\n\n` +
          `Để xóa báo giá, bạn cần hủy đơn hàng trước.\n\n` +
          `Bạn có muốn tự động hủy đơn hàng và xóa báo giá không?`
        );
        
        if (shouldCancel) {
          cancelOrderIfNeeded = true; // Backend sẽ tự động hủy order
        } else {
          // Người dùng không muốn hủy order
          alert("❌ Không thể xóa báo giá vì đơn hàng đang ở trạng thái quan trọng.\n\nVui lòng hủy đơn hàng trước khi xóa báo giá.");
          return;
        }
      } else {
        // Nếu order không ở trạng thái quan trọng, có thể xóa báo giá trực tiếp
        const confirmDelete = window.confirm(
          `Báo giá này đang được liên kết với đơn hàng "${orderNumber}" (trạng thái: ${linkedOrder.status}).\n\n` +
          `Bạn có chắc chắn muốn xóa báo giá này không?`
        );
        
        if (!confirmDelete) {
          return;
        }
      }
    } else {
      // Không có order liên kết, xác nhận xóa bình thường
      if (!window.confirm(`Bạn có chắc chắn muốn xóa báo giá "${quotationNumber}" không?`)) {
        return;
      }
    }
    
    try {
      // Gọi API với tham số cancelOrderIfNeeded
      const response = await quotationAPI.deleteQuotation(quotationId, cancelOrderIfNeeded);
      
      // Kiểm tra xem có thông tin về việc tự động hủy order không
      const responseData = response.data || {};
      let successMessage = "✅ Xóa báo giá thành công!";
      
      if (responseData.orderCancelled) {
        successMessage += `\n\n✅ Đã tự động hủy đơn hàng "${responseData.cancelledOrderNumber || 'liên kết'}"`;
      }
      
      alert(successMessage);
      fetchQuotations();
    } catch (err) {
      console.error("❌ Lỗi khi xóa báo giá:", err);
      let errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Không thể xóa báo giá!";
      
      // Nếu lỗi là về order đang active, thông báo rõ ràng hơn
      if (errorMsg.includes("linked to an active order") || errorMsg.includes("active order") || errorMsg.includes("Cannot delete")) {
        errorMsg = "Không thể xóa báo giá vì đang được liên kết với đơn hàng đang hoạt động.\n\nVui lòng hủy hoặc từ chối đơn hàng trước khi xóa báo giá.";
      }
      
      alert(`❌ Xóa báo giá thất bại!\n\n${errorMsg}`);
    }
  };

  // Sửa báo giá
  const handleEditQuotation = async (quotationId) => {
    try {
      const res = await quotationAPI.getQuotation(quotationId);
      const quotation = res.data;
      setSelectedQuotation(quotation);
      setIsEdit(true);
      
      // Điền form với dữ liệu hiện tại
      setFormData({
        orderId: quotation.orderId || "",
        customerId: quotation.customer?.customerId || quotation.customerId || "",
        variantId: quotation.variant?.variantId || quotation.variantId || "",
        colorId: quotation.color?.colorId || quotation.colorId || "",
        quantity: quotation.quantity || 1,
        unitPrice: quotation.unitPrice || "",
        totalPrice: quotation.totalPrice || "",
        discountPercentage: quotation.discountPercentage || "",
        discountAmount: quotation.discountAmount || "",
        finalPrice: quotation.finalPrice || "",
        validityDays: quotation.validityDays || 7,
        notes: quotation.notes || "",
        expiryDate: quotation.expiryDate ? new Date(quotation.expiryDate).toISOString().split('T')[0] : ""
      });
      
      setShowPopup(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết báo giá:", err);
      alert("Không thể tải thông tin báo giá!");
    }
  };

  // Helper functions
  const getCustomerName = (quotation) => {
    if (quotation.customer) {
      const firstName = quotation.customer.firstName || "";
      const lastName = quotation.customer.lastName || "";
      return `${firstName} ${lastName}`.trim() || "—";
    }
    return "—";
  };

  const getVariantName = (quotation) => {
    if (quotation.variant) {
      const variantName = quotation.variant.variantName || "";
      const modelName = quotation.variant.model?.modelName || "";
      const brandName = quotation.variant.model?.brand?.brandName || "";
      if (brandName && modelName) {
        return `${brandName} ${modelName} - ${variantName}`;
      }
      return variantName || "—";
    }
    return "—";
  };

  const getColorName = (quotation) => {
    if (quotation.color) {
      return quotation.color.colorName || quotation.color.name || "—";
    }
    return "—";
  };

  const formatPrice = (price) => {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    // Theo tài liệu: pending, sent, accepted, rejected, expired, converted (lowercase)
    const statusUpper = status?.toUpperCase() || '';
    const statusMap = {
      PENDING: "badge-warning",
      SENT: "badge-info",
      ACCEPTED: "badge-success",
      REJECTED: "badge-danger",
      EXPIRED: "badge-secondary",
      CONVERTED: "badge-success"
    };
    return statusMap[statusUpper] || "badge-secondary";
  };

  // Tìm kiếm
  const filteredQuotations = (quotations || []).filter((q) => {
    if (!q) return false;
    const keyword = searchTerm.toLowerCase();
    if (!keyword) return true;
    
    return (
      (q.quotationNumber && String(q.quotationNumber).toLowerCase().includes(keyword)) ||
      (q.status && String(q.status).toLowerCase().includes(keyword)) ||
      (q.customer?.firstName && String(q.customer.firstName).toLowerCase().includes(keyword)) ||
      (q.customer?.lastName && String(q.customer.lastName).toLowerCase().includes(keyword)) ||
      (q.customer?.email && String(q.customer.email).toLowerCase().includes(keyword)) ||
      (q.variant?.variantName && String(q.variant.variantName).toLowerCase().includes(keyword))
    );
  });

  // Xem chi tiết
  const handleView = async (quotationId) => {
    try {
      // Luôn fetch từ API để đảm bảo có dữ liệu mới nhất
      const res = await quotationAPI.getQuotation(quotationId);
      let quotationData = res.data?.data || res.data || res;
      console.log("📋 Quotation detail data from API (FULL):", JSON.stringify(quotationData, null, 2));
      
      // Nếu không có customer data nhưng có customerId, fetch customer riêng
      if (!quotationData.customer && quotationData.customerId) {
        try {
          console.log("🔄 Fetching customer data separately...");
          const customerRes = await customerAPI.getCustomer(quotationData.customerId);
          const customerData = customerRes.data?.data || customerRes.data || customerRes;
          console.log("✅ Customer data fetched:", customerData);
          quotationData = { ...quotationData, customer: customerData };
        } catch (customerErr) {
          console.error("❌ Lỗi khi fetch customer:", customerErr);
        }
      }
      
      // Nếu không có variant data nhưng có variantId, fetch variant riêng
      if (!quotationData.variant && quotationData.variantId) {
        try {
          console.log("🔄 Fetching variant data separately...");
          const variantId = quotationData.variantId;
          try {
            const variantRes = await vehicleAPI.getVariant(variantId);
            const variantData = variantRes.data?.data || variantRes.data || variantRes;
            if (variantData) {
              console.log("✅ Variant data fetched directly:", variantData);
              quotationData = { ...quotationData, variant: variantData };
            }
          } catch (directErr) {
            // Fallback: tìm trong danh sách variants
            console.log("⚠️ Direct fetch failed, trying list...");
            const variantRes = await publicVehicleAPI.getVariants();
            const allVariants = variantRes.data || [];
            const variantData = allVariants.find(v => (v.variantId || v.id) == variantId);
            if (variantData) {
              console.log("✅ Variant data found in list:", variantData);
              quotationData = { ...quotationData, variant: variantData };
            }
          }
        } catch (variantErr) {
          console.error("❌ Lỗi khi fetch variant:", variantErr);
        }
      }
      
      // Nếu không có color data nhưng có colorId, fetch color riêng
      if (!quotationData.color && quotationData.colorId) {
        try {
          console.log("🔄 Fetching color data separately...");
          const colorId = quotationData.colorId;
          try {
            const colorRes = await vehicleAPI.getColor(colorId);
            const colorData = colorRes.data?.data || colorRes.data || colorRes;
            if (colorData) {
              console.log("✅ Color data fetched directly:", colorData);
              quotationData = { ...quotationData, color: colorData };
            }
          } catch (directErr) {
            // Fallback: tìm trong danh sách colors
            console.log("⚠️ Direct fetch failed, trying list...");
            const colorRes = await publicVehicleAPI.getColors();
            const allColors = colorRes.data || [];
            const colorData = allColors.find(c => (c.colorId || c.id) == colorId);
            if (colorData) {
              console.log("✅ Color data found in list:", colorData);
              quotationData = { ...quotationData, color: colorData };
            }
          }
        } catch (colorErr) {
          console.error("❌ Lỗi khi fetch color:", colorErr);
        }
      }
      
      // Nếu có orderId, fetch order để lấy thông tin đầy đủ
      if (quotationData.orderId) {
        try {
          console.log("🔄 Fetching order data separately...");
          const orderRes = await orderAPI.getOrder(quotationData.orderId);
          let orderData = orderRes.data?.data || orderRes.data || orderRes;
          console.log("✅ Order data fetched:", orderData);
          
          // Fetch customer nếu chỉ có customerId
          if (!orderData.customer && orderData.customerId) {
            try {
              const customerRes = await customerAPI.getCustomer(orderData.customerId);
              const customerData = customerRes.data?.data || customerRes.data || customerRes;
              orderData = { ...orderData, customer: customerData };
            } catch (customerErr) {
              console.error("❌ Lỗi khi fetch customer từ order:", customerErr);
            }
          }
          
          // Fetch inventory và variant nếu có inventoryId
          if (orderData.inventoryId && (!orderData.inventory || !orderData.inventory.variant)) {
            try {
              const inventoryRes = await inventoryAPI.getInventoryById(orderData.inventoryId);
              let inventoryData = inventoryRes.data?.data || inventoryRes.data || inventoryRes;
              
              // Fetch variant nếu chỉ có variantId
              if (inventoryData.variantId || inventoryData.variant?.variantId) {
                const variantId = inventoryData.variantId || inventoryData.variant?.variantId || inventoryData.variant?.id;
                if (variantId && (!inventoryData.variant || !inventoryData.variant.model)) {
                  try {
                    const variantRes = await vehicleAPI.getVariant(variantId);
                    const variantData = variantRes.data?.data || variantRes.data || variantRes;
                    
                    // Fetch model nếu chỉ có modelId
                    if (variantData.modelId && !variantData.model) {
                      try {
                        const modelRes = await vehicleAPI.getModel(variantData.modelId);
                        const modelData = modelRes.data?.data || modelRes.data || modelRes;
                        
                        // Fetch brand nếu chỉ có brandId
                        if (modelData.brandId && !modelData.brand) {
                          try {
                            const brandRes = await vehicleAPI.getBrand(modelData.brandId);
                            const brandData = brandRes.data?.data || brandRes.data || brandRes;
                            modelData.brand = brandData;
                          } catch (brandErr) {
                            console.error("❌ Lỗi khi fetch brand:", brandErr);
                          }
                        }
                        
                        variantData.model = modelData;
                      } catch (modelErr) {
                        console.error("❌ Lỗi khi fetch model:", modelErr);
                      }
                    }
                    
                    inventoryData.variant = variantData;
                  } catch (variantErr) {
                    console.error("❌ Lỗi khi fetch variant:", variantErr);
                  }
                }
              }
              
              // Fetch color nếu chỉ có colorId
              if (inventoryData.colorId && !inventoryData.color) {
                try {
                  const colorRes = await vehicleAPI.getColor(inventoryData.colorId);
                  const colorData = colorRes.data?.data || colorRes.data || colorRes;
                  inventoryData.color = colorData;
                } catch (colorErr) {
                  console.error("❌ Lỗi khi fetch color:", colorErr);
                }
              }
              
              orderData.inventory = inventoryData;
            } catch (inventoryErr) {
              console.error("❌ Lỗi khi fetch inventory:", inventoryErr);
            }
          }
          
          quotationData = { ...quotationData, order: orderData };
          
          // Nếu quotation không có customer nhưng order có, dùng customer từ order
          if (!quotationData.customer && orderData.customer) {
            quotationData.customer = orderData.customer;
          }
          
          // Nếu quotation không có variant nhưng order có, dùng variant từ order
          if (!quotationData.variant && orderData.inventory?.variant) {
            quotationData.variant = orderData.inventory.variant;
          }
          
          // Nếu quotation không có color nhưng order có, dùng color từ order
          if (!quotationData.color && orderData.inventory?.color) {
            quotationData.color = orderData.inventory.color;
          }
        } catch (orderErr) {
          console.error("❌ Lỗi khi fetch order:", orderErr);
        }
      }
      
      console.log("📋 Final quotation data with all related data:", quotationData);
      setSelectedQuotation(quotationData);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết báo giá:", err);
      alert("Không thể tải chi tiết báo giá!");
    }
  };

  // Mở popup tạo mới
  const handleOpenCreate = () => {
    setIsEdit(false);
    setSelectedQuotation(null);
    setSelectedOrderData(null); // Reset order data
    setFormData({
      createFrom: isDealerStaff ? "order" : "direct",
      orderId: "",
      customerId: "",
      variantId: "",
      colorId: "",
      quantity: 1,
      unitPrice: "",
      totalPrice: "",
      discountPercentage: "",
      discountAmount: "",
      finalPrice: "",
      validityDays: 7,
      notes: "",
      expiryDate: ""
    });
    setError("");
    setShowPopup(true);
  };

  return (
    <div className="customer">
      <div className="title-customer">Quản lý báo giá khách hàng</div>

      <div className="title2-customer">
        <h2>Danh sách báo giá khách hàng</h2>
        <small style={{ color: "#666", fontSize: "14px", display: "block", marginTop: "5px" }}>
          💡 Chỉ hiển thị báo giá đã tạo từ đơn hàng. Để tạo báo giá mới, vui lòng vào trang "Đơn hàng"
        </small>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm báo giá..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>SỐ BÁO GIÁ</th>
              <th>KHÁCH HÀNG</th>
              <th>XE ĐẶT MUA</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>NGÀY TẠO</th>
              <th>NGÀY HẾT HẠN</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredQuotations.length > 0 ? (
              filteredQuotations.map((q, index) => {
                const quotationId = q.quotationId || q.id || `quotation-${index}`;
                const finalPrice = q.finalPrice || q.totalPrice || (q.unitPrice && q.quantity ? (q.unitPrice * q.quantity * (1 - (q.discountPercentage || 0) / 100)) : 0);
                const customer = q.customer || q.order?.customer;
                const variant = q.variant || q.order?.inventory?.variant;
                const brand = variant?.model?.brand || variant?.brand;
                const brandName = brand?.brandName || brand?.brand_name || brand?.name;
                const variantName = variant?.variantName || variant?.variant_name || variant?.name;
                const modelName = variant?.model?.modelName || variant?.model?.model_name || variant?.model?.name;
                
                return (
                  <tr key={quotationId}>
                    <td>{q.quotationNumber || "—"}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {(() => {
                          const firstName = customer?.firstName || customer?.first_name || '';
                          const lastName = customer?.lastName || customer?.last_name || '';
                          const fullName = `${firstName} ${lastName}`.trim();
                          
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
                        {finalPrice > 0 ? finalPrice.toLocaleString('vi-VN') : '0'} ₫
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(q.status)}`}>
                        {q.status || "—"}
                      </span>
                    </td>
                    <td>{formatDate(q.quotationDate || q.createdAt || q.createdDate)}</td>
                    <td>
                      <span style={{ 
                        color: q.expiryDate && new Date(q.expiryDate) < new Date() ? "#dc2626" : "#16a34a",
                        fontWeight: "500"
                      }}>
                        {formatDate(q.expiryDate)}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="icon-btn view" onClick={() => handleView(quotationId)} title="Xem chi tiết">
                        <FaEye />
                      </button>
                      {(isEVMStaff || isAdmin || isDealerStaff) && (
                        <>
                          {(q.status?.toUpperCase() === "PENDING" || q.status?.toLowerCase() === "pending") && (
                            <button className="icon-btn send" onClick={() => handleSendQuotation(quotationId)} title="Gửi báo giá">
                              <FaPaperPlane />
                            </button>
                          )}
                          <button className="icon-btn delete" onClick={() => handleDeleteQuotation(quotationId)} title="Xóa">
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666", padding: "40px" }}>
                  <div>
                    <p style={{ fontSize: "16px", marginBottom: "10px" }}>Chưa có báo giá nào được tạo từ đơn hàng</p>
                    <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                      💡 Để tạo báo giá mới, vui lòng vào trang <strong>"Đơn hàng"</strong> và click nút "Tạo báo giá"
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup tạo/sửa báo giá */}
      {showPopup && (isEVMStaff || isAdmin || isDealerStaff) && (
        <div className="popup-overlay" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedQuotation(null); }}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()} style={{ 
            maxHeight: "90vh", 
            overflowY: "auto", 
            overflowX: "hidden",
            padding: "20px 24px",
            width: "600px",
            maxWidth: "90vw"
          }}>
            <h2 style={{ marginTop: "0", marginBottom: "20px" }}>{isEdit ? "Sửa báo giá khách hàng" : "Tạo báo giá khách hàng"}</h2>
            {error && <div className="error-message" style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#fee2e2", borderRadius: "4px", color: "#dc2626" }}>{error}</div>}
            <form onSubmit={handleCreateQuotation} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {!isEdit && isDealerStaff && (
                <div style={{ marginBottom: "15px" }}>
                  <label>Tạo từ *</label>
                  <select
                    value={formData.createFrom}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        createFrom: e.target.value,
                        orderId: "",
                        customerId: "",
                        variantId: "",
                        colorId: "",
                        unitPrice: "",
                        totalPrice: "",
                        finalPrice: "",
                        discountAmount: ""
                      });
                    }}
                    required
                    style={{ width: "100%", padding: "8px" }}
                  >
                    <option value="order">Từ đơn hàng</option>
                    <option value="direct">Trực tiếp</option>
                  </select>
                </div>
              )}

              {!isEdit && isDealerStaff && formData.createFrom === "order" && (
                <div style={{ marginBottom: "15px" }}>
                  <label>Đơn hàng *</label>
                  <select
                    value={formData.orderId}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px" }}
                  >
                    <option value="">-- Chọn đơn hàng --</option>
                    {orders.map((o) => {
                      const orderId = o.orderId || o.id;
                      const orderNumber = o.orderNumber || `Order ${orderId}`;
                      const customerName = o.customer 
                        ? `${o.customer.firstName || ""} ${o.customer.lastName || ""}`.trim() || o.customer.email || "—"
                        : "—";
                      return (
                        <option key={orderId} value={orderId}>
                          {orderNumber} - {customerName}
                        </option>
                      );
                    })}
                  </select>
                  {orders.length === 0 && (
                    <small style={{ color: "#ff6b6b", display: "block", marginTop: "5px" }}>
                      ⚠️ Không có đơn hàng nào phù hợp (chỉ hiển thị đơn hàng có status pending/quoted)
                    </small>
                  )}
                </div>
              )}

              {/* Hiển thị các field - nếu từ order thì readonly, nếu không thì cho chọn */}
              {formData.createFrom === "order" && formData.orderId !== "" ? (
                <>
                  {/* Thông tin khách hàng - readonly khi từ order */}
                  <div style={{ marginBottom: "15px" }}>
                    <label>Khách hàng *</label>
                    <input
                      type="text"
                      value={(() => {
                        // Ưu tiên lấy từ selectedOrderData
                        if (selectedOrderData?.customer) {
                          const c = selectedOrderData.customer;
                          return `${c.firstName || c.first_name || ""} ${c.lastName || c.last_name || ""}`.trim() || c.email || "—";
                        }
                        // Fallback: tìm trong danh sách customers
                        if (formData.customerId) {
                          const customer = customers.find(c => (c.customerId || c.id) === formData.customerId);
                          if (customer) {
                            return `${customer.firstName || customer.first_name || ""} ${customer.lastName || customer.last_name || ""}`.trim() || customer.email || "—";
                          }
                        }
                        return "—";
                      })()}
                      readOnly
                      style={{ 
                        width: "100%", 
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e5e7eb",
                        borderRadius: "4px",
                        cursor: "not-allowed"
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: "15px" }}>
                    <label>Email</label>
                    <input
                      type="text"
                      value={(() => {
                        // Ưu tiên lấy từ selectedOrderData
                        if (selectedOrderData?.customer) {
                          return selectedOrderData.customer.email || "—";
                        }
                        // Fallback: tìm trong danh sách customers
                        if (formData.customerId) {
                          const customer = customers.find(c => (c.customerId || c.id) === formData.customerId);
                          return customer?.email || "—";
                        }
                        return "—";
                      })()}
                      readOnly
                      style={{ 
                        width: "100%", 
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e5e7eb",
                        borderRadius: "4px",
                        cursor: "not-allowed"
                      }}
                    />
                  </div>

                  {/* Thông tin xe - readonly khi từ order */}
                  <div style={{ marginBottom: "15px" }}>
                    <label>Thương hiệu</label>
                    <input
                      type="text"
                      value={(() => {
                        // Ưu tiên lấy từ selectedOrderData
                        const variant = selectedOrderData?.quotation?.variant || selectedOrderData?.inventory?.variant;
                        if (variant) {
                          return variant.model?.brand?.brandName || variant.model?.brand?.brand_name || variant.brand?.brandName || variant.brand?.name || "—";
                        }
                        // Fallback: tìm trong danh sách variants
                        if (formData.variantId) {
                          const v = variants.find(v => (v.variantId || v.id) == formData.variantId);
                          if (v) {
                            return v.model?.brand?.brandName || v.brand?.brandName || "—";
                          }
                        }
                        return "—";
                      })()}
                      readOnly
                      style={{ 
                        width: "100%", 
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e5e7eb",
                        borderRadius: "4px",
                        cursor: "not-allowed"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Dòng xe *</label>
                    <input
                      type="text"
                      value={(() => {
                        // Ưu tiên lấy từ selectedOrderData
                        const variant = selectedOrderData?.quotation?.variant || selectedOrderData?.inventory?.variant;
                        if (variant) {
                          return variant.variantName || variant.variant_name || variant.model?.modelName || variant.model?.model_name || variant.name || "—";
                        }
                        // Fallback: tìm trong danh sách variants
                        if (formData.variantId) {
                          const v = variants.find(v => (v.variantId || v.id) == formData.variantId);
                          if (v) {
                            return v.variantName || v.variant_name || v.model?.modelName || "—";
                          }
                        }
                        return "—";
                      })()}
                      readOnly
                      style={{ 
                        width: "100%", 
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e5e7eb",
                        borderRadius: "4px",
                        cursor: "not-allowed"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Màu sắc *</label>
                    <input
                      type="text"
                      value={(() => {
                        // Ưu tiên lấy từ selectedOrderData
                        const color = selectedOrderData?.quotation?.color || selectedOrderData?.inventory?.color;
                        if (color) {
                          return color.colorName || color.color_name || color.name || "—";
                        }
                        // Fallback: tìm trong danh sách colors
                        if (formData.colorId) {
                          const c = colors.find(c => (c.colorId || c.id) == formData.colorId);
                          return c?.colorName || c?.color_name || c?.name || "—";
                        }
                        return "—";
                      })()}
                      readOnly
                      style={{ 
                        width: "100%", 
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e5e7eb",
                        borderRadius: "4px",
                        cursor: "not-allowed"
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <label>Khách hàng *</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px" }}
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers.map((c) => (
                        <option key={c.customerId || c.id} value={c.customerId || c.id}>
                          {c.firstName} {c.lastName} - {c.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Phiên bản xe *</label>
                    <select
                      value={formData.variantId}
                      onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px" }}
                    >
                      <option value="">-- Chọn phiên bản --</option>
                      {variants.map((v) => (
                        <option key={v.variantId || v.id} value={v.variantId || v.id}>
                          {v.model?.brand?.brandName || ""} {v.model?.modelName || ""} - {v.variantName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Màu sắc *</label>
                    <select
                      value={formData.colorId}
                      onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px" }}
                    >
                      <option value="">-- Chọn màu --</option>
                      {colors.map((c) => (
                        <option key={c.colorId || c.id} value={c.colorId || c.id}>
                          {c.colorName || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: "15px" }}>
                <label>Số lượng *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => {
                    const newQuantity = e.target.value;
                    const { totalPrice, discountAmount, finalPrice } = calculatePrices(
                      formData.unitPrice, 
                      newQuantity, 
                      formData.discountPercentage
                    );
                    setFormData({ 
                      ...formData, 
                      quantity: newQuantity,
                      totalPrice: totalPrice,
                      discountAmount: discountAmount,
                      finalPrice: finalPrice
                    });
                  }}
                  required
                />
              </div>

              {formData.createFrom === "direct" && (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <label>Đơn giá (₫)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.unitPrice}
                      onChange={(e) => {
                        const newUnitPrice = e.target.value;
                        const { totalPrice, discountAmount, finalPrice } = calculatePrices(
                          newUnitPrice, 
                          formData.quantity, 
                          formData.discountPercentage
                        );
                        setFormData({ 
                          ...formData, 
                          unitPrice: newUnitPrice,
                          totalPrice: totalPrice,
                          discountAmount: discountAmount,
                          finalPrice: finalPrice
                        });
                      }}
                      placeholder="Ví dụ: 500000000"
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Tổng giá (₫) - Tự động tính</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.totalPrice || (formData.unitPrice && formData.quantity ? parseFloat(formData.unitPrice) * parseInt(formData.quantity) : 0)}
                      style={{ background: "#f5f5f5", width: "100%", padding: "8px" }}
                    />
                  </div>
                </>
              )}

              {formData.createFrom === "order" && (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <label>Tổng giá từ đơn hàng (VNĐ)</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.totalPrice || "0"}
                      style={{ 
                        background: "#f5f5f5", 
                        width: "100%", 
                        padding: "8px",
                        fontWeight: "bold",
                        color: "#1e293b",
                        fontSize: "16px"
                      }}
                    />
                    <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                      💡 Giá đã được lấy tự động từ đơn hàng
                    </small>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="checkbox"
                        checked={parseFloat(formData.discountAmount || 0) > 0}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            // Không giảm giá → finalPrice = totalPrice
                            setFormData({
                              ...formData,
                              finalPrice: formData.totalPrice,
                              discountAmount: "0"
                            });
                          } else {
                            // Có giảm giá → mặc định giảm 2% (có thể điều chỉnh)
                            const total = parseFloat(formData.totalPrice) || 0;
                            const defaultDiscount = total * 0.02; // 2%
                            const newFinal = total - defaultDiscount;
                            setFormData({
                              ...formData,
                              finalPrice: String(newFinal),
                              discountAmount: defaultDiscount.toFixed(2)
                            });
                          }
                        }}
                        style={{ width: "20px", height: "20px", cursor: "pointer" }}
                      />
                      <span>Có giảm giá</span>
                    </label>
                  </div>

                  {parseFloat(formData.discountAmount || 0) > 0 && (
                    <>
                      <div style={{ marginBottom: "15px" }}>
                        <label>Giá cuối cùng sau giảm (VNĐ) *</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => adjustPrice("finalPrice", -1000000)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "16px"
                            }}
                            title="Giảm 1 triệu"
                          >
                            -1M
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustPrice("finalPrice", -100000)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "16px"
                            }}
                            title="Giảm 100k"
                          >
                            -100k
                          </button>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={formData.finalPrice}
                            onChange={(e) => {
                              const total = parseFloat(formData.totalPrice) || 0;
                              const final = parseFloat(e.target.value) || 0;
                              const discount = total - final;
                              setFormData({ 
                                ...formData, 
                                finalPrice: e.target.value,
                                discountAmount: discount >= 0 ? discount.toFixed(2) : "0"
                              });
                            }}
                            required
                            style={{ flex: 1, padding: "8px" }}
                            placeholder="Nhập giá cuối cùng"
                          />
                          <button
                            type="button"
                            onClick={() => adjustPrice("finalPrice", 100000)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#dcfce7",
                              color: "#16a34a",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "16px"
                            }}
                            title="Tăng 100k"
                          >
                            +100k
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustPrice("finalPrice", 1000000)}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#dcfce7",
                              color: "#16a34a",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "16px"
                            }}
                            title="Tăng 1 triệu"
                          >
                            +1M
                          </button>
                        </div>
                        <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                          💡 Điều chỉnh giá cuối cùng để áp dụng giảm giá
                        </small>
                      </div>

                      <div style={{ marginBottom: "15px" }}>
                        <label>Giảm giá (VNĐ) - Tự động tính</label>
                        <input
                          type="number"
                          readOnly
                          value={formData.discountAmount || "0"}
                          style={{ 
                            background: "#f5f5f5", 
                            width: "100%", 
                            padding: "8px",
                            fontWeight: "bold",
                            color: "#dc2626",
                            fontSize: "16px"
                          }}
                          placeholder="Tự động tính từ tổng giá - giá cuối cùng"
                        />
                        {formData.discountAmount && parseFloat(formData.discountAmount) > 0 && (
                          <small style={{ color: "#16a34a", fontSize: "12px", display: "block", marginTop: "5px" }}>
                            ✅ Đã giảm: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(parseFloat(formData.discountAmount))}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {parseFloat(formData.discountAmount || 0) === 0 && (
                    <div style={{ marginBottom: "15px" }}>
                      <label>Giá cuối cùng (VNĐ) *</label>
                      <input
                        type="number"
                        readOnly
                        value={formData.finalPrice || formData.totalPrice || "0"}
                        style={{ 
                          background: "#f5f5f5", 
                          width: "100%", 
                          padding: "8px",
                          fontWeight: "bold",
                          color: "#16a34a",
                          fontSize: "16px"
                        }}
                      />
                      <small style={{ color: "#666", fontSize: "12px", display: "block", marginTop: "5px" }}>
                        💡 Bằng tổng giá (chưa giảm giá)
                      </small>
                    </div>
                  )}
                </>
              )}

              {formData.createFrom === "direct" && (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <label>Phần trăm giảm giá (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.discountPercentage}
                      onChange={(e) => {
                        const newDiscountPercent = e.target.value;
                        const { totalPrice, discountAmount, finalPrice } = calculatePrices(
                          formData.unitPrice, 
                          formData.quantity, 
                          newDiscountPercent
                        );
                        setFormData({ 
                          ...formData, 
                          discountPercentage: newDiscountPercent,
                          totalPrice: totalPrice,
                          discountAmount: discountAmount,
                          finalPrice: finalPrice
                        });
                      }}
                      placeholder="Ví dụ: 5"
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Số tiền giảm giá (₫) - Tự động tính</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.discountAmount || 0}
                      style={{ background: "#f5f5f5", width: "100%", padding: "8px" }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Giá cuối cùng (₫) - Tự động tính</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.finalPrice || 0}
                      style={{ background: "#f5f5f5", fontWeight: "bold", color: "#16a34a", width: "100%", padding: "8px" }}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: "15px" }}>
                <label>Số ngày hiệu lực</label>
                <input
                  type="number"
                  min="1"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                  placeholder="Mặc định: 7 ngày"
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Ghi chú cho báo giá..."
                />
              </div>

              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo báo giá"}</button>
                <button type="button" onClick={() => { setShowPopup(false); setIsEdit(false); setSelectedQuotation(null); }}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedQuotation && (
        <div className="popup-overlay" onClick={() => setShowDetail(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2>Thông tin báo giá</h2>
            <div className="detail-content" style={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}>
              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#1e293b" }}>Thông tin báo giá</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <b>Số báo giá:</b> {selectedQuotation.quotationNumber || selectedQuotation.quotationId || "—"}
                  </div>
                  <div>
                    <b>Trạng thái:</b>{" "}
                    <span className={`status-badge ${getStatusBadge(selectedQuotation.status)}`}>
                      {selectedQuotation.status || "pending"}
                    </span>
                  </div>
                  <div>
                    <b>Ngày tạo:</b> {formatDate(selectedQuotation.quotationDate || selectedQuotation.createdAt || selectedQuotation.createdDate)}
                  </div>
                  <div>
                    <b>Ngày hết hạn:</b>{" "}
                    <span style={{ color: selectedQuotation.expiryDate && new Date(selectedQuotation.expiryDate) < new Date() ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>
                      {formatDate(selectedQuotation.expiryDate)}
                    </span>
                    {selectedQuotation.validityDays && (
                      <span style={{ fontSize: "12px", color: "#666", marginLeft: "5px" }}>
                        (Hiệu lực: {selectedQuotation.validityDays} ngày)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#1e293b" }}>Thông tin khách hàng</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <b>Họ tên:</b> {(() => {
                      const customer = selectedQuotation.customer || selectedQuotation.order?.customer;
                      const firstName = customer?.firstName || customer?.first_name || '';
                      const lastName = customer?.lastName || customer?.last_name || '';
                      const fullName = `${firstName} ${lastName}`.trim();
                      return fullName || "—";
                    })()}
                  </div>
                  <div>
                    <b>Email:</b> {(() => {
                      const customer = selectedQuotation.customer || selectedQuotation.order?.customer;
                      return customer?.email || "—";
                    })()}
                  </div>
                  <div>
                    <b>Điện thoại:</b> {(() => {
                      const customer = selectedQuotation.customer || selectedQuotation.order?.customer;
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
                      const variant = selectedQuotation.variant || selectedQuotation.order?.inventory?.variant;
                      const brand = variant?.model?.brand || variant?.brand;
                      const brandName = brand?.brandName || brand?.brand_name || brand?.name;
                      return brandName || "—";
                    })()}
                  </div>
                  <div>
                    <b>Dòng xe:</b> {(() => {
                      const variant = selectedQuotation.variant || selectedQuotation.order?.inventory?.variant;
                      const variantName = variant?.variantName || variant?.variant_name || variant?.name;
                      const modelName = variant?.model?.modelName || variant?.model?.model_name || variant?.model?.name;
                      return variantName || modelName || "—";
                    })()}
                  </div>
                  <div>
                    <b>Màu sắc:</b> {(() => {
                      const color = selectedQuotation.color || selectedQuotation.order?.inventory?.color;
                      return color?.colorName || color?.color_name || color?.name || "—";
                    })()}
                  </div>
                  {selectedQuotation.quantity && (
                    <div>
                      <b>Số lượng:</b> {selectedQuotation.quantity}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#e0f2fe", borderRadius: "8px", border: "1px solid #7dd3fc" }}>
                <h3 style={{ marginTop: "0", marginBottom: "15px", color: "#0369a1" }}>Thông tin giá</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {selectedQuotation.unitPrice && (
                    <div>
                      <b>Đơn giá:</b>{" "}
                      <span style={{ fontWeight: "bold", color: "#16a34a" }}>
                        {formatPrice(selectedQuotation.unitPrice)}
                      </span>
                    </div>
                  )}
                  <div>
                    <b>Tổng giá:</b>{" "}
                    <span style={{ fontWeight: "bold", color: "#16a34a", fontSize: "18px" }}>
                      {formatPrice(selectedQuotation.totalPrice)}
                    </span>
                  </div>
                  <div>
                    <b>Giảm giá:</b>{" "}
                    <span style={{ fontWeight: "500", color: "#dc2626" }}>
                      {formatPrice(selectedQuotation.discountAmount || 0)}
                    </span>
                    {selectedQuotation.discountPercentage && (
                      <span style={{ fontSize: "12px", color: "#666", marginLeft: "5px" }}>
                        ({selectedQuotation.discountPercentage}%)
                      </span>
                    )}
                  </div>
                  <div>
                    <b>Giá cuối cùng:</b>{" "}
                    <span style={{ fontWeight: "bold", color: "#16a34a", fontSize: "20px" }}>
                      {formatPrice(selectedQuotation.finalPrice || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedQuotation.notes && (
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <h3 style={{ marginTop: "0", marginBottom: "10px", color: "#1e293b" }}>Ghi chú</h3>
                  <p style={{ margin: "0", color: "#666" }}>{selectedQuotation.notes}</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup hiển thị link công khai */}
      {showLinkPopup && (
        <div className="popup-overlay" onClick={() => setShowLinkPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <h2 style={{ marginTop: "0", marginBottom: "20px", color: "#16a34a" }}>
              ✅ Gửi báo giá thành công!
            </h2>
            
            <div style={{ marginBottom: "20px" }}>
              <p style={{ marginBottom: "10px", color: "#64748b" }}>
                🔗 Link công khai để khách hàng xem và phản hồi báo giá:
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  value={publicLink}
                  readOnly
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    backgroundColor: "#f8f9fa",
                    cursor: "text"
                  }}
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(publicLink);
                      alert("✅ Đã copy link!");
                    } catch (err) {
                      // Fallback cho trình duyệt cũ
                      const input = document.createElement("input");
                      input.value = publicLink;
                      document.body.appendChild(input);
                      input.select();
                      document.execCommand("copy");
                      document.body.removeChild(input);
                      alert("✅ Đã copy link!");
                    }
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    whiteSpace: "nowrap"
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            <div style={{ 
              padding: "15px", 
              backgroundColor: "#e0f2fe", 
              borderRadius: "8px",
              border: "1px solid #7dd3fc",
              marginBottom: "20px"
            }}>
              <p style={{ margin: "0 0 10px 0", fontWeight: "600", color: "#0369a1" }}>
                💡 Bước tiếp theo:
              </p>
              <ol style={{ margin: "0", paddingLeft: "20px", color: "#0369a1" }}>
                <li>Copy link trên và gửi cho khách hàng (qua email/SMS/Zalo)</li>
                <li>Khách hàng truy cập link để xem chi tiết báo giá</li>
                <li>Khách hàng có thể chấp nhận hoặc từ chối báo giá trực tiếp trên trang</li>
                <li>Khi khách chấp nhận, đơn hàng sẽ tự động chuyển sang trạng thái 'confirmed'</li>
              </ol>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                className="btn-close"
                onClick={() => setShowLinkPopup(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

