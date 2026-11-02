import styled from 'styled-components';
import axios from 'axios';

const DateDetailPanel = ({
  selectedDate,
  transactions,
  onOpenCreateModal,
  onEditTransaction,
  onRefresh
}) => {
  if (!selectedDate) return null;

  const dateItems = transactions.filter((t) => t.transaction_date === selectedDate);

  let totalIncome = 0;
  let totalExpense = 0;
  dateItems.forEach((item) => {
    if (item.type === 'INCOME') totalIncome += item.amount;
    else totalExpense += item.amount;
  });

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'COMPLETED' ? 'PLANNED' : 'COMPLETED';
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/transactions/${item.id}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (error) {
      alert('상태 변경 실패');
    }
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <DateTitle>
          📅 <strong>{selectedDate}</strong> 상세 내역
        </DateTitle>
        <HeaderSummary>
          {totalIncome > 0 && <IncomeText>수입 +{totalIncome.toLocaleString()}원</IncomeText>}
          {totalExpense > 0 && <ExpenseText>지출 -{totalExpense.toLocaleString()}원</ExpenseText>}
          <AddBtn onClick={() => onOpenCreateModal(selectedDate)}>+ 항목 추가</AddBtn>
        </HeaderSummary>
      </PanelHeader>

      {dateItems.length === 0 ? (
        <EmptyMessage>
          등록된 수입이나 지출 일정이 없습니다. <br />
          <AddInlineBtn onClick={() => onOpenCreateModal(selectedDate)}>
            + 이 날짜에 새 지출/약속 추가하기
          </AddInlineBtn>
        </EmptyMessage>
      ) : (
        <ItemList>
          {dateItems.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            const isIncome = item.type === 'INCOME';

            return (
              <ItemCard key={item.id} onClick={() => onEditTransaction(item)}>
                <LeftGroup>
                  {!isIncome && (
                    <StatusCheckbox
                      type="checkbox"
                      checked={isCompleted}
                      title={isCompleted ? '지출 완료됨 (클릭하여 예정으로 변경)' : '지출 예정/약속 (클릭하여 완료 처리)'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(item);
                      }}
                    />
                  )}
                  <CategoryBadge $color={item.category_color}>
                    {item.category_icon} {item.category_name}
                  </CategoryBadge>
                  <TitleGroup>
                    <ItemTitle $isCompleted={isCompleted && !isIncome}>
                      {item.title}
                      {item.recurring_name && <RecurringTag>🔄 정기</RecurringTag>}
                      {!isCompleted && !isIncome && <PlannedTag>⏳ 약속/예정</PlannedTag>}
                    </ItemTitle>
                    {item.memo && <ItemMemo>{item.memo}</ItemMemo>}
                  </TitleGroup>
                </LeftGroup>

                <RightGroup>
                  <AmountText $isIncome={isIncome}>
                    {isIncome ? `+${item.amount.toLocaleString()}원` : `-${item.amount.toLocaleString()}원`}
                  </AmountText>
                  <EditHint>수정</EditHint>
                </RightGroup>
              </ItemCard>
            );
          })}
        </ItemList>
      )}
    </PanelContainer>
  );
};

export default DateDetailPanel;

const PanelContainer = styled.div`
  margin-top: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
`;

const DateTitle = styled.div`
  font-size: 16px;
  color: #343a40;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IncomeText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #2b8a3e;
`;

const ExpenseText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #e03131;
`;

const AddBtn = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  background-color: #e7f5ff;
  color: #1c7ed6;
  border: 1px solid #a5d8ff;
  border-radius: 6px;

  &:hover {
    background-color: #d0ebff;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #adb5bd;
  font-size: 14px;
  line-height: 1.6;
`;

const AddInlineBtn = styled.button`
  margin-top: 10px;
  padding: 6px 14px;
  background-color: #f1f3f5;
  color: #495057;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;

  &:hover {
    background-color: #e9ecef;
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #f1f3f5;
  border-radius: 8px;
  background-color: #fcfcfc;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #dee2e6;
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1c7ed6;
`;

const CategoryBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background-color: ${(props) => `${props.$color || '#4dabf7'}18`};
  color: ${(props) => props.$color || '#1971c2'};
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: ${(props) => (props.$isCompleted ? 'line-through' : 'none')};
  opacity: ${(props) => (props.$isCompleted ? 0.8 : 1)};
`;

const RecurringTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 1px 5px;
  background-color: #f3f0ff;
  color: #6741d9;
  border-radius: 4px;
`;

const PlannedTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 1px 5px;
  background-color: #fff4e6;
  color: #e8590c;
  border-radius: 4px;
`;

const ItemMemo = styled.div`
  font-size: 12px;
  color: #868e96;
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AmountText = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${(props) => (props.$isIncome ? '#2b8a3e' : '#e03131')};
`;

const EditHint = styled.span`
  font-size: 12px;
  color: #adb5bd;
`;
