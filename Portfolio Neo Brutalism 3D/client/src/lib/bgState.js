// Status bersama antara gerbang "PROJECT" (ProjectGate) dan latar WebGL (PageBackground).
// Gerbang menulis, latar membaca setiap frame. Semua satuan dalam CSS px, y ke bawah.
export const bgState = {
  holeX: 0, // pusat lubang huruf O di layar
  holeY: 0,
  holeR: 0, // radius lubang; 0 = tidak ada lingkaran contour
  contourAll: 0 // 1 = seluruh halaman sudah memakai latar contour
};
