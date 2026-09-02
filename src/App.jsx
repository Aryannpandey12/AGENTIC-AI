import { Navigate, Route, Routes } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout.jsx";
import KitchenLayout from "./layouts/KitchenLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import HomePage from "./pages/customer/HomePage.jsx";
import MenuPage from "./pages/customer/MenuPage.jsx";
import CartPage from "./pages/customer/CartPage.jsx";
import CheckoutPage from "./pages/customer/CheckoutPage.jsx";
import OrderSuccessPage from "./pages/customer/OrderSuccessPage.jsx";
import TrackOrderPage from "./pages/customer/TrackOrderPage.jsx";
import KitchenDashboard from "./pages/kitchen/KitchenDashboard.jsx";
import NewOrdersPage from "./pages/kitchen/NewOrdersPage.jsx";
import ActiveOrdersPage from "./pages/kitchen/ActiveOrdersPage.jsx";
import CompletedOrdersPage from "./pages/kitchen/CompletedOrdersPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import MenuManagementPage from "./pages/admin/MenuManagementPage.jsx";
import OrdersOverviewPage from "./pages/admin/OrdersOverviewPage.jsx";
import PortalSwitcher from "./components/common/PortalSwitcher.jsx";

export default function App() {
  return (
    <>
      <Routes>
        {/* Customer Experience Portal */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
        </Route>

        {/* Operational Kitchen Portal */}
        <Route path="/kitchen" element={<KitchenLayout />}>
          <Route index element={<KitchenDashboard />} />
          <Route path="new-orders" element={<NewOrdersPage />} />
          <Route path="active-orders" element={<ActiveOrdersPage />} />
          <Route path="completed-orders" element={<CompletedOrdersPage />} />
        </Route>

        {/* SaaS Management Console Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="orders" element={<OrdersOverviewPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Demo Mode Switcher for Evaluators */}
      <PortalSwitcher />
    </>
  );
}
