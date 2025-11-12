import "./Login.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleUser,
  faEye,
  faEyeSlash,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, userAPI } from "../../services/API.js";

const initForm = { username: "", password: "" };

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Kiểm tra giá trị trống
  const isEmpty = (val) => !val || val.trim() === "";

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {};
    if (isEmpty(form.username)) newErrors.username = "Username is required";
    if (isEmpty(form.password)) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Toggle hiển thị mật khẩu
  const togglePassword = () => setShowPassword((prev) => !prev);

  // ✅ Xử lý đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await authAPI.login({
        username: form.username,
        password: form.password,
      });

      const data = res.data;
      console.log("✅ Login response:", data);

      if (data?.accessToken) {
        // Kiểm tra trạng thái tài khoản
        let isActive = true;
        
        // Kiểm tra trong response trước
        if (data.isActive !== undefined) {
          isActive = data.isActive;
        } else if (data.user?.isActive !== undefined) {
          isActive = data.user.isActive;
        } else {
          // Nếu không có trong response, gọi API để lấy thông tin user
          try {
            const userRes = await userAPI.getUsers();
            const user = userRes.data?.find(u => u.username === data.username);
            if (user) {
              isActive = user.isActive !== false; // Mặc định true nếu không có
            }
          } catch (userErr) {
            console.warn("Không thể kiểm tra trạng thái user:", userErr);
            // Tiếp tục với mặc định isActive = true
          }
        }

        // Nếu tài khoản bị ngừng hoạt động
        if (!isActive) {
          alert("⚠️ Tài khoản của bạn đã bị ngừng hoạt động!\nVui lòng liên hệ quản trị viên để được kích hoạt lại.");
          setLoading(false);
          return;
        }

        // Lưu thông tin đăng nhập - ưu tiên userType từ backend
        const roleToSave = data.userType || data.role;
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", roleToSave);

        console.log("✅ Role từ login response:", roleToSave);
        console.log("✅ Username:", data.username);
        
        alert("Đăng nhập thành công!");
        
        // Redirect theo role
        const role = roleToSave;
        console.log("🔄 Redirect theo role:", role);
        
        if (role === "ADMIN") {
          navigate("/admin");
        } else if (role === "EVM_STAFF") {
          navigate("/evmstaff");
        } else if (role === "MANAGER" || role === "DEALER_MANAGER") {
          // Xử lý cả MANAGER và DEALER_MANAGER
          navigate("/dealermanager");
        } else if (role === "STAFF" || role === "DEALER_STAFF") {
          // Xử lý cả STAFF và DEALER_STAFF
          navigate("/dealerstaff");
        } else {
          // Default fallback - nếu role không khớp, thử redirect theo role name
          console.warn("⚠️ Role không khớp, dùng fallback:", role);
          navigate("/dealerstaff");
        }
      } else {
        alert("Sai tài khoản hoặc mật khẩu!");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        let errorMessage = `Lỗi đăng nhập: ${status}`;
        
        if (errorData?.error) {
          errorMessage += `\n${errorData.error}`;
        } else if (errorData?.message) {
          errorMessage += `\n${errorData.message}`;
        } else if (typeof errorData === 'string') {
          errorMessage += `\n${errorData}`;
        } else {
          errorMessage += `\n${JSON.stringify(errorData)}`;
        }
        
        alert(errorMessage);
      } else if (err.request) {
        alert(
          "❌ Không thể kết nối tới backend.\nHãy chắc rằng Spring Boot đang chạy tại http://localhost:8080"
        );
      } else {
        alert(`Lỗi: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Login-page">
      <div className="Login-form-container">
        <h1>Đăng nhập</h1>

        <form className="input-box" onSubmit={handleSubmit}>
          <div className="content">
            {/* Username */}
            <div className="input-wrapper">
              <input
                id="username"
                className="form-control"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
              />
              <FontAwesomeIcon
                icon={faCircleUser}
                size="sm"
                color="navy"
                className="icon"
              />
              {errors.username && (
                <p className="error-text">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="input-wrapper">
              <input
                id="password"
                className="form-control"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
              />
              <span
                onClick={togglePassword}
                className="icon"
                style={{ cursor: "pointer" }}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember me */}
          <div className="checkbox">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>

          {/* Submit */}
          <div className="button">
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Login"}
            </button>
          </div>
        </form>

        {/* Home icon */}
        <div className="Home">
          <Link to="/home">
            <FontAwesomeIcon icon={faHouse} size="2x" color="gray" />
          </Link>
        </div>
      </div>
    </div>
  );
}
