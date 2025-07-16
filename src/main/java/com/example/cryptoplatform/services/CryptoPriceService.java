package com.example.cryptoplatform.services;

import com.example.cryptoplatform.models.CryptoPrice;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CryptoPriceService {

    private final Map<String, CryptoPrice> prices = new ConcurrentHashMap<>();

    public void updatePrice(String symbol, CryptoPrice price) {
        prices.put(symbol, price);
    }

    public Collection<CryptoPrice> getAllPrices() {
        return prices.values();
    }

    public Optional<CryptoPrice> getPrice(String symbol) {
        return Optional.ofNullable(prices.get(symbol + "/USD"));
    }
}
