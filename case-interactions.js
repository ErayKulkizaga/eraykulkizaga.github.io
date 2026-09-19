/* An explicitly illustrative contract, with no network or persistent state. */
(() => {
  const demo = document.querySelector("#meter-demo");
  if (!demo) return;
  const quantity = document.querySelector("#meter-quantity");
  const status = document.querySelector("#meter-status");
  const explanation = document.querySelector("#meter-explanation");
  demo.classList.add("interactive");
  const outcomes = {
    retry: [
      1,
      "201 · Original response",
      "Identical key and payload. The original response is returned; the ledger still contains one event.",
    ],
    conflict: [
      2,
      "409 · Conflict",
      "The key belongs to the original payload. The changed request is rejected; the ledger still contains one event.",
    ],
    reset: [1, "201 · Created", "The original event is recorded once."],
  };
  demo.addEventListener("click", (event) => {
    const action = event.target.closest("[data-meter-action]")?.dataset
      .meterAction;
    if (!action || !outcomes[action]) return;
    const [amount, code, text] = outcomes[action];
    quantity.textContent = String(amount);
    status.textContent = code;
    explanation.textContent = text;
    demo.dataset.result = action;
  });
})();
