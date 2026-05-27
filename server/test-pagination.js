async function test() {
  const res1 = await fetch('http://localhost:3001/api/vendors?page=1&limit=10')
  const data1 = await res1.json()
  console.log('Page 1 items:', data1.vendors.length, 'First item:', data1.vendors[0].name)

  const res2 = await fetch('http://localhost:3001/api/vendors?page=2&limit=10')
  const data2 = await res2.json()
  console.log('Page 2 items:', data2.vendors.length, 'First item:', data2.vendors[0].name)
}
test()
