#!/bin/bash
# One-off script: populate product_analyses with 60 real analyses via the live API.
# Reuses the agreed review dataset (reviewSeed.json) through the normal /review/analyze pipeline.
API_URL="${API_URL:-https://046-paw-tubes.vercel.app/api/v1/review/analyze}"
API_KEY="${API_KEY:?set API_KEY env var}"

products=(
  "headphone bluetooth wireless|Headphone Bluetooth Wireless ANC|shopee"
  "sepatu sneakers pria|Sepatu Sneakers Pria Casual|tokopedia"
  "jam tangan digital|Jam Tangan Digital Sport|shopee"
  "kabel data type c|Kabel Data USB Type C|tokopedia"
  "kaos polos cotton combed|Kaos Polos Cotton Combed 30s|shopee"
  "power bank 10000mah|Power Bank Fast Charging 10000mAh|lazada"
  "tas ransel laptop|Tas Ransel Laptop Anti Air|tokopedia"
  "sandal jepit pria|Sandal Jepit Pria Karet|shopee"
  "mouse wireless gaming|Mouse Wireless Gaming RGB|tokopedia"
  "keyboard mechanical|Keyboard Mechanical Gaming|shopee"
  "kemeja flanel pria|Kemeja Flanel Pria Lengan Panjang|lazada"
  "celana jeans pria|Celana Jeans Pria Slim Fit|shopee"
  "blender portable|Blender Portable USB Charging|tokopedia"
  "rice cooker mini|Rice Cooker Mini 1 Liter|shopee"
  "air fryer listrik|Air Fryer Listrik Low Watt|lazada"
  "vacuum cleaner mini|Vacuum Cleaner Mini Portable|tokopedia"
  "lampu led emergency|Lampu LED Emergency USB|shopee"
  "charger fast charging|Charger Fast Charging 33W|tokopedia"
  "earphone kabel|Earphone Kabel Bass Booster|shopee"
  "speaker bluetooth mini|Speaker Bluetooth Mini Portable|lazada"
  "tripod hp fleksibel|Tripod HP Fleksibel Gorillapod|tokopedia"
  "ring light selfie|Ring Light Selfie LED|shopee"
  "casing hp silikon|Casing HP Silikon Anti Crack|tokopedia"
  "tempered glass hp|Tempered Glass HP Full Cover|shopee"
  "hijab segi empat|Hijab Segi Empat Voal Premium|tokopedia"
  "mukena travel|Mukena Travel Bahan Parasut|shopee"
  "sajadah lipat|Sajadah Lipat Travel|lazada"
  "parfum pria tahan lama|Parfum Pria Tahan Lama EDP|shopee"
  "skincare serum wajah|Skincare Serum Wajah Vitamin C|tokopedia"
  "sunscreen spf50|Sunscreen SPF 50 PA+++|shopee"
  "sepatu lari wanita|Sepatu Lari Wanita Ringan|tokopedia"
  "matras yoga|Matras Yoga Anti Slip|shopee"
  "dumbbell set|Dumbbell Set Adjustable|lazada"
  "botol minum olahraga|Botol Minum Olahraga BPA Free|tokopedia"
  "raket badminton|Raket Badminton Carbon|shopee"
  "sepatu futsal|Sepatu Futsal Grip Sole|tokopedia"
  "mainan edukasi anak|Mainan Edukasi Anak Kayu|shopee"
  "stroller bayi lipat|Stroller Bayi Lipat Ringan|lazada"
  "botol susu bayi|Botol Susu Bayi Anti Kolik|tokopedia"
  "diapers bayi|Diapers Bayi Pants XL|shopee"
  "kursi gaming|Kursi Gaming Ergonomis|tokopedia"
  "meja lipat laptop|Meja Lipat Laptop Portable|shopee"
  "rak buku minimalis|Rak Buku Minimalis Kayu|lazada"
  "gorden blackout|Gorden Blackout Anti UV|tokopedia"
  "karpet lantai bulu|Karpet Lantai Bulu Halus|shopee"
  "hanger baju anti slip|Hanger Baju Anti Slip Set|tokopedia"
  "toples kedap udara|Toples Kedap Udara Set 3pcs|shopee"
  "pisau dapur set|Pisau Dapur Set Stainless|lazada"
  "talenan kayu|Talenan Kayu Anti Bakteri|tokopedia"
  "tumbler stainless|Tumbler Stainless Steel 500ml|shopee"
  "kipas angin portable|Kipas Angin Portable USB|tokopedia"
  "humidifier aromaterapi|Humidifier Aromaterapi Mini|shopee"
  "lampu tidur bintang|Lampu Tidur Proyektor Bintang|lazada"
  "gembok pintu digital|Gembok Pintu Digital Fingerprint|tokopedia"
  "cctv wifi indoor|CCTV WiFi Indoor 360|shopee"
  "router wifi mini|Router WiFi Mini Portable|tokopedia"
  "hardisk eksternal 1tb|Hardisk Eksternal 1TB USB 3.0|shopee"
  "flashdisk 64gb|Flashdisk 64GB OTG Type C|lazada"
  "webcam hd laptop|Webcam HD 1080p Laptop|tokopedia"
  "microphone clip on|Microphone Clip On Wireless|shopee"
)

count=0
for entry in "${products[@]}"; do
  IFS='|' read -r keyword name platform <<< "$entry"
  resp=$(curl -s -X POST "$API_URL" \
    -H "X-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"keyword\":\"$keyword\",\"productName\":\"$name\",\"platform\":\"$platform\"}")
  status=$(echo "$resp" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);console.log(j.status+' cached='+j.cached)}catch(e){console.log('parse_error')}})")
  count=$((count+1))
  echo "[$count/${#products[@]}] $keyword -> $status"
  sleep 0.3
done
