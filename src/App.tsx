// import { Footer } from "./components/Footer";
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './context/AppContextProvider';
import { Header } from './components/Header';
import { Canvas } from './pages/Canvas/Canvas';
import { GlobalStyle } from "./styles/global.ts";
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import { BrowserRouter , Routes, Route } from 'react-router-dom'

function App() {
  return (
    <AppProvider >
      <>
        <GlobalStyle />
        <Header />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/canva" element={<Canvas />} />
          </Routes>
        </BrowserRouter>

        <ToastContainer autoClose={3000} />
      </>
    </AppProvider>
  );
}

export default App;
