import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes/routes.js";
import RequireAuth from "./pages/requireAuth.js";
import Login from "./pages/login.js";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { logout, resetUser, updateUser } from "./redux/slices/userSlice.js";
import { getUserDetails, ensureValidToken } from "./services/apiAuth.js";
import { WalletProvider } from "./context/WalletContext.js";
import { useMetaMaskConnectionCheck } from "./hooks/index.js";

// Component to use the hook inside WalletProvider
const AppContent = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  // Use the MetaMask connection check hook
  useMetaMaskConnectionCheck();

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        // Lấy refreshToken từ cookies
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
          dispatch(resetUser());
          return;
        }

        // Giải mã refreshToken để lấy thông tin expiration
        const decodedRefreshToken = JSON.parse(
          atob(refreshToken.split(".")[1])
        );
        const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

        // Kiểm tra xem refreshToken có hết hạn không
        if (decodedRefreshToken.exp < currentTime) {
          dispatch(logout());
          // navigate('/sign-in')
          return;
        }

        const token = await ensureValidToken(dispatch, resetUser, refreshToken); // Kiểm tra và làm mới accessToken nếu cần
        if (token) {
          console.log(token);
        }
        // Sau khi có accessToken hợp lệ, lấy thông tin người dùng
        const decoded = JSON.parse(atob(refreshToken.split(".")[1]));
        if (decoded?.id) {
          const userDetails = await getUserDetails(
            decoded.id,
            token,
            decoded.role
          );
          dispatch(updateUser(userDetails));
        }
      } catch (error) {
        console.error("Error loading user details:", error);
      } finally {
        setIsLoading(false); // Đảm bảo kết thúc quá trình tải
      }
    };

    loadUserDetails();

    // Thiết lập lại kiểm tra mỗi 5 phút
    const interval = setInterval(() => {
      loadUserDetails();
    }, 60 * 60 * 1000); // Kiểm tra và làm mới mỗi 1 phút

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [dispatch, resetUser]);

  return (
    <div style={{ overflow: "hidden" }}>
      <Router>
        <Routes>
          {/* Route công khai */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          {/* Các route cần xác thực */}
          {routes
            .filter(
              (route) =>
                route.path !== "/login" ||
                route.path !== "/" ||
                route.path !== "/signup" ||
                route.path !== "/features" ||
                route.path !== "/about" ||
                route.path !== "/contact"
            )
            .map((route) => {
              const Page = route.page;
              return (
                <Route key={route.path} path={route.path} element={<Page />} />
              );
            })}
        </Routes>
      </Router>
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;
