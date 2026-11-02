import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <Title>💸 MoneyPlan (머니플랜)</Title>
        <Subtitle>
          소프트웨어과 데이터베이스 프로그래밍 프로젝트 | 개발자: 20410 서진하
        </Subtitle>
        <TechStack>
          <span>MySQL 8.0</span> • <span>Express</span> • <span>React 19</span> • <span>Vite</span>
        </TechStack>
        <Copyright>
          © {new Date().getFullYear()} MoneyPlan. All rights reserved.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;

const FooterContainer = styled.footer`
  padding: 24px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  margin-top: auto;
`;

const FooterContent = styled.div`
  text-align: center;
  font-size: 13px;
  color: #868e96;
  line-height: 1.6;
`;

const Title = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: #495057;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  margin-bottom: 6px;
`;

const TechStack = styled.div`
  font-size: 12px;
  color: #adb5bd;
  margin-bottom: 8px;

  span {
    color: #495057;
    font-weight: 500;
  }
`;

const Copyright = styled.p`
  font-size: 11px;
  color: #ced4da;
`;
