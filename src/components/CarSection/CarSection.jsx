import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { publicVehicleAPI, inventoryAPI } from "../../services/API.js";
import { getVariantImageUrl, getColorSwatchUrl, getModelImageUrl } from "../../utils/imageUtils.js";
import './CarSection.css';

export default function CarSection() {
  const [inventoryList, setInventoryList] = useState([]);
  const [variantsMap, setVariantsMap] = useState(new Map()); // Cache variants để map với variantId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // Load cả inventory và variants
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load variants trước để có cache
      const variantsRes = await publicVehicleAPI.getVariants();
      const allVariants = variantsRes.data || [];
      const variantsMapTemp = new Map();
      allVariants.forEach(v => {
        const variantId = v.variantId || v.id;
        if (variantId) {
          variantsMapTemp.set(variantId, v);
        }
      });
      setVariantsMap(variantsMapTemp);
      console.log("📦 Loaded variants cache:", variantsMapTemp.size, "variants");
      
      // Sau đó load inventory
      await loadInventory(variantsMapTemp);
    } catch (err) {
      console.error("❌ Lỗi khi load data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async (variantsCache) => {
    try {
      let allInventory = [];
      
      // Thử endpoint chính trước
      try {
        console.log("📡 Trying publicVehicleAPI.getInventory()...");
        const res = await publicVehicleAPI.getInventory();
        allInventory = res.data || [];
        console.log("✅ Got inventory from publicVehicleAPI:", allInventory.length, "items");
      } catch (err) {
        console.warn("⚠️ publicVehicleAPI.getInventory() failed:", err.response?.status, err.response?.data);
        
        // Fallback: thử inventoryAPI.getAvailableInventory() (endpoint có auth)
        try {
          console.log("📡 Trying inventoryAPI.getAvailableInventory() as fallback...");
          const res = await inventoryAPI.getAvailableInventory();
          allInventory = res.data || [];
          console.log("✅ Got inventory from inventoryAPI.getAvailableInventory():", allInventory.length, "items");
        } catch (err2) {
          console.error("❌ Both endpoints failed:", err2.response?.status, err2.response?.data);
          throw err; // Throw original error
        }
      }
      
      // Chỉ lấy các xe có status = "available"
      let availableInventory = allInventory.filter(
        (inv) => inv.status === "available" || inv.status === "AVAILABLE"
      );
      
      // Enrich inventory với variant data nếu chỉ có variantId
      availableInventory = availableInventory.map(inv => {
        // Nếu không có nested variant nhưng có variantId, lấy từ cache
        if (!inv.variant && inv.variantId && variantsCache) {
          const variant = variantsCache.get(inv.variantId);
          if (variant) {
            inv.variant = variant;
            console.log(`✅ Enriched inventory ${inv.inventoryId || inv.id} with variant ${inv.variantId}`);
          }
        }
        return inv;
      });
      
      // Debug: Log để kiểm tra dữ liệu
      if (availableInventory.length > 0) {
        const sample = availableInventory[0];
        console.log("📋 Sample inventory data:", sample);
        console.log("🖼️ Inventory image check:", {
          variant: sample.variant,
          variantId: sample.variantId || sample.variant?.variantId || sample.variant?.id,
          variantImageUrl: sample.variant?.variantImageUrl,
          variantImagePath: sample.variant?.variantImagePath,
          vehicleImages: sample.vehicleImages,
          variantImageUrl_fromInventory: sample.variantImageUrl,
          color: sample.color,
          mainImages: sample.mainImages,
          computedImage: getCarImage(sample, variantsCache)
        });
        // Log chi tiết variant nếu có
        if (sample.variant) {
          console.log("🔍 Variant details:", {
            variantId: sample.variant.variantId || sample.variant.id,
            variantName: sample.variant.variantName || sample.variant.name,
            variantImageUrl: sample.variant.variantImageUrl,
            variantImagePath: sample.variant.variantImagePath,
            fullVariant: sample.variant
          });
        }
        
        // Log tất cả variants có ảnh
        console.log("📦 Variants with images:", Array.from(variantsCache.entries())
          .filter(([id, v]) => v.variantImageUrl || v.variantImagePath)
          .map(([id, v]) => ({
            variantId: id,
            variantName: v.variantName || v.name,
            variantImageUrl: v.variantImageUrl,
            variantImagePath: v.variantImagePath
          }))
        );
        
        // Log variants không có ảnh
        const variantsWithoutImages = Array.from(variantsCache.entries())
          .filter(([id, v]) => !v.variantImageUrl && !v.variantImagePath);
        if (variantsWithoutImages.length > 0) {
          console.warn("⚠️ Variants without images:", variantsWithoutImages.map(([id, v]) => ({
            variantId: id,
            variantName: v.variantName || v.name
          })));
        }
      }
      
      setInventoryList(availableInventory);
    } catch (err) {
      console.error("❌ Lỗi khi load vehicle inventory:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
      setInventoryList([]); // Set empty array để hiển thị message "không có xe"
    }
  };

  // Helper function để lấy hình ảnh xe
  // Ưu tiên: vehicleImages (ảnh thực tế) > variantImageUrl (ảnh mặc định variant)
  const getCarImage = (inventory, variantsCache = null) => {
    // Ưu tiên 1: vehicleImages (ảnh thực tế của xe từ API public)
    if (inventory.vehicleImages) {
      try {
        // Parse JSON string
        const imagesData = typeof inventory.vehicleImages === 'string' 
          ? JSON.parse(inventory.vehicleImages) 
          : inventory.vehicleImages;
        
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
    if (inventory.variantImageUrl) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
      const imageUrl = inventory.variantImageUrl.startsWith('http://') || inventory.variantImageUrl.startsWith('https://')
        ? inventory.variantImageUrl
        : `${baseUrl}${inventory.variantImageUrl.startsWith('/') ? inventory.variantImageUrl : '/' + inventory.variantImageUrl}`;
      console.log("✅ Using variantImageUrl from inventory:", imageUrl);
      return imageUrl;
    }
    
    // Ưu tiên 3: Lấy từ variant object (nested hoặc từ cache)
    let variant = inventory.variant;
    
    // Nếu không có variant nhưng có variantId, thử lấy từ cache
    if (!variant && inventory.variantId) {
      if (variantsCache) {
        variant = variantsCache.get(inventory.variantId);
      } else if (variantsMap.size > 0) {
        variant = variantsMap.get(inventory.variantId);
      }
      
      if (variant) {
        console.log(`✅ Found variant from cache for variantId ${inventory.variantId}`);
      }
    }
    
    if (variant) {
      const variantImage = getVariantImageUrl(variant);
      if (variantImage) {
        console.log("✅ Using variant image from object:", {
          inventoryId: inventory.inventoryId || inventory.id,
          variantName: variant.variantName || variant.name,
          variantId: variant.variantId || variant.id,
          imageUrl: variantImage
        });
        return variantImage;
      }
    }
    
    // Ưu tiên 4: Ảnh từ inventory (mainImages từ endpoint mới)
    if (inventory.mainImages && Array.isArray(inventory.mainImages) && inventory.mainImages.length > 0) {
      const firstImage = inventory.mainImages[0];
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
    
    // Ưu tiên 3: color swatch
    if (inventory.color) {
      const colorImage = getColorSwatchUrl(inventory.color);
      if (colorImage) {
        console.log("✅ Using color image:", colorImage);
        return colorImage;
      }
    }
    
    // Ưu tiên 4: model image
    if (inventory.variant?.model) {
      const modelImage = getModelImageUrl(inventory.variant.model);
      if (modelImage) {
        console.log("✅ Using model image:", modelImage);
        return modelImage;
      }
    }
    
    // Fallback: placeholder image
    console.warn("⚠️ No image found for inventory:", {
      inventoryId: inventory.inventoryId || inventory.id,
      variant: inventory.variant,
      variantId: inventory.variantId,
      color: inventory.color,
      mainImages: inventory.mainImages
    });
    return null;
  };

  // Helper function để lấy tên xe
  const getCarName = (inventory) => {
    // Ưu tiên: variantName từ inventory (từ API public)
    if (inventory.variantName) {
      return inventory.variantName;
    }
    
    // Lấy variant từ inventory hoặc cache
    let variant = inventory.variant;
    if (!variant && inventory.variantId && variantsMap.size > 0) {
      variant = variantsMap.get(inventory.variantId);
    }
    
    const brand = variant?.model?.brand?.brandName || "";
    const model = variant?.model?.modelName || "";
    const variantName = variant?.variantName || variant?.name || "";
    
    const parts = [brand, model, variantName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Xe";
  };

  // Helper function để lấy giá
  const getPrice = (inventory) => {
    // Ưu tiên: sellingPrice > price > priceBase (từ API public)
    return inventory.sellingPrice || inventory.price || inventory.priceBase || 0;
  };

  // Helper function để lấy inventoryId
  const getInventoryId = (inventory) => {
    return inventory.inventoryId || inventory.id;
  };

  if (loading) {
    return (
      <div className="body">
        <div className='te'>
          <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="body">
        <div className='te'>
          <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
          <p>{error}</p>
          <button onClick={loadData} style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer' }}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (inventoryList.length === 0) {
    return (
      <div className="body">
        <div className='te'>
          <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Hiện tại không có xe nào có sẵn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="body">
      <div className='te'>
        <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
      </div>
      
      <div className='car-body'>
        {inventoryList.map((inventory) => {
          const inventoryId = getInventoryId(inventory);
          const carImage = getCarImage(inventory, variantsMap);
          const carName = getCarName(inventory);
          const colorName = inventory.color?.colorName || inventory.colorName || "";
          const price = getPrice(inventory);
          
          return (
            <div key={inventoryId} className="car-card">
              <Link to={`/car/${inventoryId}`}>
                {carImage ? (
                  <img 
                    src={carImage} 
                    alt={carName}
                    onError={(e) => {
                      console.error(`❌ Image load error for ${carName}:`, carImage);
                      e.target.src = 'https://via.placeholder.com/400x280?text=No+Image';
                    }}
                    onLoad={() => {
                      console.log(`✅ Image loaded for ${carName}:`, carImage);
                    }}
                  />
                ) : (
                  <img 
                    src="https://via.placeholder.com/400x280?text=No+Image" 
                    alt={carName}
                  />
                )}
              </Link>
              <p className='name-car'>{carName}</p>
              {colorName && <p className='color-car'>{colorName}</p>}
              <p className='price-car'>
                {price > 0 ? `GIÁ TỪ ${price.toLocaleString('vi-VN')} ₫` : 'Liên hệ để biết giá'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
