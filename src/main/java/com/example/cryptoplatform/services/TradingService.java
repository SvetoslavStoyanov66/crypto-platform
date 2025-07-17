package com.example.cryptoplatform.services;

import com.example.cryptoplatform.config.AuthContextManager;
import com.example.cryptoplatform.exceptions.NotEnoughBalanceException;
import com.example.cryptoplatform.models.ApplicationUser;
import com.example.cryptoplatform.models.Transaction;
import com.example.cryptoplatform.models.TransactionType;
import com.example.cryptoplatform.models.Wallet;
import com.example.cryptoplatform.repository.TransactionRepository;
import com.example.cryptoplatform.repository.WalletRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;

@Service
@AllArgsConstructor
public class TradingService {

    private final AuthContextManager authContextManager;

    private final CryptoPriceService cryptoPriceService;

    private final WalletRepository walletRepository;

    private final TransactionRepository transactionRepository;

    public void buyCrypto(String cryptoName, long amountToBuy) {
        ApplicationUser user = authContextManager.getLoggedInUser();

        Wallet userWallet = user.getWallet();

        BigDecimal cryptoValueInUSD = BigDecimal.valueOf(cryptoPriceService.getPrice(cryptoName).get().getLastPrice() * amountToBuy);

        if (cryptoValueInUSD.compareTo(userWallet.getUsdBalance()) <= 0) {
            userWallet.setUsdBalance(userWallet.getUsdBalance().subtract(cryptoValueInUSD));
            userWallet.getCrypto().compute(cryptoName, (key, existingAmount) -> {
                        if (existingAmount == null) {
                            return BigDecimal.valueOf(amountToBuy);
                        } else {
                            return existingAmount.add(BigDecimal.valueOf(amountToBuy));
                        }
                    });
            walletRepository.save(userWallet, user.getUserId());
            Transaction transaction = new Transaction(-1, Instant.now(), TransactionType.BUY,cryptoName,BigDecimal.valueOf(amountToBuy));
            transactionRepository.insert(transaction, user.getUserId());
        } else {
           throw new NotEnoughBalanceException();
        }
    }

    public void sellCrypto(String cryptoName, long amountToSell) {

        ApplicationUser user = authContextManager.getLoggedInUser();

        Wallet userWallet = user.getWallet();


        if (userWallet.getCrypto().get(cryptoName) != null && userWallet.getCrypto().get(cryptoName).compareTo(BigDecimal.valueOf(amountToSell)) >= 0) {
            BigDecimal cryptoValueInUSD = BigDecimal.valueOf(cryptoPriceService.getPrice(cryptoName).get().getLastPrice() * amountToSell);

            userWallet.setUsdBalance(userWallet.getUsdBalance().add(cryptoValueInUSD));
            userWallet.getCrypto().compute(cryptoName, (key, amount) -> {
                BigDecimal newAmount = amount.subtract(BigDecimal.valueOf(amountToSell));
                return newAmount.compareTo(BigDecimal.ZERO) > 0 ? newAmount : null;
            });
            walletRepository.save(userWallet, user.getUserId());
            Transaction transaction = new Transaction(-1, Instant.now(), TransactionType.SELL,cryptoName,BigDecimal.valueOf(amountToSell));
            transactionRepository.insert(transaction, user.getUserId());
        } else {
            throw new NotEnoughBalanceException();
        }
    }
}
