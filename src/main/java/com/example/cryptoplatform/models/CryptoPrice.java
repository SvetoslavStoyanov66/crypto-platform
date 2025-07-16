package com.example.cryptoplatform.models;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CryptoPrice {
    private String symbol;
    private double lastPrice;
    private double ask;
    private double bid;
}

