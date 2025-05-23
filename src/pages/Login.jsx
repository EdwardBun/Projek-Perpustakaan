import axios from "axios";
import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../constant";


export default function Login() {

    const [login, setLogin] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState({});

    const navigate = useNavigate();


function loginProcess(e) {
    e.preventDefault();

    if (login.email !== "fema@gmail.com" || login.password !== "12345678") {
        setError({ message: "Email atau password salah!" });
        return;
    }

    axios.post('http://45.64.100.26:88/perpus-api/public/api/login', login)
        .then(res => {
            console.log("Login berhasil:", res);

            const token = res.data.token;

            localStorage.setItem("access_token", token);
            localStorage.setItem("user", JSON.stringify(login.email));

            navigate("/dashboard");
        })
        .catch(err => {
            setError({ message: "Gagal login ke server!" });
        });
}



    return (
        <form className="card w-50 d-block mx-auto mt-5 p-4" onSubmit={(e) => loginProcess(e)}>
        <div className="card-header text-center fw-bold fs-3">Login</div>

            {
                error.message && (
                    <div className="alert alert-danger m-2 p-2">
                        {error.message}
                    </div>
                )
            }

            <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" id="email" onChange={(e) => setLogin({ ...login, email: e.target.value })}/>
            </div>
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" id="password" onChange={(e) => setLogin({ ...login, password: e.target.value })}/>
            </div>
            <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary btn-block">Login</button>
            </div>
            <div className="d-grid gap-2">
                <h6>Username : fema@gmail.com</h6>
                <h6>Password : 12345678</h6>
            </div>
        </form>
    );
};