import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Forgot from "./pages/auth/Forgot";
import Reset from "./pages/auth/Reset";

import { getLoginStatus } from "./services/authServices";
import { SET_LOGIN } from "./redux/features/auth/authslice";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from "react-redux";
import { useEffect } from "react";

axios.defaults.withCredentials = true;

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function loginStatus() {
      const status = await getLoginStatus();
      dispatch(SET_LOGIN(status));
    }
    loginStatus();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/forgot" element={<Forgot/>} />
        <Route path="/resetpassword/:resetToken" element={<Reset/>} />

        <Route path="/dashboard" element={
          <Sidebar>
            <Layout>
              <Dashboard/>
            </Layout>
          </Sidebar>
        }/>

        <Route path="/add-product" element={
          <Sidebar>
            <Layout>
              <AddProduct/>
            </Layout>
          </Sidebar>
        }/>

        <Route path="/product-detail/:id" element={
          <Sidebar>
            <Layout>
              <ProductDetail/>
            </Layout>
          </Sidebar>
        }/>

        <Route path="/edit-product/:id" element={
          <Sidebar>
            <Layout>
              <EditProduct/>
            </Layout>
          </Sidebar>
        }/>

        <Route path="/profile" element={
          <Sidebar>
            <Layout>
              <Profile/>
            </Layout>
          </Sidebar>
        }/>

        <Route path="/edit-profile" element={
          <Sidebar>
            <Layout>
              <EditProfile/>
            </Layout>
          </Sidebar>
        }/>

        <Route
          path="/contact-us"
          element={
            <Sidebar>
              <Layout>
                <Contact />
              </Layout>
            </Sidebar>
          }
        />

        <Route
          path="/invoice-maker"
          element={
            <Sidebar>
              <Layout>
                <Invoice />
              </Layout>
            </Sidebar>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
