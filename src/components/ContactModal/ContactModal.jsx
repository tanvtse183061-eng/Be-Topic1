import React from 'react';
import './ContactModal.css';

const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay" onClick={onClose}>
      <div className="contact-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="contact-modal-close" onClick={onClose}>×</button>
        
        <h2 className="contact-modal-title">Bạn quan tâm đến chiếc xe này?</h2>
        
        <p className="contact-modal-description">
          Để nhận được tư vấn chi tiết và báo giá tốt nhất, 
          vui lòng liên hệ với chúng tôi
        </p>

        <div className="contact-modal-info">
          <div className="contact-info-item">
            <span className="contact-label">Hotline</span>
            <a href="tel:1900xxxx" className="contact-value">1900 - xxxx</a>
          </div>

          <div className="contact-info-item">
            <span className="contact-label">Email</span>
            <a href="mailto:support@evmcar.com" className="contact-value">support@evmcar.com</a>
          </div>
        </div>

        <div className="contact-modal-footer">
          <p>Hoặc ghé thăm showroom gần nhất để trải nghiệm trực tiếp</p>
        </div>

        <button className="contact-modal-button" onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
};

export default ContactModal;
