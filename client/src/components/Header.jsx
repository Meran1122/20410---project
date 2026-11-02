import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 드롭다운 바깥 영역 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 글쓰기 버튼 클릭
  const handleWriteClick = () => {
    const hasToken = !!localStorage.getItem('token');
    if (isLoggedIn || hasToken) {
      navigate('/write');
    } else {
      alert('글 작성을 위해 로그인이 필요합니다.');
      navigate('/login', { state: { redirectTo: '/write' } });
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    alert('로그아웃되었습니다.');
    navigate('/');
  };

  // 메뉴 이동 처리 (클릭 시 드롭다운 닫힘)
  const handleMenuClick = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  return (
    <HeaderContainer>
      <Logo onClick={() => navigate('/')}>school_market</Logo>
      
      <NavGroup>
        <WriteButton onClick={handleWriteClick}>+ 글쓰기</WriteButton>

        {isLoggedIn && (
          <DropdownContainer ref={dropdownRef}>
            <MyPageButton onClick={() => setIsDropdownOpen((prev) => !prev)}>
              마이페이지 ▼
            </MyPageButton>

            {/* 💡 드롭다운 메뉴 항목 */}
            {isDropdownOpen && (
              <DropdownMenu>
                <MenuItem onClick={() => handleMenuClick('/mypage/edit')}>
                  프로필 수정
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick('/mypage/sales')}>
                  판매내역
                </MenuItem>
                <MenuItem onClick={() => handleMenuClick('/mypage/buys')}>
                  구매내역
                </MenuItem>
                <Divider />
                <LogoutItem onClick={handleLogout}>
                  로그아웃
                </LogoutItem>
              </DropdownMenu>
            )}
          </DropdownContainer>
        )}
      </NavGroup>
    </HeaderContainer>
  );
};

export default Header;

// 🎨 styled-components
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  background-color: #fff;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #FF6F0F;
  cursor: pointer;
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WriteButton = styled.button`
  background-color: #FF6F0F;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
`;

/* 💡 드롭다운 스타일 정의 */
const DropdownContainer = styled.div`
  position: relative;
`;

const MyPageButton = styled.button`
  background: none;
  border: none;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 4px;

  &:hover {
    color: #212529;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 140px;
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  z-index: 100;
`;

const MenuItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  color: #343a40;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background-color: #f8f9fa;
    color: #FF6F0F;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #f1f3f5;
  margin: 4px 0;
`;

const LogoutItem = styled(MenuItem)`
  color: #fa5252;

  &:hover {
    background-color: #fff5f5;
    color: #e03131;
  }
`;