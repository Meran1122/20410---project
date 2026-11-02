import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const TransactionModal = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  initialDate,
  transactionToEdit
}) => {
  const [type, setType] = useState('EXPENSE');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setDate(transactionToEdit.transaction_date);
      setCategoryId(transactionToEdit.category_id);
      setTitle(transactionToEdit.title);
      setAmount(transactionToEdit.amount);
      setStatus(transactionToEdit.status);
      setMemo(transactionToEdit.memo || '');
    } else {
      setType('EXPENSE');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setTitle('');
      setAmount('');
      setStatus('COMPLETED');
      setMemo('');
      if (categories && categories.length > 0) {
        const defaultCat = categories.find((c) => c.type === 'EXPENSE') || categories[0];
        setCategoryId(defaultCat.id);
      }
    }
  }, [transactionToEdit, initialDate, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !amount || !categoryId || !date) {
      alert('날짜, 카테고리, 항목명, 금액을 모두 입력해 주세요.');
      return;
    }

    const payload = {
      category_id: categoryId,
      transaction_date: date,
      amount: parseInt(amount, 10),
      type,
      status,
      title,
      memo
    };

    try {
      const token = localStorage.getItem('token');
      if (transactionToEdit) {
        await axios.put(`/api/transactions/${transactionToEdit.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('수정되었습니다.');
      } else {
        await axios.post('/api/transactions', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('등록되었습니다.');
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || '저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 항목을 정말 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/transactions/${transactionToEdit.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('삭제되었습니다.');
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{transactionToEdit ? '내역 수정' : '새 내역 / 약속 추가'}</ModalTitle>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </ModalHeader>

        <TypeToggle>
          <TypeBtn $active={type === 'EXPENSE'} onClick={() => setType('EXPENSE')} type="button">
            💸 지출
          </TypeBtn>
          <TypeBtn $active={type === 'INCOME'} onClick={() => setType('INCOME')} type="button">
            💰 수입
          </TypeBtn>
        </TypeToggle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>날짜</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </FormGroup>

          <FormGroup>
            <Label>카테고리</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>항목명</Label>
            <Input
              type="text"
              placeholder="예: 편의점, 넷플릭스, 친구 생일파티"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>금액 (원)</Label>
            <Input
              type="number"
              placeholder="예: 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </FormGroup>

          {type === 'EXPENSE' && (
            <FormGroup>
              <Label>지출 구분</Label>
              <RadioGroup>
                <RadioLabel>
                  <input
                    type="radio"
                    name="status"
                    value="COMPLETED"
                    checked={status === 'COMPLETED'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  실제 지출 완료
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    name="status"
                    value="PLANNED"
                    checked={status === 'PLANNED'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  약속 / 지출 예정 (미래 지출)
                </RadioLabel>
              </RadioGroup>
            </FormGroup>
          )}

          <FormGroup>
            <Label>메모 (선택사항)</Label>
            <Textarea
              rows={2}
              placeholder="추가 내용을 적어보세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </FormGroup>

          <BtnGroup>
            {transactionToEdit && (
              <DeleteBtn type="button" onClick={handleDelete}>
                삭제
              </DeleteBtn>
            )}
            <SubmitBtn type="submit">{transactionToEdit ? '수정 완료' : '등록하기'}</SubmitBtn>
          </BtnGroup>
        </Form>
      </ModalCard>
    </Overlay>
  );
};

export default TransactionModal;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalCard = styled.div`
  background-color: #ffffff;
  border-radius: 14px;
  width: 100%;
  max-width: 440px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #212529;
`;

const CloseBtn = styled.button`
  font-size: 16px;
  color: #868e96;
  padding: 4px;
`;

const TypeToggle = styled.div`
  display: flex;
  border-radius: 8px;
  background-color: #f1f3f5;
  padding: 3px;
  margin-bottom: 16px;
`;

const TypeBtn = styled.button`
  flex: 1;
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  background-color: ${(props) => (props.$active ? '#fff' : 'transparent')};
  color: ${(props) => (props.$active ? '#212529' : '#868e96')};
  box-shadow: ${(props) => (props.$active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none')};
  transition: all 0.2s;
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

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 4px;
`;

const RadioLabel = styled.label`
  font-size: 13px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const Textarea = styled.textarea`
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  resize: none;
`;

const BtnGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const SubmitBtn = styled.button`
  flex: 1;
  padding: 10px;
  background-color: #1c7ed6;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 8px;

  &:hover {
    background-color: #1971c2;
  }
`;

const DeleteBtn = styled.button`
  padding: 10px 16px;
  background-color: #ffe3e3;
  color: #e03131;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;

  &:hover {
    background-color: #ffc9c9;
  }
`;
