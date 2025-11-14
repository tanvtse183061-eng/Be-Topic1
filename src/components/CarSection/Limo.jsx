import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrderFromCar from "../CreateOrderFromCar/CreateOrderFromCar";

// Import ảnh xe Limo các màu
import anhXam from "../../assets/cars/limogreen-gray.png"; // màu chính
import anhDen from "../../assets/cars/limogreen-black.png";
import anhDo from "../../assets/cars/limogreen-red.png";
import anhVang from "../../assets/cars/limogreen-yellow.png";

import "./Car.css";

export default function Limo() {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  const carImages = [
    { src: anhDen, alt: "Limo Black", color: "Đen" },
    { src: anhDo, alt: "Limo Red", color: "Đỏ" },
    { src: anhVang, alt: "Limo Yellow", color: "Vàng" },
  ];

  const colorNames = ["Xám", "Đen", "Đỏ", "Vàng"];

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
            alt="Limo Green" 
            className="main-car-image" 
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />
          <h2>Limo Green</h2>
          <p>Giá từ 749,000,000₫</p>
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
          {[anhXam, anhDen, anhDo, anhVang].map((car, i) => (
            <img
              key={i}
              src={car}
              alt="color option"
              onClick={() => setIndex(i - 1 >= 0 ? i - 1 : 0)}
              className={`thumbnail-img ${index === i - 1 ? "active" : ""}`}
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
            carName="Limo Green"
            carColor={getCurrentColor()}
            carPrice={749000000}
          />
        )}
      </div>
      <Footer />
    </>
  );
}