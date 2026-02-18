import { useState, useEffect } from 'react';

export function useCryptoPrice(amountUSD = 5.00) {
  const [cryptoAmount, setCryptoAmount] = useState(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Holt den MATIC (Polygon) Preis in Euro
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=eur');
        const data = await response.json();
        const pricePerMatic = data['matic-network'].eur;
        
        // Berechnet, wie viel MATIC 19,99 € entsprechen
        setCryptoAmount(euroAmount / pricePerMatic);
      } catch (error) {
        console.error("Fehler beim Abrufen des Kurses", error);
      }
    };

    fetchPrice();
    // Intervall: Alle 60 Sekunden aktualisieren
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [euroAmount]);

  return cryptoAmount;
}