import { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function App() {
  const [initialAmount, setInitialAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [years, setYears] = useState("");
  const [investmentType, setInvestmentType] = useState("Tesouro Selic");
  const [data, setData] = useState([]);
  const [cryptos, setCryptos] = useState([{ name: "", amount: "", rate: "" }]);
  const [selicRate, setSelicRate] = useState("");
  const [theme, setTheme] = useState("light");
  const chartRef = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = theme === "light" ? "#ffffff" : "#121212";
    document.body.style.color = theme === "light" ? "#000000" : "#ffffff";
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const rates = {
    "Tesouro Selic": 0.13,
    Criptomoedas: 0.25,
    Ações: 0.15,
    "Fundos Imobiliários": 0.12,
  };

  const handleCryptoChange = (index, field, value) => {
    const updated = [...cryptos];
    updated[index][field] = value;
    setCryptos(updated);
  };

  const addCrypto = () => {
    setCryptos([...cryptos, { name: "", amount: "", rate: "" }]);
  };

  const calculateInvestment = () => {
    let results = [];
    let total = 0;

    if (investmentType === "Criptomoedas") {
      let yearResults = [];

      for (let i = 1; i <= Number(years); i++) {
        let totalModerado = 0;
        let totalOtimista = 0;
        let totalPessimista = 0;

        cryptos.forEach((crypto) => {
          let amount = Number(crypto.amount || 0);
          let rate = Number(crypto.rate || 0) / 100;

          amount = (amount + Number(monthlyContribution) * 12) * (1 + rate);
          let otimista = amount * (1 + 0.2);
          let pessimista = amount * (1 - 0.2);

          totalModerado += amount;
          totalOtimista += otimista;
          totalPessimista += pessimista;
        });

        yearResults.push({
          year: i,
          Moderado: Number(totalModerado.toFixed(2)),
          Otimista: Number(totalOtimista.toFixed(2)),
          Pessimista: Number(totalPessimista.toFixed(2)),
        });
      }

      setData(yearResults);
    } else {
      const rate = investmentType === "Tesouro Selic" ? Number(selicRate) / 100 : rates[investmentType];
      total = Number(initialAmount);

      for (let i = 1; i <= Number(years); i++) {
        total = (total + Number(monthlyContribution) * 12) * (1 + rate);
        let optimistic = total * 1.2;
        let pessimistic = total * 0.8;
        results.push({
          year: i,
          Moderado: Number(total.toFixed(2)),
          Otimista: Number(optimistic.toFixed(2)),
          Pessimista: Number(pessimistic.toFixed(2)),
        });
      }

      setData(results);
    }
  };

  const exportToPDF = () => {
    html2canvas(chartRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.text("FinTrack - Simulação de Investimento", 10, 10);
      pdf.addImage(imgData, "PNG", 10, 20, 180, 100);
      pdf.save("simulacao-fintrack.pdf");
    });
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial",
        maxWidth: 600,
        margin: "0 auto",
        backgroundColor: theme === "light" ? "#fff" : "#121212",
        color: theme === "light" ? "#000" : "#fff",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={toggleTheme}
          style={{
            background: theme === "light" ? "#333" : "#ddd",
            color: theme === "light" ? "#fff" : "#000",
            border: "none",
            padding: "5px 10px",
            marginBottom: "10px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          {theme === "light" ? "🌙 Modo Escuro" : "☀️ Modo Claro"}
        </button>
      </div>

      <h2>FinTrack - Calculadora de Investimentos</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)}>
          <option>Tesouro Selic</option>
          <option>Criptomoedas</option>
          <option>Ações</option>
          <option>Fundos Imobiliários</option>
        </select>

        {investmentType === "Criptomoedas" ? (
          <div>
            <strong>Minhas Criptomoedas:</strong>
            {cryptos.map((crypto, index) => (
              <div key={index} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                <input
                  placeholder="Nome"
                  value={crypto.name}
                  onChange={(e) => handleCryptoChange(index, "name", e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="Valor investido"
                  value={crypto.amount}
                  onChange={(e) => handleCryptoChange(index, "amount", e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="% Valorização anual"
                  value={crypto.rate}
                  onChange={(e) => handleCryptoChange(index, "rate", e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
            <button onClick={addCrypto} style={{ marginBottom: 10 }}>+ Adicionar Criptomoeda</button>
          </div>
        ) : (
          <>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              placeholder="Investimento Inicial"
            />
            {investmentType === "Tesouro Selic" && (
              <input
                type="number"
                value={selicRate}
                onChange={(e) => setSelicRate(e.target.value)}
                placeholder="% Anual (ex: 13 para 13%)"
              />
            )}
          </>
        )}

        <input
          type="number"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(e.target.value)}
          placeholder="Aporte Mensal"
        />
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(e.target.value)}
          placeholder="Anos"
        />
        <button onClick={calculateInvestment}>Calcular</button>
        {data.length > 0 && (
          <button onClick={exportToPDF} style={{ background: "green", color: "#fff", padding: 10, border: "none" }}>
            Baixar como PDF
          </button>
        )}
      </div>

      {data.length > 0 && (
        <div ref={chartRef} style={{ marginTop: 30, background: "#f5f5f5", padding: 10 }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Moderado" stroke="#8884d8" />
              <Line type="monotone" dataKey="Otimista" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Pessimista" stroke="#ff6666" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
