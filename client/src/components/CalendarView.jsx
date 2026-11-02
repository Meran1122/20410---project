import styled from 'styled-components';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const CalendarView = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  onSyncRecurring,
  transactions,
  selectedDate,
  onSelectDate,
  onOpenCreateModal,
  onEditTransaction
}) => {
  // 현재 월의 첫 번째 날 요일과 마지막 날짜 계산
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // 날짜별로 트랜잭션 그룹화
  const transactionsByDate = {};
  transactions.forEach((tx) => {
    const day = parseInt(tx.transaction_date.split('-')[2], 10);
    if (!transactionsByDate[day]) {
      transactionsByDate[day] = [];
    }
    transactionsByDate[day].push(tx);
  });

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === currentYear &&
    today.getMonth() + 1 === currentMonth &&
    today.getDate() === day;

  return (
    <CalendarContainer>
      {/* 캘린더 상단 헤더 컨트롤 */}
      <CalendarHeader>
        <MonthNav>
          <NavBtn onClick={onPrevMonth}>◀ 이전달</NavBtn>
          <CurrentMonthText>
            {currentYear}년 {currentMonth}월
          </CurrentMonthText>
          <NavBtn onClick={onNextMonth}>다음달 ▶</NavBtn>
          <TodayBtn onClick={onToday}>오늘</TodayBtn>
        </MonthNav>

        <HeaderActions>
          <SyncBtn onClick={onSyncRecurring} title="등록된 정기 구독 및 고정비를 이번 달 날짜에 자동 생성합니다">
            🔄 정기지출 캘린더 동기화
          </SyncBtn>
          <AddBtn onClick={() => onOpenCreateModal(selectedDate)}>
            + 내역 / 약속 추가
          </AddBtn>
        </HeaderActions>
      </CalendarHeader>

      {/* 요일 헤더 */}
      <WeekGrid>
        {WEEKDAYS.map((w, idx) => (
          <WeekDayHeader key={w} $isSunday={idx === 0} $isSaturday={idx === 6}>
            {w}
          </WeekDayHeader>
        ))}
      </WeekGrid>

      {/* 날짜 그리드 */}
      <DaysGrid>
        {/* 첫째 주 이전 빈 셀 */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <EmptyCell key={`empty-${i}`} />
        ))}

        {/* 1일부터 마지막 날까지 셀 */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayList = transactionsByDate[day] || [];
          const isSelected = selectedDate === dayDateStr;

          // 일자별 수입 및 지출 합계
          let dayIncome = 0;
          let dayExpense = 0;
          dayList.forEach((t) => {
            if (t.type === 'INCOME') dayIncome += t.amount;
            else dayExpense += t.amount;
          });

          return (
            <DayCell
              key={`day-${day}`}
              $isSelected={isSelected}
              $isToday={isToday(day)}
              onClick={() => onSelectDate(dayDateStr)}
            >
              <CellHeader>
                <DayNumber $isToday={isToday(day)}>{day}</DayNumber>
                <DaySums>
                  {dayIncome > 0 && <IncomeSum>+{dayIncome.toLocaleString()}</IncomeSum>}
                  {dayExpense > 0 && <ExpenseSum>-{dayExpense.toLocaleString()}</ExpenseSum>}
                </DaySums>
              </CellHeader>

              {/* 뱃지 목록 (최대 3개 표시) */}
              <BadgeList>
                {dayList.slice(0, 3).map((item) => {
                  const isRecurring = !!item.recurring_id;
                  const isPlanned = item.status === 'PLANNED';
                  const isIncome = item.type === 'INCOME';

                  return (
                    <ItemBadge
                      key={item.id}
                      $isRecurring={isRecurring}
                      $isPlanned={isPlanned}
                      $isIncome={isIncome}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTransaction(item);
                      }}
                      title={`${item.title} (${item.amount.toLocaleString()}원) - 클릭하여 수정`}
                    >
                      <BadgeIcon>{item.category_icon || '📌'}</BadgeIcon>
                      <BadgeTitle>{item.title}</BadgeTitle>
                      <BadgeAmount>{item.amount >= 10000 ? `${Math.round(item.amount / 10000)}만` : `${item.amount.toLocaleString()}`}</BadgeAmount>
                    </ItemBadge>
                  );
                })}
                {dayList.length > 3 && (
                  <MoreChip onClick={(e) => { e.stopPropagation(); onSelectDate(dayDateStr); }}>
                    +{dayList.length - 3}개 더보기
                  </MoreChip>
                )}
              </BadgeList>
            </DayCell>
          );
        })}
      </DaysGrid>
    </CalendarContainer>
  );
};

export default CalendarView;

const CalendarContainer = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f3f5;
  flex-wrap: wrap;
  gap: 12px;
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CurrentMonthText = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: #212529;
  min-width: 140px;
  text-align: center;
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

const TodayBtn = styled.button`
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  background-color: #edf2ff;
  border: 1px solid #bac8ff;
  color: #364fc7;

  &:hover {
    background-color: #dbe4ff;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SyncBtn = styled.button`
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  background-color: #f3f0ff;
  border: 1px solid #d0bfff;
  color: #6741d9;

  &:hover {
    background-color: #e5dbff;
  }
`;

const AddBtn = styled.button`
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 6px;
  background-color: #1c7ed6;
  color: #ffffff;

  &:hover {
    background-color: #1971c2;
  }
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const WeekDayHeader = styled.div`
  padding: 10px 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: ${(props) => (props.$isSunday ? '#e03131' : props.$isSaturday ? '#1c7ed6' : '#495057')};
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #dee2e6;
  gap: 1px;
`;

const EmptyCell = styled.div`
  background-color: #fafbfc;
  min-height: 105px;
`;

const DayCell = styled.div`
  background-color: ${(props) => (props.$isSelected ? '#edf2ff' : '#ffffff')};
  min-height: 110px;
  padding: 8px 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${(props) => (props.$isSelected ? '#edf2ff' : '#f8f9fa')};
  }
`;

const CellHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
`;

const DayNumber = styled.span`
  font-size: 13px;
  font-weight: 700;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: ${(props) => (props.$isToday ? '#fff' : '#343a40')};
  background-color: ${(props) => (props.$isToday ? '#1c7ed6' : 'transparent')};
`;

const DaySums = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
`;

const IncomeSum = styled.span`
  color: #2b8a3e;
`;

const ExpenseSum = styled.span`
  color: #e03131;
`;

const BadgeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
`;

const ItemBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.2;
  cursor: pointer;
  transition: opacity 0.15s;

  ${(props) => {
    if (props.$isIncome) {
      return `background-color: #ebfbee; color: #2b8a3e; border: 1px solid #b2f2bb;`;
    }
    if (props.$isRecurring) {
      return `background-color: #f3f0ff; color: #5f3dc4; border: 1px solid #d0bfff; font-weight: 600;`;
    }
    if (props.$isPlanned) {
      return `background-color: #fff4e6; color: #d9480f; border: 1px dashed #ffd8a8; font-weight: 500;`;
    }
    return `background-color: #ffe3e3; color: #c92a2a; border: 1px solid #ffc9c9;`;
  }}

  &:hover {
    opacity: 0.85;
  }
`;

const BadgeIcon = styled.span`
  font-size: 10px;
`;

const BadgeTitle = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BadgeAmount = styled.span`
  font-size: 10px;
  font-weight: 700;
`;

const MoreChip = styled.div`
  font-size: 10px;
  color: #868e96;
  text-align: center;
  padding: 1px 0;
  font-weight: 600;

  &:hover {
    color: #495057;
    text-decoration: underline;
  }
`;
