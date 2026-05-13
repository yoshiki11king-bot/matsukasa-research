"use client";

import { useState } from "react";

const presetAmounts = ["500円", "1,000円", "3,000円", "任意額"] as const;

export function DonationPanel() {
  const [selectedAmount, setSelectedAmount] = useState<(typeof presetAmounts)[number]>("1,000円");
  const [customAmount, setCustomAmount] = useState("");

  return (
    <section className="rounded-lg border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[color:var(--color-primary)]">寄付ボックス</p>
          <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            いまは相談受付ベースでご案内しています。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {presetAmounts.map((amount) => {
            const active = selectedAmount === amount;

            return (
              <button
                key={amount}
                type="button"
                onClick={() => setSelectedAmount(amount)}
                className={`ui-button h-12 px-4 text-sm ${
                  active
                    ? "ui-button-primary"
                    : "ui-button-secondary"
                }`}
              >
                {amount}
              </button>
            );
          })}
        </div>

        {selectedAmount === "任意額" ? (
          <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
            <span className="font-medium">任意額</span>
            <input
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value.replace(/[^\d]/g, ""))}
              placeholder="例: 5000"
              className="h-12 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
            />
          </label>
        ) : null}

        <div
          className="ui-button ui-button-primary h-12 w-full px-5 text-sm opacity-75"
          aria-disabled="true"
        >
          寄付方法は準備中
        </div>

        <a
          href="#support-principles"
          className="ui-button ui-button-secondary h-11 w-full px-5 text-sm"
        >
          継続支援について
        </a>
      </div>
    </section>
  );
}
