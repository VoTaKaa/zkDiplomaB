// import { Route, Routes } from "react-router-dom";
import Login from "../pages/login.js";
import ShowDegrees from "../pages/issuer/ShowDegree.js";
import Students from "../pages/issuer/Students.js";
import DegreeHolder from "../pages/holder/DegreeHolder.js";
import DetailDegree from "../pages/holder/DetailDegree.js";
import Verified from "../pages/verifier/Verified.js";
import HomeIssuer from "../pages/issuer/HomeIssuer.js";
import LogoutPage from "../pages/logout.js";

export const routes = [
  // Default route redirects to login
  {
    path: "/",
    page: Login,
  },
  // Issuer routes
  {
    path: "/home-issuer",
    page: HomeIssuer,
  },
  {
    path: "/degrees-issuer",
    page: ShowDegrees,
  },
  {
    path: "/students",
    page: Students,
  },
  // Holder routes
  {
    path: "/degree-holder",
    page: DegreeHolder,
  },
  {
    path: "/degree-holder/detail",
    page: DetailDegree,
  },
  // Verifier routes
  {
    path: "/submited-proofs",
    page: Verified,
  },
  // Auth routes
  {
    path: "/login",
    page: Login,
  },
  {
    path: "/logout",
    page: LogoutPage,
  },
  // Redirect any unknown routes to login
  {
    path: "*",
    page: Login,
  },
];
