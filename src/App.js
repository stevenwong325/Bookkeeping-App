import { useState, useEffect } from "react";

const translations = {
  en: {
    title: "Bookkeeping App",
    subtitle: "Track your income & expenses",
    totalIncome: "Total Income",
    totalExpense: "Total Expense",
    balance: "Balance",
    addTransaction: "Add New Transaction",
    editTransaction: "Edit Transaction",
    type: "Type",
    category: "Category",
    amount: "Amount",
    date: "Date",
    description: "Description",
    update: "Update",
    add: "Add Transaction",
    filterTransactions: "Filter Transactions",
    all: "All",
    income: "Income",
    expense: "Expense",
    startDate: "Start Date",
    endDate: "End Date",
    transactions: "Transactions",
    exportCSV: "Export CSV",
    noTransactions: "No transactions found.",
    edit: "Edit",
    delete: "Delete",
    manageCategories: "Manage Categories",
    addCategory: "Add Category",
    categoryName: "Category Name",
    categoryType: "Category Type",
    save: "Save",
    cancel: "Cancel",
    deleteCategory: "Delete Category",
    incomeCategories: "Income Categories",
    expenseCategories: "Expense Categories",
    newCategory: "New Category",
    categoryExists: "Category already exists",
    categoryAdded: "Category added successfully",
    categoryDeleted: "Category deleted successfully"
  },
  zh: {
    title: "記帳應用",
    subtitle: "追蹤您的收支",
    totalIncome: "總收入",
    totalExpense: "總支出",
    balance: "餘額",
    addTransaction: "新增交易",
    editTransaction: "編輯交易",
    type: "類型",
    category: "類別",
    amount: "金額",
    date: "日期",
    description: "描述",
    update: "更新",
    add: "新增交易",
    filterTransactions: "篩選交易",
    all: "全部",
    income: "收入",
    expense: "支出",
    startDate: "開始日期",
    endDate: "結束日期",
    transactions: "交易記錄",
    exportCSV: "匯出CSV",
    noTransactions: "未找到交易記錄。",
    edit: "編輯",
    delete: "刪除",
    manageCategories: "管理類別",
    addCategory: "新增類別",
    categoryName: "類別名稱",
    categoryType: "類別類型",
    save: "儲存",
    cancel: "取消",
    deleteCategory: "刪除類別",
    incomeCategories: "收入類別",
    expenseCategories: "支出類別",
    newCategory: "新增類別",
    categoryExists: "類別已存在",
    categoryAdded: "類別新增成功",
    categoryDeleted: "類別刪除成功"
  }
};

export default function App() {
  const [language, setLanguage] = useState("en");
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({
    income: ["Salary", "Freelance", "Investment", "Gift"],
    expense: ["Rent", "Groceries", "Utilities", "Transport", "Entertainment"],
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", type: "income" });

  const [form, setForm] = useState({
    type: "income",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    receipt: null,
  });

  const [filter, setFilter] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("transactions");
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when transactions change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;

    const newTransaction = {
      id: editingId || Date.now(),
      ...form,
      amount: parseFloat(form.amount),
    };

    if (editingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingId ? newTransaction : t))
      );
      setEditingId(null);
    } else {
      setTransactions((prev) => [newTransaction, ...prev]);
    }

    setForm({
      type: "income",
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      receipt: null,
    });
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setForm({ ...transaction });
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getFilteredTransactions = () => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      const start = filter.startDate ? new Date(filter.startDate) : null;
      const end = filter.endDate ? new Date(filter.endDate) : null;

      return (
        (!filter.type || t.type === filter.type) &&
        (!filter.category || t.category === filter.category) &&
        (!start || date >= start) &&
        (!end || date <= end)
      );
    });
  };

  const filtered = getFilteredTransactions();

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const exportToCSV = () => {
    const csvRows = [
      ["Type", "Category", "Amount", "Date", "Description"].join(","),
      ...filtered.map(
        (t) =>
          `${t.type},${t.category},${t.amount},${t.date},${t.description}`
      ),
    ];
    const csvString = csvRows.join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "bookkeeping-export.csv";
    link.click();
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    const categoryExists = categories[newCategory.type].includes(newCategory.name);
    if (categoryExists) {
      alert(translations[language].categoryExists);
      return;
    }

    setCategories(prev => ({
      ...prev,
      [newCategory.type]: [...prev[newCategory.type], newCategory.name]
    }));

    setNewCategory({ name: "", type: "income" });
    alert(translations[language].categoryAdded);
  };

  const handleDeleteCategory = (type, category) => {
    if (window.confirm(translations[language].deleteCategory + "?")) {
      setCategories(prev => ({
        ...prev,
        [type]: prev[type].filter(c => c !== category)
      }));
      alert(translations[language].categoryDeleted);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <div className="flex justify-end mb-4 space-x-2">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded text-sm"
            >
              {translations[language].manageCategories}
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
            >
              {language === "en" ? "繁體中文" : "English"}
            </button>
          </div>
          <h1 className={`text-3xl font-bold text-gray-800 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
            {translations[language].title}
          </h1>
          <p className={`text-gray-600 mt-2 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
            {translations[language].subtitle}
          </p>
        </header>

        {/* Category Management Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className={`text-xl font-semibold mb-4 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                {translations[language].manageCategories}
              </h2>

              {/* Add New Category Form */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className={`text-lg font-medium mb-3 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].newCategory}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                      {translations[language].categoryName}
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                      {translations[language].categoryType}
                    </label>
                    <select
                      value={newCategory.type}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="income">{translations[language].income}</option>
                      <option value="expense">{translations[language].expense}</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddCategory}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  {translations[language].addCategory}
                </button>
              </div>

              {/* Existing Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                    {translations[language].incomeCategories}
                  </h3>
                  <div className="space-y-2">
                    {categories.income.map((category) => (
                      <div key={category} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className={`${language === "zh" ? "font-noto-sans-tc" : ""}`}>{category}</span>
                        <button
                          onClick={() => handleDeleteCategory("income", category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {translations[language].delete}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                    {translations[language].expenseCategories}
                  </h3>
                  <div className="space-y-2">
                    {categories.expense.map((category) => (
                      <div key={category} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className={`${language === "zh" ? "font-noto-sans-tc" : ""}`}>{category}</span>
                        <button
                          onClick={() => handleDeleteCategory("expense", category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {translations[language].delete}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                >
                  {translations[language].cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Balance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <p className={`text-sm text-gray-600 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
              {translations[language].totalIncome}
            </p>
            <p className="text-xl font-semibold text-green-600">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <p className={`text-sm text-gray-600 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
              {translations[language].totalExpense}
            </p>
            <p className="text-xl font-semibold text-red-600">
              ${totalExpense.toFixed(2)}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4 text-center">
            <p className={`text-sm text-gray-600 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
              {translations[language].balance}
            </p>
            <p className={`text-xl font-semibold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Form */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className={`text-xl font-semibold mb-4 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
            {editingId ? translations[language].editTransaction : translations[language].addTransaction}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].type}
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full border border-gray-300 rounded-md p-2 ${language === "zh" ? "font-noto-sans-tc" : ""}`}
                >
                  <option value="income">{translations[language].income}</option>
                  <option value="expense">{translations[language].expense}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].category}
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full border border-gray-300 rounded-md p-2 ${language === "zh" ? "font-noto-sans-tc" : ""}`}
                >
                  <option value="">{translations[language].category}</option>
                  {categories[form.type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].amount}
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].date}
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                {translations[language].description}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="2"
                className={`mt-1 block w-full border border-gray-300 rounded-md p-2 ${language === "zh" ? "font-noto-sans-tc" : ""}`}
              ></textarea>
            </div>
            <button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded ${language === "zh" ? "font-noto-sans-tc" : ""}`}
            >
              {editingId ? translations[language].update : translations[language].add}
            </button>
          </form>
        </section>

        {/* Filters */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className={`text-xl font-semibold mb-4 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
            {translations[language].filterTransactions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                {translations[language].type}
              </label>
              <select
                value={filter.type}
                onChange={(e) =>
                  setFilter({ ...filter, type: e.target.value })
                }
                className={`mt-1 block w-full border border-gray-300 rounded-md p-2 ${language === "zh" ? "font-noto-sans-tc" : ""}`}
              >
                <option value="">{translations[language].all}</option>
                <option value="income">{translations[language].income}</option>
                <option value="expense">{translations[language].expense}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                {translations[language].category}
              </label>
              <select
                value={filter.category}
                onChange={(e) =>
                  setFilter({ ...filter, category: e.target.value })
                }
                className={`mt-1 block w-full border border-gray-300 rounded-md p-2 ${language === "zh" ? "font-noto-sans-tc" : ""}`}
              >
                <option value="">{translations[language].all}</option>
                {[...categories.income, ...categories.expense].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                {translations[language].startDate}
              </label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) =>
                  setFilter({ ...filter, startDate: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium text-gray-700 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                {translations[language].endDate}
              </label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) =>
                  setFilter({ ...filter, endDate: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        </section>

        {/* Transactions Table */}
        <section className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4">
            <h2 className={`text-xl font-semibold ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
              {translations[language].transactions}
            </h2>
            <button
              onClick={exportToCSV}
              className={`bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm ${language === "zh" ? "font-noto-sans-tc" : ""}`}
            >
              {translations[language].exportCSV}
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].date}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].type}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].category}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].amount}
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  {translations[language].description}
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {t.date}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm capitalize ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                      {translations[language][t.type]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {t.category}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      ${t.amount.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                      {t.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEdit(t)}
                        className={`text-blue-600 hover:text-blue-900 mr-2 ${language === "zh" ? "font-noto-sans-tc" : ""}`}
                      >
                        {translations[language].edit}
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className={`text-red-600 hover:text-red-900 ${language === "zh" ? "font-noto-sans-tc" : ""}`}
                      >
                        {translations[language].delete}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`px-6 py-4 text-center text-gray-500 ${language === "zh" ? "font-noto-sans-tc" : ""}`}>
                    {translations[language].noTransactions}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}