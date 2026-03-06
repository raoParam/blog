import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoaderRing from "../../components/common/LoaderRing";
import { authService } from "../../services/auth.service";
import { loginSuccess, setError } from "../../store/slices/authSlice";

const OAuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const completeOAuth = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const error = searchParams.get("error");

      if (error || !accessToken || !refreshToken) {
        dispatch(setError("Google sign-in failed. Please try again."));
        navigate("/login", { replace: true });
        return;
      }

      try {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        const data = await authService.getCurrentUser();

        dispatch(
          loginSuccess({
            user: data?.user || null,
            accessToken,
          })
        );

        navigate("/home", { replace: true });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setMessage("Unable to complete Google login. Redirecting...");
        dispatch(setError("Google sign-in failed. Please try again."));
        navigate("/login", { replace: true });
      }
    };

    completeOAuth();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#020307] text-[#E9EDF3] flex items-center justify-center">
      <div className="rounded-2xl border border-[#1F2737] bg-[#05070B] px-8 py-6 text-center">
        <LoaderRing size="lg" className="mx-auto" />
        <p className="mt-4 text-sm text-[#9EA9C1]">{message}</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
