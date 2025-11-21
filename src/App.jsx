
import './styles/globals.css'
import HomePage from './Pages/HomePage';
import Login from './Pages/Login/Login';
import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from './Pages/Admin/Admin';
import DealerStaff from './Pages/DealerStaff/DealerStaff';
import DealerManager from './Pages/DealerManager/DealerManager';
import EVMStaff from './Pages/EVMStaff/EVMStaff';
// Admin components
import Dashboard from './Pages/Admin/Dashboard';
import Customer from './Pages/Admin/Customer';
import Order from './Pages/Admin/Order';
import Cardelivery from './Pages/Admin/Cardelivery';
import Paymentcustomer from './Pages/Admin/Paymentcustomer';
// Vehicle components - dùng chung từ shared
import VehicleBrand from './Pages/shared/VehicleBrand';
import VehicleModel from './Pages/Admin/VehicleModel';
import VehicleVariant from './Pages/Admin/VehicleVariant';
import VehicleColor from './Pages/Admin/VehicleColor';
import Dealer from './Pages/Admin/Dealer';
// Warehouse và VehicleInventory - dùng chung từ shared
import Warehouse from './Pages/shared/Warehouse';
import VehicleInventory from './Pages/shared/VehicleInventory';
import UserManagement from './Pages/Admin/UserManagement';
// DealerStaff components
import DashboardDealerStaff from './Pages/DealerStaff/Dashboard';
import CustomerDealerStaff from './Pages/DealerStaff/Customer';
import OrderDealerStaff from './Pages/DealerStaff/Order';
import CardeliveryDealerStaff from './Pages/DealerStaff/Cardelivery';
import DeliveryTrackingDealerStaff from './Pages/DealerStaff/DeliveryTracking';
import PaymentcustomerDealerStaff from './Pages/DealerStaff/Paymentcustomer';
// VehicleBrand dùng chung từ shared
import VehicleModelDealerStaff from './Pages/DealerStaff/VehicleModel';
import VehicleVariantDealerStaff from './Pages/DealerStaff/VehicleVariant';
import VehicleColorDealerStaff from './Pages/DealerStaff/VehicleColor';
// DealerManager components
import DashboardDealerManager from './Pages/DealerManager/Dashboard';
import CustomerDealerManager from './Pages/DealerManager/Customer';
import OrderDealerManager from './Pages/DealerManager/Order';
import CardeliveryDealerManager from './Pages/DealerManager/Cardelivery';
import DeliveryTrackingDealerManager from './Pages/DealerStaff/DeliveryTracking';
import PaymentcustomerDealerManager from './Pages/DealerManager/Paymentcustomer';
// VehicleBrand dùng chung từ shared
import VehicleModelDealerManager from './Pages/DealerManager/VehicleModel';
import VehicleVariantDealerManager from './Pages/DealerManager/VehicleVariant';
import VehicleColorDealerManager from './Pages/DealerManager/VehicleColor';
// EVMStaff components
import DashboardEVMStaff from './Pages/EVMStaff/Dashboard';
// VehicleBrand dùng chung từ shared
import VehicleModelEVMStaff from './Pages/EVMStaff/VehicleModel';
import VehicleVariantEVMStaff from './Pages/EVMStaff/VehicleVariant';
import VehicleColorEVMStaff from './Pages/EVMStaff/VehicleColor';
// Warehouse và VehicleInventory dùng chung từ shared
// Import các component mới cho luồng đại lý mua hàng
import DealerOrder from './Pages/DealerManager/DealerOrder';
import DealerQuotation from './Pages/DealerManager/DealerQuotation';
import DealerInvoice from './Pages/DealerManager/DealerInvoice';
import DealerPayment from './Pages/DealerManager/DealerPayment';
import VehicleDelivery from './Pages/DealerManager/VehicleDelivery';
// Import Quotation component - dùng chung từ shared
import Quotation from './Pages/shared/Quotation';
// Import các component mới - dùng chung từ shared
import Appointment from './Pages/shared/Appointment';
import Feedback from './Pages/shared/Feedback';
import SalesContract from './Pages/shared/SalesContract';
import Promotion from './Pages/shared/Promotion';
import DealerTarget from './Pages/Admin/DealerTarget';
import DealerContract from './Pages/Admin/DealerContract';
import PricingPolicy from './Pages/Admin/PricingPolicy';
import Report from './Pages/Admin/Report';
import ImageManagement from './Pages/Admin/ImageManagement';
import InstallmentPlan from './Pages/Admin/InstallmentPlan';
import InstallmentSchedule from './Pages/Admin/InstallmentSchedule';
import VehicleDeliveryEVMStaff from './Pages/EVMStaff/VehicleDelivery';
import PublicQuotation from './Pages/Public/PublicQuotation';
import PublicPayment from './Pages/Public/PublicPayment';
import PublicAppointment from './Pages/Public/PublicAppointment';
import CreateCustomer from './Pages/Public/CreateCustomer';
import CreateOrder from './Pages/Public/CreateOrder';
import Invoice from './Pages/Admin/Invoice';
import CarDetail from './components/CarSection/CarDetail';
import HerioGreen from './components/CarSection/HerioGreen';
import Limo from './components/CarSection/Limo';
import Minio from './components/CarSection/Minio';
import Vinfast3 from './components/CarSection/Vinfast3';
import Vinfast6 from './components/CarSection/Vinfast6';
import Vinfast7 from './components/CarSection/Vinfast7';
import Macan from './components/CarSection/Macan';
import Macan4 from './components/CarSection/Macan4';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
     
        <Routes>
          <Route path="/car/:inventoryId" element={<CarDetail />} />
          <Route path="/heriogreen" element={<HerioGreen />} />
          <Route path="/limo" element={<Limo />} />
          <Route path="/minio" element={<Minio />} />
          <Route path="/vinfast3" element={<Vinfast3 />} />
          <Route path="/vinfast6" element={<Vinfast6 />} />
          <Route path="/vinfast7" element={<Vinfast7 />} />
          <Route path="/macan" element={<Macan />} />
          <Route path="/macan4" element={<Macan4 />} />
          <Route path="/login" element={<Login />} />
          <Route path="/public/quotations/:quotationId" element={<PublicQuotation />} />
          <Route path="/public/orders/:orderId/payment" element={<PublicPayment />} />
          <Route path="/public/orders/:orderId/appointment" element={<PublicAppointment />} />
          <Route path="/public/customer/create" element={<CreateCustomer />} />
          <Route path="/public/order/create" element={<CreateOrder />} />
          
          <Route path="/" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          
          <Route path="/home" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          {/* Admin routes */}
          <Route path='/admin' element={<Admin />}>
            <Route index element={<Dashboard />} />
            <Route path='dashboard' element={<Dashboard />}/>
            <Route path='customer' element={<Customer />} />
            <Route path='order' element={<Order />} />
            <Route path='cardelivery' element={<Cardelivery />} />
            <Route path='paymentcustomer' element={<Paymentcustomer />} />
            <Route path='invoice' element={<Invoice />} />
            <Route path='vehiclebrand' element={<VehicleBrand />} />
            <Route path='vehiclemodel' element={<VehicleModel />} />
            <Route path='vehiclevariant' element={<VehicleVariant />} />
            <Route path='vehiclcolor' element={<VehicleColor />} />
            <Route path='createdealer' element={<Dealer />} />
            <Route path='warehouse' element={<Warehouse />} />
            <Route path='vehicleinventory' element={<VehicleInventory />} />
            <Route path='usermanagement' element={<UserManagement />} />
            <Route path='quotation' element={<Quotation />} />
            <Route path='dealerorder' element={<DealerOrder />} />
            <Route path='dealerquotation' element={<DealerQuotation />} />
            <Route path='dealerinvoice' element={<DealerInvoice />} />
            <Route path='dealerpayment' element={<DealerPayment />} />
            <Route path='vehicledelivery' element={<VehicleDelivery />} />
            <Route path='appointment' element={<Appointment />} />
            <Route path='feedback' element={<Feedback />} />
            <Route path='salescontract' element={<SalesContract />} />
            <Route path='promotion' element={<Promotion />} />
            <Route path='dealertarget' element={<DealerTarget />} />
            <Route path='dealercontract' element={<DealerContract />} />
            <Route path='pricingpolicy' element={<PricingPolicy />} />
            <Route path='report' element={<Report />} />
            <Route path='imagemanagement' element={<ImageManagement />} />
            <Route path='installmentplan' element={<InstallmentPlan />} />
            <Route path='installmentschedule' element={<InstallmentSchedule />} />
          </Route>
          
          {/* DealerStaff routes */}
          <Route path='/dealerstaff' element={<DealerStaff />}>
            <Route index element={<DashboardDealerStaff />} />
            <Route path='dashboard' element={<DashboardDealerStaff />}/>
            <Route path='customer' element={<CustomerDealerStaff />} />
            <Route path='order' element={<OrderDealerStaff />} />
            <Route path='quotation' element={<Quotation />} />
            <Route path='deliverytracking' element={<DeliveryTrackingDealerStaff />} />
            <Route path='paymentcustomer' element={<PaymentcustomerDealerStaff />} />
            <Route path='vehiclebrand' element={<VehicleBrand />} />
            <Route path='vehiclemodel' element={<VehicleModelDealerStaff />} />
            <Route path='vehiclevariant' element={<VehicleVariantDealerStaff />} />
            <Route path='vehiclcolor' element={<VehicleColorDealerStaff />} />
            <Route path='feedback' element={<Feedback />} />
          </Route>
          
          {/* DealerManager routes */}
          <Route path='/dealermanager' element={<DealerManager />}>
            <Route index element={<DashboardDealerManager />} />
            <Route path='dashboard' element={<DashboardDealerManager />}/>
            <Route path='customer' element={<CustomerDealerManager />} />
            <Route path='order' element={<OrderDealerManager />} />
            <Route path='deliverytracking' element={<DeliveryTrackingDealerManager />} />
            <Route path='paymentcustomer' element={<PaymentcustomerDealerManager />} />
            <Route path='vehiclebrand' element={<VehicleBrand />} />
            <Route path='vehiclemodel' element={<VehicleModelDealerManager />} />
            <Route path='vehiclevariant' element={<VehicleVariantDealerManager />} />
            <Route path='vehiclcolor' element={<VehicleColorDealerManager />} />
            <Route path='dealerorder' element={<DealerOrder />} />
            <Route path='dealerquotation' element={<DealerQuotation />} />
            <Route path='dealerinvoice' element={<DealerInvoice />} />
            <Route path='dealerpayment' element={<DealerPayment />} />
            <Route path='vehicledelivery' element={<VehicleDelivery />} />
          </Route>
          
          {/* EVMStaff routes */}
          <Route path='/evmstaff' element={<EVMStaff />}>
            <Route index element={<DashboardEVMStaff />} />
            <Route path='dashboard' element={<DashboardEVMStaff />}/>
            <Route path='vehiclebrand' element={<VehicleBrand />} />
            <Route path='vehiclemodel' element={<VehicleModelEVMStaff />} />
            <Route path='vehiclevariant' element={<VehicleVariantEVMStaff />} />
            <Route path='vehiclcolor' element={<VehicleColorEVMStaff />} />
            <Route path='warehouse' element={<Warehouse />} />
            <Route path='vehicleinventory' element={<VehicleInventory />} />
            <Route path='dealerorder' element={<DealerOrder />} />
            <Route path='dealerquotation' element={<DealerQuotation />} />
            <Route path='dealerinvoice' element={<DealerInvoice />} />
            <Route path='dealerpayment' element={<DealerPayment />} />
            <Route path='vehicledelivery' element={<VehicleDeliveryEVMStaff />} />
            <Route path='appointment' element={<Appointment />} />
            <Route path='feedback' element={<Feedback />} />
            <Route path='salescontract' element={<SalesContract />} />
            <Route path='promotion' element={<Promotion />} />
          </Route>
          
        </Routes>
        
      </BrowserRouter>
    </div>
  );
}

export default App
