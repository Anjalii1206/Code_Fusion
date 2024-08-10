import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ChakraProvider>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: 'white',
              },
            },
          }}
        />
        <Router>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/editor/:roomID" element={<EditorPage/>}></Route>      
          </Routes>
        </Router>
      </div>
    </ChakraProvider>
  );
}

export default App;

/*roomID is a dynamic route parameter*/