import React, { useState } from 'react';
import Banner from '../components/Banner';
import CarSection from '../components/CarSection';
import AppointmentModal from '../components/AppointmentModal';
import FeedbackModal from '../components/FeedbackModal';
import './HomePage.css';

const HomePage = () => {
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      <Banner />
      <CarSection />
      
      {/* Quick Actions Section */}
      <div className="homepage-actions">
        <div className="actions-container">
          <h2>Dịch vụ của chúng tôi</h2>
          <div className="actions-grid">
            <div className="action-card" onClick={() => setShowTestDriveModal(true)}>
              <div className="action-icon">🚗</div>
              <h3>Đặt lịch lái thử</h3>
              <p>Trải nghiệm xe điện ngay hôm nay</p>
            </div>
            <div className="action-card" onClick={() => setShowDeliveryModal(true)}>
              <div className="action-icon">📦</div>
              <h3>Đặt lịch giao xe</h3>
              <p>Nhận xe tại nhà hoặc đại lý</p>
            </div>
            <div className="action-card" onClick={() => setShowFeedbackModal(true)}>
              <div className="action-icon">💬</div>
              <h3>Gửi phản hồi</h3>
              <p>Chia sẻ ý kiến của bạn với chúng tôi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AppointmentModal 
        show={showTestDriveModal} 
        onClose={() => setShowTestDriveModal(false)}
        appointmentType="test_drive"
      />
      <AppointmentModal 
        show={showDeliveryModal} 
        onClose={() => setShowDeliveryModal(false)}
        appointmentType="delivery"
      />
      <FeedbackModal 
        show={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
};

export default HomePage;