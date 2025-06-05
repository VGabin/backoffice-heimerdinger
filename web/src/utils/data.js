function getRoleFromAmount(amount) {
  // For demo we use fixed amounts
  if (amount >= 19.99) return "premium";
  if (amount >= 10) return "basique";
  return "unknown";
}

module.exports = {
  getRoleFromAmount,
};