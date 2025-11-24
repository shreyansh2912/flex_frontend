import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateForm from "./pages/CreateForm";
import ViewForm from "./pages/ViewForm";
import SubmitForm from "./pages/SubmitForm";
import Layout from "./components/layout/Layout";
import ViewSubmissions from "./pages/ViewSubmissions";
import Forms from "./pages/Forms";
import ShareForm from "./pages/ShareForm";
import WordCloud from "./pages/WordCloud";
import PublicForm from "./pages/PublicForm";
import WordCloudDashboard from "./pages/WordCloud/WordCloudDashboard";
import CreateSession from "./pages/WordCloud/CreateSession";
import AdminRoom from "./pages/WordCloud/AdminRoom";
import ParticipantRoom from "./pages/WordCloud/ParticipantRoom";
import SessionResults from "./pages/WordCloud/SessionResults";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/form/:id" element={<PublicForm />} />
        <Route path="/word-cloud/join/:id" element={<ParticipantRoom />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/create-form" element={<CreateForm />} />
                <Route path="/form/:id" element={<ViewForm />} />
                <Route path="/form/:id/submit" element={<SubmitForm />} />
                <Route path="/form/:id/share" element={<ShareForm />} />
                <Route path="/wordcloud" element={<WordCloud />} />
                <Route path="/form/:id/submissions" element={<ViewSubmissions />} />
                
                {/* Word Cloud Routes */}
                <Route path="/word-cloud" element={<WordCloudDashboard />} />
                <Route path="/word-cloud/create" element={<CreateSession />} />
                <Route path="/word-cloud/admin/:id" element={<AdminRoom />} />
                <Route path="/word-cloud/results/:id" element={<SessionResults />} />
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={"404 Not Found"} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
