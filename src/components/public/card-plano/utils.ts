


export function getBadgePorPreco(preco: number | string) {
  const precoNum = typeof preco === 'string' ? parseFloat(preco) : Number(preco);

  if (precoNum < 100) {
    return { text: "Mais Popular", color: "bg-green-500" };
  }
  if (precoNum < 150) {
    return { text: "Melhor Custo-Benefício", color: "bg-blue-500" };
  }
  if (precoNum < 250) {
    return { text: "Alta Performance", color: "bg-purple-500" };
  }
  return { text: "Premium", color: "bg-amber-500" };
}


export function formatarPreco(preco: number | string) {
  const precoNum = typeof preco === 'string' ? parseFloat(preco) : Number(preco);
  const precoInteiro = Math.floor(precoNum);
  const precoDecimal = Math.round((precoNum - precoInteiro) * 100).toString().padStart(2, '0');
  
  return { precoInteiro, precoDecimal };
}
