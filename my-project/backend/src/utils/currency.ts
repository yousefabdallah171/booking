export function egpToUsd(amountEgp: number, rate: number) {
  if (rate <= 0) {
    throw new Error("Exchange rate must be greater than zero");
  }

  return Number((amountEgp / rate).toFixed(2));
}
