import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    alert('로그아웃되었습니다.');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <HeaderContainer>
      <LogoSection onClick={() => navigate('/')}>
        <LogoIcon>💸</LogoIcon>
        <LogoTitle>MoneyPlan</LogoTitle>
        <BadgeTag>스마트 캘린더</BadgeTag>
      </LogoSection>

      <NavMenu>
        <NavItem $active={location.pathname === '/'} onClick={() => navigate('/')}>
          📅 캘린더
        </NavItem>
        <NavItem $active={location.pathname === '/recurring'} onClick={() => navigate('/recurring')}>
          🔄 정기구독·고정비
        </NavItem>
        <NavItem $active={location.pathname === '/statistics'} onClick={() => navigate('/statistics')}>
          📊 월간통계
        </NavItem>
      </NavMenu>

      <UserSection>
        {isLoggedIn ? (
          <>
            <UserInfo>
              <UserName>{user.nickname || '학생'}님</UserName>
            </UserInfo>
            <LogoutBtn onClick={handleLogout}>로그아웃</LogoutBtn>
          </>
        ) : (
          <>
            <LoginBtn onClick={() => navigate('/login')}>로그인</LoginBtn>
            <SignupBtn onClick={() => navigate('/signup')}>회원가입</SignupBtn>
          </>
        )}
      </UserSection>
    </HeaderContainer>
  );
};

export default Header;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f3f5;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const LogoIcon = styled.span`
  font-size: 26px;
`;

const LogoTitle = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: #1c7ed6;
  letter-spacing: -0.5px;
`;

const BadgeTag = styled.span`
  font-size: 11px;
  background-color: #e7f5ff;
  color: #1971c2;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const NavMenu = styled.nav`
  display: flex;
  gap: 8px;
`;

const NavItem = styled.button`
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  background-color: ${(props) => (props.$active ? '#edf2ff' : 'transparent')};
  color: ${(props) => (props.$active ? '#364fc7' : '#495057')};
  transition: all 0.15s ease;

  &:hover {
    background-color: #f1f3f5;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #343a40;
`;

const LogoutBtn = styled.button`
  font-size: 12px;
  padding: 6px 12px;
  color: #868e96;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #fff;

  &:hover {
    background-color: #f8f9fa;
    color: #495057;
  }
`;

const LoginBtn = styled.button`
  font-size: 13px;
  padding: 7px 14px;
  font-weight: 600;
  color: #1971c2;
  border: 1px solid #a5d8ff;
  border-radius: 6px;
  background-color: #f8f9fa;

  &:hover {
    background-color: #e7f5ff;
  }
`;

const SignupBtn = styled.button`
  font-size: 13px;
  padding: 7px 14px;
  font-weight: 600;
  color: #fff;
  border-radius: 6px;
  background-color: #1971c2;

  &:hover {
    background-color: #1864ab;
  }
`;
