package com.inventory.repository;

import com.inventory.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    void deleteByProductId(Long productId);
}