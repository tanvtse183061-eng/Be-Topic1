import "./Login.css";
import { useState, useEffect } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Không tự động redirect - người dùng phải đăng nhập lại mỗi lần
  // Nếu muốn giữ tính năng "Remember me", có thể thêm logic validate token ở đây
  // Nhưng hiện tại: yêu cầu người dùng đăng nhập lại mỗi lần vào trang login

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
    
    // Prevent double submission
    if (isSubmitting || loading) {
      console.log("⚠️ Đang xử lý đăng nhập, bỏ qua request mới");
      return;
    }
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);
    try {
      const res = await authAPI.login({
        username: form.username,
        password: form.password,
      });

      const data = res.data;
      console.log("✅ Login response:", data);

      if (data?.accessToken) {
        // Kiểm tra trạng thái tài khoản - chỉ từ response, không gọi API thêm
        let isActive = true;
        if (data.isActive !== undefined) {
          isActive = data.isActive;
        } else if (data.user?.isActive !== undefined) {
          isActive = data.user.isActive;
        }

        // Nếu tài khoản bị ngừng hoạt động
        if (!isActive) {
          alert("⚠️ Tài khoản của bạn đã bị ngừng hoạt động!\nVui lòng liên hệ quản trị viên để được kích hoạt lại.");
          setIsSubmitting(false);
          setLoading(false);
          return;
        }

        // Lưu thông tin đăng nhập - ưu tiên userType từ backend
        const roleToSave = data.userType || data.role || data.user?.userType || data.user?.role;
        const usernameToSave = data.username || data.user?.username || "";
        
        // Lưu vào localStorage ngay lập tức
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("username", usernameToSave);
        localStorage.setItem("role", roleToSave);

        // Kiểm tra lại ngay để đảm bảo đã lưu
        const savedToken = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");
        const savedUser = localStorage.getItem("username");
        
        console.log("✅ Login thành công!");
        console.log("✅ Role:", savedRole);
        console.log("✅ Username:", savedUser);
        console.log("✅ Token:", savedToken ? "Đã lưu" : "Chưa lưu");
        
        // Nếu không lưu được, báo lỗi
        if (!savedToken || !savedRole) {
          console.error("❌ Lỗi: Không thể lưu token hoặc role!");
          alert("Lỗi: Không thể lưu thông tin đăng nhập. Vui lòng thử lại!");
          setIsSubmitting(false);
          setLoading(false);
          return;
        }
        
        // Xác định route redirect
        let redirectPath = "/dealerstaff"; // fallback
        if (roleToSave === "ADMIN") {
          redirectPath = "/admin";
        } else if (roleToSave === "EVM_STAFF") {
          redirectPath = "/evmstaff";
        } else if (roleToSave === "MANAGER" || roleToSave === "DEALER_MANAGER") {
          redirectPath = "/dealermanager";
        } else if (roleToSave === "STAFF" || roleToSave === "DEALER_STAFF") {
          redirectPath = "/dealerstaff";
        }
        
        console.log("🔄 Redirect đến:", redirectPath);
        
        // Sử dụng navigate với replace để không có history entry
        // Không dùng window.location.href để tránh reload không cần thiết
        navigate(redirectPath, { replace: true });
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
      setIsSubmitting(false);
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
                disabled={loading || isSubmitting}
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
                disabled={loading || isSubmitting}
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
            <button 
              type="submit" 
              className="btn-login" 
              disabled={loading || isSubmitting}
              style={{ 
                opacity: (loading || isSubmitting) ? 0.6 : 1,
                cursor: (loading || isSubmitting) ? "not-allowed" : "pointer"
              }}
            >
              {loading || isSubmitting ? "Đang đăng nhập..." : "Login"}
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
