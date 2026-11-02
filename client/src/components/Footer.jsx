import React from 'react';
import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
      <CompanyTitle>school_market (스쿨마켓)</CompanyTitle>
      
      <InfoText>
        소프트웨어과 학생 프로젝트 | 교내 중고거래 & 장터 서비스
      </InfoText>
      <InfoText>
        문의 메일 <HighlightText>support@schoolmarket.ac.kr</HighlightText> | 위치 교내 3층 소프트웨어랩
      </InfoText>

      <MetaGroup>
        <MetaItem>개발팀 <span>초보개발자들</span></MetaItem>
        <MetaItem>DB <span>MySQL 8.0</span></MetaItem>
        <MetaItem>Tech Stack <span>React & Node.js</span></MetaItem>
      </MetaGroup>

      <LinkList>
        <FooterLink href="#">서비스 이용약관</FooterLink>
        <FooterLink href="#" className="bold">개인정보처리방침</FooterLink>
        <FooterLink href="#">운영정책</FooterLink>
        <FooterLink href="#">커뮤니티 가이드라인</FooterLink>
      </LinkList>

      <Copyright>
        © {new Date().getFullYear()} school_market. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;

// 🎨 styled-components 정의

const FooterContainer = styled.footer`
  padding: 32px 16px 40px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-size: 12px;
  color: #868e96;
  line-height: 1.6;
`;

const CompanyTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: #495057;
  margin: 0 0 8px 0;
`;

const InfoText = styled.p`
  margin: 2px 0;
`;

const HighlightText = styled.span`
  color: #495057;
  font-weight: 500;
`;

const MetaGroup = styled.div`
  margin: 12px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const MetaItem = styled.span`
  span {
    color: #495057;
    font-weight: 500;
  }
`;

const LinkList = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f3f5;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const FooterLink = styled.a`
  color: #495057;
  text-decoration: none;
  font-size: 12px;
  
  &.bold {
    font-weight: 700;
    color: #212529;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const Copyright = styled.p`
  margin-top: 16px;
  font-size: 11px;
  color: #adb5bd;
`;