export const MODS=[
['V2.4.2',['Security hardening','Penguatan keamanan'],'PASS_SCOPED',['11/11 local validation gates passed in scope. No independent audit yet.','11/11 gerbang validasi lokal lulus dalam cakupan. Belum ada audit independen.'],'g'],
['V2.5',['AI integration & runtime validation','Integrasi AI & validasi runtime'],'PASS_SCOPED_LIVE',['48/48 acceptance assertions and 9 live endpoints passed in scope. Qwen API inference returned HTTP 200.','48/48 assertion akseptasi dan 9 endpoint live lulus dalam cakupan. Inferensi Qwen API menghasilkan HTTP 200.'],'g'],
['V2.5',['RAG approved grounding','Grounding RAG yang disetujui'],'OPEN',['Waiting for review and owner approval.','Menunggu review dan persetujuan pemilik.'],'o'],
['V2.5',['Internal CPU LoRA smoke test','Smoke test LoRA CPU internal'],'OPEN',['Finished, target not met. Resume check failed.','Selesai, target tidak tercapai. Pemeriksaan resume gagal.'],'o'],
['V2.6',['Engineering & protocol development','Pengembangan engineering & protokol'],'IN_PROGRESS',['41 work identifiers registered. Historical regression 7/7 passed.','41 identifier pekerjaan terdaftar. Regresi historis 7/7 lulus.'],'p'],
['V2.6',['QLoRA training','Pelatihan QLoRA'],'DEFERRED',['No GPU available. Not run.','GPU belum tersedia. Belum dijalankan.'],'d'],
['V2.6',['Digital Twin','Digital Twin'],'UNVERIFIED',['Offline replay only. No independent verification.','Hanya offline replay. Belum diverifikasi independen.'],'o'],
['V2.6',['External laboratory attestation','Atestasi laboratorium eksternal'],'OPEN',['Some historical attestation evidence is no longer fully available and is not reconstructed.','Sebagian bukti atestasi historis tidak lagi lengkap dan tidak direkonstruksi.'],'o'],
['V2.6',['Legal & intellectual property','Hukum & kekayaan intelektual'],'OPEN',['Still to be resolved.','Masih harus diselesaikan.'],'o'],
['V2.6',['Full release','Rilis penuh'],'BLOCKED',['Blocked by the open items above.','Terhambat oleh butir terbuka di atas.'],'b'],
['Mainnet',['Public mainnet','Mainnet publik'],'PLANNED',['No date. Needs further evaluation.','Belum ada tanggal. Perlu evaluasi lanjutan.'],'d']];

export const FILT=[['all',['All','Semua']],['g',['Scoped pass','Lulus terbatas']],['p',['In progress','Berjalan']],['o',['Open','Terbuka']],['b',['Blocked','Terhambat']],['d',['Deferred / planned','Ditunda / rencana']]];
