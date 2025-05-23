import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";

export default function Denda() {
    const [denda, setDenda] = useState([]);
    const [dendaLocal, setDendaLocal] = useState([]);
    const [error, setError] = useState({});
    const [isModalOpen, setModalIsOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const [memberList, setMemberList] = useState([]);
    const [bukuList, setBukuList] = useState([]);
    const [formModal, SetFormModal] = useState({
        id_member: '',
        id_buku: '',
        jumlah_denda: '',
        jenis_denda: '',
        deskripsi: '',
    });
    const navigate = useNavigate();


    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const [resDenda, resMember, resBuku] = await Promise.all([
                axios.get(API_URL + "/denda", { headers: { Authorization: "Bearer " + token } }),
                axios.get(API_URL + "/member", { headers: { Authorization: "Bearer " + token } }),
                axios.get(API_URL + "/buku", { headers: { Authorization: "Bearer " + token } }),
            ]);

            setDenda(resDenda.data.data); 
            setMemberList(resMember.data); 
            setBukuList(resBuku.data);     
        } catch (err) {
            console.error(err);
            setError({ message: "Gagal mengambil data!" });
            setDenda([]);
        }
    }

    function handleSubmitModal(e) {
        e.preventDefault();

        const token = localStorage.getItem("access_token");

        axios.post(API_URL + "/denda", formModal, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setAlert("Data Denda berhasil ditambahkan!");
            setModalIsOpen(false);
            fetchData();
        })
        .catch(err => {
            if (err.response?.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                navigate("/login");
            } else if (err.response?.data?.message) {
                setError({ message: err.response.data.message });
            } else {
                setError({ message: "Gagal menambahkan data Denda!" });
            }
        });
    }

    function getMemberName(id) {
        const member = memberList.find(m => m.id == id);
        return member ? member.nama : 'Tidak ditemukan';
    }

    function getBukuJudul(id) {
        const buku = bukuList.find(b => b.id == id);
        return buku ? buku.judul : 'Tidak ditemukan';
    }



    return (
        <>
            {
                alert && (
                    <div className="alert alert-success">
                        {alert}
                    </div>
                )
            }


            {
                error.message && (
                    <div className="alert alert-danger">
                        {error.message}
                    </div>
                )
            }

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={() => setModalIsOpen(true)}>+ ADD</button>
            </div>

            <table className="table table-bordered">
                <thead className="table-light">
                    <tr className="text-center">
                        <th>#</th>
                        <th>Member</th>
                        <th>Judul</th>
                        <th>Jumlah</th>
                        <th>Jenis</th>
                        <th>Deskripsi</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        denda.map((value, index) => (
                            <tr className="text-center" key={value.id}>
                                <td>{index + 1}</td>
                                <td>{getMemberName(value.id_member)}</td>
                                <td>{getBukuJudul(value.id_buku)}</td>
                                <td>{value.jumlah_denda}</td>
                                <td>{value.jenis_denda}</td>
                                <td>{value.deskripsi}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            <Modal isOpen={isModalOpen} onClose={() => setModalIsOpen(false)} title="Tambah Buku">
                <form onSubmit={handleSubmitModal}>
                    {
                        error.message && (
                            <div className="alert alert-danger">
                                {error.message}
                            </div>
                        )
                    }

                    <div className="mb-3">
                        <label className="form-label">Nama Member</label>
                        <select className="form-select" value={formModal.id_member} onChange={(e) => SetFormModal({ ...formModal, id_member: e.target.value })}>
                            <option value="" disabled hidden>-- Pilih Member --</option>
                            {memberList.map((member) => (
                                <option key={member.id} value={member.id}>{member.nama}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Judul Buku</label>
                        <select className="form-select" value={formModal.id_buku} onChange={(e) => SetFormModal({ ...formModal, id_buku: e.target.value })}>
                            <option value="" disabled hidden>-- Pilih Buku --</option>
                            {bukuList.map((buku) => (
                                <option key={buku.id} value={buku.id}>{buku.judul}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Jumlah Denda</label>
                        <input type="number" className="form-control" onChange={(e) => SetFormModal({ ...formModal, jumlah_denda: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Jenis Denda</label>
                        <select className="form-select" value={formModal.jenis_denda} onChange={(e) => SetFormModal({ ...formModal, jenis_denda: e.target.value })}>
                        <option value="" disabled hidden>-- Select Type --</option>
                        <option value="terlambat">Terlambat</option>
                        <option value="kerusakan">Kerusakan</option>
                        <option value="lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Deskripsi</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, deskripsi: e.target.value })}/>
                    </div>


                    <div>
                        <button type="submit" className="btn btn-primary">Kirim</button>
                    </div>
                </form>
            </Modal>
        </>
    )
}