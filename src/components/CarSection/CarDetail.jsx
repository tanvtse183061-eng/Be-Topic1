import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrderFromCar from "../CreateOrderFromCar/CreateOrderFromCar";
import { publicVehicleAPI } from "../../services/API.js";
import { getVariantImageUrl, getColorSwatchUrl, getModelImageUrl } from "../../utils/imageUtils.js";
import "./Car.css";

export default function CarDetail() {
  const { inventoryId } = useParams();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState(null);
  const [otherColors, setOtherColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (inventoryId) {
      loadInventoryDetail();
    }
  }, [inventoryId]);

  const loadInventoryDetail = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load inventory detail
      const res = await publicVehicleAPI.getInventoryById(inventoryId);
      const inventoryData = res.data || res;
      setInventory(inventoryData);

      // Load other colors of the same variant if variantId exists
      if (inventoryData.variantId || inventoryData.variant?.variantId || inventoryData.variant?.id) {
        const variantId = inventoryData.variantId || inventoryData.variant?.variantId || inventoryData.variant?.id;
        await loadOtherColors(variantId, inventoryData.colorId || inventoryData.color?.colorId || inventoryData.color?.id);
      }
    } catch (err) {
      console.error("Lỗi khi load chi tiết xe:", err);
      setError("Không thể tải thông tin xe. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadOtherColors = async (variantId, currentColorId) => {
    try {
      // Load all inventory of the same variant
      const allInventoryRes = await publicVehicleAPI.getInventory();
      const allInventory = allInventoryRes.data || [];
      
      // Filter same variant, different colors, available status
      const sameVariantInventory = allInventory.filter(inv => {
        const invVariantId = inv.variantId || inv.variant?.variantId || inv.variant?.id;
        const invColorId = inv.colorId || inv.color?.colorId || inv.color?.id;
        return invVariantId === variantId && 
               invColorId !== currentColorId && 
               inv.status === "available";
      });
      
      setOtherColors(sameVariantInventory);
    } catch (err) {
      console.error("Lỗi khi load các màu khác:", err);
    }
  };

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleImageClick = () => {
    handleBuyCar();
  };
  
  const handleBuyCar = () => {
    if (isDealerStaff) {
      // Dealer staff: mở form đặt hàng trực tiếp
      setShowOrderModal(true);
    } else if (isLoggedIn) {
      // Đã đăng nhập nhưng không phải dealer staff: vẫn cho mua
      setShowOrderModal(true);
    } else {
      // Chưa đăng nhập: mở form đặt hàng (sẽ tạo customer mới)
      setShowOrderModal(true);
    }
  };

  // Helper functions
  // Ưu tiên: vehicleImages (ảnh thực tế) > variantImageUrl (ảnh mặc định variant)
  const getCarImage = (inv) => {
    // Ưu tiên 1: vehicleImages (ảnh thực tế của xe từ API public)
    if (inv.vehicleImages) {
      try {
        // Parse JSON string
        const imagesData = typeof inv.vehicleImages === 'string' 
          ? JSON.parse(inv.vehicleImages) 
          : inv.vehicleImages;
        
        // Lấy URL đầu tiên từ array
        let imageUrl = null;
        if (imagesData.urls && Array.isArray(imagesData.urls) && imagesData.urls.length > 0) {
          imageUrl = imagesData.urls[0];
        } else if (Array.isArray(imagesData) && imagesData.length > 0) {
          imageUrl = typeof imagesData[0] === 'string' ? imagesData[0] : imagesData[0].url;
        } else if (typeof imagesData === 'string') {
          imageUrl = imagesData;
        }
        
        if (imageUrl) {
          // Xử lý URL
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            console.log("✅ Using vehicleImages (full URL):", imageUrl);
            return imageUrl;
          }
          // Relative path
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
          const fullUrl = `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
          console.log("✅ Using vehicleImages (relative):", fullUrl);
          return fullUrl;
        }
      } catch (err) {
        console.warn("⚠️ Error parsing vehicleImages:", err);
      }
    }
    
    // Ưu tiên 2: variantImageUrl (ảnh mặc định từ variant - từ API public)
    if (inv.variantImageUrl) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
      const imageUrl = inv.variantImageUrl.startsWith('http://') || inv.variantImageUrl.startsWith('https://')
        ? inv.variantImageUrl
        : `${baseUrl}${inv.variantImageUrl.startsWith('/') ? inv.variantImageUrl : '/' + inv.variantImageUrl}`;
      console.log("✅ Using variantImageUrl from inventory:", imageUrl);
      return imageUrl;
    }
    
    // Ưu tiên 3: Lấy từ variant object (nested)
    if (inv.variant) {
      const variantImage = getVariantImageUrl(inv.variant);
      if (variantImage) {
        console.log("✅ Using variant image from object:", {
          inventoryId: inv.inventoryId || inv.id,
          variantName: inv.variant.variantName || inv.variant.name,
          imageUrl: variantImage
        });
        return variantImage;
      }
    }
    
    // Ưu tiên 4: Ảnh từ inventory (mainImages từ endpoint mới)
    if (inv.mainImages && Array.isArray(inv.mainImages) && inv.mainImages.length > 0) {
      const firstImage = inv.mainImages[0];
      if (typeof firstImage === 'string') {
        // Nếu là URL string
        if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
          return firstImage;
        }
        // Nếu là relative path
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
        return `${baseUrl}${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`;
      }
      // Nếu là object có url field
      if (firstImage.url) {
        if (firstImage.url.startsWith('http://') || firstImage.url.startsWith('https://')) {
          return firstImage.url;
        }
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
        return `${baseUrl}${firstImage.url.startsWith('/') ? firstImage.url : '/' + firstImage.url}`;
      }
    }
    
    // Ưu tiên 5: color swatch
    if (inv.color) {
      const colorImage = getColorSwatchUrl(inv.color);
      if (colorImage) {
        console.log("✅ Using color image:", colorImage);
        return colorImage;
      }
    }
    
    // Ưu tiên 6: model image
    if (inv.variant?.model) {
      const modelImage = getModelImageUrl(inv.variant.model);
      if (modelImage) {
        console.log("✅ Using model image:", modelImage);
        return modelImage;
      }
    }
    
    console.warn("⚠️ No image found for inventory:", {
      inventoryId: inv.inventoryId || inv.id,
      variant: inv.variant,
      variantId: inv.variantId,
      vehicleImages: inv.vehicleImages,
      variantImageUrl: inv.variantImageUrl,
      color: inv.color,
      mainImages: inv.mainImages
    });
    return null;
  };

  const getCarName = (inv) => {
    // Ưu tiên: variantName từ inventory (từ API public)
    if (inv.variantName) {
      return inv.variantName;
    }
    
    const brand = inv.variant?.model?.brand?.brandName || "";
    const model = inv.variant?.model?.modelName || "";
    const variant = inv.variant?.variantName || "";
    const parts = [brand, model, variant].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Xe";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <>
        <Nvabar />
        <div className="car-page">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Đang tải thông tin xe...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !inventory) {
    return (
      <>
        <Nvabar />
        <div className="car-page">
          <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
            <p>{error || "Không tìm thấy xe"}</p>
            <button 
              onClick={() => navigate(-1)} 
              style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}
            >
              Quay lại
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const mainImage = getCarImage(inventory);
  const carName = getCarName(inventory);
  const colorName = inventory.color?.colorName || inventory.colorName || "";
  const price = inventory.sellingPrice || inventory.price || inventory.priceBase || 0;
  
  // Lấy danh sách ảnh để hiển thị carousel
  const getAllImages = () => {
    const images = [];
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
    
    // Thêm vehicleImages (ảnh thực tế)
    if (inventory.vehicleImages) {
      try {
        const imagesData = typeof inventory.vehicleImages === 'string' 
          ? JSON.parse(inventory.vehicleImages) 
          : inventory.vehicleImages;
        
        if (imagesData.urls && Array.isArray(imagesData.urls)) {
          imagesData.urls.forEach(url => {
            if (url) {
              const fullUrl = url.startsWith('http://') || url.startsWith('https://')
                ? url
                : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
              images.push(fullUrl);
            }
          });
        } else if (Array.isArray(imagesData)) {
          imagesData.forEach(img => {
            const url = typeof img === 'string' ? img : img.url;
            if (url) {
              const fullUrl = url.startsWith('http://') || url.startsWith('https://')
                ? url
                : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
              images.push(fullUrl);
            }
          });
        }
      } catch (err) {
        console.warn("⚠️ Error parsing vehicleImages:", err);
      }
    }
    
    // Thêm interiorImages nếu có
    if (inventory.interiorImages) {
      try {
        const imagesData = typeof inventory.interiorImages === 'string' 
          ? JSON.parse(inventory.interiorImages) 
          : inventory.interiorImages;
        
        if (imagesData.urls && Array.isArray(imagesData.urls)) {
          imagesData.urls.forEach(url => {
            if (url) {
              const fullUrl = url.startsWith('http://') || url.startsWith('https://')
                ? url
                : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
              images.push(fullUrl);
            }
          });
        } else if (Array.isArray(imagesData)) {
          imagesData.forEach(img => {
            const url = typeof img === 'string' ? img : img.url;
            if (url) {
              const fullUrl = url.startsWith('http://') || url.startsWith('https://')
                ? url
                : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
              images.push(fullUrl);
            }
          });
        }
      } catch (err) {
        console.warn("⚠️ Error parsing interiorImages:", err);
      }
    }
    
    // Thêm exteriorImages nếu có
    if (inventory.exteriorImages) {
      try {
        const imagesData = typeof inventory.exteriorImages === 'string' 
          ? JSON.parse(inventory.exteriorImages) 
          : inventory.exteriorImages;
        
        if (imagesData.urls && Array.isArray(imagesData.urls)) {
          imagesData.urls.forEach(url => {
            if (url) {
              const fullUrl = url.startsWith('http://') || url.startsWith('https://')
                ? url
                : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
              images.push(fullUrl);
            }
          });
        } else if (Array.isArray(imagesData)) {
          imagesData.forEach(img => {
            const url = typeof img === 'string' ? img : img.url;
            if (url) {
              const fullUrl = url.startsWith('http://') || url.startsWith('https://')
                ? url
                : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
              images.push(fullUrl);
            }
          });
        }
      } catch (err) {
        console.warn("⚠️ Error parsing exteriorImages:", err);
      }
    }
    
    // Thêm variantImageUrl nếu chưa có ảnh
    if (images.length === 0 && inventory.variantImageUrl) {
      const imageUrl = inventory.variantImageUrl.startsWith('http://') || inventory.variantImageUrl.startsWith('https://')
        ? inventory.variantImageUrl
        : `${baseUrl}${inventory.variantImageUrl.startsWith('/') ? inventory.variantImageUrl : '/' + inventory.variantImageUrl}`;
      images.push(imageUrl);
    }
    
    console.log("📸 All images for carousel:", images);
    return images;
  };
  
  const allImages = getAllImages();
  const vin = inventory.vin || inventory.vinNumber || "—";
  const chassisNumber = inventory.chassisNumber || "—";
  const licensePlate = inventory.licensePlate || inventory.plateNumber || "—";
  const warehouseName = inventory.warehouse?.warehouseName || inventory.warehouseName || "—";
  const manufacturingDate = formatDate(inventory.manufacturingDate);
  const arrivalDate = formatDate(inventory.arrivalDate);
  const status = inventory.status || "—";

  // Prepare carousel images
  // Ưu tiên: allImages từ vehicleImages > otherColors > variantImageUrl
  const carouselItems = [];
  
  // Nếu có allImages (từ vehicleImages), dùng chúng
  if (allImages.length > 0) {
    carouselItems.push(...allImages.map((imgUrl, idx) => ({
      imageUrl: imgUrl,
      isCurrent: idx === 0,
      type: 'vehicle'
    })));
  } else if (otherColors.length > 0) {
    // Nếu không có allImages, dùng otherColors
    carouselItems.push(
      { inventory, isCurrent: true, type: 'inventory' },
      ...otherColors.map(inv => ({ inventory: inv, isCurrent: false, type: 'inventory' }))
    );
  } else if (mainImage) {
    // Fallback: dùng mainImage
    carouselItems.push({ imageUrl: mainImage, isCurrent: true, type: 'variant' });
  }

  return (
    <>
      <Nvabar />

      <div className="car-page">
        {/* Ảnh chính */}
        <div className="car-top">
          {mainImage ? (
            <img 
              src={mainImage} 
              alt={carName} 
              className="main-car-image" 
              onClick={handleImageClick}
              style={{ cursor: 'pointer' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/850x500?text=No+Image';
              }}
            />
          ) : (
            <img 
              src="https://via.placeholder.com/850x500?text=No+Image" 
              alt={carName}
              className="main-car-image"
              onClick={handleImageClick}
              style={{ cursor: 'pointer' }}
            />
          )}
          <h2>{carName}</h2>
          {colorName && <p style={{ fontSize: '1.2rem', color: '#7f8c8d', margin: '10px 0' }}>Màu: {colorName}</p>}
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
            {price > 0 ? `${price.toLocaleString('vi-VN')} ₫` : 'Liên hệ để biết giá'}
          </p>
        </div>

        {/* Thông tin chi tiết */}
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <strong>VIN:</strong> {vin}
            </div>
            <div>
              <strong>Số khung:</strong> {chassisNumber}
            </div>
            <div>
              <strong>Biển số:</strong> {licensePlate}
            </div>
            <div>
              <strong>Kho:</strong> {warehouseName}
            </div>
            <div>
              <strong>Ngày sản xuất:</strong> {manufacturingDate}
            </div>
            <div>
              <strong>Ngày nhập kho:</strong> {arrivalDate}
            </div>
            <div>
              <strong>Trạng thái:</strong> {status}
            </div>
          </div>
        </div>

        {/* Ưu đãi */}
        <div className="promo">
          <ul>
            <li>Miễn 100% lệ phí trước bạ</li>
            <li>Miễn phí sạc pin đến 30/06/2027</li>
          </ul>
        </div>

        {/* Carousel hiển thị ảnh */}
        {carouselItems.length > 1 && (
          <div className="car-carousel-container">
            <Carousel
              activeIndex={index}
              onSelect={handleSelect}
              interval={null}
              indicators={true}
              className="car-carousel"
            >
              {carouselItems.map((item, i) => {
                // Nếu là imageUrl trực tiếp (từ vehicleImages)
                if (item.imageUrl) {
                  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
                  const fullUrl = item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://')
                    ? item.imageUrl
                    : `${baseUrl}${item.imageUrl.startsWith('/') ? item.imageUrl : '/' + item.imageUrl}`;
                  
                  return (
                    <Carousel.Item key={i}>
                      <img
                        className="d-block w-100 car-carousel-image"
                        src={fullUrl}
                        alt={carName}
                        onClick={handleImageClick}
                        style={{ cursor: 'pointer' }}
                        onError={(e) => {
                          console.error("❌ Carousel image load error:", fullUrl);
                          e.target.src = 'https://via.placeholder.com/850x500?text=No+Image';
                        }}
                        onLoad={() => {
                          console.log("✅ Carousel image loaded:", fullUrl);
                        }}
                      />
                    </Carousel.Item>
                  );
                }
                
                // Nếu là inventory object (từ otherColors)
                if (item.inventory) {
                  const itemImage = getCarImage(item.inventory);
                  const itemColorName = item.inventory.color?.colorName || item.inventory.colorName || "";
                  return (
                    <Carousel.Item key={i}>
                      <img
                        className="d-block w-100 car-carousel-image"
                        src={itemImage || 'https://via.placeholder.com/850x500?text=No+Image'}
                        alt={`${carName} - ${itemColorName}`}
                        onClick={handleImageClick}
                        style={{ cursor: 'pointer' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/850x500?text=No+Image';
                        }}
                      />
                      {itemColorName && (
                        <div style={{ textAlign: 'center', marginTop: '10px', color: '#7f8c8d' }}>
                          Màu: {itemColorName}
                        </div>
                      )}
                    </Carousel.Item>
                  );
                }
                
                return null;
              })}
            </Carousel>
          </div>
        )}

        {/* Nút Mua xe */}
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <button
            onClick={handleBuyCar}
            style={{
              padding: '15px 40px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            Mua xe
          </button>
        </div>

        {showModal && (
          <ContactModal isOpen={showModal} onClose={() => setShowModal(false)} />
        )}
        
        {showOrderModal && (
          <CreateOrderFromCar
            show={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            preselectedInventoryId={inventoryId}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

