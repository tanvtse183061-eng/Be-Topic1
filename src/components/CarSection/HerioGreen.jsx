import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrderFromCar from "../CreateOrderFromCar/CreateOrderFromCar";

import anhVang from "../../assets/cars/herio-yellow.png";
import anhDo from "../../assets/cars/herio-red.png";
import anhTrang from "../../assets/cars/herio-white.png";
import anhXam from "../../assets/cars/herio.png";
import anhDen from "../../assets/cars/herio-black.png";

import "./Car.css";

export default function HerioGreen() {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  const carImages = [
    { src: anhDo, alt: "Herio Red", color: "Đỏ" },
    { src: anhTrang, alt: "Herio White", color: "Trắng" },
    { src: anhVang, alt: "Herio Yellow", color: "Vàng" },
    { src: anhDen, alt: "Herio Black", color: "Đen" },
  ];

  const colorNames = ["Xám", "Đỏ", "Trắng", "Vàng", "Đen"];

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
            alt="Herio Green" 
            className="main-car-image" 
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />
          <h2>Herio Green</h2>
          <p>Giá chỉ 499,000,000₫</p>
        </div>

        {/* Thanh menu đen + nút báo giá */}
        <div className="car-menu">
          
        </div>

        {/* Ưu đãi màu đỏ */}
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
          {[anhXam, anhDo, anhTrang, anhVang, anhDen].map((car, i) => (
            <img
              key={i}
              src={car}
              alt="color option"
              onClick={() => setIndex(i - 1 >= 0 ? i - 1 : 0)}
              className={`thumbnail-img ${
                index === i - 1 ? "active" : ""
              }`}
            />
          ))}
        </div>

        {showModal && !isDealerStaff && (
          <ContactModal isOpen={showModal} onClose={closeModal} />
        )}
        
        {showOrderModal && isDealerStaff && (
          <CreateOrderFromCar
            show={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            carName="Herio Green"
            carColor={getCurrentColor()}
            carPrice={499000000}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
