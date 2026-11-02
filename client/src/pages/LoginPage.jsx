import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, useOutletContext, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoggedIn } = useOutletContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = location.state?.redirectTo || '/';

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        setIsLoggedIn(true);
        alert('로그인되었습니다.');
        navigate(redirectTo);
      } else {
        alert(data.message || '로그인 실패');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <Container>
      <Title>💸 MoneyPlan 로그인</Title>
      <Subtitle>나의 수입과 지출 일정을 스마트하게 관리해보세요.</Subtitle>
      <Form onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="이메일 입력 (@school.hs.kr 등)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <SubmitButton type="submit">로그인</SubmitButton>
      </Form>
      <BottomLink>
        아직 계정이 없으신가요? <Link to="/signup">회원가입하기</Link>
      </BottomLink>
    </Container>
  );
};

export default LoginPage;

const Container = styled.div`
  padding: 60px 20px;
  max-width: 400px;
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
  margin-bottom: 28px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #1c7ed6;
  }
`;

const SubmitButton = styled.button`
  padding: 14px;
  background-color: #1c7ed6;
  color: #fff;
  border-radius: 8px;
  font-weight: bold;
  font-size: 15px;
  margin-top: 6px;

  &:hover {
    background-color: #1971c2;
  }
`;

const BottomLink = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #868e96;

  a {
    color: #1c7ed6;
    font-weight: 700;
  }
`;
