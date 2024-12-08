import { gotoIcon, homeIcon, jobIcon, parkIcon } from "./constants.js";

// status değerine bağlı olarak dinamik olarak doğru icon'u return eden fonksiyon

/* 

function getIcon(status) {
  if (status === "goto") {
    return gotoIcon;
  } else if (status === "home") {
    return homeIcon;
  } else if (status === "park") {
    return parkIcon;
  } else {
    return jobIcon;
  }
}
  * Bu şekilde aynı değişkenin farklı değerleri üzerine koşullar yazılıyorsa if/else yerine switch/case kullanmak çok daha mantıklıdır.
*/

function getIcon(status) {
  switch (status) {
    case "goto":
      return gotoIcon;
    case "home":
      return homeIcon;
    case "job":
      return jobIcon;
    case "park":
      return parkIcon;
    default:
      return undefined;
  }
}

export default getIcon;

// status değerinin Türkçe karşılığı return eden fonksiyon

export function getStatus(status) {
  switch (status) {
    case "goto":
      return "Ziyaret";
    case "home":
      return "Ev";
    case "job":
      return "İş";
    case "park":
      return "Park";
    default:
      return "Tanımsız";
  }
}
