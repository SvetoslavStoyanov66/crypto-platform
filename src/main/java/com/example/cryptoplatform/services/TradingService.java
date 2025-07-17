package com.example.cryptoplatform.services;

import com.example.cryptoplatform.config.AuthContextManager;
import com.example.cryptoplatform.models.ApplicationUser;
import com.example.cryptoplatform.models.Transaction;
import com.example.cryptoplatform.models.TransactionType;
import com.example.cryptoplatform.models.Wallet;
import com.example.cryptoplatform.repository.TransactionRepository;
import com.example.cryptoplatform.repository.UserRepository;
import com.example.cryptoplatform.repository.WalletRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@AllArgsConstructor
public class TradingService {

    private final AuthContextManager authContextManager;

    private final CryptoPriceService cryptoPriceService;

    private final WalletRepository walletRepository;

   private final TransactionRepository transactionRepository;

   private final UserRepository userRepository;

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

        }

    }
}
