import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import Banner from '../components/Banner';
import CarSection from '../components/CarSection';
import AppointmentModal from '../components/AppointmentModal';
import FeedbackModal from '../components/FeedbackModal';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
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
              <h3>Đặt lịch lái thử</h3>
              <p>Trải nghiệm xe điện ngay hôm nay</p>
            </div>
            <div className="action-card" onClick={() => setShowDeliveryModal(true)}>
              <h3>Đặt lịch giao xe</h3>
              <p>Nhận xe tại nhà hoặc đại lý</p>
            </div>
            <div className="action-card" onClick={() => setShowFeedbackModal(true)}>
              <h3>Gửi phản hồi</h3>
              <p>Chia sẻ ý kiến của bạn với chúng tôi</p>
            </div>
            <div className="action-card" onClick={() => navigate('/order/track')}>
              <h3>
                <FaSearch style={{ marginRight: '8px' }} />
                Theo dõi đơn hàng
              </h3>
              <p>Tra cứu trạng thái đơn hàng của bạn</p>
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