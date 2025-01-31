import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import Layout from "./Layout";
import Login from "./Login";
import Register from "./Register";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Homepage/></Layout>}/>
          <Route path="/login" element={<Layout><Login/></Layout>}/>
          <Route path="/register" element={<Layout><Register/></Layout>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App;
