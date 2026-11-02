import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';

const Layout = ({ isLoggedIn, setIsLoggedIn }) => {
  return (
    <PageWrapper>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <MainContent>
        <Outlet context={{ setIsLoggedIn, isLoggedIn }} />
      </MainContent>
      <Footer />
    </PageWrapper>
  );
};

export default Layout;

const PageWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.04);
`;

const MainContent = styled.main`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;
