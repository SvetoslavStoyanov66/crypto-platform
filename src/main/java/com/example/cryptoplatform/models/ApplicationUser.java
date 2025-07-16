package com.example.cryptoplatform.models;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.userdetails.UserDetails;


@ToString
public class ApplicationUser implements UserDetails{

    @Getter
    private Integer userId;

    @Setter
    private String username;

    @Setter
    @JsonIgnore
    private String password;

    @Setter
    private Set<Role> authorities;

    @Getter
    @Setter
    private Wallet wallet;

    @Getter
    @Setter
    private List<Transaction> transactionHistory;

    public ApplicationUser() {
        super();
        authorities = new HashSet<>();
    }


    public ApplicationUser(String username, String password, Set<Role> authorities, Wallet wallet, List<Transaction> transactionHistory) {
        super();
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.wallet = wallet;
        this.transactionHistory = transactionHistory;
    }

    public void setId(Integer userId) {
        this.userId = userId;
    }

    @Override
    public Collection<Role> getAuthorities() {
        return this.authorities;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}