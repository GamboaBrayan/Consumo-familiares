import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET_KEY

/**
 * Encriptar un texto usando AES
 * @param {string} texto - Texto a encriptar
 * @returns {string} Texto encriptado
 */
export const encriptar = (texto) => {
  return CryptoJS.AES.encrypt(texto, SECRET_KEY).toString()
}

/**
 * Desencriptar un texto encriptado
 * @param {string} textoEncriptado - Texto encriptado a desencriptar
 * @returns {string|null} Texto desencriptado o null si hay error
 */
export const desencriptar = (textoEncriptado) => {
  try {
    const bytes = CryptoJS.AES.decrypt(textoEncriptado, SECRET_KEY)
    const textoOriginal = bytes.toString(CryptoJS.enc.Utf8)
    return textoOriginal || null
  } catch (error) {
    console.error('Error al desencriptar:', error)
    return null
  }
}

/**
 * Generar código encriptado URL-safe para compartir
 * @param {string} codigoOriginal - Código original a encriptar
 * @returns {string} Código encriptado y URL-safe
 */
export const generarCodigoURL = (codigoOriginal) => {
  const encriptado = encriptar(codigoOriginal)
  // Convertir a formato URL-safe
  return encodeURIComponent(encriptado)
}

/**
 * Desencriptar código desde URL
 * @param {string} codigoURL - Código encriptado desde URL
 * @returns {string|null} Código original o null si hay error
 */
export const desencriptarDesdeURL = (codigoURL) => {
  try {
    const decodificado = decodeURIComponent(codigoURL)
    return desencriptar(decodificado)
  } catch (error) {
    console.error('Error al desencriptar desde URL:', error)
    return null
  }
}