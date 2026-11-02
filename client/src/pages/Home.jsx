import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BudgetBanner from '../components/BudgetBanner';
import CalendarView from '../components/CalendarView';
import DateDetailPanel from '../components/DateDetailPanel';
import TransactionModal from '../components/TransactionModal';

const Home = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  const [transactions, setTransactions] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const token = localStorage.getItem('token');

  // 데이터 로드
  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [txRes, budgetRes, catRes] = await Promise.all([
        axios.get(`/api/transactions?year=${currentYear}&month=${currentMonth}`, { headers }),
        axios.get(`/api/budgets?year=${currentYear}&month=${currentMonth}`, { headers }),
        axios.get('/api/categories', { headers })
      ]);

      setTransactions(txRes.data.transactions || []);
      setBudgetData(budgetRes.data);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, currentYear, currentMonth, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 월 이동
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  // 정기 항목 동기화
  const handleSyncRecurring = async () => {
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post(
        '/api/recurring/sync',
        { year: currentYear, month: currentMonth },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      fetchData();
    } catch (error) {
      alert('정기 항목 동기화 실패');
    }
  };

  // 모달 열기
  const handleOpenCreateModal = (dateStr) => {
    if (!token) {
      alert('내역을 등록하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    setTransactionToEdit(null);
    setSelectedDate(dateStr || today.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (item) => {
    setTransactionToEdit(item);
    setIsModalOpen(true);
  };

  if (!token) {
    return (
      <GuestContainer>
        <HeroCard>
          <HeroIcon>💸</HeroIcon>
          <HeroTitle>학생을 위한 스마트 캘린더 가계부, MoneyPlan</HeroTitle>
          <HeroDesc>
            매달 빠져나가는 넷플릭스, 통신비 등 <strong>정기 구독료</strong>부터 <br />
            친구와의 <strong>약속 예정 지출</strong>까지 캘린더 위에 미리 등록하고, <br />
            <strong>"오늘 내가 쓸 수 있는 하루 권장 예산"</strong>을 실시간으로 확인해보세요!
          </HeroDesc>
          <HeroBtnGroup>
            <PrimaryBtn onClick={() => navigate('/login')}>로그인하고 시작하기</PrimaryBtn>
            <SecondaryBtn onClick={() => navigate('/signup')}>회원가입</SecondaryBtn>
          </HeroBtnGroup>
        </HeroCard>
      </GuestContainer>
    );
  }

  return (
    <PageContainer>
      {/* 1. 상단 스마트 예산 현황 배너 */}
      <BudgetBanner
        budgetData={budgetData}
        currentYear={currentYear}
        currentMonth={currentMonth}
        onBudgetUpdated={fetchData}
      />

      {/* 2. 메인 캘린더 뷰 */}
      <CalendarView
        currentYear={currentYear}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onSyncRecurring={handleSyncRecurring}
        transactions={transactions}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onOpenCreateModal={handleOpenCreateModal}
        onEditTransaction={handleEditTransaction}
      />

      {/* 3. 선택 날짜 상세 리스트 패널 */}
      <DateDetailPanel
        selectedDate={selectedDate}
        transactions={transactions}
        onOpenCreateModal={handleOpenCreateModal}
        onEditTransaction={handleEditTransaction}
        onRefresh={fetchData}
      />

      {/* 4. 거래 추가/수정 모달 */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        categories={categories}
        initialDate={selectedDate}
        transactionToEdit={transactionToEdit}
      />
    </PageContainer>
  );
};

export default Home;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const GuestContainer = styled.div`
  padding: 40px 16px;
  display: flex;
  justify-content: center;
`;

const HeroCard = styled.div`
  max-width: 600px;
  text-align: center;
  background-color: #f8faff;
  border: 1px solid #dbe4ff;
  border-radius: 16px;
  padding: 48px 24px;
`;

const HeroIcon = styled.div`
  font-size: 54px;
  margin-bottom: 16px;
`;

const HeroTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #1c7ed6;
  margin-bottom: 16px;
`;

const HeroDesc = styled.p`
  font-size: 15px;
  color: #495057;
  line-height: 1.7;
  margin-bottom: 32px;

  strong {
    color: #1971c2;
  }
`;

const HeroBtnGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const PrimaryBtn = styled.button`
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 700;
  background-color: #1c7ed6;
  color: #fff;
  border-radius: 8px;

  &:hover {
    background-color: #1971c2;
  }
`;

const SecondaryBtn = styled.button`
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  background-color: #fff;
  border: 1px solid #ced4da;
  color: #495057;
  border-radius: 8px;

  &:hover {
    background-color: #f1f3f5;
  }
`;
