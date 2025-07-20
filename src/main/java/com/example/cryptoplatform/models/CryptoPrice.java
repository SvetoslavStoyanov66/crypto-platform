package com.example.cryptoplatform.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CryptoPrice {
    private String symbol;
    private double lastPrice;
    private double change;
    private double volume;
}

