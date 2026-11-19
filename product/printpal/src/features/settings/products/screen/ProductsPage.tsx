import type { ProductRecord, MaterialRecord, FinishRecord } from "../../shared/types"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { ProductEmptyIllustration, ProductRow } from "./ProductList"

export function renderProductsPage({ openDrawerForProduct, products, materials, finishes, handleEditProduct, handleDeleteProduct }: { openDrawerForProduct: (product?: ProductRecord) => void; products: ProductRecord[]; materials: MaterialRecord[]; finishes: FinishRecord[]; handleEditProduct: (prod: ProductRecord) => void; handleDeleteProduct: (id: string, name: string) => void }): React.ReactNode {
  return <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden pr-8 pb-4">
    {/* Product Header & Action Bar matching Reference Screen */}
    <section className="flex items-start justify-between mb-5 flex-shrink-0">
      <div className="printpal-leads-title-block">
        <h1 className="printpal-leads-title">Products</h1>
        <div className="printpal-leads-subtitle">
          Manage signage catalog products, substrate materials, and finishing specifications
        </div>
      </div>

      <div className="printpal-leads-controls flex-shrink-0">
        <Button
          variant="orange"
          className="printpal-btn-primary font-medium w-[164px] min-w-[164px]"
          id="btn-add-product"
          onClick={() => openDrawerForProduct()}
        >
          Add new Product
        </Button>
      </div>
    </section>

    {/* Full-Width Workspace: Products Table */}
    <div className="flex-1 w-full min-h-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 flex flex-col box-border shadow-none overflow-hidden max-h-[calc(100vh-220px)]">
      <div className="printpal-table-header printpal-product-grid flex-shrink-0">
        <div>Product Name</div>
        <div>Description</div>
        <div className="text-center">Materials Tagged</div>
        <div className="text-center">Finishes Tagged</div>
        <div className="text-right">Actions</div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll mt-1">
        {products.length === 0 ? (
          <div className="p-12 text-center text-[12px]/4 text-[#94A3B8]">
            <div className="printpal-empty-illustration-wrap scale-75 mb-2">
              <ProductEmptyIllustration />
            </div>
            No products cataloged yet. Click Add new Product to add one.
          </div>
        ) : (
          products.map((prod) => (
            <ProductRow
              key={prod.id}
              prod={prod}
              materials={materials}
              finishes={finishes}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct} />
          ))
        )}
      </div>
    </div>
  </div>
}
