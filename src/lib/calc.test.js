// Saver — regression tests for the LOCKED money math in calc.js.
// These assert the CURRENT verified behavior. If one fails after a change,
// the maths drifted → fix the code, not the test (unless the change is intentional).
import { describe, it, expect } from "vitest";
import {
  calcBankBalance, calcGoalSaved, calcFrozenForBank, goalBalancesPerBank,
  makeCalc, totalBalance, totalSafe, totalFrozen,
  budgetSpentMonth, projectSpent,
  monthTxns, sumIncome, sumExpense,
} from "./calc.js";

const tx = (o) => ({ amount: 0, ...o });

describe("calcBankBalance", () => {
  it("income adds, expense subtracts", () => {
    const txns = [tx({ type: "income", bankId: "A", amount: 1000 }), tx({ type: "expense", bankId: "A", amount: 250 })];
    expect(calcBankBalance("A", txns)).toBe(750);
  });
  it("goal_withdraw subtracts from the bank", () => {
    const txns = [tx({ type: "income", bankId: "A", amount: 1000 }), tx({ type: "goal_withdraw", bankId: "A", amount: 100 })];
    expect(calcBankBalance("A", txns)).toBe(900);
  });
  it("saving does NOT change the bank balance (money is frozen, not moved)", () => {
    const txns = [tx({ type: "income", bankId: "A", amount: 1000 }), tx({ type: "saving", bankId: "A", goalId: "G", amount: 300 })];
    expect(calcBankBalance("A", txns)).toBe(1000);
  });
  it("transfer moves money out of source and into destination", () => {
    const txns = [tx({ type: "income", bankId: "A", amount: 1000 }), tx({ type: "transfer", fromBankId: "A", toBankId: "B", amount: 200 })];
    expect(calcBankBalance("A", txns)).toBe(800);
    expect(calcBankBalance("B", txns)).toBe(200);
  });
  it("transfer conserves the total across both banks", () => {
    const txns = [tx({ type: "income", bankId: "A", amount: 1000 }), tx({ type: "transfer", fromBankId: "A", toBankId: "B", amount: 200 })];
    expect(calcBankBalance("A", txns) + calcBankBalance("B", txns)).toBe(1000);
  });
});

describe("calcGoalSaved", () => {
  it("saving adds; withdraw and return subtract", () => {
    const txns = [
      tx({ type: "saving", goalId: "G", amount: 500 }),
      tx({ type: "goal_withdraw", goalId: "G", amount: 100 }),
      tx({ type: "goal_return", goalId: "G", amount: 50 }),
    ];
    expect(calcGoalSaved("G", txns)).toBe(350);
  });
});

describe("calcFrozenForBank", () => {
  it("saving freezes; withdraw and return unfreeze", () => {
    const txns = [
      tx({ type: "saving", bankId: "A", goalId: "G", amount: 300 }),
      tx({ type: "goal_withdraw", bankId: "A", goalId: "G", amount: 100 }),
      tx({ type: "goal_return", bankId: "A", goalId: "G", amount: 50 }),
    ];
    expect(calcFrozenForBank("A", [], txns)).toBe(150);
  });
});

describe("makeCalc — safe to spend (core invariant)", () => {
  it("safeToSpend = balance − frozen", () => {
    const txns = [tx({ type: "income", bankId: "A", amount: 1000 }), tx({ type: "saving", bankId: "A", goalId: "G", amount: 300 })];
    const calc = makeCalc(txns);
    expect(calc.bankBalance("A")).toBe(1000);
    expect(calc.frozenForBank("A")).toBe(300);
    expect(calc.safeToSpend("A")).toBe(700);
  });
  it("returning a goal to the bank unfreezes money (safe goes up)", () => {
    const before = [tx({ type: "income", bankId: "A", amount: 1000 }), tx({ type: "saving", bankId: "A", goalId: "G", amount: 300 })];
    const after = [...before, tx({ type: "goal_return", bankId: "A", goalId: "G", amount: 100 })];
    expect(makeCalc(before).safeToSpend("A")).toBe(700);
    expect(makeCalc(after).safeToSpend("A")).toBe(800);
  });
  it("goalSaved and frozenForBank clamp at 0 (never negative)", () => {
    const txns = [tx({ type: "goal_return", bankId: "A", goalId: "G", amount: 100 })];
    expect(makeCalc(txns).goalSaved("G")).toBe(0);
    expect(makeCalc(txns).frozenForBank("A")).toBe(0);
  });
});

describe("totals across banks", () => {
  const banks = [{ id: "A" }, { id: "B" }];
  const txns = [
    tx({ type: "income", bankId: "A", amount: 1000 }),
    tx({ type: "income", bankId: "B", amount: 500 }),
    tx({ type: "saving", bankId: "A", goalId: "G", amount: 300 }),
  ];
  it("totalBalance sums every bank", () => { expect(totalBalance(banks, txns)).toBe(1500); });
  it("totalFrozen sums frozen across banks", () => { expect(totalFrozen(banks, txns, [])).toBe(300); });
  it("totalSafe = totalBalance − totalFrozen", () => { expect(totalSafe(banks, txns, [])).toBe(1200); });
});

describe("goalBalancesPerBank (split source)", () => {
  it("tracks how much of a goal is frozen in each bank", () => {
    const txns = [
      tx({ type: "saving", bankId: "A", goalId: "G", amount: 200 }),
      tx({ type: "saving", bankId: "B", goalId: "G", amount: 100 }),
      tx({ type: "goal_withdraw", bankId: "A", goalId: "G", amount: 50 }),
    ];
    expect(goalBalancesPerBank("G", txns)).toEqual({ A: 150, B: 100 });
  });
});

describe("income / expense sums", () => {
  const txns = [
    tx({ type: "income", amount: 1000 }),
    tx({ type: "expense", amount: 200 }),
    tx({ type: "goal_withdraw", amount: 50 }),
    tx({ type: "saving", amount: 300 }),
  ];
  it("sumIncome counts only income", () => { expect(sumIncome(txns)).toBe(1000); });
  it("sumExpense counts expense + goal_withdraw (per legacy)", () => { expect(sumExpense(txns)).toBe(250); });
});

describe("monthTxns", () => {
  it("filters by YYYY-MM prefix", () => {
    const txns = [tx({ type: "expense", date: "2026-06-10", amount: 10 }), tx({ type: "expense", date: "2026-05-30", amount: 20 })];
    expect(monthTxns(txns, "2026-06")).toHaveLength(1);
  });
});

describe("budgets & projects", () => {
  const cats = ["food"];
  const txns = [
    tx({ type: "expense", catId: "food", date: "2026-06-05", amount: 100 }),
    tx({ type: "goal_withdraw", catId: "food", date: "2026-06-06", amount: 50 }),
    tx({ type: "expense", catId: "rent", date: "2026-06-07", amount: 999 }), // other cat → excluded
    tx({ type: "income", catId: "food", date: "2026-06-08", amount: 500 }),  // income → excluded
    tx({ type: "expense", catId: "food", date: "2026-05-01", amount: 70 }),  // prev month
  ];
  it("budgetSpentMonth = expense+goal_withdraw in cats for that month", () => {
    expect(budgetSpentMonth({ cats }, txns, "2026-06")).toBe(150);
  });
  it("projectSpent accumulates from startMonth across months", () => {
    expect(projectSpent({ cats, startMonth: "2026-05" }, txns)).toBe(220);
  });
});
