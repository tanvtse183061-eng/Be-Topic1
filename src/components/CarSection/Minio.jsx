import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrderFromCar from "../CreateOrderFromCar/CreateOrderFromCar";

// Import ảnh xe Minio các màu
import anhGreen from "../../assets/cars/miniogreen-green.png"; // màu chính
import anhDen from "../../assets/cars/miniogreen-black.png";
import anhHong from "../../assets/cars/miniogreen-pink.png";
import anhDo from "../../assets/cars/miniogreen-red.png";
import anhTrang from "../../assets/cars/miniogreen-white.png";
import anhVang from "../../assets/cars/miniogreen-yellow.png";

import "./Car.css";

export default function Minio() {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  const carImages = [
    { src: anhDen, alt: "Minio Black", color: "Đen" },
    { src: anhHong, alt: "Minio Pink", color: "Hồng" },
    { src: anhDo, alt: "Minio Red", color: "Đỏ" },
    { src: anhTrang, alt: "Minio White", color: "Trắng" },
    { src: anhVang, alt: "Minio Yellow", color: "Vàng" },
  ];

  const colorNames = ["Xanh", "Đen", "Hồng", "Đỏ", "Trắng", "Vàng"];

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleImageClick = () => {
    if (isDealerStaff) {
      setShowOrderModal(true);
    } else {
      setShowModal(true);
    }
  };

  const getCurrentColor = () => {
    if (index === 0) return "Xanh";
    return carImages[index - 1]?.color || colorNames[index] || "";
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Nvabar />

      <div className="car-page">
        {/* Ảnh chính màu xanh */}
        <div className="car-top">
          <img 
            src={anhGreen} 
            alt="Minio Green" 
            className="main-car-image" 
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />
          <h2>Minio Green</h2>
          <p>Giá từ 269,000,000₫</p>
        </div>

        {/* Thanh menu */}
        <div className="car-menu"></div>

        {/* Ưu đãi */}
        <div className="promo">
          <ul>
            <li>Miễn 100% lệ phí trước bạ</li>
            <li>Miễn phí sạc pin đến 30/06/2027</li>
          </ul>
        </div>

        {/* Carousel hiển thị các màu xe khác */}
        <div className="car-carousel-container">
          <Carousel
            activeIndex={index}
            onSelect={handleSelect}
            interval={null}
            indicators={false}
            className="car-carousel"
          >
            {carImages.map((car, i) => (
              <Carousel.Item key={i}>
                <img
                  className="d-block w-100 car-carousel-image"
                  src={car.src}
                  alt={car.alt}
                  onClick={handleImageClick}
                  style={{ cursor: 'pointer' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        {/* Hàng thumbnail chọn màu */}
        <div className="thumbnail-row">
          {[anhGreen, anhDen, anhHong, anhDo, anhTrang, anhVang].map((car, i) => (
            <img
              key={i}
              src={car}
              alt="color option"
              onClick={() => setIndex(i - 1 >= 0 ? i - 1 : 0)}
              className={`thumbnail-img ${index === i - 1 ? "active" : ""}`}
            />
          ))}
        </div>

        {/* Modal liên hệ tư vấn */}
        {showModal && !isDealerStaff && (
          <div className="contact-modal-overlay" onClick={closeModal}>
            <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
              <div className="contact-modal-icon">🚗💨</div>
              <h2>Bạn quan tâm đến chiếc xe này?</h2>
              <p>Vui lòng liên hệ với nhân viên tư vấn của chúng tôi</p>
              <p>để được hỗ trợ tốt nhất!</p>
              <div className="contact-modal-phone">📞 Hotline: 1900-xxxx</div>
              <p style={{ fontSize: '16px', marginTop: '15px' }}>
                Hoặc đến showroom gần nhất để trải nghiệm xe
              </p>
              <button className="contact-modal-button" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        )}
        
        {showOrderModal && isDealerStaff && (
          <CreateOrderFromCar
            show={showOrderModal}
            onClose={() => setShowOrderModal(false)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
