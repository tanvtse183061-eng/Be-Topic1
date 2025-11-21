import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { publicVehicleAPI } from '../../services/API.js';
import { getVariantImageUrl, getColorSwatchUrl, getModelImageUrl } from '../../utils/imageUtils.js';
import './CarSection.css';

export default function CarSection() {
    const [vehicles, setVehicles] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch variants và inventory cùng lúc
            const [inventoryRes, variantsRes] = await Promise.all([
                publicVehicleAPI.getInventory(),
                publicVehicleAPI.getVariants()
            ]);
            
            // Extract data với nhiều cách
            const extractArray = (data) => {
                if (Array.isArray(data)) return data;
                if (Array.isArray(data?.data)) return data.data;
                if (Array.isArray(data?.content)) return data.content;
                if (data && typeof data === 'object') {
                    const possibleArrays = Object.values(data).filter(Array.isArray);
                    if (possibleArrays.length > 0) return possibleArrays[0];
                }
                return [];
            };
            
            // Extract data - giống admin: res.data || []
            const inventoryList = extractArray(inventoryRes.data || inventoryRes);
            const variantsList = extractArray(variantsRes.data || variantsRes);
            
            console.log("📦 Inventory list:", inventoryList.length);
            console.log("📦 Variants list:", variantsList.length);
            if (inventoryList.length > 0) {
                console.log("📦 Sample inventory:", inventoryList[0]);
                console.log("📦 Inventory variantImageUrl:", inventoryList[0].variantImageUrl);
            }
            if (variantsList.length > 0) {
                console.log("📦 Sample variant:", variantsList[0]);
                console.log("📦 Variant variantImageUrl:", variantsList[0].variantImageUrl);
                console.log("📦 Variant variantImagePath:", variantsList[0].variantImagePath);
            }
            
            setVariants(variantsList);
            
            // Filter chỉ lấy xe có status "available"
            let availableVehicles = inventoryList.filter(vehicle => {
                const status = vehicle.status?.toLowerCase();
                return status === 'available' || status === 'AVAILABLE';
            });
            
            console.log("📦 Available vehicles:", availableVehicles.length);
            
            // Map variant vào từng vehicle nếu có variantId (giống admin)
            availableVehicles = availableVehicles.map(vehicle => {
                const variantId = vehicle.variantId || vehicle.variant?.variantId || vehicle.variant?.id;
                if (variantId) {
                    // Nếu đã có variant object đầy đủ với variantImageUrl, giữ nguyên
                    if (vehicle.variant && vehicle.variant.variantName && (vehicle.variant.variantImageUrl || vehicle.variant.variantImagePath)) {
                        console.log(`✅ Vehicle ${vehicle.inventoryId || vehicle.id} already has complete variant`);
                        return vehicle;
                    }
                    
                    // Tìm variant trong list (giống admin: tìm theo variantId)
                    const variant = variantsList.find(v => 
                        (v.variantId || v.id) == variantId ||
                        String(v.variantId || v.id) === String(variantId)
                    );
                    if (variant) {
                        console.log(`✅ Mapped variant ${variantId} to vehicle ${vehicle.inventoryId || vehicle.id}`, {
                            variantName: variant.variantName,
                            variantImageUrl: variant.variantImageUrl,
                            variantImagePath: variant.variantImagePath,
                            hasVariantImage: !!(variant.variantImageUrl || variant.variantImagePath)
                        });
                        // Đảm bảo variant được map vào vehicle
                        return { ...vehicle, variant };
                    } else {
                        console.warn(`⚠️ Variant ${variantId} not found in variants list for vehicle ${vehicle.inventoryId || vehicle.id}`);
                    }
                } else {
                    console.warn(`⚠️ Vehicle ${vehicle.inventoryId || vehicle.id} has no variantId`);
                }
                return vehicle;
            });
            
            setVehicles(availableVehicles);
            console.log("✅ Final vehicles with variants:", availableVehicles.length);
            if (availableVehicles.length > 0) {
                const sample = availableVehicles[0];
                console.log("✅ Sample vehicle with variant:", {
                    inventoryId: sample.inventoryId || sample.id,
                    variantId: sample.variantId,
                    hasVariant: !!sample.variant,
                    variantName: sample.variant?.variantName,
                    variantImageUrl: sample.variant?.variantImageUrl,
                    variantImagePath: sample.variant?.variantImagePath,
                    vehicleVariantImageUrl: sample.variantImageUrl,
                    vehicleImages: sample.vehicleImages,
                    fullVariant: sample.variant
                });
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách xe:", err);
            setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function để lấy hình ảnh xe (giống hệt CarDetail - có logging)
    const getCarImage = (inv, variantsList = []) => {
        const inventoryId = inv.inventoryId || inv.id;
        
        // Ưu tiên 1: vehicleImages (ảnh thực tế của xe từ API public)
        if (inv.vehicleImages) {
            try {
                const imagesData = typeof inv.vehicleImages === 'string' 
                    ? JSON.parse(inv.vehicleImages) 
                    : inv.vehicleImages;
                
                let imageUrl = null;
                if (imagesData.urls && Array.isArray(imagesData.urls) && imagesData.urls.length > 0) {
                    imageUrl = imagesData.urls[0];
                } else if (Array.isArray(imagesData) && imagesData.length > 0) {
                    imageUrl = typeof imagesData[0] === 'string' ? imagesData[0] : imagesData[0].url;
                } else if (typeof imagesData === 'string') {
                    imageUrl = imagesData;
                }
                
                if (imageUrl) {
                    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                        console.log(`✅ [${inventoryId}] Using vehicleImages (full URL):`, imageUrl);
                        return imageUrl;
                    }
                    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
                    const fullUrl = `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
                    console.log(`✅ [${inventoryId}] Using vehicleImages (relative):`, fullUrl);
                    return fullUrl;
                }
            } catch (err) {
                console.warn(`⚠️ [${inventoryId}] Error parsing vehicleImages:`, err);
            }
        }
        
        // Ưu tiên 2: variantImageUrl (ảnh mặc định từ variant - từ API public)
        if (inv.variantImageUrl) {
            const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
            const imageUrl = inv.variantImageUrl.startsWith('http://') || inv.variantImageUrl.startsWith('https://')
                ? inv.variantImageUrl
                : `${baseUrl}${inv.variantImageUrl.startsWith('/') ? inv.variantImageUrl : '/' + inv.variantImageUrl}`;
            console.log(`✅ [${inventoryId}] Using variantImageUrl from inventory:`, imageUrl);
            return imageUrl;
        }
        
        // Ưu tiên 3: Lấy từ variant object (nested)
        if (inv.variant) {
            const variantImage = getVariantImageUrl(inv.variant);
            if (variantImage) {
                console.log(`✅ [${inventoryId}] Using variant image from object:`, {
                    variantName: inv.variant.variantName || inv.variant.name,
                    imageUrl: variantImage
                });
                return variantImage;
            } else {
                console.warn(`⚠️ [${inventoryId}] variant object exists but getVariantImageUrl returned null:`, {
                    variantImageUrl: inv.variant.variantImageUrl,
                    variantImagePath: inv.variant.variantImagePath,
                    variant: inv.variant
                });
            }
        }
        
        // Ưu tiên 3b: Nếu không có variant object nhưng có variantId, tìm trong variants list
        if (!inv.variant && inv.variantId && variantsList.length > 0) {
            const variantId = inv.variantId;
            const variant = variantsList.find(v => 
                (v.variantId || v.id) == variantId ||
                String(v.variantId || v.id) === String(variantId)
            );
            if (variant) {
                const variantImage = getVariantImageUrl(variant);
                if (variantImage) {
                    console.log(`✅ [${inventoryId}] Using variant image from variants list (fallback):`, variantImage);
                    return variantImage;
                }
            }
        }
        
        // Ưu tiên 4: Ảnh từ inventory (mainImages từ endpoint mới)
        if (inv.mainImages && Array.isArray(inv.mainImages) && inv.mainImages.length > 0) {
            const firstImage = inv.mainImages[0];
            if (typeof firstImage === 'string') {
                if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
                    console.log(`✅ [${inventoryId}] Using mainImages (full URL):`, firstImage);
                    return firstImage;
                }
                const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
                const fullUrl = `${baseUrl}${firstImage.startsWith('/') ? firstImage : '/' + firstImage}`;
                console.log(`✅ [${inventoryId}] Using mainImages (relative):`, fullUrl);
                return fullUrl;
            }
            if (firstImage.url) {
                if (firstImage.url.startsWith('http://') || firstImage.url.startsWith('https://')) {
                    console.log(`✅ [${inventoryId}] Using mainImages.url (full URL):`, firstImage.url);
                    return firstImage.url;
                }
                const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
                const fullUrl = `${baseUrl}${firstImage.url.startsWith('/') ? firstImage.url : '/' + firstImage.url}`;
                console.log(`✅ [${inventoryId}] Using mainImages.url (relative):`, fullUrl);
                return fullUrl;
            }
        }
        
        // Ưu tiên 5: color swatch
        if (inv.color) {
            const colorImage = getColorSwatchUrl(inv.color);
            if (colorImage) {
                console.log(`✅ [${inventoryId}] Using color image:`, colorImage);
                return colorImage;
            }
        }
        
        // Ưu tiên 6: model image
        if (inv.variant?.model) {
            const modelImage = getModelImageUrl(inv.variant.model);
            if (modelImage) {
                console.log(`✅ [${inventoryId}] Using model image:`, modelImage);
                return modelImage;
            }
        }
        
        console.warn(`⚠️ [${inventoryId}] No image found for inventory:`, {
            variant: inv.variant,
            variantId: inv.variantId,
            vehicleImages: inv.vehicleImages,
            variantImageUrl: inv.variantImageUrl,
            color: inv.color,
            mainImages: inv.mainImages
        });
        return null;
    };

    // Helper function để lấy tên xe
    const getCarName = (inv) => {
        if (inv.variantName) {
            return inv.variantName;
        }
        
        const brand = inv.variant?.model?.brand?.brandName || "";
        const model = inv.variant?.model?.modelName || "";
        const variant = inv.variant?.variantName || "";
        const parts = [brand, model, variant].filter(Boolean);
        return parts.length > 0 ? parts.join(" ") : "Xe";
    };

    // Helper function để lấy giá
    const getCarPrice = (inv) => {
        const price = inv.sellingPrice || inv.price || inv.priceBase || 0;
        if (price > 0) {
            return price.toLocaleString('vi-VN') + ' ₫';
        }
        return 'Liên hệ để biết giá';
    };

    // Helper function để lấy inventoryId
    const getInventoryId = (inv) => {
        return inv.inventoryId || inv.id || inv.vehicleId;
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
                    <button 
                        onClick={fetchVehicles}
                        style={{ 
                            marginTop: '10px', 
                            padding: '10px 20px', 
                            cursor: 'pointer',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (vehicles.length === 0) {
        return (
            <div className="body">
                <div className='te'>
                    <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
                </div>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Hiện tại chưa có xe nào có sẵn.</p>
                </div>     
            </div>
        );
    }

    // Chia vehicles thành các nhóm để hiển thị (giữ layout tương tự như cũ)
    const chunkSize = 3;
    const vehicleChunks = [];
    for (let i = 0; i < vehicles.length; i += chunkSize) {
        vehicleChunks.push(vehicles.slice(i, i + chunkSize));
    }

    return (
        <div className="body">
            <div className='te'>
                <a>CÁC DÒNG XE HOT TẠI EVM CAR</a>
            </div>
            
            {vehicleChunks.map((chunk, chunkIndex) => {
                const containerClass = chunkIndex === 0 ? 'car-body' : chunkIndex === 1 ? 'car-body2' : 'car-body3';
                return (
                    <div key={chunkIndex} className={containerClass}>
                        {chunk.map((vehicle, index) => {
                            const inventoryId = getInventoryId(vehicle);
                            const carName = getCarName(vehicle);
                            const carPrice = getCarPrice(vehicle);
                            
                            // ✅ Lấy hình ảnh từ VARIANT (giống Admin VehicleVariant: getVariantImageUrl(v))
                            // Hình ảnh nằm trong VehicleVariant, không phải Inventory!
                            let mainImage = null;
                            
                            // Cách 1: Lấy từ vehicle.variant (nếu đã được map trong fetchVehicles)
                            if (vehicle.variant) {
                                mainImage = getVariantImageUrl(vehicle.variant);
                                if (mainImage) {
                                    console.log(`✅ [${inventoryId}] Image from vehicle.variant:`, mainImage);
                                }
                            }
                            
                            // Cách 2: Tìm variant trong variants list và lấy hình (giống Admin)
                            if (!mainImage && vehicle.variantId && variants.length > 0) {
                                const variant = variants.find(v => 
                                    (v.variantId || v.id) == vehicle.variantId ||
                                    String(v.variantId || v.id) === String(vehicle.variantId)
                                );
                                if (variant) {
                                    mainImage = getVariantImageUrl(variant);
                                    if (mainImage) {
                                        console.log(`✅ [${inventoryId}] Image from variants list:`, mainImage);
                                    } else {
                                        console.warn(`⚠️ [${inventoryId}] Variant found but no image:`, {
                                            variantId: variant.variantId,
                                            variantImageUrl: variant.variantImageUrl,
                                            variantImagePath: variant.variantImagePath
                                        });
                                    }
                                } else {
                                    console.warn(`⚠️ [${inventoryId}] Variant ${vehicle.variantId} not found in variants list`);
                                }
                            }
                            
                            // Fallback: Dùng getCarImage nếu không tìm thấy variant image
                            if (!mainImage) {
                                mainImage = getCarImage(vehicle, variants);
                                if (mainImage) {
                                    console.log(`✅ [${inventoryId}] Image from getCarImage (fallback):`, mainImage);
                                }
                            }
                            
                            if (!mainImage) {
                                console.error(`❌ [${inventoryId}] KHÔNG TÌM THẤY HÌNH!`, {
                                    variantId: vehicle.variantId,
                                    hasVariant: !!vehicle.variant,
                                    variantImageUrl: vehicle.variant?.variantImageUrl,
                                    variantImagePath: vehicle.variant?.variantImagePath,
                                    variantsListLength: variants.length
                                });
                            }
                            
                            return (
                                <div key={inventoryId || index} className='herio' style={{ position: 'relative' }}>
                                    <Link to={`/car/${inventoryId}`} style={{ position: 'relative', display: 'block', width: '100%' }}>
                                        {mainImage ? (
                                            <img 
                                                src={mainImage} 
                                                alt={carName}
                                                style={{ 
                                                    width: '100%',
                                                    height: '280px',
                                                    objectFit: 'cover',
                                                    display: 'block',
                                                    backgroundColor: '#f0f0f0'
                                                }}
                                                onError={(e) => {
                                                    console.error(`❌ [${inventoryId}] Image failed to load:`, mainImage);
                                                    e.target.src = 'https://via.placeholder.com/400x280?text=No+Image';
                                                }}
                                                onLoad={() => {
                                                    console.log(`✅ [${inventoryId}] Image loaded successfully:`, mainImage);
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '280px',
                                                backgroundColor: '#f0f0f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#888',
                                                fontSize: '14px'
                                            }}>
                                                Không có hình ảnh
                </div>
                                        )}
                                    </Link>
                                    <p className='name-car'>{carName}</p>
                                    <p className='price-car'>{carPrice}</p>
                </div>
                            );
                        })}
            </div>
                );
            })}
        </div>
    );
}