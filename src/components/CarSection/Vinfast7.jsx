import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrderFromCar from "../CreateOrderFromCar/CreateOrderFromCar";

// Import ảnh xe VinFast VF7 các màu
import anhXam from "../../assets/cars/vinfastvf7-gray.png"; // màu chính
import anhDen from "../../assets/cars/vinfastvf7-black.png";
import anhXanhDuong from "../../assets/cars/vinfastvf7-blue.png";
import anhXanhLa from "../../assets/cars/vinfastvf7-green.png";
import anhDo from "../../assets/cars/vinfastvf7-red.png";
import anhTrang from "../../assets/cars/vinfastvf7-white.png";

import "./Car.css";

export default function Vinfast7() {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  const carImages = [
    { src: anhDen, alt: "VF7 Black", color: "Đen" },
    { src: anhXanhDuong, alt: "VF7 Blue", color: "Xanh dương" },
    { src: anhXanhLa, alt: "VF7 Green", color: "Xanh lá" },
    { src: anhDo, alt: "VF7 Red", color: "Đỏ" },
    { src: anhTrang, alt: "VF7 White", color: "Trắng" },
  ];

  const colorNames = ["Xám", "Đen", "Xanh dương", "Xanh lá", "Đỏ", "Trắng"];

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
    if (index === 0) return "Xám";
    return carImages[index - 1]?.color || colorNames[index] || "";
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Nvabar />

      <div className="car-page">
        {/* Ảnh chính màu xám */}
        <div className="car-top">
          <img 
            src={anhXam} 
            alt="VinFast VF 7" 
            className="main-car-image" 
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />
          <h2>VinFast VF 7</h2>
          <p>Giá từ 799,000,000₫</p>
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
          {[anhXam, anhDen, anhXanhDuong, anhXanhLa, anhDo, anhTrang].map((car, i) => (
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
