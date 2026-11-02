import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useOutletContext();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    phone_number: '',
    entry_year: '2026',
    student_id: '20410',
    default_budget: '300000',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        setIsLoggedIn(true);
        alert('회원가입이 완료되었습니다! 머니플랜에 오신 것을 환영합니다.');
        navigate('/');
      } else {
        alert(data.message || '회원가입 실패');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <Container>
      <Title>💸 MoneyPlan 회원가입</Title>
      <Subtitle>학생 맞춤형 캘린더 자산 관리 서비스를 시작하세요.</Subtitle>

      <Form onSubmit={handleSignup}>
        <FormGroup>
          <Label>학교 이메일</Label>
          <Input
            type="email"
            name="email"
            placeholder="example@school.hs.kr"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>비밀번호</Label>
          <Input
            type="password"
            name="password"
            placeholder="비밀번호 입력"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>닉네임 (이름)</Label>
          <Input
            type="text"
            name="nickname"
            placeholder="예: 서진하"
            value={formData.nickname}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>전화번호</Label>
          <Input
            type="tel"
            name="phone_number"
            placeholder="예: 010-1234-5678"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormRow>
          <FormGroup style={{ flex: 1 }}>
            <Label>입학년도</Label>
            <Input
              type="number"
              name="entry_year"
              value={formData.entry_year}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup style={{ flex: 1 }}>
            <Label>학번</Label>
            <Input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>한 달 목표 예산 (기본값)</Label>
          <Input
            type="number"
            name="default_budget"
            placeholder="예: 300000"
            value={formData.default_budget}
            onChange={handleChange}
            required
          />
          <HelpText>나중에 언제든지 월별로 수정할 수 있습니다.</HelpText>
        </FormGroup>

        <SubmitButton type="submit">가입하기</SubmitButton>
      </Form>

      <BottomLink>
        이미 계정이 있으신가요? <Link to="/login">로그인하기</Link>
      </BottomLink>
    </Container>
  );
};

export default SignupPage;

const Container = styled.div`
  padding: 40px 20px;
  max-width: 440px;
  margin: 0 auto;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
  color: #1c7ed6;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #868e96;
  text-align: center;
  margin-bottom: 24px;
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
  gap: 10px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #495057;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #1c7ed6;
  }
`;

const HelpText = styled.span`
  font-size: 11px;
  color: #adb5bd;
`;

const SubmitButton = styled.button`
  padding: 13px;
  background-color: #1c7ed6;
  color: #fff;
  border-radius: 8px;
  font-weight: bold;
  font-size: 15px;
  margin-top: 10px;

  &:hover {
    background-color: #1971c2;
  }
`;

const BottomLink = styled.div`
  text-align: center;
  margin-top: 18px;
  font-size: 13px;
  color: #868e96;

  a {
    color: #1c7ed6;
    font-weight: 700;
  }
`;
