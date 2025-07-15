// import { Footer } from "./components/Footer";
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './context/AppContextProvider';
import { Header } from './components/Header';
import { Canvas } from './pages/Canvas/Canvas';
import { GlobalStyle } from "./styles/global.ts";
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home';
import { useState } from 'react';
import SideBar from './components/SideBar/SideBar';
import CallSideBar from './components/CallSideBar/CallSideBar';
import Account from './pages/Account/Account';
import Projects from './pages/Projects/Projects';
import MainLayout from './components/MainLayout/MainLayout';

function App() {

  return (
    <AppProvider >
      <>
        <BrowserRouter>
          <Header />
          <GlobalStyle />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/canva" element={<Canvas />} />
            <Route path="/register" element={<Register />} />

            <Route element={<MainLayout />} >
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Routes>
        </BrowserRouter>

        <ToastContainer autoClose={3000} />
      </>
    </AppProvider>
  );
}

export default App;
