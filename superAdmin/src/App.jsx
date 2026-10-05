import { Routes, Route, Navigate } from 'react-router-dom'

import AdminLayout from './components/layout/AdminLayout'

import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'

import Registrations from './pages/registrations/Registrations'
import RegistrationDetails from './pages/registrations/RegistrationDetails'

import Shops from './pages/shops/Shops'
import ShopDetails from './pages/shops/ShopDetails'

import Owners from './pages/users/Owners'
import OwnerDetails from './pages/users/OwnerDetails'

import SubscriptionPlans from './pages/subscriptions/SubscriptionPlans'
import Subscriptions from './pages/subscriptions/Subscriptions'
import SubscriptionPayments from './pages/subscriptions/SubscriptionPayments'

import Reports from './pages/reports/Reports'
import Settings from './pages/settings/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      <Route path="/admin/login" element={<Login />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        <Route path="registrations" element={<Registrations />} />
        <Route path="registrations/:id" element={<RegistrationDetails />} />

        <Route path="shops" element={<Shops />} />
        <Route path="shops/:id" element={<ShopDetails />} />

        <Route path="owners" element={<Owners />} />
        <Route path="owners/:id" element={<OwnerDetails />} />

        <Route path="subscription-plans" element={<SubscriptionPlans />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="payments" element={<SubscriptionPayments />} />

        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  )
}

export default App
