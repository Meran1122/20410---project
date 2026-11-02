import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProfileEditPage from './pages/ProfileEditPage';

const App = () => {
  // 로컬 스토리지의 토큰 존재 여부로 초기 로그인 상태 설정
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  return (
    <Routes>
      <Route element={<Layout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}>
        <Route path="/" element={<Home />} />
        {/* 인증 관련 라우트 */}
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignupPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/mypage/edit" element={<ProfileEditPage />} />
        <Route path="/write" element={<ProductCreatePage />} />
      </Route>
    </Routes>
  );
};

export default App;
