# metadata-X
**Peek inside your photos — see the hidden secrets, clean them, and protect your privacy!**

A simple, browser-based tool that extracts and analyzes image metadata (EXIF, GPS, XMP, etc.) for security awareness, privacy testing, and digital forensics.  
Runs **entirely client-side** — no server required.

---

## 🚀 Features

- 📁 Upload or paste an image URL  
- 🧠 Extracts EXIF, GPS, and XMP metadata  
- ⚠️ Flags potential data leaks (device info, GPS, software)  
- 🗺️ Open coordinates on a map or reverse geocode them  
- 🧹 Strip metadata & download clean image  
- 🧾 Export full JSON analysis report  
- 💻 100% local processing (no backend)

---

## 🧩 Use Cases
- Digital Forensics awareness  
- Offensive security / bug bounty info disclosure demo  
- Privacy and metadata leak education  

---
# 🧠 metadata-X


---

## About

**metadata-X** is a lightweight, browser-based tool that lets you explore all the hidden details stored in your images, also called **metadata**.  

With metadata-X, you can:  
- See when and where a photo was taken  
- Check which device was used (camera/phone)  
- Examine any additional info stored in the image  
- Download metadata as JSON for your records  
- Strip metadata to create a clean version of your photo  

Everything runs **locally in your browser**, so your photos never leave your computer — keeping your privacy safe.  

---

## Demo

![Preview](https://via.placeholder.com/600x300.png?text=metadata-X+Preview)

---

## Features

- Upload an image or paste a URL  
- Optional CORS proxy for remote images  
- Image preview before analyzing  
- Summary of key metadata: date, device, GPS  
- Raw JSON metadata output  
- Heuristics & privacy flags  
- Download cleaned image or JSON metadata  
- Optional map and reverse geocode for GPS data  

---

## How to Use

1. **Open `index.html` in your browser** (no server needed)  
2. **Upload a photo** or **paste an image URL**  
3. Click **Analyze**  
4. View the **summary**, **raw metadata**, and **flags**  
5. Optional: click **Strip Metadata** to download a clean version  
6. Optional: click **Download JSON** to save the metadata  

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/haykeenss/metadata-X.git
