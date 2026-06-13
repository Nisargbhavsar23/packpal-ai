import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import CreateTripPage from "../pages/CreateTripPage";
import DashboardPage from "../pages/DashboardPage";
import EditTripPage from "../pages/EditTripPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import TripDetailPage from "../pages/TripDetailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "trips/new",
        element: (
          <ProtectedRoute>
            <CreateTripPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "trips/:tripId",
        element: (
          <ProtectedRoute>
            <TripDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "trips/:tripId/edit",
        element: (
          <ProtectedRoute>
            <EditTripPage />
          </ProtectedRoute>
        ),
      },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
]);

function AppRoutes() {
  return <RouterProvider router={router} />;
}

export default AppRoutes;
