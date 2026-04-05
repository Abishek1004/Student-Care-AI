import AuthCard from '../components/AuthCard';

export default function Register() {
  return (
    <div className="login-page">
      <AuthCard initialMode="register" />
    </div>
  );
}