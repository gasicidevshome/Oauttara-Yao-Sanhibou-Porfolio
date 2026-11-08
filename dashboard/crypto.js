// Chiffrement local des données (Web Crypto) : AES-GCM 256 bits, clé dérivée du mot de passe par PBKDF2-SHA256.
// Le mot de passe et la clé ne quittent jamais la mémoire de la page ; rien n'est envoyé sur Internet.
(function () {
  const ITER = 310000;
  const te = new TextEncoder(), td = new TextDecoder();
  const b64 = u8 => btoa(String.fromCharCode(...u8));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  async function derive(pass, salt, iter = ITER) {
    const base = await crypto.subtle.importKey("raw", te.encode(pass), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function newKey(pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return { key: await derive(pass, salt), salt: b64(salt), iter: ITER };
  }
  async function encrypt(k, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k.key, te.encode(JSON.stringify(obj))));
    return { v: 2, enc: { alg: "AES-GCM/PBKDF2-SHA256", iter: k.iter, salt: k.salt, iv: b64(iv), ct: b64(ct) } };
  }
  // Renvoie { obj, k } ou lève une erreur si le mot de passe est faux (échec d'authentification GCM)
  async function decrypt(pass, wrapped) {
    const e = wrapped.enc, salt = unb64(e.salt);
    const key = await derive(pass, salt, e.iter || ITER);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(e.iv) }, key, unb64(e.ct));
    return { obj: JSON.parse(td.decode(pt)), k: { key, salt: e.salt, iter: e.iter || ITER } };
  }
  const isEnc = d => !!(d && d.v === 2 && d.enc && d.enc.ct && d.enc.iv && d.enc.salt);
  window.GMCrypto = { newKey, encrypt, decrypt, isEnc, available: !!(window.crypto && crypto.subtle) };
})();
