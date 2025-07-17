package com.example.cryptoplatform.exceptions;

public class NotEnoughBalanceException extends RuntimeException {
    public NotEnoughBalanceException() {
        super("Not enough balance to complete the order");
    }
}
