import { useState, useEffect } from 'react';
import { Plus, Minus, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductUsage } from '@/types';
import { beauticianApi } from '@/lib/api';

type SelectedWithCap = ProductUsage & { maxStock: number };

interface ProductUsageModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (products: ProductUsage[]) => void;
}

export function ProductUsageModal({ open, onClose, onSubmit }: ProductUsageModalProps) {
  const [products, setProducts] = useState<SelectedWithCap[]>([]);
  const [catalog, setCatalog] = useState<Array<{ id: string; name: string; unit: string; quantity: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    beauticianApi
      .getInventory()
      .then((res) => {
        if (cancelled || !res.success || !res.data?.items) return;
        setCatalog(
          res.data.items.map((i) => ({
            id: i._id,
            name: i.name,
            unit: i.unit || 'pcs',
            quantity: Math.max(0, i.quantity),
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const addProduct = (productId: string) => {
    const row = catalog.find((p) => p.id === productId);
    if (!row || row.quantity < 1 || products.find((p) => p.id === productId)) return;
    setProducts((prev) => [
      ...prev,
      {
        id: row.id,
        name: row.name,
        quantity: 1,
        unit: row.unit,
        maxStock: row.quantity,
      },
    ]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev
        .map((p) => {
          if (p.id !== productId) return p;
          const next = p.quantity + delta;
          const capped = Math.min(Math.max(0, next), p.maxStock);
          return { ...p, quantity: capped };
        })
        .filter((p) => p.quantity > 0)
    );
  };

  const handleSubmit = () => {
    onSubmit(products.map(({ id, name, quantity, unit }) => ({ id, name, quantity, unit })));
    setProducts([]);
  };

  const catalogToPick = catalog.filter((p) => p.quantity > 0 && !products.find((s) => s.id === p.id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Product Usage
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading salon inventory…
            </div>
          )}

          {!loading && catalog.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No products in inventory. Ask your vendor to add stock in the vendor panel, or complete without
              selecting items.
            </p>
          )}

          {/* Selected Products */}
          {products.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Used Products</p>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between bg-secondary rounded-lg p-3"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-sm block truncate">{product.name}</span>
                    <span className="text-[10px] text-muted-foreground">Max {product.maxStock}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold text-sm">
                      {product.quantity} {product.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, 1)}
                      disabled={product.quantity >= product.maxStock}
                      className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Available Products */}
          {!loading && catalogToPick.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Add Products</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {catalogToPick.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product.id)}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg text-left hover:bg-muted/80 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{product.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              Complete Service
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
