import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";

export interface ParsedIntentResult {
  intent: "FINANCE" | "REMINDER" | "NOTE" | "QUERY_FINANCE" | "QUERY_REMINDERS" | "QUERY_NOTES" | "CHAT";
  data?: {
    // Finance data
    type?: "income" | "expense";
    amount?: number;
    category?: string;
    payment_method?: string;
    note?: string;

    // Reminder data
    message?: string;
    remind_at?: string; // ISO 8601 string

    // Note data
    title?: string;
    content?: string;
  };
  reply: string; // Natural Indonesian conversational response for WhatsApp
}

let genAI: GoogleGenerativeAI | null = null;

export const initGemini = () => {
  if (!config.geminiApiKey) {
    console.warn("⚠️ [Gemini] GEMINI_API_KEY belum dikonfigurasi di file .env");
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    console.log("✅ [Gemini] Gemini AI SDK berhasil diinisialisasi");
  }
  return genAI;
};

export const parseMessageWithGemini = async (
  userMessage: string,
  userJid: string
): Promise<ParsedIntentResult> => {
  const ai = initGemini();

  // Fallback jika API key belum diisi
  if (!ai) {
    return {
      intent: "CHAT",
      reply:
        "⚠️ Fitur AI belum aktif karena `GEMINI_API_KEY` belum diisi di backend/.env. Silakan dapatkan API key gratis di Google AI Studio (https://aistudio.google.com).",
    };
  }

  try {
    const model = ai.getGenerativeModel({
      model: config.geminiModel,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // rendah agar deterministik dan presisi
      },
    });

    const now = new Date();
    const currentIso = now.toISOString();
    const currentLocalStr = now.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "long",
    });

    const systemPrompt = `
Anda adalah Asisten Pribadi Pintar (AI Personal Assistant) yang bertugas mengekstrak intent dan data terstruktur dari pesan WhatsApp pengguna berbahasa Indonesia.

Waktu saat ini (Reference Time):
- Waktu Lokal (WIB): ${currentLocalStr}
- ISO String: ${currentIso}

Tugas Anda: Analisis pesan pengguna dan klasifikasikan ke dalam SALAH SATU intent berikut:
1. "FINANCE": Pengguna mencatat pengeluaran atau pemasukan uang.
   - Contoh: "Beli makan siang 25rb pakai bca", "Keluar 50.000 buat bensin", "Dapat gaji freelance 1.5jt", "Pemasukan 500k dari jual baju".
   - Ekstrak:
     * type: "income" atau "expense"
     * amount: angka numerik murni tanpa simbol (misal 25rb -> 25000, 1.5jt -> 1500000)
     * category: kategori relevan (misal: "Makanan & Minuman", "Transportasi", "Gaji", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Lainnya")
     * payment_method: metode pembayaran jika disebut (misal "BCA", "Gopay", "OVO", "Tunai", "Cash"). Default: "Cash"
     * note: ringkasan keterangan transaksi (misal: "Beli makan siang")
     
2. "REMINDER": Pengguna meminta diingatkan tentang suatu agenda, tugas, atau hal penting pada waktu tertentu.
   - Contoh: "Ingatkan saya rapat besok jam 10 pagi", "Nanti sore jam 16:30 ingatkan jemput adik", "Ingatkan bayar wifi 3 hari lagi jam 9 pagi", "Ingatkan 10 menit lagi angkat jemuran".
   - Ekstrak:
     * message: hal yang harus diingatkan (misal: "Rapat dengan tim")
     * remind_at: waktu pengingat dalam format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ atau dengan timezone offset yang tepat di masa depan). Pastikan waktu pengingat berada di masa depan berdasarkan Reference Time!

3. "NOTE": Pengguna ingin mencatat ide, informasi penting, atau catatan singkat tanpa waktu pengingat spesifik.
   - Contoh: "Catat ide: Bikin SaaS portfolio", "Simpan catatan: Resep nasi goreng spesial", "Catat nomor rekening pak budi 12345678".
   - Ekstrak:
     * title: judul singkat catatan (misal: "Ide SaaS Portfolio")
     * content: isi lengkap catatan yang ingin disimpan
     * category: kategori catatan (misal: "Ide", "Pekerjaan", "Pribadi", "Keuangan")

4. "QUERY_FINANCE": Pengguna menanyakan rekap/ringkasan keuangannya.
   - Contoh: "Berapa pengeluaran saya bulan ini?", "Cek sisa saldo", "Rekap keuangan minggu ini".

5. "QUERY_REMINDERS": Pengguna menanyakan jadwal pengingatnya.
   - Contoh: "Ada pengingat apa saja hari ini?", "Lihat jadwal reminder saya".

6. "QUERY_NOTES": Pengguna meminta daftar catatannya.
   - Contoh: "Lihat catatan saya", "Apa saja ide yang tersimpan?".

7. "CHAT": Percakapan umum, sapaan, atau pertanyaan di luar kategori di atas.
   - Contoh: "Halo", "Siapa kamu?", "Cara pakai bot ini gimana?".

Format Output JSON WAJIB seperti ini:
{
  "intent": "FINANCE" | "REMINDER" | "NOTE" | "QUERY_FINANCE" | "QUERY_REMINDERS" | "QUERY_NOTES" | "CHAT",
  "data": { ...sesuai intent... },
  "reply": "Pesan balasan ramah dalam bahasa Indonesia yang ringkas, jelas, dan informatif untuk dikirim langsung ke WhatsApp pengguna"
}
`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Pesan pengguna: "${userMessage}"` },
    ]);

    const responseText = result.response.text().trim();
    // Parse JSON safely
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed: ParsedIntentResult = JSON.parse(cleanJson);
    return parsed;
  } catch (error: any) {
    console.error("❌ [Gemini Error]:", error?.message || error);
    return {
      intent: "CHAT",
      reply: "Maaf, saya mengalami kendala saat memproses pesan Anda. Coba ulangi dengan kalimat yang lebih sederhana ya.",
    };
  }
};

