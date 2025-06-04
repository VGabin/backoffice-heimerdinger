function getRoleFromAmount(amount) {
  if (amount === 10.99) return "basique";
  if (amount === 19.99) return "premium";
  return "unknown";
}

module.exports = {
  getRoleFromAmount,
};