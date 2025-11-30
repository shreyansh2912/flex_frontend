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
import CreatePoll from './pages/Polls/CreatePoll';
import PollsList from './pages/Polls/PollsList';
import PollRoom from './pages/Polls/PollRoom';
import ParticipantRoom from "./pages/WordCloud/ParticipantRoom";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateSession from "./pages/WordCloud/CreateSession";
import AdminRoom from "./pages/WordCloud/AdminRoom";
import SessionResults from "./pages/WordCloud/SessionResults";
import CreateQnA from './pages/QnA/CreateQnA';
import QnAList from './pages/QnA/QnAList';
import QnARoom from './pages/QnA/QnARoom';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/form/:id" element={<PublicForm />} />
        <Route path="/word-cloud/join/:id" element={<ParticipantRoom />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
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
                  <Route path="/form/:id/submissions" element={<ViewSubmissions />} />
                  
                  <Route path="/polls" element={<PollsList />} />
                  <Route path="/create-poll" element={<CreatePoll />} />
                  <Route path="/poll/:id" element={<PollRoom />} />

                  <Route path="/qna" element={<QnAList />} />
                  <Route path="/create-qna" element={<CreateQnA />} />
                  <Route path="/qna/:id" element={<QnARoom />} />
                  
                  <Route path="/settings" element={<Settings />} />

                  <Route path="/word-cloud" element={<WordCloudDashboard />} />
                  <Route path="/word-cloud/create" element={<CreateSession />} />
                  <Route path="/word-cloud/admin/:id" element={<AdminRoom />} />
                  <Route path="/word-cloud/results/:id" element={<SessionResults />} />
                  
                  <Route path="*" element={"404 Not Found"} />
                </Routes>
              </Layout>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
