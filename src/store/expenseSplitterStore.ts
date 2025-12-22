import { create } from "zustand";

export interface Person {
  id: string;
  name: string;
  email: string | null;
}

export interface ExpenseItemPerson {
  personId: string;
  itemName: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  title: string;
  totalAmount: number; // total yang dibayar oleh paidBy
  paidBy: string; // person id yang membayar
  items: ExpenseItemPerson[]; // item per orang dengan nominal masing-masing
  includeTax: boolean; // apakah pembayaran termasuk pajak
  taxPercentage: number; // persentase pajak (default 11% untuk PPN)
  category: string;
  date: Date;
  description: string;
}

export interface ExpenseGroup {
  id: string;
  title: string;
  description: string;
  people: Person[];
  expenses: ExpenseItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface ExpenseSplitterState {
  groups: ExpenseGroup[];
  selectedGroup: string | null;
  loading: boolean;
  error: string | null;

  // API functions
  fetchGroups: () => Promise<void>;
  addGroup: (
    group: Omit<ExpenseGroup, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateGroup: (id: string, updates: Partial<ExpenseGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addPerson: (groupId: string, person: Omit<Person, "id">) => Promise<void>;
  updatePerson: (
    groupId: string,
    personId: string,
    updates: Partial<Person>
  ) => Promise<void>;
  deletePerson: (groupId: string, personId: string) => Promise<void>;
  addExpense: (
    groupId: string,
    expense: Omit<ExpenseItem, "id">
  ) => Promise<void>;
  updateExpense: (
    groupId: string,
    expenseId: string,
    updates: Partial<ExpenseItem>
  ) => Promise<void>;
  deleteExpense: (groupId: string, expenseId: string) => Promise<void>;
  setSelectedGroup: (id: string | null) => void;
  getGroupById: (id: string) => ExpenseGroup | undefined;
  calculateBalances: (groupId: string) => Record<string, number>;
  getSettlements: (
    groupId: string
  ) => Array<{ from: string; to: string; amount: number }>;
}

export const useExpenseSplitterStore = create<ExpenseSplitterState>(
  (set, get) => ({
    groups: [],
    selectedGroup: null,
    loading: false,
    error: null,

    fetchGroups: async () => {
      set({ loading: true, error: null });
      try {
        const response = await fetch("/api/expense-groups");
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const groups = await response.json();
        // Convert date strings to Date objects
        const transformedGroups = groups.map((group: any) => ({
          ...group,
          createdAt: new Date(group.createdAt),
          updatedAt: new Date(group.updatedAt),
          expenses: group.expenses.map((expense: any) => ({
            ...expense,
            date: new Date(expense.date),
          })),
        }));
        set({ groups: transformedGroups, loading: false });
      } catch (error) {
        console.error("Error fetching groups:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch groups",
          loading: false,
        });
      }
    },

    addGroup: async (group) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch("/api/expense-groups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: group.title,
            description: group.description,
            people: group.people,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create group");
        }

        const newGroup = await response.json();
        // Convert date strings to Date objects
        const transformedGroup = {
          ...newGroup,
          createdAt: new Date(newGroup.createdAt),
          updatedAt: new Date(newGroup.updatedAt),
          expenses: newGroup.expenses.map((expense: any) => ({
            ...expense,
            date: new Date(expense.date),
          })),
        };

        set((state) => ({
          groups: [...state.groups, transformedGroup],
          loading: false,
        }));
      } catch (error) {
        console.error("Error adding group:", error);
        set({
          error: error instanceof Error ? error.message : "Failed to add group",
          loading: false,
        });
        throw error;
      }
    },

    updateGroup: async (id, updates) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(`/api/expense-groups/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updates.title,
            description: updates.description,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update group");
        }

        const updatedGroup = await response.json();
        // Convert date strings to Date objects
        const transformedGroup = {
          ...updatedGroup,
          createdAt: new Date(updatedGroup.createdAt),
          updatedAt: new Date(updatedGroup.updatedAt),
          expenses: updatedGroup.expenses.map((expense: any) => ({
            ...expense,
            date: new Date(expense.date),
          })),
        };

        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? transformedGroup : g)),
          loading: false,
        }));
      } catch (error) {
        console.error("Error updating group:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to update group",
          loading: false,
        });
        throw error;
      }
    },

    deleteGroup: async (id) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(`/api/expense-groups/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete group");
        }

        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
          selectedGroup:
            state.selectedGroup === id ? null : state.selectedGroup,
          loading: false,
        }));
      } catch (error) {
        console.error("Error deleting group:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to delete group",
          loading: false,
        });
        throw error;
      }
    },

    addPerson: async (groupId, person) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(`/api/expense-groups/${groupId}/people`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: person.name,
            email: person.email || null,
          }),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = {
              error: `HTTP ${response.status}: ${response.statusText}`,
            };
          }
          throw new Error(errorData.error || "Failed to add person");
        }

        const newPerson = await response.json();

        // Validate response
        if (!newPerson || !newPerson.id) {
          throw new Error("Invalid response from server");
        }

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  people: [...g.people, newPerson],
                  updatedAt: new Date(),
                }
              : g
          ),
          loading: false,
        }));
      } catch (error) {
        console.error("Error adding person:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to add person",
          loading: false,
        });
        throw error;
      }
    },

    updatePerson: async (groupId, personId, updates) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `/api/expense-groups/${groupId}/people/${personId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update person");
        }

        const updatedPerson = await response.json();

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  people: g.people.map((p) =>
                    p.id === personId ? updatedPerson : p
                  ),
                  updatedAt: new Date(),
                }
              : g
          ),
          loading: false,
        }));
      } catch (error) {
        console.error("Error updating person:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to update person",
          loading: false,
        });
        throw error;
      }
    },

    deletePerson: async (groupId, personId) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `/api/expense-groups/${groupId}/people/${personId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete person");
        }

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  people: g.people.filter((p) => p.id !== personId),
                  expenses: g.expenses.filter(
                    (e) =>
                      e.paidBy !== personId &&
                      !e.items.some((item) => item.personId === personId)
                  ),
                  updatedAt: new Date(),
                }
              : g
          ),
          loading: false,
        }));
      } catch (error) {
        console.error("Error deleting person:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to delete person",
          loading: false,
        });
        throw error;
      }
    },

    addExpense: async (groupId, expense) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `/api/expense-groups/${groupId}/expenses`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...expense,
              date: expense.date.toISOString(),
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add expense");
        }

        const newExpense = await response.json();
        // Convert date string to Date object
        const transformedExpense = {
          ...newExpense,
          date: new Date(newExpense.date),
        };

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  expenses: [...g.expenses, transformedExpense],
                  updatedAt: new Date(),
                }
              : g
          ),
          loading: false,
        }));
      } catch (error) {
        console.error("Error adding expense:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to add expense",
          loading: false,
        });
        throw error;
      }
    },

    updateExpense: async (groupId, expenseId, updates) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `/api/expense-groups/${groupId}/expenses/${expenseId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...updates,
              date: updates.date
                ? new Date(updates.date).toISOString()
                : undefined,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update expense");
        }

        const updatedExpense = await response.json();
        // Convert date string to Date object
        const transformedExpense = {
          ...updatedExpense,
          date: new Date(updatedExpense.date),
        };

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  expenses: g.expenses.map((e) =>
                    e.id === expenseId ? transformedExpense : e
                  ),
                  updatedAt: new Date(),
                }
              : g
          ),
          loading: false,
        }));
      } catch (error) {
        console.error("Error updating expense:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to update expense",
          loading: false,
        });
        throw error;
      }
    },

    deleteExpense: async (groupId, expenseId) => {
      set({ loading: true, error: null });
      try {
        const response = await fetch(
          `/api/expense-groups/${groupId}/expenses/${expenseId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete expense");
        }

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  expenses: g.expenses.filter((e) => e.id !== expenseId),
                  updatedAt: new Date(),
                }
              : g
          ),
          loading: false,
        }));
      } catch (error) {
        console.error("Error deleting expense:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to delete expense",
          loading: false,
        });
        throw error;
      }
    },

    setSelectedGroup: (id) => {
      set({ selectedGroup: id });
    },

    getGroupById: (id) => {
      return get().groups.find((g) => g.id === id);
    },

    calculateBalances: (groupId) => {
      const group = get().getGroupById(groupId);
      if (!group) return {};

      const balances: Record<string, number> = {};
      group.people.forEach((p) => {
        balances[p.id] = 0;
      });

      group.expenses.forEach((expense) => {
        // Skip if no items
        if (!expense.items || expense.items.length === 0) {
          return;
        }

        // Calculate subtotal (sum of all items without tax)
        const subtotal = expense.items.reduce(
          (sum, item) => sum + item.amount,
          0
        );

        // Calculate tax amount if included
        let taxAmount = 0;
        if (expense.includeTax && expense.taxPercentage > 0 && subtotal > 0) {
          // Tax is calculated from subtotal and added to get totalAmount
          // totalAmount = subtotal + (subtotal * taxPercentage / 100)
          // So taxAmount = subtotal * (taxPercentage / 100)
          taxAmount = subtotal * (expense.taxPercentage / 100);
        }

        // Person who paid gets credited with the total amount (they paid it, including tax)
        if (expense.paidBy && balances[expense.paidBy] !== undefined) {
          balances[expense.paidBy] += expense.totalAmount;
        }

        // Each person owes their item amount plus proportional tax
        expense.items.forEach((item) => {
          if (balances[item.personId] !== undefined) {
            // Calculate proportional tax for this item
            let itemAmount = item.amount;
            if (
              expense.includeTax &&
              expense.taxPercentage > 0 &&
              subtotal > 0
            ) {
              // Add proportional tax to item amount
              const itemTax = (item.amount / subtotal) * taxAmount;
              itemAmount = item.amount + itemTax;
            }
            balances[item.personId] -= itemAmount;
          }
        });
      });

      return balances;
    },

    getSettlements: (groupId) => {
      const balances = get().calculateBalances(groupId);
      const settlements: Array<{ from: string; to: string; amount: number }> =
        [];

      const creditors: Array<{ id: string; amount: number }> = [];
      const debtors: Array<{ id: string; amount: number }> = [];

      Object.entries(balances).forEach(([id, balance]) => {
        if (balance > 0) {
          creditors.push({ id, amount: balance });
        } else if (balance < 0) {
          debtors.push({ id, amount: Math.abs(balance) });
        }
      });

      creditors.sort((a, b) => b.amount - a.amount);
      debtors.sort((a, b) => b.amount - a.amount);

      let creditorIndex = 0;
      let debtorIndex = 0;

      while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
        const creditor = creditors[creditorIndex];
        const debtor = debtors[debtorIndex];

        const amount = Math.min(creditor.amount, debtor.amount);

        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: Math.round(amount * 100) / 100,
        });

        creditor.amount -= amount;
        debtor.amount -= amount;

        if (creditor.amount < 0.01) {
          creditorIndex++;
        }
        if (debtor.amount < 0.01) {
          debtorIndex++;
        }
      }

      return settlements;
    },
  })
);
