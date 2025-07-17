package com.example.cryptoplatform.models;

import lombok.Data;

@Data
public class BuyRequest {
    private String cryptoName;
    private long amount;
}
