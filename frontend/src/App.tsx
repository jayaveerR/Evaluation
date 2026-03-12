import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import UploadPapers from "./pages/UploadPapers";
import EvalDetails from "./pages/EvalDetails";
import StudentResults from "./pages/StudentResults";
import Profile from "./pages/Profile";
import AdminManageUsers from "./pages/AdminManageUsers";
import AdminManageExams from "./pages/AdminManageExams";
import AdminManageSubjects from "./pages/AdminManageSubjects";
import AdminAllEvaluations from "./pages/AdminAllEvaluations";
import AdminModelAnswers from "./pages/AdminModelAnswers";
import StudentDashboard from "./pages/StudentDashboard";
import StudentMyResults from "./pages/StudentMyResults";
import StudentResultDetail from "./pages/StudentResultDetail";
import StudentProfile from "./pages/StudentProfile";
import InstructorStudents from "./pages/InstructorStudents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          {/* Admin routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor-students" element={<InstructorStudents />} />
          <Route path="/manage-users" element={<AdminManageUsers />} />
          <Route path="/manage-exams" element={<AdminManageExams />} />
          <Route path="/manage-subjects" element={<AdminManageSubjects />} />
          <Route path="/upload" element={<UploadPapers />} />
          <Route path="/all-evaluations" element={<AdminAllEvaluations />} />
          <Route path="/eval-details" element={<EvalDetails />} />
          <Route path="/model-answers" element={<AdminModelAnswers />} />
          <Route path="/reports" element={<StudentResults />} />
          <Route path="/profile" element={<Profile />} />
          {/* Student routes */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/my-results" element={<StudentMyResults />} />
          <Route path="/result-detail/:id" element={<StudentResultDetail />} />
          <Route path="/student-profile" element={<StudentProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
