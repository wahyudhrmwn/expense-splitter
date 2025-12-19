"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useExpenseSplitterStore } from "@/store/expenseSplitterStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Users,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  ArrowRight,
  LogOut,
  User,
} from "lucide-react";

export default function ExpenseSplitterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    groups,
    selectedGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    addPerson,
    deletePerson,
    addExpense,
    deleteExpense,
    setSelectedGroup,
    getGroupById,
    calculateBalances,
    getSettlements,
  } = useExpenseSplitterStore();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [personName, setPersonName] = useState("");
  const [expenseData, setExpenseData] = useState({
    title: "",
    paidBy: "",
    items: [] as Array<{ personId: string; itemName: string; amount: number }>,
    includeTax: false,
    taxPercentage: 0, // User input sendiri
  });

  // Get current group directly using getGroupById (called in render, not in selector)
  const currentGroup = selectedGroup ? getGroupById(selectedGroup) : null;

  // Subscribe to groups length to trigger recalculation when groups change
  const groupsLength = useExpenseSplitterStore((state) => state.groups.length);

  // Subscribe to expenses and people count for the selected group
  const expensesCount = useExpenseSplitterStore((state) => {
    if (!selectedGroup) return 0;
    const group = state.groups.find((g) => g.id === selectedGroup);
    return group?.expenses?.length || 0;
  });

  const peopleCount = useExpenseSplitterStore((state) => {
    if (!selectedGroup) return 0;
    const group = state.groups.find((g) => g.id === selectedGroup);
    return group?.people?.length || 0;
  });

  // Calculate balances and settlements - will recalculate when counts change
  const balances = useMemo(() => {
    if (!currentGroup || !selectedGroup) return {};
    return calculateBalances(selectedGroup);
  }, [
    expensesCount,
    peopleCount,
    groupsLength,
    selectedGroup,
    calculateBalances,
  ]);

  const settlements = useMemo(() => {
    if (!currentGroup || !selectedGroup) return [];
    return getSettlements(selectedGroup);
  }, [expensesCount, peopleCount, groupsLength, selectedGroup, getSettlements]);

  // Reset expense form when group changes
  useEffect(() => {
    if (currentGroup) {
      setExpenseData({
        title: "",
        paidBy: "",
        items: [],
        includeTax: false,
        taxPercentage: 0,
      });
    }
  }, [selectedGroup]);

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    addGroup({
      ...formData,
      people: [],
      expenses: [],
    });
    setFormData({ title: "", description: "" });
    setIsAdding(false);
  };

  const handleAddPerson = () => {
    if (personName.trim() && currentGroup) {
      addPerson(currentGroup.id, {
        name: personName.trim(),
        email: "",
      });
      setPersonName("");
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentGroup) {
      alert("Pilih group terlebih dahulu");
      return;
    }

    if (!expenseData.title.trim()) {
      alert("Masukkan judul pengeluaran");
      return;
    }

    if (!expenseData.paidBy) {
      alert("Pilih siapa yang membayar");
      return;
    }

    if (expenseData.items.length === 0) {
      alert("Tambahkan minimal satu item");
      return;
    }

    // Calculate subtotal (sum of all items)
    const subtotal = expenseData.items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    if (subtotal <= 0) {
      alert("Total pengeluaran harus lebih dari 0");
      return;
    }

    // Validate tax percentage if tax is included
    if (expenseData.includeTax && expenseData.taxPercentage <= 0) {
      alert("Masukkan persentase pajak yang valid");
      return;
    }

    // Calculate total amount (with tax if included)
    let totalAmount = subtotal;
    if (expenseData.includeTax && expenseData.taxPercentage > 0) {
      const taxAmount = subtotal * (expenseData.taxPercentage / 100);
      totalAmount = subtotal + taxAmount;
    }

    addExpense(currentGroup.id, {
      title: expenseData.title.trim(),
      totalAmount: totalAmount,
      paidBy: expenseData.paidBy,
      items: expenseData.items.filter(
        (item) => item.itemName.trim() && item.amount > 0
      ),
      includeTax: expenseData.includeTax,
      taxPercentage: expenseData.includeTax ? expenseData.taxPercentage : 0,
      category: "",
      date: new Date(),
      description: "",
    });

    setExpenseData({
      title: "",
      paidBy: "",
      items: [],
      includeTax: false,
      taxPercentage: 0,
    });
  };

  const handleAddItem = (personId: string) => {
    setExpenseData({
      ...expenseData,
      items: [...expenseData.items, { personId, itemName: "", amount: 0 }],
    });
  };

  const handleUpdateItem = (
    index: number,
    field: "personId" | "itemName" | "amount",
    value: string | number
  ) => {
    const newItems = [...expenseData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setExpenseData({
      ...expenseData,
      items: newItems,
    });
  };

  const handleRemoveItem = (index: number) => {
    setExpenseData({
      ...expenseData,
      items: expenseData.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0" />
                <span className="truncate">Expense Splitter</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Bagi tagihan dengan teman secara adil dan otomatis
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {session?.user && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="hidden sm:inline truncate max-w-[120px] md:max-w-none">
                    {session.user.name || session.user.email}
                  </span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-1.5 sm:gap-2 touch-manipulation"
                size="sm"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-4 sm:mb-6">
          <Button
            onClick={() => setIsAdding(true)}
            className="gap-2 w-full sm:w-auto touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Buat Group Baru</span>
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Buat Group Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGroup} className="space-y-4">
                <div>
                  <Label htmlFor="title">Nama Group</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Buat Group</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={
                selectedGroup === group.id ? "ring-2 ring-primary" : ""
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedGroup(
                          selectedGroup === group.id ? null : group.id
                        )
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGroup(group.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {group.people.length} orang • {group.expenses.length}{" "}
                  pengeluaran
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {currentGroup && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anggota Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentGroup.people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span>{person.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePerson(currentGroup.id, person.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <Input
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPerson();
                      }
                    }}
                    placeholder="Nama anggota"
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleAddPerson}
                    className="touch-manipulation shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <Input
                    placeholder="Judul pengeluaran (contoh: Makan siang)"
                    value={expenseData.title}
                    onChange={(e) =>
                      setExpenseData({ ...expenseData, title: e.target.value })
                    }
                    required
                    className="text-sm"
                  />

                  <div>
                    <Label className="text-sm mb-2 block">
                      Item per orang:
                    </Label>
                    <div className="space-y-2">
                      {expenseData.items.map((item, index) => {
                        const person = currentGroup.people.find(
                          (p) => p.id === item.personId
                        );
                        return (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center p-2 border rounded bg-muted/30"
                          >
                            <Select
                              value={item.personId}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  "personId",
                                  e.target.value
                                )
                              }
                              className="flex-1 min-w-0 text-sm"
                            >
                              <option value="">Pilih orang</option>
                              {currentGroup.people.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </Select>
                            <Input
                              placeholder="Nama item"
                              value={item.itemName}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  "itemName",
                                  e.target.value
                                )
                              }
                              className="flex-1 min-w-0 text-sm"
                            />
                            <div className="flex gap-2 items-center">
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Rp"
                                value={
                                  item.amount === 0 ? "" : item.amount || ""
                                }
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "" || /^\d+$/.test(value)) {
                                    handleUpdateItem(
                                      index,
                                      "amount",
                                      value === "" ? 0 : Number(value)
                                    );
                                  }
                                }}
                                className="w-full sm:w-28 flex-1 sm:flex-initial text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(index)}
                                className="text-destructive touch-manipulation shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex flex-wrap gap-2">
                        {currentGroup.people.map((p) => (
                          <Button
                            key={p.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddItem(p.id)}
                            className="text-xs touch-manipulation"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[100px] sm:max-w-none">
                              {p.name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    {expenseData.items.length > 0 &&
                      (() => {
                        const subtotal = expenseData.items.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        );
                        const taxAmount =
                          expenseData.includeTax &&
                          expenseData.taxPercentage > 0
                            ? subtotal * (expenseData.taxPercentage / 100)
                            : 0;
                        const total = subtotal + taxAmount;
                        return (
                          <div className="mt-2 p-3 bg-primary/10 rounded space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span className="font-medium">
                                Rp {subtotal.toLocaleString("id-ID")}
                              </span>
                            </div>
                            {expenseData.includeTax &&
                              expenseData.taxPercentage > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>
                                    Pajak ({expenseData.taxPercentage}%):
                                  </span>
                                  <span className="font-medium text-primary">
                                    + Rp{" "}
                                    {Math.round(taxAmount).toLocaleString(
                                      "id-ID"
                                    )}
                                  </span>
                                </div>
                              )}
                            <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
                              <span>Total yang dibayar:</span>
                              <span className="text-primary">
                                Rp {Math.round(total).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expenseData.includeTax}
                        onChange={(e) =>
                          setExpenseData({
                            ...expenseData,
                            includeTax: e.target.checked,
                          })
                        }
                        className="cursor-pointer"
                      />
                      <span className="text-sm">Termasuk pajak</span>
                    </label>
                    {expenseData.includeTax && (
                      <div className="flex gap-2 items-center">
                        <Label className="text-sm whitespace-nowrap">
                          Persentase pajak:
                        </Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={
                            expenseData.taxPercentage === 0
                              ? ""
                              : expenseData.taxPercentage || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              const numValue = value === "" ? 0 : Number(value);
                              if (numValue >= 0 && numValue <= 100) {
                                setExpenseData({
                                  ...expenseData,
                                  taxPercentage: numValue,
                                });
                              }
                            }
                          }}
                          placeholder="0"
                          className="w-32"
                          step="0.1"
                          required={expenseData.includeTax}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    )}
                  </div>

                  <Select
                    value={expenseData.paidBy}
                    onChange={(e) =>
                      setExpenseData({ ...expenseData, paidBy: e.target.value })
                    }
                    required
                  >
                    <option value="">Siapa yang bayar total?</option>
                    {currentGroup.people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>

                  <Button
                    type="submit"
                    className="w-full gap-2 h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                    disabled={
                      expenseData.items.length === 0 ||
                      !expenseData.title.trim() ||
                      !expenseData.paidBy ||
                      expenseData.items.some(
                        (item) => !item.itemName.trim() || item.amount <= 0
                      ) ||
                      (expenseData.includeTax && expenseData.taxPercentage <= 0)
                    }
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Simpan Pengeluaran
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Daftar Pengeluaran */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Daftar Pengeluaran</CardTitle>
                <CardDescription>
                  Pengeluaran yang sudah tersimpan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentGroup.expenses.length > 0 ? (
                    currentGroup.expenses.map((expense) => {
                      const paidBy = currentGroup.people.find(
                        (p) => p.id === expense.paidBy
                      );
                      const subtotal =
                        expense.items?.reduce(
                          (sum, item) => sum + item.amount,
                          0
                        ) || 0;
                      const taxAmount =
                        expense.includeTax && expense.taxPercentage > 0
                          ? expense.totalAmount - subtotal
                          : 0;
                      return (
                        <div
                          key={expense.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-lg">
                                  {expense.title}
                                </p>
                                {expense.includeTax && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    + Pajak
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 mb-2">
                                {expense.includeTax &&
                                  expense.taxPercentage > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Subtotal: Rp{" "}
                                      {subtotal.toLocaleString("id-ID")} + Pajak
                                      ({expense.taxPercentage}%): Rp{" "}
                                      {Math.round(taxAmount).toLocaleString(
                                        "id-ID"
                                      )}
                                    </p>
                                  )}
                                <p className="text-base font-bold text-primary">
                                  Total: Rp{" "}
                                  {Math.round(
                                    expense.totalAmount
                                  ).toLocaleString("id-ID")}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Dibayar oleh:{" "}
                                <span className="font-semibold text-foreground">
                                  {paidBy?.name}
                                </span>
                              </p>
                              {expense.items && expense.items.length > 0 && (
                                <div className="mt-3 pt-3 border-t space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Item per orang:
                                  </p>
                                  {expense.items.map((item, idx) => {
                                    const person = currentGroup.people.find(
                                      (p) => p.id === item.personId
                                    );
                                    // Calculate proportional tax for this item
                                    let itemTotal = item.amount;
                                    if (
                                      expense.includeTax &&
                                      expense.taxPercentage > 0 &&
                                      subtotal > 0
                                    ) {
                                      const itemTax =
                                        (item.amount / subtotal) * taxAmount;
                                      itemTotal = item.amount + itemTax;
                                    }
                                    return (
                                      <div
                                        key={idx}
                                        className="text-sm text-foreground pl-3 border-l-2 border-primary/30 py-1"
                                      >
                                        <span className="font-semibold">
                                          {person?.name}:
                                        </span>{" "}
                                        {item.itemName} -
                                        <span className="font-medium">
                                          {" "}
                                          Rp{" "}
                                          {item.amount.toLocaleString("id-ID")}
                                        </span>
                                        {expense.includeTax &&
                                          expense.taxPercentage > 0 && (
                                            <span className="text-muted-foreground">
                                              {" "}
                                              (+ pajak: Rp{" "}
                                              {Math.round(
                                                itemTotal - item.amount
                                              ).toLocaleString("id-ID")}
                                              ) =
                                              <span className="font-semibold text-primary">
                                                {" "}
                                                Rp{" "}
                                                {Math.round(
                                                  itemTotal
                                                ).toLocaleString("id-ID")}
                                              </span>
                                            </span>
                                          )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteExpense(currentGroup.id, expense.id)
                              }
                              className="text-destructive shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Belum ada pengeluaran yang tersimpan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Saldo & Penyelesaian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Saldo Setiap Orang:</Label>
                    <div className="space-y-2">
                      {Object.entries(balances).map(([personId, balance]) => {
                        const person = currentGroup.people.find(
                          (p) => p.id === personId
                        );
                        const roundedBalance = Math.round(balance * 100) / 100;
                        return (
                          <div
                            key={personId}
                            className="flex items-center justify-between p-3 border rounded bg-card"
                          >
                            <span className="font-medium">{person?.name}</span>
                            <span
                              className={`font-semibold ${
                                roundedBalance > 0.01
                                  ? "text-green-600"
                                  : roundedBalance < -0.01
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {roundedBalance > 0.01
                                ? `+Rp ${roundedBalance.toLocaleString(
                                    "id-ID"
                                  )}`
                                : roundedBalance < -0.01
                                ? `-Rp ${Math.abs(
                                    roundedBalance
                                  ).toLocaleString("id-ID")}`
                                : "Rp 0"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {Object.keys(balances).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Belum ada pengeluaran yang dibagi
                      </p>
                    )}
                  </div>
                  {settlements.length > 0 && (
                    <div>
                      <Label className="mb-2 block font-semibold">
                        Kesimpulan Penyelesaian:
                      </Label>
                      <div className="space-y-2">
                        {settlements.map((settlement, idx) => {
                          const from = currentGroup.people.find(
                            (p) => p.id === settlement.from
                          );
                          const to = currentGroup.people.find(
                            (p) => p.id === settlement.to
                          );
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-3 border-2 border-primary/20 rounded bg-primary/5"
                            >
                              <span className="font-semibold text-lg">
                                {from?.name}
                              </span>
                              <ArrowRight className="h-5 w-5 text-primary" />
                              <span className="font-semibold text-lg">
                                {to?.name}
                              </span>
                              <span className="ml-auto font-bold text-lg text-primary">
                                Rp {settlement.amount.toLocaleString("id-ID")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {settlements.length === 0 &&
                    Object.keys(balances).length > 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">
                          Semua saldo sudah seimbang (tidak ada hutang)
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {groups.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Belum ada group yang dibuat
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
