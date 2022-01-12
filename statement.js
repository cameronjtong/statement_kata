export function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice, plays));
}
function createStatementData(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  return statementData;

  function enrichPerformance(aPerformance) {
    const result = { ...aPerformance };
    result.play = playFor(result);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);
    return result;
  }
  function totalVolumeCredits(data) {
    return data.performances.reduce(
      (acc, performance) => acc + performance.volumeCredits,
      0
    );
  }
  function totalAmount(data) {
    return data.performances.reduce(
      (acc, performance) => acc + performance.amount,
      0
    );
  }
  function playFor(perf) {
    return plays[perf.playID];
  }
  function amountFor(aPerformance) {
    let result = 0;
    switch (aPerformance.play.type) {
      case "tragedy":
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy":
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`unknown type: ${aPerformance.play.type}`);
    }
    return result;
  }
  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);

    if (aPerformance.play.type === "comedy")
      result += Math.floor(aPerformance.audience / 5);
    return result;
  }
}
function renderPlainText(data) {
  let result = `Statement for ${data.customer}\n`;

  for (const aPerformance of data.performances) {
    result += ` ${aPerformance.play.name}: ${usd(aPerformance.amount)} (${
      aPerformance.audience
    } seats)\n`;
  }
  result += `Amount owed is ${usd(data.totalAmount)}\n`;
  result += `You earned ${data.totalVolumeCredits} credits\n`;
  return result;

  function usd(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount / 100);
  }
}
