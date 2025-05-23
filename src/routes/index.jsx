import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import Template from "../layout/Template";
import Dashboard from "../pages/Dashboard";
import Member from "../pages/member/member";
import Buku from "../pages/buku/buku";
import Pinjam from "../pages/peminjaman/pinjam";
import Denda from "../pages/denda/denda";
import PrivateRoute from "../pages/middleware/PrivateRoute";

export const router = createBrowserRouter([
    { 
        path: '/', 
        element: <Template />, 
        children: [
            { path: 'login', element: <Login /> },
            { 
                path: '/',  
                element: <PrivateRoute />,
                children:  [
                    { path: 'dashboard', element: <Dashboard /> }, 
                    { path: 'member', element: <Member /> },
                    { path: 'buku', element: <Buku /> },
                    { path: 'peminjaman', element: <Pinjam /> },
                    { path: 'denda', element: <Denda /> },
                ]
            }
        ],
    },
])
