import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useData } from "@/providers/DataProvider";
import { AlertCircle, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import type { StockItem } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

interface StockFormProps {
  open: boolean;
  onClose: () => void;
  selectedStock: StockItem | null;
  onSaveStock: (symbol: string, shares: number, avgCost: number) => void;
  onDeleteStock: (symbol: string) => void;
  stocks: StockItem[];
}

export default function StockForm({
  open,
  onClose,
  selectedStock,
  onSaveStock,
  onDeleteStock,
  stocks,
}: StockFormProps) {
  const { usdToThb } = useData();

  // Mode: "add" (add new ticker) or "transaction" (buy/sell)
  const isTransactionMode = selectedStock !== null;

  // Add Ticker Mode States
  const [symbol, setSymbol] = useState("");
  const [initialShares, setInitialShares] = useState("");
  const [initialAvgCost, setInitialAvgCost] = useState("");

  // Transaction Mode States
  const [txType, setTxType] = useState<"buy" | "sell">("buy");
  const [txShares, setTxShares] = useState("");
  const [txPrice, setTxPrice] = useState("");

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedSymbol = useDebounce(symbol, 250);

  // Fetch search suggestions
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (isTransactionMode || !open) {
        setSuggestions([]);
        return;
      }

      const query = debouncedSymbol.trim();

      async function fetchSuggestions() {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
          if (res.ok && active) {
            const data = await res.json();
            if (data.status === "success" && data.results) {
              setSuggestions(data.results);
            }
          }
        } catch (err) {
          console.warn("Failed to fetch suggestions:", err);
        } finally {
          if (active) {
            setIsSearching(false);
          }
        }
      }

      fetchSuggestions();
    });

    return () => {
      active = false;
    };
  }, [debouncedSymbol, isTransactionMode, open]);

  useEffect(() => {
    if (open) {
      Promise.resolve().then(() => {
        if (selectedStock) {
          setSymbol(selectedStock.symbol);
          setTxType("buy");
          setTxShares("");

          const defaultPrice = selectedStock.price > 0
            ? selectedStock.price.toString()
            : (selectedStock.avgCost && selectedStock.avgCost > 0 ? selectedStock.avgCost.toString() : "");
          setTxPrice(defaultPrice);

        } else {
          setSymbol("");
          setInitialShares("");
          setInitialAvgCost("");

        }
      });
    }
  }, [open, selectedStock]);

  const symbolExists = !isTransactionMode && symbol.trim() !== "" && 
    stocks.some(s => s.symbol.toUpperCase() === symbol.trim().toUpperCase());

  const currentShares = selectedStock?.shares || 0;
  const currentAvgCost = selectedStock?.avgCost || 0;
  const txSharesVal = parseFloat(txShares) || 0;
  const txPriceVal = parseFloat(txPrice) || 0;

  let finalShares = 0;
  let finalAvgCost = 0;
  let transactionTotal = txSharesVal * txPriceVal;
  let isSellInvalid = false;

  // Buy/Sell Mode
  if (isTransactionMode) {
    if (txType === "buy") {
      finalShares = currentShares + txSharesVal;
      const totalCostBasis = (currentShares * currentAvgCost) + (txSharesVal * txPriceVal);
      finalAvgCost = finalShares > 0 ? totalCostBasis / finalShares : 0;
    
    } else {
      finalShares = Math.max(0, currentShares - txSharesVal);
      if (finalShares < 1e-9) {
        finalShares = 0;
      }
      finalAvgCost = finalShares > 0 ? currentAvgCost : 0; 
      isSellInvalid = txSharesVal > (currentShares + 1e-9);
    }
  } else {

    // Add Ticker Mode Calculations
    finalShares = parseFloat(initialShares) || 0;
    finalAvgCost = parseFloat(initialAvgCost) || 0;
    transactionTotal = finalShares * finalAvgCost;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetSymbol = symbol.trim().toUpperCase();
    if (!targetSymbol) return;

    if (isTransactionMode && isSellInvalid) return;

    onSaveStock(targetSymbol, finalShares, finalAvgCost);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isTransactionMode ? `ซื้อ - ขาย หุ้น : ${symbol}` : "เพิ่มหลักทรัพย์ใหม่"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* ADD TICKER MODE */}
        {!isTransactionMode && (
          <>
            <div className="relative">
              <label className="text-[10px] font-bold text-zen-slate uppercase mb-1.5 block tracking-wider">
                สัญลักษณ์หลักทรัพย์ (Ticker)
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="เช่น TSLA, AAPL, NVDA"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value.toUpperCase());
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => {
                  setTimeout(() => setIsDropdownOpen(false), 150);
                }}
                className="
                  w-full text-sm bg-zen-sand border border-zen-pebble/20
                  rounded-xl px-3 py-2.5 text-zen-charcoal uppercase font-bold
                  placeholder-zen-slate/40 focus:outline-none focus:border-zen-indigo/40
                  transition-colors min-h-[44px]
                "
              />
              
              {symbolExists && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zen-warning font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>สัญลักษณ์นี้มีอยู่ในพอร์ตแล้ว (จะไปอัปเดตตัวเดิม)</span>
                </div>
              )}

              {isDropdownOpen && (
                <div className="
                  absolute left-0 right-0 top-[calc(100%+4px)] z-50 
                  bg-zen-white border border-zen-pebble/15 shadow-xl rounded-xl 
                  overflow-hidden divide-y divide-zen-pebble/5 max-h-[180px] overflow-y-auto
                ">
                  <div className="flex items-center justify-between px-3 py-2 bg-zen-sand/35">
                    <span className="text-[9px] font-bold text-zen-slate uppercase tracking-wider block">
                      {symbol.trim() === "" ? "สัญลักษณ์แนะนำยอดนิยม" : "รายการค้นหาแนะนำ"}
                    </span>
                    {isSearching && (
                      <span className="text-[9px] font-bold text-zen-indigo animate-pulse">
                        กำลังค้นหา...
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    {suggestions.slice(0, 8).map((item) => {
                      const isSelected = symbol.toUpperCase().trim() === item.symbol;
                      return (
                        <button
                          key={item.symbol}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); 
                            setSymbol(item.symbol);
                            setIsDropdownOpen(false);
                          }}
                          className={`
                            w-full px-3.5 py-2.5 text-left text-xs font-bold transition-all 
                            cursor-pointer flex items-center justify-between min-h-[44px]
                            ${isSelected
                              ? "bg-zen-indigo/8 text-zen-indigo"
                              : "hover:bg-zen-sand text-zen-charcoal"
                            }
                          `}
                        >
                          <span className="tracking-wide uppercase">{item.symbol}</span>
                          <span className="text-[9px] text-zen-slate font-medium truncate max-w-[185px] text-right">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                    {!isSearching && suggestions.length === 0 && symbol.trim() !== "" && (
                      <div className="px-3.5 py-3 text-[10px] text-zen-slate italic">
                        ไม่พบข้อมูลสำหรับ &quot;{symbol}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-zen-slate uppercase mb-1.5 block tracking-wider">
                  จำนวนหุ้นเริ่มต้น (ระบุหรือไม่ก็ได้)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="เช่น 10.5 (ว่างไว้ = ติดตามเท่านั้น)"
                  value={initialShares}
                  onChange={(e) => setInitialShares(e.target.value)}
                  className="
                    w-full text-sm bg-zen-sand border border-zen-pebble/20
                    rounded-xl px-3 py-2.5 text-zen-charcoal font-semibold
                    placeholder-zen-slate/40 focus:outline-none focus:border-zen-indigo/40
                    transition-colors min-h-[44px]
                  "
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zen-slate uppercase mb-1.5 block tracking-wider">
                  ราคาต้นทุนเฉลี่ย (USD)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="เช่น 150.25"
                  value={initialAvgCost}
                  onChange={(e) => setInitialAvgCost(e.target.value)}
                  className="
                    w-full text-sm bg-zen-sand border border-zen-pebble/20
                    rounded-xl px-3 py-2.5 text-zen-charcoal font-semibold
                    placeholder-zen-slate/40 focus:outline-none focus:border-zen-indigo/40
                    transition-colors min-h-[44px]
                  "
                />
              </div>
            </div>

            {transactionTotal > 0 && (
              <div className="bg-zen-sand/50 border border-zen-pebble/15 rounded-xl px-3.5 py-3 text-[11px] text-zen-slate font-medium space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>ประมาณการต้นทุนรวม (USD):</span>
                  <span className="font-bold text-zen-charcoal text-xs">
                    ${transactionTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ประมาณการต้นทุนรวม (THB):</span>
                  <span className="font-bold text-zen-indigo text-xs">
                    ≈ {Math.round(transactionTotal * usdToThb).toLocaleString()} THB
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* TRANSACTION MODE (BUY/SELL) */}
        {isTransactionMode && selectedStock && (
          <>
            <div className="bg-zen-sand/40 border border-zen-pebble/10 rounded-xl px-3.5 py-2.5 text-[11px]">
              <span className="text-[9px] font-bold text-zen-slate uppercase tracking-wider block mb-1.5">
                สถานะพอร์ตปัจจุบัน
              </span>
              <div className="grid grid-cols-3 gap-2 text-zen-charcoal font-bold">
                <div>
                  <span className="text-[9px] font-semibold text-zen-slate block">จำนวนหุ้น:</span>
                  <span>{currentShares.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-zen-slate block">ต้นทุนเฉลี่ย:</span>
                  <span>${currentAvgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-zen-slate block">ราคาตลาด:</span>
                  <span className="text-zen-indigo">${selectedStock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zen-slate uppercase mb-1.5 block tracking-wider">
                ประเภทรายการ
              </label>
              <div className="flex bg-zen-sand border border-zen-pebble/20 p-1 rounded-xl h-[42px] items-stretch">
                <button
                  type="button"
                  onClick={() => setTxType("buy")}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer
                    ${txType === "buy"
                      ? "bg-zen-white text-zen-indigo shadow-sm border border-zen-pebble/15"
                      : "text-zen-slate hover:text-zen-charcoal"
                    }
                  `}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-zen-pine" />
                  ซื้อเพิ่ม (Buy)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType("sell")}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer
                    ${txType === "sell"
                      ? "bg-zen-white text-zen-error shadow-sm border border-zen-pebble/15"
                      : "text-zen-slate hover:text-zen-charcoal"
                    }
                  `}
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-zen-error" />
                  ขายออก (Sell)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-zen-slate uppercase mb-1.5 block tracking-wider">
                  จำนวนหุ้นที่จะ{txType === "buy" ? "ซื้อ" : "ขาย"}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="เช่น 5"
                  value={txShares}
                  onChange={(e) => setTxShares(e.target.value)}
                  className="
                    w-full text-sm bg-zen-sand border border-zen-pebble/20
                    rounded-xl px-3 py-2.5 text-zen-charcoal font-semibold
                    placeholder-zen-slate/40 focus:outline-none focus:border-zen-indigo/40
                    transition-colors min-h-[44px]
                  "
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zen-slate uppercase mb-1.5 block tracking-wider">
                  ราคาต่อหุ้น (USD)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder={`เช่น ${selectedStock.price || 150}`}
                  value={txPrice}
                  onChange={(e) => setTxPrice(e.target.value)}
                  className="
                    w-full text-sm bg-zen-sand border border-zen-pebble/20
                    rounded-xl px-3 py-2.5 text-zen-charcoal font-semibold
                    placeholder-zen-slate/40 focus:outline-none focus:border-zen-indigo/40
                    transition-colors min-h-[44px]
                  "
                />
              </div>
            </div>

            {isSellInvalid && (
              <div className="flex items-start gap-2 bg-zen-error/10 border border-zen-error/25 rounded-xl px-3.5 py-2.5 text-[11px] text-zen-error font-medium animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">ขายเกินจำนวนครอบครอง</span>
                  <span>คุณมีอยู่เพียง {currentShares} หุ้น ไม่สามารถบันทึกรายการขาย {txSharesVal} หุ้นได้</span>
                </div>
              </div>
            )}

            {txSharesVal > 0 && !isSellInvalid && (
              <div className="bg-zen-indigo/5 border border-zen-indigo/15 rounded-xl px-4 py-3 text-[11px] text-zen-slate space-y-2">
                <div className="flex items-center gap-1 text-[9px] font-bold text-zen-indigo uppercase tracking-wider mb-0.5">
                  <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ประมาณการพรีวิวธุรกรรม</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>มูลค่าธุรกรรมรวม:</span>
                  <span className="font-bold text-zen-charcoal">
                    ${transactionTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-zen-slate font-medium text-[9px] ml-1.5">
                      (≈ {Math.round(transactionTotal * usdToThb).toLocaleString()} THB)
                    </span>
                  </span>
                </div>
                <hr className="border-zen-pebble/10" />
                <div className="grid grid-cols-2 gap-4 pt-0.5 text-xs">
                  <div>
                    <span className="text-[9px] text-zen-slate block font-semibold">จำนวนหุ้นใหม่:</span>
                    <span className="font-bold text-zen-charcoal">
                      {finalShares.toLocaleString(undefined, { maximumFractionDigits: 4 })} หุ้น
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zen-slate block font-semibold">ต้นทุนเฉลี่ยใหม่:</span>
                    <span className="font-bold text-zen-indigo">
                      ${finalAvgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            disabled={isTransactionMode ? isSellInvalid : false}
            className={`
              flex-1 bg-zen-indigo text-zen-white text-xs font-semibold
              py-3 rounded-xl cursor-pointer hover:bg-zen-indigo/90 transition-colors min-h-[44px]
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isTransactionMode 
              ? (txType === "buy" ? "บันทึกรายการซื้อ" : "บันทึกรายการขาย") 
              : "เพิ่มเข้าพอร์ต"}
          </button>
          
          {isTransactionMode && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`คุณต้องการลบ ${symbol} ออกจากพอร์ตติดตามใช่หรือไม่?`)) {
                  onDeleteStock(symbol);
                  onClose();
                }
              }}
              className="
                px-4 bg-zen-error/10 text-zen-error text-xs font-semibold
                py-3 rounded-xl cursor-pointer hover:bg-zen-error/15 transition-colors min-h-[44px]
              "
            >
              ลบออก
            </button>
          )}
        </div>
      </form>
    </Drawer>
  );
}
