import { useState } from 'react';
import { Plus, Minus, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductUsage } from '@/types';

const AVAILABLE_PRODUCTS: { id: string; name: string; unit: string }[] = [];

interface ProductUsageModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (products: ProductUsage[]) => void;
}

export function ProductUsageModal({ open, onClose, onSubmit }: ProductUsageModalProps) {
  const [products, setProducts] = useState<ProductUsage[]>([]);

  const addProduct = (productId: string) => {
    const product = AVAILABLE_PRODUCTS.find((p) => p.id === productId);
    if (product && !products.find((p) => p.id === productId)) {
      setProducts([...products, { id: product.id, name: product.name, quantity: 1, unit: product.unit }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setProducts(
      products
        .map(p =>
          p.id === productId ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
        )
        .filter(p => p.quantity > 0)
    );
  };

  const handleSubmit = () => {
    onSubmit(products);
    setProducts([]);
  };

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
          {/* Selected Products */}
          {products.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Used Products</p>
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between bg-secondary rounded-lg p-3"
                >
                  <span className="font-medium text-sm">{product.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {product.quantity} {product.unit}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Available Products */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Add Products</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {AVAILABLE_PRODUCTS.filter((p) => !products.find((sp) => sp.id === p.id)).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product.id)}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg text-left hover:bg-muted/80 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate">{product.name}</span>
                  </button>
                ))}
            </div>
          </div>

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
