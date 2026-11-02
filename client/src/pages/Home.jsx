import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// DB products 테이블 기준 샘플 데이터
const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: '모듈형 컴퓨터구조 교재 급처합니다',
    price: 8000,
    type: 'SELL',
    category: '서적',
    status: 'SELLING',
    location: '3층 홈베이스',
    image_url: 'https://via.placeholder.com/150',
    created_at: '10분 전'
  },
  {
    id: 2,
    title: '체육복 상의 (L사이즈) 무료나눔',
    price: 0,
    type: 'FREE',
    category: '교복',
    status: 'SELLING',
    location: '매점 앞',
    image_url: 'https://via.placeholder.com/150',
    created_at: '1시간 전'
  },
  {
    id: 3,
    title: '공학용 계산기 (FX-570EX)',
    price: 15000,
    type: 'SELL',
    category: '학용품',
    status: 'RESERVED',
    location: '1층 중앙현관',
    image_url: 'https://via.placeholder.com/150',
    created_at: '3시간 전'
  }
];

const CATEGORIES = ['전체', '서적', '교복', '학용품', '기타'];

const Home = () => {
  const navigate = useNavigate();
  const [products] = useState(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 카테고리 필터링
  const filteredProducts = selectedCategory === '전체'
    ? products
    : products.filter(item => item.category === selectedCategory);

  return (
    <HomeContainer>
      {/* 1. 카테고리 태그 바 */}
      <CategoryNav>
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            $active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </CategoryChip>
        ))}
      </CategoryNav>

      {/* 2. 게시글 목록 영역 */}
      <ProductList>
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <Thumbnail src={product.image_url} alt={product.title} />

            <InfoArea>
              <Title>{product.title}</Title>
              
              <Meta>
                <LocationTag>📍 {product.location}</LocationTag>
                <Dot>•</Dot>
                <span>{product.created_at}</span>
              </Meta>

              <PriceRow>
                {product.status === 'RESERVED' && <Badge $type="reserved">예약중</Badge>}
                {product.status === 'COMPLETED' && <Badge $type="completed">거래완료</Badge>}
                
                <Price>
                  {product.type === 'FREE' || product.price === 0 ? (
                    <FreeText>무료나눔 🎁</FreeText>
                  ) : (
                    `${product.price.toLocaleString()}원`
                  )}
                </Price>
              </PriceRow>
            </InfoArea>
          </ProductCard>
        ))}
      </ProductList>
    </HomeContainer>
  );
};

export default Home;

// 🎨 styled-components 정의

const HomeContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const CategoryNav = styled.nav`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f5;
  overflow-x: auto;
  white-space: nowrap;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryChip = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid ${props => (props.$active ? '#FF6F0F' : '#e9ecef')};
  background-color: ${props => (props.$active ? '#FF6F0F' : '#fff')};
  color: ${props => (props.$active ? '#fff' : '#495057')};
  font-size: 13px;
  font-weight: ${props => (props.$active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.15s ease-in-out;
`;

const ProductList = styled.div`
  padding: 0 16px;
`;

const ProductCard = styled.article`
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:active {
    background-color: #f8f9fa;
  }
`;

const Thumbnail = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 16px;
  background-color: #f1f3f5;
  flex-shrink: 0;
`;

const InfoArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
`;

const Title = styled.h2`
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: #212529;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  font-size: 12px;
  color: #868e96;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;

const LocationTag = styled.span`
  font-weight: 500;
  color: #495057;
`;

const Dot = styled.span`
  margin: 0 4px;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Price = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #212529;
`;

const FreeText = styled.span`
  color: #FF6F0F;
  font-weight: 700;
`;

const Badge = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  color: #fff;
  background-color: ${props => (props.$type === 'reserved' ? '#2b8a3e' : '#868e96')};
`;