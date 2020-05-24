import React, { useState, useEffect } from "react";
import Axios from "axios";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Nav from "./Components/Nav";
import Loading from "./Components/Loading";
import Error from "./Components/Error";

import Main from "./Components/Main";
import Signup from "./Vistas/Signup";
import Login from "./Vistas/Login";
import Upload from "./Vistas/Upload";
import Feed from "./Vistas/Feed";
import Post from "./Vistas/Post";
import Explore from "./Vistas/Explore";
import Perfil from "./Vistas/Perfil";
import ContactForm from './Vistas/contactForm';
import {
  setToken,
  deleteToken,
  getToken,
  initAxiosInterceptors,
} from "./Helpers/auth-helpers";

initAxiosInterceptors();

export default function App() {
  const [usuario, setUsuario] = useState(null); // no sabes si hay un usuario autenticado
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargarUsuario() {
      let token = getToken();
      if (!token) {
        setCargandoUsuario(false);
        return;
      }
      try {
        const { data: usuario } = await Axios.get("/api/usuarios/whoami");
        setUsuario(usuario);
        setCargandoUsuario(false);
      } catch (err) {
        console.log("err", err);
      }
    }

    cargarUsuario();
  }, []);

  async function login(email, password) {
    const { data } = await Axios.post("/api/usuarios/login", {
      email,
      password,
    }); //data.usaurio data.token
    setUsuario(data.usuario);
    setToken(data.token);
  }

  async function signup(usuario) {
    const { data } = await Axios.post("/api/usuarios/signup", usuario);
    setUsuario(data.usuario);
    setToken(data.token);
  }

  function logout() {
    console.log('logout')
    setUsuario(null);
    deleteToken();
  }

  function mostrarError(mensaje) {
    setError(mensaje);
  }

  function esconderError() {
    setError(null);
  }

  if (cargandoUsuario) {
    return (
      <Main center>
        <Loading />
      </Main>
    );
  }

  return (
    <Router>
      <Nav usuario={usuario} />
      <Error mensaje={error} esconderError={esconderError} />
      {usuario ? (
        <LoginRoutes mostrarError={mostrarError} usuario={usuario} logout={logout} />
      ) : (
        <LogoutRoutes
          login={login}
          signup={signup}
          mostrarError={mostrarError}
        />
      )}
    </Router>
  );
}

function LoginRoutes({ mostrarError, usuario, logout }) {
  return (
    <Switch>
      <Route
        path="/upload"
        render={(props) => <Upload {...props} mostrarError={mostrarError} />}
      ></Route>
      <Route
        path="/post/:id"
        render={(props) => (
          <Post {...props} mostrarError={mostrarError} usuario={usuario} />
        )}
      ></Route>
      <Route
        path="/explore/"
        render={(props) => (
          <Explore {...props} mostrarError={mostrarError} usuario={usuario} />
        )}
      ></Route>
      <Route
        path="/perfil/:username"
        render={(props) => (
          <Perfil {...props} mostrarError={mostrarError} usuario={usuario} logout={logout} />
        )}
      ></Route>
      <Route
        path="/"
        component={(props) => (
          <Feed
            {...props}
            mostrarError={mostrarError}
            usuario={usuario}
            default
          />
        )}
      ></Route>
    </Switch>
  );
}

function LogoutRoutes({ login, signup, mostrarError }) {
  return (
    <Switch>
      <Route
        path="/login"
        render={(props) => (
          <Login {...props} login={login} mostrarError={mostrarError} />
        )}
      ></Route>
      <Route
        path="/ContactForm"
        render={(props) => (
          <ContactForm {...props} login={login} mostrarError={mostrarError} />
        )}
      ></Route>
      <Route
        default
        exact
        render={(props) => (
          <Signup {...props} signup={signup} mostrarError={mostrarError} />
        )}
      ></Route>
    </Switch>
  );
}
