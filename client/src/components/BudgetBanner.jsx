import { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const BudgetBanner = ({ budgetData, onBudgetUpdated, currentYear, currentMonth }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budgetData?.targetBudget || 300000);

  if (!budgetData) return null;

  const {
    targetBudget,
    spentAmount,
    plannedAmount,
    totalExpectedExpense,
    remainingBudget,
    remainingDays,
    dailyRecommendedBudget,
    usagePercent
  } = budgetData;

  const isOverBudget = remainingBudget < 0;

  const handleSaveBudget = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/budgets',
        {
          year: currentYear,
          month: currentMonth,
          target_budget: parseInt(newBudget, 10)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('목표 예산이 변경되었습니다.');
      setIsEditing(false);
      if (onBudgetUpdated) onBudgetUpdated();
    } catch (error) {
      alert(error.response?.data?.message || '예산 수정에 실패했습니다.');
    }
  };

  return (
    <BannerCard>
      <TopRow>
        <TitleGroup>
          <Icon>📊</Icon>
          <div>
            <MonthTitle>{currentYear}년 {currentMonth}월 스마트 예산 현황</MonthTitle>
            <SubNotice>
              {isOverBudget ? (
                <WarningText>
                  ⚠️ 이번 달 예산이 <strong>{Math.abs(remainingBudget).toLocaleString()}원</strong> 초과되었습니다!
                </WarningText>
              ) : (
                <SafeText>
                  💡 남은 <strong>{remainingDays}일</strong> 동안 하루 평균 <strong>{dailyRecommendedBudget.toLocaleString()}원</strong>씩 쓰면 예산을 지켜요!
                </SafeText>
              )}
            </SubNotice>
          </div>
        </TitleGroup>

        <BudgetAction>
          {isEditing ? (
            <EditInputGroup>
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="목표 예산 입력"
              />
              <SaveBtn onClick={handleSaveBudget}>저장</SaveBtn>
              <CancelBtn onClick={() => setIsEditing(false)}>취소</CancelBtn>
            </EditInputGroup>
          ) : (
            <EditBtn onClick={() => { setNewBudget(targetBudget); setIsEditing(true); }}>
              ⚙️ 목표 예산 수정 ({targetBudget.toLocaleString()}원)
            </EditBtn>
          )}
        </BudgetAction>
      </TopRow>

      {/* 예산 사용률 프로그레스 바 */}
      <ProgressContainer>
        <ProgressBar $percent={Math.min(100, Math.max(0, usagePercent))} $isOver={isOverBudget} />
      </ProgressContainer>

      {/* 핵심 4대 수치 카드 */}
      <StatGrid>
        <StatItem>
          <StatLabel>🎯 목표 예산</StatLabel>
          <StatValue>{targetBudget.toLocaleString()}원</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>💸 현재 지출 완료</StatLabel>
          <StatValue $color="#e03131">-{spentAmount.toLocaleString()}원</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>⏳ 남은 고정비·약속 예정</StatLabel>
          <StatValue $color="#f76707">-{plannedAmount.toLocaleString()}원</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>💰 남은 가용 예산</StatLabel>
          <StatValue $color={isOverBudget ? '#c92a2a' : '#2f9e44'}>
            {remainingBudget.toLocaleString()}원
          </StatValue>
        </StatItem>
      </StatGrid>
    </BannerCard>
  );
};

export default BudgetBanner;

const BannerCard = styled.div`
  background: linear-gradient(135deg, #f8faff 0%, #edf2ff 100%);
  border: 1px solid #dbe4ff;
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 24px;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Icon = styled.span`
  font-size: 32px;
`;

const MonthTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #1c7ed6;
  margin-bottom: 3px;
`;

const SubNotice = styled.div`
  font-size: 13px;
`;

const SafeText = styled.span`
  color: #2b8a3e;
  font-weight: 500;
  strong {
    color: #2b8a3e;
    font-weight: 700;
  }
`;

const WarningText = styled.span`
  color: #c92a2a;
  font-weight: 600;
`;

const BudgetAction = styled.div`
  display: flex;
  align-items: center;
`;

const EditBtn = styled.button`
  font-size: 12px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #bac8ff;
  border-radius: 6px;
  color: #364fc7;
  font-weight: 600;

  &:hover {
    background-color: #f1f3f5;
  }
`;

const EditInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Input = styled.input`
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid #bac8ff;
  border-radius: 6px;
  width: 120px;
`;

const SaveBtn = styled.button`
  padding: 6px 10px;
  font-size: 12px;
  background-color: #364fc7;
  color: #fff;
  border-radius: 6px;
  font-weight: 600;
`;

const CancelBtn = styled.button`
  padding: 6px 8px;
  font-size: 12px;
  color: #868e96;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background-color: ${(props) => (props.$isOver ? '#fa5252' : '#339af0')};
  transition: width 0.3s ease;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  background-color: #ffffff;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #868e96;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${(props) => props.$color || '#212529'};
`;
