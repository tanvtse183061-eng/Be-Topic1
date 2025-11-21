import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import anhnen from '../../assets/anhnen.png';
import { publicVehicleAPI } from '../../services/API.js';
import './Banner.css';

export default function Banner() {
    const navigate = useNavigate();
    const [firstInventoryId, setFirstInventoryId] = useState(null);

    useEffect(() => {
        // Lấy xe đầu tiên available để navigate
        const fetchFirstCar = async () => {
            try {
                const res = await publicVehicleAPI.getInventory();
                const inventoryList = res.data || res || [];
                
                // Extract array nếu cần
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
                
                const inventory = extractArray(inventoryList);
                
                // Tìm xe đầu tiên có status available
                const availableCar = inventory.find(vehicle => {
                    const status = vehicle.status?.toLowerCase();
                    return status === 'available' || status === 'AVAILABLE';
                });
                
                if (availableCar) {
                    const inventoryId = availableCar.inventoryId || availableCar.id || availableCar.vehicleId;
                    setFirstInventoryId(inventoryId);
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh sách xe:", err);
            }
        };
        
        fetchFirstCar();
    }, []);

    const handleClick = () => {
        if (firstInventoryId) {
            navigate(`/car/${firstInventoryId}`);
        }
    };

    return (
        <div className="anhnen" onClick={handleClick} style={{ cursor: firstInventoryId ? 'pointer' : 'default' }}>
            <img src={anhnen} alt="Background" />
            <div className="anhnen-content">
                <h1>LỰA CHỌN XE ĐIỆN THÔNG MINH</h1>
                <p>Tiết kiệm - Êm ái - Bảo vệ môi trường</p>
                <div className="learnMore">
                    <a href="#" onClick={(e) => {
                        e.preventDefault();
                        handleClick();
                    }}>Learn More</a>
                </div>
            </div>
        </div>
    );
}