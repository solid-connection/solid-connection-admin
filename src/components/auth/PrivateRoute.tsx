import { Navigate } from "react-router-dom";
import { loadAccessToken } from "@/utils/localStorage";

interface Props {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: Props) {
  const accessToken = loadAccessToken();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
