import "./Customer.css";
import { FaSearch, FaEye, FaPen, FaTrash, FaPlus, FaKey } from "react-icons/fa";
import { useEffect, useState } from "react";
import { userAPI, dealerAPI } from "../../services/API.js";
import { getRoleDisplayName } from "../../config/roleMenus.js";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState({
    username: "",
    password: "",
    role: "",
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    role: "",
    dealerId: "",
    password: "",
    isActive: true,
  });

  // ✅ Lấy danh sách users
  const fetchUsers = async () => {
    try {
      let dealersData = dealers;
      if (dealers.length === 0) {
        try {
          const dealersRes = await dealerAPI.getAll();
          dealersData = dealersRes.data || [];
          setDealers(dealersData);
        } catch (dealersErr) {
          console.warn("⚠️ Không thể fetch dealers:", dealersErr);
        }
      }

      const res = await userAPI.getUsers();
      const usersData = res.data || [];

      const processedUsers = usersData.map((u) => {
        let processedRole = null;
        if (u.role && u.role !== "") {
          processedRole = u.role;
        } else if (u.userType && u.userType !== "") {
          processedRole = u.userType;
        }

        let processedFullName = u.fullName;
        if (!processedFullName && u.firstName && u.lastName) {
          processedFullName = `${u.firstName} ${u.lastName}`.trim();
        }

        let processedDealer = u.dealer;
        if (!processedDealer && u.dealerId) {
          const dealerFromList = dealersData.find(
            (d) => d.dealerId === u.dealerId
          );
          if (dealerFromList) {
            processedDealer = {
              dealerId: dealerFromList.dealerId,
              dealerName: dealerFromList.dealerName,
            };
          }
        }

        let processedIsActive = u.isActive === false ? false : true;

        return {
          ...u,
          isActive: processedIsActive,
          role: processedRole || u.role || u.userType,
          fullName: processedFullName || u.fullName,
          dealer: processedDealer || u.dealer,
        };
      });

      setUsers(processedUsers);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách users:", err);
    }
  };

  // ✅ Lấy danh sách dealers
  const fetchDealers = async () => {
    try {
      const res = await dealerAPI.getAll();
      setDealers(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách dealers:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDealers();
  }, []);

  // ✅ Tìm kiếm
  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = searchTerm.trim();
      if (trimmed === "") {
        fetchUsers();
        return;
      }
      try {
        const res = await userAPI.getUsers();
        const filtered = (res.data || []).filter(
          (u) =>
            u.username?.toLowerCase().includes(trimmed.toLowerCase()) ||
            u.email?.toLowerCase().includes(trimmed.toLowerCase()) ||
            u.fullName?.toLowerCase().includes(trimmed.toLowerCase())
        );
        setUsers(filtered);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Xem chi tiết
  const handleView = async (user) => {
    try {
      const res = await userAPI.getUser(user.userId);
      const userData = res.data;

      const fullName =
        userData.fullName ||
        user.fullName ||
        (userData.firstName && userData.lastName
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : null) ||
        (user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`.trim()
          : null);

      let dealer = userData.dealer || user.dealer;
      if (!dealer && (userData.dealerId || user.dealerId)) {
        const dealerId = userData.dealerId || user.dealerId;
        const dealerFromList = dealers.find((d) => d.dealerId === dealerId);
        if (dealerFromList) {
          dealer = {
            dealerId: dealerFromList.dealerId,
            dealerName: dealerFromList.dealerName,
          };
        }
      }

      const mergedUser = {
        ...user,
        ...userData,
        fullName: user.fullName || fullName || userData.fullName,
        firstName: user.firstName || userData.firstName,
        lastName: user.lastName || userData.lastName,
        role: user.role || user.userType || userData.role || userData.userType,
        isActive:
          user.isActive !== undefined
            ? user.isActive === true
            : userData.isActive === true,
        dealer: user.dealer || dealer,
        dealerId: user.dealerId || userData.dealerId,
      };

      setSelectedUser(mergedUser);
      setShowDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết user:", err);
      let dealer = user.dealer;
      if (!dealer && user.dealerId) {
        const dealerFromList = dealers.find(
          (d) => d.dealerId === user.dealerId
        );
        if (dealerFromList) {
          dealer = {
            dealerId: dealerFromList.dealerId,
            dealerName: dealerFromList.dealerName,
          };
        }
      }

      const fullName =
        user.fullName ||
        (user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`.trim()
          : null);

      setSelectedUser({
        ...user,
        fullName: fullName || user.fullName,
        isActive: user.isActive === true,
        dealer: dealer || user.dealer,
      });
      setShowDetail(true);
    }
  };

  // ✅ Mở form thêm
  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedUser(null);
    const defaultPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8).toUpperCase();
    setFormData({
      username: "",
      email: "",
      fullName: "",
      phone: "",
      role: "",
      dealerId: "",
      password: defaultPassword,
      isActive: true,
    });
    setError("");
    setShowPopup(true);
  };

  // ✅ Mở form sửa
  const handleEdit = (user) => {
    setIsEdit(true);
    setSelectedUser(user);

    const isActiveValue = user.isActive === false ? false : true;

    setFormData({
      username: user.username || "",
      email: user.email || "",
      fullName: user.fullName || "",
      phone: user.phone || "",
      role: user.role || "STAFF",
      dealerId: user.dealer?.dealerId || "",
      password: "",
      isActive: isActiveValue,
    });
    setError("");
    setShowPopup(true);
  };

  // ✅ Xóa user
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?"))
      return;
    try {
      await userAPI.deleteUser(id);
      alert("Xóa tài khoản thành công!");
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể xóa tài khoản!");
    }
  };

  // ✅ Reset password
  const handleResetPassword = async (user) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn reset mật khẩu cho ${user.username}?`
      )
    )
      return;
    try {
      let res;
      try {
        res = await userAPI.resetPassword(user.userId);
      } catch (idErr) {
        res = await userAPI.resetPasswordByUsername(user.username);
      }

      let newPassword =
        res.data?.password ||
        res.data?.newPassword ||
        res.data?.data?.password ||
        res.data?.data?.newPassword ||
        Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8).toUpperCase();

      setPasswordInfo({
        username: user.username,
        password: newPassword,
        role: user.role || "",
      });
      setShowPasswordModal(true);
      alert("Reset mật khẩu thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi reset password:", err);
      alert("Không thể reset mật khẩu! Vui lòng thử lại.");
    }
  };

  // ✅ Gửi form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation khi tạo mới
    if (!isEdit) {
      if (!formData.username || !formData.email || !formData.fullName) {
        setError("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      if (!formData.role) {
        setError("Vui lòng chọn vai trò!");
        return;
      }

      // ✅ CHỈ yêu cầu dealerId cho STAFF và MANAGER
      if (
        (formData.role === "STAFF" || formData.role === "MANAGER") &&
        !formData.dealerId
      ) {
        const roleName =
          formData.role === "STAFF" ? "Nhân viên đại lý" : "Quản lý đại lý";
        setError(`Vui lòng chọn đại lý cho ${roleName}!`);
        return;
      }
    } else {
      // Validation khi edit - CHỈ validate dealerId cho STAFF và MANAGER
      if (
        (formData.role === "STAFF" || formData.role === "MANAGER") &&
        !formData.dealerId
      ) {
        const roleName =
          formData.role === "STAFF" ? "Nhân viên đại lý" : "Quản lý đại lý";
        setError(`Vui lòng chọn đại lý cho ${roleName}!`);
        return;
      }
    }

    try {
      if (isEdit && selectedUser) {
        const isActiveChanged = selectedUser.isActive !== formData.isActive;
        const newIsActive = formData.isActive === true;

        const updateData = {};

        if (formData.fullName && formData.fullName !== selectedUser.fullName) {
          updateData.fullName = formData.fullName;
        }

        if (formData.phone !== selectedUser.phone) {
          updateData.phone = formData.phone || null;
        }

        if (formData.email && formData.email !== selectedUser.email) {
          updateData.email = formData.email;
        }

        if (formData.dealerId !== selectedUser.dealer?.dealerId) {
          updateData.dealerId = formData.dealerId || null;
        }

        updateData.isActive = newIsActive;

        if (isActiveChanged && !newIsActive && selectedUser.isActive) {
          try {
            await userAPI.deactivateUser(selectedUser.userId);
          } catch (deactivateErr) {
            console.warn("⚠️ Deactivate API không hoạt động:", deactivateErr);
          }
        }

        await userAPI.updateUser(selectedUser.userId, updateData);

        alert("Cập nhật tài khoản thành công!");
        setShowPopup(false);
        setError("");

        setUsers((prevUsers) => {
          return prevUsers.map((u) => {
            if (u.userId === selectedUser.userId) {
              return {
                ...u,
                ...updateData,
                isActive: newIsActive,
              };
            }
            return u;
          });
        });
      } else {
        // Tạo user mới
        const fullNameParts = (formData.fullName || "").trim().split(/\s+/);
        const firstName = fullNameParts[0] || "";
        const lastName = fullNameParts.slice(1).join(" ") || "";

        const userData = {
          username: formData.username,
          email: formData.email,
          firstName: firstName,
          lastName: lastName,
          phone: formData.phone || "",
          role: formData.role,
          isActive: true,
        };

        // ✅ CHỈ thêm dealerId cho STAFF và MANAGER
        if (formData.role === "STAFF" || formData.role === "MANAGER") {
          if (!formData.dealerId || formData.dealerId.trim() === "") {
            throw new Error("Vui lòng chọn đại lý!");
          }
          userData.dealerId = String(formData.dealerId).trim();
        } else {
          // EVM_STAFF, ADMIN: Đảm bảo không gửi dealerId
          delete userData.dealerId;
        }

        if (formData.password && formData.password.trim() !== "") {
          userData.password = formData.password;
        } else {
          const tempPassword =
            Math.random().toString(36).slice(-8) +
            Math.random().toString(36).slice(-8).toUpperCase();
          userData.password = tempPassword;
        }

        console.log(
          "📤 Dữ liệu gửi tạo user:",
          JSON.stringify(userData, null, 2)
        );

        let res;
        try {
          res = await userAPI.createUser(userData);
        } catch (createErr) {
          console.log("⚠️ createUser failed, thử createUserFromDTO...");
          res = await userAPI.createUserFromDTO(userData);
        }

        let password =
          res.data?.password ||
          res.data?.newPassword ||
          res.data?.rawPassword ||
          res.data?.data?.password ||
          res.data?.user?.password ||
          userData.password;

        if (!password || password.trim() === "") {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const resetRes = await userAPI.resetPasswordByUsername(
            formData.username
          );
          password =
            resetRes.data?.password ||
            resetRes.data?.newPassword ||
            resetRes.data?.data?.password;

          if (!password) {
            alert(
              "⚠️ Tài khoản đã được tạo nhưng không thể lấy mật khẩu. Vui lòng sử dụng chức năng 'Reset mật khẩu'."
            );
            fetchUsers();
            return;
          }
        }

        setPasswordInfo({
          username: formData.username,
          password: password,
          role: formData.role,
        });
        setShowPasswordModal(true);
        setShowPopup(false);
        setError("");
        fetchUsers();
      }
    } catch (err) {
      console.error("Lỗi khi lưu user:", err);

      let errorMsg = "Không thể lưu tài khoản!";

      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (typeof errorData === "string") {
          errorMsg = errorData;
        } else if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMsg = errorData.errors
            .map((e) => e.defaultMessage || e.message)
            .join(", ");
        } else if (errorData.details) {
          errorMsg = errorData.details;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      if (err.response?.status === 400) {
        errorMsg = `Lỗi 400 - Dữ liệu không hợp lệ: ${errorMsg}`;
      } else if (err.response?.status === 409) {
        errorMsg = `Lỗi 409 - Tài khoản đã tồn tại: ${errorMsg}`;
      } else if (err.response?.status === 500) {
        errorMsg = `Lỗi 500 - Lỗi server: ${errorMsg}`;
      }

      setError(errorMsg);
      alert(`❌ Lỗi: ${errorMsg}`);
    }
  };

  // ✅ Lấy tên role
  const getRoleName = (role) => {
    if (!role) return "—";
    const roles = {
      ADMIN: "Quản trị viên",
      EVM_STAFF: "Nhân viên EVM",
      EVM_MANAGER: "Quản lý EVM",
      MANAGER: "Quản lý đại lý",
      STAFF: "Nhân viên đại lý",
      DEALER_STAFF: "Nhân viên đại lý",
    };
    return roles[role] || role;
  };

  // ✅ Lọc users
  const filteredUsers = users.filter((u) => {
    const keyword = searchTerm.toLowerCase();
    return (
      u.username?.toLowerCase().includes(keyword) ||
      u.email?.toLowerCase().includes(keyword) ||
      u.fullName?.toLowerCase().includes(keyword) ||
      getRoleName(u.role)?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="customer">
      <div className="title-customer">Quản lý tài khoản</div>

      <div className="title2-customer">
        <h2>Danh sách tài khoản</h2>
        <h3 onClick={handleOpenAdd}>
          <FaPlus /> Tạo tài khoản
        </h3>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm tài khoản..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>USERNAME</th>
              <th>HỌ TÊN</th>
              <th>EMAIL</th>
              <th>SĐT</th>
              <th>VAI TRÒ</th>
              <th>ĐẠI LÝ</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.userId}>
                  <td>{u.username}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span
                      style={{
                        background:
                          u.role === "ADMIN"
                            ? "#fef3c7"
                            : u.role === "EVM_STAFF"
                            ? "#dbeafe"
                            : u.role === "MANAGER"
                            ? "#d1fae5"
                            : "#e0e7ff",
                        color:
                          u.role === "ADMIN"
                            ? "#92400e"
                            : u.role === "EVM_STAFF"
                            ? "#1e40af"
                            : u.role === "MANAGER"
                            ? "#065f46"
                            : "#3730a3",
                        padding: "5px 8px",
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                    >
                      {getRoleName(u.role)}
                    </span>
                  </td>
                  <td>{u.dealer?.dealerName || "—"}</td>
                  <td>
                    <span
                      style={{
                        background: u.isActive === true ? "#dcfce7" : "#fee2e2",
                        color: u.isActive === true ? "#16a34a" : "#dc2626",
                        padding: "5px 8px",
                        borderRadius: "5px",
                      }}
                    >
                      {u.isActive === true ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="icon-btn view"
                      onClick={() => handleView(u)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="icon-btn edit"
                      onClick={() => handleEdit(u)}
                    >
                      <FaPen />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleResetPassword(u)}
                      style={{ background: "#f59e0b", color: "white" }}
                      title="Reset mật khẩu"
                    >
                      <FaKey />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(u.userId)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>
                  Không có dữ liệu tài khoản
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup thêm/sửa */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box" style={{ maxWidth: "600px" }}>
            <h2>{isEdit ? "Sửa tài khoản" : "Tạo tài khoản mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  name="username"
                  placeholder="Username *"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={isEdit}
                  required={!isEdit}
                />
                <input
                  name="email"
                  type="email"
                  placeholder={isEdit ? "Email" : "Email *"}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required={!isEdit}
                />
                <input
                  name="fullName"
                  placeholder={isEdit ? "Họ và tên" : "Họ và tên *"}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required={!isEdit}
                />
                <input
                  name="phone"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                {!isEdit && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Mật khẩu *
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        name="password"
                        type="text"
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPassword =
                            Math.random().toString(36).slice(-8) +
                            Math.random().toString(36).slice(-8).toUpperCase();
                          setFormData({ ...formData, password: newPassword });
                        }}
                        style={{
                          padding: "10px 15px",
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        🔄 Tạo tự động
                      </button>
                    </div>
                    <small
                      style={{
                        color: "#666",
                        fontSize: "12px",
                        display: "block",
                        marginTop: "5px",
                      }}
                    >
                      💡 Nhập mật khẩu tùy chỉnh hoặc nhấn "Tạo tự động"
                    </small>
                  </div>
                )}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Vai trò {!isEdit && "*"}
                  </label>
                  {isEdit ? (
                    <div
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        background: "#f5f5f5",
                        color: "#666",
                      }}
                    >
                      {getRoleName(formData.role) || "—"}
                    </div>
                  ) : (
                    <>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            role: e.target.value,
                            dealerId: "",
                          });
                        }}
                        required={!isEdit}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                        }}
                      >
                        <option value="">-- Chọn vai trò --</option>
                        <option value="STAFF">Nhân viên đại lý</option>
                        <option value="MANAGER">Quản lý đại lý</option>
                        <option value="EVM_STAFF">Nhân viên EVM</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                      <small
                        style={{
                          color: "#666",
                          fontSize: "12px",
                          display: "block",
                          marginTop: "5px",
                        }}
                      >
                        💡 STAFF và MANAGER cần chọn đại lý. EVM_STAFF và ADMIN
                        không cần.
                      </small>
                    </>
                  )}
                </div>
                {/* ✅ CHỈ hiển thị field dealer cho STAFF và MANAGER */}
                {(formData.role === "STAFF" || formData.role === "MANAGER") && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Đại lý *
                    </label>
                    <select
                      name="dealerId"
                      value={formData.dealerId}
                      onChange={(e) =>
                        setFormData({ ...formData, dealerId: e.target.value })
                      }
                      required={!isEdit}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <option value="">-- Chọn đại lý --</option>
                      {dealers.map((d) => (
                        <option key={d.dealerId} value={d.dealerId}>
                          {d.dealerName}
                        </option>
                      ))}
                    </select>
                    <small
                      style={{
                        color: "#666",
                        fontSize: "12px",
                        display: "block",
                        marginTop: "5px",
                      }}
                    >
                      💡 Nhân viên đại lý và Quản lý đại lý cần chọn đại lý
                    </small>
                  </div>
                )}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    gridColumn: "1 / -1",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive === true}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {formData.isActive ? "✅ Đang hoạt động" : "❌ Tạm ngừng"}
                  </span>
                </label>
              </div>
              {error && (
                <span
                  className="error"
                  style={{ color: "red", display: "block", marginTop: "10px" }}
                >
                  {error}
                </span>
              )}
              <div className="form-actions">
                <button type="submit">{isEdit ? "Cập nhật" : "Tạo"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal hiển thị mật khẩu */}
      {showPasswordModal && (
        <div
          className="popup-overlay"
          onClick={(e) => {
            if (e.target.className === "popup-overlay")
              setShowPasswordModal(false);
          }}
        >
          <div className="popup-box" style={{ maxWidth: "500px" }}>
            <h2>🔐 Thông tin đăng nhập</h2>
            <div
              style={{
                padding: "20px",
                background: "#f3f4f6",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <p style={{ marginBottom: "15px" }}>
                <b>Username:</b>
                <span
                  style={{
                    background: "#fff",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                    marginLeft: "10px",
                    fontFamily: "monospace",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#1e40af",
                  }}
                >
                  {passwordInfo.username}
                </span>
              </p>
              {passwordInfo.role && (
                <p style={{ marginBottom: "15px" }}>
                  <b>Vai trò:</b>
                  <span
                    style={{
                      background: "#fff",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      display: "inline-block",
                      marginLeft: "10px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#7c3aed",
                    }}
                  >
                    {getRoleDisplayName(passwordInfo.role)}
                  </span>
                </p>
              )}
              <p style={{ marginBottom: "15px" }}>
                <b>Mật khẩu:</b>
                <span
                  style={{
                    background: "#fff",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                    marginLeft: "10px",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#059669",
                    letterSpacing: "1px",
                  }}
                >
                  {passwordInfo.password}
                </span>
              </p>
              <div
                style={{
                  background: "#fef3c7",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #fbbf24",
                }}
              >
                <p style={{ color: "#92400e", fontSize: "14px", margin: 0 }}>
                  ⚠️ <b>Lưu ý quan trọng:</b> Vui lòng lưu lại thông tin này
                  ngay bây giờ. Mật khẩu sẽ không hiển thị lại sau khi đóng cửa
                  sổ này!
                </p>
              </div>
            </div>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                className="btn-close"
                onClick={() => {
                  if (window.confirm("Bạn đã lưu thông tin đăng nhập chưa?")) {
                    setShowPasswordModal(false);
                  }
                }}
                style={{
                  background: "#059669",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Đã lưu - Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xem chi tiết */}
      {showDetail && selectedUser && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Thông tin tài khoản</h2>
            <p>
              <b>Username:</b> {selectedUser.username || "—"}
            </p>
            <p>
              <b>Họ tên:</b>{" "}
              {selectedUser.fullName ||
                (selectedUser.firstName && selectedUser.lastName
                  ? `${selectedUser.firstName} ${selectedUser.lastName}`.trim()
                  : null) ||
                "—"}
            </p>
            <p>
              <b>Email:</b> {selectedUser.email || "—"}
            </p>
            <p>
              <b>SĐT:</b> {selectedUser.phone || "—"}
            </p>
            <p>
              <b>Vai trò:</b>{" "}
              {getRoleName(selectedUser.role || selectedUser.userType)}
            </p>
            <p>
              <b>Đại lý:</b> {selectedUser.dealer?.dealerName || "—"}
            </p>
            <p>
              <b>Trạng thái:</b>{" "}
              {selectedUser.isActive === true ? "Hoạt động" : "Ngừng"}
            </p>
            <p>
              <b>Ngày tạo:</b>{" "}
              {selectedUser.createdAt
                ? new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")
                : "—"}
            </p>
            <button className="btn-close" onClick={() => setShowDetail(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
