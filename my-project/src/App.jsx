import React from "react";
import { Routes, Route } from "react-router-dom";
// import "../src/theme.css";
import Home from "./pages/HomePage";
// import About from "./pages/About";
import Contact from "./pages/Contact"

function App() {
  return (
    <div>
   
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/about" element={<About />} /> */}
        <Route path="/contact" element={<Contact />} />

      </Routes>
    </div>
  );
}

export default App;
