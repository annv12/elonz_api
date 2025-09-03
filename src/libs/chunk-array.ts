export function chunkArray(array: any[], size: number): any[][] {
  const chunked_arr = []
  let index = 0
  while (index < array.length) {
    chunked_arr.push(array.slice(index, (index += size)))
  }
  return chunked_arr
}

export function arrayFromTwoNumber(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export async function runArrayOfJobs<T>(
  dataArray: T[],
  numberOfConcurrentJobs: number,
  runner: (data: T) => Promise<any>,
): Promise<any[]> {
  const chunked_arr = chunkArray(dataArray, numberOfConcurrentJobs)

  let result: any[] = []
  for (const data of chunked_arr) {
    const pr: Promise<any>[] = data.map(runner)
    const res = await Promise.all(pr)
    result = result.concat(res)
  }

  return result
}
