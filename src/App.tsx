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
// import WordCloud from "./pages/WordCloud";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
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
