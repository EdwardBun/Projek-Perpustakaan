import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";

export default function Buku() {
    const [buku, setBuku] = useState([]);
    const [error, setError] = useState({});
    const [isModalOpen, setModalIsOpen] = useState(false);
    const [formModal, SetFormModal] = useState({
        no_rak: '',
        judul: '',
        pengarang: '',
        tahun_terbit: '',
        penerbit: '',
        stok: 0,
        detail: ''
    });
    const [selectedBuku, setSelectedBuku] = useState(null);
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

        axios.get(API_URL + "/buku", {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setBuku(res.data);
            setError({});
        })
        .catch(err => {
            console.error(err);
            if (err.response?.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                navigate("/login");
            } else {
                setError({ message: "Gagal mengambil data buku!" });
            }
            setBuku([]);
        });
    }

    function handleSubmitModal(e) {
        e.preventDefault();

        const token = localStorage.getItem("access_token");

        axios.post(API_URL + "/buku", formModal, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setAlert("Buku berhasil ditambahkan!");
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
                setError({ message: "Gagal menambahkan buku!" });
            }
        });
    }

    function handleDetail(buku) {
        setSelectedBuku(buku);
        setDetailModalOpen(true);
    }

    function handleEdit(buku) {
        SetFormModal(buku);
        setEditModalOpen(true);
    }

    function handleUpdate(e) {
        e.preventDefault();

        axios.put(API_URL + "/buku/" + formModal.id, formModal, {
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
            setError({ message: "Gagal mengupdate data buku!" });
        });
    }

    function handleDelete(id) {
        if (!window.confirm("Yakin ingin menghapus data ini?")) return;

        axios.delete(API_URL + "/buku/" + id, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("access_token")
            }
        })
        .then(res => {
            setAlert("Data berhasil dihapus!");
            fetchData();
        })
        .catch(err => {
            setError({ message: "Gagal menghapus data buku!" });
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
                        <th>No Rak</th>
                        <th>Judul</th>
                        <th>Pengarang</th>
                        <th>Penerbit</th>
                        <th>Tahun Terbit</th>
                        <th>Stok</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        buku.map((value, index) => (
                            <tr className="text-center" key={value.id}>
                                <td>{index + 1}</td>
                                <td>{value.no_rak}</td>
                                <td>{value.judul}</td>
                                <td>{value.pengarang}</td>
                                <td>{value.penerbit}</td>
                                <td>{value.tahun_terbit}</td>
                                <td>{value.stok}</td>
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

            <Modal isOpen={isModalOpen} onClose={() => setModalIsOpen(false)} title="Tambah Buku">
                <form onSubmit={handleSubmitModal}>
                    {
                        error.message && (
                            <div className="alert alert-danger">
                                {error.message}
                            </div>
                        )
                    }

                    <div>
                        <label className="form-label">No Rak</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, no_rak: e.target.value })}/>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Judul</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, judul: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Pengarang</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, pengarang: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Penerbit</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, penerbit: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Tahun Terbit</label>
                        <input type="number" className="form-control" onChange={(e) => SetFormModal({ ...formModal, tahun_terbit: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Stok</label>
                        <input type="number" className="form-control" onChange={(e) => SetFormModal({ ...formModal, stok: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Detail Buku</label>
                        <input type="text" className="form-control" onChange={(e) => SetFormModal({ ...formModal, detail: e.target.value })}/>
                    </div>


                    <div>
                        <button type="submit" className="btn btn-primary">Kirim</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title="Detail Buku">
                {selectedBuku && (
                    <>
                        <p><strong>No Rak:</strong> {selectedBuku.no_rak}</p>
                        <p><strong>Judul:</strong> {selectedBuku.judul}</p>
                        <p><strong>Pengarang:</strong> {selectedBuku.pengarang}</p>
                        <p><strong>Penerbit:</strong> {selectedBuku.penerbit}</p>
                        <p><strong>Tahun Terbit:</strong> {selectedBuku.tahun_terbit}</p>
                        <p><strong>Stok:</strong> {selectedBuku.stok}</p>
                        <p><strong>Detail:</strong> {selectedBuku.detail}</p>
                    </>
                )}
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Buku">
                <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                        <label>No Rak</label>
                        <input type="text" className="form-control" value={formModal.no_rak} onChange={(e) => SetFormModal({ ...formModal, no_rak: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label>Judul</label>
                        <input type="text" className="form-control" value={formModal.judul} onChange={(e) => SetFormModal({ ...formModal, judul: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label>Pengarang</label>
                        <input type="text" className="form-control" value={formModal.pengarang} onChange={(e) => SetFormModal({ ...formModal, pengarang: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label>Penerbit</label>
                        <input type="date" className="form-control" value={formModal.penerbit} onChange={(e) => SetFormModal({ ...formModal, penerbit: e.target.value })} />
                    </div>
                   <div className="mb-3">
                        <label>Tahun terbit</label>
                        <input type="number" className="form-control" value={formModal.tahun_terbit} onChange={(e) => SetFormModal({ ...formModal, tahun_terbit: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label>Stok</label>
                        <input type="number" className="form-control" value={formModal.stok} onChange={(e) => SetFormModal({ ...formModal, stok: e.target.value })} />
                    </div>       
                    <div className="mb-3">
                        <label>Detail</label>
                        <input type="text" className="form-control" value={formModal.detail} onChange={(e) => SetFormModal({ ...formModal, detail: e.target.value })} />
                    </div>     

                    <button type="submit" className="btn btn-success">Update</button>
                </form>
            </Modal>
        </>
    )
}