export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Edit Product — {id}</h1>
    </div>
  )
}
