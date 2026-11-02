import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RecurringPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 새 정기 항목 폼 상태
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [memo, setMemo] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [rulesRes, catRes] = await Promise.all([
        axios.get('/api/recurring', { headers }),
        axios.get('/api/categories', { headers })
      ]);

      setRules(rulesRes.data || []);
      const cats = catRes.data || [];
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        const defaultCat = cats.find((c) => c.type === 'EXPENSE') || cats[0];
        setCategoryId(defaultCat.id);
      }
    } catch (error) {
      console.error('정기 항목 로드 에러:', error);
    } finally {
      setLoading(false);
    }
  }, [token, navigate, categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount || !dayOfMonth || !categoryId) {
      alert('필수 정보를 모두 입력해 주세요.');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        '/api/recurring',
        {
          name,
          amount: parseInt(amount, 10),
          type,
          day_of_month: parseInt(dayOfMonth, 10),
          category_id: categoryId,
          memo
        },
        { headers }
      );

      alert('정기 항목이 등록되었습니다.');
      setName('');
      setAmount('');
      setMemo('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || '등록에 실패했습니다.');
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `/api/recurring/${rule.id}`,
        {
          ...rule,
          is_active: !rule.is_active
        },
        { headers }
      );
      fetchData();
    } catch (error) {
      alert('상태 변경 실패');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/recurring/${id}`, { headers });
      fetchData();
    } catch (error) {
      alert('삭제 실패');
    }
  };

  const handleSyncThisMonth = async () => {
    const now = new Date();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        '/api/recurring/sync',
        { year: now.getFullYear(), month: now.getMonth() + 1 },
        { headers }
      );
      alert(res.data.message);
      navigate('/');
    } catch (error) {
      alert('동기화 실패');
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  // 고정비 및 고정 수입 합계
  let fixedExpenseSum = 0;
  let fixedIncomeSum = 0;
  rules.forEach((r) => {
    if (r.is_active) {
      if (r.type === 'EXPENSE') fixedExpenseSum += r.amount;
      else fixedIncomeSum += r.amount;
    }
  });

  return (
    <PageContainer>
      <HeaderSection>
        <div>
          <Title>🔄 정기 구독 & 고정 지출·수입 매니저</Title>
          <Subtitle>
            넷플릭스, 통신비, 교통비, 용돈 등 매달 반복되는 비용을 한곳에서 관리하세요.
          </Subtitle>
        </div>
        <SyncButton onClick={handleSyncThisMonth}>
          📅 이번 달 캘린더에 바로 반영
        </SyncButton>
      </HeaderSection>

      {/* 고정비 요약 배너 */}
      <SummaryBanner>
        <SummaryBox>
          <SummaryLabel>매달 나가는 고정 지출 합계</SummaryLabel>
          <SummaryValue $color="#e03131">-{fixedExpenseSum.toLocaleString()}원</SummaryValue>
        </SummaryBox>
        <SummaryBox>
          <SummaryLabel>매달 들어오는 고정 수입 합계</SummaryLabel>
          <SummaryValue $color="#2b8a3e">+{fixedIncomeSum.toLocaleString()}원</SummaryValue>
        </SummaryBox>
        <SummaryBox>
          <SummaryLabel>고정 순수익 (수입 - 지출)</SummaryLabel>
          <SummaryValue $color={fixedIncomeSum - fixedExpenseSum >= 0 ? '#1971c2' : '#e03131'}>
            {(fixedIncomeSum - fixedExpenseSum).toLocaleString()}원
          </SummaryValue>
        </SummaryBox>
      </SummaryBanner>

      <ContentGrid>
        {/* 1. 새 정기 항목 등록 카드 */}
        <Card>
          <CardTitle>+ 새 정기 항목 등록</CardTitle>
          <TypeToggle>
            <TypeBtn $active={type === 'EXPENSE'} onClick={() => setType('EXPENSE')} type="button">
              💸 고정 지출
            </TypeBtn>
            <TypeBtn $active={type === 'INCOME'} onClick={() => setType('INCOME')} type="button">
              💰 고정 수입
            </TypeBtn>
          </TypeToggle>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>항목명</Label>
              <Input
                type="text"
                placeholder="예: 넷플릭스, 통신비, 정기 용돈"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>금액 (원)</Label>
              <Input
                type="number"
                placeholder="예: 13500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </FormGroup>

            <FormRow>
              <FormGroup style={{ flex: 1 }}>
                <Label>매월 결제/입금 일자</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup style={{ flex: 1.5 }}>
                <Label>카테고리</Label>
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>메모 (선택사항)</Label>
              <Input
                type="text"
                placeholder="결제 수단이나 메모"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </FormGroup>

            <SubmitBtn type="submit">정기 항목 추가하기</SubmitBtn>
          </Form>
        </Card>

        {/* 2. 등록된 정기 항목 리스트 */}
        <Card>
          <CardTitle>등록된 정기 항목 ({rules.length}개)</CardTitle>
          {rules.length === 0 ? (
            <EmptyBox>아직 등록된 정기 구독이나 고정 비용이 없습니다.</EmptyBox>
          ) : (
            <RuleList>
              {rules.map((rule) => (
                <RuleItem key={rule.id} $isActive={rule.is_active}>
                  <RuleLeft>
                    <DayBadge>매월 {rule.day_of_month}일</DayBadge>
                    <CategoryTag $color={rule.category_color}>
                      {rule.category_icon} {rule.category_name}
                    </CategoryTag>
                    <div>
                      <RuleName $isActive={rule.is_active}>{rule.name}</RuleName>
                      {rule.memo && <RuleMemo>{rule.memo}</RuleMemo>}
                    </div>
                  </RuleLeft>

                  <RuleRight>
                    <AmountText $isIncome={rule.type === 'INCOME'}>
                      {rule.type === 'INCOME' ? `+${rule.amount.toLocaleString()}원` : `-${rule.amount.toLocaleString()}원`}
                    </AmountText>
                    <ToggleBtn
                      $active={rule.is_active}
                      onClick={() => handleToggleActive(rule)}
                    >
                      {rule.is_active ? 'ON' : 'OFF'}
                    </ToggleBtn>
                    <DeleteBtn onClick={() => handleDelete(rule.id)}>삭제</DeleteBtn>
                  </RuleRight>
                </RuleItem>
              ))}
            </RuleList>
          )}
        </Card>
      </ContentGrid>
    </PageContainer>
  );
};

export default RecurringPage;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeaderSection = styled.div`
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
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #868e96;
`;

const SyncButton = styled.button`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  background-color: #f3f0ff;
  border: 1px solid #d0bfff;
  color: #6741d9;
  border-radius: 8px;

  &:hover {
    background-color: #e5dbff;
  }
`;

const SummaryBanner = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 16px;
  border-radius: 10px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #868e96;
  font-weight: 600;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: ${(props) => props.$color || '#212529'};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 20px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 16px;
`;

const TypeToggle = styled.div`
  display: flex;
  background-color: #f1f3f5;
  border-radius: 6px;
  padding: 3px;
  margin-bottom: 16px;
`;

const TypeBtn = styled.button`
  flex: 1;
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 4px;
  background-color: ${(props) => (props.$active ? '#fff' : 'transparent')};
  color: ${(props) => (props.$active ? '#212529' : '#868e96')};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #495057;
`;

const Input = styled.input`
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  outline: none;

  &:focus {
    border-color: #4dabf7;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  outline: none;
`;

const SubmitBtn = styled.button`
  margin-top: 8px;
  padding: 10px;
  font-size: 14px;
  font-weight: 700;
  background-color: #1c7ed6;
  color: #fff;
  border-radius: 6px;

  &:hover {
    background-color: #1971c2;
  }
`;

const EmptyBox = styled.div`
  text-align: center;
  padding: 40px 16px;
  color: #adb5bd;
  font-size: 14px;
`;

const RuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RuleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid #f1f3f5;
  border-radius: 8px;
  background-color: #fafbfc;
  opacity: ${(props) => (props.$isActive ? 1 : 0.5)};
`;

const RuleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DayBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 6px;
  background-color: #e7f5ff;
  color: #1c7ed6;
  border-radius: 4px;
`;

const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px;
  background-color: ${(props) => `${props.$color || '#4dabf7'}18`};
  color: ${(props) => props.$color || '#1971c2'};
  border-radius: 4px;
`;

const RuleName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  text-decoration: ${(props) => (props.$isActive ? 'none' : 'line-through')};
`;

const RuleMemo = styled.div`
  font-size: 11px;
  color: #868e96;
`;

const RuleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AmountText = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${(props) => (props.$isIncome ? '#2b8a3e' : '#e03131')};
`;

const ToggleBtn = styled.button`
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  background-color: ${(props) => (props.$active ? '#d3f9d8' : '#e9ecef')};
  color: ${(props) => (props.$active ? '#2b8a3e' : '#868e96')};
`;

const DeleteBtn = styled.button`
  font-size: 11px;
  color: #fa5252;
  padding: 4px 6px;

  &:hover {
    text-decoration: underline;
  }
`;
