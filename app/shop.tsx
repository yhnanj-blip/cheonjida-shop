"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ShoppingBag, Plus, Minus, ArrowUpRight, Leaf, Check, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { products, money } from "@/lib/products";

type Cart = Record<string, number>;
type Checkout = { name: string; center: string; phone: string; fulfillment: "택배" | "직접수령"; address: string; paymentStatus: "입금 완료" | "입금 예정"; note: string; consent: boolean; website: string };
const initial: Checkout = { name: "", center: "", phone: "", fulfillment: "택배", address: "", paymentStatus: "입금 예정", note: "", consent: false, website: "" };
const groups = ["전체", "청단차", "은박 차"];

export default function Shop() {
  const [group, setGroup] = useState("전체");
  const [cart, setCart] = useState<Cart>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Checkout>(initial);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [checkout, setCheckout] = useState(false);
  const lines = useMemo(() => products.filter(p => cart[p.id] > 0).map(p => ({ product: p, quantity: cart[p.id] })), [cart]);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);
  const shipping = form.fulfillment === "택배" ? 5000 : 0;

  function change(id: string, amount: number) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setCart(current => ({ ...current, [id]: Math.max(0, Math.min(product.stock, (current[id] || 0) + amount)) }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.consent || sending || !lines.length) return;
    setSending(true);
    setError("");
    try {
      const id = Date.now();
      const saved = JSON.parse(window.localStorage.getItem("cheonjida-orders") || "[]") as unknown[];
      const order = {
        id,
        ...form,
        items: lines.map(l => ({ id: l.product.id, name: l.product.name, size: l.product.size, quantity: l.quantity, price: l.product.price })),
        total,
        createdAt: new Date().toISOString(),
      };
      window.localStorage.setItem("cheonjida-orders", JSON.stringify([...saved, order]));
      setOrderId(id);
      setCart({});
      setCheckout(false);
      setForm(initial);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "잠시 후 다시 시도해 주세요."); }
    finally { setSending(false); }
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    try { void Promise.resolve(context.registerTool({
      name: "stage_tea_items", title: "차 장바구니에 담기", description: "선택한 천지다 차 상품의 수량을 장바구니에 담고 주문 화면을 엽니다. 주문 접수나 결제는 하지 않습니다.",
      inputSchema: { type: "object", properties: { items: { type: "array", items: { type: "object", properties: { id: { type: "string" }, quantity: { type: "integer", minimum: 1 } }, required: ["id", "quantity"], additionalProperties: false }, minItems: 1 } }, required: ["items"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const data = input as { items?: { id: string; quantity: number }[] };
        if (!Array.isArray(data?.items) || !data.items.length) throw new Error("상품을 선택해 주세요.");
        const next: Cart = {};
        for (const item of data.items) {
          const product = products.find(p => p.id === item.id);
          if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || (next[item.id] || 0) + item.quantity > product.stock) throw new Error("상품 또는 수량을 확인해 주세요.");
          next[item.id] = (next[item.id] || 0) + item.quantity;
        }
        setCart(next); setOrderId(null); setOpen(true);
        return { staged: true, items: next, total: products.reduce((sum, p) => sum + (next[p.id] || 0) * p.price, 0) };
      }
    }, { signal: controller.signal })).catch(() => {}); } catch { /* unsupported browser */ }
    return () => controller.abort();
  }, []);

  return <div className="site-shell">
    <div className="announcement">오전 11시까지 접수된 택배 주문은 당일 발송 안내</div>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="천지다 홈"><span className="brand-mark">天</span><span>천지다<small>CHEONJIDA TEA</small></span></a>
      <nav aria-label="주 메뉴"><a href="#products">차 고르기</a><a href="#guide">주문 안내</a></nav>
      <button className="cart-button" onClick={() => { setOpen(true); setOrderId(null); }} aria-label={`장바구니 ${count}개`}><ShoppingBag size={19}/><span>장바구니</span><b>{count}</b></button>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow">JIRISAN · NAMWON</span><h1>지리산의 차,<br/>천천히 고르세요.</h1><p>천지다가 준비한 차를 한곳에 모았습니다. 원하는 차를 담고 주문을 남겨 주세요.</p><a className="hero-link" href="#products">차 둘러보기 <ArrowUpRight size={17}/></a></div>
        <div className="hero-image" role="img" aria-label="찻잔과 차를 담은 연출 사진"><span>차를 마시는 시간</span></div>
      </section>

      <section id="products" className="products-section">
        <div className="section-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>차 고르기</h2><p>상품·용량·가격은 현재 안내 기준입니다.</p></div><span className="product-count">전체 8종</span></div>
        <div className="filters" role="group" aria-label="상품 분류">{groups.map(g => <button key={g} className={group === g ? "active" : ""} onClick={() => setGroup(g)} aria-pressed={group === g}>{g}</button>)}</div>
        <div className="product-grid">{products.filter(p => group === "전체" || p.group === group).map((p, index) => <article key={p.id} className="product-card">
          <div className={`product-visual visual-${p.group === "청단차" ? "cake" : p.group === "은박 차" ? "silver" : "other"}`}><span>{String(index + 1).padStart(2, "0")}</span><div className="visual-center"><Leaf size={38} strokeWidth={1}/><strong>{p.name}</strong></div><small>{p.group}</small></div>
          <div className="product-details"><div className="product-title"><h3>{p.name}</h3><span>{p.size}</span></div><p>{p.description}</p><div className="product-bottom"><strong>{money(p.price)}</strong><button className="add-button" onClick={() => { change(p.id, 1); setOrderId(null); }} disabled={p.stock === 0 || cart[p.id] >= p.stock} aria-label={p.stock === 0 ? `${p.name} ${p.size} 품절` : `${p.name} ${p.size} 장바구니에 담기`}><Plus size={17}/><span>{p.stock === 0 ? "품절" : cart[p.id] >= p.stock ? "최대 수량" : "담기"}</span></button></div></div>
        </article>)}</div>
      </section>

      <section id="guide" className="guide"><div><span className="eyebrow">ORDER GUIDE</span><h2>주문은 이렇게 진행돼요.</h2></div><div className="guide-steps"><p><b>01</b> 원하는 차와 수량을 고릅니다.</p><p><b>02</b> 택배(5,000원) 또는 메인센터 직접수령(매 주말)을 선택합니다.</p><p><b>03</b> 우체국택배 주문은 오전 11시까지 접수 시 당일 발송, 이후 접수 시 다음 날 발송합니다. 재고에 따라 품절될 수 있습니다.</p><p><b>04</b> 예시 입금 계좌: 농협 000-0000-0000-00 홍길동 · 예시 전화번호: 010-0000-0000</p></div></section>
      <footer><div className="footer-brand">천지다 <span>CHEONJIDA TEA</span></div><p>남원 · 지리산 차</p><p>상품 사진은 연출 이미지이며 실제 제품과 다를 수 있습니다. 주문 접수는 결제 완료가 아닙니다.</p><p>주문 정보는 이 브라우저에만 저장됩니다.</p></footer>
    </main>

    <Sheet open={open} onOpenChange={setOpen}><SheetContent className="order-sheet" aria-describedby={undefined}><SheetHeader><SheetTitle>{orderId ? "주문 접수 완료" : checkout ? "주문 정보 입력" : "장바구니"}</SheetTitle></SheetHeader>
      {orderId ? <div className="success-state"><div className="success-icon"><Check size={30}/></div><h3>주문이 접수되었습니다.</h3><p>주문번호 <strong>#{orderId}</strong><br/>입금 여부는 직접 확인합니다. 재고에 따라 품절될 수 있습니다.</p><div className="bank-details"><span>예시 입금 계좌</span><strong>농협 000-0000-0000-00<br/>홍길동</strong><small>예시 문의 전화: 010-0000-0000</small></div><button className="primary-button" onClick={() => { setOpen(false); setOrderId(null); }}>쇼핑 계속하기</button></div> : checkout ? <form className="checkout-form" onSubmit={submit}>
        <div className="checkout-summary"><strong>총 {money(total + shipping)}</strong><span>상품 {money(total)} + 배송비 {money(shipping)}</span></div>
        <label>받는 분<input required maxLength={60} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="이름" /></label>
        <label>소속센터명<input required maxLength={100} value={form.center} onChange={e => setForm({ ...form, center: e.target.value })} placeholder="소속센터명" /></label>
        <label>연락처<input required type="tel" inputMode="tel" maxLength={25} autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" /></label>
        <fieldset className="checkout-choice"><legend>수령방법</legend><label><input type="radio" name="fulfillment" checked={form.fulfillment === "택배"} onChange={() => setForm({ ...form, fulfillment: "택배" })}/> 택배발송 (5,000원)</label><label><input type="radio" name="fulfillment" checked={form.fulfillment === "직접수령"} onChange={() => setForm({ ...form, fulfillment: "직접수령" })}/> 직접수령 (메인센터·매 주말)</label></fieldset>
        {form.fulfillment === "택배" && <label>택배 주소<textarea required maxLength={300} autoComplete="street-address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="우편번호와 상세 주소를 적어 주세요. 주문자와 받는 분이 다르면 이름·전화번호도 함께 적어 주세요." rows={3}/></label>}
        <div className="bank-details"><span>예시 입금 계좌</span><strong>농협 000-0000-0000-00 · 홍길동</strong><small>실제 운영 시 계좌 정보를 입력하세요.</small></div>
        <fieldset className="checkout-choice"><legend>입금하셨나요?</legend><label><input type="radio" name="payment" checked={form.paymentStatus === "입금 완료"} onChange={() => setForm({ ...form, paymentStatus: "입금 완료" })}/> 예, 입금했습니다</label><label><input type="radio" name="payment" checked={form.paymentStatus === "입금 예정"} onChange={() => setForm({ ...form, paymentStatus: "입금 예정" })}/> 아니요, 입금 예정입니다</label></fieldset>
        <label>요청 사항 <span className="optional">선택</span><textarea maxLength={300} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="필요한 내용이 있으면 적어 주세요" rows={2}/></label>
        <input className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}/>
        <label className="consent"><input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })}/><span>주문 접수·배송 안내를 위해 이름, 소속센터, 연락처, 주소, 입금 여부와 요청 사항을 수집·이용하는 데 동의합니다. 주문 처리 후 삭제를 요청할 수 있습니다.</span></label>
        <p className="checkout-notice">주문 접수만으로 입금이 확인되지는 않습니다. 표시된 수량은 현재 안내 기준이며 재고에 따라 품절될 수 있습니다.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="sheet-actions"><button type="button" className="back-button" onClick={() => setCheckout(false)}>장바구니로</button><button className="primary-button" disabled={sending || !form.consent}>{sending ? "접수 중…" : "주문 접수하기"}</button></div>
      </form> : <div className="cart-content">{lines.length ? <><div className="cart-lines">{lines.map(({ product: p, quantity }) => <div className="cart-line" key={p.id}><div><strong>{p.name}</strong><span>{p.size} · {money(p.price)}</span></div><div className="quantity"><button onClick={() => change(p.id, -1)} aria-label={`${p.name} ${p.size} 한 개 빼기`}>{quantity === 1 ? <X size={14}/> : <Minus size={14}/>}</button><output>{quantity}</output><button disabled={quantity >= p.stock} onClick={() => change(p.id, 1)} aria-label={`${p.name} ${p.size} 한 개 더하기`}><Plus size={14}/></button></div></div>)}</div><div className="cart-total"><span>상품 금액</span><strong>{money(total)}</strong></div><p className="cart-note">택배 선택 시 배송비 5,000원이 추가됩니다.</p><button className="primary-button" onClick={() => setCheckout(true)}>주문 정보 입력하기</button></> : <div className="empty-cart"><ShoppingBag size={34} strokeWidth={1}/><p>아직 담은 차가 없습니다.</p><button onClick={() => setOpen(false)}>차 둘러보기</button></div>}</div>}
    </SheetContent></Sheet></div>;
}
