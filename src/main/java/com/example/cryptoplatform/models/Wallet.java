package com.example.cryptoplatform.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.HashMap;

@Data
@AllArgsConstructor
public class Wallet {
    private Integer walletId;

    private BigDecimal usdBalance;

    private HashMap<String, BigDecimal> crypto;

    public Wallet() {
        usdBalance = BigDecimal.valueOf(10000);
        crypto = new HashMap<>();
    }
}
