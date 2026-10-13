export const products = [
  { id: "dancha-200", name: "청단차", size: "200g", stock: 14, price: 100000, group: "청단차", description: "찻잎을 눌러 만든 차 · 부숴서 우려 마셔요" },
  { id: "dancha-100", name: "청단차", size: "100g", stock: 29, price: 50000, group: "청단차", description: "찻잎을 눌러 만든 차 · 부숴서 우려 마셔요" },
  { id: "dancha-50", name: "청단차", size: "50g", stock: 4, price: 20000, group: "청단차", description: "찻잎을 눌러 만든 차 · 부숴서 우려 마셔요" },
  { id: "dancha-30", name: "청단차", size: "30g", stock: 1, price: 15000, group: "청단차", description: "찻잎을 눌러 만든 차 · 부숴서 우려 마셔요" },
  { id: "fermented-20", name: "발효차 (은박)", size: "20g", stock: 50, price: 10000, group: "은박 차", description: "20g 소포장" },
  { id: "blue-20", name: "청차 (은박)", size: "20g", stock: 91, price: 10000, group: "은박 차", description: "20g 소포장" },
  { id: "green-20", name: "녹차 (은박)", size: "20g", stock: 36, price: 10000, group: "은박 차", description: "20g 소포장" },
  { id: "dae-15", name: "대작 (은박)", size: "15g", stock: 66, price: 5000, group: "은박 차", description: "15g 소포장" },
] as const;
export type Product = (typeof products)[number];
export const money = (value: number) => new Intl.NumberFormat("ko-KR").format(value) + "원";
