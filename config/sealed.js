const {cryptr} = require("../core/core")
const encryptedString = 'beabe1a0600040870e826b0a65a514abc14cb5b267e5d62e28dd36c417343bdadcabd0578825ebee3aec86f59c6536d60dc14a0e8a4ad4df7b9bfce64da253b38ad644c5eae94dc6d83bb7068460c4c37e28efc7a7bafcacb348d0075649628a4eb0439ac5ad722e95f832706c061389e8389bc747a3dc011d4be38fa67ba81721844d31a8ab24a7c2eed6bcb0081bcfc18bc0d535c8528f5004bc34523b6e40b223146aa2c4e089950dc12915173c0d25a35eccb0a508b213f0d14e73a59499bf1a742c22d40ce3e0ff';
const decryptedString = cryptr.decrypt(encryptedString);

module.exports = {
     decryptedString
};
