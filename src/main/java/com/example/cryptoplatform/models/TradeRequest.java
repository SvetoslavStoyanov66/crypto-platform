package com.example.cryptoplatform.models;

import lombok.Data;

@Data
public class TradeRequest {
    private String cryptoName;
    private long amount;
}
