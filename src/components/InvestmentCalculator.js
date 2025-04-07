import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function InvestmentCalculator() {
  const [initialAmount, setInitialAmount] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [years, setYears] = useState(0);
  const [investmentType, setInvestmentType] = useState("Tesouro Direto");
  const [data, setData] = useState([]);
  const [cryptoInvestments, setCryptoInvestments] = useState([]);
  const [cryptoName, setCryptoName] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("investmentHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = theme === "dark" ? "#222" : "#f4f4f4";
    document.body.style.color = theme === "dark" ? "#fff" : "#000";
  }, [theme]);

  const handleAddCrypto = () => {
    if (cryptoName && cryptoAmount > 0) {
      setCryptoInvestments([...cryptoInvestments, { name: cryptoName, amount: cryptoAmount }]);
      setCryptoName("");
      setCryptoAmount(0);
    }
  };

  const getRateByType = () => {
    switch (investmentType) {
      case "Tesouro Direto": return 0.1;
      case "Ações": return 0.15;
      case "Fundos Imobiliários": return 0.12;
      case "Criptomoedas": return 0.2;
      default: return 0.1;
    }
  };

  const calculateInvestment = () => {
    let results = [];
    let total = initialAmount;
    let baseRate = getRateByType();

    for (let i = 1; i <= years; i++) {
      const yearly = (total + monthlyContribution * 12);
      const moderate = yearly * (1 + baseRate);
      const optimistic = yearly * (1 + baseRate + 0.05);
      const pessimistic = yearly * (1 + baseRate - 0.05);
      total = moderate;
      results.push({
        year: i,
        Moderado: parseFloat(moderate.toFixed(2)),
        Otimista: parseFloat(optimistic.toFixed(2)),
        Pessimista: parseFloat(pessimistic.toFixed(2))
      });
    }

    setData(results);
    const newSim = { initialAmount, monthlyContribution, interestRate: baseRate, years, investmentType, results };
    const newHistory = [newSim, ...history];
    setHistory(newHistory);
    localStorage.setItem("investmentHistory", JSON.stringify(newHistory));
  };

  const exportCSV = () => {
    let csv = "Ano,Moderado,Otimista,Pessimista\n";
    data.forEach(row => {
      csv += `${row.year},${row.Moderado},${row.Otimista},${row.Pessimista}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulacao.csv";
    a.click();
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "40px auto" }}>
      <h2 style={{ textAlign: "center", fontSize: 24, marginBottom: 20 }}>FinTrack - Calculadora de Investimentos</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)}>
          <option value="Tesouro Direto">Tesouro Direto</option>
          <option value="Criptomoedas">Criptomoedas</option>
          <option value="Ações">Ações</option>
          <option value="Fundos Imobiliários">Fundos Imobiliários</option>
        </select>

        <input type="number" value={initialAmount} onChange={(e) => setInitialAmount(+e.target.value)} placeholder="Investimento Inicial" />
        <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(+e.target.value)} placeholder="Aporte Mensal" />
        <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} placeholder="Anos" />

        {investmentType === "Criptomoedas" && (
          <div style={{ marginTop: 10 }}>
            <h4>Criptomoedas:</h4>
            <input placeholder="Nome" value={cryptoName} onChange={(e) => setCryptoName(e.target.value)} />
            <input type="number" placeholder="Valor" value={cryptoAmount} onChange={(e) => setCryptoAmount(+e.target.value)} />
            <button onClick={handleAddCrypto}>Adicionar</button>
            <ul>
              {cryptoInvestments.map((c, i) => (
                <li key={i}>{c.name}: R$ {c.amount}</li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={calculateInvestment}>Calcular</button>
        <button onClick={exportCSV}>Exportar CSV</button>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Alternar Tema</button>
      </div>

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300} style={{ marginTop: 20 }}>
          <LineChart data={data}>
            <XAxis dataKey="year" stroke={theme === "dark" ? "#fff" : "#000"} />
            <YAxis stroke={theme === "dark" ? "#fff" : "#000"} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Moderado" stroke="#00ff00" strokeWidth={2} />
            <Line type="monotone" dataKey="Otimista" stroke="#00bfff" strokeWidth={2} />
            <Line type="monotone" dataKey="Pessimista" stroke="#ff4500" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h4>Histórico de Simulações</h4>
          <ul>
            {history.map((h, idx) => (
              <li key={idx}>
                {h.investmentType} | Inicial: R${h.initialAmount} | Aporte: R${h.monthlyContribution} | Anos: {h.years}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
