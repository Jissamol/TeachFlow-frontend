import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignnUp";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import TeachingLearning from "./pages/TeachingLearning";
import StudentSupport from "./pages/StudentSupport";
import Research from "./pages/Research";
import AcademicContribution from "./pages/AcademicContribution";
import InstitutionalResponsibility from "./pages/InstitutionalResponsibility";
import Report from "./pages/Report";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} /> 
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } /> 
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } /> 
        <Route path="/pbas/teaching" element={
          <Layout>
            <TeachingLearning />
          </Layout>
        } /> 
        <Route path="/pbas/student-support" element={
          <Layout>
            <StudentSupport />
          </Layout>
        } /> 
        <Route path="/pbas/research" element={
          <Layout>
            <Research />
          </Layout>
        } /> 
        <Route path="/pbas/academic" element={
          <Layout>
            <AcademicContribution />
          </Layout>
        } /> 
        <Route path="/pbas/institutional" element={
          <Layout>
            <InstitutionalResponsibility />
          </Layout>
        } /> 
        <Route path="/pbas/report" element={
          <Layout>
            <Report />
          </Layout>
        } /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
