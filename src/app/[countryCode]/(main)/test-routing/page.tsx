export default function TestRoutingPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Routing Test</h1>
      <p>If you can see this page, basic routing is working.</p>
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Test Links:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><a href="/us/men" className="text-blue-600 hover:underline">/us/men</a></li>
          <li><a href="/us/women" className="text-blue-600 hover:underline">/us/women</a></li>
          <li><a href="/us/products/test-brand-test-product" className="text-blue-600 hover:underline">/us/products/test-brand-test-product</a></li>
        </ul>
      </div>
    </div>
  )
}
