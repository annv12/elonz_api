import 'dotenv/config'
export const stages: Record<string, string> = {
  '0.001': '1',
  '0.002': '2',
  '0.003': '3',
  '0.004': '4',
  '0.005': '5',
}
export const getNextPrice = (current: string) => {
  const prices = ['0.001', '0.002', '0.003', '0.004', '0.005']
  const index = prices.indexOf(current)
  if (index === -1 || index === prices.length - 1) {
    return prices[prices.length - 1] // Không tìm thấy hoặc đã là giá cuối cùng
  }
  return prices[index + 1]
}
