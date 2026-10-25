

<script>
  import { onMount } from 'svelte';

  const API_URL = 'http://localhost:3001/produk';

  let produk = $state([]);
  let namaBarang = '';
  let stok = 0;
  let harga = 0;
  let editId = null;
  let loading = true;
  let sedangMenyimpan = false;
  let pesanError = '';

  // Ambil data produk dari database
  onMount(() => {
    muatProduk();
  });

  async function muatProduk() {
    loading = true;
    pesanError = '';

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Gagal mengambil data produk.');
      }

      produk = await response.json();
console.log('DATA PRODUK DARI API:', produk);
    } catch (error) {
      pesanError =
        'Tidak bisa mengambil data. Periksa backend dan koneksi API.';
      console.error(error);
    } finally {
      loading = false;
    }
  }

  // Tambah produk baru atau simpan perubahan
  async function simpanProduk() {
    if (
      !namaBarang.trim() ||
      !Number.isInteger(Number(stok)) ||
      Number(stok) < 0 ||
      !Number.isInteger(Number(harga)) ||
      Number(harga) <= 0
    ) {
      alert('Isi nama barang, stok, dan harga dengan benar!');
      return;
    }

    sedangMenyimpan = true;
    pesanError = '';

    try {
      const dataProduk = {
        namaBarang: namaBarang.trim(),
        stok: Number(stok),
        harga: Number(harga)
      };

      const response = await fetch(
        editId !== null ? `${API_URL}/${editId}` : API_URL,
        {
          method: editId !== null ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataProduk)
        }
      );

      const hasil = await response.json();

      if (!response.ok) {
        throw new Error(hasil.pesan || 'Gagal menyimpan produk.');
      }

      resetForm();
      await muatProduk();
      alert(editId !== null ? 'Produk berhasil diubah!' : 'Produk berhasil ditambahkan!');
    } catch (error) {
      pesanError = error.message || 'Terjadi kesalahan saat menyimpan produk.';
      console.error(error);
    } finally {
      sedangMenyimpan = false;
    }
  }

  // Masukkan data produk ke form untuk diedit
  function editProduk(item) {
    editId = item.id;
    namaBarang = item.namaBarang;
    stok = item.stok;
    harga = item.harga;
  }

  // Hapus produk dari database
  async function hapusProduk(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    pesanError = '';

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const hasil = await response.json();

      if (!response.ok) {
        throw new Error(hasil.pesan || 'Gagal menghapus produk.');
      }

      if (editId === id) resetForm();

      await muatProduk();
      alert('Produk berhasil dihapus!');
    } catch (error) {
      pesanError = error.message || 'Terjadi kesalahan saat menghapus produk.';
      console.error(error);
    }
  }

  // Kosongkan form
  function resetForm() {
    namaBarang = '';
    stok = 0;
    harga = 0;
    editId = null;
  }
</script>


<svelte:head>
  <title>CRUD Produk</title>
  <meta name="description" content="Manajemen data produk" />
</svelte:head>

<main>
  <header>
    <div>
      <p class="label">MANAJEMEN DATA</p>
      <h1>Data Produk</h1>
      <p class="subtitle">Kelola daftar produk kamu dengan mudah.</p>
    </div>
    <span class="count">{produk.length} Produk</span>
  </header>

  <section class="panel">
    <h2>{editId !== null ? 'Edit Produk' : 'Tambah Produk'}</h2>

    <form onsubmit={(event) => { event.preventDefault(); simpanProduk(); }}>
      <label>
        Nama Barang
        <input bind:value={namaBarang} placeholder="Contoh: Buku Tulis" required />
      </label>

      <label>
        Stok
        <input type="number" bind:value={stok} min="0" required />
      </label>

      <label>
        Harga (Rp)
        <input type="number" bind:value={harga} min="1" required />
      </label>

      <div class="actions">
        <button type="submit">{editId !== null ? 'Simpan Perubahan' : 'Tambah Produk'}</button>
        {#if editId !== null}
          <button type="button" class="secondary" onclick={resetForm}>Batal</button>
        {/if}
      </div>
    </form>
  </section>

  <section class="panel">
    <h2>Daftar Produk</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Barang</th>
            <th>Stok</th>
            <th>Harga</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#each produk as item (item.id)}
            <tr>
              <td>{item.id}</td>
              <td>{item.namaBarang}</td>
              <td>{item.stok}</td>
              <td>Rp {item.harga.toLocaleString('id-ID')}</td>
              <td>
                <div class="actions">
                  <button class="edit" onclick={() => editProduk(item)}>Edit</button>
                  <button class="delete" onclick={() => hapusProduk(item.id)}>Hapus</button>
                </div>
              </td>
            </tr>
          {:else}
            <tr><td colspan="5" class="empty">Belum ada produk.</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    background: #f4f7f5;
    color: #202b25;
    font-family: Arial, sans-serif;
  }
  main { max-width: 1100px; margin: 0 auto; padding: 40px 24px; }
  header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 28px; }
  .label { color: #16804a; font-size: 12px; font-weight: bold; letter-spacing: 2px; }
  h1 { margin: 8px 0; font-size: 32px; }
  h2 { margin-top: 0; font-size: 19px; }
  .subtitle { color: #718078; }
  .count { background: #e0f3e7; color: #176b40; border-radius: 20px; padding: 10px 16px; white-space: nowrap; }
  .panel { background: white; border: 1px solid #e4eae6; border-radius: 14px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 15px #24382d08; }
  form { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  label { display: flex; flex-direction: column; gap: 8px; font-size: 14px; font-weight: 600; }
  input { width: 100%; border: 1px solid #d9e1dc; border-radius: 8px; padding: 12px; font-size: 14px; }
  input:focus { outline: 2px solid #a6d9b8; border-color: #16804a; }
  .actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
  form .actions { align-self: end; }
  button { cursor: pointer; border: 0; border-radius: 7px; padding: 11px 14px; background: #176b40; color: white; font-weight: 600; }
  button.secondary { background: #e9eeeb; color: #37483e; }
  button.edit { background: #e3efff; color: #225da8; }
  button.delete { background: #ffebeb; color: #b83232; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; text-align: left; }
  th, td { padding: 15px 12px; border-bottom: 1px solid #edf0ee; white-space: nowrap; }
  th { color: #69766e; font-size: 12px; text-transform: uppercase; background: #f8faf8; }
  .empty { text-align: center; color: #718078; padding: 28px; }
  @media (max-width: 750px) {
    main { padding: 24px 14px; }
    header { align-items: flex-start; }
    h1 { font-size: 26px; }
    .panel { padding: 17px; }
    form { grid-template-columns: 1fr; }
  }
</style>

