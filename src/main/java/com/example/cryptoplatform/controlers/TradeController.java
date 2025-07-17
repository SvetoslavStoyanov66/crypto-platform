package com.example.cryptoplatform.controlers;

import com.example.cryptoplatform.models.BuyRequest;
import com.example.cryptoplatform.services.TradingService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigInteger;

@RestController
@RequestMapping("/api/trade")
@AllArgsConstructor
public class TradeController {

    TradingService tradingService;

    @PostMapping("/buy")
    public void buy(@RequestBody BuyRequest request) {
        tradingService.buyCrypto(request.getCryptoName(), request.getAmount());
    }
}
