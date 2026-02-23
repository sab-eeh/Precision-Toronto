import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLoginWrapper = ({ children }) => {
  const { isAuth } = useAuth();

  if (isAuth) return <Navigate to="/admin/dashboard" replace />;

  return children;
};
export default AdminLoginWrapper;
