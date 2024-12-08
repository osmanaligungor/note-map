// * Html'den Çağırdığımız Elementler
// Tek tek export etmek yerine bir nesne oluşturduk ve bu nesneyi export ederek işimizi biraz daha kolaylaştırdık.

const ui = {
  aside: document.querySelector("aside"),
  form: document.querySelector("aside form"),
  list: document.querySelector("aside ul"),
  cancelBtn: document.querySelector("aside #cancel"),
  arrow: document.querySelector("aside #arrow"),
};

export default ui;
