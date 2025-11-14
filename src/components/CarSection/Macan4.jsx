import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrderFromCar from "../CreateOrderFromCar/CreateOrderFromCar";

import anhTim from "../../assets/cars/Macantim4.png";
import anhXanhDuong from "../../assets/cars/Macan4-blue.png";
import anhXanhLa from "../../assets/cars/Macan4-green.png";
import anhCam from "../../assets/cars/Macan4-orange.png";

import "./Car.css";

export default function Macan4() {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  const carImages = [
    { src: anhXanhDuong, alt: "Macan 4 Blue", color: "Xanh dương" },
    { src: anhXanhLa, alt: "Macan 4 Green", color: "Xanh lá" },
    { src: anhCam, alt: "Macan 4 Orange", color: "Cam" },
  ];

  const colorNames = ["Tím", "Xanh dương", "Xanh lá", "Cam"];

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
    if (index === 0) return "Tím";
    return carImages[index - 1]?.color || colorNames[index] || "";
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Nvabar />
      <div className="car-page">
        <div className="car-top">
          <img src={anhTim} alt="Macan 4 thuần điện" className="main-car-image" onClick={handleImageClick} style={{ cursor: "pointer" }} />
          <h2>Macan 4 thuần điện</h2>
          <p>Giá từ 3,740,000,000</p>
        </div>
        <div className="car-menu"></div>
        <div className="promo">
          <ul>
            <li>Động cơ điện hiệu suất cao</li>
            <li>Công nghệ Porsche tiên tiến</li>
          </ul>
        </div>
        <div className="car-carousel-container">
          <Carousel activeIndex={index} onSelect={handleSelect} interval={null} indicators={false} className="car-carousel">
            {carImages.map((car, i) => (
              <Carousel.Item key={i}>
                <img className="d-block w-100 car-carousel-image" src={car.src} alt={car.alt} onClick={handleImageClick} style={{ cursor: "pointer" }} />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
        <div className="thumbnail-row">
          {[anhTim, anhXanhDuong, anhXanhLa, anhCam].map((car, i) => (
            <img key={i} src={car} alt="color option" onClick={() => setIndex(i - 1 >= 0 ? i - 1 : 0)} className={`thumbnail-img ${index === i - 1 ? "active" : ""}`} />
          ))}
        </div>
        {showModal && !isDealerStaff && (
          <div className="contact-modal-overlay" onClick={closeModal}>
            <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
              <div className="contact-modal-icon"></div>
              <h2>Bạn quan tâm đến chiếc xe này?</h2>
              <p>Vui lòng liên hệ với nhân viên tư vấn của chúng tôi</p>
              <p>để được hỗ trợ tốt nhất!</p>
              <div className="contact-modal-phone"> Hotline: 1900-xxxx</div>
              <p style={{ fontSize: "16px", marginTop: "15px" }}>Hoặc đến showroom gần nhất để trải nghiệm xe</p>
              <button className="contact-modal-button" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        )}
        
        {showOrderModal && isDealerStaff && (
          <CreateOrderFromCar
            show={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            carName="Macan 4 thuần điện"
            carColor={getCurrentColor()}
            carPrice={3740000000}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

