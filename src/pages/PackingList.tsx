import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Check,
  Trash2,
  Edit2,
  Package,
  Shirt,
  Sparkles,
  Smartphone,
  FileText,
  Pill,
  Watch,
  MoreHorizontal,
  Loader2,
  CheckCheck,
  X,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { packingApi, PackingItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const categoryIcons: Record<string, React.ReactNode> = {
  clothing: <Shirt className="h-4 w-4" />,
  toiletries: <Sparkles className="h-4 w-4" />,
  electronics: <Smartphone className="h-4 w-4" />,
  documents: <FileText className="h-4 w-4" />,
  medicine: <Pill className="h-4 w-4" />,
  accessories: <Watch className="h-4 w-4" />,
  other: <Package className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  clothing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  toiletries: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  electronics: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  documents: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  medicine: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  accessories: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const categoryLabels: Record<string, string> = {
  clothing: "Clothing",
  toiletries: "Toiletries",
  electronics: "Electronics",
  documents: "Documents",
  medicine: "Medicine",
  accessories: "Accessories",
  other: "Other",
};

// Suggested items by category
const suggestedItems: Record<string, string[]> = {
  clothing: ["T-shirts", "Pants", "Underwear", "Socks", "Jacket", "Sleepwear", "Swimwear", "Shoes"],
  toiletries: ["Toothbrush", "Toothpaste", "Shampoo", "Soap", "Deodorant", "Sunscreen", "Razor", "Moisturizer"],
  electronics: ["Phone charger", "Power bank", "Camera", "Headphones", "Laptop", "Universal adapter"],
  documents: ["Passport", "ID Card", "Travel insurance", "Tickets", "Hotel booking", "Visa copy"],
  medicine: ["Painkillers", "Band-aids", "Antiseptic", "Personal medications", "Vitamins", "Motion sickness pills"],
  accessories: ["Sunglasses", "Watch", "Wallet", "Belt", "Hat/Cap", "Umbrella", "Backpack"],
  other: ["Snacks", "Water bottle", "Travel pillow", "Books", "Games", "Guidebook"],
};

interface PackingData {
  tripId: string;
  tripName: string;
  destination?: string;
  packingList: PackingItem[];
  stats: {
    total: number;
    packed: number;
    remaining: number;
    progress: number;
  };
}

const defaultItem: Partial<PackingItem> = {
  name: "",
  quantity: 1,
  category: "other",
};

export default function PackingList() {
  const { tripId } = useParams<{ tripId: string }>();
  const { toast } = useToast();

  const [data, setData] = useState<PackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<PackingItem>>(defaultItem);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [suggestionCategory, setSuggestionCategory] = useState<string>("clothing");

  useEffect(() => {
    fetchPackingList();
  }, [tripId]);

  const fetchPackingList = async () => {
    if (!tripId) return;
    
    setLoading(true);
    try {
      const response = await packingApi.getPackingList(tripId);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching packing list:", error);
      toast({
        title: "Error",
        description: "Failed to load packing list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!tripId || !newItem.name) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await packingApi.addItem(tripId, newItem);
      await fetchPackingList();
      setIsAddDialogOpen(false);
      setNewItem(defaultItem);
      toast({
        title: "Item added!",
        description: `Added "${newItem.name}" to your packing list`,
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!tripId || !editingItem?._id) return;

    setSaving(true);
    try {
      await packingApi.updateItem(tripId, editingItem._id, editingItem);
      await fetchPackingList();
      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({
        title: "Item updated!",
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!tripId) return;

    try {
      await packingApi.deleteItem(tripId, itemId);
      await fetchPackingList();
      toast({
        title: "Item deleted",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!tripId) return;

    try {
      await packingApi.toggleItem(tripId, itemId);
      await fetchPackingList();
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const handleToggleAll = async (packed: boolean) => {
    if (!tripId) return;

    try {
      await packingApi.toggleAll(tripId, packed);
      await fetchPackingList();
      toast({
        title: packed ? "All items packed!" : "All items unpacked",
      });
    } catch (error) {
      console.error("Error toggling all:", error);
    }
  };

  const handleAddSuggestions = async () => {
    if (!tripId || selectedSuggestions.size === 0) return;

    setSaving(true);
    try {
      const items = Array.from(selectedSuggestions).map(name => ({
        name,
        quantity: 1,
        category: suggestionCategory as PackingItem["category"],
      }));

      await packingApi.addMultipleItems(tripId, items);
      await fetchPackingList();
      setIsSuggestDialogOpen(false);
      setSelectedSuggestions(new Set());
      toast({
        title: "Items added!",
        description: `Added ${items.length} items to your packing list`,
      });
    } catch (error) {
      console.error("Error adding suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to add items",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSuggestion = (item: string) => {
    const newSet = new Set(selectedSuggestions);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setSelectedSuggestions(newSet);
  };

  // Filter items
  const filteredItems = data?.packingList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 nav-glass">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/trips">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <span className="font-semibold">Packing List</span>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Trip not found</p>
          <Button asChild className="mt-4">
            <Link to="/trips">Back to Trips</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/trip/${tripId}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">Packing List</h1>
                <p className="text-xs text-muted-foreground">{data.tripName}</p>
              </div>
            </div>
            <Badge variant="outline">
              <Package className="h-3 w-3 mr-1" />
              {data.stats.total} items
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {data.stats.packed} of {data.stats.total} packed
            </span>
            <span className="text-sm text-muted-foreground">
              {data.stats.progress}%
            </span>
          </div>
          <Progress value={data.stats.progress} className="h-2" />
          
          {data.stats.total > 0 && (
            <div className="flex justify-end mt-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleAll(true)}
                disabled={data.stats.packed === data.stats.total}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Pack All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleAll(false)}
                disabled={data.stats.packed === 0}
              >
                <X className="h-4 w-4 mr-1" />
                Unpack All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    {categoryIcons[value]}
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSuggestDialogOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Suggestions
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <Card className="card-3d">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {searchQuery || filterCategory !== "all" 
                  ? "No items found" 
                  : "Your packing list is empty"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || filterCategory !== "all"
                  ? "Try adjusting your search or filter"
                  : "Start adding items you need to pack"}
              </p>
              {!searchQuery && filterCategory === "all" && (
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => setIsSuggestDialogOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Suggestions
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="card-3d">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className={`p-1.5 rounded ${categoryColors[category]}`}>
                      {categoryIcons[category]}
                    </span>
                    {categoryLabels[category]}
                    <Badge variant="secondary" className="ml-auto">
                      {items.filter(i => i.isPacked).length}/{items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          item.isPacked 
                            ? "bg-success/10 border-success/20" 
                            : "bg-card hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          checked={item.isPacked}
                          onCheckedChange={() => item._id && handleToggleItem(item._id)}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${item.isPacked ? "line-through text-muted-foreground" : ""}`}>
                            {item.name}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          )}
                        </div>

                        {item.isPacked && (
                          <Check className="h-4 w-4 text-success shrink-0" />
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingItem(item);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => item._id && handleDeleteItem(item._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>
              Add a new item to your packing list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Item Name *</label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., T-shirts"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, category: value as PackingItem["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          {categoryIcons[value]}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Item Name *</label>
                <Input
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min={1}
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) =>
                      setEditingItem({
                        ...editingItem,
                        category: value as PackingItem["category"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {categoryIcons[value]}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suggestions Dialog */}
      <Dialog open={isSuggestDialogOpen} onOpenChange={setIsSuggestDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Suggested Items</DialogTitle>
            <DialogDescription>
              Select items to add to your packing list
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={suggestionCategory}
              onValueChange={(value) => {
                setSuggestionCategory(value);
                setSelectedSuggestions(new Set());
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {categoryIcons[value]}
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {suggestedItems[suggestionCategory]?.map((item) => {
                const isSelected = selectedSuggestions.has(item);
                const alreadyExists = data?.packingList.some(
                  (i) => i.name.toLowerCase() === item.toLowerCase()
                );

                return (
                  <Button
                    key={item}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="justify-start"
                    disabled={alreadyExists}
                    onClick={() => toggleSuggestion(item)}
                  >
                    {isSelected && <Check className="h-3 w-3 mr-2" />}
                    {item}
                    {alreadyExists && (
                      <span className="ml-auto text-xs opacity-50">(added)</span>
                    )}
                  </Button>
                );
              })}
            </div>

            {selectedSuggestions.size > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedSuggestions.size} item(s) selected
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuggestDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSuggestions}
              disabled={saving || selectedSuggestions.size === 0}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add {selectedSuggestions.size} Item(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
