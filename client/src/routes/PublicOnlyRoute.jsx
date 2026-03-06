import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoaderRing from "../components/common/LoaderRing";

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020307]">
        <LoaderRing size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
