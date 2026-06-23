let chartWidget;
let chartMode = "candles";
let chartInterval = "1D";
const rangeMap = {
  all: 'ALL',
  '10Y': '10Y',
  '5Y': '5Y',
  '1Y': '1Y',
  '6M': '6M',
  '3M': '3M',
  '1M': '1M',
  '1D': '1D'
};

const companyMap = {
  AAPL: "AAPL · Apple Inc.",
  MSFT: "MSFT · Microsoft Corp.",
  NVDA: "NVDA · NVIDIA Corp."
};

function formatRangeDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function updateRangeLabel() {
  const end = new Date();
  const start = new Date(end);

  if (chartInterval === 'all') {
    document.getElementById('chartRangeLabel').textContent = 'All';
    return;
  }

  if (chartInterval === '1D') {
    document.getElementById('chartRangeLabel').textContent = 'Today';
    return;
  }

  if (chartInterval === '1M') {
    start.setMonth(end.getMonth() - 1);
  } else if (chartInterval === '3M') {
    start.setMonth(end.getMonth() - 3);
  } else if (chartInterval === '6M') {
    start.setMonth(end.getMonth() - 6);
  } else if (chartInterval === '1Y') {
    start.setFullYear(end.getFullYear() - 1);
  } else if (chartInterval === '5Y') {
    start.setFullYear(end.getFullYear() - 5);
  } else if (chartInterval === '10Y') {
    start.setFullYear(end.getFullYear() - 10);
  }

  document.getElementById('chartRangeLabel').textContent = `From ${formatRangeDate(start)} to ${formatRangeDate(end)}`;
}

function createChart(mode, symbol = "AAPL", interval = chartInterval) {
  if (chartWidget) {
    chartWidget.remove();
  }

  const widgetRange = rangeMap[interval] || '1D';

  chartWidget = new TradingView.widget({
    width: "100%",
    height: 520,
    symbol: symbol,
    interval: "D",
    range: widgetRange,
    timezone: "Etc/UTC",
    theme: "dark",
    style: mode === "candles" ? "1" : "3",
    locale: "en",
    toolbar_bg: "#0b0f14",
    enable_publishing: false,
    allow_symbol_change: false,
    hide_top_toolbar: true,
    hide_legend: true,
    hide_side_toolbar: true,
    hide_volume: true,
    details: false,
    withdateranges: false,
    save_image: false,
    studies: [],
    lineColor: "#00ee77",
    studColors: ["#00ee77"],
    colorTheme: "dark",
    custom_themes: {
      light: {
        color1: ["#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77"],
        "white": "#ffffff",
        "black": "#060606"
      },
      dark: {
        color1: ["#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77", "#00ee77"],
        "white": "#ffffff",
        "black": "#060606"
      }
    },
    custom_css_url: "tv-custom.css",
    container_id: "tradingview_chart",
  });
}

const toggleBtn = document.getElementById('chart-toggle-btn');

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const currentView = toggleBtn.dataset.view;
    const nextView = currentView === 'candles' ? 'line' : 'candles';
    toggleBtn.dataset.view = nextView;
    chartMode = nextView;
    const selectedSymbol = document.getElementById('companySelector')?.value;
    toggleBtn.classList.toggle('active');
    if (typeof createChart === 'function') {
      createChart(chartMode, selectedSymbol, chartInterval);
    }
  });
}

document.querySelectorAll('.chart-zoom').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chart-zoom').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    chartInterval = btn.dataset.interval;
    updateRangeLabel();
    const selectedSymbol = document.getElementById('companySelector').value;
    createChart(chartMode, selectedSymbol, chartInterval);
  });
});

document.getElementById('companySelector').addEventListener('change', (e) => {
  const selectedSymbol = e.target.value;
  createChart(chartMode, selectedSymbol, chartInterval);
});

updateRangeLabel();
createChart(chartMode);