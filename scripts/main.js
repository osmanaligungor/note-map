import { personIcon } from "./constants.js";
import ui from "./ui.js";
import getIcon, { getStatus } from "./helpers.js";
// * Global Değişkenler
// Haritada tıklanan son konumu tutacağız

let map;
let clickedCoords;
let layer;
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// notes değerini kaybetmemek lazım çünkü localStorage'daki verileri sayfa yenilendiğinde yeniden kullanacağız. Tamam kaydediyoruz ama bu verileri bir dizide tutmamız gerekiyor. Dolayısıyla localStorage.getItem("notes"); ile verileri localStorage'dan getireceğiz. Ancak burada da bir problem var localStorage string tipi veri tuttuğu için string'i diziye çevireceğiz. JSON.parse(); ile string'i diziye çevireceğiz.

/*
 * Kullanıcının konumunu öğrenmek için getCurrentPosition methodunu kullanacağız.
 * Kullanıcıya konumunu paylaşmak isteyip istemediğini soracağız.
 * 1) Paylaşırsa haritayı kullanıcının konumuna göre ayarlayacağız.
 * 2) Paylaşmazsa haritayı Ankara'ya ayarlayacağız.
 */
// window.navigator.geolocation.getCurrentPosition() konumu öğrenmek için kullanırız.
window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum");
  },
  () => {
    loadMap([39.919927, 32.852875], "Varsayılan Konum");
  }
);

// * Haritayı Yükleyen Fonksiyon
function loadMap(currentPosition, msg) {
  // 1) Harita Kurulum / Merkez Belirleme
  map = L.map("map", {
    zoomControl: false,
  }).setView(currentPosition, 9);

  // sağ aşağıya zoom butonları ekle (leaflet kütüphasinin özelliği)
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  // 2) Haritayı Ekrana Basar
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // haritanın üzerine imleçleri ekleyeceğimiz bir katman oluştur.
  layer = L.layerGroup().addTo(map);

  // 3) İmleç Ekle
  var marker = L.marker(currentPosition, { icon: personIcon })
    .addTo(map)
    .bindPopup(msg);

  // 4) Haritada tıklanma olaylarını izle
  map.on("click", onMapClick);

  // 5) Ekrana daha önce eklenen notları bas
  renderNotes();
  renderMarkers();
}

// * Haritaya Tıklanma olayında çalışacak fonksiyon
function onMapClick(e) {
  // tıklanan konumun koordinatlarını global değişkene ata çünkü kullanacağız.
  clickedCoords = [e.latlng.lat, e.latlng.lng];

  // aside elementine add class'ını ekle
  ui.aside.className = "add";
}

// * İptal butonuna tıklanınca menüyü kapat
ui.cancelBtn.addEventListener("click", () => {
  // aside elementinden add class'ını kaldır
  ui.aside.className = "";
});

// * Form Gönderilince
ui.form.addEventListener("submit", (e) => {
  // sayfa yenilenmesini engelleyeceğiz
  e.preventDefault();

  // inputlardaki verilere erişmeliyiz. Bunun için console.dir(e.target); yapıp içerisinden yani diziden kaçıncı elemansa onun değerini çekip değişkene atıyoruz.
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // yeni bir nesne oluşturup
  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
  };

  // nesneyi global değişkene kaydet (bunun için globalde bir değişken oluşturduk bu değişkeni başlangıçta boş dizi yaptık)
  notes.unshift(newNote);

  // değişkene atadık ama sayfayı yenileyince bu bilgileri kaybediyoruz. doğal olarak bu bilgileri localstorage ' a kaydedeceğiz.
  // localstorage'ı güncelle
  // localStorage.setItem("notes", notes); metodu ile localStorage 'a verileri kaydetmeye yarayan fonksiyonu yazarız. ilk "notes" kaydetmek istediğimiz verinin ismi diğeri ise kaydetmek istediğimiz veri. Ancak bu şekilde çalışmaz. Çünkü localStorage yapısı gereği sadece ve sadece string verileri tutar. Biz de bunu çevirmeliyiz. Bu çevirmeyi de JSON.stringify(notes) ile yaparız.
  localStorage.setItem("notes", JSON.stringify(notes));

  // aside alanından "add" classını kaldır.
  ui.aside.className = "";

  // formu temizle
  e.target.reset();

  // yeni notun ekrana gelmesi için notları tekrar renderlamamız lazım.
  renderNotes();
  renderMarkers();
});

// * Ekrana imleçleri bas
function renderMarkers() {
  // eski imleçleri kaldır (Çünkü katmandaki imleçlerin üzerine sürekli yeniden ekleniyor.) Bunu da dökümantastondaki layer.clearLayers(); ile çözüyoruz.
  layer.clearLayers();
  notes.forEach((item) => {
    // item'ın status'üne bağlı iconu belirledik
    const icon = getIcon(item.status);
    // Marker oluştur / imleçler katmanına ekle (addTo(layer)) ile / imlece bir popup ekle (bindPopup(item.title)) ile
    L.marker(item.coords, { icon }).addTo(layer).bindPopup(item.title);
  });
}

// * Ekrana notları bas
function renderNotes() {
  const noteCardS = notes
    .map((i) => {
      //tarihi kullanıcı dostu formata çevirdik.
      const date = new Date(i.date).toLocaleString("tr", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // status değerini çevir
      const status = getStatus(i.status);

      // oluşturulacak note'un html içeriğini belirledik.
      return `
            <li>
                <div>
                    <p>${i.title}</p>
                    <p>${date}</p>
                    <p>${status}</p>
                </div>
                <div class="icons">
                    <i data-id="${i.id}" class="bi bi-airplane-fill" id="fly"></i>
                    <i data-id="${i.id}" class="bi bi-trash3-fill" id="delete"></i>
                </div>
            </li>
  `;
    })
    .join("");
  // note'ları liste alanında renderlıyoruz
  ui.list.innerHTML = noteCardS;
  // ekrandaki delete id'li iconları al ve tıklanma olaylarında silme fonksiyonunu çağır.
  document.querySelectorAll("li #delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteNote(btn.dataset.id));
  });
  // ekrandaki fly id'li iconları al ve tıklanma olaylarında uçuş fonksiyonunu çağır.
  document.querySelectorAll("li #fly").forEach((btn) => {
    btn.addEventListener("click", () => flyToLocation(btn.dataset.id));
  });
}

// * Silme butonuna tıklanınca
function deleteNote(id) {
  // notu silmeden önce kullanıcıya soruyoruz
  const res = confirm("Notu silmeyi onaylıyormusunuz?");
  // onaylarsa sil
  if (res) {
    // id'sini bildiğimiz elemanı diziden kaldırmak için (filter) metodunu veya (splice) metodunu kullanırız.
    notes = notes.filter((i) => i.id !== +id);
    // * localStorage'ı güncelle
    localStorage.setItem("notes", JSON.stringify(notes));
    // * silme işleminden sonra güncel notları ekrana bas
    renderNotes();
    // * silme işleminden sonra güncel imleçleri ekrana bas
    renderMarkers();
  }
}

// * Uçuş butonuna tıklanınca
function flyToLocation(id) {
  // id'si bilinen elemanı dizide bulmak için (find) metodunu kullanacağız. Yani id'si bilinen elemanın koordinatlarına gideceğimiz için bunu kullanacağız.
  const note = notes.find((i) => i.id === +id);
  // notun koordinatlarına uç(leaflet 'den metoda ulaştık. map.flyTo())
  map.flyTo(note.coords, 13);
}

// * Notlar kısmını açıp kapatmak için:

// Tıklanma olayında aside kısmınındaki form veya liste alanını gizleyebilmek için .hide class'ı ekleyecez.
ui.arrow.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});
