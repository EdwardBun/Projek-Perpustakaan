import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { Bar } from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


export default function Pinjam() {
    const navigate = useNavigate();
    const [peminjaman, setPeminjaman] = useState([]);
    const [pengembalian, setPengembalian] = useState([]);
    const [memberList, setMemberList] = useState([]);
    const [bukuList, setBukuList] = useState([]);
    const [error, setError] = useState({});
    const [isModalOpen, setModalIsOpen] = useState(false);
    const [formModal, SetFormModal] = useState({
        id_buku: '',
        id_member: '',
        tgl_pinjam: '',
        tgl_pengembalian: '',
    });
    const [alert, setAlert] = useState("");
    const [riwayatMember, setRiwayatMember] = useState([]);
    const pinjamChartData = peminjaman.reduce((acc, curr) => {
        const date = curr.tgl_pinjam;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(pinjamChartData),
        datasets: [
            {
                label: 'Jumlah Pinjam',
                data: Object.values(pinjamChartData),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Jumlah Peminjaman per Tanggal Pinjam',
            },
        },
    };




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
            const [resPeminjaman, resMember, resBuku] = await Promise.all([
                axios.get(API_URL + "/peminjaman", { headers: { Authorization: "Bearer " + token } }),
                axios.get(API_URL + "/member", { headers: { Authorization: "Bearer " + token } }),
                axios.get(API_URL + "/buku", { headers: { Authorization: "Bearer " + token } }),
            ]);

            setPeminjaman(resPeminjaman.data.data); 
            setMemberList(resMember.data);
            setBukuList(resBuku.data);     
        } catch (err) {
            console.error(err);
            setError({ message: "Gagal mengambil data!" });
            setPeminjaman([]);
        }
    }

    function handleSubmitModal(e) {
        e.preventDefault();
        const token = localStorage.getItem("access_token");

        axios.post(API_URL + "/peminjaman", formModal, {
            headers: {
                Authorization: "Bearer " + token,
            },
        })
        .then((res) => {
            SetFormModal({
                id_buku: '',
                id_member: '',
                tgl_pinjam: '',
                tgl_pengembalian: '',
            });
            setError({}); 
            setAlert("Berhasil meminjam buku!");

            setModalIsOpen(false);
            fetchData();

            setTimeout(() => setAlert(""), 3000);
        })
        .catch((err) => {
            console.error(err);
            setError({ message: "Gagal menyimpan data peminjaman!" });
        });
    }

    function handleKembalikan(id) {
        const token = localStorage.getItem("access_token");
        const peminjamanData = peminjaman.find((p) => p.id === id);

        if (!peminjamanData) {
            setError({ message: "Data peminjaman tidak ditemukan!" });
            return;
        }

        const today = new Date();
        const tglPengembalian = new Date(peminjamanData.tgl_pengembalian);

        const isLate = today > tglPengembalian;

        axios.put(`${API_URL}/peminjaman/pengembalian/${id}`, {}, {
            headers: {
                Authorization: "Bearer " + token,
            },
        })
        .then(async () => {
            if (isLate) {
                const lateDays = Math.ceil((today - tglPengembalian) / (1000 * 60 * 60 * 24));
                const jumlahDenda = lateDays * 2000;

                const dendaPayload = {
                    id_member: peminjamanData.id_member,
                    id_buku: peminjamanData.id_buku,
                    jumlah_denda: jumlahDenda.toString(),
                    jenis_denda: "terlambat",
                    deskripsi: `Telat mengembalikan buku selama ${lateDays} hari`
                };

                try {
                    await axios.post(API_URL + "/denda", dendaPayload, {
                        headers: {
                            Authorization: "Bearer " + token,
                        }
                    });
                    setAlert("Buku berhasil dikembalikan dan denda dibuat!");
                } catch (err) {
                    console.error(err);
                    setError({ message: "Gagal membuat data denda!" });
                }
            } else {
                setAlert("Buku berhasil dikembalikan!");
            }

            fetchData(); 
            setTimeout(() => setAlert(""), 3000);
        })
        .catch((err) => {
            console.error(err);
            setError({ message: "Gagal mengembalikan buku!" });
        });
    }

    async function fetchRiwayatMember(id_member) {
        const token = localStorage.getItem("access_token");
        try {
            const res = await axios.get(`${API_URL}/peminjaman/${id_member}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRiwayatMember(res.data.data);
        } catch (err) {
            console.error("Gagal mengambil riwayat member", err);
            setRiwayatMember([]);
        }
    }


    function getMemberName(id) {
        const member = memberList.find(m => m.id == id);
        return member ? member.nama : 'Tidak ditemukan';
    }

    function getBukuJudul(id) {
        const buku = bukuList.find(b => b.id == id);
        return buku ? buku.judul : 'Tidak ditemukan';
    }

    function exportToExcel() {
        const dataToExport = peminjaman.map((item, index) => ({
            No: index + 1,
            Member: getMemberName(item.id_member),
            Buku: getBukuJudul(item.id_buku),
            "Tanggal Pinjam": item.tgl_pinjam,
            "Tanggal Pengembalian": item.tgl_pengembalian,
            "Status Pengembalian": item.status_pengembalian === 1 ? "Sudah" : "Belum",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peminjaman");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "data_peminjaman.xlsx");
    }

    function exportRiwayatToPDF() {
        const doc = new jsPDF();

        doc.text("Riwayat Peminjaman Member", 14, 15);

        const tableColumn = ["No", "ID Buku", "Tgl Pinjam", "Tgl Kembali", "Status"];
        const tableRows = [];

        riwayatMember.forEach((item, index) => {
            const rowData = [
                index + 1,
                item.id_buku,
                item.tgl_pinjam,
                item.tgl_pengembalian,
                item.status_pengembalian === 1 ? "Sudah" : "Belum",
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save("riwayat_peminjaman.pdf");
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
                <button className="btn btn-success mx-2" onClick={exportToExcel}>Export Excel</button>
            </div>
            

            <table className="table table-bordered">
                <thead className="table-light">
                    <tr className="text-center">
                        <th>#</th>
                        <th>Member</th>
                        <th>Buku</th>
                        <th>Tgl Pinjam</th>
                        <th>Tgl Kembali</th>
                        <th>Status Pengembalian</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        peminjaman.map((value, index) => (
                            <tr className="text-center" key={value.id}>
                                <td>{index + 1}</td>
                                <td>{getMemberName(value.id_member)}</td>
                                <td>{getBukuJudul(value.id_buku)}</td>
                                <td>{value.tgl_pinjam}</td>
                                <td>{value.tgl_pengembalian}</td>
                                <td>{value.status_pengembalian === 1 ? "Sudah" : "Belum"}</td>
                                <td className="d-flex justify-content-center">
                                    {
                                        value.status_pengembalian === 0 && (
                                            <button className="btn btn-info mx-1" onClick={() => handleKembalikan(value.id)}>
                                                Kembalikan
                                            </button>
                                        )
                                    }
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            <select className="form-select" value={formModal.id_member} onChange={(e) => {
                const id_member = e.target.value;
                SetFormModal({ ...formModal, id_member });
                fetchRiwayatMember(id_member); 
            }}>
                <option value="" disabled hidden>-- Pilih Member --</option>
                {memberList.map((member) => (
                    <option key={member.id} value={member.id}>{member.nama}</option>
                ))}
            </select>

            {riwayatMember.length > 0 && (
                <div className="mt-4">
                    <h5>Riwayat Peminjaman Member Ini</h5>
                    <div className="d-flex justify-content-end mb-3">
                    <button className="btn btn-danger mt-2" onClick={exportRiwayatToPDF}>Export PDF</button>
                    </div>

                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID Buku</th>
                                <th>Tanggal Pinjam</th>
                                <th>Tanggal Pengembalian</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayatMember.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.id_buku}</td>
                                    <td>{item.tgl_pinjam}</td>
                                    <td>{item.tgl_pengembalian}</td>
                                    <td>{item.status_pengembalian === 1 ? "Sudah" : "Belum"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-5">
                <h4>Grafik Peminjaman Buku per Tanggal</h4>
                <Bar data={chartData} options={chartOptions} />
            </div>




            <Modal isOpen={isModalOpen} onClose={() => setModalIsOpen(false)} title="Pinjam Buku">
                <form onSubmit={handleSubmitModal}>
                    {
                        error.message && (
                            <div className="alert alert-danger">
                                {error.message}
                            </div>
                        )
                    }

                    <div>
                        <label className="form-label">Judul Buku</label>
                        <select className="form-select" value={formModal.id_buku} onChange={(e) => SetFormModal({ ...formModal, id_buku: e.target.value })}>
                            <option value="">-- Pilih Buku --</option>
                            {bukuList.map((buku) => (
                                <option key={buku.id} value={buku.id}>{buku.judul}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Nama Member</label>
                        <select className="form-select" value={formModal.id_member} onChange={(e) => SetFormModal({ ...formModal, id_member: e.target.value })}>
                            <option value="">-- Pilih Member --</option>
                            {memberList.map((member) => (
                                <option key={member.id} value={member.id}>{member.nama}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Tanggal Pinjam</label>
                        <input type="date" className="form-control" onChange={(e) => SetFormModal({ ...formModal, tgl_pinjam: e.target.value })}/>
                    </div>

                    <div>
                        <label className="form-label">Tanggal Kembali</label>
                        <input type="date" className="form-control" onChange={(e) => SetFormModal({ ...formModal, tgl_pengembalian: e.target.value })}/>
                    </div>

                    <div>
                        <button type="submit" className="btn btn-primary">Kirim</button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
