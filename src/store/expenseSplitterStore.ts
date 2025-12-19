import { create } from 'zustand';

export interface Person {
  id: string;
  name: string;
  email: string;
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

  addGroup: (group: Omit<ExpenseGroup, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGroup: (id: string, updates: Partial<ExpenseGroup>) => void;
  deleteGroup: (id: string) => void;
  addPerson: (groupId: string, person: Omit<Person, 'id'>) => void;
  updatePerson: (groupId: string, personId: string, updates: Partial<Person>) => void;
  deletePerson: (groupId: string, personId: string) => void;
  addExpense: (groupId: string, expense: Omit<ExpenseItem, 'id'>) => void;
  updateExpense: (groupId: string, expenseId: string, updates: Partial<ExpenseItem>) => void;
  deleteExpense: (groupId: string, expenseId: string) => void;
  setSelectedGroup: (id: string | null) => void;
  getGroupById: (id: string) => ExpenseGroup | undefined;
  calculateBalances: (groupId: string) => Record<string, number>;
  getSettlements: (groupId: string) => Array<{ from: string; to: string; amount: number }>;
}

export const useExpenseSplitterStore = create<ExpenseSplitterState>((set, get) => ({
  groups: [],
  selectedGroup: null,

  addGroup: (group) => {
    const newGroup: ExpenseGroup = {
      ...group,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      groups: [...state.groups, newGroup],
    }));
  },

  updateGroup: (id, updates) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
      ),
    }));
  },

  deleteGroup: (id) => {
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
      selectedGroup: state.selectedGroup === id ? null : state.selectedGroup,
    }));
  },

  addPerson: (groupId, person) => {
    const newPerson: Person = {
      ...person,
      id: Date.now().toString(),
    };
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, people: [...g.people, newPerson], updatedAt: new Date() }
          : g
      ),
    }));
  },

  updatePerson: (groupId, personId, updates) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              people: g.people.map((p) =>
                p.id === personId ? { ...p, ...updates } : p
              ),
              updatedAt: new Date(),
            }
          : g
      ),
    }));
  },

  deletePerson: (groupId, personId) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              people: g.people.filter((p) => p.id !== personId),
              expenses: g.expenses.filter(
                (e) => e.paidBy !== personId && !e.items.some(item => item.personId === personId)
              ),
              updatedAt: new Date(),
            }
          : g
      ),
    }));
  },

  addExpense: (groupId, expense) => {
    const newExpense: ExpenseItem = {
      ...expense,
      id: Date.now().toString(),
    };
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, expenses: [...g.expenses, newExpense], updatedAt: new Date() }
          : g
      ),
    }));
  },

  updateExpense: (groupId, expenseId, updates) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              expenses: g.expenses.map((e) =>
                e.id === expenseId ? { ...e, ...updates } : e
              ),
              updatedAt: new Date(),
            }
          : g
      ),
    }));
  },

  deleteExpense: (groupId, expenseId) => {
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
    }));
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
      const subtotal = expense.items.reduce((sum, item) => sum + item.amount, 0);
      
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
          if (expense.includeTax && expense.taxPercentage > 0 && subtotal > 0) {
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
    const settlements: Array<{ from: string; to: string; amount: number }> = [];

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
}));

