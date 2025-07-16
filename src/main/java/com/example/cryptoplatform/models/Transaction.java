package com.example.cryptoplatform.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Transaction {
    private Integer transactionId;

    private Instant timestamp;

    private TransactionType type;

    private String asset;

    private BigDecimal amount;
}
