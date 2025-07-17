package com.example.cryptoplatform.controlers;

import com.example.cryptoplatform.models.Wallet;
import com.example.cryptoplatform.services.WalletService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
@AllArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public Wallet getWallet() {
        return walletService.getWallet();
    }
}
