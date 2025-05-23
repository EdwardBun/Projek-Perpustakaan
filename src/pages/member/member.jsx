import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";

export default function Member() {

    const [member, setMember] = useState([]);
    const [error, setError] = useState({});
    const [isModalOpen, setModalIsOpen] = useState(false);
    const [formModal, SetFormModal] = useState({
        no_ktp: '',
        nama: '',
        alamat: '',
        tgl_lahir: ''
    });
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [alert, setAlert] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        axios.get(API_URL + "/member", {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setMember(res.data);
            setError({});
        })
        .catch(err => {
            console.error(err);
            if (err.response?.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                navigate("/login");
            } else {
                setError({ message: "Gagal mengambil data member!" });
            }
            setMember([]);
        });
    }

    function handleSubmitModal(e) {
        e.preventDefault();

        const token = localStorage.getItem("access_token");

        axios.post(API_URL + "/member", formModal, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setAlert("Data berhasil ditambahkan!");
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
                setError({ message: "Gagal menambahkan data member!" });
            }
        });
    }

    function handleDetail(member) {
        setSelectedMember(member);
        setDetailModalOpen(true);
    }

    function handleEdit(member) {
        SetFormModal(member);
        setEditModalOpen(true);
    }

    function handleUpdate(e) {
        e.preventDefault();

        axios.put(API_URL + "/member/" + formModal.id, formModal, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("access_token")
            }
        })
        .then(res => {
            setAlert("Data berhasil diupdate!");
            setEditModalOpen(false);
            fetchData();
        })
        .catch(err => {
            setError({ message: "Gagal mengupdate data member!" });
        });
    }

    function handleDelete(id) {
        if (!window.confirm("Yakin ingin menghapus data ini?")) return;

        axios.delete(API_URL + "/member/" + id, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("access_token")
            }
        })
        .then(res => {
            setAlert("Data berhasil dihapus!");
            fetchData();
        })
        .catch(err => {
            setError({ message: "Gagal menghapus data member!" });
        });
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
                        <th>No KTP</th>
                        <th>Member</th>
                        <th>Alamat</th>
                        <th>Tanggal Lahir</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        member.map((value, index) => (
                            <tr className="text-center" key={value.id}>
                                <td>{index + 1}</td>
                                <td>{value.no_ktp}</td>
                                <td>{value.nama}</td>
                                <td>{value.alamat}</td>
                                <td>{value.tgl_lahir}</td>
                                <td className="d-flex justify-content-center">
                                    <button className="btn btn-info mx-1" onClick={() => handleDetail(value)}>Detail</button>
                                    <button className="btn btn-primary mx-1" onClick={() => handleEdit(value)}>Edit</button>
                                    <button className="btn btn-danger mx-1" onClick={() => handleDelete(value.id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            <Modal isOpen={isModalOpen} onClose={() => setModalIsOpen(false)} title="Tambah Member">
                <form onSubmit={handleSubmitModal}>
                    {
                        error.message && (
                            <div className="alert alert-danger">
                                {error.message}
                            </div>
                        )
                    }

                    <div>
                        <label className="form-label">No KTP</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, no_ktp: e.target.value })}/>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Nama</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, nama: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Alamat</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, alamat: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Tanggal Lahir</label>
                        <input type="date" className="form-control" onChange={(e) => SetFormModal({ ...formModal, tgl_lahir: e.target.value })}/>
                    </div>

                    <div>
                        <button type="submit" className="btn btn-primary">Buat</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title="Detail Member">
                {selectedMember && (
                    <>
                        <p><strong>No KTP:</strong> {selectedMember.no_ktp}</p>
                        <p><strong>Nama:</strong> {selectedMember.nama}</p>
                        <p><strong>Alamat:</strong> {selectedMember.alamat}</p>
                        <p><strong>Tanggal Lahir:</strong> {selectedMember.tgl_lahir}</p>
                    </>
                )}
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Member">
                <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                        <label>No KTP</label>
                        <input type="text" className="form-control" value={formModal.no_ktp} onChange={(e) => SetFormModal({ ...formModal, no_ktp: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label>Nama</label>
                        <input type="text" className="form-control" value={formModal.nama} onChange={(e) => SetFormModal({ ...formModal, nama: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label>Alamat</label>
                        <input type="text" className="form-control" value={formModal.alamat} onChange={(e) => SetFormModal({ ...formModal, alamat: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label>Tanggal Lahir</label>
                        <input type="date" className="form-control" value={formModal.tgl_lahir} onChange={(e) => SetFormModal({ ...formModal, tgl_lahir: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-success">Update</button>
                </form>
            </Modal>


        </>
    );
}
