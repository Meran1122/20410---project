import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StatisticsPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [summary, setSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`/api/transactions?year=${year}&month=${month}`, { headers });

      setSummary(res.data.summary);
      setCategoryStats(res.data.categoryStats || []);

      // 지출 TOP 3 추출
      const expenses = (res.data.transactions || [])
        .filter((t) => t.type === 'EXPENSE')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);
      setTopExpenses(expenses);
    } catch (error) {
      console.error('통계 로드 에러:', error);
    } finally {
      setLoading(false);
    }
  }, [token, year, month, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const totalExpense = summary?.totalAllExpense || 1;

  return (
    <PageContainer>
      <HeaderRow>
        <Title>📊 {year}년 {month}월 지출 & 자산 분석 리포트</Title>
        <MonthNav>
          <NavBtn onClick={handlePrev}>◀ 이전달</NavBtn>
          <NavText>{year}.{String(month).padStart(2, '0')}</NavText>
          <NavBtn onClick={handleNext}>다음달 ▶</NavBtn>
        </MonthNav>
      </HeaderRow>

      {/* 3대 요약 박스 */}
      <SummaryGrid>
        <SummaryCard>
          <CardLabel>총 수입</CardLabel>
          <CardAmount $color="#2b8a3e">+{summary?.totalIncome?.toLocaleString() || 0}원</CardAmount>
        </SummaryCard>
        <SummaryCard>
          <CardLabel>총 지출 (완료 + 예정)</CardLabel>
          <CardAmount $color="#e03131">-{summary?.totalAllExpense?.toLocaleString() || 0}원</CardAmount>
          <CardSub>완료: {summary?.totalExpense?.toLocaleString()}원 / 예정: {summary?.totalPlannedExpense?.toLocaleString()}원</CardSub>
        </SummaryCard>
        <SummaryCard>
          <CardLabel>월간 잔액 (수입 - 총지출)</CardLabel>
          <CardAmount $color={summary?.balance >= 0 ? '#1971c2' : '#c92a2a'}>
            {summary?.balance?.toLocaleString() || 0}원
          </CardAmount>
        </SummaryCard>
      </SummaryGrid>

      <ContentGrid>
        {/* 카테고리별 지출 비율 */}
        <SectionCard>
          <SectionTitle>카테고리별 지출 비중 (GROUP BY 분석)</SectionTitle>
          {categoryStats.length === 0 ? (
            <EmptyBox>이번 달 지출 내역이 없습니다.</EmptyBox>
          ) : (
            <CategoryList>
              {categoryStats.map((cat) => {
                const percent = Math.round((cat.total_amount / totalExpense) * 100);
                return (
                  <CategoryRow key={cat.id}>
                    <CatInfo>
                      <CatIcon>{cat.icon}</CatIcon>
                      <CatName>{cat.name}</CatName>
                      <CatCount>({cat.count}건)</CatCount>
                    </CatInfo>
                    <BarContainer>
                      <BarFill $percent={percent} $color={cat.color} />
                    </BarContainer>
                    <CatSum>
                      <strong>{cat.total_amount.toLocaleString()}원</strong>
                      <CatPercent>{percent}%</CatPercent>
                    </CatSum>
                  </CategoryRow>
                );
              })}
            </CategoryList>
          )}
        </SectionCard>

        {/* 이번 달 가장 컸던 지출 TOP 3 */}
        <SectionCard>
          <SectionTitle>🏆 이번 달 최대 지출 TOP 3</SectionTitle>
          {topExpenses.length === 0 ? (
            <EmptyBox>지출 내역이 없습니다.</EmptyBox>
          ) : (
            <TopList>
              {topExpenses.map((tx, idx) => (
                <TopItem key={tx.id}>
                  <RankBadge $rank={idx + 1}>{idx + 1}위</RankBadge>
                  <TopInfo>
                    <TopTitle>{tx.title}</TopTitle>
                    <TopDate>{tx.transaction_date} • {tx.category_name}</TopDate>
                  </TopInfo>
                  <TopAmount>-{tx.amount.toLocaleString()}원</TopAmount>
                </TopItem>
              ))}
            </TopList>
          )}
        </SectionCard>
      </ContentGrid>
    </PageContainer>
  );
};

export default StatisticsPage;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #212529;
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavBtn = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;

  &:hover {
    background-color: #e9ecef;
  }
`;

const NavText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #343a40;
  min-width: 80px;
  text-align: center;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
`;

const CardLabel = styled.div`
  font-size: 13px;
  color: #868e96;
  font-weight: 600;
  margin-bottom: 6px;
`;

const CardAmount = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: ${(props) => props.$color || '#212529'};
`;

const CardSub = styled.div`
  font-size: 11px;
  color: #adb5bd;
  margin-top: 4px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 16px;
`;

const EmptyBox = styled.div`
  text-align: center;
  padding: 40px 16px;
  color: #adb5bd;
  font-size: 14px;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CategoryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
`;

const CatIcon = styled.span`
  font-size: 16px;
`;

const CatName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #343a40;
`;

const CatCount = styled.span`
  font-size: 11px;
  color: #adb5bd;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 10px;
  background-color: #f1f3f5;
  border-radius: 5px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background-color: ${(props) => props.$color || '#339af0'};
  border-radius: 5px;
  transition: width 0.3s ease;
`;

const CatSum = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
  justify-content: flex-end;
  font-size: 13px;
`;

const CatPercent = styled.span`
  font-size: 11px;
  color: #868e96;
  font-weight: 600;
`;

const TopList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TopItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fafbfc;
  border: 1px solid #f1f3f5;
  border-radius: 8px;
`;

const RankBadge = styled.span`
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: ${(props) => (props.$rank === 1 ? '#ffe8cc' : '#f1f3f5')};
  color: ${(props) => (props.$rank === 1 ? '#d9480f' : '#495057')};
`;

const TopInfo = styled.div`
  flex: 1;
`;

const TopTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #212529;
`;

const TopDate = styled.div`
  font-size: 11px;
  color: #868e96;
`;

const TopAmount = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: #e03131;
`;
