function getRoleFromAmount(amount) {
  if (amount === 60) return "basique";
  if (amount === 80) return "premium";
  return null;
}

module.exports = {
  getRoleFromAmount,
};