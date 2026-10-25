
import { Elysia } from "elysia";
import { db } from "../db";
import { produkTable } from "../db/schema";
import { eq } from "drizzle-orm";

export const produkRoute = new Elysia({
  prefix: "/produk",
})

// 1. READ semua produk
.get("/", async () => {
  const data = await db.select().from(produkTable);
  return data;
})

// READ satu produk berdasarkan ID
.get("/:id", async ({ params, set }) => {
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    set.status = 400;
    return { pesan: "ID produk tidak valid" };
  }

  const [data] = await db
    .select()
    .from(produkTable)
    .where(eq(produkTable.id, id));

  if (!data) {
    set.status = 404;
    return { pesan: "Produk tidak ditemukan" };
  }

  return data;
})

// 2. CREATE produk
.post("/", async ({ body, set }) => {
  const { namaBarang, stok, harga } = body as {
    namaBarang: string;
    stok?: number;
    harga: number;
  };

  if (
    typeof namaBarang !== "string" ||
    !namaBarang.trim() ||
    !Number.isInteger(harga) ||
    harga < 0 ||
    (stok !== undefined && (!Number.isInteger(stok) || stok < 0))
  ) {
    set.status = 400;
    return { pesan: "Nama barang, harga, atau stok tidak valid" };
  }

  const [data] = await db
    .insert(produkTable)
    .values({
      namaBarang: namaBarang.trim(),
      stok: stok ?? 0,
      harga,
    })
    .returning();

  set.status = 201;
  return data;
})

// 3. UPDATE produk
.put("/:id", async ({ params, body, set }) => {
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    set.status = 400;
    return { pesan: "ID produk tidak valid" };
  }

  const { namaBarang, stok, harga } = body as {
    namaBarang?: string;
    stok?: number;
    harga?: number;
  };

  if (
    (namaBarang !== undefined &&
      (typeof namaBarang !== "string" || !namaBarang.trim())) ||
    (stok !== undefined && (!Number.isInteger(stok) || stok < 0)) ||
    (harga !== undefined && (!Number.isInteger(harga) || harga < 0)) ||
    (namaBarang === undefined && stok === undefined && harga === undefined)
  ) {
    set.status = 400;
    return { pesan: "Data produk untuk diubah tidak valid" };
  }

  const perubahan: {
    namaBarang?: string;
    stok?: number;
    harga?: number;
  } = {};

  if (namaBarang !== undefined) perubahan.namaBarang = namaBarang.trim();
  if (stok !== undefined) perubahan.stok = stok;
  if (harga !== undefined) perubahan.harga = harga;

  const [data] = await db
    .update(produkTable)
    .set(perubahan)
    .where(eq(produkTable.id, id))
    .returning();

  if (!data) {
    set.status = 404;
    return { pesan: "Produk tidak ditemukan" };
  }

  return data;
})

// 4. DELETE produk
.delete("/:id", async ({ params, set }) => {
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    set.status = 400;
    return { pesan: "ID produk tidak valid" };
  }

  const [data] = await db
    .delete(produkTable)
    .where(eq(produkTable.id, id))
    .returning();

  if (!data) {
    set.status = 404;
    return { pesan: "Produk tidak ditemukan" };
  }

  return {
    pesan: "Produk berhasil dihapus",
    data,
  };
});
