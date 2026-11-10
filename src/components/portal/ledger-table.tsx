import type { Transaction } from "@prisma/client";
import { Receipt } from "lucide-react";
import {
  OUTLET_LABELS,
  TRANSACTION_LABELS,
} from "@/lib/membership";
import { formatCurrency, formatDate } from "@/lib/utils";

type LedgerTransaction = Transaction & {
  processedBy?: { name: string } | null;
};

export function LedgerTable({
  transactions,
}: {
  transactions: LedgerTransaction[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <Receipt className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-600">No ledger entries</p>
        <p className="max-w-xs text-xs text-slate-400">
          Credit deductions and top-ups recorded at the resort will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-6 py-3 font-medium">Date</th>
            <th className="px-6 py-3 font-medium">Type</th>
            <th className="px-6 py-3 font-medium">Outlet / note</th>
            <th className="px-6 py-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const isDebit = transaction.type === "CREDIT_DEDUCTION";
            return (
              <tr
                key={transaction.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="whitespace-nowrap px-6 py-3.5 text-slate-600">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                      isDebit
                        ? "bg-rose-50 text-rose-700 ring-rose-200"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    }`}
                  >
                    {TRANSACTION_LABELS[transaction.type] ?? transaction.type}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-slate-600">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    {OUTLET_LABELS[transaction.outlet] ?? transaction.outlet}
                  </span>
                  <span className="block">{transaction.note}</span>
                  {transaction.processedBy ? (
                    <span className="block text-xs text-slate-400">
                      Processed by {transaction.processedBy.name}
                    </span>
                  ) : null}
                </td>
                <td
                  className={`whitespace-nowrap px-6 py-3.5 text-right font-semibold ${
                    isDebit ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {isDebit ? "−" : "+"}
                  {formatCurrency(transaction.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
