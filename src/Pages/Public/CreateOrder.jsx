import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { publicOrderAPI, publicVehicleAPI, publicCustomerAPI, vehicleAPI } from "../../services/API.js";
import { getVariantImageUrl } from "../../utils/imageUtils.js";
import Nvabar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./CreateOrder.css";

export default function CreateOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const customerId = searchParams.get("customerId");
  const inventoryId = searchParams.get("inventoryId");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [inventory, setInventory] = useState(null);
  const [customer, setCustomer] = useState(null);
  
  const [orderForm, setOrderForm] = useState({
    notes: "",
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
    if (inventoryId) {
      fetchInventory();
    }
  }, [customerId, inventoryId]);

  const fetchCustomer = async () => {
    try {
      const res = await publicCustomerAPI.getCustomer(customerId);
      const customerData = res.data || res;
      setCustomer(customerData);
    } catch (err) {
      console.error("Lỗi khi tải thông tin khách hàng:", err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await publicVehicleAPI.getInventoryById(inventoryId);
      let inventoryData = res.data || res;
      
      // Nếu variant chỉ có ID, fetch đầy đủ thông tin variant
      if (inventoryData.variantId || inventoryData.variant?.variantId || inventoryData.variant?.id) {
        const variantId = inventoryData.variantId || inventoryData.variant?.variantId || inventoryData.variant?.id;
        
        // Nếu variant không có đầy đủ thông tin (model, brand), fetch từ API
        if (!inventoryData.variant?.model || !inventoryData.variant?.variantName) {
          try {
            // Thử fetch variant chi tiết từ vehicleAPI trước (nếu có quyền)
            try {
              const variantRes = await vehicleAPI.getVariant(variantId);
              const variantData = variantRes.data?.data || variantRes.data || variantRes;
              console.log("✅ Variant data fetched from vehicleAPI:", variantData);
              
              // Nếu variant có modelId nhưng không có model object, fetch model riêng
              if (variantData && !variantData.model && (variantData.modelId || variantData.model?.modelId)) {
                try {
                  const modelId = variantData.modelId || variantData.model?.modelId;
                  const modelRes = await vehicleAPI.getModel(modelId);
                  const modelData = modelRes.data?.data || modelRes.data || modelRes;
                  
                  // Nếu model có brandId nhưng không có brand object, fetch brand riêng
                  if (modelData && !modelData.brand && (modelData.brandId || modelData.brand?.brandId)) {
                    try {
                      const brandId = modelData.brandId || modelData.brand?.brandId;
                      const brandRes = await vehicleAPI.getBrand(brandId);
                      const brandData = brandRes.data?.data || brandRes.data || brandRes;
                      modelData.brand = brandData;
                    } catch (brandErr) {
                      console.warn("⚠️ Không thể fetch brand:", brandErr);
                    }
                  }
                  
                  variantData.model = modelData;
                } catch (modelErr) {
                  console.warn("⚠️ Không thể fetch model:", modelErr);
                }
              }
              
              if (variantData && (variantData.model || variantData.variantName)) {
                inventoryData = {
                  ...inventoryData,
                  variant: variantData
                };
              }
            } catch (directErr) {
              // Fallback: tìm trong danh sách variants từ publicVehicleAPI
              console.log("⚠️ Direct fetch failed, trying list...");
              const variantsRes = await publicVehicleAPI.getVariants();
              const allVariants = Array.isArray(variantsRes.data?.data) ? variantsRes.data.data :
                                Array.isArray(variantsRes.data) ? variantsRes.data :
                                Array.isArray(variantsRes) ? variantsRes : [];
              const variantData = allVariants.find(v => (v.variantId || v.id) == variantId);
              if (variantData) {
                console.log("✅ Variant data found in list:", variantData);
                inventoryData = {
                  ...inventoryData,
                  variant: variantData
                };
              }
            }
          } catch (variantErr) {
            console.error("❌ Lỗi khi fetch variant:", variantErr);
          }
        }
      }
      
      // Nếu color chỉ có ID, fetch đầy đủ thông tin color
      if (inventoryData.colorId || inventoryData.color?.colorId || inventoryData.color?.id) {
        const colorId = inventoryData.colorId || inventoryData.color?.colorId || inventoryData.color?.id;
        
        // Nếu color không có đầy đủ thông tin, fetch từ colors list
        if (!inventoryData.color?.colorName) {
          try {
            const colorsRes = await publicVehicleAPI.getColors();
            const allColors = colorsRes.data || [];
            const colorData = allColors.find(c => (c.colorId || c.id) == colorId);
            if (colorData) {
              inventoryData = {
                ...inventoryData,
                color: colorData
              };
            }
          } catch (colorErr) {
            console.error("❌ Lỗi khi fetch color:", colorErr);
          }
        }
      }
      
      setInventory(inventoryData);
      
    } catch (err) {
      console.error("Lỗi khi tải thông tin xe:", err);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!customerId) {
      setError("Thông tin khách hàng không hợp lệ.");
      return false;
    }
    if (!inventoryId) {
      setError("Thông tin xe không hợp lệ.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      // Lấy variantId và colorId từ inventory
      const variantId = inventory?.variantId || inventory?.variant?.variantId || inventory?.variant?.id;
      const colorId = inventory?.colorId || inventory?.color?.colorId || inventory?.color?.id;
      
      // Lấy giá từ inventory
      const price = inventory?.sellingPrice || inventory?.price || inventory?.priceBase || 
                    inventory?.variant?.basePrice || inventory?.variant?.priceBase || null;
      
      const orderPayload = {
        customerId: customerId,
        inventoryId: inventoryId,
        variantId: variantId ? Number(variantId) : null,
        colorId: colorId ? Number(colorId) : null,
        finalPrice: price ? Number(price) : null,
        notes: orderForm.notes || "",
        status: "PENDING",
      };

      const createRes = await publicOrderAPI.createOrder(orderPayload);
      console.log("✅ Order created successfully:", createRes);
      
      const orderData = createRes.data || createRes.data?.data || createRes;
      const orderNumber = orderData?.orderNumber || orderData?.orderId || "—";
      
      setSuccess(true);
      
      // Thông báo thành công và hướng dẫn
      alert(`✅ Tạo đơn hàng thành công!\n\n📋 Số đơn hàng: ${orderNumber}\n\n💡 Đơn hàng của bạn đã được tạo và sẽ hiển thị trong trang "Báo giá" để nhân viên xử lý.\n\nChúng tôi sẽ liên hệ với bạn sớm nhất có thể.`);
      
      // Điều hướng về home sau 3 giây
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      
      // Thử với cấu trúc quotation nếu lỗi
      if (err.response?.status === 400) {
        try {
          // Lấy variantId và colorId từ inventory
          const variantId = inventory?.variantId || inventory?.variant?.variantId || inventory?.variant?.id;
          const colorId = inventory?.colorId || inventory?.color?.colorId || inventory?.color?.id;
          
          // Lấy giá từ inventory
          const price = inventory?.sellingPrice || inventory?.price || inventory?.priceBase || 
                        inventory?.variant?.basePrice || inventory?.variant?.priceBase || null;
          
          const quotationPayload = {
            quotation: {
              customerId: customerId,
              inventoryId: inventoryId,
              variantId: variantId ? Number(variantId) : null,
              colorId: colorId ? Number(colorId) : null,
              finalPrice: price ? Number(price) : null,
              notes: orderForm.notes || "",
            },
            status: "PENDING",
          };
          const createRes = await publicOrderAPI.createOrder(quotationPayload);
          console.log("✅ Order created successfully (fallback):", createRes);
          
          const orderData = createRes.data || createRes.data?.data || createRes;
          const orderNumber = orderData?.orderNumber || orderData?.orderId || "—";
          
          setSuccess(true);
          
          // Thông báo thành công và hướng dẫn
          alert(`✅ Tạo đơn hàng thành công!\n\n📋 Số đơn hàng: ${orderNumber}\n\n💡 Đơn hàng của bạn đã được tạo và sẽ hiển thị trong trang "Báo giá" để nhân viên xử lý.\n\nChúng tôi sẽ liên hệ với bạn sớm nhất có thể.`);
          
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } catch (err2) {
          setError(
            err2.response?.data?.message ||
              err2.response?.data?.error ||
              "Không thể tạo đơn hàng! Vui lòng kiểm tra lại thông tin."
          );
        }
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Không thể tạo đơn hàng!"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getCarName = (inv) => {
    if (inv?.variantName) {
      return inv.variantName;
    }
    const brand = inv?.variant?.model?.brand?.brandName || "";
    const model = inv?.variant?.model?.modelName || "";
    const variant = inv?.variant?.variantName || "";
    const parts = [brand, model, variant].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Xe";
  };

  if (success) {
    return (
      <>
        <Nvabar />
        <div className="create-order-container" style={{ marginTop: '900px', paddingTop: '1200px', paddingBottom: '1200px' }}>
          <div className="create-order-card">
            <div className="success-message">
              <h2>✅ Đặt hàng thành công!</h2>
              <p>Đơn hàng của bạn đã được tạo thành công.</p>
              <p style={{ color: '#16a34a', fontWeight: '600', marginTop: '15px' }}>
                💡 Đơn hàng sẽ hiển thị trong trang "Báo giá" để nhân viên xử lý và tạo báo giá cho bạn.
              </p>
              <p>Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.</p>
              <p style={{ marginTop: '20px', color: '#64748b' }}>
                Đang chuyển về trang chủ...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nvabar />
      <div className="create-order-container" style={{ marginTop: '900px', paddingTop: '1200px', paddingBottom: '1200px' }}>
        <div className="create-order-card">
          <div className="create-order-header">
            <h1>Thông tin đơn hàng</h1>
            <p>Hoàn tất thông tin để đặt hàng</p>
          </div>

          {customer && (
            <div className="customer-info-box">
              <h3>Khách hàng:</h3>
              <p><strong>{customer.firstName} {customer.lastName}</strong></p>
              <p>Email: {customer.email}</p>
              <p>SĐT: {customer.phone}</p>
            </div>
          )}

          {inventory && (() => {
            console.log("📦 Inventory data:", inventory);
            const variant = inventory.variant || {};
            console.log("🚗 Variant data:", variant);
            
            const brand = variant.model?.brand || variant.brand || {};
            const model = variant.model || {};
            const color = inventory.color || {};
            
            const brandName = brand.brandName || brand.brand_name || brand.name || "—";
            const modelName = model.modelName || model.model_name || model.name || "—";
            const variantName = variant.variantName || variant.variant_name || variant.name || "—";
            const colorName = color.colorName || color.color_name || color.name || "—";
            
            // Lấy giá từ nhiều nguồn
            const price = inventory.sellingPrice || 
                         inventory.price || 
                         inventory.priceBase || 
                         inventory.costPrice ||
                         variant.basePrice ||
                         variant.priceBase || 0;
            
            const formatPrice = (p) => {
              if (!p && p !== 0) return "0 ₫";
              return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);
            };
            
            console.log("📊 Display data:", { brandName, modelName, variantName, colorName, price });
            
            // Lấy các thông số kỹ thuật từ variant
            const topSpeed = variant.topSpeed ?? "—";
            const batteryCapacity = variant.batteryCapacity ?? "—";
            const rangeKm = variant.rangeKm ?? "—";
            const powerKw = variant.powerKw ?? "—";
            const isActive = variant.isActive !== undefined ? variant.isActive : true;
            
            return (
              <div className="vehicle-info-box">
                <h3>Thông tin xe</h3>
                <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>HÌNH</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>TÊN BIẾN THỂ</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>DÒNG XE</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>MÀU SẮC</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>TỐC ĐỘ TỐI ĐA</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>PIN (kWh)</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>GIÁ (VNĐ)</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                          {getVariantImageUrl(variant) ? (
                            <img
                              src={getVariantImageUrl(variant)}
                              alt={variantName}
                              style={{
                                width: 70,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 6,
                                border: '1px solid #e2e8f0'
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextElementSibling) {
                                  e.target.nextElementSibling.style.display = "block";
                                }
                              }}
                            />
                          ) : null}
                          <span style={{ display: "none", fontSize: "10px", color: "#999" }}>—</span>
                        </td>
                        <td style={{ padding: '12px', color: '#1e293b' }}>{variantName || "—"}</td>
                        <td style={{ padding: '12px', color: '#1e293b' }}>
                          {modelName && modelName !== "—" ? modelName : (variant.model?.modelName || variant.model?.model_name || variant.model?.name || "—")}
                        </td>
                        <td style={{ padding: '12px', color: '#1e293b' }}>{colorName || "—"}</td>
                        <td style={{ padding: '12px', color: '#1e293b' }}>{topSpeed === "—" ? "—" : `${topSpeed} km/h`}</td>
                        <td style={{ padding: '12px', color: '#1e293b' }}>{batteryCapacity === "—" ? "—" : `${batteryCapacity} kWh`}</td>
                        <td style={{ padding: '12px', color: '#1e293b', fontWeight: '600' }}>
                          {price ? formatPrice(price) : (variant.priceBase || variant.basePrice || "—")}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              background: isActive ? "#dcfce7" : "#fee2e2",
                              color: isActive ? "#16a34a" : "#dc2626",
                              padding: "5px 8px",
                              borderRadius: 5,
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            {isActive ? "Hoạt động" : "Ngừng"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Ghi chú</label>
                <textarea
                  name="notes"
                  value={orderForm.notes}
                  onChange={handleChange}
                  placeholder="Nhập ghi chú (nếu có)"
                  rows="4"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Đang tạo..." : "Đặt hàng"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

