export const cyfer = () => {
  String.prototype.reverse = function () {
    return this.split('').reverse().join('');
  };

  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let nc = '';
  let li = 0;

  const cy = (str, key) => {
    str = str.reverse();
    for (let x = 0; x < str.length; x++) {
      p1 = str.charCodeAt(x) + key.charCodeAt(li);
      p2 = ((p1 & 240) / 16) | 48;
      p3 = (p1 & 15) | 48;
      nc += String.fromCharCode(p2) + String.fromCharCode(p3);
      li++;
      if (li > key.length - 1) li = 0;
    }
    return btoa(nc);
  };

  const dcy = (str, key) => {
    str = atob(str).reverse();
    for (let x = str.length; x >= 2; x -= 2) {
      p2 = str.charCodeAt(x - 1) & 15;
      p3 = str.charCodeAt(x - 2) & 15;
      p1 = ((p2 * 16) | p3) - key.charCodeAt(li);
      if (p1 < 0) p1 = p1 * -1;
      nc += String.fromCharCode(p1);
      li++;
      if (li > key.length - 1) li = 0;
    }
    return nc.reverse();
  };

  return { cy, dcy };
};

export default cyfer;
