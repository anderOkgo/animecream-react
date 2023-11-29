export const cyfer = () => {
  String.prototype.reverse = function () {
    return this.split('').reverse().join('');
  };

  let li = 0;

  const normalize = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const cy = (str, key) => {
    let nc = '';
    str = normalize(str).reverse();

    for (let x = 0; x < str.length; x++) {
      const p1 = str.charCodeAt(x) + key.charCodeAt(li);
      const p2 = ((p1 & 240) / 16) | 48;
      const p3 = (p1 & 15) | 48;
      nc += String.fromCharCode(p2) + String.fromCharCode(p3);
      li = (li + 1) % key.length;
    }

    return btoa(nc);
  };

  const dcy = (str, key) => {
    let nc = '';
    str = atob(str).reverse();

    for (let x = str.length; x >= 2; x -= 2) {
      const p2 = str.charCodeAt(x - 1) & 15;
      const p3 = str.charCodeAt(x - 2) & 15;
      let p1 = ((p2 * 16) | p3) - key.charCodeAt(li);
      p1 = p1 < 0 ? p1 * -1 : p1;
      nc += String.fromCharCode(p1);
      li = (li + 1) % key.length;
    }

    return normalize(nc.reverse());
  };

  return { cy, dcy };
};

export default cyfer;
