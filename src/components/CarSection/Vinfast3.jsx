import { useState } from "react";
import { Carousel } from "react-bootstrap";
import Nvabar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ContactModal from "../ContactModal/ContactModal";
import CreateOrderFromCar from "../CreateOrderFromCar/CreateOrderFromCar";

// Import ảnh xe VinFast VF3 các màu
import anhVang from "../../assets/cars/vinfastvf3-yellow.png";
import anhXanhDuong from "../../assets/cars/vinfastvf3-blue.png";
import anhXamDam from "../../assets/cars/vinfastvf3-darkgray.png";
import anhXam from "../../assets/cars/vinfastvf3-gray.png";
import anhXanhNhat from "../../assets/cars/vinfastvf3-lightblue.png";
import anhHong from "../../assets/cars/vinfastvf3-pink.png";
import anhTim from "../../assets/cars/vinfastvf3-purple.png";
import anhDo from "../../assets/cars/vinfastvf3-red.png";
import anhTrang from "../../assets/cars/vinfastvf3-white.png";

import "./Car.css";

export default function Vinfast3() {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Kiểm tra role của user
  const userRole = localStorage.getItem("role");
  const isDealerStaff = userRole === "STAFF" || userRole === "DEALER_STAFF";

  const carImages = [
    { src: anhXanhDuong, alt: "VF3 Blue", color: "Xanh dương" },
    { src: anhXamDam, alt: "VF3 Dark Gray", color: "Xám đậm" },
    { src: anhXam, alt: "VF3 Gray", color: "Xám" },
    { src: anhXanhNhat, alt: "VF3 Light Blue", color: "Xanh nhạt" },
    { src: anhHong, alt: "VF3 Pink", color: "Hồng" },
    { src: anhTim, alt: "VF3 Purple", color: "Tím" },
    { src: anhDo, alt: "VF3 Red", color: "Đỏ" },
    { src: anhTrang, alt: "VF3 White", color: "Trắng" },
  ];

  const colorNames = ["Vàng", "Xanh dương", "Xám đậm", "Xám", "Xanh nhạt", "Hồng", "Tím", "Đỏ", "Trắng"];

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const handleImageClick = () => {
    if (isDealerStaff) {
      // Nếu là DealerStaff, mở modal tạo đơn hàng
      setShowOrderModal(true);
    } else {
      // Nếu không phải DealerStaff, mở modal liên hệ
      setShowModal(true);
    }
  };

  // Lấy màu hiện tại từ index
  const getCurrentColor = () => {
    if (index === 0) return "Vàng";
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
          <img src={anhVang} alt="VinFast VF 3" className="main-car-image" onClick={handleImageClick} style={{ cursor: "pointer" }} />
          <h2>VinFast VF 3</h2>
          <p>Giá từ 269,000,000</p>
        </div>
        <div className="car-menu"></div>
        <div className="promo">
          <ul>
            <li>Miễn 100% lệ phí trước bạ</li>
            <li>Miễn phí sạc pin đến 30/06/2027</li>
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
          {[anhVang, anhXanhDuong, anhXamDam, anhXam, anhXanhNhat, anhHong, anhTim, anhDo, anhTrang].map((car, i) => (
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
            carName="VinFast VF 3"
            carColor={getCurrentColor()}
            carPrice={269000000}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

