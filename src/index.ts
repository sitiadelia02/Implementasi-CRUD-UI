import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import mahasiswa from "./routes/mahasiswa";
import { produkRoute } from "./routes/produk";

const app = new Elysia();
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(produkRoute);
console.log(app.routes.map(route => route.path));

// ====================
// GET
// ====================

// GET semua mahasiswa
app.get("/mahasiswa", () => {
    return mahasiswa;
});

// GET mahasiswa berdasarkan ID
app.get("/mahasiswa/:id", ({ params }) => {
    const data = mahasiswa.find(
        (m) => m.id === parseInt(params.id)
    );

    if (data) {
        return data;
    }

    return {
        message: "Mahasiswa not found"
    };
});


// ====================
// POST
// ====================

app.post("/mahasiswa", ({ body }) => {
    const newMahasiswa = {
        id: mahasiswa.length + 1,
        ...(body as {
            nama: string;
            gmail: string;
        })
    };

    mahasiswa.push(newMahasiswa);

    return {
        message: "Mahasiswa berhasil ditambahkan",
        data: newMahasiswa
    };
});


// ====================
// PUT
// ====================

app.put("/mahasiswa/:id", ({ params, body }) => {
    const id = parseInt(params.id);

    const index = mahasiswa.findIndex(
        (m) => m.id === id
    );

    if (index === -1) {
        return {
            message: "Mahasiswa not found"
        };
    }

    mahasiswa[index] = {
        id: id,
        ...(body as {
            nama: string;
            gmail: string;
        })
    };

    return {
        message: "Data mahasiswa berhasil diubah",
        data: mahasiswa[index]
    };
});


// ====================
// PATCH
// ====================

app.patch("/mahasiswa/:id", ({ params, body }) => {
    const id = parseInt(params.id);

    const index = mahasiswa.findIndex(
        (m) => m.id === id
    );

    if (index === -1) {
        return {
            message: "Mahasiswa not found"
        };
    }

    mahasiswa[index] = {
        ...mahasiswa[index],
        ...(body as Partial<{
            nama: string;
            gmail: string;
        }>)
    };

    return {
        message: "Data mahasiswa berhasil diperbarui",
        data: mahasiswa[index]
    };
});


// ====================
// DELETE
// ====================

app.delete("/mahasiswa/:id", ({ params }) => {
    const id = parseInt(params.id);

    const index = mahasiswa.findIndex(
        (m) => m.id === id
    );

    if (index === -1) {
        return {
            message: "Mahasiswa not found"
        };
    }

    const deletedMahasiswa = mahasiswa.splice(index, 1);

    return {
        message: "Mahasiswa berhasil dihapus",
        data: deletedMahasiswa[0]
    };
});


// ====================
// OPTIONS
// ====================

app.options("/mahasiswa", () => {
    return {
        message: "HTTP Methods yang tersedia",
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
            "HEAD"
        ]
    };
});


// ====================
// HEAD
// ====================

app.head("/mahasiswa", () => {
    return;
});


// ====================
// SERVER
// ====================
app.get("/", () => "BACKEND AKTIF");

app.listen(3001);

console.log(
    `Server running on http://${app.server?.hostname}:${app.server?.port}`
);