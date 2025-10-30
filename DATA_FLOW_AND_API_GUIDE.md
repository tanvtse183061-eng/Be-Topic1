## Hướng dẫn luồng dữ liệu, Entity và API mẫu

### Tổng quan luồng chuẩn
- **Controller** nhận DTO → **Service (@Transactional)** xử lý nghiệp vụ → **Repository** thao tác DB → **Entity** ánh xạ bảng.
- **Quy tắc an toàn**:
  - Tạo dữ liệu theo thứ tự phụ thuộc khóa ngoại.
  - Tránh trùng các trường unique (ví dụ `dealerCode`, `orderNumber`, `username`, `email`, `vin`).
  - Định dạng ngày ISO `YYYY-MM-DD`; UUID hợp lệ.
  - Với quan hệ ManyToOne, truyền ID đã tồn tại.

### Mục đích entity chính
- **User**: tài khoản hệ thống/đại lý; có `userType`, `status`, liên kết optional `Dealer`.
- **Dealer**: thông tin đại lý (mã, tên, liên hệ, loại, trạng thái).
- **Customer**: thông tin khách (email/phone duy nhất nếu dùng làm định danh mềm).
- **VehicleBrand/Model/Variant/Color**: danh mục sản phẩm.
- **Warehouse**: kho chứa.
- **VehicleInventory**: xe cụ thể trong kho, tham chiếu Variant/Color/Warehouse/Dealer.
- **Quotation**: báo giá cho khách.
- **Order**: đơn bán lẻ, tham chiếu Quotation/Customer/User/Inventory.
- **DealerOrder**: đơn đặt giữa hãng và đại lý.

### Thứ tự khởi tạo dữ liệu (không lỗi)
1) VehicleBrand → VehicleModel → VehicleVariant → VehicleColor
2) Dealer → Warehouse
3) VehicleInventory (tham chiếu Dealer/Variant/Color/Warehouse)
4) Customer
5) User (tham chiếu Dealer nếu cần)
6) Quotation (tham chiếu Customer/Variant)
7) Order (tham chiếu Quotation/Customer/User/Inventory)
8) DealerOrder (tham chiếu Dealer/User/Variant/Color)

### Quy ước request chung
- Header: `Content-Type: application/json`.
- Số tiền gửi dạng số (không chuỗi), ngày ISO, UUID hợp lệ.
- Kiểm tra tồn tại/trùng trước khi POST bằng các API GET tương ứng.

## API và payload mẫu

### Dealer
- Đọc: `/api/dealers`, `/api/dealers/{id}`, `/api/dealers/code/{dealerCode}`, `/api/dealers/status/{status}`, `/api/dealers/type/{dealerType}`
- Tạo mới (payload mẫu):
```json
{
  "dealerCode": "DLR001",
  "dealerName": "EV Dealer 1",
  "email": "contact@dealer1.com",
  "phone": "0900000001",
  "address": "123 EV Street",
  "city": "HCM",
  "province": "HCM",
  "postalCode": "700000",
  "dealerType": "authorized",
  "licenseNumber": "LIC-001",
  "taxCode": "TAX-001",
  "commissionRate": 2.5,
  "status": "ACTIVE"
}
```

### Warehouse
- Đọc: `/api/warehouses`, `/api/warehouses/{id}`
- Tạo mới:
```json
{
  "warehouseName": "Main Warehouse",
  "warehouseCode": "MAIN_WAREHOUSE",
  "address": "Km12 EV Road",
  "city": "HCM",
  "province": "HCM",
  "postalCode": "700000",
  "phone": "0281234567",
  "email": "warehouse@ev.com",
  "capacity": 500,
  "isActive": true
}
```

### Vehicle danh mục
- Đọc: `/api/vehicles/brands`, `/api/vehicles/brands/{brandId}`, các endpoint models/variants/colors liên quan.
- Tạo Brand:
```json
{ "brandName": "Tesla", "isActive": true }
```
- Tạo Model:
```json
{ "brandId": "UUID_BRAND", "modelName": "Model 3", "isActive": true }
```
- Tạo Variant:
```json
{
  "modelId": "UUID_MODEL",
  "variantName": "Long Range AWD",
  "batteryKwh": 82,
  "rangeKm": 560,
  "msrp": 52000,
  "isActive": true
}
```
- Tạo Color:
```json
{ "colorName": "Pearl White", "hex": "#ffffff", "isActive": true }
```

### VehicleInventory
- Đọc: các endpoint trong `VehicleInventoryController`/`InventoryManagementController`.
- Tạo mới:
```json
{
  "dealerId": "UUID_DEALER",
  "warehouseId": "UUID_WAREHOUSE",
  "variantId": "UUID_VARIANT",
  "colorId": "UUID_COLOR",
  "vin": "5YJ3E1EA7KF317000",
  "stockStatus": "in_stock",
  "price": 52000,
  "discount": 1000
}
```

### Tạo xe từ dữ liệu có sẵn (Vehicle Creation From Existing)
- Base path: `/api/vehicles`
- Endpoint multipart: `POST /create-from-existing` (upload file ảnh nếu có)
- Endpoint JSON: `POST /create-from-existing-json`

Điều kiện tiên quyết:
- Đã có sẵn `brandId`, `modelId`, `colorId`, `warehouseId` trong hệ thống.

Payload mẫu (JSON):
```json
{
  "existingBrandId": 1,
  "existingModelId": 10,
  "existingColorId": 3,
  "existingWarehouseId": "UUID_WAREHOUSE",
  "variant": {
    "variantName": "Long Range AWD",
    "priceBase": 52000
  },
  "inventory": {
    "vin": "5YJ3E1EA7KF317000",
    "warehouseLocation": "Aisle A3",
    "stockStatus": "in_stock",
    "sellingPrice": 51500,
    "notes": "Nhập từ lô 10/2025"
  }
}
```

Chuỗi bước nhập liệu gợi ý:
1) Tra cứu `brandId`, `modelId`, `colorId`, `warehouseId` hợp lệ qua các API GET danh mục/kho.
2) Gọi `POST /api/vehicles/create-from-existing-json` với payload trên.
3) Kết quả trả về `CreateVehicleResponse` gồm thông tin `variant` mới và `inventory` mới (VIN, giá, trạng thái...).
4) Tiếp tục luồng bán hàng: tạo `Quotation` → `Order` như phần trên.

### Customer
- Đọc: `/api/customers`, `/api/customers/{id}` và các tìm kiếm theo email/phone/name/city/province.
- Tạo mới:
```json
{
  "firstName": "An",
  "lastName": "Nguyen",
  "email": "an.nguyen@example.com",
  "phone": "0912345678",
  "dateOfBirth": "1992-05-20",
  "address": "456 EV Lane",
  "city": "HCM",
  "province": "HCM",
  "postalCode": "700000",
  "creditScore": 750,
  "preferredContactMethod": "phone",
  "notes": "Quan tâm model tầm trung"
}
```

### User
- Đọc: `/api/users`, `/api/users/{id}`, `/api/users/active`, `/api/users/username/{username}`, ...
- Tạo mới:
```json
{
  "username": "dealer.staff.01",
  "email": "staff01@dealer1.com",
  "password": "StrongPass#123",
  "firstName": "Staff",
  "lastName": "One",
  "phone": "0901122233",
  "dealerId": "UUID_DEALER",
  "userType": "DEALER_STAFF",
  "status": "ACTIVE"
}
```

Quản lý vai trò và mật khẩu:
- `POST /api/users/roles` tạo role:
```json
{ "roleName": "SALES_MANAGER", "description": "Quản lý bán hàng" }
```
- `PUT /api/users/roles/{roleId}` cập nhật role:
```json
{ "roleName": "SALES_LEAD", "description": "Trưởng nhóm bán hàng" }
```
- `DELETE /api/users/roles/{roleId}` xóa role.
- Đặt lại mật khẩu:
```json
// POST /api/users/{userId}/reset-password
{ "newPassword": "NewStrong#456" }

// POST /api/users/username/{username}/reset-password
{ "newPassword": "NewStrong#456" }

// POST /api/users/email/{email}/reset-password
{ "newPassword": "NewStrong#456" }
```

### Quotation
- Đọc: `/api/quotations`, `/api/quotations/{id}` (tùy controller).
- Tạo mới:
```json
{
  "customerId": "UUID_CUSTOMER",
  "variantId": "UUID_VARIANT",
  "basePrice": 52000,
  "discount": 1000,
  "tax": 0.1,
  "validUntil": "2025-12-31",
  "notes": "Áp dụng chương trình tháng 12"
}
```

### Public Order (khách vãng lai tạo đơn)
- Base path: `/api/public/orders`
- `POST /` tạo đơn từ `OrderRequest` (không cần đăng nhập)
- Bước nhập:
  1) Bảo đảm có `customerId`, `quotationId` (hoặc dữ liệu đủ để service tạo), `inventoryId` còn available.
  2) Gọi `POST /api/public/orders` với body `OrderRequest` như mục Order.
  3) Kiểm tra kết quả; nếu lỗi 400 là vi phạm ràng buộc (trùng/sai tham chiếu), 500 là lỗi hệ thống.

Payload mẫu (OrderRequest):
```json
{
  "orderNumber": "SO-PUB-2025-00001",
  "quotationId": "UUID_QUOTATION",
  "customerId": "UUID_CUSTOMER",
  "userId": "UUID_USER",
  "inventoryId": "UUID_INVENTORY",
  "orderDate": "2025-10-30",
  "status": "pending",
  "orderType": "RETAIL",
  "paymentStatus": "PENDING",
  "deliveryStatus": "PENDING",
  "fulfillmentStatus": "CREATED"
}
```

### Authentication
- Base path: `/api/auth`
- `POST /login` lấy JWT; `POST /register` đăng ký; `POST /validate` kiểm tra token; `POST /logout` đăng xuất.
- Gợi ý:
  - Backend nội bộ có thể yêu cầu token cho các API quản trị/nhập liệu; public không yêu cầu.

Payload mẫu:
```json
// POST /api/auth/login
{ "username": "admin", "password": "StrongPass#123" }

// POST /api/auth/register
{
  "username": "dealer.staff.02",
  "email": "staff02@dealer1.com",
  "password": "StrongPass#123",
  "firstName": "Staff",
  "lastName": "Two"
}

// POST /api/auth/validate
{ "token": "<JWT>" }
```

### Vehicle Inventory quản trị (cập nhật/xóa)
- Base path: `/api/vehicle-inventory`
- `PUT /{inventoryId}` cập nhật inventory; `PUT /{inventoryId}/status` cập nhật trạng thái; `DELETE /{inventoryId}` xóa.
- Tiện ích: `POST /normalize-statuses`, `POST /validate-status?status=...`.
- Gợi ý: Chỉ cho phép chuyển trạng thái hợp lệ (available → reserved → sold... tuỳ chính sách).

### Vehicle Delivery (giao xe)
- Base path: `/api/vehicle-deliveries`
- `POST /dealer-order/{dealerOrderId}` tạo giao hàng từ DealerOrder.
- `PUT /{deliveryId}` cập nhật; `PUT /{deliveryId}/status` đổi trạng thái; `PUT /{deliveryId}/confirm` xác nhận giao; `PUT /{deliveryId}/dealer-confirm` đại lý xác nhận; `DELETE /{deliveryId}` xóa.
- Chuỗi bước: tạo DealerOrder → tạo Delivery từ DealerOrder → xác nhận giao/nhận.

GET tra cứu nhanh:
- `GET /{deliveryId}`
- `GET /order/{orderId}`
- `GET /inventory/{inventoryId}`
- `GET /customer/{customerId}`
- `GET /status/{deliveryStatus}`
- `GET /date/{date}` (ISO date)
- `GET /date-range?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /delivered-by/{userId}`
- `GET /customer/{customerId}/status/{status}`
- `GET /overdue`
- Đại lý: `GET /dealer/{dealerId}`, `/dealer/{dealerId}/status/{status}`, `/dealer/{dealerId}/summary`, `/dealer/{dealerId}/pending`
- Thống kê: `GET /statistics`

### Dealer Payment (thanh toán đại lý)
- Base path: `/api/dealer-payments`
- `POST /process-payment` xử lý thanh toán; `POST /refund/{paymentId}` hoàn tiền.
- Cập nhật/xóa: `PUT /{paymentId}`, `PUT /{paymentId}/status`, `DELETE /{paymentId}`.
- Gợi ý: Kiểm tra số tiền, trạng thái đơn/liên quan trước khi xử lý; lưu vết giao dịch.

Payload mẫu `POST /process-payment`:
```json
{
  "dealerId": "UUID_DEALER",
  "orderId": "UUID_DEALER_ORDER",
  "amount": 250000.0,
  "currency": "VND",
  "method": "BANK_TRANSFER",
  "reference": "TXN-2025-10-30-001",
  "notes": "Thanh toán đợt 1"
}
```

Payload mẫu `POST /refund/{paymentId}` (query/body):
```json
{ "reason": "Điều chỉnh số lượng" }
```

### Public Payment (khách vãng lai)
- Base path: `/api/public/payments`
- Tạo thanh toán public (endpoint cụ thể trong controller, thường là `POST`); sau khi thành công liên kết `orderId`.
- Gợi ý: Dùng kênh an toàn, xác nhận callback nếu có.

Payload mẫu tạo thanh toán public:
```json
{
  "orderId": "UUID_ORDER",
  "amount": 51500.0,
  "currency": "USD",
  "method": "CARD",
  "cardLast4": "4242",
  "returnUrl": "https://your-frontend/checkout/result"
}
```

### Public Appointment (đặt lịch)
- Base path: `/api/public/appointments`
- Thường `POST /` để đặt lịch, kèm `customer` hoặc thông tin liên hệ và `variantId`/`inventoryId`.
- Gợi ý: Validate thời gian hợp lệ, tránh trùng.

Payload mẫu `POST /api/public/appointments`:
```json
{
  "customerName": "An Nguyen",
  "email": "an.nguyen@example.com",
  "phone": "0912345678",
  "variantId": 123,
  "inventoryId": "UUID_INVENTORY",
  "preferredDateTime": "2025-11-05T10:00:00",
  "notes": "Muốn lái thử trong khu vực quận 1"
}
```

### Public Feedback (góp ý)
- Base path: `/api/public/feedbacks`
- `POST /` gửi phản hồi; lưu kèm `customerId` (nếu có) hoặc thông tin liên hệ.
- Gợi ý: Chống spam, kiểm tra định dạng email/phone.

Payload mẫu `POST /api/public/feedbacks`:
```json
{
  "subject": "Trải nghiệm lái thử",
  "message": "Nhân viên hỗ trợ rất tốt, xe vận hành êm ái.",
  "rating": 5,
  "customerId": "UUID_CUSTOMER",
  "contactEmail": "an.nguyen@example.com"
}
```

### ProductManagement (danh mục CRUD mở rộng)
- Base path: `/api/products`
- Hỗ trợ CRUD cho Brand/Model/Variant/Color ngoài các GET trong `VehicleController`.
- Gợi ý: Khi xóa/sửa cần kiểm tra ràng buộc đến `Variant`/`Inventory`.

Payload mẫu:
```json
// POST /api/products/brands
{ "brandName": "BYD", "isActive": true }

// POST /api/products/models
{ "brandId": 1, "modelName": "Seal", "vehicleType": "Sedan", "isActive": true }

// POST /api/products/variants
{ "modelId": 10, "variantName": "Performance", "batteryKwh": 82, "rangeKm": 520, "msrp": 48000, "isActive": true }

// POST /api/products/colors
{ "colorName": "Midnight Silver", "hex": "#59656f", "isActive": true }
```

### Sales Contract (nội bộ)
- Base path: `/api/sales-contracts`
- CRUD hợp đồng bán hàng nội bộ; hợp đồng public đọc/ký qua `Public Contract` (mục trên).
- Chuỗi bước: sau khi tạo `Order` nội bộ → tạo `SalesContract` → công khai cho khách via `Public Contract` để ký.

### Dealer Target / Dealer Contract / Dealer Invoice
- Base paths: `/api/dealer-targets`, `/api/dealer-contracts`, `/api/dealer-invoices`
- Quản trị B2B: thiết lập chỉ tiêu, hợp đồng đại lý, hóa đơn.
- Gợi ý: Đồng bộ với DealerOrder/Delivery/Payment để đảm bảo tính nhất quán số liệu.

### Installment Plan / Installment Schedule
- Base paths: `/api/installment-plans`, `/api/installment-schedules`
- Thiết lập kế hoạch trả góp và lịch trả góp cho Order/Customer.
- Gợi ý: Tính toán lãi/biên độ; đồng bộ Payment.

Payload mẫu:
```json
// POST /api/installment-plans
{
  "orderId": "UUID_ORDER",
  "principal": 40000,
  "downPayment": 12000,
  "interestRate": 8.5,
  "tenorMonths": 36,
  "startDate": "2025-11-15",
  "balloonPayment": 0
}

// POST /api/installment-schedules
{
  "planId": "UUID_PLAN",
  "generated": true,
  "schedule": [
    { "dueDate": "2025-12-15", "amount": 1000, "principal": 850, "interest": 150 },
    { "dueDate": "2026-01-15", "amount": 1000, "principal": 855, "interest": 145 }
  ]
}
```

### Report / Promotion / PricingPolicy / Image
- `/api/reports`: báo cáo (đọc)
- `/api/promotions`: khuyến mãi (có thể có tạo/cập nhật nếu controller hỗ trợ)
- `/api/pricing-policies`: chính sách giá
- `/api/images`: upload/quan lý ảnh (multipart), dùng khi tạo xe hoặc cập nhật media.

Ví dụ Promotion/PricingPolicy/Image:
```json
// POST /api/promotions
{
  "promotionName": "Black Friday",
  "description": "Giảm 5% tất cả variants",
  "discountType": "PERCENT",
  "discountValue": 5,
  "startDate": "2025-11-25",
  "endDate": "2025-11-30",
  "isActive": true
}

// POST /api/pricing-policies
{
  "name": "Year-End Pricing",
  "appliesTo": "MODEL",
  "modelId": 10,
  "priceAdjustmentType": "PERCENT",
  "priceAdjustmentValue": -3,
  "effectiveFrom": "2025-12-01",
  "effectiveTo": "2025-12-31"
}
```

Upload ảnh (multipart):
```text
POST /api/images/upload
Content-Type: multipart/form-data
Fields:
  file: <binary>
  entityType: "inventory" | "brand" | "model" | "variant"
  entityId: "<UUID or numeric id>"
  altText: "Ảnh chính diện"
```

Report filter ví dụ (GET):
```text
GET /api/reports/sales-by-staff
GET /api/reports/sales-by-role/DEALER_STAFF
GET /api/reports/monthly-sales?year=2025&month=10
GET /api/reports/inventory-turnover
GET /api/reports/customer-debt
GET /api/reports/dealer-performance
GET /api/reports/deliveries/by-status/SCHEDULED
GET /api/reports/deliveries/by-date?date=2025-11-10
GET /api/reports/walk-in-purchases
GET /api/reports/walk-in-purchases?startDate=2025-10-01&endDate=2025-10-31&status=CONFIRMED
GET /api/reports/walk-in-purchases/paged?page=0&size=20&sort=orderDate,desc
GET /api/reports/walk-in-purchases/paged?startDate=2025-10-01&endDate=2025-10-31&status=CONFIRMED&page=0&size=50&sort=totalAmount,asc
```
### Order
- Đọc: `/api/orders`, `/api/orders/{orderId}`, `/api/orders/order-number/{orderNumber}`, `/api/orders/customer/{customerId}`, `/api/orders/status/{status}`, `/api/orders/date-range?start=YYYY-MM-DD&end=YYYY-MM-DD`
- Tạo mới:
```json
{
  "orderNumber": "SO-2025-00001",
  "quotationId": "UUID_QUOTATION",
  "customerId": "UUID_CUSTOMER",
  "userId": "UUID_USER",
  "inventoryId": "UUID_INVENTORY",
  "orderDate": "2025-10-30",
  "status": "pending",
  "orderType": "RETAIL",
  "paymentStatus": "PENDING",
  "deliveryStatus": "PENDING",
  "fulfillmentStatus": "CREATED"
}
```

### Public Contract (khách vãng lai)
- Base path: `/api/public/contracts`
- Các API liên quan luồng ký hợp đồng điện tử sau khi tạo đơn:
  - `GET /order/{orderId}`: Lấy danh sách hợp đồng theo đơn hàng.
  - `GET /{contractId}`: Lấy chi tiết hợp đồng.
  - `GET /{contractId}/download`: Khởi tạo tải hợp đồng PDF.
  - `GET /{contractId}/status`: Trạng thái ký hợp đồng.
  - `POST /{contractId}/sign?customerSignature=...&signatureMethod=...`: Ký hợp đồng.
  - `POST /{contractId}/reject?reason=...`: Từ chối hợp đồng.

#### Chuỗi bước nhập liệu gợi ý (sau khi có Order):
1) Kiểm tra hợp đồng của đơn hàng:
   - Gọi `GET /api/public/contracts/order/{orderId}`.
   - Nếu trả về danh sách rỗng → cần tạo hợp đồng ở hệ thống nội bộ (SalesContractService) trước khi public.
2) Xem chi tiết hợp đồng để đối chiếu thông tin:
   - `GET /api/public/contracts/{contractId}`.
3) (Tuỳ chọn) Khởi tạo tải PDF hợp đồng:
   - `GET /api/public/contracts/{contractId}/download`.
4) Ký hợp đồng:
   - `POST /api/public/contracts/{contractId}/sign?customerSignature=<base64|text>&signatureMethod=electronic`.
   - Kết quả kỳ vọng: status chuyển `signed`, có `signatureDate`.
5) Kiểm tra trạng thái ký:
   - `GET /api/public/contracts/{contractId}/status` để xác nhận `isSigned=true`.
6) (Tuỳ chọn) Từ chối hợp đồng nếu thông tin chưa đúng:
   - `POST /api/public/contracts/{contractId}/reject?reason=Thông tin chưa chính xác`.

Ghi chú:
- Các endpoint public này không yêu cầu đăng nhập, nhưng phụ thuộc dữ liệu `SalesContract` gắn với `Order` có sẵn.
- `orderId` và `contractId` là UUID hợp lệ; cần lấy từ các bước tạo đơn và sinh hợp đồng nội bộ.

### DealerOrder
- Đọc: `/api/dealer-orders`, `/api/dealer-orders/{id}`, `/api/dealer-orders/order-number/{orderNumber}`, `/api/dealer-orders/status/{status}`, `/api/dealer-orders/date-range?...`, `/api/dealer-orders/evm-staff/{userId}`
- Tạo mới:
```json
{
  "dealerOrderNumber": "PO-2025-00001",
  "dealerId": "UUID_DEALER",
  "evmStaffUserId": "UUID_USER",
  "variantId": "UUID_VARIANT",
  "colorId": "UUID_COLOR",
  "orderDate": "2025-10-30",
  "status": "pending",
  "quantity": 5,
  "expectedDeliveryDate": "2025-11-30",
  "notes": "Giao trước lễ"
}
```

## Ghi chú thực thi để tránh lỗi
- Xác thực đầu vào ở DTO và Service; để Service ném lỗi khi trùng/thiếu.
- Tuân thủ thứ tự tạo theo phụ thuộc khóa ngoại (mục Thứ tự khởi tạo).
- Dùng các GET tra cứu trước khi POST để tránh trùng mã/số.

## Luồng Public Catalog & Tìm kiếm (khách vãng lai)
- Base path: `/api/public`
- Các endpoint chính (tham khảo `PublicController`):
  - `GET /vehicle-brands`, `GET /vehicle-brands/{brandId}`
  - `GET /vehicle-models`, `GET /vehicle-models/{modelId}`, `GET /vehicle-models/brand/{brandId}`
  - `GET /vehicle-variants`, `GET /vehicle-variants/{variantId}`
  - `GET /vehicle-colors`, `GET /vehicle-colors/{colorId}`
  - `GET /vehicle-inventory`, `GET /vehicle-inventory/{inventoryId}`
  - `GET /vehicle-inventory/status/{status}` (lọc theo trạng thái: available/sold/reserved tùy hệ thống)

### Chuỗi bước gợi ý khi khách duyệt catalog
1) Lấy thương hiệu: `GET /api/public/vehicle-brands`.
2) Xem mẫu theo thương hiệu đã chọn: `GET /api/public/vehicle-models/brand/{brandId}`.
3) Xem các phiên bản xe (variants) để so cấu hình: `GET /api/public/vehicle-variants` hoặc chi tiết `GET /api/public/vehicle-variants/{variantId}`.
4) Xem kho xe còn hàng: `GET /api/public/vehicle-inventory` hoặc `GET /api/public/vehicle-inventory/status/available`.
5) Vào chi tiết xe trong kho (nếu chọn mua): `GET /api/public/vehicle-inventory/{inventoryId}`.

Ghi chú:
- Các API public chỉ đọc; dữ liệu hiển thị phụ thuộc dữ liệu danh mục và tồn kho đã nhập từ phía nội bộ.

## Luồng So sánh xe (khách vãng lai)
## Public Customers (khách vãng lai tạo hồ sơ nhanh)
- Base path: `/api/public/customers`
- `POST /` tạo khách tối thiểu (firstName/lastName/email/phone...)
- `GET /{customerId}`; `GET /email/{email}`; `GET /phone/{phone}`

Mẫu tạo nhanh:
```json
POST /api/public/customers
{
  "firstName": "An",
  "lastName": "Nguyen",
  "email": "an.nguyen@example.com",
  "phone": "0912345678"
}
```

## Public Delivery Tracking (theo dõi giao xe)
- Base path: `/api/public/deliveries`
- `GET /order/{orderId}`: xem các lịch giao của đơn
- `GET /order-number/{orderNumber}`: xem theo số đơn
- `GET /date?date=YYYY-MM-DD`: lọc theo ngày giao

- Base path: `/api/public`
- Endpoint chính:
  - `POST /vehicle-compare` (so sánh theo tiêu chí), body yêu cầu danh sách ID/tiêu chí.
  - `GET /vehicle-compare/quick?ids=...` (so sánh nhanh qua query, nếu được hỗ trợ).
  - `GET /vehicle-compare/available` (danh sách variants có thể so sánh).
  - `POST /vehicle-compare/{variantId1}/vs/{variantId2}` (so sánh trực tiếp 2 xe).
  - `GET /vehicle-compare/criteria` (tiêu chí so sánh hỗ trợ).

### Chuỗi bước gợi ý khi so sánh
1) Lấy danh sách xe có thể so sánh: `GET /api/public/vehicle-compare/available`.
2) Lấy tiêu chí so sánh: `GET /api/public/vehicle-compare/criteria`.
3) Thực hiện so sánh:
   - Nhanh: `GET /api/public/vehicle-compare/quick?ids=<id1,id2,...>`; hoặc
   - Theo tiêu chí: `POST /api/public/vehicle-compare` với body gồm danh sách ID và tiêu chí.
4) (Tuỳ chọn) So sánh trực tiếp 2 xe: `POST /api/public/vehicle-compare/{variantId1}/vs/{variantId2}`.

## Checklist nhập liệu end-to-end (nội bộ) theo đúng thứ tự API
1) Danh mục xe:
   - POST Brand → POST Model → POST Variant → POST Color.
2) Tổ chức và kho:
   - POST Dealer → POST Warehouse.
3) Tồn kho:
   - POST VehicleInventory (cần `dealerId`, `warehouseId`, `variantId`, `colorId`).
4) Khách hàng và người dùng:
   - POST Customer (tránh trùng email/phone) → POST User (gán vào Dealer nếu cần).
5) Báo giá:
   - POST Quotation (tham chiếu `customerId`, `variantId`).
6) Đơn hàng:
   - POST Order (tham chiếu `quotationId`, `customerId`, `userId`, `inventoryId`).
7) Hợp đồng (nếu dùng public ký):
   - Tạo SalesContract nội bộ gắn với `orderId` (qua service/controller nội bộ nếu có), sau đó dùng Public Contract APIs để khách ký.
8) DealerOrder (nếu nghiệp vụ B2B):
   - POST DealerOrder (tham chiếu `dealerId`, `evmStaffUserId`, `variantId`, `colorId`).

## HTTP status & lỗi thường gặp theo nhóm API

### Mẫu lỗi chung
- Nhiều controller trả về lỗi dạng:
```json
{ "error": "Thông báo lỗi chi tiết" }
```
- Status hay dùng: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity` (nếu có validation chi tiết), `500 Internal Server Error`.

### Public Order `/api/public/orders`
- 201: tạo đơn thành công.
- 400: thiếu/không hợp lệ `quotationId`/`customerId`/`inventoryId`; inventory không available.
- 404: tham chiếu không tồn tại.
- 500: lỗi không xác định.

### Quotation `/api/quotations`
- 201: tạo báo giá thành công.
- 400: dữ liệu giá/thuế/discount không hợp lệ, hoặc thiếu quan hệ bắt buộc (`customerId`, `variantId`).
- 404: không tìm thấy bản ghi khi GET theo id/number.
- 500: lỗi server.

### Order `/api/orders`
- 201: tạo thành công (DTO hoặc legacy).
- 400: vi phạm ràng buộc, trạng thái không hợp lệ, inventory đã bán.
- 404: không tìm thấy khi cập nhật/xem.
- 409: `orderNumber` trùng (nếu service kiểm tra uniqueness).
- 500: lỗi server.

### Vehicle Creation From Existing `/api/vehicles/create-from-existing[-json]`
- 201: tạo variant + inventory thành công.
- 400: payload thiếu `existingBrandId`/`existingModelId`/`existingColorId`/`existingWarehouseId` hoặc `vin`/`variantName`.
- 404: id tham chiếu không tồn tại.
- 409: `vin` trùng.
- 500: lỗi server; phản hồi có `{ success:false, message, error }` theo controller.

### Vehicle Inventory quản trị `/api/vehicle-inventory`
- 200: cập nhật thành công.
- 204: xóa thành công.
- 400: trạng thái không hợp lệ (validate-status).
- 404: không tìm thấy inventoryId.
- 409: thay đổi trạng thái xung đột theo chính sách.
- 500: lỗi server.

### Public Contract `/api/public/contracts`
- 200: lấy hợp đồng/ trạng thái/ download info.
- 201: không áp dụng (chủ yếu GET/POST update trạng thái ký).
- 400: tham số ký/từ chối thiếu (`customerSignature`/`reason`).
- 404: `orderId`/`contractId` không tồn tại hoặc không có hợp đồng cho đơn.
- 500: lỗi server (PDF, ký, cập nhật hợp đồng).

### Dealer Payment `/api/dealer-payments`
- 200/201: xử lý thanh toán thành công; cập nhật trạng thái thành công.
- 400: số tiền âm/vượt quá, method không hỗ trợ, thiếu khóa ngoại.
- 404: `paymentId`/`orderId`/`dealerId` không tồn tại.
- 409: trạng thái không cho phép hoàn tiền/đã hoàn trước đó.
- 500: lỗi server.

### Public Payment `/api/public/payments`
- 201: tạo giao dịch thành công (khởi tạo cổng thanh toán).
- 400: thiếu `orderId`/`amount`/`method` hoặc `returnUrl` sai.
- 404: order không tồn tại.
- 409: đơn đã thanh toán đủ.
- 500: lỗi tích hợp cổng thanh toán.

### Public Appointment `/api/public/appointments`
- 201: tạo lịch thành công.
- 400: thời gian không hợp lệ/đụng lịch; thiếu thông tin liên hệ.
- 404: `variantId`/`inventoryId` không tồn tại.
- 500: lỗi server.

### Public Feedback `/api/public/feedbacks`
- 201: gửi phản hồi thành công.
- 400: thiếu `subject`/`message` hoặc định dạng email/phone sai.
- 404: `customerId` không tồn tại (nếu có truyền).
- 500: lỗi server.

### Vehicle Delivery `/api/vehicle-deliveries`
- 201: tạo delivery từ `dealerOrderId` thành công.
- 200: cập nhật/trạng thái/xác nhận thành công.
- 400: trạng thái chuyển không hợp lệ, thiếu tham số xác nhận.
- 404: `deliveryId`/`dealerOrderId` không tồn tại.
- 409: delivery đã xác nhận/đã hoàn tất không cho phép thay đổi.
- 500: lỗi server.


## Quick start cURL (chạy thử nhanh theo đúng luồng)

Lưu ý: thay thế BASE_URL, token, và các UUID phù hợp môi trường của bạn.

### 0) Đăng nhập (nếu API yêu cầu auth cho nội bộ)
```bash
curl -sS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"StrongPass#123"}'
# -> lấy token rồi export: export AUTH="Authorization: Bearer <JWT>"
```

### 1) Tạo danh mục cơ bản
```bash
# Brand
curl -sS -X POST "$BASE_URL/api/products/brands" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"brandName":"Tesla","isActive":true}'

# Model
curl -sS -X POST "$BASE_URL/api/products/models" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"brandId":1,"modelName":"Model 3","vehicleType":"Sedan","isActive":true}'

# Variant
curl -sS -X POST "$BASE_URL/api/products/variants" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"modelId":10,"variantName":"Long Range AWD","batteryKwh":82,"rangeKm":560,"msrp":52000,"isActive":true}'

# Color
curl -sS -X POST "$BASE_URL/api/products/colors" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"colorName":"Pearl White","hex":"#ffffff","isActive":true}'
```

### 2) Tạo Dealer, Warehouse
```bash
curl -sS -X POST "$BASE_URL/api/dealers" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"dealerCode":"DLR001","dealerName":"EV Dealer 1","email":"contact@dealer1.com","phone":"0900000001","dealerType":"authorized","status":"ACTIVE"}'

curl -sS -X POST "$BASE_URL/api/warehouses" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"warehouseName":"Main Warehouse","warehouseCode":"MAIN_WAREHOUSE","address":"Km12 EV Road","capacity":500,"isActive":true}'
```

### 3) Tạo Inventory
```bash
curl -sS -X POST "$BASE_URL/api/inventory" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"dealerId":"UUID_DEALER","warehouseId":"UUID_WAREHOUSE","variantId":"UUID_VARIANT","colorId":"UUID_COLOR","vin":"5YJ3E1EA7KF317000","stockStatus":"in_stock","price":52000,"discount":1000}'
```

### 4) Tạo Customer và User
```bash
curl -sS -X POST "$BASE_URL/api/customers" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"firstName":"An","lastName":"Nguyen","email":"an.nguyen@example.com","phone":"0912345678"}'

curl -sS -X POST "$BASE_URL/api/users/dto" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"username":"dealer.staff.01","email":"staff01@dealer1.com","password":"StrongPass#123","firstName":"Staff","lastName":"One","dealerId":"UUID_DEALER","userType":"DEALER_STAFF","status":"ACTIVE"}'
```

### 5) Tạo Quotation
```bash
curl -sS -X POST "$BASE_URL/api/quotations" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"customerId":"UUID_CUSTOMER","variantId":"UUID_VARIANT","basePrice":52000,"discount":1000,"tax":0.1,"validUntil":"2025-12-31"}'
```

### 6) Tạo Order (nội bộ hoặc public)
```bash
# Nội bộ
curl -sS -X POST "$BASE_URL/api/orders" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"orderNumber":"SO-2025-00001","quotationId":"UUID_QUOTATION","customerId":"UUID_CUSTOMER","userId":"UUID_USER","inventoryId":"UUID_INVENTORY","orderDate":"2025-10-30","status":"pending","orderType":"RETAIL","paymentStatus":"PENDING","deliveryStatus":"PENDING","fulfillmentStatus":"CREATED"}'

# Public (không cần token)
curl -sS -X POST "$BASE_URL/api/public/orders" -H "Content-Type: application/json" \
  -d '{"orderNumber":"SO-PUB-2025-00001","quotationId":"UUID_QUOTATION","customerId":"UUID_CUSTOMER","userId":"UUID_USER","inventoryId":"UUID_INVENTORY","orderDate":"2025-10-30","status":"pending","orderType":"RETAIL","paymentStatus":"PENDING","deliveryStatus":"PENDING","fulfillmentStatus":"CREATED"}'
```

### 7) Public Contract: xem, ký
```bash
# Lấy hợp đồng theo đơn
curl -sS "$BASE_URL/api/public/contracts/order/UUID_ORDER"

# Xem chi tiết hợp đồng
curl -sS "$BASE_URL/api/public/contracts/UUID_CONTRACT"

# Ký hợp đồng
curl -sS -X POST "$BASE_URL/api/public/contracts/UUID_CONTRACT/sign?customerSignature=SignedBy_AnNguyen&signatureMethod=electronic"
```

### (Tùy chọn) Tạo xe từ dữ liệu có sẵn (JSON)
```bash
curl -sS -X POST "$BASE_URL/api/vehicles/create-from-existing-json" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"existingBrandId":1,"existingModelId":10,"existingColorId":3,"existingWarehouseId":"UUID_WAREHOUSE","variant":{"variantName":"Long Range AWD","priceBase":52000},"inventory":{"vin":"5YJ3E1EA7KF317111","warehouseLocation":"Aisle A3","stockStatus":"in_stock","sellingPrice":51500}}'
```

### 8) Dealer Payment: thanh toán và hoàn tiền
```bash
# Xử lý thanh toán đại lý
curl -sS -X POST "$BASE_URL/api/dealer-payments/process-payment" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"dealerId":"UUID_DEALER","orderId":"UUID_DEALER_ORDER","amount":250000.0,"currency":"VND","method":"BANK_TRANSFER","reference":"TXN-2025-10-30-001","notes":"Thanh toán đợt 1"}'

# Hoàn tiền
curl -sS -X POST "$BASE_URL/api/dealer-payments/refund/UUID_PAYMENT" -H "$AUTH" \
  -d 'reason=Điều chỉnh số lượng'
```

### 9) Public Payment: thanh toán khách vãng lai
```bash
curl -sS -X POST "$BASE_URL/api/public/payments" -H "Content-Type: application/json" \
  -d '{"orderId":"UUID_ORDER","amount":51500.0,"currency":"USD","method":"CARD","cardLast4":"4242","returnUrl":"https://your-frontend/checkout/result"}'
```

### 10) Vehicle Delivery: tạo từ DealerOrder và xác nhận
```bash
# Tạo giao hàng từ DealerOrder
curl -sS -X POST "$BASE_URL/api/vehicle-deliveries/dealer-order/UUID_DEALER_ORDER" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"scheduledDate":"2025-11-10","notes":"Giao tại kho miền Nam"}'

# Cập nhật trạng thái giao hàng
curl -sS -X PUT "$BASE_URL/api/vehicle-deliveries/UUID_DELIVERY/status?status=shipped" -H "$AUTH"

# Xác nhận giao bởi nội bộ
curl -sS -X PUT "$BASE_URL/api/vehicle-deliveries/UUID_DELIVERY/confirm" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"userId":"UUID_STAFF"}'

# Đại lý xác nhận đã nhận
curl -sS -X PUT "$BASE_URL/api/vehicle-deliveries/UUID_DELIVERY/dealer-confirm" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"receivedBy":"dealer.manager@dealer.com","receivedDate":"2025-11-12"}'
```

### 11) Upload ảnh (multipart)
```bash
curl -sS -X POST "$BASE_URL/api/images/upload" -H "$AUTH" \
  -F "file=@./car.jpg" \
  -F "entityType=inventory" \
  -F "entityId=UUID_INVENTORY" \
  -F "altText=Ảnh chính diện"
```

### 12) Inventory: đổi trạng thái, normalize và validate
```bash
# Đổi trạng thái inventory
curl -sS -X PUT "$BASE_URL/api/vehicle-inventory/UUID_INVENTORY/status?status=reserved" -H "$AUTH"

# Chuẩn hóa tất cả trạng thái (sửa lỗi hoa/thường...)
curl -sS -X POST "$BASE_URL/api/vehicle-inventory/normalize-statuses" -H "$AUTH"

# Kiểm tra giá trị trạng thái hợp lệ
curl -sS -X POST "$BASE_URL/api/vehicle-inventory/validate-status" -H "$AUTH" \
  -d "status=available"
```

### 13) User: đặt lại mật khẩu (3 cách)
```bash
# Theo userId
curl -sS -X POST "$BASE_URL/api/users/UUID_USER/reset-password" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"newPassword":"NewStrong#456"}'

# Theo username
curl -sS -X POST "$BASE_URL/api/users/username/dealer.staff.01/reset-password" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"newPassword":"NewStrong#456"}'

# Theo email
curl -sS -X POST "$BASE_URL/api/users/email/staff01@dealer1.com/reset-password" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"newPassword":"NewStrong#456"}'
```

### 14) Public Appointment & Feedback (cURL)
```bash
# Đặt lịch
curl -sS -X POST "$BASE_URL/api/public/appointments" -H "Content-Type: application/json" \
  -d '{"customerName":"An Nguyen","email":"an.nguyen@example.com","phone":"0912345678","variantId":123,"inventoryId":"UUID_INVENTORY","preferredDateTime":"2025-11-05T10:00:00","notes":"Muốn lái thử trong khu vực quận 1"}'

# Gửi phản hồi
curl -sS -X POST "$BASE_URL/api/public/feedbacks" -H "Content-Type: application/json" \
  -d '{"subject":"Trải nghiệm lái thử","message":"Nhân viên hỗ trợ rất tốt, xe vận hành êm ái.","rating":5,"customerId":"UUID_CUSTOMER","contactEmail":"an.nguyen@example.com"}'
```

### 15) Public Contract: kiểm tra trạng thái nhanh
```bash
curl -sS "$BASE_URL/api/public/contracts/UUID_CONTRACT/status"
```

### 16) Cập nhật Dealer, Quotation, Order (PUT)
```bash
# Dealer: cập nhật thông tin cơ bản
curl -sS -X PUT "$BASE_URL/api/dealers/UUID_DEALER" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"dealerName":"EV Dealer 1 - CN Q1","phone":"0900000099","status":"ACTIVE"}'

# Quotation: cập nhật giảm giá/ghi chú
curl -sS -X PUT "$BASE_URL/api/quotations/UUID_QUOTATION" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"discount":1500,"notes":"Update theo CTKM 11/2025"}'

# Order: cập nhật trạng thái đơn
curl -sS -X PUT "$BASE_URL/api/orders/UUID_ORDER/status?status=CONFIRMED" -H "$AUTH"
```

## Troubleshooting nhanh
- 400 Bad Request: kiểm tra thiếu field, sai kiểu dữ liệu (số/UUID/ngày ISO), trạng thái không hợp lệ.
- 404 Not Found: xác thực các ID tham chiếu đã tồn tại; gọi GET trước khi PUT/POST.
- 409 Conflict: mã/số hiệu trùng (`orderNumber`, `vin`), hoặc trạng thái chuyển không cho phép.
- 401/403: thiếu hoặc sai token; thêm header `Authorization: Bearer <JWT>`.
- 500: xem message trả về; kiểm tra log server, dữ liệu ràng buộc liên quan (FK) và thứ tự tạo dữ liệu.

## Tài liệu tham chiếu cho FE (giảm sai sót khi tích hợp)

### 1) Enum/constant hợp lệ (đưa lên FE làm select options)
- Inventory.status: `available`, `in_stock`, `reserved`, `sold`, `transit`, `maintenance` (tuỳ hệ thống; dùng API: `/api/vehicle-inventory/status-options` để lấy danh sách chính thức khi có).
- Order.status: `pending`, `confirmed`, `processing`, `completed`, `cancelled`.
- Order.paymentStatus: `PENDING`, `PARTIAL`, `PAID`, `REFUNDED`, `FAILED`.
- Order.deliveryStatus: `PENDING`, `SCHEDULED`, `SHIPPED`, `DELIVERED`, `RETURNED`.
- DealerOrder.status: `pending`, `approved`, `shipped`, `delivered`, `cancelled`.
- Delivery.deliveryStatus: `scheduled`, `shipped`, `delivered`, `cancelled`, `overdue`.
- User.userType: `ADMIN`, `EVM_STAFF`, `DEALER_STAFF`, `CUSTOMER_SUPPORT`.
- User.status: `ACTIVE`, `INACTIVE`, `LOCKED`.

Khuyến nghị: FE gọi các endpoint liệt kê options nếu có (vd: `/api/vehicle-inventory/status-options`) để đồng bộ giá trị hợp lệ.

### 2) Quy tắc dữ liệu/validation tối thiểu
- Email: RFC 5322 đơn giản, duy nhất cho `Customer`/`User` nếu dùng làm định danh mềm.
- Phone: chỉ số, độ dài 9-15; chuẩn hóa ký tự `+` nếu có.
- Ngày: ISO `YYYY-MM-DD`; DateTime: `YYYY-MM-DDTHH:mm:ss` (hoặc `HH:mm` nếu chỉ giờ).
- Số tiền: gửi kiểu số; không dùng chuỗi có dấu `,`.
- Unique: `dealerCode`, `orderNumber`, `vin`, `username`, `email` (User) nên kiểm tra trước khi submit (call GET).
- Ràng buộc tham chiếu: các `UUID_*` phải tồn tại; tạo cha trước con.

### 3) Trường bắt buộc theo DTO chính
- QuotationRequest: `customerId`, `variantId`, `basePrice`; optional: `discount`, `tax`, `validUntil`, `notes`.
- OrderRequest: `orderNumber`, `quotationId`, `customerId`, `userId`, `inventoryId`, `orderDate`; các trạng thái có default nếu không gửi.
- CreateVehicleFromExistingRequest (JSON): `existingBrandId`, `existingModelId`, `existingColorId`, `existingWarehouseId`, `variant.variantName`, `inventory.vin`; giá trị khác optional có default.
- Public Customer: `firstName`, `lastName`, `email` hoặc `phone`.
- VehicleDelivery: `orderId`, `inventoryId`, `customerId`, `deliveryDate`, `deliveryAddress`.

### 4) Quy ước phân trang/sắp xếp/lọc
- Phân trang chuẩn Spring: `page` (0-based), `size`, `sort` dạng `field,asc|desc`. Ví dụ: `?page=0&size=20&sort=orderDate,desc`.
- Bộ lọc ngày: `startDate`, `endDate` ISO; hoặc `date` đơn lẻ cho 1 ngày.
- Bộ lọc status: dùng giá trị enum hợp lệ (chữ hoa/thường theo controller cụ thể). Nếu có `validate-status` thì gọi trước.

### 5) Mẫu response thành công (list + pagination)
```json
{
  "content": [
    { "orderId": "UUID", "orderNumber": "SO-2025-00001", "status": "pending", "totalAmount": 51500 },
    { "orderId": "UUID", "orderNumber": "SO-2025-00002", "status": "confirmed", "totalAmount": 53000 }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 124,
  "totalPages": 7,
  "sortedBy": "orderDate,desc"
}
```

Nếu API không hỗ trợ phân trang, list trả về mảng thuần `[]`.

### 6) Mẫu response lỗi chuẩn hóa
```json
{ "error": "Validation failed: email already exists" }
```
Nên giữ dạng `{ error: string }` hoặc `{ success:false, message:"..." }` để FE hiển thị thống nhất.

### 7) Ví dụ luồng FE tạo đơn bán lẻ tối ưu (giảm lỗi)
1) FE dùng public catalog để chọn brand/model/variant, gọi `GET /api/public/vehicle-variants/{variantId}`.
2) FE gọi `GET /api/public/vehicle-inventory/status/available` để chọn xe còn hàng.
3) FE tạo public customer nếu chưa có: `POST /api/public/customers` (nhận `customerId`).
4) FE tạo Quotation: `POST /api/quotations` với `customerId`, `variantId`, giá.
5) FE tạo Order: `POST /api/public/orders` với `quotationId`, `customerId`, `inventoryId`.
6) FE hiển thị hợp đồng: `GET /api/public/contracts/order/{orderId}` rồi ký `POST /{contractId}/sign`.
7) FE thanh toán public nếu có: `POST /api/public/payments` với `orderId`, số tiền.

### 8) Ví dụ luồng FE tạo xe nhanh từ dữ liệu có sẵn
1) FE tra cứu ids: brand/model/color/warehouse (GET từ danh mục/kho).
2) FE gửi `POST /api/vehicles/create-from-existing-json` với các id và `vin`.
3) FE nhận response gồm `variant` và `inventory` mới → điều hướng đến trang chi tiết inventory.

### 9) Public delivery tracking (nếu FE theo dõi giao xe)
- `GET /api/public/deliveries/order/{orderId}`
- `GET /api/public/deliveries/order-number/{orderNumber}`
- `GET /api/public/deliveries/date?date=YYYY-MM-DD`

### 10) Walk-in purchases reports (tham khảo)
- `GET /api/reports/walk-in-purchases`
- `GET /api/reports/walk-in-purchases?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&status=CONFIRMED`
- `GET /api/reports/walk-in-purchases/paged?page=0&size=20&sort=orderDate,desc`
- `GET /api/reports/walk-in-purchases/paged?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&status=CONFIRMED&page=0&size=50&sort=totalAmount,asc`

## Tích hợp FE với React + JavaScript (AJV + react-hook-form)

### Cài đặt
```bash
npm i ajv ajv-formats react-hook-form @hookform/resolvers
```

### Validate dữ liệu bằng AJV với schema bundle
```js
// ajvValidate.js
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schemas/dto.schema.json'; // đảm bảo FE có thể truy cập file này (copy sang FE)

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Lấy schema con theo $defs
export const getValidator = (defName) => {
  const defSchema = { $ref: `#/\$defs/${defName}` };
  return ajv.compile({ ...schema, $ref: defSchema.$ref });
};

// Ví dụ dùng cho OrderRequest
export function validateOrder(orderPayload) {
  const validate = getValidator('OrderRequest');
  const ok = validate(orderPayload);
  return { ok, errors: validate.errors || [] };
}
```

### Dùng react-hook-form + ajvResolver
```js
// OrderForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schemas/dto.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const orderSchema = { ...schema, $ref: '#/$defs/OrderRequest' };

export default function OrderForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: ajvResolver(orderSchema, { ajvInstance: ajv }),
    defaultValues: {
      orderType: 'RETAIL',
      paymentStatus: 'PENDING',
      deliveryStatus: 'PENDING',
      fulfillmentStatus: 'CREATED',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Order Number" {...register('orderNumber')} />
      {errors.orderNumber && <small>{errors.orderNumber.message}</small>}

      <input placeholder="Quotation ID" {...register('quotationId')} />
      <input placeholder="Customer ID" {...register('customerId')} />
      <input placeholder="User ID" {...register('userId')} />
      <input placeholder="Inventory ID" {...register('inventoryId')} />
      <input placeholder="Order Date (YYYY-MM-DD)" {...register('orderDate')} />

      <button type="submit" disabled={isSubmitting}>Create Order</button>
    </form>
  );
}
```

### API client helper (fetch với JSON và xử lý lỗi chuẩn)
```js
// apiClient.js
export async function apiFetch(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = data?.error || data?.message || res.statusText;
    throw new Error(message);
  }
  return data;
}

// Ví dụ tạo Public Customer rồi tạo Public Order
export async function createPublicCustomer(baseUrl, payload) {
  return apiFetch(`${baseUrl}/api/public/customers`, { method: 'POST', body: payload });
}

export async function createPublicOrder(baseUrl, payload) {
  return apiFetch(`${baseUrl}/api/public/orders`, { method: 'POST', body: payload });
}
```

### Quy trình FE gợi ý trước khi submit
- Validate bằng AJV phía client theo schema tương ứng.
- Gọi API tra cứu tránh trùng (vd: kiểm tra `orderNumber`, `vin`).
- Chuẩn hóa ngày sang `YYYY-MM-DD` trước khi gửi.
- Bắt lỗi từ `{ error: string }` và hiển thị toast/inline.

### Ví dụ QuotationForm (React) dùng AJV
```js
// QuotationForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schemas/dto.schema.json';
import { apiFetch } from './apiClient';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const quotationSchema = { ...schema, $ref: '#/$defs/QuotationRequest' };

export default function QuotationForm({ baseUrl, onCreated }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: ajvResolver(quotationSchema, { ajvInstance: ajv }),
  });

  const onSubmit = async (values) => {
    const created = await apiFetch(`${baseUrl}/api/quotations`, { method: 'POST', body: values });
    onCreated?.(created);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Customer ID" {...register('customerId')} />
      {errors.customerId && <small>{errors.customerId.message}</small>}

      <input placeholder="Variant ID" {...register('variantId')} />
      <input placeholder="Base Price" type="number" step="0.01" {...register('basePrice')} />
      <input placeholder="Discount" type="number" step="0.01" {...register('discount')} />
      <input placeholder="Tax" type="number" step="0.01" {...register('tax')} />
      <input placeholder="Valid Until (YYYY-MM-DD)" {...register('validUntil')} />
      <textarea placeholder="Notes" {...register('notes')} />

      <button type="submit" disabled={isSubmitting}>Create Quotation</button>
    </form>
  );
}
```

### Ví dụ CreateFromExistingForm (React) tối giản
```js
// CreateFromExistingForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { apiFetch } from './apiClient';

export default function CreateFromExistingForm({ baseUrl, token, onCreated }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      variant: { variantName: '' },
      inventory: { vin: '' }
    }
  });

  const onSubmit = async (values) => {
    const created = await apiFetch(`${baseUrl}/api/vehicles/create-from-existing-json`, {
      method: 'POST',
      token,
      body: values,
    });
    onCreated?.(created);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Brand ID" type="number" {...register('existingBrandId', { valueAsNumber: true })} />
      <input placeholder="Model ID" type="number" {...register('existingModelId', { valueAsNumber: true })} />
      <input placeholder="Color ID" type="number" {...register('existingColorId', { valueAsNumber: true })} />
      <input placeholder="Warehouse ID (UUID)" {...register('existingWarehouseId')} />
      <input placeholder="Variant Name" {...register('variant.variantName')} />
      <input placeholder="VIN" {...register('inventory.vin')} />
      <input placeholder="Selling Price" type="number" step="0.01" {...register('inventory.sellingPrice', { valueAsNumber: true })} />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Auth Token Context và hook API
```js
// AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  return <AuthCtx.Provider value={{ token, setToken }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

// useApi.js
import { useAuth } from './AuthContext';
import { apiFetch } from './apiClient';
export function useApi(baseUrl) {
  const { token } = useAuth();
  return {
    get: (p) => apiFetch(`${baseUrl}${p}` , { token }),
    post: (p, body) => apiFetch(`${baseUrl}${p}`, { method: 'POST', token, body }),
    put: (p, body) => apiFetch(`${baseUrl}${p}`, { method: 'PUT', token, body }),
    del: (p) => apiFetch(`${baseUrl}${p}`, { method: 'DELETE', token })
  };
}
```

### PublicOrderForm.jsx (không cần đăng nhập)
```js
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schemas/dto.schema.json';
import { apiFetch } from './apiClient';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const orderSchema = { ...schema, $ref: '#/$defs/OrderRequest' };

export default function PublicOrderForm({ baseUrl, onCreated }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: ajvResolver(orderSchema, { ajvInstance: ajv }),
  });
  const onSubmit = async (values) => {
    const created = await apiFetch(`${baseUrl}/api/public/orders`, { method: 'POST', body: values });
    onCreated?.(created);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Order Number" {...register('orderNumber')} />
      <input placeholder="Quotation ID" {...register('quotationId')} />
      <input placeholder="Customer ID" {...register('customerId')} />
      <input placeholder="User ID" {...register('userId')} />
      <input placeholder="Inventory ID" {...register('inventoryId')} />
      <input placeholder="Order Date (YYYY-MM-DD)" {...register('orderDate')} />
      {errors.orderNumber && <small>{errors.orderNumber.message}</small>}
      <button type="submit" disabled={isSubmitting}>Create Public Order</button>
    </form>
  );
}
```

### DeliveryTrackingList.jsx (public tracking)
```js
import React, { useEffect, useState } from 'react';
import { apiFetch } from './apiClient';

export default function DeliveryTrackingList({ baseUrl, orderId, orderNumber, date }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        let url = null;
        if (orderId) url = `${baseUrl}/api/public/deliveries/order/${orderId}`;
        else if (orderNumber) url = `${baseUrl}/api/public/deliveries/order-number/${orderNumber}`;
        else if (date) url = `${baseUrl}/api/public/deliveries/date?date=${encodeURIComponent(date)}`;
        if (!url) return;
        const data = await apiFetch(url);
        setItems(Array.isArray(data) ? data : (data?.content || []));
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
    })();
  }, [baseUrl, orderId, orderNumber, date]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!items.length) return <p>No deliveries found.</p>;
  return (
    <ul>
      {items.map(d => (
        <li key={d.deliveryId}>
          {d.deliveryDate} - {d.deliveryStatus} - {d.deliveryAddress}
        </li>
      ))}
    </ul>
  );
}
```

### PublicCustomerForm.jsx (tạo hồ sơ khách nhanh - public)
```js
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schemas/dto.schema.json';
import { apiFetch } from './apiClient';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const publicCustomerSchema = { ...schema, $ref: '#/$defs/PublicCustomerRequest' };

export default function PublicCustomerForm({ baseUrl, onCreated }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: ajvResolver(publicCustomerSchema, { ajvInstance: ajv }),
  });
  const onSubmit = async (values) => {
    const created = await apiFetch(`${baseUrl}/api/public/customers`, { method: 'POST', body: values });
    onCreated?.(created);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="First name" {...register('firstName')} />
      <input placeholder="Last name" {...register('lastName')} />
      <input placeholder="Email" type="email" {...register('email')} />
      <input placeholder="Phone" {...register('phone')} />
      {(errors.email || errors.phone) && <small>Nhập email hoặc phone hợp lệ</small>}
      <button type="submit" disabled={isSubmitting}>Create Customer</button>
    </form>
  );
}
```

### DealerPaymentForm.jsx (B2B - process payment)
```js
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schemas/dto.schema.json';
import { useApi } from './useApi';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const dealerPaymentSchema = { ...schema, $ref: '#/$defs/DealerPaymentProcessRequest' };

export default function DealerPaymentForm({ baseUrl, onProcessed }) {
  const api = useApi(baseUrl);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: ajvResolver(dealerPaymentSchema, { ajvInstance: ajv }),
    defaultValues: { currency: 'VND', method: 'BANK_TRANSFER' }
  });
  const onSubmit = async (values) => {
    const res = await api.post('/api/dealer-payments/process-payment', values);
    onProcessed?.(res);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Dealer ID" {...register('dealerId')} />
      <input placeholder="Dealer Order ID" {...register('orderId')} />
      <input placeholder="Amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
      <select {...register('method')}>
        <option value="BANK_TRANSFER">BANK_TRANSFER</option>
        <option value="CASH">CASH</option>
        <option value="CARD">CARD</option>
      </select>
      <input placeholder="Currency" {...register('currency')} />
      <input placeholder="Reference" {...register('reference')} />
      <input placeholder="Notes" {...register('notes')} />
      {errors.amount && <small>Số tiền không hợp lệ</small>}
      <button type="submit" disabled={isSubmitting}>Process Payment</button>
    </form>
  );
}
```

### WalkInPurchasesList.jsx (paged + sort)
```js
import React, { useEffect, useState } from 'react';
import { apiFetch } from './apiClient';

export default function WalkInPurchasesList({ baseUrl }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState('orderDate,desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams({ page, size, sort });
      if (startDate) qs.set('startDate', startDate);
      if (endDate) qs.set('endDate', endDate);
      if (status) qs.set('status', status);
      const url = `${baseUrl}/api/reports/walk-in-purchases/paged?${qs.toString()}`;
      const data = await apiFetch(url);
      const list = Array.isArray(data) ? data : (data.content || []);
      setItems(list);
      setTotal(data.totalElements ?? list.length);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); // eslint-disable-next-line
  }, [page, size, sort]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PENDING">PENDING</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <button onClick={() => { setPage(0); fetchData(); }}>Filter</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <label>Page: <input type="number" value={page} onChange={e => setPage(Number(e.target.value)||0)} /></label>
        <label>Size: <input type="number" value={size} onChange={e => setSize(Number(e.target.value)||20)} /></label>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="orderDate,desc">orderDate,desc</option>
          <option value="orderDate,asc">orderDate,asc</option>
          <option value="totalAmount,desc">totalAmount,desc</option>
          <option value="totalAmount,asc">totalAmount,asc</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table width="100%" border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map(o => (
            <tr key={o.orderId}>
              <td>{o.orderNumber}</td>
              <td>{o.orderDate}</td>
              <td>{o.status}</td>
              <td>{o.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total: {total}</p>
    </div>
  );
}
```

### InventoryStatusForm.jsx (cập nhật trạng thái inventory)
```js
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';
import Ajv from 'ajv';
import schema from '../schemas/dto.schema.json';
import { useApi } from './useApi';

const ajv = new Ajv({ allErrors: true, strict: false });
const statusSchema = { ...schema, $ref: '#/$defs/InventoryStatusUpdateRequest' };

export default function InventoryStatusForm({ baseUrl, inventoryId, onUpdated }) {
  const api = useApi(baseUrl);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: ajvResolver(statusSchema, { ajvInstance: ajv }),
    defaultValues: { status: 'reserved' }
  });
  const onSubmit = async (values) => {
    // Option A: body PUT (nếu controller nhận body)
    try {
      const res = await api.put(`/api/vehicle-inventory/${inventoryId}/status?status=${encodeURIComponent(values.status)}`);
      onUpdated?.(res);
    } catch (e) { alert(e.message); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register('status')}>
        <option value="available">available</option>
        <option value="reserved">reserved</option>
        <option value="sold">sold</option>
      </select>
      {errors.status && <small>{errors.status.message}</small>}
      <button type="submit" disabled={isSubmitting}>Update Status</button>
    </form>
  );
}
```

### PublicPaymentForm.jsx (khách vãng lai thanh toán)
```js
import React from 'react';
import { useForm } from 'react-hook-form';
import { ajvResolver } from '@hookform/resolvers/ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schemas/dto.schema.json';
import { apiFetch } from './apiClient';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const paymentSchema = { ...schema, $ref: '#/$defs/PublicPaymentRequest' };

export default function PublicPaymentForm({ baseUrl, defaultOrderId, onPaid }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: ajvResolver(paymentSchema, { ajvInstance: ajv }),
    defaultValues: { orderId: defaultOrderId, currency: 'USD', method: 'CARD' }
  });
  const onSubmit = async (values) => {
    const res = await apiFetch(`${baseUrl}/api/public/payments`, { method: 'POST', body: values });
    onPaid?.(res);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Order ID" {...register('orderId')} />
      <input placeholder="Amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
      <input placeholder="Currency" {...register('currency')} />
      <select {...register('method')}>
        <option value="CARD">CARD</option>
        <option value="BANK_TRANSFER">BANK_TRANSFER</option>
        <option value="CASH">CASH</option>
        <option value="WALLET">WALLET</option>
      </select>
      <input placeholder="Card last4" {...register('cardLast4')} />
      <input placeholder="Return URL" {...register('returnUrl')} />
      {(errors.amount || errors.orderId) && <small>Kiểm tra số tiền và Order ID</small>}
      <button type="submit" disabled={isSubmitting}>Pay</button>
    </form>
  );
}
```

### PublicContractSign.jsx (ký hợp đồng công khai)
```js
import React, { useState } from 'react';
import { apiFetch } from './apiClient';

export default function PublicContractSign({ baseUrl, contractId }) {
  const [signature, setSignature] = useState('Signed by Customer');
  const [method, setMethod] = useState('electronic');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const sign = async () => {
    try {
      setError(null);
      const url = `${baseUrl}/api/public/contracts/${contractId}/sign?customerSignature=${encodeURIComponent(signature)}&signatureMethod=${encodeURIComponent(method)}`;
      const res = await apiFetch(url, { method: 'POST' });
      setStatus(res);
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <input value={signature} onChange={e => setSignature(e.target.value)} />
      <select value={method} onChange={e => setMethod(e.target.value)}>
        <option value="electronic">electronic</option>
        <option value="handwritten">handwritten</option>
      </select>
      <button onClick={sign}>Sign Contract</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {status && <pre>{JSON.stringify(status, null, 2)}</pre>}
    </div>
  );
}
```

### QuotationList.jsx (lọc theo ngày, số báo giá, paging)
```js
import React, { useEffect, useState } from 'react';
import { apiFetch } from './apiClient';

export default function QuotationList({ baseUrl }) {
  const [items, setItems] = useState([]);
  const [number, setNumber] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      let url = `${baseUrl}/api/quotations`;
      if (number) url = `${baseUrl}/api/quotations/number/${encodeURIComponent(number)}`;
      else if (start && end) url = `${baseUrl}/api/quotations/date-range?startDate=${start}&endDate=${end}`;
      const data = await apiFetch(url);
      setItems(Array.isArray(data) ? data : (data?.content || []));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input placeholder="Quotation Number" value={number} onChange={e => setNumber(e.target.value)} />
        <input type="date" value={start} onChange={e => setStart(e.target.value)} />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} />
        <button onClick={load}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items.map(q => (
          <li key={q.quotationId}>{q.quotationNumber} - {q.basePrice} - {q.validUntil}</li>
        ))}
      </ul>
    </div>
  );
}
```

### VehicleCompareWidget.jsx (so sánh nhanh 2 xe)
```js
import React, { useState } from 'react';
import { apiFetch } from './apiClient';

export default function VehicleCompareWidget({ baseUrl }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const compare = async () => {
    try {
      setError(null); setResult(null);
      const data = await apiFetch(`${baseUrl}/api/public/vehicle-compare/${a}/vs/${b}`, { method: 'POST' });
      setResult(data);
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <input placeholder="Variant ID A" value={a} onChange={e => setA(e.target.value)} />
      <input placeholder="Variant ID B" value={b} onChange={e => setB(e.target.value)} />
      <button onClick={compare} disabled={!a || !b}>Compare</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### OrderStatusBoard.jsx (bảng theo dõi đơn theo trạng thái)
```js
import React, { useEffect, useState } from 'react';
import { apiFetch } from './apiClient';

const STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

export default function OrderStatusBoard({ baseUrl }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const entries = await Promise.all(
          STATUSES.map(async s => {
            const list = await apiFetch(`${baseUrl}/api/orders/status/${s}`);
            return [s, Array.isArray(list) ? list : (list?.content || [])];
          })
        );
        setData(Object.fromEntries(entries));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [baseUrl]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {STATUSES.map(s => (
        <div key={s} style={{ border: '1px solid #ddd', padding: 12 }}>
          <h4 style={{ marginTop: 0, textTransform: 'capitalize' }}>{s}</h4>
          <ul>
            {(data[s] || []).slice(0, 10).map(o => (
              <li key={o.orderId}>{o.orderNumber} - {o.orderDate} - {o.totalAmount}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### DealerDeliveriesBoard.jsx (giao hàng theo đại lý)
```js
import React, { useEffect, useState } from 'react';
import { apiFetch } from './apiClient';

export default function DealerDeliveriesBoard({ baseUrl, dealerId }) {
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState([]);
  const [status, setStatus] = useState('SCHEDULED');
  const [byStatus, setByStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dealerId) return;
    (async () => {
      setLoading(true); setError(null);
      try {
        const [sum, pend, stat] = await Promise.all([
          apiFetch(`${baseUrl}/api/vehicle-deliveries/dealer/${dealerId}/summary`),
          apiFetch(`${baseUrl}/api/vehicle-deliveries/dealer/${dealerId}/pending`),
          apiFetch(`${baseUrl}/api/vehicle-deliveries/dealer/${dealerId}/status/${encodeURIComponent(status)}`),
        ]);
        setSummary(sum);
        setPending(Array.isArray(pend) ? pend : (pend?.content || []));
        setByStatus(Array.isArray(stat) ? stat : (stat?.content || []));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [baseUrl, dealerId, status]);

  if (!dealerId) return <p>Chọn Dealer trước.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ border: '1px solid #ddd', padding: 12 }}>
        <h4 style={{ marginTop: 0 }}>Summary</h4>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(summary, null, 2)}</pre>
      </div>
      <div style={{ border: '1px solid #ddd', padding: 12 }}>
        <h4 style={{ marginTop: 0 }}>Pending</h4>
        <ul>
          {pending.map(d => (
            <li key={d.deliveryId}>{d.deliveryDate} - {d.deliveryStatus} - {d.deliveryAddress}</li>
          ))}
        </ul>
      </div>
      <div style={{ gridColumn: '1 / span 2', border: '1px solid #ddd', padding: 12 }}>
        <h4 style={{ marginTop: 0 }}>By Status</h4>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <ul>
          {byStatus.map(d => (
            <li key={d.deliveryId}>{d.deliveryDate} - {d.deliveryStatus} - {d.deliveryAddress}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## Phụ lục cho FE: cấu hình, skeleton, error boundary

### Cấu hình BASE_URL và đưa schema vào FE
```bash
# .env
REACT_APP_API_BASE_URL=http://localhost:8080
```

```js
// config.js
export const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
```

- Cách đưa `schemas/` sang FE: copy folder `schemas/` vào thư mục FE (ví dụ `src/schemas/`) hoặc serve tĩnh từ BE và tải runtime (khuyến nghị copy build-time để không phụ thuộc mạng).

### Skeleton component đơn giản
```js
// Skeleton.js
import React from 'react';
export default function Skeleton({ rows = 3 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height: 14, background: '#eee', margin: '8px 0', borderRadius: 4 }} />
      ))}
    </div>
  );
}
```

### ErrorBoundary tối giản
```js
// ErrorBoundary.jsx
import React from 'react';
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Boundary caught', error, info); }
  render() {
    if (this.state.hasError) return <div style={{ color: 'red' }}>Có lỗi xảy ra: {String(this.state.error)}</div>;
    return this.props.children;
  }
}
```

### Mẫu kết hợp Skeleton + ErrorBoundary + useApi
```js
// OrdersLatest.jsx
import React, { useEffect, useState } from 'react';
import Skeleton from './Skeleton';
import { useApi } from './useApi';

export default function OrdersLatest({ baseUrl }) {
  const api = useApi(baseUrl);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    (async () => {
      try { setItems(await api.get('/api/orders?size=10&sort=orderDate,desc')); }
      catch (e) { setError(e.message); }
    })();
  }, [api]);
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!items) return <Skeleton rows={6} />;
  const list = Array.isArray(items) ? items : (items.content || []);
  return (
    <ul>{list.map(o => <li key={o.orderId}>{o.orderNumber} - {o.orderDate}</li>)}</ul>
  );
}
```

### Thêm Toast/Notification đơn giản
```js
// useToast.js
import { useCallback, useState } from 'react';
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((type, message) => {
    const id = Date.now();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, push };
}

// Toasts.jsx
import React from 'react';
export function Toasts({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, display: 'grid', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === 'error' ? '#ffe5e5' : '#e5ffe5', padding: 12, borderRadius: 6 }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
```

### Interceptor refresh token (tùy chọn)
```js
// authApiClient.js
let refreshing = null;

async function refreshToken(baseUrl, refreshToken) {
  const res = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json(); // { accessToken, refreshToken }
}

export async function apiFetchWithRefresh(baseUrl, path, { method = 'GET', accessToken, refreshToken: rt, body } = {}) {
  const doFetch = async (token) => fetch(`${baseUrl}${path}` , {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });

  let res = await doFetch(accessToken);
  if (res.status !== 401) {
    const data = await (res.headers.get('content-type')||'').includes('application/json') ? res.json() : res.text();
    if (!res.ok) throw new Error(data?.error || data?.message || res.statusText);
    return data;
  }
  // 401 -> try refresh once
  if (!rt) throw new Error('Unauthorized');
  if (!refreshing) refreshing = refreshToken(baseUrl, rt).finally(() => { refreshing = null; });
  const tokens = await refreshing; // { accessToken, refreshToken }
  res = await doFetch(tokens.accessToken);
  const data = await (res.headers.get('content-type')||'').includes('application/json') ? res.json() : res.text();
  if (!res.ok) throw new Error(data?.error || data?.message || res.statusText);
  return { data, tokens };
}
```

### Nâng cấp AuthContext + useApi để tự refresh token
```js
// AuthContext.jsx (nâng cấp)
import React, { createContext, useContext, useMemo, useState } from 'react';
export const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const value = useMemo(() => ({ accessToken, refreshToken, setAccessToken, setRefreshToken }), [accessToken, refreshToken]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

// useApi.js (nâng cấp)
import { useAuth } from './AuthContext';
import { apiFetchWithRefresh } from './authApiClient';
export function useApi(baseUrl) {
  const { accessToken, refreshToken, setAccessToken, setRefreshToken } = useAuth();
  const wrap = async (path, opts) => {
    const res = await apiFetchWithRefresh(baseUrl, path, { ...opts, accessToken, refreshToken });
    if (res && res.tokens) {
      setAccessToken(res.tokens.accessToken);
      if (res.tokens.refreshToken) setRefreshToken(res.tokens.refreshToken);
      return res.data;
    }
    return res;
  };
  return {
    get: (p) => wrap(p, {}),
    post: (p, body) => wrap(p, { method: 'POST', body }),
    put: (p, body) => wrap(p, { method: 'PUT', body }),
    del: (p) => wrap(p, { method: 'DELETE' })
  };
}
```

### LoginForm.jsx (nhận accessToken/refreshToken và set vào context)
```js
import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from './AuthContext';
import { apiFetch } from './apiClient';

export default function LoginForm({ baseUrl, onLoggedIn }) {
  const { setAccessToken, setRefreshToken } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    // Backend cần trả về { accessToken, refreshToken }
    const res = await apiFetch(`${baseUrl}/api/auth/login`, { method: 'POST', body: values });
    if (res.accessToken) setAccessToken(res.accessToken);
    if (res.refreshToken) setRefreshToken(res.refreshToken);
    onLoggedIn?.(res);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Username" {...register('username')} />
      <input placeholder="Password" type="password" {...register('password')} />
      <button type="submit" disabled={isSubmitting}>Login</button>
    </form>
  );
}
```

### Lưu token vào localStorage và bootstrap vào AuthContext khi app khởi động
```js
// AuthContext.jsx (bổ sung persistence)
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
export const AuthCtx = createContext(null);
const LS_ACCESS = 'evdm_access_token';
const LS_REFRESH = 'evdm_refresh_token';

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [refreshToken, setRefreshTokenState] = useState(null);

  useEffect(() => {
    const at = localStorage.getItem(LS_ACCESS);
    const rt = localStorage.getItem(LS_REFRESH);
    if (at) setAccessTokenState(at);
    if (rt) setRefreshTokenState(rt);
  }, []);

  const setAccessToken = (v) => { setAccessTokenState(v); v ? localStorage.setItem(LS_ACCESS, v) : localStorage.removeItem(LS_ACCESS); };
  const setRefreshToken = (v) => { setRefreshTokenState(v); v ? localStorage.setItem(LS_REFRESH, v) : localStorage.removeItem(LS_REFRESH); };

  const value = useMemo(() => ({ accessToken, refreshToken, setAccessToken, setRefreshToken }), [accessToken, refreshToken]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
```

### PrivateRoute (React Router v6)
```js
// PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute() {
  const { accessToken } = useAuth();
  const location = useLocation();
  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// App.jsx (ví dụ cấu hình route)
// <Routes>
//   <Route path="/login" element={<LoginPage />} />
//   <Route element={<PrivateRoute />}> 
//     <Route path="/admin/orders" element={<OrdersPage />} />
//     <Route path="/admin/inventory" element={<InventoryPage />} />
//   </Route>
// </Routes>
```

### Logout: xóa token và chuyển hướng
```js
// logout.js
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
export function useLogout() {
  const { setAccessToken, setRefreshToken } = useAuth();
  const nav = useNavigate();
  return () => {
    setAccessToken(null);
    setRefreshToken(null);
    nav('/login');
  };
}
```


## Xóa bản ghi (DELETE) cURL mẫu
```bash
# Xóa Inventory
curl -sS -X DELETE "$BASE_URL/api/vehicle-inventory/UUID_INVENTORY" -H "$AUTH"

# Xóa Dealer (nếu controller hỗ trợ DELETE)
curl -sS -X DELETE "$BASE_URL/api/dealers/UUID_DEALER" -H "$AUTH"

# Xóa Order (nếu controller hỗ trợ DELETE)
curl -sS -X DELETE "$BASE_URL/api/orders/UUID_ORDER" -H "$AUTH"
```

## Postman Collection (template rút gọn)
```json
{
  "info": { "name": "EVDM API", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "item": [
    {
      "name": "Auth - Login",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{BASE_URL}}/api/auth/login",
        "body": { "mode": "raw", "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"StrongPass#123\"\n}" }
      }
    },
    {
      "name": "Products - Create Brand",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{JWT}}" }
        ],
        "url": "{{BASE_URL}}/api/products/brands",
        "body": { "mode": "raw", "raw": "{\n  \"brandName\": \"Tesla\",\n  \"isActive\": true\n}" }
      }
    },
    {
      "name": "Orders - Create",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{JWT}}" }
        ],
        "url": "{{BASE_URL}}/api/orders",
        "body": { "mode": "raw", "raw": "{\n  \"orderNumber\": \"SO-2025-00001\",\n  \"quotationId\": \"{{QUOTATION_ID}}\",\n  \"customerId\": \"{{CUSTOMER_ID}}\",\n  \"userId\": \"{{USER_ID}}\",\n  \"inventoryId\": \"{{INVENTORY_ID}}\",\n  \"orderDate\": \"2025-10-30\",\n  \"status\": \"pending\",\n  \"orderType\": \"RETAIL\",\n  \"paymentStatus\": \"PENDING\",\n  \"deliveryStatus\": \"PENDING\",\n  \"fulfillmentStatus\": \"CREATED\"\n}" }
      }
    }
  ],
  "variable": [
    { "key": "BASE_URL", "value": "http://localhost:8080" },
    { "key": "JWT", "value": "" },
    { "key": "QUOTATION_ID", "value": "" },
    { "key": "CUSTOMER_ID", "value": "" },
    { "key": "USER_ID", "value": "" },
    { "key": "INVENTORY_ID", "value": "" }
  ]
}
```

