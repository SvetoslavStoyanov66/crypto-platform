package com.example.cryptoplatform.controlers;

import com.example.cryptoplatform.models.CryptoPrice;
import com.example.cryptoplatform.services.CryptoPriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.Collection;

@RestController
@RequestMapping("/api/crypto")
public class CryptoController {

    @Autowired
    private CryptoPriceService priceStore;

    @GetMapping("/prices")
    public ResponseEntity<Collection<CryptoPrice>> getAllPrices() {
        return ResponseEntity.ok(priceStore.getAllPrices());
    }

    @GetMapping("/prices/{symbol}")
    public ResponseEntity<CryptoPrice> getPrice(@PathVariable String symbol) {
        return priceStore.getPrice(symbol)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/prices/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<Collection<CryptoPrice>>> streamAllPrices() {
        return Flux.interval(Duration.ofSeconds(1))
                .map(seq -> ServerSentEvent.builder(priceStore.getAllPrices()).build());
    }

    @GetMapping(value = "/prices/{symbol}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<CryptoPrice>> streamSinglePrice(@PathVariable String symbol) {
        return Flux.interval(Duration.ofSeconds(1))
                .map(seq -> priceStore.getPrice(symbol)
                        .map(price -> ServerSentEvent.builder(price).build())
                        .orElse(ServerSentEvent.<CryptoPrice>builder().event("not-found").build()));
    }
}
